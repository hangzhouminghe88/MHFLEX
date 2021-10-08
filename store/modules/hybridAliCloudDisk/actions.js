import Utils from '../../utils.js';
import helper from './helper';
import api from './apis';

let tableName = 'hybridAliyunDisk';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let ret = await helper.query(param);
    let uuidList;
      uuidList = ret.inventories.map((item) => {
        return item.uuid;
    })
    await dispatch('queryRelation', {param: uuidList, item: ret.inventories});
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
    let url = param.url ? param.url : '',
      uuid = param.uuid ? param.uuid : '';
    let ret = await api.delete(url, uuid, progressCb);
    return ret.inventory;
  }),
  queryRelation({commit, rootState, dispatch}, {param, item}){
     let uuidList = [];
     if(!param) return;
    if(!_.isArray(param)) {
      uuidList = [param];
    }else{
      uuidList = param;
    }
    let tasks = [], p = null;
    if(uuidList.length <=0) return;
    uuidList.forEach((uuid) => {
      p = helper.querySystemTag(commit, rootState, uuid);
      tasks.push(p);
    })
    if(item.length < 0) return;
    item.forEach((it) => {
      p = helper.queryIdentityZone(commit, it.uuid , it.identityZoneUuid);
      tasks.push(p);
      p = helper.queryEscName(commit, it.uuid , it.ecsInstanceUuid);
      tasks.push(p);
    })
    return Promise.all(tasks);
  },
  detach: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param;
    let ret = await api.detach(uuid, progressCb);
    return ret.inventory;
  }),
  attach: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let ecsUuid = param.ecsUuid;
    let ret = await api.attach(uuid, ecsUuid, progressCb);
    return ret.inventory;
  })
}

