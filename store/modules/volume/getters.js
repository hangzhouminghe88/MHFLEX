import _ from 'lodash'
import util from '../../utils'

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
      if (item.vmInstanceUuid && rootState.db.vm && rootState.db.vm[item.vmInstanceUuid] && rootState.db.vm[item.vmInstanceUuid].state !== 'Destroyed') {
        item.vmInstanceName = rootState.db.vm[item.vmInstanceUuid].name
      } else if (item.vmInstanceUuidList && item.vmInstanceUuidList.length > 0 && rootState.db.vm && rootState.db.vm[item.vmInstanceUuidList[0]] && rootState.db.vm[item.vmInstanceUuidList[0]].state !== 'Destroyed') {
        item.vmInstanceName = rootState.db.vm[item.vmInstanceUuidList[0]].name
      }
      if (item.primaryStorageUuid && rootState.db.primarystorage && rootState.db.primarystorage[item.primaryStorageUuid]) {
        item.primaryStorageName = rootState.db.primarystorage[item.primaryStorageUuid].name
      }
      if (item.ownerUuid && rootState.db.iam2project && rootState.db.iam2project[item.ownerUuid]) {
        item.ownerName = rootState.db.iam2project[item.ownerUuid].name
      } else if (item.ownerUuid && rootState.db.account && rootState.db.account[item.ownerUuid]) {
        item.ownerName = rootState.db.account[item.ownerUuid].name
      }
    })
    if (singleValue) {
      return itemList[0]
    }
    return itemList
  }
}
