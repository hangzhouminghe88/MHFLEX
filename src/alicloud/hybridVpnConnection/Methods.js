import rpc from 'src/utils/rpc';
export  default {
  methods: {
    create: async function (param) {
      // create ike
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
        ikeResp = await rpc.create('hybrid/vpn-connection/ike', ike)
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
        IPSecResp = await rpc.create('hybrid/vpn-connection/ipsec', IPSec)
      } catch (e) {
        console.log(e)
        return
      }

      let event = this.createEvent('hybridvpcvpnconnection.action.create', param.name)
      let resp
      try {
        param.ikeConfUuid = ikeResp.inventory.uuid
        param.ipsecConfUuid = IPSecResp.inventory.uuid
        resp = await rpc.create('hybrid/vpn-connection', param, event)
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
        tableName: 'hybridVpcVpnConnection',
        list: [resp.inventory]
      })
      this.updateCount()

      let vRouter = await rpc.query('hybrid/aliyun/vrouter', {
        q: `vpcUuid=${param.vpcUuid}`
      })
      let routerEvent = this.createEvent('vRouterRouteEntry.action.add')
      let body = {
        params: {
          dstCidrBlock: param.remoteCidr,
          nextHopUuid: param.vpnGatewayUuid,
          nextHopType: 'VpnGateway',
          vRouterUuid: vRouter.inventories[0].uuid,
          vRouterType: 'vrouter'
        }
      }
      try {
        let resp = await rpc.post('hybrid/aliyun/route-entry', body, routerEvent)
        this.incEventSuccess(routerEvent)
        this.updateDbRow({
          tableName: 'hybridvirtualrouterentry',
          id: resp.inventory.uuid,
          data: resp.inventory
        })
        return true
      } catch (e) {
        this.incEventFail(routerEvent)
        return false
      }
    },

    delete(uuidList, isOrigin) {
      let self = this, event, url;
      if (isOrigin) {
        event = self.createEvent('hybridvpcvpnconnection.action.deleteOrigin', uuidList.length === 1 ? self.dbData.hybridVpcVpnConnection[uuidList[0]].name : '', uuidList.length)
      } else {
        event = self.createEvent('hybridvpcvpnconnection.action.deleteLocal', uuidList.length === 1 ? self.dbData.hybridVpcVpnConnection[uuidList[0]].name : '', uuidList.length)
      }
      let paramList = uuidList.map(uuid => {
        return {
          url: isOrigin ? `hybrid/vpn-connection/${uuid}/remote`: `hybrid/vpn-connection/${uuid}`
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudVpnConnection/delete', paramList, null, event);
    }
  }
}
