import rpc from 'src/utils/rpc'
// import _ from 'lodash'

export default {
  create: async function (param, self) {
    if (param.ipMode === true) { // Create New Vip
      let createVipMsg = {
        name: `vip-for-${param.name}`,
        description: param.description,
        requiredIp: param.requiredIp === '' ? undefined : param.requiredIp,
        l3NetworkUuid: param.l3NetworkUuid
      }
      let vipevent = self.createEvent('vip.action.create', `vip-for-${param.name}`)
      let resp
      try {
        resp = await rpc.create('vips', createVipMsg, vipevent)
      } catch (e) {
        self.incEventFail(vipevent)
        return false
      }
      self.incEventSuccess(vipevent)
      let createLoadBalancerMsg = {
        name: param.name,
        description: param.description,
        vipUuid: resp.inventory.uuid
      }
      let lbevent = self.createEvent('loadbalancer.action.add', param.name)
      let lbresp
      try {
        lbresp = await rpc.create('load-balancers', createLoadBalancerMsg, lbevent)
      } catch (e) {
        self.incEventFail(lbevent)
        return false
      }
      self.incEventSuccess(lbevent)
      param.listenersList.forEach((item) => {
        let CreateLoadBalancerListenerMsg = {
          name: item.name,
          loadBalancerPort: item.loadBalancerPort,
          instancePort: item.instancePort,
          description: item.description,
          protocol: item.protocol,
          systemTags: item.systemTags
        }
        if (item.protocol === 'https' && item.certificateUuid !== '') {
          CreateLoadBalancerListenerMsg.certificateUuid = item.certificateUuid
        }
        let listenersEvent = self.createEvent('loadbalancer.action.addListener', CreateLoadBalancerListenerMsg.name)
        rpc.create(`load-balancers/${lbresp.inventory.uuid}/listeners`, CreateLoadBalancerListenerMsg, listenersEvent)
        .then(() => {
          self.incEventSuccess(listenersEvent)
        }, () => {
          self.incEventFail(listenersEvent)
        })
      })
      // await self.queryList()
      return true
    }
    if (param.ipMode === false) { // Use Existing Vip
      let createLoadBalancerMsg = {
        name: param.name,
        description: param.description,
        vipUuid: param.vipUuid
      }
      let event = self.createEvent('loadbalancer.action.add', param.name)
      let lbresp
      try {
        lbresp = await rpc.create('load-balancers', createLoadBalancerMsg, event)
      } catch (e) {
        self.incEventFail(event)
        return false
      }
      self.incEventSuccess(event)
      param.listenersList.forEach((item) => {
        let CreateLoadBalancerListenerMsg = {
          name: item.name,
          loadBalancerPort: item.loadBalancerPort,
          instancePort: item.instancePort,
          description: item.description,
          protocol: item.protocol,
          systemTags: item.systemTags
        }
        if (item.protocol === 'https' && item.certificateUuid !== '') {
          CreateLoadBalancerListenerMsg.certificateUuid = item.certificateUuid
        }
        let listenersEvent = self.createEvent('loadbalancer.action.addListener', CreateLoadBalancerListenerMsg.name)
        rpc.create(`load-balancers/${lbresp.inventory.uuid}/listeners`, CreateLoadBalancerListenerMsg, listenersEvent)
        .then(() => {
          self.incEventSuccess(listenersEvent)
        }, () => {
          self.incEventFail(listenersEvent)
        })
      })
      // await self.queryList()
      return true
    }
  }
}



// WEBPACK FOOTER //
// ./src/windows/LoadBalancer/Controller.js
