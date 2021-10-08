import Utils from '../../utils';
import helpers from "./helpers";
import api from './apis';

let tableName = 'certificate';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchCreateActionTemplate = Utils.createActionTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)
export default {
  batchQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param)=> {
    let resp = await helpers.batchQuery(param);
    let certificateArray = resp.certificateArray;
    let total = resp.total;
    let mainMap = Utils.arrayToDict(certificateArray);
    return {
      total,
      inventories: mainMap
    }
  }),
  create: batchCreateActionTemplate(async (ctx, {param, progressCb}) =>{
    let resp = await api.create(param, progressCb);
    return resp.inventory;
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.delete(param, progressCb);
    return resp.inventory;
  }),
  detach: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let certificateUuid = param.certificateUuid;
    let resp = await api.detach(uuid, certificateUuid, progressCb);
    return resp.inventory;
  }),
  update: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let realParam = {};
    realParam.uuid = param.uuid;
    realParam.param = param.param;
    let resp = await api.update(realParam.uuid ,realParam.param, progressCb);
    return resp.inventory;
  })
}
