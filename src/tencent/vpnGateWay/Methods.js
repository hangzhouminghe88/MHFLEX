import { checkBounce } from 'src/utils/utils';
import rpc from 'src/utils/rpc';


export default {
  methods: {
    delete(isOrigin,uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybridvpcvpngateway.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentVpcVpnGateway[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          url: isOrigin ? `hybrid/vpn-gateway/${uuid}/remote` :`hybrid/vpn-gateway/${uuid}`
        }
      })
      return self.dispatchActionWithEvent('hybridTencentVpcVpnGateway/delete', paramList, null, event);
    },

    getEcsVpcName (uuid) {
      let value
      const self = this
      try {
        value = self.dbData.hybridTencentVirtualPrivateCloud[self.dbData.hybridTencentVpcVpnGateway[uuid].ecsVpcUuid].name
      } catch (e) {
        if (checkBounce(`getEcsVpcName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/tencent/vswitch/${self.dbData.hybridTencentVpcVpnGateway[uuid].vSwitchUuid}`, {
          fields: 'ecsVpcUuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let hybridVpcVpnGateway = _.cloneDeep(self.dbData.hybridTencentVpcVpnGateway[uuid])
              hybridVpcVpnGateway.ecsVpcUuid = resp.inventories[0].ecsVpcUuid
              return self.updateDbRow({
                tableName: 'hybridTencentVpcVpnGateway',
                id: uuid,
                data: hybridVpcVpnGateway
              }).then(() => {
                return rpc.query(`hybrid/tencent/vpc/${self.dbData.hybridTencentVpcVpnGateway[uuid].ecsVpcUuid}`)
                  .then((resp) => {
                    return self.updateDbRow({
                      tableName: 'hybridTencentVirtualPrivateCloud',
                      id: resp.inventories[0].uuid,
                      data: resp.inventories[0]
                    })
                  })
              })
            } else {
              return ''
            }
          })
          .then(() => self.$nextTick(self.$forceUpdate))
      }
      return value
    },
    getIdentityZoneName (uuid) {
      const self = this
      let value
      try {
        value = this.dbData.hybridTencentIdentityZone[this.dbData.hybridTencentVpcVpnGateway[uuid].identityZoneUuid].zoneName
      } catch (e) {
        if (checkBounce(`getIdentityZoneName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/tencent/vswitch/${self.dbData.hybridTencentVpcVpnGateway[uuid].vSwitchUuid}`, {
          fields: 'identityZoneUuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let hybridVpcVpnGateway = _.cloneDeep(self.dbData.hybridTencentVpcVpnGateway[uuid])
              hybridVpcVpnGateway.identityZoneUuid = resp.inventories[0].identityZoneUuid
              return self.updateDbRow({
                tableName: 'hybridTencentVpcVpnGateway',
                id: uuid,
                data: hybridVpcVpnGateway
              }).then(() => {
                return rpc.query(`hybrid/tencent/identity-zone/${self.dbData.hybridTencentVpcVpnGateway[uuid].identityZoneUuid}`)
                  .then((resp) => {
                    return self.updateDbRow({
                      tableName: 'hybridTencentIdentityZone',
                      id: resp.inventories[0].uuid,
                      data: resp.inventories[0]
                    })
                  })
              })
            } else {
              return ''
            }
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },

     //同步网关
     asyncGateWay() {
      let self = this;
      return  self.dispatchAction('hybridTencentDataCenter/basicQuery', {})
       .then( (resp) => {
          let event = self.createEvent('hybridTencentVpnGateway.action.sync'),
          uuidList = resp.uuidList;
         return self.dispatchActionWithEvent('hybridTencentVpcVpnGateway/sync', uuidList, null, event);
       })
    }
  }
}
