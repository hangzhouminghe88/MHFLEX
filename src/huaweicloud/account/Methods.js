
export default {
  name: 'AccountMethods',
  methods: {
    create(param) {
      let self = this,
        event = self.createEvent('hybridHuaweiyunKey.action.addAccessKey', param.name);
      param.accountUuid = window.localStorage.getItem('accountUuid')
      return self.dispatchActionWithEvent('hybridHuaWeiAccountKey/create', param, null, event)
    },
    //设置默认
    attach(uuidList) {
      let self = this,
        event =  self.createEvent('hybridHuaweiyunKey.action.Attach', uuidList.length === 1 ? self.dbData.hybridHuaweiyunKeySecret[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridHuaWeiAccountKey/attach',uuidList, null, event);
    },
    //取消默认
    detach(uuidList) {
      let self = this,
        event =  self.createEvent('hybridHuaweiyunKey.action.Detach', uuidList.length === 1 ? self.dbData.hybridHuaweiyunKeySecret[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridHuaWeiAccountKey/detach',uuidList, null, event);
    },
    //删除
    delete(uuidList) {
      let self = this,
        event =  self.createEvent('hybridHuaweiyunKey.action.deleteAccessKey', uuidList.length === 1 ? self.dbData.hybridHuaweiyunKeySecret[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridHuaWeiAccountKey/delete',uuidList, null, event);
    }
  }
}
