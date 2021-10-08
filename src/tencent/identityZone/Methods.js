export default {
  methods: {
    create(param) {
      let self = this,
      event = self.createEvent('hybrididentityzone.action.Addidentityzone', param.localName);
      return self.dispatchActionWithEvent('hybridTencentIdentityZone/create', param, null, event);
    },
    delete(uuidList) {
      let self = this,
      event = self.createEvent('hybrididentityzone.action.deleteidentityzone', uuidList.length === 1 ? self.dbData.hybridTencentIdentityZone[uuidList[0]].zoneName : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridTencentIdentityZone/delete', uuidList, null, event);
    }
  }
}
