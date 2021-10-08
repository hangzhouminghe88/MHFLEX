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
    itemList.forEach((item) =>{
      if(item.vmInstanceUuid && rootState.db.vm[item.vmInstanceUuid]){
        item.vmName = rootState.db.vm[item.vmInstanceUuid].name;
      }
      if(item.hostUuid && rootState.db.host[item.hostUuid]){
        item.hostName = rootState.db.host[item.hostUuid].name;
      }
    })
    if (singleValue) {
      return itemList[0]
    }
    return itemList
  }
}
