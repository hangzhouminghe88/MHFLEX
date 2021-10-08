import api from './apis';

export default {
  async query(param) {
    if (!param) return;
    let realParam = _.cloneDeep(param);
    if (!param.replyWithCount) realParam.replyWithCount = true;
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      inventories: resp.inventories
    }
  },
  async getDataCenterName(commit, uuid, dataCenterUuid) {
    let res;
    if(dataCenterUuid){
      res = await api.getDataCenterName(dataCenterUuid);
      commit('merge', {
        [uuid]: {
          dataCenterName: res.inventories[0].regionName
        }
      })
    }else {
      commit('merge', {
        [uuid]: {
          dataCenterName: ''
        }
      })
    }
  }
}
