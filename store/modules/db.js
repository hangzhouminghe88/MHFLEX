import Vue from 'vue'
import * as types from '../mutation-types'
// import InstanceOfferingStore from '../InstanceOffering'
import _ from 'lodash'
import hybridTencentIdentityZone from "./hybridTencentIdentityZone";
// import { __printCallStack } from 'src/utils/utils'

// initial state
// shape: [{ id, quantity }]
const state = {
  affinitygroup: {},
  affinitygroupA: {},
  account: {},
  accountA: {},
  resourceOwner: {},
  resource: {},
  accountRef: {},
  backupTask: {},
  backupTaskA: {},
  backupData: {},
  backupDataA: {},
  volumeToBackup: {},
  backupstorage: {},
  backupstorageA: {},
  remoteBackupStorage: {},
  localBackupStorage: {},
  billing: {},
  cluster: {},
  clusterA: {},
  certificate: {},
  common: {},
  consoleproxy: {},
  eip: {},
  host: {},
  hostA: {},
  image: {},
  imageA: {},
  instanceOffering: {}, // leave this for legacy code.
  instanceOfferingA: {}, // leave this for legacy code.
  job: {},
  l2network: {},
  ipRange: {},
  l3network: {},
  l3networkA: {},
  loadBalancer: {},
  loadBalancerListener: {},
  networkServiceType: {},
  notification: {},
  pcidevice: {},
  pcideviceA: {},
  usbdevice: {},
  primarystorage: {},
  primarystorageA: {},
  sharedblock: {},
  policy: {},
  scheduler: {},
  schedulerA: {},
  securitygroup: {},
  ticket: {},
  ticketAssignment: {},
  ticketProcess: {},
  ticketProcessA: {},
  ticketA: {},
  ticketHistory: {},
  user: {},
  usergroup: {},
  vCenters: {},
  vip: {},
  vipA: {},
  vipqos: {},
  vm: {},
  vmA: {},
  pool: {},
  vmBootFromCdRomOnce: {},
  vmBootOrder: {},
  vmHaLevel: {},
  vmSshKey: {},
  vmConsolePassword: {},
  vmConsoleMode: {},
  vmQga: {},
  vmISO: {},
  vmBootMode: {},
  vmRDP: {},
  vmUsbRedirect: {},
  vmCpuPinning: {},
  vmUserTag: {},
  vmInstancesCapabilities: {},
  vmNicRefs: {},
  vmNicRefsA: {},
  vmNicVmInstanceRef: {},
  vmInstancesConsolePassword: {},
  vmInstanceQga: {},
  isVmAttachedVolume: {},
  volume: {},
  volumeA: {},
  volumesCapabilities: {},
  volumesQos: {},
  shareableVolumeVmInstanceRef: {},
  volumeoffering: {},
  zone: {},
  zoneA: {},
  vcenterdatacenter: {},
  snapshot: {},
  hostmemory: {},
  hybridAliyunKeySecret: {},
  hybridBucket: {},
  timer: {},
  vmInstanceSystemTag: {},
  baremetalPxe: {},
  baremetalHardwareInfo: {},
  baremetalChassis: {},
  baremetalChassisNic: {},
  baremetalChassisA: {},
  baremetalChassisPowerStatus: {},
  monitoralarm: {},
  emailserversetting: {},
  emailserversettingA: {},
  vRouterRouteTable: {},
  vRouterRouteEntry: {},
  hybridDataCenter: {},
  hybridIdentityZone: {},
  hybridVSwitch: {},
  hybridSecurityGroup: {},
  hybridEcsInstance: {},
  hybridEip: {},
  hybridVpcVpnGateway: {},
  hybridVpcUserVpnGateway: {},
  hybridVpcVpnConnection: {},
  hybridVpcIpSecConfig: {},
  hybridVpcIkeConfig: {},
  hybridVirtualPrivateCloud: {},
  hybridSecurityGroupRule: {},
  hybridConnectionAccessPoint: {},
  hybridVirtualRouterEntry: {},
  hybridvirtualborderrouter: {},
  hybridAliyunVirtualRouter: {},
  hybridRouterInterface: {},
  hybridImage: {},
  hybridAliyunDisk: {},
  hybridAliyunDiskSystemTag: {},
  hybridAliyunSnapshot: {},
  hybridKeySecret: {},
  hybridDahoCloudConnection: {},
  hybridDahoDataCenterConnection: {},
  hybridDahoVll: {},
  ecsInstanceType: {},
  uplodingImage: {},
  imageProgress: {},
  vmProgress: {},
  imageMigrate: {},
  volumeProgress: {},
  backupStorageForVm: {}, // should be removed. no data refernce
  primaryStorageForVm: {}, // should be removed. no data refernce
  backupStoragesInCurrentZone: {}, // should be removed. no data refernce
  vmAffinityGroup: {},
  portforwarding: {},
  managementNode: {},
  messageProgress: {},
  longJobProgress: {},
  imageSystemTag: {},
  ldapEntry: {},
  ldapBinding: {},
  adLdapServer: {},
  adLdapServerSystemTag: {},
  eipOfVip: {},
  snatOfVip: {},
  loadBalancerOfVip: {},
  iPsecOfVip: {},
  portForwardingOfVip: {},
  l3NetworkOfHost: {},
  iam2project: {},
  iam2projectA: {},
  iam2virtualid: {},
  iam2virtualidA: {},
  iam2virtualidgroup: {},
  iam2virtualidgroupA: {},
  iam2projecttemplate: {},
  role: {},
  roleA: {},
  zwatchResourceAlarm: {},
  zwatchResourceAlarmA: {},
  zwatchEventAlarm: {},
  zwatchSNSTextTemplate: {},
  zwatchTopic: {},
  zwatchTopicA: {},
  zwatchEndpoint: {},
  alarmHistories: {},
  platformAdmin: {},
  platformAdminA: {},
  organization: {},
  organizationA: {},
  resourceStack: {},
  resourceStackTemplate: {},
  eventFromResourceStack: {},
  plugin: {},
  nasFileSystem: {},
  nasAccessGroup: {},
  nasAccessGroupRule: {},
  v2v: {},
  v2vConversionHost: {},
  v2vProgress: {},
  hostDeviceForPerf: {},

  //腾讯云
  hybridTencentSecretKey: {},
  hybridTencentDataCenter: {},
  hybridTencentIdentityZone: {},
  hybridTencentDisk: {},
  hybridTencentVirtualPrivateCloud: {},
  hybridTencentSubNets: {},
  hybridTencentImage: {},
  uplodingTencentImage: {},
  hybridTencentSecurityGroup: {},
  HybridTencentEcsInstanceType: {},
  hybridTencentEcsInstance: {},
  hybridTencentEip: {},
  hybridTencentSecurityGroupRule: {},
  hybridTencentVirtualRouter: {},
  hybridTencentVirtualRouterEntry: {},
  hybridTencentVpcVpnGateway: {},
  hybridTencentBucket: {},
  hybridTencentVpcUserGateway: {},
  hybridTencentVpcVpnConnection: {},
  hybridTencentVpcIpSecConfig: {},
  hybridTencentVpcIkeConfig: {},
  //华为云
  hybridHuaweiyunKeySecret: {},
  hybridHuaweiyunDataCenter: {},
  hybridHuaweiyunIdentityZone: {},
  hybridHuaweiImage: {},
  hybridHuaweiSecurityGroup: {},
  hybridHuaweiSubnets: {},
  hybridHuaweiInstanceOffering: {},
  uplodingHuaweiImage: {},
  hybridHuaweiEcsInstance: {},
  hybridHuaweiSubNets: {},
  HybridHuaweiEcsInstanceType: {},
  hybridHuaweiDisk: {},
  hybridHuaweiSnap: {},
  hybridHuaweiVirtualPrivateCloud: {},
  hybridHuaweiEip: {},
  hybridHuaweiBucket: {}
}

