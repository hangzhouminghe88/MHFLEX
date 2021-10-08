export  default {
  methods: {
    create(param) {
      let _this = this, event = _this.createEvent('hybridesecuritygroup.action.create',param.name);
      return _this.dispatchEventAction('hybridHuaweiSecurityGroup/create', param);
    },
    //删除安全组
    delete(uuidList, isOrigin) {
      let self = this, event = null;
      let url
      event = self.createEvent('hybridesecuritygroup.action.delete', uuidList.length === 1 ? self.dbData.hybridHuaweiSecurityGroup[uuidList[0]].name : '', uuidList.length)
      if (isOrigin) {
        url = 'hybrid/huawei/security-group/remote/'
      } else {
        url = 'hybrid/huawei/security-group/'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          url,
          uuid
        }
      })
      return self.dispatchActionWithEvent('hybridHuaweiSecurityGroup/delete', paramList, null, event);
    }
  }
}
