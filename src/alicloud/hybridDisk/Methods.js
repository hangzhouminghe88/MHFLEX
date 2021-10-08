import {checkBounce, genUniqueId} from "../../utils/utils";
import rpc from 'src/utils/rpc';

export default {
  methods: {
    detach(uuidList) {
      let self = this;
      let event = self.createEvent('hybridAliyunDisk.action.detach', uuidList.length === 1 ? self.dbData.hybridAliyunDisk[uuidList[0]].name : '', uuidList.length)
      return self.dispatchActionWithEvent('hybridAliCloudDisk/detach', uuidList, null, event);
    },
    attach(ecsUuid, uuidList) {
      let self = this;
      let event = self.createEvent('hybridAliyunDisk.action.attach', uuidList.length === 1 ? self.dbData.hybridAliyunDisk[uuidList[0]].name : '', uuidList.length)
      let paramList = uuidList.map((uuid) =>{
        return {
          uuid,
          'ecsUuid': ecsUuid
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudDisk/attach', paramList, null, event);
    },

    create(param) {
      let self = this;
      let event = this.createEvent('hybridAliyunDisk.action.create', param.name);
      return self.dispatchActionWithEvent('hybridAliCloudDisk/create', param, null, event);
    },

    getEcsName(uuid) {
      let self = this, value = '';
      if(self.dbData.hybridEcsInstance[uuid]){
        value = self.dbData.hybridEcsInstance[uuid].name
      }else{
        if(checkBounce(`getEcsInstnceName-${genUniqueId}`)) return '';
        value = '';
        rpc.query(`hybrid/aliyun/ecs/${uuid}`)
          .then((resp) => {
            return self.updateDbRow({
              tableName: 'hybridEcsInstance',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            }).then(() => {
              value = self.dbData.hybridEcsInstance[uuid].name;
              self.$forceUpdate();
            })
          })
      }
      return value;
    },

    //删除镜像
    delete(isDeleteOrigin, uuidList){
      let self = this
      let event
      let url
      if (isDeleteOrigin) {
        event = self.createEvent('hybridAliyunDisk.action.delete', uuidList.length === 1 ? self.dbData.hybridAliyunDisk[uuidList[0]].name : '', uuidList.length)
        url = '1'
      } else {
        event = self.createEvent('hybridAliyunDisk.action.delete', uuidList.length === 1 ? self.dbData.hybridAliyunDisk[uuidList[0]].name : '', uuidList.length)
        url = '0'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          url,
          uuid
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudDisk/delete', paramList, null, event);
    }
  }
}
