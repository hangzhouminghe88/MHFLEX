export default {
  methods: {
    create(param) {
      let self = this;
      let event = self.createEvent('hybridHuaweiDataCenter.action.add', param.regionName);
      self.dispatchActionWithEvent('hybridHuaweiDataCenter/create', param, null, event);
    },
    delete(uuidList) {
      let self = this;
      let event = this.createEvent('hybridHuaweiDataCenter.action.delete', uuidList.length === 1 ? self.dbData.hybridHuaweiyunDataCenter[uuidList[0]].regionName : '', uuidList.length);
      self.dispatchActionWithEvent('hybridHuaweiDataCenter/delete', uuidList, null, event);
    }
  }
}
