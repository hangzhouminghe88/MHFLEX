import rpc from 'src/utils/rpc'
import Vue from 'vue'
import _ from 'lodash'
import path from 'path'
// import {getAvailablePsTypes} from 'src/utils/filters/clusterMapPrimaryStorage.js'
import {getCall, getEvent, getEventByPage} from './message'
import Name2Api from 'src/Constants/Name2Api.json'
import GBK from 'gbk.js'
import handlerForLongjob from './longjob/handlers'
import longJobStrategies from './longjob/strategies'

/* global localStorage:false */

/**
 * Load all files that conform to a regular expression
 * @param  {Object} requireContext require.context
 *
 * Referenc: http://webpack.github.io/docs/context.html
 */
export function requireAll (requireContext) {
  return requireContext.keys().map(requireContext)
}

export function getConditionForOwner (ownerName, resourceType) {
  let tasks = [];
  let accountUuids = [];
  const param = { q: `name~=%25${encodeURIComponent(ownerName)}%25` };
  let IAM1Related = rpc.query('accounts', param).then(resp => {
    accountUuids = accountUuids.concat(resp.inventories.map(v => v.uuid))
  });
  tasks.push(IAM1Related);
  let IAM2Related = rpc.query('iam2/projects', param).then(resp => {
    accountUuids = accountUuids.concat(resp.inventories.map(v => v.linkedAccountUuid))
  });
  tasks.push(IAM2Related);
  return Promise.all(tasks).then(() => {
    return rpc.query('accounts/resources/refs', {
      q: [`accountUuid?=${accountUuids}`, `resourceType=${resourceType}`]
    })
  }).then(resp => {
    let uuidList = [];
    if (resp.inventories.length > 0) uuidList = _.uniq(resp.inventories.map(v => v.resourceUuid));
    return Promise.resolve(`uuid?=${uuidList}`)
  })
}

export function updateDbTableWithZql (results, self) {
  let tasks = [];
  let p = null;
  results.forEach(result => {
    if (result.name) {
      p = self.updateDbTable({
        tableName: result.name,
        list: result.inventories
      });
      tasks.push(p)
    }
  });
  return Promise.all(tasks)
}

export function translateConditions (conditions) {
  let inReg = /^(\w+(?:\.\w+)*)\?=(.*)$/g;
  inReg.handler = (str) => {
    // str = "uuid?=123456789,456789"
    str = str.replace(inReg, `$1 in ($2)`);
    // str = "uuid in (123456789,456789)"
    str = str.replace(/(\w+)(?=[,)])/g, it => `'${it}'`);
    // str = "uuid in ('123456789','456789')"
    return str
  };
  let isOrNotNullReg = /^(\w+(?:\.\w+)*)\s+(is|not)\s+(null)$/g;
  isOrNotNullReg.handler = (str) => {
    // str = "uuid is null"
    str = str.replace(isOrNotNullReg, `$1 $2 $3`);
    // str = "uuid is null"
    return str
  };
  let notInReg = /^(\w+(?:\.\w+)*)!\?=(.*)$/g;
  notInReg.handler = (str) => {
    // str = "uuid!?=123456789,456789"
    str = str.replace(notInReg, `$1 not in ($2)`);
    // str = "uuid not in (123456789,456789)"
    str = str.replace(/(\w+)(?=[,)])/g, it => `'${it}'`);
    // str = "uuid not in ('123456789','456789')"
    return str
  };
  let likeReg = /^(\w+(?:\.\w+)*)~=(.*)$/g;
  likeReg.handler = (str) => {
    // str = "name~=%aa%"
    str = str.replace(likeReg, `$1 like '$2'`);
    // str = "name like '%aa%'"
    return str
  };
  let normalReg = /^(\w+(?:\.\w+)*)(!?=)(.*)$/g;
  normalReg.handler = (str) => {
    // str = "name!=aa"
    str = str.replace(normalReg, `$1$2'$3'`);
    // str = "name!='aa'"
    return str
  };
  let regs = [isOrNotNullReg, notInReg, inReg, likeReg, normalReg];
  conditions = _.isArray(conditions) ? conditions : [conditions];
  conditions.forEach((cond, i) => {
    for (let k = 0; k < regs.length; k++) {
      if (regs[k].test(cond)) {
        conditions[i] = regs[k].handler(conditions[i]);
        break
      }
    }
  });
  return conditions.join(' and ')
}

// e.g name = 'VM.CREATE'
export function getApiPermission (name, ctx = this) {
  if (!ctx.dbData.policy) {
    return true
  }
  let api = Name2Api[name];
  if (api === undefined) {
    return true
  }
  if (_.keys(ctx.dbData.policy).length === 0) {
    return true
  }
  let policy = ctx.dbData.policy;
  if (policy[api] === undefined) {
    return true
  }
  let permission = policy[api].allow;
  return permission
}

export function getLicenseCapability (name, ctx = this) {
  if (!ctx.dbData.common.license) return false;
  if (ctx.dbData.common.license && ctx.dbData.common.license.licenseType === 'Trial') return true;
  let currLicense = ctx.dbData.common.license.licenseType;
  const type2Constant = {
    'Community': 'LICENSE_BASIC_COMMUNITY',
    'Paid': 'LICENSE_BASIC_PAID',
    'Hybrid': 'LICENSE_BASIC_HYBRID'
  };
  let licenseConstant = type2Constant[currLicense];
  const capabilities = {
    'LICENSE_BASIC_COMMUNITY': ['LICENSE_BASIC_COMMUNITY'],
    'LICENSE_BASIC_PAID': ['LICENSE_BASIC_PAID', 'LICENSE_BASIC_COMMUNITY'],
    'LICENSE_BASIC_HYBRID': ['LICENSE_BASIC_COMMUNITY', 'LICENSE_BASIC_PAID', 'LICENSE_BASIC_HYBRID']
  };
  if ((currLicense !== 'Hybrid' && currLicense !== 'HybridTrialExt') && name === 'LICENSE_BASIC_HYBRID') return false;
  if (!licenseConstant || !capabilities[licenseConstant]) return true;
  let capability = capabilities[licenseConstant].some(item => item === name);
  return capability
}

// e.g name = 'LICENSE_EXTRA_COMPANY'
export function getLicensePermission (name, ctx = this) {
  if (ctx.dbData.common.license && ctx.dbData.common.license.licenseType === 'Trial') return true;
  if (!ctx.dbData.common.addonLicenses) return false;
  if (ctx.dbData.common.isOpensource) return false;

  let modules = ctx.dbData.common.addonLicenses;
  let moduleLicenses = modules.map(item => module2license(item.modules[0]));
  if (moduleLicenses.every(item => item !== name)) {
    return false
  }
  return true;

  function module2license (_module) {
    let obj = {
      //'project-management': 'LICENSE_EXTRA_COMPANY',
      'disaster-recovery': 'LICENSE_EXTRA_BACKUP',
      'baremetal': 'LICENSE_EXTRA_BAREMETAL',
      'v2v': 'LICENSE_EXTRA_V2V'
    };
    return obj[_module]
  }
}

export function longJobHandler (event, self, longJobInventory, resourceUuid) {
  const { action } = event;
  async function updateLongJobInventory (eventToBeUpdated, longJobInventory) {
    if (!eventToBeUpdated.apiList || eventToBeUpdated.apiList.length !== 1) return;
    let apiId = eventToBeUpdated.apiList[0];
    let api = JSON.parse(self.browserLocalStorageGetItem(apiId));
    if (!api || !api.resp) return;
    let apiResp = JSON.parse(api.resp);
    if (longJobInventory.state === 'Failed') {
      apiResp.success = false
    }
    if (event.action.indexOf('host.action.addByFile') > -1 || event.action.indexOf('baremetal.action.createChassis') > -1) {
      let result = longJobInventory.jobResult;
      try {
        result = JSON.parse(result);
        let failNum = 0;
        result.forEach((item) => {
          if (!item.success) failNum++
        });
        if (failNum > 0) {
          apiResp.failCount = failNum;
          eventToBeUpdated.failCount = failNum;
          apiResp.success = result.length > failNum
        }
        apiResp.successCount = result.length - failNum;
        eventToBeUpdated.successCount = result.length - failNum;
        api.successCount = apiResp.successCount;
        api.count = apiResp.count;
        api.failCount = apiResp.failCount;
        apiResp.count = result.length;
        eventToBeUpdated.count = result.length;
        browserLocalStorageSetItem(event.id, JSON.stringify(eventToBeUpdated))
      } catch (e) {

      }
    }
    if (_.has(handlerForLongjob, action)) handlerForLongjob[action](event, longJobInventory, self);
    apiResp.inventory = longJobInventory;
    api.resp = JSON.stringify(apiResp);
    self.browserLocalStorageSetItem(apiId, JSON.stringify(api))
  }
  return self.deleteDbRow({
    tableName: 'messageProgress',
    id: event.id
  }).then(() => {
    if (longJobInventory) updateLongJobInventory(event, longJobInventory);
    return self.updateResourceOfLongJob(event, self)
  })
}

export async function updateResourceOfLongJob (event, self) {
  let resourceInfos = event.resourceInfos;
  if (resourceInfos.tableName === 'vm') {
    self.dispatchAction('vm/pureQuery', {q: `uuid=${resourceInfos.resourceUuid}`});
    return
  } else if (resourceInfos.tableName === 'volume') {
    self.dispatchAction('volume/query', resourceInfos.resourceUuid);
    return
  }
  let resourceToQueryPath = {
    'vm': 'vm-instances',
    // 'volume': 'volumes',
    'image': 'images'
  };
  if (!_.includes(_.keys(resourceToQueryPath), resourceInfos.tableName)) return;
  return rpc.query(resourceToQueryPath[resourceInfos.tableName], {q: `uuid=${resourceInfos.resourceUuid}`}).then(resp => {
    return self.updateDbRow({
      tableName: resourceInfos.tableName,
      id: resourceInfos.resourceUuid,
      data: resp.inventories[0]
    }).then(() => {
      self.$forceUpdate()
    })
  })
}

export function isInLongJob (resourceUuid) {
  let identityUuid = this.getIdentityUuid();
  let longJobListName = `longJobList-${identityUuid}`;
  let longJobList = JSON.parse(this.browserLocalStorageGetItem(longJobListName));
  if (!longJobList) longJobList = [];
  let resourceInLongJobList = longJobList.map(longJob => longJob.resourceUuid);
  return _.includes(resourceInLongJobList, resourceUuid)
}

// function eventFinishForLongJobAddHost (event) {
//   if (event.successCount === event.count) this._eventFinished(event)
//   else if (event.failCount === event.count) this._eventFinished(event)
//   else this._eventFinished(event)
// }

