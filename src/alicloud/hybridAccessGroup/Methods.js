export default {
  methods: {
    create(param) {
      let self = this,
      event = self.createEvent('nasAccessGroup.action.add', param.name);
      return self.dispatchActionWithEvent('hybridAliCloudAccessGroup/creaste', uuidList, null, event);
    }
  }
}