// getters
const getters = {
}

// actions
const actions = {
  updateDbRow ({ commit, state }, param) {
    commit(types.UPDATE_DB_ROW, param)
  },
  forceUpdateDbRow ({ commit, state }, param) {
    commit(types.FORCE_UPDATE_DB_ROW, param)
  },
  updateDbTable ({ commit, state }, param) {
    commit(types.UPDATE_DB_TABLE, param)
  },
  forceUpdateDbTable ({ commit, state }, param) {
    commit(types.FORCE_UPDATE_DB_TABLE, param)
  },
  updateDbObject ({ commit, state }, param) {
    commit(types.UPDATE_DB_OBJECT, param)
  },
  updateInstanceOffering ({ commit, state }, list) {
    commit(types.UPDATE_INSTANCE_OFFERING, list)
  },
  deleteDbRow ({ commit, state }, param) {
    commit(types.DELETE_DB_ROW, param)
  }
  // ...InstanceOfferingStore.actions
}

// mutations
const mutations = {
  [types.UPDATE_DB_ROW] (state, { tableName, id, data }) {
    if (!state[tableName]) state[tableName] = {}
    if (!state[tableName][id]) state[tableName][id] = {}
    Vue.set(state[tableName], id, {...state[tableName][id], ...data})
  },
  [types.FORCE_UPDATE_DB_ROW] (state, { tableName, id, data }) {
    if (!state[tableName]) state[tableName] = {}
    if (!state[tableName][id]) state[tableName][id] = {}
    Vue.set(state[tableName], id, data)
  },
  [types.UPDATE_DB_TABLE] (state, { tableName, list }) {
    if (!state[tableName]) state[tableName] = {}
    let newTable = {}
    list.forEach((item) => {
      newTable[item.uuid] = item
    })
    Vue.set(state, tableName, { ...state[tableName], ...newTable })
  },
  [types.FORCE_UPDATE_DB_TABLE] (state, { tableName, list }) {
    if (!state[tableName]) state[tableName] = {}
    let newTable = {}
    list.forEach((item) => {
      newTable[item.uuid] = item
    })
    Vue.set(state, tableName, newTable)
  },
  [types.UPDATE_DB_OBJECT] (state, { name, data }) {
    if (!state[name]) state[name] = {}
    Vue.set(state, name, {...state[name], ...data})
  },
  [types.UPDATE_VM] (state, list) {
    list.forEach((item) => {
      state.vm[item.uuid] = item
    })
  },
  [types.UPDATE_INSTANCE_OFFERING] (state, list) {
    list.forEach((item) => {
      state.instanceOffering[item.uuid] = item
    })
  },
  [types.DELETE_DB_ROW] (state, { tableName, id }) {
    if (!state[tableName]) state[tableName] = {}
    if (state[tableName][id]) delete state[tableName][id]
    Vue.set(state, tableName, {...state[tableName]})
  },
  // setDbTable (state, { tableName, list }) {
  //   let newTable = {}
  //   list.forEach((item) => {
  //     newTable[item.uuid] = item
  //   })
  //   Vue.set(state, tableName, { ...state[tableName], ...newTable })
  // },
  mergeDbTable (state, { tableName, list }) {
    if (!list) return
    let oldTable = state[tableName]
    if (!oldTable) {
      oldTable = {}
    }
    let newTable = {}
    list.forEach((item) => {
      let oldItem = oldTable[item.uuid]
      if (!oldItem) oldItem = {};
      if(['hybridHuaweiEip','hybridTencentEip', 'hybridEip'].includes(tableName)) {
        oldItem = {};
      }
      newTable[item.uuid] = _.assign(oldItem, item)
    })
    Vue.set(state, tableName, { ...state[tableName], ...newTable })
  },
  mergeDbObject (state, { name, data }) {
    if (!state[name]) state[name] = {}
    Vue.set(state, name, {...state[name], ...data})
  },
  // setDbRow (state, { tableName, id, data }) {
  //   if (!state[tableName]) {
  //     Vue.set(state, tableName, {})
  //   }
  //   Vue.set(state[tableName], id, data)
  // },
  mergeDbRow (state, { tableName, id, data }) {
    if (!state[tableName]) {
      Vue.set(state, tableName, {})
    }
    let oldData = state[tableName][id]
    if (!oldData) oldData = {}
    Vue.set(state[tableName], id, _.assign(oldData, data))
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
