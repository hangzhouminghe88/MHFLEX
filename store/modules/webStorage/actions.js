import { arrayToDict, emptyPromise, createActionTemplate, createBatchActionTemplate, createQueryTemplate } from '../../utils'
import api from './apis'

const tableName = 'webStorage'
let queryTemplate = createQueryTemplate(tableName)
let actionTempalte = createActionTemplate(tableName)
let batchActionTempalte = createBatchActionTemplate(tableName)

export default {
  queryList: queryTemplate(async ({ commit, rootState }, param) => {
    let resp = await api.queryList(param)
    let mainMap = arrayToDict(resp.inventories)
    return mainMap
  }),
  queryByUuid: queryTemplate(async ({ commit, rootState }, uuid) => {
    let item = await api.queryByUuid(uuid)
    return {
      [uuid]: item
    }
  }),
  create: async ({ commit, state }, { param, progressCb }) => {
    let msg = {
      name: param.name,
      ip: param.ip,
      port: param.port,
      chapUserName: param.chapUserName,
      chapUserPassword: param.chapUserPassword
    }
    let resp = await api.create(msg, progressCb)
    return resp
  },
  update: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory
    }
    return emptyPromise(objMap)
  }),
  start: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let msg = await api.update(param.uuid, param, progressCb)
    return msg.inventory
  }),
  stop: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let msg = await api.update(param.uuid, param, progressCb)
    return msg.inventory
  }),
  delete: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let uuid = param
    await api.delete(uuid, progressCb)
    ctx.commit('delete', uuid)
  }),
  queryLunList: async ({ commit, rootState }, param) => {
    return await api.queryLunList(param)
  },
  attachCluster: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.attachCluster(param.clusterUuid, param.uuid, progressCb)
    // let objMap = {
    //   [param.uuid]: resp.inventory
    // }
    return resp.inventory
  }),
  detachCluster: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.detachCluster(param.clusterUuid, param.uuid, progressCb)
    // let objMap = {
    //   [param.uuid]: resp.inventory
    // }
    return resp.inventory
  }),
  detachWebStorage: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.detachCluster(param.clusterUuid, param.uuid, progressCb)
    return resp.inventory
  }),
  attachWebStorage: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.attachCluster(param.clusterUuid, param.uuid, progressCb)
    return resp.inventory
  }),
  refreshIscsiServer: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.refreshIscsiServer(param.uuid, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory ?  resp.inventory : []
    }
    return emptyPromise(objMap)
  })
}



// WEBPACK FOOTER //
// ./src/store/modules/webStorage/actions.js
