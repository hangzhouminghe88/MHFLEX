import Utils, {mergeObj} from '../../utils';
import helper from './helpers';
import api from './apis'
let tableName = 'scheduler';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName)
export default {
  basicQuery:async ({ commit, dispatch, rootState }, param) => {
    let ret;
    ret = await helper.normalQuery(param)
    return ret
  },
  query:batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await dispatch('basicQuery', param)
    let schedulerArray = ret.schedulerArray
    let total = ret.total
    let schedulerMap = Utils.arrayToDict(schedulerArray)
    let schedulerUuidList = schedulerArray.map(scheduler => scheduler.uuid);
    dispatch('queryRelatedData', schedulerArray)
    return {
      total,
      inventories: schedulerMap
    }
  }),
  queryRelatedData:({ commit, dispatch, rootState }, param) => {
    let scherdulerArray;
    if (!_.isArray(param)) {
      scherdulerArray = [param];
    } else {
      scherdulerArray = param;
    }
    if (scherdulerArray.length <= 0) return;
    let tasks = [], p = null;
      scherdulerArray.forEach((item)=>{
         p = helper.queryResources(commit, dispatch, rootState, item)
         tasks.push(p);
         p= helper.queryTrigger(commit, dispatch, rootState, item)
        tasks.push(p);
         p = helper.queryEvents(commit, dispatch, rootState, item)
         tasks.push(p);
       }
      )
    return Promise.all(tasks)
  },
  enable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let resp = await api.enabledScheduler(uuid, progressCb)
    return resp.inventory
  }),
  disable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param;
    let resp = await api.disabledScheduler(uuid, progressCb);
    return resp.inventory;
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param;
    let resp = await api.deleteScheduler(uuid, progressCb);
    return resp.inventory;
  }),
  detach: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let triggerUuid = param.triggerUuid;
    let resp = await api.detachScheduler(uuid, triggerUuid, progressCb);
    return resp.inventory;
  }),
  attach: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let triggerUuid = param.triggerUuid;
    let resp = await api.attachTimer(uuid, triggerUuid, progressCb);
    return resp.inventory;
  }),
  create:batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.create(param, progressCb);
    return resp;
  }),
  detailQuery: queryTemplate(async ({ commit, dispatch, rootState }, uuid) => {
    let resp = await api.queryByUuid(uuid)
    dispatch('queryRelatedData', resp.inventories)
    let schedulerMap = Utils.arrayToDict(resp.inventories);
    return schedulerMap
  }),
  update: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param.uuid;
    let resource = param.param;
    let resp = await api.update(uuid, resource, progressCb);
    return resp.inventory;
  }),
}
