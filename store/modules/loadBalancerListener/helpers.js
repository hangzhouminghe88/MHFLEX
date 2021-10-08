import api from "./apis";

export default {
  async normalQuery(param){
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      loadBalancerListenerArray: resp.inventories,
      total: resp.total
    }
  },
  async queryNics(uuid, commit, rootState ){
    let resp = await api.queryNics(uuid);
    return resp
  },
  async queryMetric(uuidList, commit, rootState){
    let resp = await api.queryMetric(uuidList);
    return resp ;
  }
}
