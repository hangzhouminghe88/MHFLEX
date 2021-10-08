export default {
  methods: {
    delete(uuidList, type) {
      const self = this
      let event = self.createEvent('vRouterRouteEntry.action.delete', uuidList.length === 1 ? self.dbData.hybridvirtualrouterentry[uuidList[0]].destinationCidrBlock : '', uuidList.length)
      let url = 'hybrid/aliyun/route-entry/';
      let paramList = uuidList.map(uuid => {
        return {
          uuid,
          type,
          url
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudVirtualrouterEntry/delete', paramList, null, event);
    },
    //创建路由表
    create(param) {
      const self = this
      let event = self.createEvent('vRouterRouteEntry.action.add', param.params.destinationCidrBlock)
      return self.dispatchActionWithEvent('hybridAliCloudVirtualrouterEntry/create', param.params, null, event);
    }
  }
}