export async function genActionProgresses () {
  const self = this;
  // if (eventList === undefined || eventList.length === 0) return

  let identityUuid = self.getIdentityUuid();
  let longJobListName = `longJobList-${identityUuid}`;
  let longJobList = JSON.parse(self.browserLocalStorageGetItem(longJobListName));
  if (!longJobList) longJobList = [];

  // eventList = eventList.filter(event => _.includes(longJobList, event.id))
  let eventList = [];
  longJobList.forEach(longJob => {
    let event = JSON.parse(this.browserLocalStorageGetItem(longJob.id));
    if (event) {
      if (event.projectUuid) {
        if (this.dbData.common.currProject && this.dbData.common.currProject.uuid === event.projectUuid) eventList.push(event)
      } else {
        eventList.push(event)
      }
    }
  });
  if (eventList.length === 0) {
    self.stopLongJobTask();
    return
  }
  let longJobListForToast = longJobList.filter(longJob => longJob.hasToast).map(longJob => longJob.id);
  longJobListForToast.forEach(longJobId => {
    if (!self.$store.state.toastManager.toasts[longJobId]) {
      eventList.forEach(event => {
        if (event.id === longJobId) {
          self.createToast(event)
        }
      })
    }
  });
  let tasks = [];
  let p = null;
  let jobUuids = eventList.map(event => event.resourceInfos.jobUuid);
  let longJobResp = await rpc.query(`longjobs`, {q: [`apiId?=${jobUuids}`]});
  if (longJobResp.inventories.length === 0) {
    self.browserLocalStorageSetItem(longJobListName, JSON.stringify([]));
    self.stopLongJobTask();
    return
  }
  longJobResp.inventories.forEach(longJob => {
    let event = _.find(eventList, event => event.resourceInfos.jobUuid === longJob.apiId);
    p = longJobStrategies[longJob.state].call(self, event, longJob);
    tasks.push(p)
  });
  await Promise.all(tasks)
}

export function registerLongJobTask (trigger, canceler) {
  return this.updateDbObject({
    name: 'job',
    data: {
      trigger,
      canceler
    }
  })
}

export function stopLongJobTask () {
  let job = _.cloneDeep(this.dbData.job);
  if (job.canceler) job.canceler();
  return this.updateDbObject({
    name: 'job',
    data: {
      isRunning: false
    }
  })
}

export function triggerLongJobTask () {
  let job = _.cloneDeep(this.dbData.job);
  let isRunning = job.isRunning;
  if (!isRunning) {
    if (job.trigger) job.trigger();
    return this.updateDbObject({
      name: 'job',
      data: {
        isRunning: true
      }
    })
  }
}

export function requireAll2Obj (requireContext) {
  let obj = {};
  requireContext.keys().forEach(key => {
    let k = path.basename(key).slice(0, -4);
    obj[k] = requireContext(key)
  });
  return obj
}

export function getJobUuid (resourceUuid, operationName) {
  let jobUuid;
  let obj = {};
  let resourceTable = JSON.parse(localStorage.getItem('jobUuidTable'))[resourceUuid];
  if (operationName) {
    jobUuid = resourceTable[operationName];
    return [jobUuid]
  } else {
    obj.resourceUuid = resourceUuid;
    obj.jobUuids = _.values(resourceTable);
    return obj
  }
}

export function isInJobUuidTable (uuid) {
  let jobUuidTable = localStorage.getItem('jobUuidTable') && JSON.parse(localStorage.getItem('jobUuidTable'));
  if (!jobUuidTable) {
    jobUuidTable = {}
  }
  return _.includes(Object.keys(jobUuidTable), uuid)
}

export function setJobUuid (resourceUuid, operationName, jobUuid) {
  let jobUuidTable = localStorage.getItem('jobUuidTable') && JSON.parse(localStorage.getItem('jobUuidTable'));
  if (!jobUuidTable) {
    jobUuidTable = {}
  }
  if (!jobUuidTable.hasOwnProperty(resourceUuid)) {
    jobUuidTable[resourceUuid] = {}
  }
  jobUuidTable[resourceUuid][operationName] = jobUuid;
  localStorage.setItem('jobUuidTable', JSON.stringify(jobUuidTable))
}

export function deleteJobUuid (resourceUuid, jobUuid) {
  let jobUuidTable = JSON.parse(localStorage.getItem('jobUuidTable'));
  let resourceTable = jobUuidTable[resourceUuid];
  if (!resourceTable) return;
  for (let operation in resourceTable) {
    if (resourceTable.hasOwnProperty(operation)) {
      if (resourceTable[operation] === jobUuid) {
        delete resourceTable[operation]
      }
    }
  }
  if (Object.keys(resourceTable).length === 0) {
    delete jobUuidTable[resourceUuid]
  }
  localStorage.setItem('jobUuidTable', JSON.stringify(jobUuidTable))
}

export function queryAllProgresses (tableName, states, property, that) {
  let self = this;
  let resourceTables = []
  let tasks = []
  let fn = (resourceUuid, jobUuid) => {
    // the image uploading is kind of serial process
    let isImage = !!self.dbData.image[resourceUuid]
    let p = new Promise((resolve, reject) => { resolve() })
    if (isImage) {
      p = rpc.query('images', {q: `uuid=${resourceUuid}`}).then(resp => {
        if (resp.inventories.length === 0) {
          self.deleteJobUuid(resourceUuid, jobUuid)
        } else {
          if (states.indexOf(resp.inventories[0].status) < 0) {
            self.deleteJobUuid(resourceUuid, jobUuid)
            let image = resp.inventories[0]
            let reg = /^upload:\/\/.*/
            if (reg.test(image.url)) {
              let event = this.createEvent('image.action.upload', image.name, undefined, '', 'NotApiCall')
              this.setEventSuccess(event)
              return self.updateDbRow({
                tableName: 'image',
                id: image.uuid,
                data: image
              })
            }
          }
        }
        return new Promise((resolve, reject) => { resolve() })
      })
    }
    if (self.dbData.common.isAdmin) {
      p = p.then(() => {
        return rpc.query(`task-progresses/${jobUuid}`)
      }).then(resp => {
        // sometime when progress is 100, but image status is still 'Downloading'. So exclude image
        if (resp.inventories.length !== 0) {
          resp.inventories = resp.inventories.filter(taskProgress => taskProgress.type === 'Progress')
        }
        if (!isImage && (resp.inventories.length === 0 || resp.inventories[0].content === '100')) {
          self.deleteJobUuid(resourceUuid, jobUuid)
          let tableNameToResourcePath = {
            'vmProgress': 'vm-instances'
          }
          let tableNameToResourceType = {
            'vmProgress': 'vm'
          }
          let p = Promise.resolve()
          if (tableName === 'volumeProgress') {
            p = self.dispatchAction('volume/query', resourceUuid)
          } else {
            p = rpc.query(tableNameToResourcePath[tableName], {q: `uuid=${resourceUuid}`}).then(resp => {
              return self.updateDbRow({
                tableName: tableNameToResourceType[tableName],
                id: resourceUuid,
                data: resp.inventories[0]
              })
            })
          }
          p.then(() => {
            return self.deleteDbRow({
              tableName,
              id: resourceUuid
            })
          }).then(() => {
            self.$forceUpdate()
          })
        }
        return self.updateDbRow({
          tableName: tableName,
          id: resourceUuid,
          data: resp.inventories[0]
        })
      })
    }
    return p
  }
  let prop = _.isUndefined(property) ? 'state' : property
  let resourceName = tableName.replace(/Progress/, '')
  let resourceUuidList = []
  function isInStates (uuid) {
    let ret = false
    try {
      ret = states.indexOf(self.dbData[resourceName][uuid][prop]) > -1
      if (tableName === 'volumeProgress') {
        ret = states.indexOf(self.$store.state.volume[uuid][prop]) > -1
      }
    } catch (e) {
    }
    return ret
  }
  if (self.windowData.uuidList) {
    resourceUuidList = resourceUuidList.concat(self.windowData.uuidList.filter(uuid => isInStates(uuid) && isInJobUuidTable(uuid)))
  } else if (self.windowData.dataUuid && isInStates(self.windowData.dataUuid)) {
    resourceUuidList.push(self.windowData.dataUuid)
  }
  if (resourceUuidList && resourceUuidList.length === 0) {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    return
  }
  resourceUuidList = _.uniq(resourceUuidList)
  resourceUuidList.forEach(resourceUuid => {
    resourceTables.push(this.getJobUuid(resourceUuid))
  })
  resourceTables.forEach(resourceTable => {
    let resourceUuid = resourceTable.resourceUuid
    let jobUuids = resourceTable.jobUuids
    jobUuids.forEach(uuid => {
      tasks.push(fn(resourceUuid, uuid))
    })
  })
  return Promise.all(tasks).then(() => {
    self.$forceUpdate()
  })
}

export function isImageStoreInZone () {
  let zoneUuid = window.localStorage.getItem('currZoneUuid');
  return rpc.query(`backup-storage`, {
    q: [`zone.uuid=${zoneUuid}`, '__systemTag__!=remote', 'state=Enabled', 'status=Connected', 'type=ImageStoreBackupStorage'],
    count: true
  }).then(resp => {
    let hasImageStore = resp.total !== 0;
    return this.updateDbObject({
      name: 'common',
      data: {
        hasImageStore
      }
    })
  })
}

export function isNotSetUEFI () {
  return rpc.query(`system-tags`, {
    q: [`tag=libvirt::version::1.3.3.2`],
    count: true
  }).then(resp => {
    let isNotSetUEFI = resp.total > 0;
    return this.updateDbObject({
      name: 'common',
      data: {
        isNotSetUEFI
      }
    })
  })
}

export function genUniqueId () {
  // function s4 () {
  //   return Math.floor((1 + Math.random()) * 0x10000)
  //     .toString(16)
  //     .substring(1)
  // }
  // return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
  // return s4() + s4() + 'dca14c9d8a02fbdb108ba4a5'
  const firstCount = 12;
  const secondCount = 3;
  const thirdCount = 15;
  let chars = '0123456789abcdef'.split('');
  let fn = () => {
    return chars[Math.floor(Math.random() * 16)]
  };
  let uuid = '';
  for (let i = 0; i < firstCount; i++) {
    uuid += fn()
  }
  uuid += '12345'.split('')[Math.floor(Math.random() * 5)];
  for (let i = 0; i < secondCount; i++) {
    uuid += fn()
  }
  uuid += '89ab'.split('')[Math.floor(Math.random() * 4)];
  for (let i = 0; i < thirdCount; i++) {
    uuid += fn()
  }
  return uuid
  // [0-9a-f]{12}[1-5][0-9a-f]{3}[89ab][0-9a-f]{15}
}

