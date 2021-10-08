export default {
	methods: {
		create(param) {
			let self = this,
			event = self.createEvent('hybridvpcvpngateway.action.create', param.name);
			return self.dispatchActionWithEvent('hybridTencentVpcUserGateway/create', param, null, event);
		},

		delete(uuidList, isOrigin) {
      let self = this, event = null;
      event = self.createEvent('hybridvpcvpngateway.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentVpcUserGateway[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          url: isOrigin ? `hybrid/tencent/user-gateway/${uuid}/remote` : `hybrid/tencent/user-gateway/${uuid}`
        }
      })
      return self.dispatchActionWithEvent('hybridTencentVpcUserGateway/delete', paramList, null, event);
    },
	}
}