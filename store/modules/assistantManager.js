import Vue from 'vue'
import * as types from '../mutation-types'
import _ from 'lodash'

// initial state
// shape: [{ id, quantity }]
const state = {
  assistants: {}
}

// getters
const getters = {
}

// actions
const actions = {
  createAssistant ({ commit, state }, param) {
    let assistants = state.assistants
    let specialRestrictions = ['License', 'Project']
    if (!param.data.restriction || !_.includes(specialRestrictions, param.data.restriction)) {
      let assistants = state.assistants
      Object.keys(assistants).forEach(assistantId => {
        if (assistants[assistantId] && _.includes(specialRestrictions, assistants[assistantId].data.restriction)) {
          commit(types.DESTROY_ASSISTANT, assistantId)
        }
      })
    }
    if (param.data && _.includes(specialRestrictions, param.data.restriction) && Object.keys(assistants).length > 0) return
    return commit(types.CREATE_ASSISTANT, param)
  },
  updateAssistant ({ commit, state }, param) {
    commit(types.UPDATE_ASSISTANT, param)
  },
  destroyAssistant ({ commit, state }, id) {
    commit(types.DESTROY_ASSISTANT, id)
  }
}

// mutations
const mutations = {
  [types.CREATE_ASSISTANT] (state, param) {
    Vue.set(state.assistants, param.data.id, param)
  },
  [types.UPDATE_ASSISTANT] (state, newState) {
    Object.keys(newState).forEach(function (propName) {
      if (propName !== 'id') Vue.set(state.assistants[newState.id], propName, newState[propName])
    })
  },
  [types.DESTROY_ASSISTANT] (state, id) {
    delete state.assistants[id]
    Vue.set(state, 'assistants', {...state.assistants})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
