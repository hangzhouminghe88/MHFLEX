import Utils from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = "accesskey";
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let batchQueryTemplate =  Utils.createBatchQueryTemplate(tableName);
let createTemplate = Utils.createActionTemplate(tableName);

export default {
  basicQuery: batchQueryTemplate(async ({commit, rootState, dispatch}, param) => {
    let resp = await helper.basicQuery(param);
    let total = resp.total;
    let accessKeyArray = resp.accessKeyArray;
    await dispatch('relationResource', accessKeyArray);
    let mainMap = Utils.arrayToDict(accessKeyArray);
    return {
      total,
      inventories: mainMap
    }
  }),
  relationResource:async ({ commit, dispatch, rootState }, param) => {
    let accessKeyArray
    if (!_.isArray(param)) {
      accessKeyArray = [param]
    } else {
      accessKeyArray = param
    }
    let uuidList = accessKeyArray.map(item => {
      return item.uuid
    });
    let accountRes = await helper.queryAccountResource(uuidList);
    let resourceUuidList = [...new Set(accountRes.inventories.map((item) => item.accountUuid))].join();
    let tasks = [], p = null;
    p = helper.queryAccount(commit,resourceUuidList);
    tasks.push(p);
    p = helper.queryProjects(commit, resourceUuidList);
    tasks.push(p);
    let obj = {};
    return Promise.all(tasks)
      .then((resp) => {
        let dataAccount = resp[0].inventories
        Object.keys(dataAccount).forEach((key) => {
          let item = dataAccount[key]
          obj[item.uuid] = item.name
        })
        let data = resp[1].inventories
        Object.keys(data).forEach((key) => {
          let item = data[key]
          obj[item.linkedAccountUuid] = item.name
        })
      }).then(()=>{
        accountRes.inventories.forEach((item) => {
          accessKeyArray.forEach((it) => {
            if (item.resourceUuid === it.uuid) {
              it.accountName = obj[item.ownerAccountUuid]
            }
          })
        })
      });
  },
  enable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.enable(param, progressCb);
    return resp.inventory;
  }),
  disable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let resp = await api.disable(param, progressCb);
    return resp.inventory;
  }),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let bsRep =  api.queryBs(param);
    let resp = await api.delete(param, progressCb);
    return resp.inventory;
  }),
  create: createTemplate(async (ctx, {param, progressCb}) => {
    let resp  = await api.create(param, progressCb);
    return resp.inventory;
  })
}


