import {
  arrayToDict,
  createBatchQueryTemplate
} from '../../utils'
import _ from 'lodash'
import api from './apis'
const tableName = 'fiberChannelController'
let batchQueryTemplate = createBatchQueryTemplate(tableName)

export default {
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let luns = await dispatch('fiberChannelLun/query', param, {root: true})
    let lunList = _.values(rootState.fiberChannelLun).filter(it => _.includes(luns.uuidList, it.uuid))
    let uuids = _.uniq(lunList.map(it => it.fiberChannelStorageUuid))
    let ret = await api.query({q: `uuid?=${uuids}`})
    let inventories = ret.inventories
    inventories.forEach(controller => {
      let fiberChannelLuns = controller.fiberChannelLuns
      fiberChannelLuns.forEach((lun, index, arr) => {
        if (!_.includes(luns.uuidList, lun.uuid)) {
          _.remove(arr, v => v.uuid === lun.uuid)
        }
      })
      controller.fiberChannelLuns = fiberChannelLuns
    })
    let total = inventories.length
    let result = arrayToDict(inventories)
    return {
      total,
      inventories: result
    }
  })
}
