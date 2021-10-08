import { checkBounce } from 'src/utils/utils';
import rpc from 'src/utils/rpc';

export default {
	methods: {
		create(param) {
      let self = this;
      let event = self.createEvent('hybridvirtualprivatecloud.action.createVirtualPrivateCloud', param.name)
      return self.dispatchActionWithEvent('hybridTencentVpc/create', param,null, event)
		},
		
		getTencentEcsInstanceNum (uuid) {
			let value
			let self = this
			try {
				value = self.dbData.hybridTencentVirtualPrivateCloud[uuid].ecsInstanceNum
				if (value === undefined) throw new Error('error')
			} catch (e) {
				if (checkBounce(`getTencentEcsInstanceNum-${uuid}`)) return 0
				value = 0
				rpc.query('hybrid/tencent/vswitch', {
					q: `ecsVpcUuid=${uuid}`,
					fields: 'uuid'
				})
					.then((resp) => {
						if (resp.inventories.length > 0) {
							let vSwitchUuidList = resp.inventories.map(it => it.uuid)
							let ecsVpc = _.cloneDeep(self.dbData.hybridTencentVirtualPrivateCloud[uuid])
							return rpc.query('hybrid/tencent/ecs', {
								count: true,
								q: `ecsVSwitchUuid?=${vSwitchUuidList}`
							})
								.then((resp) => {
									ecsVpc.ecsInstanceNum = resp.total
									return self.updateDbRow({
										tableName: 'hybridTencentVirtualPrivateCloud',
										id: uuid,
										data: ecsVpc
									})
								})
						} else {
							return 0
						}
					})
					.then(() => self.$nextTick(self.$forceUpdate))
			}
			return value
		},

		//删除vpc
		delete(uuidList, isOrigin) {
			let self = this, 
      event = self.createEvent('hybridvirtualprivatecloud.action.deleteVirtualPrivateCloud', uuidList.length === 1 ? self.dbData.hybridTencentVirtualPrivateCloud[uuidList[0]].name : '', uuidList.length),
      url = null;
      if (isOrigin) {
        url = 'hybrid/tencent/vpc/remote/'
      } else {
        url = 'hybrid/tencent/vpc/'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          uuid,
          url
        }
      })
      return self.dispatchActionWithEvent('hybridTencentVpc/delete', paramList, null, event);
		}
	}
}