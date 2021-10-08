import _ from 'lodash'
import util from "../../utils";

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
    let itemList = _.cloneDeep(util.getList(state, uuidList));
    itemList.forEach((item) => {
      if (item.ownerUuid && rootState.db.iam2project && rootState.db.iam2project[item.ownerUuid]) {
        item.ownerName = rootState.db.iam2project[item.ownerUuid].name
        item.ownerType = 'project'
        item.ownerLinkedAccountUuid = rootState.db.iam2project[item.ownerUuid].linkedAccountUuid
      } else if (item.ownerUuid && rootState.db.account && rootState.db.account[item.ownerUuid]) {
        item.ownerName = rootState.db.account[item.ownerUuid].name
        item.ownerType = 'account'
      }
    })
    if (singleValue) {
      return itemList[0]
    }
    return itemList
  },
}
