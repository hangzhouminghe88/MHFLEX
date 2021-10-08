import Utils from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = "consoleproxy";
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let batchQueryTemplate =  Utils.createBatchQueryTemplate(tableName)

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let resp = await helper.basicQuery(param);
    let total = resp.total;
    let consoleArray = resp.consoleArray;
    let mainMap = Utils.arrayToDict(consoleArray);
    return {
      total,
      inventories: mainMap
    }
  }),
  reconnect: batchActionTemplate(async (ctx,{progressCb,param}) => {
    let resp = await api.reconnect(param.param, progressCb);
    return resp.inventory;
  }),
  setConsoleProxy: batchActionTemplate(async (ctx, {progressCb, param}) => {
    let uuid = param.uuid, ip = param.ip;
    let resp = await api.setConsoleProxy(uuid, ip, progressCb);
    return resp.inventory;
  })
}
