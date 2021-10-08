import Utils from '../../utils';
import helper from './helpers';
import api from  './apis';

let tableName="vCenters",
//创建查询模板
batchQueryTemplate = Utils.createBatchQueryTemplate(tableName),
//创建查询操作模板带有tip提示的查询
batchBatchActionTemplate = Utils.createBatchActionTemplate(tableName),
batchActionTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, dispatch, rootState}, param) => {
    let ret = await helper.basicQuery(param);
    let mainMap = Utils.arrayToDict(ret.vCenterArray);
    let total = ret.total;
    return {
      total: total,
      inventories: mainMap
    }
  }),
  sync: batchBatchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.syncvCenter(param, progressCb);
    return resp.inventory;
  }),
  delete: batchBatchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.delete(param, progressCb);
    return resp.inventory;
  }),
  create: batchBatchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.create(param, progressCb);
    return resp.inventory;
  }),
  update: batchBatchActionTemplate(async (ctx,{param, progressCb}) => {
    let uuid = param.uuid;
    let realParam = param.param;
    let resp = await api.update(uuid, realParam, progressCb);
    return resp.inventory;
   })
}
