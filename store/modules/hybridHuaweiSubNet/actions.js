import Utils from '../../utils.js';
import hepler from './helper';
import api from './apis';

let tableName = 'hybridHuaweiSubNets';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await hepler.query(param);
    dispatch('queryRalation', ret.inventories);
    let mainMap = Utils.arrayToDict(ret.inventories);
    return {
      total: ret.total,
      inventories: mainMap
    }
  }),
  queryRalation({ commit, dispatch, rootState },param ){
    let arr = [];
    if(!_.isArray(param)) {
      arr = [param];
    }else {
      arr = param;
    }
    let tasks = [], p = null;
    arr.forEach((item) => {
      p = hepler.queryIdentityZone(commit, item.uuid, item.identityZoneUuid);
      tasks.push(p);
      p = hepler.queryVpc(commit, item.uuid, item.ecsVpcUuid);
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
