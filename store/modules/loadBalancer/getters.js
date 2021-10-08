import _ from 'lodash'
import util from '../../utils'

export default {
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
      if(item.vipUuid && rootState.db.vip && rootState.db.vip[item.vipUuid]){
        item.vip = rootState.db.vip[item.vipUuid].ip;
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
