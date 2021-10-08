import rpc from 'src/utils/rpc'
export default {
	name: "HybridHuaweiInstanceTypeList",

	methods: {
		queryList: function () {
			let self = this;
			self.windowData.loading = true;
			rpc.query('hybrid/huawei/ecs/type', {
				q: this.getCondition(),
				identityZoneUuid: this.getIZoneUuid()
			}).then((resp) => {
				let pageCount = resp.types.length === 0 ? 1 : Math.ceil(resp.types.length / this.windowData.pageSize)
				this.updateWindow({
					availableCount: resp.types.length,
					pageCount: pageCount
				})
				let uuidList = resp.types.map((item, index) => {
					item.uuid = item.instanceType + index
					return item.instanceType + index
				})
				let list = _.chunk(uuidList, this.windowData.pageSize)
				this.updateDbTable({
					tableName: 'HybridHuaweiEcsInstanceType',
					list: resp.types
				})
				this.updateWindow({
					uuidList: list[this.windowData.pageIndex - 1],
				}).then( () => {
					self.itemList = self.getData();
					self.windowData.loading = false;
				})
			}).catch( () => {
				self.windowData.loading = false;
			})
		},

		getData() {
			let self = this;
			return self.windowData.uuidList.map((uuid) => {
				return self.dbData.HybridHuaweiEcsInstanceType[uuid]
			})
		}
	}
}
