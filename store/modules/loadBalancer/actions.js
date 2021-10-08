import Utils, {getResourceOwner} from '../../utils';
import helper from "./helpers";
import rpc from "src/utils/rpc";
import api from './apis'
const tableName = 'loadBalancer'
// let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)
// let actionTempalate = Utils.createActionTemplate(tableName)
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)
export default{
  query: batchQueryTemplate(async({ commit, dispatch, rootState}, param) => {
    let ret = await helper.normalQuery(param), resourceProjectMap = {}, loadBalancerMap = {};
    loadBalancerMap = Utils.arrayToDict(ret.loadBalancerArray)
    let uuidList = ret.loadBalancerArray.map((item) => {
      return item.uuid;
    })
    let total = ret.total;
    if(rootState.db.common.isAdmin){
      resourceProjectMap = await getResourceOwner(uuidList, commit, rpc, rootState);
    }
    loadBalancerMap = Utils.mergeMap(loadBalancerMap, resourceProjectMap);
    dispatch('queryRelatedData', ret.loadBalancerArray);
    return {
      total,
      inventories: loadBalancerMap
    }
   }),
  queryRelatedData({ commit, dispatch, rootState }, param){
    let p = null, tasks = [], loadBalancerArray;
    if (!_.isArray(param)) {
      loadBalancerArray = [param]
    } else {
      loadBalancerArray = param
    }
    if (loadBalancerArray.length <= 0) return;
    let loadBalancerUuidList = loadBalancerArray.map((item)=>{
      return item.uuid;
    });
    tasks.push(helper.queryLoadBalancerListener(loadBalancerUuidList, commit, rpc, rootState));
    loadBalancerArray.forEach((item) => {
      tasks.push(helper.queryVips(item.vipUuid, commit, rpc, rootState))
    });
    return Promise.all(tasks);
  }
}
