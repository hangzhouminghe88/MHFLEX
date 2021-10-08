import * as types from '../mutation-types';
let state = {
  showVmChangeROToAProjDlg: false,
  showVmAccount: false,
}

let actions =  {
  updateshowVmChangeROToAProjDlg({commit, state}, param){
    commit(types.SHOW_VM_CAHNGE_ROTOAPROJ_DLG, param);
  }
}

let mutations = {
  [types.SHOW_VM_CAHNGE_ROTOAPROJ_DLG](state, param){
    state.message = param.paramobj;
    if(param.type === 'change')
    state.showVmChangeROToAProjDlg = param.isShow;
    if(param.type === 'account')
    state.showVmAccount = param.isShow;
  }
}

export default {
  actions,
  mutations
}