export function _closeWindow (dialogName, self) {
  Object.keys(self.$store.state.windowManager.windows).forEach((_id) => {
    if (_id.indexOf(dialogName) > -1) {
      let windowData = self.$store.state.windowManager.windows[_id];
      let close = windowData.methods.close;
      if (close && typeof close === 'function') {
        close()
      }
    }
  })
}

export function closeSidePage (listPageName) {
  let pageWindowId;
  Object.keys(this.$store.state.windowManager.windows).forEach((_id) => {
    if (_id.indexOf(listPageName) > -1) {
      pageWindowId = _id
    }
  });
  return this._updateWindow({
    id: pageWindowId,
    currItemUuid: ''
  })
}

export function insertItemFromOtherWindow (pathName, resourceUuid) {
  if (this.$router.history.current.fullPath === pathName) {
    let windowName = pathName.replace('/main/', '');
    let pathToWindow = {
      'hybridecsinstance': 'HybridEcsInstanceListPage',
      'hybridvpcvpnconnection': 'HybridVpcVpnConnectionListPage'
    };
    let windowManager = this.$store.state.windowManager.windows;
    let windowData, windowDataId;
    for (let key in windowManager) {
      if (windowManager.hasOwnProperty(key)) {
        if (key.indexOf(pathToWindow[windowName]) > -1) {
          windowData = _.cloneDeep(windowManager[key]);
          windowDataId = key;
          break
        }
      }
    }
    let availableCount = windowData.availableCount;
    if (!availableCount) availableCount = 0;
    if (availableCount < windowData.pageSize) availableCount = availableCount + 1;
    let uuidList = windowData.uuidList;
    if (!uuidList) uuidList = [];
    uuidList.unshift(resourceUuid);
    // if (uuidList.length > windowData.pageSize) uuidList.pop()
    let table = windowData.table;
    if (!table) table = {};
    table[resourceUuid] = {
      selected: false
    };
    return this._updateWindow({id: windowDataId, uuidList, table, availableCount})
  }
}

// export function shortHashName (prefix) {
//   return prefix + '-' + ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4)
// }

export function isConditionsEqual (conditions, oldConditions) {
  if (!oldConditions || oldConditions.length !== conditions.length) {
    return false
  }
  let isEqual = true;
  for (let i in conditions) {
    let found = false;
    for (let j in oldConditions) {
      if (conditions[i].name === oldConditions[j].name &&
        conditions[i].op === oldConditions[j].op &&
        conditions[i].value === oldConditions[j].value) {
        found = true;
        break
      }
    }
    if (!found) {
      isEqual = false;
      break
    }
  }
  return isEqual
}

export function vmCpuQueryExpression (type, hostUuid, vmUuid) {
  var expressionName = 'collectd:collectd_virt_virt_vcpu';
  var exportedInstanceStr = '{exported_instance="' + vmUuid + '",';
  var typeStr = 'type="' + type + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  if (type === 'total') {
    expressionName = 'collectd:collectd_virt_virt_cpu_total';
    typeStr = ''
  }
  // NOTICE: encode twice for grails encode issue
  return encodeURI(`${expressionName}${exportedInstanceStr}${typeStr}${hostUuidStr}`)
}

export function vmMemoryQueryExpression (type, hostUuid, exportedInstance) {
  var expressionName = 'collectd:collectd_virt_memory';
  var typeStr = '{type="' + type + '",';
  var exportedInstanceStr = 'exported_instance="' + exportedInstance + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(expressionName + typeStr + exportedInstanceStr + hostUuidStr)
}

export function vmDiskQueryExpression (type, diskDirection, diskUsageType, hostUuid, exportedInstance) {
  var expressionName = 'collectd:collectd_virt_' + diskUsageType + '_' + diskDirection;
  var typeStr = '{type="' + type + '",';
  var exportedInstanceStr = 'exported_instance="' + exportedInstance + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(expressionName + typeStr + exportedInstanceStr + hostUuidStr)
}

export function vmNetworkQueryExpression (type, networkDirection, networkUsageType, hostUuid, exportedInstance) {
  var expressionName = 'collectd:collectd_virt_' + networkUsageType + '_' + networkDirection;
  var typeStr = '{type="' + type + '",';
  var exportedInstanceStr = 'exported_instance="' + exportedInstance + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(expressionName + typeStr + exportedInstanceStr + hostUuidStr)
}

export function hostCpuQueryExpression (cpu, type, hostUuid) {
  var expressionName = 'collectd:collectd_cpu_percent';
  var cpuStr = '{cpu="' + cpu + '",';
  var typeStr = 'type="' + type + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(`${expressionName}${cpuStr}${typeStr}${hostUuidStr}`)
}

export function hostMemoryQueryExpression (memory, hostUuid) {
  var expressionName = 'collectd:collectd_memory';
  var memoryStr = '{memory="' + memory + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(expressionName + memoryStr + hostUuidStr)
}

export function hostDiskQueryExpression (disk, diskUsageType, diskDirection, hostUuid) {
  var expressionName = 'collectd:collectd_disk_' + diskUsageType + '_' + diskDirection;
  var diskStr = '{disk="' + disk + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(expressionName + diskStr + hostUuidStr)
}

export function hostNetworkQueryExpression (interfaceNetWork, networkUsageType, networkDirection, hostUuid) {
  var expressionName = 'collectd:collectd_interface_' + networkUsageType + '_' + networkDirection;
  var interfaceNetWorkStr = '{interface="' + interfaceNetWork + '",';
  var hostUuidStr = 'hostUuid="' + hostUuid + '"}';
  return encodeURI(expressionName + interfaceNetWorkStr + hostUuidStr)
}

export function __printCallStack () {
  var stack = new Error().stack;
  console.log('PRINTING CALL STACK');
  console.log(stack)
}

let serverUrl = window.location.origin;
if(process.env.NODE_ENV === "development"){
  serverUrl = 'http://10.10.10.45:5000';
}
export function setServerUrl (url) {
  serverUrl = url
}

export function getServerUrl () {
  return serverUrl
}

export function bytesToSize (bytes, unit, width) {
  bytes = Number(bytes);
  // if (bytes < 1 && bytes > 0)
  if (typeof bytes !== 'number' || isNaN(bytes)) bytes = 0;
  if (bytes < 0) bytes = 0;
  if (typeof width === 'undefined') width = 2;
  if (typeof unit === 'undefined') unit = 'B';
  var num = Math.pow(10, width);
  var sizes = ['K', 'M', 'G', 'T', 'P'];
  if (unit) {
    sizes.unshift('')
  } else {
    sizes.unshift('Byte')
  }
  if (bytes === 0) return '0 ' + sizes[0] + unit;
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  // for 0.xxxx number
  if (i < 0) i = 0;
  if (sizes[i] === 'B') num = 1;
  if (i >= 5) i = 5;
  return Math.round(bytes / Math.pow(1024, i) * num) / num + ' ' + sizes[i] + unit
}

export function toFixed (num, precision) {
  let multiplier = Math.pow(10, precision + 1);
  let wholeNumber = Math.floor(num * multiplier);
  let ret = Math.round(wholeNumber / 10) * 10 / multiplier;
  if (_.isNaN(ret)) return 0;
  return ret
}

export function sizeRoundToString (size) {
  var K = 1024;
  var M = K * K;
  var G = M * K;
  var T = G * K;
  var P = T * K;

  var sizeMap = {
    'K': K,
    'M': M,
    'G': G,
    'T': T,
    'P': P
  };

  var suffixes = ['P', 'T', 'G', 'M', 'K'];
  function round () {
    var s = suffixes.shift();
    if (!size || size < 1024) {
      return size + ' B'
    }

    var q = sizeMap[s];
    var ret = size / q;
    if (ret >= 1) {
      return toFixed(ret, 2) + ' ' + s
    } else {
      return round()
    }
  }

  return round()
}

export function toSizeString (input) {
  try {
    return sizeRoundToString(parseInt(input))
  } catch (e) {
    return input
  }
}

export function toPercentageString (input) {
  var per = Math.ceil(parseFloat(input) * 10000) / 100;
  var perStr = per.toString();
  if (perStr.length > 5) {
    perStr = perStr.slice(0, 5)
  }
  return perStr + '%'
}

export function parseNumber (num, unit) {
  if (parseInt(num) === 0) return 0;
  const K = 1024;
  const M = K * K;
  const G = M * K;
  const T = G * K;
  const P = T * K;

  let result = num;
  let obj = {
    [K]: ['K', 'k', 'KB/s', 'Kbps'],
    [M]: ['M', 'm', 'MB/s', 'Mbps'],
    [G]: ['G', 'g', 'GB/s', 'Gbps'],
    [T]: ['T', 't', 'TB/s', 'Tbps'],
    [P]: ['P', 'p', 'PB/s', 'Pbps']
  };
  Object.keys(obj).forEach(key => {
    let item = obj[key];
    let isTheUnit = item.some(u => u.toLowerCase() === unit.toLowerCase());
    if (isTheUnit) {
      result = parseInt(num * key)
    }
  });
  return result
}

export function parseSize (sizeStr) {
  var K = 1024;
  var M = K * K;
  var G = M * K;
  var T = G * K;
  var P = T * K;
  sizeStr = String(sizeStr).toLowerCase();
  const sizeMap = {
    'k': size => parseInt(size * K),
    'm': size => parseInt(size * M),
    'g': size => parseInt(size * G),
    't': size => parseInt(size * T),
    'p': size => parseInt(size * P)
  };
  let size = parseFloat(sizeStr);
  let unit = _.find(_.keys(sizeMap), key => _.includes(sizeStr, key));
  return _.has(sizeMap, unit) ? sizeMap[unit](size) : parseInt(sizeStr)
}

let justUpdateResource = false;

export function updateResource (resourceType, actionName, propName, tabName, value, fn) {
  if (justUpdateResource) return;
  justUpdateResource = true;
  setTimeout(() => {
    justUpdateResource = false
  }, 100);
  if (propName === 'name' && !String(value).trim()) return;
  let uuid = this.windowData.dataUuid;
  if (this.dbData[tabName][uuid][propName] === value) return;
  let obj = {};
  const self = this;
  obj[actionName] = {};
  obj[actionName][propName] = value;
  let event = propName === 'password' ? self.createEvent(`common.updateInfo${propName}`) : self.createEvent(`common.updateInfo${propName}`, value);
  return new Promise((resolve, reject) => {
    return rpc.update(resourceType, uuid, obj, event)
      .then((resp) => {
        if (fn) fn(uuid);
        self.incEventSuccess(event);
        return this.updateDbRow({
          tableName: tabName,
          id: uuid,
          data: resp.inventory
        })
        return  Promise.resolve(resp)
      }).catch(() => {
          self.incEventFail(event)
        return  Promise.reject();
      })
  })
}

