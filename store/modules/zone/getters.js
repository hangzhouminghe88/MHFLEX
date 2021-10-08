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
}
