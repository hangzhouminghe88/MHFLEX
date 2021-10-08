import Vue from 'vue'
import * as types from '../mutation-types'
const state = {
  tasks: {}
}

// getters
const getters = {
}

// actions
const actions = {
  addTimerTask ({ commit, state }, param) {
    commit(types.ADD_TIMER_TASK, param)
  },
  updateTimerTask ({ commit, state }, param) {
    commit(types.UPDATE_TIMER_TASK, param)
  },
  removeTimerTask ({ commit, state }, id) {
    commit(types.REMOVE_TIMER_TASK, id)
  }
}

// mutations
const mutations = {
  [types.ADD_TIMER_TASK] (state, param) {
    Vue.set(state.tasks, param.id, param)
  },
  [types.UPDATE_TIMER_TASK] (state, newState) {
    if (!state.tasks[newState.id]) {
      Vue.set(state.tasks, newState.id, newState)
    }
    Object.keys(newState).forEach(function (propName) {
      if (propName !== 'id') Vue.set(state.tasks[newState.id], propName, newState[propName])
    })
  },
  [types.REMOVE_TIMER_TASK] (state, id) {
    // Vue.set(state, id, undefined)
    delete state.tasks[id]
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
