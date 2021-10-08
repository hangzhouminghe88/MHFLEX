import Utils, {createActionTemplate} from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = 'zwatchSNSTextTemplate';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, dispatch, rootState}, param) => {
    let ret = await helper.basicQuery(param);
    let total = ret.total;
    let zwatchSNSTextTemplateArr = ret.zwatchSNSTextTemplateArr;
    let mainMap = Utils.arrayToDict(zwatchSNSTextTemplateArr);
    return {
      total,
      inventories: mainMap
    }
  }),
  setDefault: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param.uuid;
    let realParam = param.param;
    let resp = await api.setDefault(uuid, realParam, progressCb);
    return resp.inventory;
  }),
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param;
    let resp = await api.delete(uuid, progressCb);
    return resp.inventory;
  }),
  create: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.create(param, progressCb);
    return resp.inventory;
  }),
  update: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param.uuid;
    let realParam = param.param;
    let resp = await api.update(uuid,realParam,progressCb);
    return resp.inventory;
  }),
}
