import api from './apis';
import Utils from "../../utils";
import helper from "./helpers";

const tableName = 'usbdevice'
//创建查询模板
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)
//创建查询action模板
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)
export default {
  basicQuery: async ({ commit, dispatch, rootState }, param) => {
   let ret
    ret = helper.queryNormal(param);
    return ret
  },
  query:batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await dispatch('basicQuery', param)
    let usbArray = ret.usbArray
    let total = ret.total;
    await dispatch('queryRelationData', usbArray);
    let usbMap = Utils.arrayToDict(usbArray)
    return {
      total,
      inventories: usbMap
    }
  }),

  queryRelationData({commit, dispatch, rootState}, param) {
    let uuidList = [], tasks = [], p = null;
    if(!_.isArray(param)) uuidList = [param];
    else uuidList = param;
    if(uuidList.length <=0) return;
    uuidList.forEach((it) => {
      p = helper.queryHost(commit, it.hostUuid);
      tasks.push(p);
    })
    return Promise.all(tasks);
  },

  detach: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.detach(param.uuid, param.vmUuid, progressCb)
    return resp.inventory;
  }),
  attach: batchActionTemplate(async(ctx, {param, progressCb}) => {
    let resp = await api.attach(param.uuid, param.vmUuid, progressCb);
    return resp.inventory;
  }),
  disable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.disable(param, progressCb);
    return resp.inventory;
  }),
  enable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.enable(param, progressCb);
    return resp.inventory;
  }),
  update: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = '', realParam = '';
    uuid = param.uuid;
    realParam = param.param;
    let resp = await api.update(uuid, realParam, progressCb);
    return resp.inventory;
  }),
}
