import _ from 'lodash'
import util from "../../utils";
// import service from './services'

export default {
  get: (state, getters, rootState) => (uuid) => {
    if (!state[uuid]) return {}
    return state[uuid]
  },
  getList: (state, getters, rootState) => (param) => {
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
