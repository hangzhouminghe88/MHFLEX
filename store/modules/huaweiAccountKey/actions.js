import Utils from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = "hybridHuaweiyunKeySecret";
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let batchQueryTemplate =  Utils.createBatchQueryTemplate(tableName);
let createTemplate = Utils.createActionTemplate(tableName);

export default {
  //请求详情数据，以及列表数据
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let resp = await helper.basicQuery(param);
    let total = resp.total;
    let acccountKeyArray = resp.acccountKeyArray;
    let mainMap = Utils.arrayToDict(acccountKeyArray);//合并请求数据
    return {
      total,
      inventories: mainMap
    }
  }),
  attach: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.attach(param, progressCb);
    return resp.inventory;
  }),
  detach: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.detach(param, progressCb);
    return resp.inventory;
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.delete(param, progressCb);
    return resp.inventory;
  }),
  create: createTemplate(async (ctx, {param, progressCb}) => {
    let resp  = await api.create(param, progressCb);
    return resp.inventory;
  }),
  update: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param.uuid ? param.uuid : '', realParam = param.param ? param.param : {};
    let resp = await api.update(uuid, realParam, progressCb);
    return resp.inventory;
  }),
}
