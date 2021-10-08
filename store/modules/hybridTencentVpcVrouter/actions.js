import Utils from '../../utils.js';
import hepler from './helper';
import api from './apis';

let tableName = 'hybridTencentVirtualRouter';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await hepler.query(param);
    let vpcParam = ret.inventories.map((item) => {
      return {
        uuid: item.uuid,
        vpcUuid: item.vpcUuid
      }
    })
    let resp = await dispatch('queryHybridVpc', vpcParam);
    let obj = {};
    for(let i  in resp ) {
      ((item) => {
        obj[item.uuid] = item;
      })(resp[i])
    }
    let mainMap = Utils.arrayToDict(ret.inventories);
     let objMap = Utils.mergeMap(obj, mainMap);
    return {
      total: ret.total,
      inventories: objMap
    }
  }),
  async queryHybridVpc({ commit, dispatch, rootState },vpcParam ){
    if(!vpcParam) return;
    let tasks = [], p = null;
    vpcParam.forEach((item) => {
      p = hepler.queryHybridVpc(commit, item.uuid, item.vpcUuid);
      tasks.push(p);
    })
    return Promise.all(tasks);
  },
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
    let url = param.url ? param.url : '',
      uuid = param.uuid ? param.uuid : '';
    let ret = await api.delete(url, uuid, progressCb);
    return ret.inventory;
  })
}
