export default {
  methods: {
    delete(uuidList, fn){
      let self = this, event = null;
      event = self.createEvent('securityGroup.action.deleteRule', uuidList.length === 0 ? self.dbData.hybridTencentSecurityGroupRule[uuidList[0]].cidrIp : '');
      return self.dispatchActionWithEvent('hybridTencentSecurityGroupRule/delete', uuidList, null, event);
    },
    create(param, fn) {
      let self = this, event = null;
      event = self.createEvent('hybridSecurityGroupRule.action.addRule')
      let msg = {
        groupUuid: self.windowData.dataUuid,
        ...param
      }
      return self.dispatchActionWithEvent('hybridTencentSecurityGroupRule/create', msg, null, event)
        .then(() => {
          if(fn) fn();
        });
    }
  }
}
