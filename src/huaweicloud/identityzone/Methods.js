import rpc from "../../utils/rpc";

export default {
  methods: {
    delete(uuidList) {
      let self = this,
        event = self.createEvent('hybrididentityzone.action.deleteidentityzone', uuidList.length === 1 ? self.dbData.hybridHuaweiyunIdentityZone[uuidList[0]].zoneName : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridHuaweiIdentityZone/delete', uuidList, null, event);
    },
    create: async function (param) {
      let self = this;
      let event = this.createEvent('hybrididentityzone.action.Addidentityzone', param.localName)
      return self.dispatchActionWithEvent('hybridHuaweiIdentityZone/create', param, null, event);
    },
  }
}
