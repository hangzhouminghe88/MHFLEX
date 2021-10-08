export default {
  methods: {
     getRegion: function (regionList, uuid) {
        let region = {}
        let dataCenterUuid = this.dbData.nasFileSystem[uuid].dataCenterUuid
        for (let item of this.regionList) {
          if (item.uuid === dataCenterUuid) {
            region = item
            break
          }
        }
        return region
      },
      create(param) {
        let self = this,
        event = self.createEvent('nasFileSystem.action.create', param.name);
        return self.dispatchActionWithEvent('hybridAliCloudFileSystem/create', param, null, event);
      },
      delete(uuidList) {
        let event = self.createEvent('nasFileSystem.action.delete', uuidList.length === 1 ? self.dbData.nasFileSystem[uuidList[0]].name : '', uuidList.length)
        return self.dispatchActionWithEvent('hybridAliCloudFileSystem/delete', uuidList, null, event);
      }
  }
}
