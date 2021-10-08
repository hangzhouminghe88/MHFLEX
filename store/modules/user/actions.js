import Utils, {getResourceOwner, mergeMap, mergeObj} from '../../utils';
import helper from "./helpers";
import rpc from "src/utils/rpc";
import api from "./apis";

let tableName = 'user';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);

export default{
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await helper.basicQuery(param);
    let userArr = ret.userArray;
    let userMap = Utils.arrayToDict(userArr);
    let userUuidList = userArr.map(item => {
      return item.uuid
    });
    let resourceProjectMap = await getResourceOwner(userUuidList, commit, rpc, rootState);
    userMap = mergeMap(userMap, resourceProjectMap);
    return {
      total: ret.total,
      inventories: userMap
    }
  }),
  create: async ({ commit, state, rootState },{param, progressCb}) => {
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
    let userMap = mergeObj(resp.inventories[0], resourceProjectMap);
    return {
      [uuid]: userMap
    }
  }),
  update: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let body = param.param;
    let resp = await api.update(body, progressCb)
    return resp.inventory
  }),
}
