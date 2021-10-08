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
    if (singleValue) {
      return itemList[0]
    }
    return itemList
  },
}
