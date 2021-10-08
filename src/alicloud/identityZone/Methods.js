import Utils from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import _ from 'lodash'

export default {
  methods: {
		...Utils,
    //获得区域名称
		getDataCenterName (uuid) {
			let value
			try {
				value = this.dbData.hybridDataCenter[uuid].regionName
			} catch (e) {
				if (this.checkBounce(`getDataCenterName-${uuid}`)) return ''
				value = ''
				return rpc.query(`hybrid/data-center/${uuid}`, {
					fields: 'regionName'
				})
					.then((resp) => {
						return this.updateDbRow({
							tableName: 'hybridDataCenter',
							id: uuid,
							data: resp.inventories[0]
						})
					}).then(() => this.$nextTick(this.$forceUpdate))
			}
			return value
		},

		delete (uuidList, fn) {
			let self = this, tasks = [], p = null,
        event = self.createEvent('hybrididentityzone.action.deleteidentityzone', uuidList.length === 1 ? self.dbData.hybridIdentityZone[uuidList[0]].zoneName : '', uuidList.length)
      for (let i in uuidList) {
				((uuid) => {
					p = rpc._delete(`hybrid/identity-zone/${uuid}`, null, event)
					.then( () => {
						self.incEventSuccess(event);
					}).catch ( () => {
						self.incEventFail(event);
					})
				})(uuidList[i]);
				tasks.push(p);
			}
			return Promise.all(tasks).then( () => {
				if(fn) fn()
			});
		},
		create: async function (param) {
		  let self = this;
			let event = this.createEvent('hybrididentityzone.action.Addidentityzone', param.localName)
			return rpc.create('hybrid/identity-zone', param, event)
			.then(() => {
				self.incEventSuccess(event);
			}).catch ( () => {
				self.incEventFail(event);
			})
		},
	}
}
