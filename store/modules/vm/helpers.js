import _ from 'lodash'
import rpc from 'src/utils/rpc'
import api from './apis'
import psApi from '../primaryStorage/api'
import batchQueryApi from '../batchQuery/apis'
import Utils from '../../utils'
import GlobalUtils from 'src/utils/utils'
import taskProgressHelper from '../taskProgress/helpers'
import tagPartialHelper from '../tag/partialHelperForResource'

export default {
  ...tagPartialHelper,
  addAttr (vmList) {
    vmList.forEach(vm => {
      vm.pciDeviceUuidList = []
      vm.usbDeviceUuidList = []
      vm.myUserTagUuidList = []
      vm.otherUserTagUuidList = []
    })
  },
  async queryHost (uuidList, commit) {
    let resp = await rpc.query('hosts', {q: `uuid?=${uuidList}`})
    commit('mergeDbTable', {tableName: 'host', list: resp.inventories}, { root: true })
  },
  async queryCluster (uuidList, commit) {
    let resp = await rpc.query('clusters', {q: `uuid?=${uuidList}`})
    commit('mergeDbTable', {tableName: 'cluster', list: resp.inventories}, { root: true })
  },
  async queryPrimaryStorage (vmArray, commit) {
    let pirmaryStorageUuidList = []
    vmArray.forEach(vm => {
      if (!vm.allVolumes || vm.allVolumes.length <= 0) return
      let volume = _.find(vm.allVolumes, volume => volume.uuid === vm.rootVolumeUuid)
      // when vm is just created, no root volume
      if (volume) {
        pirmaryStorageUuidList.push(volume.primaryStorageUuid)
      }
    })
    pirmaryStorageUuidList = _.uniq(pirmaryStorageUuidList)
    let resp = await rpc.query('primary-storage', {q: `uuid?=${pirmaryStorageUuidList}`})
    commit('mergeDbTable', {tableName: 'primarystorage', list: resp.inventories}, { root: true })
  },
  async queryVolume (vmArray, commit, dispatch) {
    let volumeUuidList = []
    vmArray.forEach(vm => {
      volumeUuidList.push(vm.rootVolumeUuid)
      if (vm.allVolumes && vm.allVolumes.length > 0) {
        volumeUuidList = volumeUuidList.concat(vm.allVolumes.map(volume => volume.uuid))
      }
    })
    volumeUuidList = _.uniq(volumeUuidList)
    dispatch('volume/batchQuery', {q: `uuid?=${volumeUuidList.join(',')}`}, { root: true })
  },
  async queryLegacyUserTag (param, commit) {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    let resp = await rpc.query('user-tags', {
      q: ['resourceType=VmInstanceVO', `resourceUuid?=${uuidList.join(',')}`]
    })
    let list = resp.inventories
    let vmMap = {}
    list.forEach(it => {
      if (!vmMap[it.resourceUuid]) {
        vmMap[it.resourceUuid] = {
          uuid: it.resourceUuid,
          userTagList: []
        }
      }
      vmMap[it.resourceUuid].userTagList.push(it)
    })
    commit('merge', vmMap)
  },
  async queryCDRom (uuidList, commit) {
    let resp = await rpc.query('vm-instances/cdroms', {q: `vmInstance.uuid?=${uuidList}`})
    let cdRomArr = resp.inventories
    let vmMap = {}
    uuidList.forEach(uuid => {
      let cdRomList = cdRomArr.filter(cdRom => cdRom.vmInstanceUuid === uuid)
      vmMap[uuid] = {
        'cdRom': _.keyBy(cdRomList, 'uuid') || {},
        'isoUuids': cdRomList.filter(v => v.isoUuid).map(v => v.isoUuid) || []
      }
    })
    commit('merge', vmMap)
  },
  async queryCDRomLimit (uuidList, commit) {
    let resp = await rpc.query('global-configurations', {q: ['category=vm', 'name=maximumCdRomNum']})
    let { value: cdromLimit } = resp.inventories[0] ? resp.inventories[0] : []
    uuidList = _.isArray(uuidList) ? uuidList : [uuidList]
    let vmMap = {}
    uuidList.forEach(uuid => {
      vmMap[uuid] = { cdromLimit: Number(cdromLimit) }
    })
    commit('merge', vmMap)
  },
  async querySystemTag (uuidList, commit) {
    let resp = await rpc.query('system-tags', {q: `resourceUuid?=${uuidList.join(',')}`})
    let systemTagArray = resp.inventories
    let vmMap = {}
    uuidList.forEach(uuid => {
      let stMap = { uuid }
      let stList = systemTagArray.filter(st => st.resourceUuid === uuid)
      stList.forEach(st => {
        if (_.startsWith(st.tag, 'iso::')) {
          if (!stMap.isoList) stMap.isoList = []
          let chunks = st.tag.split('::')
          stMap.isoList.push({
            uuid: chunks[1],
            index: parseInt(chunks[2])
          })
        } else if (_.startsWith(st.tag, 'bootOrder::')) {
          stMap.bootOrder = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'cdromBootOnce::')) {
          stMap.cdromBootOnce = st.tag.split('::')[1] === 'true'
        } else if (_.startsWith(st.tag, 'ha::')) {
          stMap.ha = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'sshkey::')) {
          stMap.sshkey = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'consolePassword::')) {
          stMap.consolePassword = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'vmConsoleMode::')) {
          stMap.vmConsoleMode = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'bootMode::')) {
          stMap.bootMode = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'RDPEnable::')) {
          stMap.RDPEnable = st.tag.split('::')[1] === 'true'
        } else if (_.startsWith(st.tag, 'usbRedirect::')) {
          stMap.usbRedirect = st.tag.split('::')[1] === 'true'
        } else if (_.startsWith(st.tag, 'VDIMonitorNumber::')) {
          stMap.VDIMonitorNumber = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'userdata::')) {
          stMap.userdata = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'qemuga')) {
          stMap.qemuga = true
        } else if (_.startsWith(st.tag, 'vmCpuPinning')) {
          stMap.vmCpuPinning = st.tag.split('::')[1]
        } else if (_.startsWith(st.tag, 'cleanTraffic')) {
          stMap.antiSpoofing = st.tag.split('::')[1] === 'true'
        } else if (_.startsWith(st.tag, 'affinityGroupUuid')) {
          stMap.affinityGroupUuid = st.tag.split('::')[1]
        }
      })
      vmMap[uuid] = stMap
    })
    // return vmMap
    commit('merge', vmMap)
  },
  async queryAttachedShareableVolume (uuidList, commit, dispatch) {
    let resp = await rpc.query('volumes/vm-instances/refs', {
      q: `vmInstanceUuid?=${uuidList.join(',')}`
    })
    let vmMap = {}
    let volumeUuidList = []
    resp.inventories.forEach(it => {
      if (!vmMap[it.vmInstanceUuid]) {
        vmMap[it.vmInstanceUuid] = {
          uuid: it.vmInstanceUuid,
          shareableVolumeUuidList: []
        }
      }
      vmMap[it.vmInstanceUuid].shareableVolumeUuidList.push(it.volumeUuid)
      volumeUuidList.push(it.volumeUuid)
    })
    uuidList.forEach(vmUuid => {
      if (!_.has(vmMap, vmUuid)) {
        vmMap[vmUuid] = {
          uuid: vmUuid,
          shareableVolumeUuidList: []
        }
      }
    })
    commit('merge', vmMap)
    // cost too much, so comment it out
    // dispatch('volume/batchQuery', {q: `uuid?=${volumeUuidList.join(',')}`}, {root: true})
  },
  async queryAffinityGroup (uuidList, commit) {
    // affinity group is a spectial system tag.
    // user should not see the ag belong to others
    let resp = await rpc.query('system-tags', {
      q: [
        `resourceUuid?=${uuidList.join(',')}`,
        'tag~=affinityGroupUuid::%25'
      ]
    })
    let vmMap = []
    let affinityGroupUuidList = []
    resp.inventories.forEach(it => {
      let affinityGroupUuid = it.tag.split('::')[1]
      vmMap[it.resourceUuid] = {
        uuid: it.resourceUuid,
        affinityGroupUuid
      }
      affinityGroupUuidList.push(affinityGroupUuid)
    })
    // filter out affinity group belong to others
    resp = await rpc.query('affinity-groups', {
      q: `uuid?=${affinityGroupUuidList.join(',')}`
    })
    commit('mergeDbTable', { tableName: 'affinitygroup', list: resp.inventories }, { root: true })
    let availableAffinityGroupUuidList = resp.inventories.map(it => it.uuid)
    _.keys(vmMap).forEach(uuid => {
      if (!_.includes(availableAffinityGroupUuidList, vmMap[uuid].affinityGroupUuid)) {
        delete vmMap[uuid]
      }
    })
    commit('merge', vmMap)
  },
  async queryPciDevice (uuidList, commit) {
    let resp = await rpc.query('pci-device/pci-devices', {
      q: `vmInstanceUuid?=${uuidList.join(',')}`
    })
    let list = resp.inventories
    commit('mergeDbTable', { tableName: 'pciDevice', list }, { root: true })
    let vmMap = {}
    list.forEach(it => {
      if (!vmMap[it.vmInstanceUuid]) {
        vmMap[it.vmInstanceUuid] = {
          uuid: it.vmInstanceUuid,
          pciDeviceUuidList: []
        }
      }
      vmMap[it.vmInstanceUuid].pciDeviceUuidList.push(it.uuid)
    })
    commit('merge', vmMap)
  },
  async queryUsbDevice (uuidList, commit) {
    let resp = await rpc.query('usb-device/usb-devices', {
      q: `vmInstanceUuid?=${uuidList}`
    })
    let list = resp.inventories
    commit('mergeDbTable', { tableName: 'usbdevice', list }, { root: true })
    let vmMap = {}
    list.forEach(it => {
      if (!vmMap[it.vmInstanceUuid]) {
        vmMap[it.vmInstanceUuid] = {
          uuid: it.vmInstanceUuid,
          usbDeviceUuidList: []
        }
      }
      vmMap[it.vmInstanceUuid].usbDeviceUuidList.push(it.uuid)
    })
    commit('merge', vmMap)
  },
  buildGetVmCapabilitiesScript (uuidList) {
    let script = `
def uuidList = [${uuidList.map(uuid => `"${uuid}"`).join(',')}]
def VmList = []
uuidList.each { uuid ->
  def tmp = [:]
  tmp["uuid"] = uuid
  tmp["capabilities"] = call("org.zstack.header.vm.APIGetVmCapabilitiesMsg", '{"uuid": ' + uuid +'}').result.capabilities
  VmList.push(tmp)
}
put("result", VmList)
`
    return script
  },
  async queryVmCapabilities (uuidList, commit) {
    let script = this.buildGetVmCapabilitiesScript(uuidList)
    let resp = await batchQueryApi.query(script)
    let vmArray = resp.result
    commit('merge', Utils.arrayToDict(vmArray))
  },
  getPrimaryStorageType (vm, psTable, isAdmin) {
    let rootVolume = _.find(vm.allVolumes, volume => volume.uuid === vm.rootVolumeUuid)
    if (!rootVolume) return ''
    return _.get(psTable, `${rootVolume.primaryStorageUuid}.type`)
  },
  async normalQuery (param) {
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      vmArray: resp.inventories,
      total: resp.total
    }
  },
  async hostIpQuery (param, hostIpCondition) {
    let realConditionList = _.filter(param.q, it => !_.startsWith(it, 'host.managementIp'))
    let hostIp = decodeURI(hostIpCondition.substring('host.managementIp='.length + 1))
    let zqlConditions = GlobalUtils.translateConditions(realConditionList)
    let zql = `
query vminstance where ${zqlConditions} and (
  hostUuid in ( query host.uuid where managementIp like '${hostIp}' )
  or
  rootVolumeUuid in (
    query localStorageResourceRef.resourceUuid where hostUuid in (
      query host.uuid where managementIp like '${hostIp}'
    )
  )
)
return with (total)
`
    if (param.sortBy && param.sortDirection && param.limit && param.start !== undefined) { // update count
      zql = zql + `order by ${param.sortBy} ${GlobalUtils.getLiteralDirection(param.sortDirection)} limit ${param.limit} offset ${param.start}`
    }
    let resp = await rpc.query('zql', {
      zql: encodeURIComponent(zql)
    })
    return {
      vmArray: resp.results[0].inventories,
      total: resp.results[0].total
    }
  },
  async ownerQuery (param, ownerNameCondition) {
    // exclude owner.name
    let realConditionList = _.filter(param.q, it => !_.startsWith(it, 'owner.name'))
    let ownerName = decodeURI(ownerNameCondition.substring('owner.name='.length + 1))
    let zqlConditions = GlobalUtils.translateConditions(realConditionList)
    let zql = `
query vminstance where ${zqlConditions} and (
  uuid in ( query AccountResourceRef.resourceUuid where accountUuid in (
    query account.uuid where name like '${ownerName}')
  ) or
  uuid in ( query AccountResourceRef.resourceUuid where accountUuid in (
    query IAM2Project.uuid where name like '${ownerName}')
  )
)
return with (total)
`
    if (param.sortBy && param.sortDirection && param.limit && param.start !== undefined) { // update count
      zql = zql + `order by ${param.sortBy} ${GlobalUtils.getLiteralDirection(param.sortDirection)} limit ${param.limit} offset ${param.start}`
    }
    let resp = await rpc.query('zql', {
      zql: encodeURIComponent(zql)
    })
    return {
      vmArray: resp.results[0].inventories,
      total: resp.results[0].total
    }
  },
  async getHostUuidForLocalStorage (vmArray) {
    let rootVolumeUuidList = vmArray.filter(vm => vm.state === 'Stopped').map(vm => vm.rootVolumeUuid)
    let localStorageResourceRefResp = await psApi.queryLocalStorageResourceRef({
      q: [
        `resourceUuid?=${rootVolumeUuidList.join(',')}`,
        'resourceType=VolumeVO'
      ]
    })
    let localStorageResourceRefList = localStorageResourceRefResp.inventories
    localStorageResourceRefList.forEach(ref => {
      vmArray.forEach(vm => {
        if (vm.rootVolumeUuid === ref.resourceUuid) {
          vm.hostUuid = ref.hostUuid
        }
      })
    })
    return vmArray
  },
  async queryResourceOwner (vmUuidList, commit, rpc, rootState) {
    let resourceProjectMap = await Utils.getResourceOwner(vmUuidList, commit, rpc, rootState);
    commit('merge', resourceProjectMap)
  },
  async getVmConsoleAddress (uuid, commit) {
    let resp = await rpc.query(`vm-instances/${uuid}/console-addresses`, {
      q: [`uuid=${uuid}`]
    })
    commit('merge', {
      [uuid]: {
        uuid,
        consoleAddress: `${resp.protocol}://${resp.hostIp}:${resp.port}`
      }
    })
  },
  queryInstanceOffering (param, rootState, dispatch) {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    let instanceOfferingUuidList = uuidList.filter(uuid => {
      if (rootState.vm[uuid] && rootState.vm[uuid].instanceOfferingUuid) {
        return rootState.vm[uuid].instanceOfferingUuid
      }
    }).map(uuid => {
      if (rootState.vm[uuid] && rootState.vm[uuid].instanceOfferingUuid) {
        return rootState.vm[uuid].instanceOfferingUuid
      }
    })
    return dispatch('instanceOffering/batchQuery', instanceOfferingUuidList, { root: true })
  },
  async queryImage (param, rootState, commit) {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    let imageUuidList = []
    uuidList.forEach(uuid => {
      imageUuidList.push(rootState.vm[uuid].imageUuid)
      if (rootState.vm[uuid].isoUuids) {
        imageUuidList = imageUuidList.concat(rootState.vm[uuid].isoUuids)
      }
    })
    let resp = await rpc.query('images', {
      q: `uuid?=${imageUuidList}`
    })
    let list = resp.inventories
    commit('mergeDbTable', {tableName: 'image', list}, { root: true })
  },
  async queryEip (uuid, commit) {
    let resp = await rpc.query('eips', {
      q: [`vmNic.vmInstanceUuid=${uuid}`]
    })
    let list = resp.inventories
    commit('mergeDbTable', {tableName: 'eip', list}, { root: true })
    commit('merge', {
      [uuid]: {
        uuid,
        eipUuidList: list.map(it => it.uuid)
      }
    })
  },
  async querySecurityGroup (uuid, commit) {
    let resp = await rpc.query('security-groups', {
      q: [`vmNic.vmInstanceUuid=${uuid}`]
    })
    let list = resp.inventories
    commit('mergeDbTable', {tableName: 'securitygroup', list}, { root: true })
    commit('merge', {
      [uuid]: {
        uuid,
        securityGroupUuidList: list.map(it => it.uuid)
      }
    })
  },
  async queryLoadBalancer (uuid, commit) {
    let resp = await rpc.query('load-balancers', {
      q: [`listeners.vmNic.vmInstanceUuid=${uuid}`]
    })
    let list = resp.inventories
    commit('mergeDbTable', {tableName: 'loadBalancer', list}, { root: true })
    commit('merge', {
      [uuid]: {
        uuid,
        loadBalancerUuidList: list.map(it => it.uuid)
      }
    })
  },
  async queryPortForwardingRule (uuid, commit) {
    let resp = await rpc.query('port-forwarding', {
      q: [`vmNic.vmInstanceUuid=${uuid}`]
    })
    let list = resp.inventories
    commit('mergeDbTable', {tableName: 'portforwarding', list}, { root: true })
    commit('merge', {
      [uuid]: {
        uuid,
        portForwardingUuidList: list.map(it => it.uuid)
      }
    })
  },
  startGetProgress (vmUuid, jobUuid, commit) {
    setTimeout(function () {
      commit('timerService/merge', {
        [jobUuid]: {
          uuid: jobUuid,
          fn: () => {
            taskProgressHelper.query(jobUuid)
              .then(progress => {
                if (progress === 100) {
                  commit('timerService/delete', jobUuid, { root: true })
                  commit('merge', {
                    [vmUuid]: {
                      progress: null
                    }
                  })
                } else {
                  commit('merge', {
                    [vmUuid]: {
                      progress
                    }
                  })
                }
              })
          }
        }
      }, { root: true })
    }, 0)
  }
//   async queryHostIpForLocalStorageRootVolume (vmUuidList, commit) {
//     let zqlLocalStorageResourceRef = `
// query localStorageResourceRef.hostUuid where resourceUuid in (
//   query volume.uuid where uuid in (
//     query vminstance.rootVolumeUuid where uuid in (
//       '${vmUuidList.join('\',\'')}'
//     )
//   ) and
//   primaryStorageUuid in (
//     query primaryStorage.uuid where type='LocalStorage'
//   )
// )`
//     let localStorageResourceRefResp = await rpc.query('zql', {
//       zql: encodeURIComponent(zqlLocalStorageResourceRef)
//     })
//   }
}
