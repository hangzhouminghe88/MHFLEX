import _ from 'lodash'

export default {
  getMergedObject (rootState, uuid) {
    let obj = _.cloneDeep(rootState.db.instanceOffering[uuid])
    if (rootState.db.instanceOfferingA) {
      obj = _.extend(obj, rootState.db.instanceOfferingA[uuid])
    }
    return obj
  },
  buildSystemTag (param) {
    let systemTags = []
    if (param.volumeTotalBandwidth !== '' && param.volumeTotalBandwidth !== undefined) {
      systemTags.push(`volumeTotalBandwidth::${param.volumeTotalBandwidth}`)
    }
    if (param.networkInboundBandwidth !== '' && param.networkInboundBandwidth !== undefined) {
      systemTags.push(`networkInboundBandwidth::${param.networkInboundBandwidth}`)
    }
    if (param.networkOutboundBandwidth !== '' && param.networkOutboundBandwidth !== undefined) {
      systemTags.push(`networkOutboundBandwidth::${param.networkOutboundBandwidth}`)
    }
    if (param.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy' && param.maxInstancePerHost !== undefined) {
      systemTags.push(`maxInstancePerHost::${param.maxInstancePerHost}`)
    }
    if (param.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy') {
      systemTags.push(`minimumCPUUsageHostAllocatorStrategyMode::${param.strategyPattern}`)
    }
    if (param.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy') {
      systemTags.push(`minimumMemoryUsageHostAllocatorStrategyMode::${param.strategyPattern}`)
    }
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



// WEBPACK FOOTER //
// ./src/store/modules/instanceOffering/helpers.js
