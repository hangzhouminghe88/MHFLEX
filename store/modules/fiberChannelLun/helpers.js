import _ from 'lodash'
import rpc from 'src/utils/rpc'
import api from './apis'
import { arrayToDict } from '../../utils'
export default {
  async normalQuery (param) {
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      inventories: resp.inventories,
      total: resp.total
    }
  },
  async queryControllers (uuidList, commit) {
    let resp = await rpc.query(`storage-devices/fiber-channel/controllers`, {q: `uuid?=${uuidList}`})
    commit('fiberChannelController/merge', arrayToDict(resp.inventories), { root: true })
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelLun/helpers.js