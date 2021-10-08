import api from './apis'
import rpc from "src/utils/rpc";
export default {
  async normalQuery(param){
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      loadBalancerArray: resp.inventories,
      total: resp.total
    }
  },
  async queryLoadBalancerListener(loadBalancerUuidList, commit, rpc, rootState){
    let resp = await  api.queryLoadBalancerListenerstener(loadBalancerUuidList);
    let list = resp.inventories
    commit('mergeDbTable', {tableName: 'loadBalancerListener', list}, { root: true })
  },
  async queryVips(uuid, commit, rpc, rootState){
    let resp = await  api.queryVips(uuid);
    let list = resp.inventories;
    commit('mergeDbTable', {tableName: 'vip', list}, { root: true })
  }
}
