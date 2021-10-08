import getters from './getters'
import actions from './actions'
import util from '../../utils'
export default {
  namespaced: true,
  state: {},
  getters,
  mutations: {
    merge (state, objMap) {
      util.batchMerge(state, objMap)
    },
    delete (state, uuid) {
      util.remove(state, uuid)
    }
  },
  actions
}
