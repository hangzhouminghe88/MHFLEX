import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
// shape: [{ id, quantity }]
const state = {
  windowIdList: [],
  windows: {}
}

// getters
const getters = {
}

// actions
const actions = {
  openDialog ({ commit, state }, param) {
    return new Promise((resolve, reject) => {
      commit(types.OPEN_DIALOG, param)
      resolve(param.id)
    })
  },
  updateDialog ({ commit, state }, param) {
    commit(types.UPDATE_DIALOG, param)
  },
  closeDialog ({ commit, state }, id) {
    commit(types.CLOSE_DIALOG, id)
  }
}

// mutations
const mutations = {
  [types.OPEN_DIALOG] (state, param) {
    Vue.set(state.windows, param.id, param)
    state.windowIdList.push(param.id)
  },
  [types.UPDATE_DIALOG] (state, newState) {
    Object.keys(newState).forEach(function (propName) {
      if (propName !== 'id') Vue.set(state.windows[newState.id], propName, newState[propName])
    })

  },
  [types.CLOSE_DIALOG] (state, id) {
    // Vue.set(state, id, undefined)
    if (state.windowIdList.indexOf(id) <= -1) return
    state.windowIdList = state.windowIdList.filter((uuid) => uuid !== id)
    delete state.windows[id]
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}



// WEBPACK FOOTER //
// ./src/store/modules/dialogManager.js
