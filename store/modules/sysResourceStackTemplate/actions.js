import Utils from '../../utils';
import helper from './heplers';
import rpc from "src/utils/rpc";
import api from './apis';

let tableName= 'resourceStackTemplate';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({rootState, commit, dispatch}, param) => {
    let resp = await helper.basicQuery(param);
    let retArray = resp.sysResourceStackTemplateArr;
    let total = resp.total;
    let uuidList = retArray.map((item) => item.uuid);
    let resourceProjectMap = await helper.queryResourceOwner(uuidList, commit, rpc, rootState)
    let mainMap = Utils.arrayToDict(retArray);
    let finalMap = Utils.mergeMap(mainMap, resourceProjectMap);
    return {
      total,
      inventories: finalMap
    }
  }),
  changeTemplateState: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let state = param.state;
    let resp = await api.changeTemplateState(uuid, state, progressCb);
    return resp.inventory;
  })
}
