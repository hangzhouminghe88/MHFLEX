import {
  arrayToDict,
  createQueryTemplate,
  createActionTemplate,
  createBatchActionTemplate
} from '../../utils'
import api from './apis'

const tableName = 'cdRom'
let queryTemplate = createQueryTemplate(tableName)
let actionTempalte = createActionTemplate(tableName)
let batchActionTemplate = createBatchActionTemplate(tableName)

export default {
  query: queryTemplate(async ({ commit, rootState }, param) => {
    let resp = await api.query(param)
    let mainMap = arrayToDict(resp.inventories)
    return mainMap
  }),
  setDefault: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.setDefault(param, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory
    }
    return objMap
  }),
  create: async ({ commit, dispatch }, { param, progressCb }) => {
    console.log(param);
    let resp = await api.create(param, progressCb)
    let { vmInstanceUuid } = param
    commit('merge', {
      [resp.inventory.uuid]: resp.inventory
    })
    dispatch('vm/queryCDRom', vmInstanceUuid, { root: true })
    return resp.inventory
  },
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    await api.delete(uuid, progressCb)
    ctx.commit('delete', uuid)
  })
}
