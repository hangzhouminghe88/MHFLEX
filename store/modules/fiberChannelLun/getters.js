import _ from 'lodash'

export default {
  get: (state, getters, rootState) => (uuid) => {
    if (!state[uuid]) return {}
    return state[uuid]
  },
  getList: (state, getters, rootState) => (uuidList) => {
    if (!_.isArray(uuidList)) return []
    let itemList = uuidList.map(uuid => state[uuid])
    let tempArr = _.partition(itemList, it => it.fiberChannelStorageUuid)
    tempArr.forEach(luns => {
      if (luns.length > 0) {
        let firstLun = luns[0]
        let controller = _.get(rootState.fiberChannelController, `[${firstLun.fiberChannelStorageUuid}]`)
        if (controller) {
          controller.vendor = firstLun.vendor
          controller.model = firstLun.model
          luns.forEach(lun => {
            lun.isLeaf = true
            lun.controllerName = controller.name
          })
          luns.unshift(controller)
        }
      }
    })
    return _.flatten(tempArr)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelLun/getters.js