export default {
  name: "Methods",
  methods: {
    syncHybridVirtualBorderRouter(uuidList) {
      let self = this, event = self.createEvent('hybridvirtualborderrouter.action.sync',
        uuidList.length === 1 ? self.dbData.hybridDataCenter[uuidList[0]].regionName : '', uuidList.length);
      return self.dispatchActionWithEvent('hybridAliCloudVirtualBorderRouter/async', uuidList, null, event);
    }
  }
}
