import api from "./apis";

export default {
  async normalQuery(param) {
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      voArray: resp.inventories,
      total: resp.total
    }
  },
  async isShareToAll(param, index, voArray) {
    return api.queryResource(`uuid=${param}`)
      .then((resp) => {
        let toPublic = false
        resp.inventories.forEach((item) => {
          if (item.toPublic) toPublic = true
        })
        return toPublic
      })
  },
  buildSystemTag (param) {
    let systemTags = []
    if(param.bandWidths.volumeTotalBandwidth){
      systemTags.push(`volumeTotalBandwidth::${param.bandWidths.volumeTotalBandwidth}`)
    }
    if(param.bandWidths.volumeReadBandwidth){
      systemTags.push(`volumeReadBandwidth::${param.bandWidths.volumeReadBandwidth}`)
    }
    if(param.bandWidths.volumeWriteBandwidth){
      systemTags.push(`volumeWriteBandwidth::${param.bandWidths.volumeWriteBandwidth}`)
    }
    return systemTags
  }

}