export function updateAliyunResouce (resourceUuidList, actionPath, actionName, type, value, tabName, additionalTypeAndValue) {
  if (justUpdateResource) return;
  justUpdateResource = true;
  setTimeout(() => {
    justUpdateResource = false
  }, 100);
  if ((type === 'name' || type === 'description') && !String(value).trim()) return;
  if ((type === 'name' || type === 'description') && (String(value).length < 2)) return;
  if (this.dbData[tabName][this.windowData.dataUuid][type] === value) return;
  const self = this;
  let event = self.createEvent('common.updateInfo' + type, value);
  let msg = {};
  msg[actionName] = {};
  msg[actionName][type] = value;
  if (additionalTypeAndValue) {
    msg[actionName] = Object.assign(msg[actionName], additionalTypeAndValue)
  }
  let tasks = [];
  let p = null;
  resourceUuidList.forEach(function (resourceUuid) {
    ((resourceUuid) => {
      p = rpc.update(`${actionPath}`, `${resourceUuid}`, msg, event)
        .then((resp) => {
          self.incEventSuccess(event);
          self.updateDbRow({
            tableName: tabName,
            id: resourceUuid,
            data: resp.inventory
          })
        }, () => {
          self.incEventFail(event)
        });
      tasks.push(p)
    })(resourceUuid)
  });
  return Promise.all(tasks)
}

export function isNumber (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

export async function getAction (eventId) {
  let event = null;
  let isLongJob;
  if (this.isLongJobEvent(eventId)) {
    event = JSON.parse(this.browserLocalStorageGetItem(eventId));
    isLongJob = true
  } else {
    event = JSON.parse(this.getEventDataFromWindow(eventId));
    isLongJob = false
  }
  if (event) {
    let _apiList = event.apiList;
    event.apiList = [];
    _apiList.forEach(apiId => {
      let apiCall;
      if (isLongJob) {
        apiCall = JSON.parse(this.browserLocalStorageGetItem(apiId))
      } else {
        apiCall = JSON.parse(this.getEventDataFromWindow(apiId))
      }
      if (apiCall) event.apiList.push(apiCall)
    })
  } else {
    event = await getEvent(eventId);
    if (event) {
      Object.assign(event, JSON.parse(event.data));
      let _apiList = event.apiList;
      event.apiList = [];
      let getApi = async function (apiId, apiList) {
        let api = await getCall(apiId);
        if (api) apiList.push(api)
      };
      let p;
      let tasks = [];
      _apiList.forEach(apiId => {
        p = getApi(apiId, event.apiList);
        tasks.push(p)
      });
      await Promise.all(tasks)
    }
  }
  // event.type = 'Action'
  return event
}

export function getIdentityUuid () {
  let identityUuid;
  if (localStorage.getItem('loginType') === 'account') {
    identityUuid = localStorage.getItem('accountUuid')
  } else if (localStorage.getItem('loginType') === 'user') {
    identityUuid = localStorage.getItem('userUuid')
  } else {
    identityUuid = localStorage.getItem('uid')
  }
  return identityUuid
}

export async function getActionList () {
  let identityUuid = this.getIdentityUuid();
  let condition = {
    operators: identityUuid
  };
  if (this.dbData.common.currProject) condition.projectUuid = this.dbData.common.currProject.uuid;
  let eventListResp = await getEventByPage(condition);
  eventListResp.pageDatas.forEach((item) => {
    Object.assign(item, JSON.parse(item.data))
  });
  let eventList = eventListResp.pageDatas;
  // let longJobListName = `longJobList-${identityUuid}`
  // let longJobIdList = JSON.parse(this.browserLocalStorageGetItem(longJobListName))
  // let longJobList = []
  // eventList.forEach(event => {
  //   if (_.has(event, 'resourceInfos')) {
  //     longJobList.push(event)
  //   }
  // })
  // let frontedLongJob = _.remove(eventList, event => { return _.includes(longJobIdList, event.id) })
  // eventList = frontedLongJob.concat(eventList)
  return eventList
}

export function formatDatetime (d) {
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2)
}

export function formatTime (d) {
  let S = 1000;
  let M = S * 60;
  let H = M * 60;
  let suffixes = [H, M, S];
  let unitList = [this.$t('time.hour'), this.$t('time.minute'), this.$t('time.second')];
  let str = '';
  suffixes.forEach((item, index) => {
    let p = parseInt(d / item);
    if (p > 0) str += `${p}${unitList[index]} `;
    d -= p * item
  });
  return str
}

//转换状态
export function formatState(val) {
  switch (val)
  {
    case 'Enabled':
      return '启用';
    case 'Disabled':
      return '禁用';
    case 'Maintenance':
      return '维护模式';
  }

  return "";
}

export function shortSshKey (sshKey) {
  if (!sshKey || sshKey.length < 20) return sshKey;
  return sshKey.slice(0, 10) + ' ... ' + sshKey.slice(sshKey.length - 10, sshKey.length)
}

export function formatCurrency (num) {
  return `${this.$t('currency.unit')} ${Vue.config.lang !== 'zh-en' ? this.toFixed(num, 3) : this.toFixed(num / 6.88, 3)}`
}

export function formatNotification (str, value) {
  let strList = str.split('%s');
  let outputStr = strList[0];
  for (let i = 0; i < strList.length - 1; i++) {
    outputStr = outputStr + JSON.stringify(value[i]) + strList[i + 1]
  }
  return outputStr
}

export function normalizeLicenceType (nativeType) {
  if (nativeType === 'OEM' ||
    nativeType === 'Paid' ||
    nativeType === 'Prepaid') {
    return 'prepaid'
  } else if (nativeType === 'Community' ||
    nativeType === 'OpenSource') {
    return 'community'
  } else if (nativeType === 'Trial') {
    return 'trial'
  } else if (nativeType === 'TrialExt') {
    return 'trialext'
  } else if (nativeType === 'HybridTrialExt') {
    return 'HybridTrialExt'
  }
}

export function s2ab (s) {
  if (typeof ArrayBuffer !== 'undefined') {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf
  } else {
    let buf = new Array(s.length);
    for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
    return buf
  }
}

export function downloadFile (name, contents, mimeType) {
  let byteArray = new Uint8Array(GBK.encode(contents));
  mimeType = mimeType || 'text/plain';
  var blob = new window.Blob([byteArray], {
    type: mimeType
  });
  //IE浏览器可以用window.navigator.msSaveOrOpenBlob来判断是否支持createObjectURL对象
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, name);
  }
  //其他
  var dlink = document.createElement('a');
  dlink.setAttribute('type', 'hidden');
  dlink.download = name;
  dlink.href = window.URL.createObjectURL(blob);
  document.body.appendChild(dlink);
  dlink.onclick = function (e) {
    // revokeObjectURL needs a delay to work properly
    var that = this;
    setTimeout(function () {
      window.URL.revokeObjectURL(that.href)
    }, 1500)
  };

  dlink.click();
  dlink.remove()
}

function b64toBlob (b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  let byteCharacters = window.atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    let byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray)
  }

  let blob = new window.Blob(byteArrays, {type: contentType});
  return blob
}

export function downloadCanvas (canvas, name) {
  // Generate the base64 representation of the canvas
  let base64image = canvas.toDataURL('image/png');
  // Split the base64 string in data and contentType
  let block = base64image.split(';');
  // Get the content type
  let mimeType = block[0].split(':')[1]; // In this case 'image/png'
  // get the real base64 content of the file
  let realData = block[1].split(',')[1]; // For example:  iVBORw0KGgouqw23....

  // Convert b64 to blob and store it into a letiable (with real base64 as value)
  let canvasBlob = b64toBlob(realData, mimeType);

  // Generate file download
  var dlink = document.createElement('a');
  dlink.setAttribute('type', 'hidden');
  dlink.download = name;
  dlink.href = window.URL.createObjectURL(canvasBlob);
  document.body.appendChild(dlink);
  dlink.onclick = function (e) {
    // revokeObjectURL needs a delay to work properly
    var that = this;
    setTimeout(function () {
      window.URL.revokeObjectURL(that.href)
    }, 1500)
  };

  dlink.click();
  dlink.remove()
}

window.debounceList = {};
export function checkBounce (key) {
  if (!window.debounceList[key]) {
    setTimeout(() => {
      delete window.debounceList[key]
    }, 1000);
    window.debounceList[key] = true;
    return false
  } else {
    return true
  }
}

//防抖函数
export function debounced(cb, timer) {
  let flag = Date.now();
  if(Date.now() - flag >= timer) {
    cb()
  }
}

export function copyText (content) {
  let targetElm;
  if (content.indexOf('\n') !== -1) {
    targetElm = document.createElement('textarea')
  } else {
    targetElm = document.createElement('span')
  }
  var newContent = document.createTextNode(content);
  targetElm.appendChild(newContent);
  document.body.appendChild(targetElm);
  Promise.resolve().then(() => {
    var range = document.createRange();
    range.selectNode(targetElm);
    window.getSelection().removeAllRanges();
    Promise.resolve().then(() => {
      // var range = document.createRange()
      range.selectNode(targetElm);
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      document.body.removeChild(targetElm)
    })
  })
}

export function createStyleSheet (columnLeftRightObj, tableClassName) {
  let styleSheetStr = `${tableClassName} {display: block;}`;
  Object.keys(columnLeftRightObj).forEach((it) => {
    let selectorStr = '';
    selectorStr += `${tableClassName}>.table-row>.`;
    selectorStr += it;
    selectorStr += '{left:' + columnLeftRightObj[it].left + 'px;';
    selectorStr += 'width:' + columnLeftRightObj[it].width + 'px;';
    selectorStr += 'padding-right:' + columnLeftRightObj[it]['padding-right'] + 'px;}';
    styleSheetStr += selectorStr
  });
  return styleSheetStr
}

export function insertStyleSheet (styleSheetStr, tableBodySelector) {
  let tableBodyElm = document.body.querySelector(tableBodySelector);
  if (_.isNull(tableBodyElm)) return;
  let oldSheetElm = tableBodyElm.getElementsByTagName('style')[0];
  if (!_.isNull(oldSheetElm) && !_.isUndefined(oldSheetElm)) {
    oldSheetElm.parentElement.removeChild(oldSheetElm)
  }
  var sheetElm = document.createElement('style');
  sheetElm.innerHTML = styleSheetStr;
  tableBodyElm.appendChild(sheetElm)
}

export function updateRelativeWidthForSidePanel (self) {
  let minPanelLeftToNav = 250;
  let minOperationListPanelLeftToNav = 450;
  let sectionWidth = Math.floor(document.querySelector('.section').getBoundingClientRect().width);
  let panelLeftToNav = Math.max(Math.floor(sectionWidth * 0.2), minPanelLeftToNav);
  let operationListPanelLeftToNave = Math.max(Math.floor(sectionWidth * 0.2), minOperationListPanelLeftToNav);
  let operationPanelPaddingRight = sectionWidth - operationListPanelLeftToNave + 70; // - 50 for full window panel padding-left
  self.updateDbObject({
    name: 'common',
    data: {
      ...self.dbData.common,
      panelLeftToNav: `${panelLeftToNav}px`,
      operationListPanelLeftToNave: `${operationListPanelLeftToNave}px`,
      operationPanelPaddingRight: `${operationPanelPaddingRight}px`
    }
  })
}

