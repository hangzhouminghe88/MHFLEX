export default {
  methods: {
    attach(vmNicUuid, uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.attach', uuidList.length === 1 ? self.dbData.hybridEip[uuidList[0]].name : '', uuidList.length);
      let paramList = uuidList.map((uuid) => {
        return {
          uuid,
          vmNicUuid
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudEip/attach', paramList, null, event);
    },

    detach(uuidList) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.detach', uuidList.length === 1 ? self.dbData.hybridEip[uuidList[0]].name : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridAliCloudEip/detach', uuidList, null, event);
    },

    //删除Eip
    delete(uuidList,isDeleteOrigin) {
      let self = this, event = null;
      event = self.createEvent('hybrideip.action.delete', uuidList.length === 1 ? self.dbData.hybridEip[uuidList[0]].name : '', uuidList.length);
      let url = '';
      let paramList = uuidList.map((uuid) => {
        if(isDeleteOrigin){
          url = `hybrid/eip/${uuid}/remote`
        }else {
          url = `hybrid/eip/${uuid}`
        }
        return url
      })
      return self.dispatchActionWithEvent('hybridAliCloudEip/delete', paramList, null, event);
    },

    //创建Eip
    create(param) {
      let self = this,
        event = self.createEvent('hybrideip.action.create', param.name);
      return self.dispatchActionWithEvent('hybridAliCloudEip/create', param, null, event);
    }
  }
}
