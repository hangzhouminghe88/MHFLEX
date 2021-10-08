import rpc from 'src/utils/rpc';
import { checkBounce } from  'src/utils/utils';
export default {
	methods: {
	  create(param) {
			let self = this,
			event = this.createEvent('hybridvswitch.action.create', param.name);
			return self.dispatchActionWithEvent('hybridTencentSubNets/create',  param, null, event);
		},

		delete(uuidList, isOrigin) {
			let self = this,
			event = self.createEvent('hybridvswitch.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentSubNets[uuidList[0]].name : '', uuidList.length),
      tasks = [],
      url = null;
      if (isOrigin) {
        url = 'hybrid/tencent/vswitch/remote'
      } else {
        url = 'hybrid/tencent/vswitch'
			}
			let realParam = uuidList.map(uuid => {
				return{
					uuid,
					url
				}
			})
			return self.dispatchActionWithEvent('hybridTencentSubNets/delete',  realParam, null, event);
		},

		getTencentEcsInstanceNum(uuid){
			let value,self = this;
			try {
				value = self.dbData.hybridTencentSubNets[uuid].ecsInstanceNum;
				if (value === undefined) throw new Error('error');
			} catch (e) {
				if (checkBounce(`getEcsInstanceNum-${uuid}`)) return 0;
				value = 0;
				let vSwitch = _.cloneDeep(self.dbData.hybridTencentSubNets[uuid]);
				return rpc.query('hybrid/tencent/ecs', {
					count: true,
					q: `ecsVSwitchUuid=${uuid}`
				})
					.then((resp) => {
						vSwitch.ecsInstanceNum = resp.total
						return self.updateDbRow({
							tableName: 'hybridTencentSubNets',
							id: uuid,
							data: vSwitch
						})
					})
					.then(() => self.$nextTick(self.$forceUpdate));
			}
			return value;
		},
	}
}