// export async function getPrimaryStorageAttachableCluster (uuid, psType) {
//   let clusterUuidList = []
//   let attachableClusterUuidList = []
//   let primarystorage = _.cloneDeep(this.dbData.primarystorage[uuid])
//   let type
//   if (primarystorage) {
//     type = primarystorage.type
//   } else {
//     type = psType
//   }

//   let typeList = []

//   if (this.dbData.common.isOpensource) {
//     let resp
//     if (primarystorage && (primarystorage.attachedClusterUuids.length > 0)) { // attached ps
//       resp = await rpc.query('clusters', { q: `uuid!?=${primarystorage.attachedClusterUuids}`, fields: 'uuid' })
//     } else {
//       resp = await rpc.query('clusters', { fields: 'uuid' })
//     }
//     resp.inventories.forEach(cluster => {
//       clusterUuidList.push(cluster.uuid)
//     })
//     return clusterUuidList
//   } else {
//     let attachedClusterUuids = []
//     let clusterResp
//     let psResp = await rpc.query('primary-storage')
//     psResp.inventories.forEach(ps => {
//       ps.attachedClusterUuids.forEach(uuid => {
//         attachedClusterUuids.push(uuid)
//       })
//     })
//     if (attachedClusterUuids.length > 0) {
//       clusterResp = await rpc.query('clusters', { q: `uuid!?=${attachedClusterUuids}`, fields: 'uuid' })
//     } else {
//       clusterResp = await rpc.query('clusters', { fields: 'uuid' })
//     }
//     clusterResp.inventories.forEach(cluster => {
//       clusterUuidList.push(cluster.uuid)
//     })
//     if (['Ceph', 'Fusionstor'].indexOf(type) > -1) {
//       return clusterUuidList
//     }
//     if (type === 'NFS') {
//       typeList = ['NFS', 'LocalStorage']
//       let conditions = [`primaryStorage.type?=${typeList}`]
//       if (primarystorage) conditions.push(`uuid!?=${primarystorage.attachedClusterUuids}`)
//       clusterResp = await rpc.query('clusters', { q: conditions, fields: 'uuid' })
//       for (let i = clusterResp.inventories.length - 1; i >= 0; i--) {
//         psResp = await rpc.query('primary-storage', { q: `cluster.uuid=${clusterResp.inventories[i].uuid}`, fields: 'type' })
//         if (psResp.inventories.length >= 2) {
//           let flag = true
//           for (let j = psResp.inventories.length - 1; j >= 0; j--) {
//             if (psResp.inventories[j].type !== 'NFS') {
//               flag = false
//             }
//           }
//           if (flag) {
//             attachableClusterUuidList.push(clusterResp.inventories[i].uuid)
//           }
//         } else {
//           attachableClusterUuidList.push(clusterResp.inventories[i].uuid)
//         }
//       }
//       clusterUuidList = clusterUuidList.concat(attachableClusterUuidList)
//     } else if (type === 'SharedMountPoint') {
//       typeList = ['LocalStorage']
//       let conditions = [`primaryStorage.type?=${typeList}`]
//       if (primarystorage) conditions.push(`uuid!?=${primarystorage.attachedClusterUuids}`)
//       clusterResp = await rpc.query('clusters', { q: conditions, fields: 'uuid' })
//       for (let i = clusterResp.inventories.length - 1; i >= 0; i--) {
//         psResp = await rpc.query('primary-storage', { q: `cluster.uuid=${clusterResp.inventories[i].uuid}`, fields: 'type' })
//         if (psResp.inventories.length === 1) {
//           if (psResp.inventories[0].type === 'LocalStorage') {
//             attachableClusterUuidList.push(clusterResp.inventories[i].uuid)
//           }
//         } else if (psResp.inventories.length <= 1) {
//           attachableClusterUuidList.push(clusterResp.inventories[i].uuid)
//         }
//       }
//       clusterUuidList = clusterUuidList.concat(attachableClusterUuidList)
//     } else if (type === 'LocalStorage') {
//       typeList = ['LocalStorage', 'SharedMountPoint', 'NFS']
//       let conditions = [`primaryStorage.type?=${typeList}`]
//       if (primarystorage) conditions.push(`uuid!?=${primarystorage.attachedClusterUuids}`)
//       clusterResp = await rpc.query('clusters', { q: conditions, fields: 'uuid' })
//       for (let i = clusterResp.inventories.length - 1; i >= 0; i--) {
//         psResp = await rpc.query('primary-storage', { q: `cluster.uuid=${clusterResp.inventories[i].uuid}`, fields: 'type' })
//         if (psResp.inventories.length >= 2) {
//           let flag = true
//           for (let j = psResp.inventories.length - 1; j >= 0; j--) {
//             if (psResp.inventories[j].type !== 'LocalStorage') {
//               flag = false
//             }
//           }
//           if (flag) {
//             attachableClusterUuidList.push(clusterResp.inventories[i].uuid)
//           }
//         } else {
//           attachableClusterUuidList.push(clusterResp.inventories[i].uuid)
//         }
//       }
//       clusterUuidList = clusterUuidList.concat(attachableClusterUuidList)
//     }
//     return clusterUuidList
//   }
// }

// export async function getClusterAttachablePrimaryStorage (uuid) {
//   let result = []
//   let psUuidList = []
//   let resp = await rpc.query('primary-storage', { q: `cluster.uuid=${uuid}` })
//   let primaryStorages = resp.inventories
//   primaryStorages.forEach(ps => {
//     psUuidList.push(ps.uuid)
//   })
//   if (psUuidList.length === 0) {
//     let psResp = await rpc.query('primary-storage', {fields: 'uuid'})
//     psResp.inventories.forEach(ps => {
//       result.push(ps.uuid)
//     })
//     return result
//   }
//   let allPsIsLocalStorage = true
//   let allPsIsNFS = true
//   let allPsIsSharedMountPoint = true
//   for (let i = primaryStorages.length - 1; i >= 0; i--) {
//     if (primaryStorages[i].type !== 'LocalStorage') {
//       allPsIsLocalStorage = false
//     }
//     if (primaryStorages[i].type !== 'NFS') {
//       allPsIsNFS = false
//     }
//     if (primaryStorages[i].type !== 'SharedMountPoint') {
//       allPsIsSharedMountPoint = false
//     }
//   }
//   let psTypes
//   if (psUuidList.length === 1) {
//     if (allPsIsSharedMountPoint) psTypes = ['LocalStorage']
//     else if (allPsIsNFS) psTypes = ['LocalStorage', 'NFS']
//     else if (allPsIsLocalStorage) psTypes = ['LocalStorage', 'NFS', 'SharedMountPoint']
//     psResp = await rpc.query('primary-storage', { q: [`uuid!?=${psUuidList}`, `type?=${psTypes}`], fields: 'uuid' })
//   } else if (psUuidList.length >= 2) {
//     if (allPsIsLocalStorage) {
//       psTypes = ['LocalStorage']
//       psResp = await rpc.query('primary-storage', { q: [`uuid!?=${psUuidList}`, `type?=${psTypes}`], fields: 'uuid' })
//     } else if (allPsIsNFS) {
//       psTypes = ['NFS']
//       psResp = await rpc.query('primary-storage', { q: [`uuid!?=${psUuidList}`, `type?=${psTypes}`], fields: 'uuid' })
//     } else {
//       return result
//     }
//   }
//   psResp.inventories.forEach(ps => {
//     result.push(ps.uuid)
//   })
//   return result // uuid?=primaryStorage
// }

export async function getClusterAttachableL2Network (uuid) {
  let clusterResp = await rpc.query('l2-networks', { q: `cluster.uuid=${uuid}` });
  let cluster = _.cloneDeep(this.dbData.cluster[uuid]);

  // L2VlanNetwork
  let L2VlanNetwork = {};
  L2VlanNetwork.vlan = [];
  L2VlanNetwork.physicalInterface = [];

  // L2NoVlanNetwork
  let L2NoVlanNetwork = {};
  L2NoVlanNetwork.physicalInterface = [];

  // VxlanNetworkPool
  let VxlanNetworkPool = {};
  VxlanNetworkPool.uuidList = [];

  clusterResp.inventories.forEach((item) => {
    if (item.type === 'L2VlanNetwork') {
      L2VlanNetwork.vlan.push(item.vlan);
      L2VlanNetwork.physicalInterface.push(item.physicalInterface)
    }
    if (item.type === 'L2NoVlanNetwork') {
      L2NoVlanNetwork.physicalInterface.push(item.physicalInterface)
    }
    if (item.type === 'VxlanNetworkPool') {
      VxlanNetworkPool.uuidList.push(item.uuid)
    }
  });

  let l2networkUuidList = [];
  let differenceHypervisorTypeCluster = [];
  let taskList = [];
  let p;

  // QueryL2Network type="L2VlanNetwork" vlan!?=1,2 physicalInterface?=eth0
  if (L2VlanNetwork.vlan.length > 0 && L2VlanNetwork.physicalInterface.length > 0) {
    p = rpc.query('l2-networks', {
      q: ['type=L2VlanNetwork', `vlan!?=${L2VlanNetwork.vlan}`, `physicalInterface?=${L2VlanNetwork.physicalInterface}`],
      fields: 'uuid'
    }).then((resp) => {
      l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
    });
    taskList.push(p);

    // QueryL2Network type="L2VlanNetwork" vlan!?=1,2 physicalInterface!?=eth0
    p = rpc.query('l2-networks', {
      q: ['type=L2VlanNetwork', `vlan!?=${L2VlanNetwork.vlan}`, `physicalInterface!?=${L2VlanNetwork.physicalInterface}`],
      fields: 'uuid'
    }).then((resp) => {
      l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
    });
    taskList.push(p);

    // QueryL2Network type="L2VlanNetwork" vlan?=1,2 physicalInterface!?=eth0
    p = rpc.query('l2-networks', {
      q: ['type=L2VlanNetwork', `vlan?=${L2VlanNetwork.vlan}`, `physicalInterface!?=${L2VlanNetwork.physicalInterface}`],
      fields: 'uuid'
    }).then((resp) => {
      l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
    });
    taskList.push(p)
  } else {
    // QueryL2Network type="L2VlanNetwork"
    p = rpc.query('l2-networks', {
      q: 'type=L2VlanNetwork',
      fields: 'uuid'
    }).then((resp) => {
      l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
    });
    taskList.push(p)
  }

  // QueryL2Network type="L2NoVlanNetwork" physicalInterface!?=eth0
  if (L2NoVlanNetwork.physicalInterface.length > 0) {
    p = rpc.query('l2-networks', {
      q: ['type=L2NoVlanNetwork', `physicalInterface!?=${L2NoVlanNetwork.physicalInterface}`],
      fields: 'uuid'
    }).then((resp) => {
      l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
    });
    taskList.push(p)
  } else {
    // QueryL2Network type="L2NoVlanNetwork"
    p = rpc.query('l2-networks', {
      q: 'type=L2NoVlanNetwork',
      fields: 'uuid'
    }).then((resp) => {
      l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
    });
    taskList.push(p)
  }

  // QueryL2Network uuid!?=uuidList type=VxlanNetworkPool
  p = rpc.query('l2-networks', {
    q: ['type=VxlanNetworkPool', `uuid!?=${VxlanNetworkPool.uuidList}`],
    fields: 'uuid'
  }).then((resp) => {
    l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
  });
  taskList.push(p);

  // uniq difference hypervisorType cluster //  cluster.hypervisorType!=${cluster.hypervisorType} UNIQ ESX NETWORK
  let condition = [`cluster.hypervisorType!=${cluster.hypervisorType}`];
  if (cluster.hypervisorType === 'baremetal' || cluster.hypervisorType === 'KVM') condition = ['cluster.hypervisorType=ESX'];
  p = rpc.query('l2-networks', {
    q: condition,
    fields: 'uuid'
  }).then((resp) => {
    differenceHypervisorTypeCluster = differenceHypervisorTypeCluster.concat(resp.inventories.map(it => it.uuid))
  });
  taskList.push(p);
  return Promise.all(taskList).then(() => {
    l2networkUuidList = _.uniq(l2networkUuidList);
    l2networkUuidList = _.difference(l2networkUuidList, differenceHypervisorTypeCluster);
    // console.log(l2networkUuidList)
    return l2networkUuidList
  })
}

