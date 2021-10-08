import api from  './apis';

export default {
	async query(param){
		if (!param) return;
		let realParam  = _.cloneDeep(param);
		if(!param.replyWithCount) realParam.replyWithCount = true;
		let resp = await api.query(realParam);
		return {
			total: resp.total,
			inventories: resp.inventories
		}
	},

	async queryDataCenter(commit,uuid, dataCenterUuid) {
		let ret = await api.queryDataCenter(dataCenterUuid);
	  return {
			uuid,
			dataCenterName: (ret && ret.inventories && ret.inventories[0] && ret.inventories[0].regionName) ? ret.inventories[0].regionName : ''
		}
	},

  async queryVpc(commit, dispatch, uuid, vpcUuid) {
		let ret = await api.queryVpc(vpcUuid);
		return {
			uuid,
			vpcName: ret.inventories[0].name
		}
	},

	async queryEcs(commit, dispatch, uuid) {
		let ret = await api.queryEcs(uuid);
		return {
			uuid,
			ecsInstanceNum: (ret && ret.total) ? ret.total : 0
		}
	}
}
