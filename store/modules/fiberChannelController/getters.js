import _ from 'lodash'
import util from '../../utils'

export default {
  get: (state, getters, rootState) => (uuidList) => {
    let result = []
    if (!_.isArray(uuidList)) uuidList = [uuidList]
    let itemList = _.cloneDeep(util.getList(state, uuidList))
    for (let item of itemList) {
      let luns = item.fiberChannelLuns
      item.children = []
      if (_.isArray(luns) && luns.length > 0) {
        let lun = luns[0]
        item.vendor = lun.vendor
        item.model = lun.model
      }
      let lunUuids = luns.map(v => v.uuid)
      luns = _.values(rootState.fiberChannelLun).filter(lun => _.includes(lunUuids, lun.uuid))
      for (let child of luns) {
        child.parentUuid = item.uuid
        child.isLeaf = true
        item.children.push(child)
      }
      result.push(item)
      item.children.forEach(child => {
        if (_.includes(uuidList, child.uuid)) result.push(child)
      })
    }
    return result
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelController/getters.js
