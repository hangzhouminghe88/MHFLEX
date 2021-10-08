import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
// shape: [{ id, quantity }]
const state = {
  toasts: {}
}

// getters
const getters = {
}

// actions
const actions = {
  createToast ({ commit, state }, param) {
    commit(types.CREATE_TOAST, param)
  },
  updateToast ({ commit, state }, param) {
    commit(types.UPDATE_TOAST, param)
  },
  destroyToast ({ commit, state }, id) {
    commit(types.DESTROY_TOAST, id)
  }
}

// mutations
const mutations = {
  [types.CREATE_TOAST] (state, param) {
    Vue.set(state.toasts, param.id, param)
  },
  [types.UPDATE_TOAST] (state, newState) {
    Object.keys(newState).forEach(function (propName) {
      if (propName !== 'id') Vue.set(state.toasts[newState.id], propName, newState[propName])
    })
  },
  [types.DESTROY_TOAST] (state, id) {
    delete state.toasts[id]
    Vue.set(state, 'toasts', {...state.toasts})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}



// WEBPACK FOOTER //
// ./src/store/modules/toastManager.js