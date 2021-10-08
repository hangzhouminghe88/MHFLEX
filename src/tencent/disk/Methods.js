export default {
  methods: {
    //创建
    create(param) {
      let self = this,
        event = self.createEvent('hybridAliyunDisk.action.create', param.name);
      return self.dispatchActionWithEvent('hybridTencentDisk/create', param,null, event);
    },
    //删除
    delete(uuidList, isDeleteOrigin) {
      let self = this
      let event
      let url
      if (isDeleteOrigin) {
        event = self.createEvent('hybridAliyunDisk.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentDisk[uuidList[0]].name : '', uuidList.length)
        url = '1'
      } else {
        event = self.createEvent('hybridAliyunDisk.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentDisk[uuidList[0]].name : '', uuidList.length)
        url = '0'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          url,
          uuid
        }
      })
      return self.dispatchActionWithEvent('hybridTencentDisk/delete', paramList, null, event);
    },
    //解绑
    detach(uuidList) {
      let self = this;
      let event = self.createEvent('hybridAliyunDisk.action.detach', uuidList.length === 1 ? self.dbData.hybridTencentDisk[uuidList[0]].name : '', uuidList.length)
      return self.dispatchActionWithEvent('hybridTencentDisk/detach', uuidList, null, event);
    },
    //绑定
    attach(ecsUuid, uuidList) {
      let self = this;
      let event = self.createEvent('hybridAliyunDisk.action.attach', uuidList.length === 1 ? self.dbData.hybridTencentDisk[uuidList[0]].name : '', uuidList.length)
      let paramList = uuidList.map((uuid) =>{
        return {
          uuid,
          'ecsUuid': ecsUuid
        }
      })
      return self.dispatchActionWithEvent('hybridTencentDisk/attach', paramList, null, event);
    },
  }
}
