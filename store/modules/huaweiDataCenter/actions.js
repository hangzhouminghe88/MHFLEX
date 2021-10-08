import Utils from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = "hybridHuaweiyunDataCenter";
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let batchQueryTemplate =  Utils.createBatchQueryTemplate(tableName);
let createTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let resp = await helper.basicQuery(param);
    let total = resp.total;
    let dataCenterArray = resp.dataCenterArray;
    let mainMap = Utils.arrayToDict(dataCenterArray);
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
}


