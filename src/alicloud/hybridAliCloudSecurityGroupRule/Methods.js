export default {
  methods: {
    delete(uuidList, fn){
      let self = this, event = null;
      event = self.createEvent('securityGroup.action.deleteRule', uuidList.length === 0 ? self.dbData.hybridSecurityGroupRule[uuidList[0]].cidrIp : '');
      return self.dispatchActionWithEvent('hybridAliCloudSecurityGroupRule/delete', uuidList, null, event);
    },
    create(param, fn) {
      let self = this, event = null;
      event = self.createEvent('hybridSecurityGroupRule.action.addRule')
      let msg = {
        groupUuid: self.windowData.dataUuid,
        ...param
      }
      return self.dispatchActionWithEvent('hybridAliCloudSecurityGroupRule/create', msg, null, event)
        .then(() => {
          if(fn) fn();
        });
    }
  }
}
