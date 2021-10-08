import Utils from '../../utils.js';
import hepler from './helper';
import {arrayToDict} from "../../utils";
import api from "./apis";

let tableName  = 'hybridHuaweiSecurityGroup';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
	basicQuery: batchQueryTemplate(async ({ commit, rootState, dispatch }, param) => {
		let ret = await hepler.query(param);
		let mainMap = Utils.arrayToDict(ret.inventories);
		let uuidList = ret.inventories.map( (item) => {
			return item;
		})
    let retDataCenter = await dispatch('queryDataCenter', ret.inventories), retDataCenterObj = {};
    for(let i  in retDataCenter ) {
      ((item) => {
        retDataCenterObj[item.uuid] = item;
      })(retDataCenter[i])
    }
		let targetObj =  Utils.mergeMap(retDataCenterObj, mainMap);
		let retEcsNumObj = {}, retEcsNum = await dispatch('queryEcsNum', uuidList);
    for(let i  in retEcsNum ) {
      ((item) => {
        retEcsNumObj[item.uuid] = item;
      })(retEcsNum[i])
    }
		let finalObj = Utils.mergeMap(targetObj, retEcsNumObj);
		return {
      total: ret.total,
      inventories: finalObj
    }
  }),

 queryDataCenter({commit, dispatch, rootState}, param){
    let arr = [], tasks=[], p ;
    if(!_.isArray(param)) {
      arr = [param];
    }else {
      arr = param;
    }
    arr.forEach(item => {
      p = hepler.queryDataCenter(commit, item.uuid, item.dataCenterUuid);
      tasks.push(p);
    })
    return Promise.all(tasks);
  },
 queryEcsNum:( async ({commit, dispatch}, param) => {
   let tasks = [], p = null, uuidList;
   if(!_.isArray(param)){
    uuidList = [param]
   }else {
    uuidList = param;
   }
   for(let item of uuidList){
     p = await hepler.queryEcs(commit, dispatch,  item.uuid);
     tasks.push(p);
   }
   return Promise.all(tasks)
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let url = param.url ? param.url : '',
      uuid = param.uuid ? param.uuid : '';
    let ret = await api.delete(url, uuid, progressCb);
    return ret.inventory;
  }),
  update: batchActionTemplate(async (ctx,{param, progressCb}) => {
    let uuid = param.uuid ? param.uuid : '',
        realParam = param.param ? param.param : '';
    let ret = await api.update(uuid, realParam, progressCb);
    return ret.inventory;
	})
}
