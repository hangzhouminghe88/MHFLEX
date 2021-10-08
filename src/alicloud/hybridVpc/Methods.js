import rpc from 'src/utils/rpc';
import { checkBounce } from 'src/utils/utils';
import _ from 'lodash'

export default {
  methods: {
    getEcsInstanceNum: function (uuid) {
      let value
      let self = this
      try {
        value = self.dbData.hybridVirtualPrivateCloud[uuid].ecsInstanceNum
        if (value === undefined) throw new Error('error')
      } catch (e) {
        if (checkBounce(`getEcsInstanceNum-${uuid}`)) return 0
        value = 0
        rpc.query('hybrid/aliyun/vswitch', {
          q: `ecsVpcUuid=${uuid}`,
          fields: 'uuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let vSwitchUuidList = resp.inventories.map(it => it.uuid)
              let ecsVpc = _.cloneDeep(self.dbData.hybridVirtualPrivateCloud[uuid])
              return rpc.query('hybrid/aliyun/ecs', {
                count: true,
                q: `ecsVSwitchUuid?=${vSwitchUuidList}`
              })
                .then((resp) => {
                  ecsVpc.ecsInstanceNum = resp.total
                  return self.updateDbRow({
                    tableName: 'hybridVirtualPrivateCloud',
                    id: uuid,
                    data: ecsVpc
                  })
                })
            } else {
              return 0
            }
          })
          .then(() => self.$nextTick(self.$forceUpdate))
      }
      return value
    },

    delete(deleteOrigin, uuidList) {
      let self = this;
      let event = self.createEvent('hybridvirtualprivatecloud.action.deleteVirtualPrivateCloud', uuidList.length === 1 ? self.dbData.hybridVirtualPrivateCloud[uuidList[0]].name : '', uuidList.length)
      let url = null
      if (deleteOrigin) {
        url = 'hybrid/aliyun/vpc/remote/'
      } else {
        url = 'hybrid/aliyun/vpc/'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          uuid,
          url
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudVpc/delete', paramList, null, event);
    },

    create(param) {
      let self = this;
      let event = self.createEvent('hybridvirtualprivatecloud.action.createVirtualPrivateCloud', param.name)
      return self.dispatchActionWithEvent('hybridAliCloudVpc/create', param,null, event)
    }
  }
}
