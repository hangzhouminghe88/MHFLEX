import _ from 'lodash'

export default {
  normalizeResp (list) {
    let map = {}
    list.forEach((item) => {
      let obj = {
        uuid: item.resourceUuid
      }
      let val = item.tag.split('::')
      if (val.length !== 2) return
      obj[val[0]] = val[1]
      if (!map[obj.uuid]) map[obj.uuid] = {}
      map[obj.uuid] = _.assign(map[obj.uuid], obj)
    })
    return map
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/systemTag/helpers.js