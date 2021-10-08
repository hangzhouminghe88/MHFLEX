import rpc from 'src/utils/rpc';

export default {
  methods: {
    //创建安全组
    create(param) {
      let self = this, event = null;
      event = self.createEvent('hybridesecuritygroup.action.create', param.name);
      return rpc.create('hybrid/aliyun/security-group/remote', param, event)
        .then(() => {
          self.incEventSuccess(event);
        })
        .catch(() => {
          self.incEventFail(event);
        });
    },
    //删除安全组
    delete(isOrigin, uuidList) {
      let self = this, event = null;
      let url
      event = self.createEvent('hybridesecuritygroup.action.delete', uuidList.length === 1 ? self.dbData.hybridSecurityGroup[uuidList[0]].name : '', uuidList.length)
      if (isOrigin) {
        url = 'hybrid/aliyun/security-group/remote/'
      } else {
        url = 'hybrid/aliyun/security-group/'
      }
      let paramList = uuidList.map((uuid) => {
        return {
          url,
          uuid
        }
      })
      return self.dispatchActionWithEvent('hybridAliCloudSecurityGroup/delete', paramList, null, event);
    }
  }
}
