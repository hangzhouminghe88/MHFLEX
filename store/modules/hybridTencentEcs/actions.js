import Utils from '../../utils.js';
import helper from './helper';
import api from './apis';

let tableName = 'hybridTencentEcsInstance';
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
    dispatch('queryRelation', {param: uuidList, item: ret.inventories});
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
  delete: batchActionTemplate(async (ctx, {param, progressCb,isDeleteRemote}) => {
    let uuid = param;
    let ret = await api.delete(uuid, progressCb, isDeleteRemote);
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
    if(item.length < 0) return;
    item.forEach((it) => {
      p = helper.queryIdentityZone(commit, it.uuid , it.identityZoneUuid);
      tasks.push(p);
      p = helper.querySecurityGroupName(commit, it.uuid , it.ecsSecurityGroupUuid);
      tasks.push(p);
      p = helper.queryVpcName(commit, it.uuid, it.ecsVSwitchUuid);
      tasks.push(p);
      p = helper.queryImageName(commit, it.uuid, it.ecsImageUuid);
      tasks.push(p);
    })
    return Promise.all(tasks);
  },
  start: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param.uuid, realParam = param.action;
    ctx.commit('merge', {
      [uuid]: {
        state: 'Starting'
      }
    })
    let ret = await api.action(uuid, realParam, progressCb);
    return ret.inventory;
  }),

  stop: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param.uuid, realParam = param.action;
    ctx.commit('merge', {
      [uuid]: {
        state: 'Stoping'
      }
    })
    let ret = await api.action(uuid, realParam, progressCb);
    return ret.inventory;
  }),

  reboot: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let uuid = param.uuid, realParam = param.action;
    ctx.commit('merge', {
      [uuid]: {
        state: 'Rebooting'
      }
    })
    let ret = await api.action(uuid, realParam, progressCb);
    return ret.inventory;
  }),
  updateEcsInstancePassword: batchActionTemplate(async  (ctx, {param, progressCb}) => {
    let url = param.url, realParam = param.param;
    let ret = await api.updateEcsInstancePassword(url, realParam, progressCb);
    return ret.inventory;
  }),
}

