export default {
  methods: {
    delete(uuidList, isOrigin) {
      let self = this, event = null;
      event = self.createEvent('hybridvpcvpngateway.action.delete', uuidList.length === 1 ? self.dbData.hybridVpcUserVpnGateway[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          url: isOrigin ? `hybrid/user-gateway/${uuid}/remote` : `hybrid/user-gateway/${uuid}`
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudUserVpnGateway/delete', paramList, null, event);
    },

    create(param) {
      let self = this, event = null;
      event = self.createEvent('hybridvpcvpngateway.action.create', param.name);
      return self.dispatchActionWithEvent('hybridAliCloudUserVpnGateway/create', param, null, event);
    }
  }
}
