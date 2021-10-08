import { arrayToDict, createQueryTemplate, createBatchQueryTemplate } from '../../utils'
import api from './apis'

const tableName = 'autoScalingGroupActivity'
let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = createBatchQueryTemplate(tableName)

export default {
  batchQuery: batchQueryTemplate(async ({ commit, rootState }, param) => {
    let resp = await api.query(param)
    let mainMap = arrayToDict(resp.inventories)
    return {
      total: resp.total,
      inventories: mainMap
    }
  }),
  query: queryTemplate(async ({ commit, rootState }, uuid) => {
    let item = await api.queryByUuid(uuid)
    return {
      [uuid]: {
        ...item
      }
    }
  })
}
