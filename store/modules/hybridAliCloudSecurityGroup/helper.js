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

	queryDataCenter(commit,uuidList) {
	 if(!uuidList) return;
	 uuidList.forEach(uuid => {
		 api.queryDataCenter(uuid).then ( (resp) => {
			commit('merge', {
				uuid,
				dataCenterName: resp.inventories[0].regionName
			})
		 })
	 })
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
			ecsInstanceNum:  ret.total
		}
	}
}
