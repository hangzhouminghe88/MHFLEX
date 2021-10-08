
import Utils from '../../utils';
import helper from './helpers';
import api from './apis';
let tableName = 'timer';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);

export default {
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await helper.basicQuery(param);
    let timerArray = ret.timerArray
    let total = ret.total
    let timerMap = Utils.arrayToDict(timerArray)
    dispatch('queryRelatedData')
    return {
      total,
      inventories: timerMap
    }
  }),
  queryRelatedData:({ commit, dispatch, rootState }) => {
    let p = null, tasks = [];
    p = helper.querySchedulerJob(commit, dispatch, rootState);
    tasks.push(p);
    p = helper.queryVolume(commit, dispatch, rootState);
    tasks.push(p);
    p = helper.queryVm(commit, dispatch, rootState);
    tasks.push(p);
    return Promise.all(tasks);
  },
  delete: batchActionTemplate(async (ctx,{ param, progressCb }) => {
    let uuid = param;
    let resp = await api.delete(uuid, progressCb);
    return resp.inventory;
  }),
  create: batchActionTemplate(async (ctx,{ param, progressCb }) => {
    let resp = await api.create(param, progressCb);
    return resp.inventory;
  }),
  detailQuery:async ({ commit, dispatch, rootState }, param) => {
    let ret = await api.detailQuery(param);
    let timerArray = Utils.arrayToDict(ret.inventories)
    dispatch('queryRelatedData')
    commit('merge', timerArray);
    commit('mergeDbTable', {tableName, list: ret.inventories}, {root: true});
  },
  update: batchActionTemplate(async (ctx,{param, progressCb}) => {
    let uuid = param.uuid;
    let body = param.param;
    let resp = await api.update(uuid, body, progressCb);
    return resp.inventory;
  })
}
