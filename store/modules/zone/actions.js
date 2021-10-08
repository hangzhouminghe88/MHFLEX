import Utils, {createQueryTemplate, mergeObj} from '../../utils';
import helper from './helpers';
import api from './apis';

let tableName = 'zone';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)
let queryTemplate = createQueryTemplate(tableName)

export default {
  basicQuery: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let retZone =  await helper.basicQuery(param);
    let zoneArray = retZone.zoneArray;
    let zoneMap = Utils.arrayToDict(zoneArray)
    let total = retZone.total
    return {
      total,
      inventories: zoneMap
     }
  }),
  detailQuery: queryTemplate(async ({ commit, dispatch, rootState }, uuid) => {
    let retZone =  await helper.detailQuery(uuid);
    return {
      [uuid]: retZone
    };
  }),
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    ctx.commit('merge', {
      [param]: {
        state: 'Deleting'
      }
    })
    let resp = await api.delete(uuid, progressCb);
    return resp.inventory;
  }),
  enable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param;
    ctx.commit('merge', {
      [param]: {
        state: 'Enabling'
      }
    });
    let resp = await api.enable(uuid, progressCb);
    return resp.inventory;
  }),
  disable: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param;
    ctx.commit('merge', {
      [param]:{
        state: 'stopping'
      }
    });
    let resp = await api.disable(uuid, progressCb);
    return resp.inventory;
  })
}
