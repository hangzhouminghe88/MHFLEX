import { checkBounce } from 'src/utils/utils';
import rpc from 'src/utils/rpc';
export default {
  methods: {
    create(param) {
      let _this = this, event = null;
      event = _this.createEvent('hybridvirtualprivatecloud.action.createVirtualPrivateCloud', param.name);
      return _this.dispatchActionWithEvent(`hybridHuaweiVpc/create`, param, null, event);
    },
    delete(uuidList, isDeleteOrigin) {
      let self = this,
      event = self.createEvent('hybridvirtualprivatecloud.action.deleteVirtualPrivateCloud', uuidList.length === 1 ? self.dbData.hybridHuaweiVirtualPrivateCloud[uuidList[0]].name : '', uuidList.length),
      url = null;
      if (isDeleteOrigin) {
        url = 'hybrid/huawei/vpc/remote/'
      } else {
        url = 'hybrid/huawei/vpc/'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          uuid,
          url
        }
      })
      return self.dispatchActionWithEvent('hybridHuaweiVpc/delete', paramList, null, event);
    },
    //产线绑定vpc的华为云数量
    getHuaweiEcsInstanceNum(uuid) {
      let value
      let self = this
      try {
        value = self.dbData.hybridHuaweiVirtualPrivateCloud[uuid].ecsInstanceNum
        if (value === undefined) throw new Error('error')
      } catch (e) {
        if (checkBounce(`getEcsInstanceNum-${uuid}`)) return 0
        value = 0
        rpc.query('hybrid/huawei/subnet', {
          q: `ecsVpcId=${uuid}`,
          fields: 'uuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let subnetUuidList = resp.inventories.map(it => it.uuid)
              let ecsVpc = _.cloneDeep(self.dbData.hybridHuaweiVirtualPrivateCloud[uuid])
              return rpc.query('hybrid/huawei/ecs', {
                count: true,
                q: `subnetUuid?=${subnetUuidList}`
              })
                .then((resp) => {
                  ecsVpc.ecsInstanceNum = resp.total
                  return self.updateDbRow({
                    tableName: 'hybridHuaweiVirtualPrivateCloud',
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
    }
  }
}
