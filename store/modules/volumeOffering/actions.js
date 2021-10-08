import Utils, {arrayToDict, createQueryTemplate, emptyPromise, mergeMap, mergeObj} from '../../utils';
import helper from "./helpers";
import api from "./apis";
import accountResourceApi from '../accountResource/apis'

let tableName = 'volumeoffering';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTempalte = Utils.createActionTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
export default{
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) =>{
    let ret = await dispatch('basicQuery', param)
    let voArray = ret.voArray
    let mainMap = arrayToDict(voArray)
    let total = ret.total
    let voUuidList = voArray.map(vo => vo.uuid)
    if (rootState.db.common.isAdmin) {
      let list = await accountResourceApi.getSharedToPubliceResource(voUuidList)
      let accountResourceMap = arrayToDict(list)
      mainMap = mergeMap(mainMap, accountResourceMap)
    }
    return {
      total,
      inventories: mainMap,
      voUuidList
    }
  }),

   async basicQuery({ commit, dispatch, rootState }, param){
     let ret = await helper.normalQuery(param);
     let uuidList = ret.voArray.map((it) => it.uuid);
     return ret;
   },
  enable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let msg = await api.enable(uuid, progressCb)
    return msg.inventory
  }),
  disable: batchActionTemplate(async (ctx, {param, progressCb}) => {
   let uuid = param
   let msg = await api.disable(uuid, progressCb)
   return msg.inventory
  }),
  shareToPublic: actionTempalte(async (ctx, { param, progressCb }) => {
    let uuidList = Utils.normalizeParamList(param)
    await accountResourceApi.shareToPublic(uuidList, progressCb)
    let mainMap = {}
    uuidList.forEach(uuid => {
      mainMap[uuid] = {
        uuid,
        toPublic: true
      }
    })
    return mainMap
  }),
  revokeSharing: actionTempalte(async (ctx, { param, progressCb }) => {
    let uuidList = Utils.normalizeParamList(param)
    await accountResourceApi.revokePublicSharing(uuidList, progressCb)
    let mainMap = {}
    uuidList.forEach(uuid => {
      mainMap[uuid] = {
        uuid,
        toPublic: false
      }
    })
    return mainMap
  }),
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    await api.delete(uuid, progressCb)
    ctx.commit('delete', uuid)
  }),
  create: async ({ commit, state }, { param, progressCb }) => {
    let msg = {
      name: param.name,
      description: param.description,
      diskSize: param.diskSize
    }
    msg.systemTags = helper.buildSystemTag(param)
    await api.create(msg, progressCb)
  },
  detailQuery: queryTemplate(async ({ commit, rootState }, uuid) => {
    let item = await api.queryByUuid(uuid)
    let extraData = await api.queryExtraData(uuid, rootState.db.common.isAdmin)
    item = mergeObj(item, extraData)
    return {
      [uuid]: item
    }
  }),
  update: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param.value, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory
    }
    return emptyPromise(objMap)
  }),
}
