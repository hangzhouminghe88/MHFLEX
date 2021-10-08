import Utils from '../../utils.js';
import helper from './helper';
import api from './apis';

let tableName = 'hybridTencentEip';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);
const state = {};
export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await helper.query(param);
    dispatch('queryRelation', ret.inventories);
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
    let url = param;
    let ret = await api.delete(url, progressCb);
    return ret.inventory;
  }),
  queryRelation({commit, rootState, dispatch}, param){
     let uuidList = [];
     if(!param) return;
    if(!_.isArray(param)) {
      uuidList = [param];
    }else{
      uuidList = param;
    }
    let tasks = [], p = null;
    if(uuidList.length <=0) return;
    uuidList.forEach((item) => {
      p = helper.queryDataCenter(commit, item.uuid, item.dataCenterUuid);
      tasks.push(p);
      p = helper.queryEcs(commit, rootState, item.uuid, item.allocateResourceUuid);
      tasks.push(p);
    })
    return Promise.all(tasks)
  },
  detach: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param;
    let ret = await api.detach(uuid, progressCb);
    if(ret.success === true) {
      delete ctx.state[uuid]['allocateResourceUuid']
    }
    return state;
  }),
  attach: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let vmNicUuid = param.vmNicUuid;
    let ret = await api.attach(uuid, vmNicUuid, progressCb);
    return ret.inventory;
  })
}

