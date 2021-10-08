import rpc from "../../utils/rpc";
import { checkBounce } from 'src/utils/utils';

export default {
  methods: {
    create:function(param){
      let self = this, event = null;
      let updateParam ={};
      updateParam['uuid'] = param.imageUuid;
      updateParam['param'] ={
        'guestOsType':  param.guestOsType
      };
      event = this.createEvent('hybridimage.action.update');
      self.dispatchActionWithEvent('hybridAliCloudImage/update', updateParam, null, event)
        .then(() => {
          event = this.createEvent('hybridimage.action.add');
          delete param.guestOsType
          return self.dispatchActionWithEvent('hybridAliCloudImage/create', param, null, event);
        })
    },

    //获得区域名
    getDataCenterName (uuid) {
      let value
      try {
        value = this.dbData.hybridDataCenter[uuid].regionName
      } catch (e) {
        if (checkBounce(`getDataCenterName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/data-center/${uuid}`, {
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
    //获得本地镜像名称
    getImageName: function (uuid) {
      let value
      let self = this
      try {
        value = self.dbData.image[uuid].name
      } catch (e) {
        if (checkBounce(`getImageName-${uuid}`)) return ''
        value = ''
        rpc.query(`images/${uuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0) {
              return self.updateDbRow({
                tableName: 'image',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            } else {
              return rpc.queryResourceNames(self, 'image', uuid)
            }
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },
    //删除镜像
    delete(isDeleteOrigin, uuidList){
      let self = this
      let event
      let url
      if (isDeleteOrigin) {
        event = self.createEvent('hybridimage.action.deleteOrigin', uuidList.length === 1 ? self.dbData.hybridImage[uuidList[0]].name : '', uuidList.length)
        url = 'hybrid/aliyun/image/remote/'
      } else {
        event = self.createEvent('hybridimage.action.deleteLocal', uuidList.length === 1 ? self.dbData.hybridImage[uuidList[0]].name : '', uuidList.length)
        url = 'hybrid/aliyun/image/'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          url,
          uuid
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudImage/delete', paramList, null, event);
    }
  }
}
