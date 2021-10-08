import Vue from 'vue'
import * as types from '../mutation-types'
//import { __printCallStack } from 'src/utils/utils'

// initial state
// shape: [{ id, quantity }]
const state = {
  windows: {}
}

// getters
const getters = {
}

// actions
const actions = {
  createWindow ({ commit, state }, param) {
    commit(types.CREATE_WINDOW, param)
  },
  updateWindow ({ commit, state }, param) {
    commit(types.UPDATE_WINDOW, param)
  },
  destroyWindow ({ commit, state }, id) {
    commit(types.DESTROY_WINDOW, id)
  }
}

// mutations
const mutations = {
  [types.CREATE_WINDOW] (state, param) {
    Vue.set(state.windows, param.id, param)
  },
  [types.UPDATE_WINDOW] (state, newState) {
    try {
      Object.keys(newState).forEach(function (propName) {
        if (propName !== 'id' && newState.id) Vue.set(state.windows[newState.id], propName, newState[propName])
      })
    } catch (e) {
      //__printCallStack()
      // console.log('updateWindow() Error ..................................')
      // __printCallStack()
      // console.log(`state.windows[newState.id]: ${state.windows[newState.id]}`)
      // console.log(`netState: ${JSON.stringify(newState)}`)
    }
  },
  [types.DESTROY_WINDOW] (state, id) {
    // Vue.set(state, id, undefined)
    delete state.windows[id]
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

