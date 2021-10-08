export default {
  methods: {
    create(param) {
      let self = this,
        event = self.createEvent('hybridTencenterDataCenter.action.addDataCenter', param.regionName);
      return self.dispatchActionWithEvent('hybridTencentDataCenter/create', param, null, event);
    },

    delete(uuidList) {
      let self = this,
      event = self.createEvent('hybridTencenterDataCenter.action.delete', uuidList.length === 1 ? self.dataCenter[uuidList[0]].regionName: '', uuidList.length);
      return self.dispatchActionWithEvent('hybridTencentDataCenter/delete', uuidList, null, event)
    }
  }
}
