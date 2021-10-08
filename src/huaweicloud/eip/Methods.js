export default {
  methods: {
    //创建Eip
    create(param) {
      let self = this,
        event = self.createEvent('hybrideip.action.create', param.name);
      return self.dispatchActionWithEvent('hybridHuaweiEip/create', param, null, event);
    },
    //删除Eip
    delete(uuidList, isDeleteOrigin) {
      let _this = this, event = null;
      event = _this.createEvent('hybrideip.action.delete', uuidList.length === 1 ? _this.dbData.hybridHuaweiEip[uuidList[0]].name : '', uuidList.length);
      let url = '';
      let paramList = uuidList.map((uuid) => {
        if(isDeleteOrigin){
          url = `hybrid/huawei/eip/${uuid}/remote`
        }else {
          url = `hybrid/huawei/eip/${uuid}`
        }
        return url
      })
      return _this.dispatchActionWithEvent('hybridHuaweiEip/delete', paramList, null, event);
    },
    //绑定attach
    attach(vmNicUuid, uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.attach', uuidList.length === 1 ? self.dbData.hybridHuaweiEip[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          uuid,
          vmNicUuid
        }
      })
      return self.dispatchActionWithEvent('hybridHuaweiEip/attach', paramList, null, event);
    },

    detach(uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.detach', uuidList.length === 1 ? self.dbData.hybridHuaweiEip[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridHuaweiEip/detach', uuidList, null, event);
    },
  }
}
