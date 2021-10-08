import Utils from '../../utils.js';
import helper from './helper';
import api from './apis';

let tableName = 'nasAccessGroup';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);
const state = {};
export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await helper.query(param);
    let mainMap = {};
    mainMap = Utils.arrayToDict(ret.inventories);
    return {
      total: ret.total,
      inventories: mainMap
    }
  }),
  create: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let realParam = param;
    let ret = await api.create(realParam, progressCb);
    return ret.inventory;
  }),
  update: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let realParam = param.param, uuid = param.uuid;
    let ret = await api.update(uuid, realParam, progressCb);
    return ret.inventory;
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param;
    let ret = await api.delete(uuid, progressCb);
    return ret.inventory;
  })
}

