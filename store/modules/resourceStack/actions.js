import Utils from '../../utils';
import helper from './helpers';
import rpc from 'src/utils/rpc';
import api from './apis'

let tableName = 'resourceStack';
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await helper.basicQuery(param);
    let total = ret.total;
    let retArray = ret.resourceStackArray;
    let uuidList = retArray.map((item) => item.uuid);
    let resourceProjectMap = await helper.queryResourceOwner(uuidList, commit, rpc, rootState)
    let mainMap = Utils.arrayToDict(retArray);
    let finalMap = Utils.mergeMap(mainMap, resourceProjectMap);
    return {
      total,
      inventories: finalMap
    }
  }),
  delete: batchActionTemplate(async(ctx, {param, progressCb}) => {
     let resp = await api.delete(param, progressCb);
     return resp.inventory;
  }),
  create: batchActionTemplate(async(ctx, {param, progressCb}) => {
    let resp = await api.create(param, progressCb);
    return resp.inventory;
  })
}
