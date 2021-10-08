import Utils, {getResourceOwner} from '../../utils';
import helper from "./helpers";
import rpc from "src/utils/rpc";
let tableName = 'loadBalancerListener';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)
export default {
  query: batchQueryTemplate(async({ commit, dispatch, rootState}, param) => {
    let ret = await helper.normalQuery(param), resourceProjectMap = {}, loadBalancerListenerMap = {};
    loadBalancerListenerMap = Utils.arrayToDict(ret.loadBalancerListenerArray)
    let uuidList = ret.loadBalancerListenerArray.map((item) => {
      return item.uuid;
    })
    let total = ret.total;
    if(rootState.db.common.isAdmin){
      resourceProjectMap = await getResourceOwner(uuidList, commit, rpc, rootState);
    }
    loadBalancerListenerMap = Utils.mergeMap(loadBalancerListenerMap, resourceProjectMap);
    dispatch('queryRelatedData', ret.loadBalancerListenerArray);
    return {
      total,
      inventories: loadBalancerListenerMap
    }
  }),
  queryRelatedData({ commit, dispatch, rootState }, param ){
    let loadBalancerListenerArray, tasks = [];
    if(!_.isArray(param)){
      loadBalancerListenerArray = [param]
    }else{
      loadBalancerListenerArray = param;
    }
    if (loadBalancerListenerArray.length <= 0) return;
    let loadBalancerListenerUuid = loadBalancerListenerArray.map((item)=>{
      return item.uuid;
    });
    let ipList = {}
    loadBalancerListenerUuid.forEach((item) => {
      tasks.push(
        helper.queryNics(item, commit, rootState )
          .then((resp) => {
            ipList[item] = resp.inventories.map((it) => it.ip)
          })
      );
    })
    return Promise.all(tasks).then((resp) => {
      if (rootState.db.common.isOpensource) {
        return new Promise((resolve, reject) => { resolve() })
      }else{
        helper.queryMetric(loadBalancerListenerUuid)
          .then((resp) => {
            let loadBalancerListenerA = {}
            loadBalancerListenerUuid.forEach((uuid) => {
              loadBalancerListenerA[uuid] = {
                up: 0,
                total: ipList[uuid].length
              }
            })
            resp.data.forEach((item) => {
              if (item.value > 0 && ipList[item.labels.ListenerUuid].find((x) => x === item.labels.NicIpAddress)) loadBalancerListenerA[item.labels.ListenerUuid].up ++
            })
            let _array = []
            _.forIn(loadBalancerListenerA, (value, key) => {
              _array.push({
                uuid: key,
                ...value
              })
            })
            commit('mergeDbTable', {tableName: 'loadBalancerListenerA', _array}, { root: true })
          })
      }
    })
  }
}
