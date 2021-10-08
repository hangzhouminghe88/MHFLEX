import util from '../../utils'
import getters from './getters'
import actions from './actions'

export default {
  namespaced: true,
  state: {},
  actions,
  getters,
  mutations: {
    merge (state, objMap) {
      util.batchMerge(state, objMap)
    },
    delete (state, uuid) {
      util.remove(state, uuid)
    }
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelController/index.js