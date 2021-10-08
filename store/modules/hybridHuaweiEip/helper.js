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
  async queryDataCenter(commit, uuid, dataCenterUuid) {
    let res = await api.queryDataCenter(dataCenterUuid);
    commit('merge',{
      [uuid]: {
       dataCenterName: res.inventories[0].regionName
      }
     })
  },
  async queryEcs(commit, rootState, uuid, ecsUuid){
    let res = await api.queryEcs(ecsUuid);
    if(ecsUuid) {
      commit('merge',{
        [uuid]: {
          ecsName: res.inventories[0].name
        }
      })
    }else {
      commit('merge',{
        [uuid]: {
          ecsName: ''
        }
      })
    }

  },
}
