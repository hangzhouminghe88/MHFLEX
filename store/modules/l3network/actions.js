import Utils, {arrayToDict, getResourceOwner, mergeMap} from '../../utils';
import helper from './helpers';
import rpc from "../../../src/utils/rpc";
import accountResourceApi from '../accountResource/apis'
import api from './apis'

let tableName = "l3network";
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)

export default {
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
      let ret = await dispatch('basicQuery', param);
      let l3NetworkArray = ret.l3NetworkArray
      //helper.addAttr(l3NetworkArray)
      let l3NetworkMap = Utils.arrayToDict(l3NetworkArray);
      let total = ret.total;
      let uuidList = ret.l3NetworkArray.map((item) => {
        return item.uuid;
      })
    let uuidL2List = ret.l3NetworkArray.map((item) => {
      return item.l2NetworkUuid
    })
     uuidList = _.uniq(uuidList)
      if(rootState.db.common.isAdmin){
        let list = await accountResourceApi.getSharedToPubliceResource(uuidList)
        let accountResourceMap = arrayToDict(list)
        l3NetworkMap = mergeMap(l3NetworkMap, accountResourceMap)
      }
      let resourceProjectMap = await getResourceOwner(uuidList, commit, rpc, rootState);
      l3NetworkMap = mergeMap(l3NetworkMap, resourceProjectMap);
      if(l3NetworkArray.length > 0){
       dispatch('queryHypervisorType',l3NetworkArray);
      }
      dispatch('queryRelatedData', l3NetworkArray);
      return{
        total,
        inventories: l3NetworkMap
      }
    }),
  queryHypervisorType({ commit, dispatch, rootState }, param){
    let l3NetworkArray = []
    if(!_.isArray(param)){
      l3NetworkArray = [param];
    }else{
      l3NetworkArray = param;
    }
    let p = null, tasks = []
    l3NetworkArray.forEach((item)=>{
      p = helper.queryHypervisorType(item.uuid, item.l2NetworkUuid, commit, dispatch, rootState);
      tasks.push(p);
    })
    return Promise.all(tasks)
  },
  basicQuery: async ({ commit, dispatch, rootState }, param)=>{
    let ret = helper.normalQuery(param);
    return ret
  },
  queryRelatedData:({ commit, dispatch, rootState },param) =>{
    let l3NetworkArray;
    if (!_.isArray(param)) {
      l3NetworkArray = [param]
    } else {
      l3NetworkArray = param
    }
    if (l3NetworkArray.length <= 0) return
    let l3NetworkUuidList = l3NetworkArray.map(it=>{
      return it.uuid;
    })
    let L2NetworkUuidList = _.uniq(l3NetworkArray.map((i) => {
      return i.l2NetworkUuid
    }))
    let accountsUuidList = _.uniq(L2NetworkUuidList)
    let tasks = [];
    tasks.push(
      helper.queryNetworkServiceType(l3NetworkUuidList, commit, rpc, rootState)
    );
    if(rootState.db.common.isAdmin){
      if (L2NetworkUuidList.length > 0) {
        tasks.push(
          helper.queryL2Network(commit, dispatch, rootState ,L2NetworkUuidList)
        )
      }
    }
    let l3NetWorkUuidList = _.uniq(l3NetworkArray.map(it=>{
      return it.uuid;
    }))
    l3NetworkArray.forEach((item) => {
      tasks.push(helper.getIpAddressCapacity(item, commit, dispatch, rootState));
      tasks.push(helper.getL3NetworkDhcpIpAddress(item, commit, dispatch, rootState));
      tasks.push(helper.getVirtualRouterOffering(item, commit, dispatch, rootState));
    })
    return Promise.all(tasks)
      .then(() => {
        l3NetworkArray.forEach(item => {
          if (!helper.getNetworkServiceTypeName(item, commit, dispatch, rootState)) return
          let networkServiceType = helper.getNetworkServiceTypeName(item, commit, dispatch, rootState);
          commit('merge', {
            [item.uuid]:{
              networkServiceType
            }
          })
        })
      });
  }
}