export function isChildElementOf (elm, className) {
  let currElm = elm;
  while (currElm !== null && currElm !== undefined && currElm.className.indexOf(className) === -1) {
    currElm = currElm.parentElement
  }
  if (!!currElm && currElm.className.indexOf(className) > -1) {
    return true
  }
  return false
}

export function isChildElementOfElm (elm, topElement) {
  let currElm = elm;
  while (currElm !== null && currElm !== undefined && currElm !== topElement) {
    currElm = currElm.parentElement
  }
  if (!!currElm && currElm === topElement) {
    return true
  }
  return false
}

export function browserLocalStorageGetItem (item) {
  return window.localStorage.getItem(item)
}

export function browserLocalStorageSetItem (item, value) {
  return window.localStorage.setItem(item, value)
}

export function browserLocalStorageRemoveItem (item) {
  return window.localStorage.removeItem(item)
}

export function getEventDataFromWindow (item) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  if (!window.__eventStorage__[item]) return null;
  return window.__eventStorage__[item]
}

export function setEventDataToWindow (item, value) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  window.__eventStorage__[item] = value
}

export function removeEventDataInWindow (item) {
  if (!window.__eventStorage__) window.__eventStorage__ = {};
  window.__eventStorage__[item] = null
}

export function applyRespToDb (obj, self) {
  let tasks = [];
  Object.keys(obj).forEach(prop => {
    if (_.isArray(obj[prop])) {
      let oldObj = {};
      if (self.dbData[prop]) oldObj = _.cloneDeep(self.dbData[prop]);
      let updateObj = {};
      obj[prop].forEach(it => {
        updateObj[it.uuid] = it
      });
      // step 1 merge new items, keep existing items
      let newObj = _.merge(oldObj, updateObj);
      // step 2 merge new items props to existing items
      Object.keys(newObj).forEach(uuid => {
        newObj[uuid] = _.assign(newObj[uuid], updateObj[uuid])
      });
      let p = self.updateDbTable({
        tableName: prop,
        list: _.values(newObj)
      });
      // let p = self.updateDbTable({
      //   tableName: prop,
      //   list: obj[prop]
      // })
      tasks.push(p)
    } else if (_.isObject(obj[prop])) {
      let p = self.updateDbObject({
        name: prop,
        data: obj[prop]
      });
      tasks.push(p)
    }
  });
  return Promise.all(tasks).then(() => {
    self.$forceUpdate()
  })
}

export function toUpperCase (str) {
  return str.toUpperCase()
}

export function permutations (list) {
  // Empty list has one permutation
  if (list.length === 0) {
    return [[]]
  }

  let result = [];

  for (let i = 0; i < list.length; i++) {
    // Clone list (kind of)
    let copy = Object.create(list);

    // Cut one element from list
    let head = copy.splice(i, 1);

    // Permute rest of list
    let rest = permutations(copy);

    // Add head to each permutation of rest of list
    for (let j = 0; j < rest.length; j++) {
      let next = head.concat(rest[j]);
      result.push(next)
    }
  }

  return result
}

export function getColorByState (state) {
  let blue = '#52C4FF';
  let red = '#EC5960';
  let green = '#45BB79';
  let yellow = '#F2AE1B';
  let grey = '#97A4B6';
  let obj = {
    'Starting': blue,
    'Stopping': blue,
    'Premaintenance': blue,
    'Rebooting': blue,
    'Downloading': blue,
    'Connecting': blue,
    'Destroying': blue,
    'Migrating': blue,
    'Stopped': red,
    'Disabled': red,
    'Disconnected': red,
    'Connected': green,
    'Ready': green,
    'Running': green,
    'Enable': green,
    'Unknown': yellow,
    'Destroyed': grey,
    'Maintenance': grey,
    'PreMaintenance': grey,
    'Paused': grey,
    'NotInstantiated': grey,
    'Deleted': grey,
    'Done': grey
  };
  return obj[state]
}

export function getZWatchSystemTopicUuidList () {
  return ['e7d6f5e23bb74e99a2777126078b551c', '7bfa0eb8555b3528ace936edfd1d74f1']
}

export function getZWatchSystemAlarmTopicUuidList () {
  return ['e7d6f5e23bb74e99a2777126078b551c']
}

export function getZWatchSystemAlarmUuidList () {
    return [
      '5d3bb9d271a349b283893317f531f723',
      'b632652cc16044cdb6b4f516ed93a118',
      '66dfdee6fd314aac96ca3779774ad977',
      'ded02f9786444c6296e9bc3efb8eb484',
      '44e6f054a59a451fb1b535accff64fc2',
      'd59397479d2548d7abfe4ad31a575390',
      '98f9c802604e4852bd84716f66cf4f73',
      '8eca1096feb34419913087d2b281ecec',
      '5e75230bd2ea4f47abf6ff92fa816a20',
      '55365763fed244c39b4642bef6c5daf9',
      'f56795b8c34b452f84bcf25cb89bded2',
      '10d9c4e69fc2456bb8c6c6d456bb5038',
      '39d2b6689efa4e4a96c239716cb6f3ea',
      '4a3cb114b10d41e19545ab693222c134',
      '1a7a3eb433904df89f5c42a1fa4e0716',
      'e47db726090c47de84521bebc640cfc2',
      'bf7359930ee444d286fb88d2e51acf51'
    ]
}

export function getResourceName (name, uuid, self) {
  let script = `tmp = call("org.zstack.header.vo.APIGetResourceNamesMsg", '{"uuids": ["${uuid}"]}').result.inventories
  put("name", tmp)`;
  return rpc.query('batch-queries', {
    script: encodeURIComponent(script)
  }).then(resp => {
    if (resp.result.name.length > 0) self[name] = resp.result.name[0].resourceName;
    else self[name] = ''
  })
}

export function bytesToSizeInMonitor (bytes, unit, width) {
  if (typeof bytes !== 'number' || isNaN(bytes)) bytes = 0;
  if (bytes < 0) bytes = 0;
  if (typeof width === 'undefined') width = 2;
  if (typeof unit === 'undefined') unit = 'B';
  var num = Math.pow(10, width);
  var sizes = ['K', 'M', 'G', 'T', 'P'];
  if (unit) {
    sizes.unshift('')
  } else {
    sizes.unshift('Byte')
  }
  if (bytes === 0) return '0 ' + sizes[0] + unit;
  if (bytes < 1) {
    let str = bytes.toString();
    if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) return bytes.toFixed(2) + sizes[0] + unit;
    else return bytes + sizes[0] + unit
  }
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (sizes[i] === 'B') num = 1;
  if (i >= 5) i = 5;
  let ret = /^(([1-9][0-9]*)|(([0]\.\d{1,1}|[1-9][0-9]*\.\d{1,1})))$/;
  if (!ret.test((bytes / Math.pow(1024, i) * num) / num)) {
    let value = ((bytes / Math.pow(1024, i) * num) / num).toFixed(1);
    if (value - Math.floor(value) === 0) value = Math.floor(value);
    return value + ' ' + sizes[i] + unit
  } else return Math.round(bytes / Math.pow(1024, i) * num) / num + ' ' + sizes[i] + unit
}

export function opsFormatter (value) {
  let str = value.toString();
  if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) return value.toFixed(2) + ' ops/s';
  else return value + ' ops/s'
}

export function secToTime (s) {
  let time = {
    hour: 0,
    min: 0,
    sec: 0
  };
  if (s > 0) {
    let hour = Math.floor(s / 3600);
    let min = Math.floor(s / 60) % 60;
    let sec = s % 60;
    time = {
      hour: hour,
      min: min,
      sec: sec
    }
  }
  return time
}

export function isArrRepeat (arr) {
  var hash = {};
  for (var i in arr) {
    if (hash[arr[i]]) {
      return true
    }
    hash[arr[i]] = true
  }
  return false
}

export function queryLongJobs () {
  let longJobListName = `longJobList-${this.getIdentityUuid()}`;
  let longJobList = JSON.parse(this.browserLocalStorageGetItem(longJobListName));
  if (longJobList === null) longJobList = [];
  let jobUuids = [];

  if (longJobList.length > 0) {
    longJobList.forEach(longJob => {
      if (this.browserLocalStorageGetItem(longJob.id)) {
        jobUuids.push(JSON.parse(this.browserLocalStorageGetItem(longJob.id)).resourceInfos.jobUuid)
      }
    })
  }

  // just update the number up right the window.
  let newLongJobList = _.cloneDeep(this.dbData.job).longJobUuidList;
  newLongJobList.forEach((uuid) => {
    jobUuids = jobUuids.filter((_uuid) => uuid !== _uuid)
  });
  if (jobUuids.length === 0) return;
  return rpc.query(`longjobs`, {q: [`state=Running`, `apiId?=${jobUuids}`], count: true}).then(resp => {
    this.$data.runningLongJobs = resp.total
  })
}

