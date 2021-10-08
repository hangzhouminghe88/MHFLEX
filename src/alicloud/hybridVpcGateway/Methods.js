import { checkBounce } from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import _ from 'lodash'


export default {
  methods: {
    delete(isOrigin,uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybridvpcvpngateway.action.delete', uuidList.length === 1 ? self.dbData.hybridVpcVpnGateway[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          url:`hybrid/vpn-gateway/${uuid}`
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudVpcGateway/delete', paramList, null, event);
    },

    getEcsVpcName (uuid) {
      let value
      const self = this
      try {
        value = self.dbData.hybridVirtualPrivateCloud[self.dbData.hybridVpcVpnGateway[uuid].ecsVpcUuid].name
      } catch (e) {
        if (checkBounce(`getEcsVpcName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/aliyun/vswitch/${self.dbData.hybridVpcVpnGateway[uuid].vSwitchUuid}`, {
          fields: 'ecsVpcUuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let hybridVpcVpnGateway = _.cloneDeep(self.dbData.hybridVpcVpnGateway[uuid])
              hybridVpcVpnGateway.ecsVpcUuid = resp.inventories[0].ecsVpcUuid
              return self.updateDbRow({
                tableName: 'hybridVpcVpnGateway',
                id: uuid,
                data: hybridVpcVpnGateway
              }).then(() => {
                return rpc.query(`hybrid/aliyun/vpc/${self.dbData.hybridVpcVpnGateway[uuid].ecsVpcUuid}`)
                  .then((resp) => {
                    return self.updateDbRow({
                      tableName: 'hybridVirtualPrivateCloud',
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
        value = this.dbData.hybridIdentityZone[this.dbData.hybridVpcVpnGateway[uuid].identityZoneUuid].zoneName
      } catch (e) {
        if (checkBounce(`getIdentityZoneName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/aliyun/vswitch/${self.dbData.hybridVpcVpnGateway[uuid].vSwitchUuid}`, {
          fields: 'identityZoneUuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let hybridVpcVpnGateway = _.cloneDeep(self.dbData.hybridVpcVpnGateway[uuid])
              hybridVpcVpnGateway.identityZoneUuid = resp.inventories[0].identityZoneUuid
              return self.updateDbRow({
                tableName: 'hybridVpcVpnGateway',
                id: uuid,
                data: hybridVpcVpnGateway
              }).then(() => {
                return rpc.query(`hybrid/identity-zone/${self.dbData.hybridVpcVpnGateway[uuid].identityZoneUuid}`)
                  .then((resp) => {
                    return self.updateDbRow({
                      tableName: 'hybridIdentityZone',
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

  }
}
