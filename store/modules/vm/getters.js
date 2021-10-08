import _ from 'lodash'
import util from '../../utils';
import helpers from './helpers';

export default {
  // get: (state, getters, rootState) => (uuid) => {
  //   return service.getMergedObject(rootState, uuid)
  // },
  get: (state, getters, rootState) => (param) => {
    let uuidList
    let singleValue = false
    if (_.isString(param)) {
      singleValue = true
      uuidList = [param]
    } else if (_.isArray(param)) {
      uuidList = param
    } else {
      return []
    }
    let itemList = _.cloneDeep(util.getList(state, uuidList))
    itemList.forEach(item => {
      // progress
      if (_.isUndefined(item.progress)) {
        item.progress = null
      }
      // ha
      if (!item.ha) {
        item.ha = 'None'
      }
      // VDIMonitorNumber
      if (_.isUndefined(item.VDIMonitorNumber)) {
        item.VDIMonitorNumber = '1'
      }
      // platform
      if (_.isUndefined(item.platform)) {
        item.platform = 'Linux'
      }
      // vmConsoleMode
      if (_.isUndefined(item.vmConsoleMode)) {
        item.vmConsoleMode = 'vnc'
      }
      // vmBootMode
      if (_.isUndefined(item.bootMode)) {
        item.bootMode = 'Legacy'
      }
      // default l3network ip
      if (item.vmNics) {
        for (let i = 0; i < item.vmNics.length; i++) {
          if (item.defaultL3NetworkUuid === item.vmNics[i].l3NetworkUuid) {
            item.defaultL3NetworkIp = item.vmNics[i].usedIps.map((item) => item.ip)
            item.defaultMac = item.vmNics[i].mac
            break
          }
        }
      }
      // root volume ps type
      item.rootVolumePrimaryStorageType = helpers.getPrimaryStorageType(item, rootState.db.primarystorage, rootState.db.common.isAdmin)
      // host ip
      if (item.state !== 'Stopped' || item.rootVolumePrimaryStorageType === 'LocalStorage') {
        item.hostName = _.get(rootState, `db.host[${item.hostUuid}].managementIp`)
      } else {
        item.hostName = ''
      }
      // cluster
      if (rootState.db.cluster && rootState.db.cluster[item.clusterUuid]) {
        item.clusterName = rootState.db.cluster[item.clusterUuid].name
      }
      // ps
      if (item.primaryStorageUuid && rootState.db.primarystorage && rootState.db.primarystorage[item.primaryStorageUuid]) {
        item.primaryStorageName = rootState.db.primarystorage[item.primaryStorageUuid].name
      }
      // owner
      if (item.ownerUuid && rootState.db.iam2project && rootState.db.iam2project[item.ownerUuid]) {
        item.ownerName = rootState.db.iam2project[item.ownerUuid].name
        item.ownerType = 'project'
        item.ownerLinkedAccountUuid = rootState.db.iam2project[item.ownerUuid].linkedAccountUuid
      } else if (item.ownerUuid && rootState.db.account && rootState.db.account[item.ownerUuid]) {
        item.ownerName = rootState.db.account[item.ownerUuid].name
        item.ownerType = 'account'
      }
      // my tag list
      if (item.myUserTagUuidList) {
        // item.myUserTagList = item.myUserTagUuidList.map(uuid => rootState.tag[uuid])
      }

      // orther tag list
      if (item.otherUserTagUuidList) {
        // item.otherUserTagList = item.otherUserTagUuidList.map(uuid => rootState.tag[uuid])
      }
    })
    if (singleValue) {
      return itemList[0]
    }
    return itemList
  }
}
