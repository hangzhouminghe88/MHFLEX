import _ from 'lodash'
import util from '../../utils';

export default {
  get: (state, getters, rootState) => (uuid) => {
    if (!state[uuid]) return {}
    return state[uuid]
  },
  getList: (state, getters, rootState) => (uuidList) => {
    if (!_.isArray(uuidList)) return []
    uuidList = uuidList.filter(uuid => state[uuid])
    return uuidList.map(uuid => {
      return state[uuid]
    })
  },
  getComposedList: (state, getters, rootState) => (uuidList) => {
    let result = []
    if (!_.isArray(uuidList)) uuidList = [uuidList]
    let itemList = _.cloneDeep(util.getList(state, uuidList))
    for (let item of itemList) {
      item.children = []
      for (let child of item.iscsiTargets) {
        child.parentUuid = item.uuid
        child.isLeaf = true
        child.ip = item.ip
        child.port = item.port
        item.children.push(child)
      }
      result.push(item)
      item.children.forEach(child => {
        if (_.includes(uuidList, child.uuid)) result.push(child)
      })
    }
    return result
  },
  getChild: (state, getters, rootState) => (uuid, itemList) => {
    let result = itemList.filter((item) => {
      if (item.uuid === uuid) {
        return item
      }
    })
    if (result.length > 0) {
      return result[0]
    }
    return {}
  }
}
