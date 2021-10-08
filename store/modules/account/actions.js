import helper from "./helpers";
import Utils, {emptyPromise} from "../../utils";
import rpc from "../../../src/utils/rpc";
import api from './apis';

const tableName = 'account'
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTempalte = Utils.createBatchActionTemplate(tableName);

export default {
  query: batchQueryTemplate(async ({commit, dispatch, rootState}, param) => {
    let ret = await dispatch('basicQuery', param)
    let accountArray = ret.accountArray
    let accountMap = Utils.arrayToDict(accountArray)
    let total = ret.total
    dispatch('queryRelatedData', accountArray)
    return {
      total,
      inventories: accountMap
    }
  }),
  basicQuery: async ({commit, dispatch, rootState}, param) => {
    let ret
    ret = await helper.normalQuery(param)
    return ret
  },
  queryRelatedData: ({commit, dispatch, rootState}, param) => {
    let accountArray
    if (!_.isArray(param)) {
      accountArray = [param]
    } else {
      accountArray = param
    }
    if (accountArray.length <= 0) return
    let tasks = [], p = null;
    let accountMap = Utils.arrayToDict(accountArray)
    accountArray.forEach(account => {
      let uuid = account.uuid;
      p = helper.queryBindings(commit, dispatch, rootState, uuid)
      tasks.push(p);
      p = helper.queryUsages(commit, dispatch, rootState, uuid)
      tasks.push(p)
      p = helper.getAccountVmTotalNum(uuid, accountArray, commit, rpc, rootState);
      tasks.push(p)
    })
    return Promise.all(tasks)
  },
  create: async (ctx, {param, progressCb}) => {
    return api.createAccount(param, progressCb)
      .then((resp) => {
        let inventory = resp.inventory
        ctx.commit('merge', {
          [inventory.uuid]: inventory
        })
        return resp.inventory
      })
  },
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param
    ctx.commit('merge', {
      [param]: {
        state: 'Deleting'
      }
    })
    let resp = await api.delete(uuid, progressCb)
    return resp.inventory
  }),
  detailQuery: async ({commit, dispatch, rootState}, param) => {
    let uuid = param
    let ret = await dispatch('basicQuery', {q: [`uuid=${uuid}`]})
    let accountArray = ret.accountArray
    let accountMap = Utils.arrayToDict(accountArray);
    dispatch('queryByUuidRelatedData', accountArray)
    commit('merge', accountMap)
    return accountMap;
  },
  update: actionTempalte(async (ctx, {param, progressCb}) => {
    let resp = await api.update(param.uuid, param.value, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory
    }
    return emptyPromise(objMap)
  }),
  queryByUuidRelatedData: ({commit, dispatch, rootState}, param) => {
    let accountArray
    if (!_.isArray(param)) {
      accountArray = [param]
    } else {
      accountArray = param
    }
    if (accountArray.length <= 0) return
    let tasks = [], p = null;
    let uuid = accountArray[0].uuid;
    p = helper.queryVmResource(commit, rootState, uuid);
    tasks.push(p)
    p = helper.queryVolumeResource(commit, rootState, uuid);
    tasks.push(p)
    if (accountArray[0].name !== 'admin') {
      p = helper.queryDetailUsages(commit, dispatch, rootState, uuid)
      tasks.push(p)
    }
    p = helper.queryBindings(commit, dispatch, rootState, uuid)
    tasks.push(p);
    p = helper.getAccountVmTotalNum(uuid, accountArray, commit, rpc, rootState);
    tasks.push(p)
    return Promise.all(tasks)
  },
}
