import Utils from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = "hybridHuaweiyunIdentityZone";
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let batchQueryTemplate =  Utils.createBatchQueryTemplate(tableName);
let createTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let resp = await helper.basicQuery(param);
    let total = resp.total;
    let iZoneArray = resp.iZoneArray;
    dispatch('getRelation', iZoneArray);
    let mainMap = Utils.arrayToDict(iZoneArray);
    return {
      total,
      inventories: mainMap
    }
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.delete(param, progressCb);
    return resp.inventory;
  }),
  create: createTemplate(async (ctx, {param, progressCb}) => {
    let resp  = await api.create(param, progressCb);
    return resp.inventory;
  }),

  getRelation({commit, rootState, dispatch}, param) {
    let arr = [], tasks = [];
    if(!_.isArray(param)) {
      arr = [param];
    }else{
      arr = param;
    }
    for( let it of arr) {
      tasks.push(helper.queryDataCenter(commit, it.uuid, it.dataCenterUuid))
    }
    return Promise.all(tasks);
  }
}


