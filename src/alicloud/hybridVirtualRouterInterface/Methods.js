import { checkBounce } from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import _ from 'lodash'

export default {
	methods: {
		updateCount () {
			rpc.query('hybrid/aliyun/router-interface', {
				count: true,
				q: 'vRouterType=vbr'
			})
				.then((resp) => {
					this.updateWindow({
						vbrCount: resp.total
					})
				})
			rpc.query('hybrid/aliyun/router-interface', {
				count: true,
				q: 'vRouterType=vrouter'
			})
				.then((resp) => {
					this.updateWindow({
						vrouterCount: resp.total
					})
				})
		},

		getVirtualRouterId: function (uuid) {
			let value
			let self = this
			try {
				value = self.dbData.hybridRouterInterface[uuid].virtualRouterId
				if (value === undefined) throw new Error('error')
			} catch (e) {
				if (checkBounce(`getVirtualRouterName-${uuid}`)) return ''
				value = ''
				if (self.dbData.hybridRouterInterface[uuid].vRouterType === 'vrouter') {
					rpc.query(`hybrid/aliyun/vrouter/${self.dbData.hybridRouterInterface[uuid].virtualRouterUuid}`, {
						fields: 'vrId'
					})
						.then((resp) => {
							if (resp.inventories.length > 0) {
								let hybridRouterInterface = _.cloneDeep(self.dbData.hybridRouterInterface[uuid])
								hybridRouterInterface.virtualRouterId = resp.inventories[0].vrId
								return self.updateDbRow({
									tableName: 'hybridRouterInterface',
									id: uuid,
									data: hybridRouterInterface
								})
							} else {
								return ''
							}
						})
						.then(() => self.$nextTick(self.$forceUpdate))
				} else if (self.dbData.hybridRouterInterface[uuid].vRouterType === 'vbr') {
					rpc.query(`hybrid/aliyun/border-router/${self.dbData.hybridRouterInterface[uuid].virtualRouterUuid}`, {
						fields: 'vbrId'
					})
						.then((resp) => {
							if (resp.inventories.length > 0) {
								let hybridRouterInterface = _.cloneDeep(self.dbData.hybridRouterInterface[uuid])
								hybridRouterInterface.virtualRouterId = resp.inventories[0].vbrId
								return self.updateDbRow({
									tableName: 'hybridRouterInterface',
									id: uuid,
									data: hybridRouterInterface
								})
							} else {
								return ''
							}
						})
						.then(() => self.$nextTick(self.$forceUpdate))
				} else {
					return ''
				}
			}
			return value
		},

		getAliyunVirtualRouterName: function (uuid) {
			let value
			const self = this
			try {
				value = self.dbData.hybridAliyunVirtualRouter[self.dbData.hybridRouterInterface[uuid].virtualRouterUuid].name
			} catch (e) {
				if (checkBounce(`getAliyunVirtualRouterName-${uuid}`)) return ''
				value = ''
				rpc.query(`hybrid/aliyun/vrouter/${self.dbData.hybridRouterInterface[uuid].virtualRouterUuid}`)
					.then((resp) => {
						if (resp.inventories.length > 0) {
							return self.updateDbRow({
								tableName: 'hybridAliyunVirtualRouter',
								id: resp.inventories[0].uuid,
								data: resp.inventories[0]
							})
						} else {
							return ''
						}
					})
					.then(() => this.$nextTick(this.$forceUpdate))
			}
			return value
		},

		create(param) {
			let self = this, event = this.createEvent('hybridrouterinterfacepair.action.create');
			return self.dispatchActionWithEvent('hybridAlicloudVirtualRouterInterface/create', param, null, event)
		}
	}
}
