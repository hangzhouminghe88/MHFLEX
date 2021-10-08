// import rpc from 'src/utils/rpc'
import _ from 'lodash'
import {
  arrayToDict,
  createActionTemplate,
  createBatchActionTemplate,
  createBatchQueryTemplate,
  createQueryTemplate,
  getResourceOwner,
  mergeMap
} from '../../utils'
import helper from './helpers'
import api from './apis'
import batchQueryApi from '../batchQuery/apis'
import accountResourceApi from '../accountResource/apis'
import longjobApi from '../longjob/apis'
import systemTagHelper from '../systemTag/helpers'
import systemTagApi from '../systemTag/apis'
import rpc from 'src/utils/rpc'

const tableName = 'volume';
let queryTemplate = createQueryTemplate(tableName);
let batchQueryTemplate = createBatchQueryTemplate(tableName);
let actionTempalte = createActionTemplate(tableName);
let batchActionTemplate = createBatchActionTemplate(tableName);

export default {
  batchQuery: batchQueryTemplate(async ({ commit, rootState }, param) => {
    let realParam = _.cloneDeep(param);
    realParam.replyWithCount = true;
    let resp = await api.query(realParam);
    let volumeArray = resp.inventories;
    let volumeUuidList = volumeArray.map(it => it.uuid);
    let sharebleResp = await api.queryShareableVolumeVmInstanceRefByVolumeUuid(volumeUuidList);
    let volumeA = {};
    helper.addAttr(volumeArray);
    sharebleResp.inventories.forEach(it => {
      if (!volumeA[it.volumeUuid]) {
        volumeA[it.volumeUuid] = {
          uuid: it.volumeUuid,
          vmInstanceUuidList: []
        }
      }
      volumeA[it.volumeUuid].vmInstanceUuidList.push(it.vmInstanceUuid)
    });
    let volumeMap = mergeMap(arrayToDict(volumeArray), volumeA);
    // let script = helper.buildBatchQueryScript(rootState, param)
    // let resp = await batchQueryApi.query(script)
    // let mainMap = mergeMap(arrayToDict(resp.volume), arrayToDict(resp.volumeA))
    // commit('mergeDbTable', {tableName: 'vm', list: resp.vm}, { root: true })
    // commit('mergeDbTable', {tableName: 'primarystorage', list: resp.primarystorage}, { root: true })
    // for legacy data structure
    let resourceProjectMap = await getResourceOwner(volumeUuidList, commit, rpc, rootState);
    volumeMap = mergeMap(volumeMap, resourceProjectMap);

    // query related resources
    let vmUuidList = [];
    volumeArray.forEach(volume => {
      if (volume.vmInstanceUuid) {
        vmUuidList.push(volume.vmInstanceUuid)
      } else if (volume.vmInstanceUuidList) {
        vmUuidList = vmUuidList.concat(volume.vmInstanceUuidList)
      }
    });
    helper.queryVm(vmUuidList, commit);
    let psUuidList = volumeArray.filter(it => !!it.primaryStorageUuid).map(it => it.primaryStorageUuid);
    helper.queryPrimaryStorage(psUuidList, commit);
    let tagMap = await helper.queryUserTag(volumeUuidList, 'VolumeVO', commit);
    volumeMap = mergeMap(volumeMap, tagMap);
    return {
      total: resp.total,
      inventories: volumeMap
    }
  }),
  getExtraData: async ({ commit, rootState }, param) => {
    let uuidList = param;
    let script = helper.buildGetExtraDataScript(uuidList, rootState);
    let resp = await batchQueryApi.query(script);
    commit('merge', arrayToDict(resp.result))
  },
  // getExtraData: (ctx, param) => {
  //   let uuidList = param
  //   let getVolumeCapabilitiesTaskList = []
  //   uuidList.forEach((uuid) => (uuid => {
  //     let p = api.getVolumeCapabilities(uuid)
  //     .then(resp => {
  //       ctx.commit('merge', {
  //         [uuid]: resp.capabilities
  //       })
  //       return Promise.resolve()
  //     })
  //     getVolumeCapabilitiesTaskList.push(p)
  //   })(uuid))
  //   let getVolumeQosTaskList = []
  //   uuidList.forEach((uuid) => (uuid => {
  //     let p = api.getVolumeQos(uuid)
  //     .then(resp => {
  //       ctx.commit('merge', {
  //         [uuid]: {
  //           volumeBandwidth: resp.volumeBandwidth
  //         }
  //       })
  //       return Promise.resolve()
  //     })
  //     getVolumeQosTaskList.push(p)
  //   })(uuid))
  //   return Promise.all(getVolumeCapabilitiesTaskList.concat(getVolumeQosTaskList))
  // },
  query: queryTemplate(async ({ commit, rootState }, uuid) => {
    let script = helper.buildQueryScript(rootState, uuid);
    let resp = await batchQueryApi.query(script);
    let mainMap = mergeMap(arrayToDict(resp.volume), arrayToDict(resp.volumeA));
    mainMap[uuid] = {
      myUserTagUuidList: [],
      otherUserTagUuidList: []
    }
    let removedSystemTags = ['volumeReadBandwidth', 'volumeWriteBandwidth', 'volumeBandwidth', 'volumeBandwidthReadUpthreshold', 'volumeBandwidthWriteUpthreshold'];
    let systemTags = resp.systemTags.filter(item => {
      return !removedSystemTags.some(it => item.tag.indexOf(it))
    });
    let systemTagMap = systemTagHelper.normalizeResp(systemTags);
    mainMap = mergeMap(mainMap, systemTagMap);
    // for legacy data structure
    commit('mergeDbTable', {tableName: 'image', list: resp.image}, {root: true});
    commit('mergeDbTable', {tableName: 'vm', list: resp.vm}, {root: true});
    // commit('mergeDbTable', {tableName: 'primarystorage', list: resp.primarystorage}, { root: true })
    // commit('mergeDbTable', {tableName: 'account', list: resp.account}, { root: true })
    // let tagMap = helper.queryUserTag(uuid, 'VolumeVO', commit)

    // for legacy data structure
    let resourceProjectMap = await getResourceOwner(uuid, commit, rpc, rootState);
    mainMap = mergeMap(mainMap, resourceProjectMap);
    let tagMap = await helper.queryUserTag(uuid, 'VolumeVO', commit);
    mainMap = mergeMap(mainMap, tagMap);
    return mainMap
  }),
  update: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param.value, progressCb);
    let objMap = {
      [param.uuid]: resp.inventory
    };
    return objMap
  }),
  enable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let msg = await api.enable(uuid, progressCb);
    return msg.inventory
  }),
  disable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let msg = await api.disable(uuid, progressCb);
    return msg.inventory
  }),
  attach: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let msg = await api.attach(param.uuid, param.vmUuid, progressCb);
    return msg.inventory
  }),
  detach: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    await api.detach(uuid, progressCb);
    return {
      uuid,
      vmInstanceUuid: null
    }
  }),
  detachShareable: actionTempalte(async (ctx, { param, progressCb }) => {
    let tasks = [];
    let ret = {};
    param.volumeUuidList.forEach(volumeUuid => {
      param.vmUuidList.forEach(vmUuid => {
        let p = api.detachShareable(volumeUuid, vmUuid, progressCb);
        tasks.push(p)
      });
      ret[volumeUuid] = {
        uuid: volumeUuid,
        vmInstanceUuidList: _.difference(ctx.state[volumeUuid].vmInstanceUuidList, param.vmUuidList)
      }
    });
    await Promise.all(tasks);
    return ret
  }),
  migrate: batchActionTemplate(async (ctx, { param, progressCb }) => {
    ctx.commit('merge', {
      [param.uuid]: {
        status: 'Migrating'
      }
    });
    let msg = await api.migrate(param, progressCb);
    return msg.inventory
  }),
  backup: batchActionTemplate(async (ctx, { param, progressCb }) => {
    if (ctx.state[param.uuid].type === 'Root') {
      await api.rootVolumeBackup(param.uuid, param.param, progressCb)
    } else {
      await api.dataVolumeBackup(param.uuid, param.param, progressCb)
    }
  }),
  createImage: async (ctx, { param, progressCb }) => {
    // let jobUuid = param.jobUuid
    // let msg = {
    //   name: param.name,
    //   description: param.description,
    //   backupStorageUuids: param.backupStorageUuids,
    //   volumeUuid: param.volumeUuid,
    //   resourceUuid: jobUuid,
    //   format: 'qcow2'
    // }
    // if (param.platform) {
    //   msg.platform = param.platform
    // }
    // let volumeType = param.volumeType.toLowerCase()
    // msg.mediaType = volumeType === 'root' ? 'RootVolumeTemplate' : 'DataVolumeTemplate'
    if (param.param.mediaType === 'RootVolumeTemplate' && param.param.isSystem) {
      // param.rootVolumeUuid = param.volumeUuid
      // await api.createRootVolumeTemplate(param.param, progressCb, param.jobUuid)
      await longjobApi.call('APICreateRootVolumeTemplateFromRootVolumeMsg', param.param, progressCb, param.jobUuid)
    } else {
      // await api.createDataVolumeTemplate(param.param, progressCb, param.jobUuid)
      await longjobApi.call('APICreateDataVolumeTemplateFromVolumeMsg', param.param, progressCb, param.jobUuid)
    }
  },
  createSnapshot: async (ctx, { param, progressCb }) => {
    return await api.createSnapshot(param.uuid, param.param, progressCb)
  },
  setQos: batchActionTemplate(async (ctx, { param, progressCb }) => {
    // if (param.bandWidth === 0) {
    //   return api.removeQos(param.uuid, progressCb)
    // }
    await api.setQos(param.uuid, param.volumeBandwidth, param.mode, progressCb);
    return {
      uuid: param.uuid,
      volumeBandwidth: param.volumeBandwidth,
      mode: param.mode
    }
  }),
  removeQos: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param.uuid;
    let mode = param.mode;
    await api.removeQos(uuid, mode, progressCb);
    return {
      uuid,
      volumeBandwidth: -1
    }
  }),
  storageMigrate: async (ctx, { param, progressCb }) => {
    await longjobApi.call('APIPrimaryStorageMigrateVolumeMsg', param.param, progressCb, param.jobUuid)
  },
  create: async ({ commit, state, rootState }, { param, progressCb }) => {
    let msg = helper.buildCreateParam(param, rootState);
    let createPath;
    if (param.diskOfferingUuid) {
      createPath = 'volumes/data'
    }
    if (param.volumeImageUuid) {
      createPath = `volumes/data/from/data-volume-templates/${param.volumeImageUuid}`
    }
    let resp;
    resp = await rpc.create(createPath, msg, progressCb);
    commit('merge', {
      [resp.inventory.uuid]: resp.inventory
    });
    return resp.inventory
  },
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    await api.delete(uuid, progressCb);
    ctx.commit('delete', uuid)
  }),
  refreshActualSize: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let msg = await api.refreshActualSize(uuid, progressCb);
    return msg.inventory
  }),
  changeOwner: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await accountResourceApi.changeOwner(param.uuid, param.accountUuid, progressCb);
    let obj = {
      uuid: param.uuid
    };
    obj.accountUuid = param.accountUuid;
    return obj
  }),
  recover: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let msg = await api.recover(uuid, progressCb);
    return msg.inventory
  }),
  expunge: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    await api.expunge(uuid, progressCb);
    ctx.commit('delete', uuid)
    // return msg.inventory
  }),
  resize: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.resize(param.uuid, param.size, progressCb);
    return resp.inventory
  }),
  setVirtioSCSI: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let systemTagBody = {
      resourceUuid: uuid,
      tag: 'capability::virtio-scsi',
      resourceType: 'VolumeVO'
    };
    await systemTagApi.create(systemTagBody, progressCb);
    return {
      uuid: uuid,
      systemTagsVirtioSCSI: true
    }
  }),
  removeVirtioSCSI: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let systemTag = await systemTagApi.query([`resourceUuid=${uuid}`, 'tag=capability::virtio-scsi']);
    await systemTagApi._delete(systemTag.inventories[0].uuid, progressCb);
    return {
      uuid: uuid,
      systemTagsVirtioSCSI: false
    }
  }),
  resizeRoot: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.resizeRoot(param.uuid, param.size, progressCb);
    return resp.inventory
  })
}