export function isLongJobEvent (eventId) {
  let longJobListName = `longJobList-${getIdentityUuid()}`;
  let longJobList = JSON.parse(browserLocalStorageGetItem(longJobListName));
  if (!longJobList) longJobList = [];
  for (let longJob of longJobList) {
    if (eventId === longJob.id) return true
  }
  return false
}

export function isLongJobCall (jobUuid) {
  let longJobListName = `longJobList-${getIdentityUuid()}`;
  let longJobList = JSON.parse(browserLocalStorageGetItem(longJobListName));
  if (!longJobList) longJobList = [];
  for (let longJob of longJobList) {
    let event = JSON.parse(browserLocalStorageGetItem(longJob.id));
    if (event && _.includes(event.apiList, jobUuid)) return true
  }
  return false
}

export async function queryResourceByUuid (url, uuidList, tableName, self) {
  if (!uuidList) return;
  if (!_.isArray(uuidList)) {
    uuidList = [uuidList]
  }
  return rpc.query(url, {
    q: [`uuid?=${uuidList.join(',')}`]
  }).then((resp) => {
    let list = resp.inventories;
    uuidList.forEach(uuid => {
      if (!_.some(list, { uuid })) {
        list.push({ uuid })
      }
    });
    return self.updateDbTable({
      tableName,
      list
    })
  })
}

export async function checkResourceIsDeletedByUuid (url, uuidList, self) {
  if (!uuidList) return;
  if (!_.isArray(uuidList)) {
    uuidList = [uuidList]
  }
  return rpc.query(url, {
    q: [`uuid?=${uuidList.join(',')}`]
  }).then((resp) => {
    let result = resp.inventories.length === 0;
    return result
  })
}

export async function queryResourceByConditions (url, conditions, tableName, self) {
  if (!conditions) return;
  if (!_.isArray(conditions)) {
    conditions = [conditions]
  }
  return rpc.query(url, {
    q: conditions
  }).then((resp) => {
    let list = resp.inventories;
    return self.updateDbTable({
      tableName,
      list
    })
  })
}

export function extraPredefinedRoleUuidList () {
  let uuidList = [
    '067c4dc358e847aba47903ca4fb1c41c', // configuration
    '3968db40f92a46289de2554eec9dc9b1', // iam2-normal-user-roles
    '6f5a7d6d2da9499da9e4bdb079f65adf', // console
    '80315b1f85314917826b182bf6def552', // other
    '74a27f7f461e4601877c2728c52ec9e5', // vrouter
    'acf2695d8c7c4c5587f5b136098fe45e', // identity
    'c38192cc2a904abeb7104c36fcdc53cd', // billing
    'cf70971a496345e487a7a22130c90510', // vpc
    '0666bf6c056d4982b33cb0bbc033ab3d' // ticket
    // 'cc90463e84bf48d5ab3459cdd847e8e8' // tag2
  ];
  return uuidList
}

export function filterExtraPredefinedRole (item) {
  if (item.type !== 'CreatedBySystem') return false;
  let nameList = [
    'predefined: configuration',
    'predefined: iam2-normal-user-roles',
    'predefined: console',
    'predefined: other',
    'predefined: vrouter',
    'predefined: identity', // dangerous
    'predefined: billing',
    'predefined: vpc',
    'predefined: ticket',
    'predefined: ipsec'
    // 'predefined: tag2'
  ];
  return nameList.some(it => it === item.name)
}

export async function getExtraPredefinedRole () {
  let uuidList = [
    '067c4dc358e847aba47903ca4fb1c41c', // configuration
    '3968db40f92a46289de2554eec9dc9b1', // iam2-normal-user-roles
    '6f5a7d6d2da9499da9e4bdb079f65adf', // console
    '80315b1f85314917826b182bf6def552', // other
    '74a27f7f461e4601877c2728c52ec9e5', // vrouter
    'acf2695d8c7c4c5587f5b136098fe45e', // identity // dangerous
    'c38192cc2a904abeb7104c36fcdc53cd', // billing
    'cf70971a496345e487a7a22130c90510', // vpc
    '0666bf6c056d4982b33cb0bbc033ab3d' // ticket
    // 'cc90463e84bf48d5ab3459cdd847e8e8' // tag2
  ];
  let nameList = [
    'predefined: configuration',
    'predefined: iam2-normal-user-roles',
    'predefined: console',
    'predefined: other',
    'predefined: vrouter',
    'predefined: identity', // dangerous
    'predefined: billing',
    'predefined: vpc',
    'predefined: ticket',
    'predefined: ipsec'
    // 'predefined: tag2'
  ];
  let encodenameList = encodeURIComponent(nameList);
  let tasks = [];
  let p = rpc.query('identities/roles', {
    q: ['type=CreatedBySystem', `name?=${encodenameList}`]
  }).then((resp) => {
    uuidList = uuidList.concat(resp.inventories.map(it => it.uuid))
  });
  tasks.push(p);
  return Promise.all(tasks).then(() => {
    return uuidList
  })
}

export async function getProjectAllRoleList (projectUuid, ctx = this, linkedAccountUuid) {
  let accountUuid = '';
  if (linkedAccountUuid) {
    accountUuid = linkedAccountUuid
  } else {
    if (!ctx.dbData.iam2project[projectUuid]) return [];
    accountUuid = ctx.dbData.iam2project[projectUuid].linkedAccountUuid
  }
  let resp = await rpc.query('accounts/resources/refs', {
    q: [`accountUuid=${accountUuid}`, 'resourceType=RoleVO']
  });
  let roleUuidList = resp.inventories.map(item => item.resourceUuid);
  let uuidsString = roleUuidList.map((it, index) => { return `${index === 0 ? '' : '&'}uuids=${it}` }).join('');
  let resourceNameResp = await rpc.query(`resources/names?${uuidsString}`);
  let uuidList = resourceNameResp.inventories
    .filter(item => {
      return removeExtraRoles().every(it => it !== item.resourceName)
    })
    .map(item => item.uuid);
  return uuidList
}

export function removeExtraRoles () {
  let nameList = [
    'predefined: volumeBackup'
  ];
  return nameList
}

export async function getProjectDefaultRoleList (projectUuid, ctx = this, linkedAccountUuid) {
  let allRoleUuidList = await getProjectAllRoleList(projectUuid, ctx = this, linkedAccountUuid);
  let nameList = [
    'predefined: configuration',
    'predefined: iam2-normal-user-roles',
    'predefined: console',
    'predefined: other',
    'predefined: vrouter',
    // 'predefined: identity',// dangerous
    'predefined: billing',
    'predefined: vpc',
    'predefined: ticket',
    'predefined: ipsec'
    // 'predefined: tag2'
  ];
  let resp = await rpc.query('identities/roles', {
    q: [`uuid?=${allRoleUuidList}`, `name?=${encodeURIComponent(nameList)}`, 'type=CreatedBySystem']
  });
  let roleUuidList = resp.inventories.map(item => item.uuid);
  return roleUuidList
}

export async function getProjectOptionalRoleList (projectUuid, ctx = this, linkedAccountUuid) {
  let allRoleUuidList = await getProjectAllRoleList(projectUuid, ctx = this, linkedAccountUuid);
  let nameList = [
    'predefined: configuration',
    'predefined: iam2-normal-user-roles',
    'predefined: console',
    'predefined: other',
    'predefined: vrouter',
    'predefined: identity', // dangerous
    'predefined: billing',
    'predefined: vpc',
    'predefined: ticket',
    'predefined: ipsec'
    // 'predefined: tag2'
  ];
  let resp = await rpc.query('identities/roles', {
    q: [`uuid?=${allRoleUuidList}`, `name!?=${encodeURIComponent(nameList)}`, 'type=CreatedBySystem']
  });
  let roleUuidList = resp.inventories.map(item => item.uuid);
  return roleUuidList
}

export async function filterProjectDefaultRoleList () {
  let nameList = [
    'predefined: configuration',
    'predefined: iam2-normal-user-roles',
    'predefined: console',
    'predefined: other',
    'predefined: vrouter',
    'predefined: identity', // dangerous
    'predefined: billing',
    'predefined: vpc',
    'predefined: ticket',
    'predefined: ipsec'
    // 'predefined: tag2'
  ];
  let encodenameList = encodeURIComponent(nameList);
  let resp = await rpc.query('identities/roles', {
    q: ['type=CreatedBySystem', `name?=${encodenameList}`]
  });
  let uuidList = resp.inventories.map(it => it.uuid);
  return uuidList
}

export function currUserHasPermission (uuidList) {
  if (!this.dbData.common.currProject) return false;
  let userRole = this.dbData.common.currProject.userRole;
  let isProjectOperator = userRole === 'projectOperator';
  let isProjectAdmin = userRole === 'projectAdmin';
  let projectUuid = this.dbData.common.currProject.uuid;
  let hasPermission = uuidList.every(uuid => {
    if (!this.dbData.iam2virtualidA[uuid]) return false;
    let identity = this.dbData.iam2virtualidA[uuid][projectUuid].identity;
    let _isProjectAdmin = identity === '__ProjectAdmin__';
    let _isProjectOperator = identity === '__ProjectOperator__';
    if (isProjectAdmin && _isProjectAdmin) return false;
    if (isProjectOperator && (_isProjectAdmin || _isProjectOperator)) return false;
    return true
  });
  return hasPermission
}

export async function currUserCanNotOperateUserList () {
  if (!this.dbData.common.currProject) return false;
  let userRole = this.dbData.common.currProject.userRole;
  let isProjectOperator = userRole === 'projectOperator';
  let isProjectAdmin = userRole === 'projectAdmin';
  let projectUuid = this.dbData.common.currProject.uuid;

  let filterIdentities = '';
  if (isProjectAdmin) {
    filterIdentities = '__ProjectAdmin__'
  }
  if (isProjectOperator) {
    filterIdentities = ['__ProjectAdmin__', '__ProjectOperator__']
  }
  let resp = await rpc.query('iam2/virtual-ids', {
    q: [`attributes.name?=${filterIdentities}`, `attributes.value=${projectUuid}`]
  });
  let uuidList = resp.inventories.map(item => item.uuid);
  return uuidList
}

export function clearDbData (ctx = this) {
  let keys = Object.keys(ctx.dbData);
  keys.forEach(key => {
    ctx.dbData[key] = {}
  })
}

export function createTableObjFromUuidList (uuidList) {
  let table = {};
  uuidList.forEach((uuid) => {
    table[uuid] = {
      selected: false
    }
  });
  return table
}

export function computePageCount (total, pageSize) {
  return total === 0 ? 1 : Math.ceil(total / pageSize)
}

export function getCookie (name) {
  let arr = null;
  let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  if (document.cookie.match(reg)) {
    arr = document.cookie.match(reg);
    return (arr[2])
  } else {
    return null
  }
}

