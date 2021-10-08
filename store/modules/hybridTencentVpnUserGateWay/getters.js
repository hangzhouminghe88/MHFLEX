import _ from 'lodash'
// import service from './services'

export default {
  get: (state, getters, rootState) => (uuid) => {
    if (!state[uuid]) return {}
    return state[uuid]
  },
  getList: (state, getters, rootState) => (uuidList) => {
    if (!_.isArray(uuidList)) return []
    // sometimes, uuid will not exist. so should be excluded firstly.
    uuidList = uuidList.filter(uuid => state[uuid])
    return uuidList.map(uuid => {
      return state[uuid]
    })
  }
}
