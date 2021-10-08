export default {
  methods: {
    attach(vmNicUuid, uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.attach', uuidList.length === 1 ? self.dbData.hybridTencentEip[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          uuid,
          vmNicUuid
        }
      })
      return self.dispatchActionWithEvent('hybridTencentEip/attach', paramList, null, event);
    },

    detach(uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.detach', uuidList.length === 1 ? self.dbData.hybridTencentEip[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridTencentEip/detach', uuidList, null, event);
    },

    //删除Eip
    delete(uuidList,isDeleteOrigin) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentEip[uuidList[0]].name : '', uuidList.length);
      let url = '';
      let paramList = uuidList.map((uuid) => {
        if(isDeleteOrigin){
          url = `hybrid/tencent/eip/${uuid}/remote`
        }else {
          url = `hybrid/tencent/eip/${uuid}`
        }
        return url
      })
      return self.dispatchActionWithEvent('hybridTencentEip/delete', paramList, null, event);
    },

    //创建Eip
    create(param) {
      let self = this,
        event = self.createEvent('hybrideip.action.create', param.name);
      return self.dispatchActionWithEvent('hybridTencentEip/create', param, null, event);
    }
  }
}
