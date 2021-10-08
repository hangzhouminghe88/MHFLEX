// import rpc from 'src/utils/rpc'
import _ from 'lodash'
// import { arrayToDict, mergeMap, createQueryTemplate, createBatchQueryTemplate, createActionTemplate, createBatchActionTemplate, getResourceOwner } from '../../utils'
import Utils from '../../utils'
import helper from './helpers'
import api from './apis'
// import batchQueryApi from '../batchQuery/apis'
import accountResourceApi from '../accountResource/apis'
import longjobApi from '../longjob/apis'
import systemTagApi from '../systemTag/apis'
import systemTagHelper from '../systemTag/helpers'
import rpc from 'src/utils/rpc'

const tableName = 'vm'
// let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)
// let actionTempalate = Utils.createActionTemplate(tableName)
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)

export default {
  basicQuery: async ({ commit, dispatch, rootState }, param) => {
    // NOTICE: (xiang.gao)
    // The conditions for normal query and zql are different,
    // so I keep conditions for normal query to limit the change.
    // Later I will use zql to replace normal query.
    let ownerNameCondition = _.find(param.q, it => _.startsWith(it, 'owner.name'))
    let hostIpCondition = _.find(param.q, it => _.startsWith(it, 'host.managementIp'))
    let ret
    if (ownerNameCondition) {
      ret = await helper.ownerQuery(param, ownerNameCondition)
    } else if (hostIpCondition) {
      ret = await helper.hostIpQuery(param, hostIpCondition)
    } else {
      ret = await helper.normalQuery(param)
    }
    return ret
  },
  pureQuery: async ({ commit, dispatch, rootState }, param) => {
    let ret = await dispatch('basicQuery', param)
    let vmArray = ret.vmArray
    helper.addAttr(vmArray)
    let vmMap = Utils.arrayToDict(vmArray)
    let vmUuidList = vmArray.map(vm => vm.uuid)
    let tagRet = await helper.queryUserTag(vmUuidList, 'VmInstanceVO', commit)
    vmMap = Utils.mergeMap(vmMap, tagRet)
    commit('merge', vmMap)
    let list = _.values(vmMap)
    commit('mergeDbTable', {tableName, list}, { root: true })
    return {
      uuidList: vmArray.map(vm => vm.uuid)
    }
  },
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await dispatch('basicQuery', param)
    let vmArray = ret.vmArray
    helper.addAttr(vmArray)
    let vmMap = Utils.arrayToDict(vmArray)
    let total = ret.total
    let vmUuidList = vmArray.map(vm => vm.uuid)
    let tagRet = await helper.queryUserTag(vmUuidList, 'VmInstanceVO', commit)
    vmMap = Utils.mergeMap(vmMap, tagRet)
    dispatch('queryRelatedData', vmArray)
    return {
      total,
      inventories: vmMap
    }
  }),
  attachIPV6Network: ({ commit, dispatch, rootState }, param) => {
    let vmInventory = param.inventory
    let vmNicConfig = param.vmNicConfig
    vmInventory.vmNics.forEach((vmNic) => {
      if (vmNicConfig[vmNic.l3NetworkUuid]) {
        let param = vmNicConfig[vmNic.l3NetworkUuid].ipv6StaticIP ? {
          params: {
            staticIp: vmNicConfig[vmNic.l3NetworkUuid].ipv6StaticIP
          }
        } : {}
        rpc.post(`nics/${vmNic.uuid}/l3-networks/${vmNicConfig[vmNic.l3NetworkUuid].ipv6NetworkUuid}`, param)
      }
    })
  },
  queryRelatedDataForCsv: ({ commit, dispatch, rootState }, param) => {
    let vmArray
    if (!_.isArray(param)) {
      vmArray = [param]
    } else {
      vmArray = param
    }
    if (vmArray.length <= 0) return
    let vmUuidList = vmArray.map(vm => vm.uuid)
    let tasks = []
    tasks.push(
      helper.queryResourceOwner(vmUuidList, commit, rpc, rootState)
    )
    if (rootState.db.common.isAdmin) {
      tasks.push(
        helper.getHostUuidForLocalStorage(vmArray)
        .then(vmArray => {
          let hostUuidOnlyVmArray = vmArray.map(vm => {
            return {
              uuid: vm.uuid,
              hostUuid: vm.hostUuid
            }
          })
          commit('merge', Utils.arrayToDict(hostUuidOnlyVmArray))
          let hostUuidList = _.uniq(_.map(vmArray, vm => vm.hostUuid))
          return helper.queryHost(hostUuidList, commit)
        })
      )
    }

    if (rootState.db.common.isAdmin) {
      let clusterUuidList = _.uniq(_.map(vmArray, vm => vm.clusterUuid))
      tasks.push(
        helper.queryCluster(clusterUuidList, commit)
      )
    }
    return Promise.all(tasks)
  },
  queryCDRom: ({ commit }, param) => {
    let vmArray
    if (!_.isArray(param)) {
      vmArray = [param]
    } else {
      vmArray = param
    }
    if (vmArray.length <= 0) return
    return helper.queryCDRom(vmArray, commit)
  },
  queryRelatedData: ({ commit, dispatch, rootState }, param) => {
    let vmArray
    if (!_.isArray(param)) {
      vmArray = [param]
    } else {
      vmArray = param
    }
    if (vmArray.length <= 0) return
    let vmUuidList = vmArray.map(vm => vm.uuid)
    let tasks = []
    tasks.push(
      helper.queryResourceOwner(vmUuidList, commit, rpc, rootState)
    )
    tasks.push(
      helper.queryVmCapabilities(vmUuidList, commit)
    )
    if (rootState.db.common.isAdmin) {
      tasks.push(
        helper.getHostUuidForLocalStorage(vmArray)
        .then(vmArray => {
          let hostUuidOnlyVmArray = vmArray.map(vm => {
            return {
              uuid: vm.uuid,
              hostUuid: vm.hostUuid
            }
          })
          commit('merge', Utils.arrayToDict(hostUuidOnlyVmArray))
          let list = _.values(hostUuidOnlyVmArray)
          commit('mergeDbTable', {tableName, list}, { root: true })
          let hostUuidList = _.uniq(_.map(vmArray, vm => vm.hostUuid))
          return helper.queryHost(hostUuidList, commit)
        })
      )
    }

    // query related resources
    tasks.push(
      helper.querySystemTag(vmUuidList, commit)
    )
    tasks.push(
      helper.queryCDRom(vmUuidList, commit)
    )
    tasks.push(
      helper.queryCDRomLimit(vmUuidList, commit)
    )
    tasks.push(
      helper.queryPrimaryStorage(vmArray, commit)
    )

    tasks.push(
      helper.queryVolume(vmArray, commit, dispatch)
    )
    if (rootState.db.common.isAdmin) {
      let clusterUuidList = _.uniq(_.map(vmArray, vm => vm.clusterUuid))
      tasks.push(
        helper.queryCluster(clusterUuidList, commit)
      )
    }
    return Promise.all(tasks)
  },
  detailQuery: async ({ commit, dispatch, rootState }, param) => {
    let uuid = param
    // helper.queryUserTag(uuid, 'VmInstanceVO', commit)
    // .then((result) => {
    //   commit('merge', result)
    // })
    let ret = await dispatch('basicQuery', { q: [`uuid=${uuid}`] })
    let vmArray = ret.vmArray
    helper.addAttr(vmArray)
    let vmMap = Utils.arrayToDict(vmArray)
    // let total = ret.total
    let vmUuidList = vmArray.map(vm => vm.uuid)
    let tagRet = await helper.queryUserTag(vmUuidList, 'VmInstanceVO', commit)
    vmMap = Utils.mergeMap(vmMap, tagRet)
    commit('merge', vmMap)

    helper.queryLegacyUserTag(uuid, commit)
    if (rootState.vm[uuid] && rootState.vm[uuid].state === 'Running') {
      helper.getVmConsoleAddress(uuid, commit)
    }
    helper.queryInstanceOffering([uuid], rootState, dispatch)
    // queryImage needs isoList, so call querySystemTag to guarantee this
    helper.querySystemTag([uuid], commit)
    .then(() => {
      helper.queryImage(uuid, rootState, commit)
    })
    helper.queryCDRomLimit(uuid, commit)
    helper.queryEip(uuid, commit)
    helper.querySecurityGroup(uuid, commit)
    helper.queryLoadBalancer(uuid, commit)
    helper.queryPortForwardingRule(uuid, commit)
  },
  getExtraData: async ({ commit, dispatch, rootState }, param) => {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    if (uuidList.length <= 0) return
    helper.queryVmCapabilities(uuidList, commit)
    helper.queryAffinityGroup(uuidList, commit)
    helper.queryCDRom(uuidList, commit)
    helper.queryAttachedShareableVolume(uuidList, commit, dispatch)
    if (!rootState.db.common.isOpensource) {
      helper.queryPciDevice(uuidList, commit)
      if (rootState.db.common.isAdmin) {
        helper.queryUsbDevice(uuidList, commit)
      }
    }
  },
  queryVmCapabilities: async ({ commit, dispatch, rootState }, param) => {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    helper.queryVmCapabilities(uuidList, commit)
  },
  create: async ({ commit, dispatch, rootState }, param) => {
    let progressCb = param.progressCb
    let count = param.count
    let event = param.event
    let tasks = []
    for (let i = 0; i < count; i++) {
      let createParam = _.cloneDeep(param.createParam)
      // createParam.l3NetworkUuids.forEach((uuid) => {
      //   if (createParam.staticIp && createParam.staticIp[uuid]) {
      //     let eachByteOfIp = createParam.staticIp[uuid].split('.')
      //     eachByteOfIp[3] = (parseInt(eachByteOfIp[3]) + i).toString()
      //     let tmpIp = eachByteOfIp.join('.')
      //     createParam.systemTags.push(`staticIp::${uuid}::${tmpIp}`)
      //   }
      //   if (createParam.customMac && createParam.customMac[uuid]) {
      //     createParam.systemTags.push(`customMac::${uuid}::${createParam.customMac[uuid]}`)
      //   }
      // })
      createParam.l3NetworkUuids.forEach((uuid) => {
        if (createParam.staticIp && createParam.staticIp[uuid]) {
          let isIPv6 = createParam.staticIp[uuid].indexOf(':') > -1
          let eachByteOfIp
          let tmpIp
          if (isIPv6) {
            eachByteOfIp = createParam.staticIp[uuid].split(':')
            eachByteOfIp[eachByteOfIp.length - 1] = (parseInt(eachByteOfIp[eachByteOfIp.length - 1], 16) + i).toString(16)
            tmpIp = eachByteOfIp.join(':')
          } else {
            eachByteOfIp = createParam.staticIp[uuid].split('.')
            eachByteOfIp[3] = (parseInt(eachByteOfIp[3]) + i).toString()
            tmpIp = eachByteOfIp.join('.')
          }
          tmpIp = _.replace(tmpIp, '::', '--')
          createParam.systemTags.push(`staticIp::${uuid}::${tmpIp}`)
        }
        if (createParam.customMac && createParam.customMac[uuid]) {
          createParam.systemTags.push(`customMac::${uuid}::${createParam.customMac[uuid]}`)
        }
      })
      if (createParam.vmNicConfig) {
        _.forIn(createParam.vmNicConfig, (value, key) => {
          if (value.ipv6StaticIP) {
            let eachByteOfIp = value.ipv6StaticIP.split(':')
            eachByteOfIp[eachByteOfIp.length - 1] = (parseInt(eachByteOfIp[eachByteOfIp.length - 1], 16) + i).toString(16)
            let tmpIp = eachByteOfIp.join(':')
            createParam.vmNicConfig[key].ipv6StaticIP = tmpIp
          }
          if (value.ipv4StaticIP) {
            let eachByteOfIp = value.ipv4StaticIP.split('.')
            eachByteOfIp[3] = (parseInt(eachByteOfIp[3]) + i).toString()
            let tmpIp = eachByteOfIp.join('.')
            createParam.vmNicConfig[key].ipv4StaticIP = tmpIp
          }
        })
      }
      if (createParam.consoleMode) {
        createParam.systemTags.push(`vmConsoleMode::${createParam.consoleMode}`)
      }
      if (createParam.vmMachineType) {
        createParam.systemTags.push(`vmMachineType::${createParam.vmMachineType}`)
      }
      createParam.systemTags.push(`cleanTraffic::${createParam.antiSpoofing}`)
      delete createParam.antiSpoofing
      delete createParam.consoleMode
      delete createParam.bootMode
      delete createParam.staticIp
      delete createParam.customMac

      if (count > 1) {
        createParam.name = `${param.createParam.name}-${i + 1}`
      }
      let p = rpc.create('vm-instances', createParam, event)
      tasks.push(p)
      p.then((resp) => {
        let inventory = resp.inventory
        commit('merge', {
          [inventory.uuid]: inventory
        })
        commit('mergeDbTable', {
          tableName: 'vm',
          list: [inventory]
        }, { root: true })
        // dispatch('queryRelatedData', [inventory])
        if (createParam.vmNicConfig) dispatch('attachIPV6Network', { inventory, vmNicConfig: createParam.vmNicConfig })
        progressCb({
          inventory,
          success: true
        })
      }, () => {
        progressCb({
          success: false
        })
      })
    }
    return Promise.all(tasks)
  },
  reboot: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    ctx.commit('merge', {
      [uuid]: {
        state: 'Rebooting'
      }
    })
    let resp = await api.reboot(uuid, progressCb)
    return resp.inventory
  }),
  pause: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let resp = await api.pause(uuid, progressCb)
    return resp.inventory
  }),
  resume: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let resp = await api.resume(uuid, progressCb)
    return resp.inventory
  }),
  powerOff: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.powerOff(param.uuid, param.stopHa, progressCb)
    return resp.inventory
  }),
  openConsole: async (ctx, { param, progressCb }) => {
    let uuid = param
    let resp = await api.openConsole(uuid, progressCb)
    return resp.inventory
  },
  clone: async (ctx, param) => {
    let resp = await api.clone(param.uuid, param.param, param.event)
    return resp.result
  },
  attachIso: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.attachIso(param.uuid, param.vmUuid, param.cdromUuid, progressCb)
    let systemTagResp = await systemTagApi.get([param.vmUuid])
    let systemTagMap = systemTagHelper.normalizeResp(systemTagResp.inventories)
    let vmObj = systemTagMap[param.vmUuid]
    ctx.dispatch('vm/queryCDRom', param.vmUuid, { root: true })
    vmObj.uuid = param.vmUuid
    return vmObj
  }),
  detachIso: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.detachIso(param.uuid, param.vmUuid, progressCb)
    let systemTagResp = await systemTagApi.get([param.vmUuid])
    let systemTagMap = systemTagHelper.normalizeResp(systemTagResp.inventories)
    let vmObj = systemTagMap[param.vmUuid]
    ctx.dispatch('vm/queryCDRom', param.vmUuid, { root: true })
    vmObj.uuid = param.vmUuid
    return vmObj
  }),
  setVmSshKey: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setVmSshKey(param.uuid, param.sshKey, progressCb)
    return {
      uuid: param.uuid,
      sshkey: param.sshKey
    }
  }),
  deleteVmSshKey: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.deleteVmSshKey(param.uuid, progressCb)
    return {
      uuid: param.uuid,
      sshkey: ''
    }
  }),
  setHa: batchActionTemplate(async (ctx, { param, progressCb }) => {
    if (param.level === 'None') {
      await api.deleteHa(param.uuid, param.level, progressCb)
    } else {
      await api.setHa(param.uuid, param.level, progressCb)
    }
    return {
      uuid: param.uuid,
      ha: param.level
    }
  }),
  setVmBootOrder: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setVmBootOrder(param.uuid, param.bootOrder, param.cdromBootOnce, progressCb)
    helper.querySystemTag([param.uuid], ctx.commit)
  }),
  setConsolePassword: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setConsolePassword(param.uuid, param.password, progressCb)
    return {
      uuid: param.uuid,
      consolePassword: param.password
    }
  }),
  reimage: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.reimage(param.uuid, progressCb)
  }),
  setRdpMode: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setRdpMode(param.uuid, param.enable, progressCb)
    return {
      uuid: param.uuid,
      RDPEnable: param.enable
    }
  }),
  setVmAntiSpoofing: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setVmCleanTraffic(param.uuid, param.enable, progressCb)
    return {
      uuid: param.uuid,
      antiSpoofing: param.enable
    }
  }),
  setVmPassword: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setVmPassword(param.uuid, param.account, param.password, progressCb)
  }),
  setConsoleMode: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setConsoleMode(param.uuid, param.mode, progressCb)
    return {
      uuid: param.uuid,
      vmConsoleMode: param.mode
    }
  }),
  setBootMode: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setBootMode(param.uuid, param.mode, progressCb)
    return {
      uuid: param.uuid,
      bootMode: param.mode
    }
  }),
  addVmToAffinityGroup: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.addVmToAffinityGroup(param.uuid, param.affinityGroupUuid, progressCb)
    return {
      uuid: param.uuid,
      affinityGroupUuid: param.affinityGroupUuid
    }
  }),
  changeInstanceOffering: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.changeInstanceOffering(param.uuid, param.instanceOfferingUuid, progressCb)
    return resp.inventory
  }),
  startVmFromHost: batchActionTemplate(async (ctx, { param, progressCb }) => {
    ctx.commit('merge', {
      [param.uuid]: {
        state: 'Starting'
      }
    })
    let resp = await api.startVmFromHost(param.uuid, param.hostUuid, progressCb)
    return resp.inventory
  }),
  deleteConsolePassword: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.deleteConsolePassword(param.uuid, progressCb)
    return {
      uuid: param.uuid,
      consolePassword: null
    }
  }),
  changeOwner: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await accountResourceApi.changeOwner(param.uuid, param.accountUuid, progressCb)
    let obj = {
      uuid: param.uuid,
      ownerUuid: param.accountUuid
    }
    ctx.dispatch('query', param)
    return obj
  }),
  setUsbRedirect: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setUsbRedirect(param.uuid, param.enable, progressCb)
    return {
      uuid: param.uuid,
      usbRedirect: param.enable
    }
  }),
  resizeRootVolume: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.resizeRootVolume(param.volumeUuid, param.size, progressCb)
  }),
  removeVmFromAffinityGroup: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.removeVmFromAffinityGroup(param.uuid, param.affinityGroupUuid, progressCb)
    return {
      uuid: param.uuid,
      affinityGroupUuid: null
    }
  }),
  update: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param.param, progressCb)
    return resp.inventory
  }),
  setQga: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setQga(param.uuid, param.enable, progressCb)
    return {
      uuid: param.uuid,
      qemuga: param.enable
    }
  }),
  setVDIMonitorNumber: batchActionTemplate(async (ctx, { param, progressCb }) => {
    await api.setVDIMonitorNumber(param.uuid, param.monitorNumber, progressCb)
    return {
      uuid: param.uuid,
      VDIMonitorNumber: param.monitorNumber
    }
  }),
  createTag: async (ctx, { param, progressCb }) => {
    let resp = await api.createTag(param.uuid, param.tag, progressCb)
    let userTagList = []
    if (ctx.rootState.vm[param.uuid].userTagList) {
      userTagList = ctx.rootState.vm[param.uuid].userTagList
    }
    userTagList.push(resp.inventory)
    ctx.commit('merge', {
      [param.uuid]: {
        userTagList
      }
    })
  },
  deleteTag: async (ctx, { param, progressCb }) => {
    await api.deleteTag(param.tagUuid, progressCb)
    let userTagList = []
    if (ctx.rootState.vm[param.uuid].userTagList) {
      userTagList = ctx.rootState.vm[param.uuid].userTagList
    }

    userTagList = userTagList.filter(tag => tag.uuid !== param.tagUuid)
    ctx.commit('merge', {
      [param.uuid]: {
        userTagList
      }
    })
  },
  start: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let resp = await api.start(uuid, progressCb)
    return resp.inventory
  }),
  stop: batchActionTemplate(async (ctx, { param, progressCb }) => {
    ctx.commit('merge', {
      [param.uuid]: {
        state: 'Stopping'
      }
    })
    let resp = await api.stop(param.uuid, param.stopHa, progressCb)
    return resp.inventory
  }),
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    ctx.commit('merge', {
      [param]: {
        state: 'Deleting'
      }
    })
    let resp = await api.delete(uuid, progressCb)
    return resp.inventory
  }),
  recover: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = _.isObject(param) ? param.uuid : param
    let resp = await api.recover(uuid, progressCb)
    if (_.has(param, 'cb') && _.isFunction(param.cb)) param.cb(uuid)
    return resp.inventory
  }),
  expunge: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = _.isObject(param) ? param.uuid : param
    await api.expunge(uuid, progressCb)
    if (_.has(param, 'cb') && _.isFunction(param.cb)) param.cb(uuid)
    ctx.commit('delete', uuid)
  }),
  liveMigrate: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let vmUuid = param.uuid
    let hostUuid = param.hostUuid
    let jobUuid = Utils.genUniqueId()
    let oldState = ctx.state[vmUuid].state
    ctx.commit('merge', {
      [vmUuid]: {
        state: 'Migrating'
      }
    })
    let resp
    try {
      resp = await api.liveMigrate(vmUuid, hostUuid, progressCb, jobUuid)
    } catch (e) {
      ctx.commit('merge', {
        [vmUuid]: {
          state: oldState
        }
      })
    }
    return resp.inventory
  }),
  coldMigrate: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let vmUuid = param.uuid
    let rootVolumeUuid = ctx.rootState.vm[vmUuid].rootVolumeUuid
    let hostUuid = param.hostUuid
    let jobUuid = Utils.genUniqueId()
    helper.startGetProgress(vmUuid, jobUuid, ctx.commit)
    let oldState = ctx.state[vmUuid].state
    ctx.commit('merge', {
      [vmUuid]: {
        state: 'VolumeMigrating'
      }
    })
    try {
      await api.codeMigrate(rootVolumeUuid, hostUuid, progressCb, jobUuid)
    } catch (err) {
      ctx.commit('timerService/delete', jobUuid, { root: true })
      ctx.commit('merge', {
        [vmUuid]: {
          progress: null
        }
      })
    }
    return {
      uuid: vmUuid,
      state: oldState
    }
  }),
  storageMigrate: async (ctx, { param, progressCb }) => {
    let vmUuid = param.uuid
    ctx.commit('merge', {
      [vmUuid]: {
        state: 'VolumeMigrating'
      }
    })
    await longjobApi.call('APIPrimaryStorageMigrateVmMsg', param.param, progressCb, param.jobUuid)
    // longjob will update state when complete.
  },
  updateVmCpuPinning: async (ctx, { param }) => {
    let vmUuid = param.uuid
    let value = param.value
    ctx.commit('merge', {
      [vmUuid]: {
        vmCpuPinning: value
      }
    })
  }
}
