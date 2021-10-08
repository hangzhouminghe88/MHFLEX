import Utils, {getResourceOwner, mergeMap} from '../../utils';
import helper from "./helpers";
import rpc from "src/utils/rpc";
import api from "./apis";

let tableName = 'usergroup';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);

export default{
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await helper.basicQuery(param);
    let userGroupArr = ret.userGroupArray;
    let userGroupMap = Utils.arrayToDict(userGroupArr);
    let userUuidList = userGroupArr.map(item => {
      return item.uuid
    });
    let resourceProjectMap = await getResourceOwner(userUuidList, commit, rpc, rootState);
    userGroupMap = mergeMap(userGroupMap, resourceProjectMap);
    return {
      total: ret.total,
      inventories: userGroupMap
    }
  }),
  create:async ({ commit, state, rootState }, {param, progressCb}) => {
    return api.create(param, progressCb)
      .then((resp) => {
        let inventory = resp.inventory
        commit('merge', {
          [inventory.uuid]: inventory
        })
      })
  },
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    ctx.commit('merge', {
      [param]: {
        state: 'Deleting'
      }
    })
    let resp = await api.delete(uuid, progressCb)
    return resp.inventory
  }),
  detailQuery:  queryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let uuid = param;
    let resp = await api.detailQuery(uuid);
    let resourceProjectMap = await getResourceOwner([uuid], commit, rpc, rootState);
    let userMap = mergeMap(resp.inventories[0], resourceProjectMap);
    return {
      [uuid]: userMap
    }
  }),
  update: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let body = param.param;
    let resp = await api.update(body, progressCb)
    return resp.inventory
  }),
  addUser: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param.uuid;
    let userGroupUuid = param.userGroupUuid;
    let resp = await api.addUser(uuid, userGroupUuid, progressCb)
    return resp.inventory
  }),
}
