export default {
	methods: {
		create(param, fn){
			let self  = this, event = null;
			event = self.createEvent('hybridTencentVpcVRouter.action.create', param.cidrBlock);
			return self.dispatchActionWithEvent('hybridTencentVirtualRouterEntry/create', param, null, event);
		},

		delete(uuidList, fn){
			console.log(uuidList);
			let self = this, event = null;
			event = self.createEvent('hybridTencentVpcVRouter.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentVirtualRouterEntry[uuidList[0]].name : '', uuidList.length);
		  return self.dispatchActionWithEvent('hybridTencentVirtualRouterEntry/delete', uuidList, null, event);
	  }
	}
}