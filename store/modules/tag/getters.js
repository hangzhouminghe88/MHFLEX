import _ from 'lodash'
import util from '../../utils'

export default {
  get: (state, getters, rootState) => util.getterTempalte((uuidList) => {
    let itemList = _.cloneDeep(util.getList(state, uuidList))
    itemList.forEach(item => {
      if (item.ownerUuid && rootState.db.iam2project && rootState.db.iam2project[item.ownerUuid]) {
        item.ownerName = rootState.db.iam2project[item.ownerUuid].name
      } else if (item.ownerUuid && rootState.db.account && rootState.db.account[item.ownerUuid]) {
        item.ownerName = rootState.db.account[item.ownerUuid].name
      }
    })
    return itemList
  })
}
