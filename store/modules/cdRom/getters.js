import _ from 'lodash'
import util from '../../utils'

export default {
  get: (state, getters, rootState) => (uuidList) => {
    if (!_.isArray(uuidList)) uuidList = [uuidList]
    let itemList = _.cloneDeep(util.getList(state, uuidList))
    itemList.sort((a, b) => a.deviceId - b.deviceId)
    itemList.forEach((item, index) => { item.name = `CDROM-${index + 1}` })
    return itemList
  }
}
