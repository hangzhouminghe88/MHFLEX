// import rpc from 'src/utils/rpc'
// import _ from 'lodash'
import { arrayToDict, mergeObj, mergeMap, emptyPromise, normalizeParamList, createActionTemplate, createBatchActionTemplate, createQueryTemplate, createBatchQueryTemplate } from '../../utils'
import helper from './helpers'
import api from './apis'
import accountResourceApi from '../accountResource/apis'
import systemTagApi from '../systemTag/apis'
import systemTagHelper from '../systemTag/helpers'

const tableName = 'instanceOffering'
let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = createBatchQueryTemplate(tableName)
let actionTempalte = createActionTemplate(tableName)
let batchActionTemplate = createBatchActionTemplate(tableName)

export default {
  batchQuery: batchQueryTemplate(async ({ commit, rootState }, param) => {
    let resp = await api.query(param)
    let uuidList = resp.inventories.map(it => it.uuid)
    let mainMap = arrayToDict(resp.inventories)
    let systemTagResp = await systemTagApi.get(uuidList)
    let systemTagMap = systemTagHelper.normalizeResp(systemTagResp.inventories)
    mainMap = mergeMap(mainMap, systemTagMap)
    if (rootState.db.common.isAdmin) {
      let list = await accountResourceApi.getSharedToPubliceResource(uuidList)
      let accountResourceMap = arrayToDict(list)
      mainMap = mergeMap(mainMap, accountResourceMap)
    }
    return {
      total: resp.total,
      inventories: mainMap
    }
  }),
  query: queryTemplate(async ({ commit, rootState }, uuid) => {
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
  enable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let msg = await api.enable(uuid, progressCb)
    return msg.inventory
  }),
  disable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let msg = await api.disable(uuid, progressCb)
    return msg.inventory
  }),
  shareToPublic: actionTempalte(async (ctx, { param, progressCb }) => {
    let uuidList = normalizeParamList(param)
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
    let uuidList = normalizeParamList(param)
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
  create: async ({ commit, state }, { param, progressCb }) => {
    let msg = {
      name: param.name,
      description: param.description,
      cpuNum: param.cpuNum,
      memorySize: param.memorySize,
      allocatorStrategy: param.allocatorStrategy
    }
    msg.systemTags = helper.buildSystemTag(param)
    await api.create(msg, progressCb)
  },
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    await api.delete(uuid, progressCb)
    ctx.commit('delete', uuid)
  })
}
