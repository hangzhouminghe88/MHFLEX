import rpc from 'src/utils/rpc'
// import _ from 'lodash'

export default {
  create: async function (param, self) {
    let event = self.createEvent('instanceOffering.action.create', param.name)
    let msg = {
      name: param.name,
      description: param.description,
      cpuNum: param.cpuNum,
      memorySize: param.memorySize,
      allocatorStrategy: param.allocatorStrategy
    }
    msg.systemTags = []
    self.addSystemTags(msg.systemTags, param)
    // if (param.volumeTotalBandwidth !== '' && param.volumeTotalBandwidth !== undefined) self.addSystemTags(msg.systemTags, param)
    // if (param.volumeTotalBandwidth !== '' && param.volumeTotalBandwidth !== undefined) self.pushVolumeToSystemTags(msg.systemTags, `volumeTotalBandwidth::${param.volumeTotalBandwidth}`)
    // if (param.networkInboundBandwidth !== '' && param.networkInboundBandwidth !== undefined) self.pushVolumeToSystemTags(msg.systemTags, `networkInboundBandwidth::${param.networkInboundBandwidth}`)
    // if (param.networkOutboundBandwidth !== '' && param.networkOutboundBandwidth !== undefined) self.pushVolumeToSystemTags(msg.systemTags, `networkOutboundBandwidth::${param.networkOutboundBandwidth}`)
    let resp
    try {
      resp = await rpc.create('instance-offerings', msg, event)
    } catch (e) {
      self.incEventFail(event)
      return false
    }
    self.incEventSuccess(event)
    // if (param.volumeTotalBandwidth !== '') {
    //   let body = {
    //     'resourceType': 'InstanceOfferingVO',
    //     'resourceUuid': resp.inventory.uuid,
    //     'tag': 'volumeTotalBandwidth::' + param.volumeTotalBandwidth
    //   }
    //   rpc.create('system-tags', body)
    // }
    // if (param.networkInboundBandwidth !== '') {
    //   let body = {
    //     'resourceType': 'InstanceOfferingVO',
    //     'resourceUuid': resp.inventory.uuid,
    //     'tag': 'networkInboundBandwidth::' + param.networkInboundBandwidth
    //   }
    //   rpc.create('system-tags', body)
    // }
    // if (param.networkOutboundBandwidth !== '') {
    //   let body = {
    //     'resourceType': 'InstanceOfferingVO',
    //     'resourceUuid': resp.inventory.uuid,
    //     'tag': 'networkOutboundBandwidth::' + param.networkOutboundBandwidth
    //   }
    //   rpc.create('system-tags', body)
    // }
    //  whether create resource in InstanceOffering page directly or not
    let uuidList = []
    let table = {}
    if (self.windowData.uuidList) {
      uuidList = self.windowData.uuidList.slice()
      uuidList.unshift(resp.inventory.uuid)
      let row = {}
      row[resp.inventory.uuid] = {}
      row[resp.inventory.uuid].selected = false
      table = Object.assign({}, {...self.windowData.table}, row)
    }
    let obj = {toPublic: false}
    await self.updateDbRow({
      tableName: 'instanceOffering',
      id: resp.inventory.uuid,
      data: {
        ...resp.inventory,
        ...obj
      }
    })
    await self.updateWindow({uuidList, table})
    // updateCount only been invoked when creating Resource in List Page
    if (self.queryList) {
      await self.queryList()
    }
    return msg
  },
  addSystemTags: function (list, param, self) {
    if (param.volumeTotalBandwidth !== '' && param.volumeTotalBandwidth !== undefined) list.push(`volumeTotalBandwidth::${param.volumeTotalBandwidth}`)
    if (param.networkInboundBandwidth !== '' && param.networkInboundBandwidth !== undefined) list.push(`networkInboundBandwidth::${param.networkInboundBandwidth}`)
    if (param.networkOutboundBandwidth !== '' && param.networkOutboundBandwidth !== undefined) list.push(`networkOutboundBandwidth::${param.networkOutboundBandwidth}`)
    if (param.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy' && param.maxInstancePerHost !== undefined) list.push(`maxInstancePerHost::${param.maxInstancePerHost}`)
    if (param.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy') list.push(`minimumCPUUsageHostAllocatorStrategyMode::${param.strategyPattern}`)
    if (param.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy') list.push(`minimumMemoryUsageHostAllocatorStrategyMode::${param.strategyPattern}`)
    return list
  },
  pushVolumeToSystemTags: function (list, value, self) {
    list.push(value)
    return list
  }
}
