import  rpc from 'src/utils/rpc';

export default {
	methods: {
		//创建Vpn连接
		async create(param) {
			debugger
			let ikeResp
			try {
				let ike = {
					name: param.name,
					description: param.description,
					psk: param.IKEpsk,
					pfs: param.IKEpfs,
					version: param.IKEversion,
					mode: param.IKEmode,
					encAlg: param.IKEencAlg,
					authAlg: param.IKEauthAlg,
					lifetime: param.IKElifetime,
					localIp: param.IKElocalIp,
					remoteIp: param.IKEremoteIp
				}
				ikeResp = await rpc.create('hybrid/tencent/vpn-connection/ike', ike)
			} catch (e) {
				console.log(e)
				return
			}
			// create IPSec
			let IPSecResp
			try {
				let IPSec = {
					name: param.name,
					description: param.description,
					pfs: param.IPSecpfs,
					encAlg: param.IPSecencAlg,
					authAlg: param.IPSecauthAlg,
					lifetime: param.IPSeclifetime
				}
				IPSecResp = await rpc.create('hybrid/tencent/vpn-connection/ipsec', IPSec)
			} catch (e) {
				console.log(e)
				return
			}

			let event = this.createEvent('hybridvpcvpnconnection.action.create', param.name)
			let resp
			try {
				param.ikeConfUuid = ikeResp.inventory.uuid
				param.ipsecConfUuid = IPSecResp.inventory.uuid
				resp = await rpc.create('hybrid/tencent/vpn-connection', param, event)
				this.incEventSuccess(event)
			} catch (e) {
				console.log(e)
				this.incEventFail(event)
				return
			}
			let uuidList = this.windowData.uuidList.slice()
			uuidList.unshift(resp.inventory.uuid)
			let row = {}
			row[resp.inventory.uuid] = {}
			row[resp.inventory.uuid].selected = false
			let table = Object.assign({}, { ...this.windowData.table }, row)
			this.updateWindow({ uuidList, table })
			this.updateDbTable({
				tableName: 'hybridTencentVpcVpnConnection',
				list: [resp.inventory]
			})
			this.updateCount()
		},
    //更新VPn连接可用数
		updateCount: function () {
			rpc.query('/hybrid/tencent/vpn-connection', {
				replyWithCount: true
			})
				.then((resp) => {
					this.updateWindow({
						availableCount: resp.total
					})
				})
		},
	}
}