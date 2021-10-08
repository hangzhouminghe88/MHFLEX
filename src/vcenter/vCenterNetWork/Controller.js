import rpc from 'src/utils/rpc'
// import _ from 'lodash'

export default {
  create: async function (param, fn, self) {
    // Create L2
    let createL2 = {}
    createL2['name'] = param.name
    createL2['vlan'] = param.vlan
    createL2['zoneUuid'] = param.zoneUuid
    createL2['physicalInterface'] = param.physicalInterface
    let eventl2 = self.createEvent('l2network.action.create', param.name)
    let respl2
    try {
      respl2 = await rpc.create(`l2-networks/${param.l2type}`, createL2, eventl2)
    } catch (e) {
      self.incEventFail(eventl2)
      return false // should return
    }
    self.incEventSuccess(eventl2)
    // Attach L2 to Cluster
    if (param.clusterUuid !== '' && param.clusterUuid !== undefined) {
      let i18nContext = 'l2network.action.attach'
      if (self.dbData.cluster[param.clusterUuid] && self.dbData.cluster[param.clusterUuid].hypervisorType === 'baremetal') {
        i18nContext = 'l2network.action.attachBaremetalCluster'
      }
      let attachclusterevent = self.createEvent(i18nContext, param.name)
      // try {
      await rpc.post(`l2-networks/${respl2.inventory.uuid}/clusters/${param.clusterUuid}`, {}, attachclusterevent)
        .then(() => {
          self.incEventSuccess(attachclusterevent)
        }, () => {
          self.incEventFail(attachclusterevent)
        })
      // } catch (e) {
      //   self.incEventFail(attachclusterevent)
      // }
      // self.incEventSuccess(attachclusterevent)
    }
    // Create L3
    let createL3 = {}
    createL3['name'] = param.name
    createL3['type'] = param.type
    createL3['l2NetworkUuid'] = respl2.inventory.uuid
    createL3['category'] = param.category
    let event = self.createEvent('l3network.action.create', createL3.name)
    let resp
    try {
      resp = await rpc.create('l3-networks', createL3, event)
    } catch (e) {
      self.incEventFail(event)
      return false // should return
    }
    self.incEventSuccess(event)
    // Attach Network Service
    if (param.networkServices && !param.showNetworkType) {
      let AttachNetworkServiceToL3Network = {}
      AttachNetworkServiceToL3Network['networkServices'] = param.networkServices
      await rpc.create('l3-networks/' + resp.inventory.uuid + '/network-services', AttachNetworkServiceToL3Network)
    }
    // vrouter network
    if (param.virtualRouterOfferingUuid && !param.showNetworkType) {
      await rpc.create('system-tags', {
        resourceType: 'InstanceOfferingVO',
        resourceUuid: param.virtualRouterOfferingUuid,
        tag: `guestL3Network::${resp.inventory.uuid}`
      })
    }
    // Add IpRange
    let IpRangeevent = self.createEvent('l3network.action.addIpRange', param.name)
    if (param.ipRangeOrcidr === false) {
      let addIpRange = {}
      addIpRange['name'] = param.name
      addIpRange['startIp'] = param.startIp
      addIpRange['endIp'] = param.endIp
      addIpRange['netmask'] = param.netmask
      addIpRange['gateway'] = param.gateway
      try {
        await rpc.create('l3-networks/' + resp.inventory.uuid + '/ip-ranges', addIpRange, IpRangeevent)
      } catch (e) {
        self.incEventFail(IpRangeevent)
      }
      self.incEventSuccess(IpRangeevent)
    } else {
      try {
        await rpc.create('l3-networks/' + resp.inventory.uuid + '/ip-ranges/by-cidr', {
          name: param.name,
          networkCidr: param.cidr
        }, IpRangeevent)
      } catch (e) {
        self.incEventFail(IpRangeevent)
      }
      self.incEventSuccess(IpRangeevent)
    }
    // Add DNS
    let dnsevent = self.createEvent('l3network.action.addDns', param.name)
    let addDnsToL3Network = {}
    if (param.dns === '' || param.dns === undefined) param.dns = '223.5.5.5'
    addDnsToL3Network['dns'] = param.dns
    try {
      await rpc.create('l3-networks/' + resp.inventory.uuid + '/dns', addDnsToL3Network, dnsevent)
    } catch (e) {
      self.incEventFail(dnsevent)
    }
    self.incEventSuccess(dnsevent)
    // whether create L3 from L3 Page directly or not
    if (self.windowData.uuidList && self.queryList) {
      await self.queryList()
    }
    if (fn) await fn()
    return true
  },
  attach: function (uuid, clusterList, self) {
    let i18nContext = 'l2network.action.attach'
    if (self.dbData.cluster[clusterList[0]] && self.dbData.cluster[clusterList[0]].hypervisorType === 'baremetal') {
      i18nContext = 'l2network.action.attachBaremetalCluster'
    }
    let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, clusterList.length)
    let tasks = []
    let p = null
    clusterList.forEach(function (cluster) {
      ((cluster) => {
        p = rpc.create(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'l2network',
              id: uuid,
              data: resp.inventory
            })
            self.queryList()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
        tasks.push(p)
      })(cluster)
    })
    return Promise.all(tasks)
  },
  delete(uuidList,fn, self){
    let p = null, tasks = [];
    let event = self.createEvent('l2network.action.delete', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name: uuidList.length);
    uuidList.forEach((uuid) => {
      ((uuid) => {
        p = rpc._delete(`l2-networks/${self.dbData.l3network[uuid].l2NetworkUuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event);
          }).catch(() => {self.incEventFail(event)})
        tasks.push(p);
      })(uuid)
    })
    return Promise.all(tasks).then(() => {if(fn) fn()});
  }
}
