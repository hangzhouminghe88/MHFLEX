import {
  arrayToDict,
  emptyPromise,
  createActionTemplate,
  createBatchActionTemplate,
  createQueryTemplate,
  createBatchQueryTemplate
} from '../../utils'
import api from './apis'
import _ from 'lodash'
import helper from './helpers'
const tableName = 'fiberChannel'
let queryTemplate = createQueryTemplate(tableName)
let actionTempalte = createActionTemplate(tableName)
let batchActionTempalte = createBatchActionTemplate(tableName)
let batchQueryTemplate = createBatchQueryTemplate(tableName)

export default {
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let ret = await helper.normalQuery(param)
    let inventories = ret.inventories
    let result = arrayToDict(inventories)
    dispatch('queryRelatedData', result)
    return {
      total: inventories.length,
      inventories: result
    }
  }),
  queryRelatedData: ({ commit, dispatch, rootState }, param) => {
    let controllerUuids = _.uniq(_.values(param).map(v => v.fiberChannelStorageUuid))
    helper.queryControllers(controllerUuids, commit)
  },
  queryScsiLun: batchQueryTemplate(async ({ commit, rootState }, param) => {
    let ret = await api.queryScsiLun(param)
    let inventories = ret.inventories
    let result = arrayToDict(inventories)
    return {
      total: ret.total,
      inventories: result
    }
  }),
  attachVm: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.attachVm(param.vmInstanceUuid, param.uuid, progressCb)
    return resp.inventory
  }),
  detachVm: batchActionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.detachVm(param.vmInstanceUuid, param.uuid, progressCb)
    return resp.inventory
  }),
  update: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory
    }
    return emptyPromise(objMap)
  }),
  refresh: queryTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.refresh(param.zoneUuid, progressCb)
    let mainMap = arrayToDict(resp.inventories)
    return mainMap
  })
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelLun/actions.js