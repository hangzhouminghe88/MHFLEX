import Utils from '../../utils.js';
import hepler from './helper';
import api from './apis';

let tableName = 'hybridVpcVpnGateway';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await hepler.query(param);
    let mainMap = Utils.arrayToDict(ret.inventories);
    await dispatch('queryRelationData', ret.inventories);
    return {
      total: ret.total,
      inventories: mainMap
    }
  }),

  queryRelationData({commit,rootState,dispatch}, param) {
    let resArr = [], p = null, tasks = [];
    if(!_.isArray(param)) {
      resArr = [param];
    }else{
      resArr = param;
    }

    resArr.forEach((item) => {
      p = hepler.getVSwitchName(commit, item.uuid, item.vSwitchUuid);
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
    let url = param.url ? param.url : '';
    let ret = await api.delete(url, progressCb);
    return ret.inventory;
  })
}