export function setCookie (name, value) {
  var Days = 30;
  var exp = new Date();
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString()
}

export function delCookie (name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null) {
    document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
  }
}

export function isAas () {
  let ticket = getCookie('login_aliyunid_ticket');
  let aliyunId = getCookie('login_aliyunid');
  if ((ticket && ticket !== '') || (aliyunId && aliyunId !== '')) {
    return true
  }
  return false
}

export function logoutAas () {
  let aasDomain = localStorage.getItem('aasDomain');
  let callbackUrl = localStorage.getItem('callbackUrl');
  let ssoLogoutUrl = `https://${aasDomain}/logout/logout.htm?oauth_callback=${callbackUrl}`;
  window.location.href = ssoLogoutUrl
}

export function getLiteralDirection (signDirection) {
  return signDirection === '-' ? 'desc' : 'asc'
}

export async function uniqCurrentAccountResources (resourceUuidList, currentAccountUuid) {
  if (!Array.isArray(resourceUuidList)) {
    resourceUuidList = [resourceUuidList]
  } else if (!resourceUuidList || resourceUuidList.length <= 0) {
    return []
  }
  let candidateResourceUuidList = [];
  let uuidsString = resourceUuidList.map((it, index) => { return `${index === 0 ? '' : '&'}resourceUuids=${it}` }).join('');
  let resp = await rpc.query(`resources/accounts?${uuidsString}`);
  Object.keys(resp.inventories).forEach(function (resourceUuid) {
    ((resourceUuid) => {
      // currentAccountUuid => Array or String
      if (!_.includes(currentAccountUuid, _.get(resp.inventories, [`${resourceUuid}`, 'uuid']))) {
        candidateResourceUuidList.push(resourceUuid)
      }
    })(resourceUuid)
  });
  return candidateResourceUuidList
}

export async function getCandidateConditionsForChangeResourceOwner (resourceUuidList) {
  if (!Array.isArray(resourceUuidList)) {
    resourceUuidList = [resourceUuidList]
  } else if (!resourceUuidList || resourceUuidList.length <= 0) {
    return
  }
  let accountUuidList = [];
  let currZoneUuid = window.localStorage.getItem('currZoneUuid');
  let uuidsString = resourceUuidList.map((it, index) => { return `${index === 0 ? '' : '&'}resourceUuids=${it}` }).join('');
  let resp = await rpc.query(`resources/accounts?${uuidsString}`);
  Object.keys(resp.inventories).forEach(function (resourceUuid) {
    ((resourceUuid) => {
      if (accountUuidList.indexOf(resp.inventories[resourceUuid].uuid) === -1) {
        accountUuidList.push(resp.inventories[resourceUuid].uuid)
      }
    })(resourceUuid)
  });
  let projectCondition = `state!='Deleted' and (
  uuid in (
    query iAM2ProjectAttribute.projectUuid where value='${currZoneUuid}' and
    name='__ProjectRelatedZone__'
  ) or
  uuid not in (query iAM2ProjectAttribute.projectUuid where name='__ProjectRelatedZone__')
)`;
  if (accountUuidList.length === 1) {
    projectCondition = `state!='Deleted' and linkedAccountUuid!='${accountUuidList[0]}' and (
  uuid in (
    query iAM2ProjectAttribute.projectUuid where value='${currZoneUuid}' and
    name='__ProjectRelatedZone__'
  ) or
  uuid not in (query iAM2ProjectAttribute.projectUuid where name='__ProjectRelatedZone__')
)`
  }
  return { accountUuidList: accountUuidList, projectCondition: projectCondition }
}

export function queryString (queryString, name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  var r = queryString.match(reg);
  if (r !== null) {
    return unescape(r[2])
  }
  return null
}

export function ipToInt (ip) {
  let _Number = 0;
  ip = ip.split('.');
  _Number = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
  _Number = _Number >>> 0;
  return _Number
}

export function intToIp (num) {
  let _String;
  let _Array = [];
  _Array[0] = (num >>> 24) >>> 0;
  _Array[1] = ((num << 8) >>> 24) >>> 0;
  _Array[2] = (num << 16) >>> 24;
  _Array[3] = (num << 24) >>> 24;
  _String = `${String(_Array[0])}.${String(_Array[1])}.${String(_Array[2])}.${String(_Array[3])}`;
  return _String
}

export function escapeDollarForGroovy (conditionList) {
  let newConditionList = [];
  conditionList.forEach(condition => {
    newConditionList.push(condition.replace(/\$/g, '\\$'))
  });
  return newConditionList
}

export function getTextSize (text, fontSize) {
  const spaceBetweenChar = 0.5;
  let fontWidth = parseInt(fontSize);
  let lowerCaseWidth = fontWidth / 2.2 + spaceBetweenChar;
  let upperCaseWidth = fontWidth * 2 / 3 + spaceBetweenChar;
  let chineseWidth = fontWidth;
  let wholeWidth = 0;
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code < 256) {
      // A - Z
      if (code >= 65 && code <= 90) {
        wholeWidth += upperCaseWidth
      } else {
        wholeWidth += lowerCaseWidth
      }
    } else {
      wholeWidth += chineseWidth
    }
  }
  return {
    width: wholeWidth,
    height: fontWidth
  }
  // fontSize = fontSize || '14px'
  // let object = document.createElement('div')
  // object.innerHTML = `<span style="position: absolute; float: left; white-space: nowrap; visibility: hidden; font-size: ${fontSize};">${text}</span>`
  // document.body.appendChild(object)
  // let rect = object.firstChild.getBoundingClientRect()
  // object.remove()
  // return {
  //   width: rect.width,
  //   height: rect.height
  // }
}

export function escapeQueryString (text) {
  return text
    .replace(/\\/g, '\\\\\\')
    .replace(/_/g, '\\\\_')
    .replace(/%/g, '\\\\%')
}

export function hexToRgb (hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex (r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

export function getTagBackGroundColor (hexColor) {
  // undefined hexColor will cause replace() issue in hexToRgb()
  if (_.isUndefined(hexColor)) return '';
  let rgbColor = hexToRgb(hexColor);
  let blendRatio = 0.05;
  let r = parseInt(rgbColor.r * blendRatio + 255 * (1 - blendRatio));
  let g = parseInt(rgbColor.g * blendRatio + 255 * (1 - blendRatio));
  let b = parseInt(rgbColor.b * blendRatio + 255 * (1 - blendRatio));
  return rgbToHex(r, g, b)
}

export async function updateUnreadMessageCount () {
  let eventResp = await rpc.query('zwatch/events', {
    conditions: ['readStatus=Unread', 'emergencyLevel=Emergent'],
    count: true
  });
  let alarmResp = await rpc.query('zwatch/alarm-histories', {
    conditions: 'readStatus=Unread',
    count: true
  });
  let total = eventResp.total + alarmResp.total;
  if (_.isNaN(total)) total = 0;
  this.updateDbObject({
    name: 'common',
    data: {
      unreadMessageCount: total
    }
  })
}

export function buildAxiosConfig () {
  return {
    method: 'get',
    baseURL: getServerUrl(),
    headers: {
      get: {
        'X-Session-Id': window.localStorage.getItem('sessionUuid')
      },
      'Access-Control-Allow-Origin': true
    }
  }
}
//首字母大写
export function capitalize(str) {
   return str.replace(/^\w/, str.slice(0, 1).toUpperCase())
}

export default {
  getConditionForOwner,
  queryLongJobs,
  secToTime,
  genUniqueId,
  isConditionsEqual,
  vmCpuQueryExpression,
  vmMemoryQueryExpression,
  vmDiskQueryExpression,
  vmNetworkQueryExpression,
  hostCpuQueryExpression,
  hostMemoryQueryExpression,
  hostDiskQueryExpression,
  hostNetworkQueryExpression,
  __printCallStack,
  setServerUrl,
  getServerUrl,
  bytesToSize,
  isInLongJob,
  sizeRoundToString,
  toSizeString,
  toPercentageString,
  parseNumber,
  parseSize,
  updateResource,
  updateAliyunResouce,
  isNumber,
  translateConditions,
  closeSidePage,
  getActionList,
  formatDatetime,
  formatState,
  registerLongJobTask,
  stopLongJobTask,
  triggerLongJobTask,
  getAction,
  shortSshKey,
  toFixed,
  updateDbTableWithZql,
  updateResourceOfLongJob,
  formatCurrency,
  formatNotification,
  normalizeLicenceType,
  downloadFile,
  checkBounce,
  copyText,
  createStyleSheet,
  insertStyleSheet,
  updateRelativeWidthForSidePanel,
  getClusterAttachableL2Network,
  isChildElementOf,
  isChildElementOfElm,
  setJobUuid,
  _closeWindow,
  getIdentityUuid,
  getJobUuid,
  deleteJobUuid,
  queryAllProgresses,
  insertItemFromOtherWindow,
  isImageStoreInZone,
  isNotSetUEFI,
  browserLocalStorageGetItem,
  browserLocalStorageSetItem,
  browserLocalStorageRemoveItem,
  setEventDataToWindow,
  getEventDataFromWindow,
  removeEventDataInWindow,
  isLongJobEvent,
  isLongJobCall,
  genActionProgresses,
  longJobHandler,
  applyRespToDb,
  isInJobUuidTable,
  toUpperCase,
  requireAll2Obj,
  permutations,
  downloadCanvas,
  getColorByState,
  getZWatchSystemTopicUuidList,
  getZWatchSystemAlarmTopicUuidList,
  getZWatchSystemAlarmUuidList,
  bytesToSizeInMonitor,
  isArrRepeat,
  getApiPermission,
  getLicenseCapability,
  getLicensePermission,
  opsFormatter,
  getResourceName,
  queryResourceByUuid,
  queryResourceByConditions,
  extraPredefinedRoleUuidList,
  filterExtraPredefinedRole,
  getExtraPredefinedRole,
  getProjectAllRoleList,
  removeExtraRoles,
  getProjectDefaultRoleList,
  getProjectOptionalRoleList,
  filterProjectDefaultRoleList,
  currUserHasPermission,
  currUserCanNotOperateUserList,
  clearDbData,
  createTableObjFromUuidList,
  computePageCount,
  getCookie,
  setCookie,
  delCookie,
  isAas,
  logoutAas,
  getLiteralDirection,
  uniqCurrentAccountResources,
  getCandidateConditionsForChangeResourceOwner,
  queryString,
  formatTime,
  ipToInt,
  intToIp,
  s2ab,
  escapeDollarForGroovy,
  getTextSize,
  escapeQueryString,
  hexToRgb,
  rgbToHex,
  getTagBackGroundColor,
  updateUnreadMessageCount,
  checkResourceIsDeletedByUuid,
  buildAxiosConfig,
  capitalize,
  debounced
}
