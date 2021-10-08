import api from './apis';

export default {
  async query(param) {
    //if (!param) return;
    let realParam = _.cloneDeep(param);
    if (!param.replyWithCount) realParam.replyWithCount = true;
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      inventories: resp.inventories
    }
  },
  async getVSwitchName(commit, uuid, vSwitchUuid) {
    let res;
    if(vSwitchUuid){
      res = await api.getVSwitchName(vSwitchUuid);
      commit('merge', {
        [uuid]: {
          vSwitchName: res.inventories[0].name
        }
      })
    }else {
      commit('merge', {
        [uuid]: {
          vSwitchName: ''
        }
      })
    }
  }
}
