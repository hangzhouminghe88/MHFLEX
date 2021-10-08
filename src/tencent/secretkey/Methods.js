export default {
  methods: {
    create(param) {
      let self = this,
        event = self.createEvent('hybridTencentKey.action.addSecretKey', param.name);
      return self.dispatchActionWithEvent('hybridTencentSecretKey/create', param, null, event);
    },
    //设置默认
    attach(uuidList, fn) {
      let self = this,
        event =  self.createEvent('hybridTencentKey.action.Attach', uuidList.length === 1 ? self.dbData.hybridTencentSecretKey[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridTencentSecretKey/attach',uuidList, null, event);
    },
    //取消默认
    detach(uuidList,fn) {
      let self = this,
        event =  self.createEvent('hybridTencentKey.action.Detach', uuidList.length === 1 ? self.dbData.hybridTencentSecretKey[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridTencentSecretKey/detach',uuidList, null, event);
    },
    //删除
    delete(uuidList) {
      let self = this,
        event =  self.createEvent('hybridTencentKey.action.deleteSecretKey', uuidList.length === 1 ? self.dbData.hybridTencentSecretKey[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridTencentSecretKey/delete',uuidList, null, event);
    }
  }
}
