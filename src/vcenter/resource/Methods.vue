<script>

  export default {
    name: "Methods",
    methods: {
      //同步vCenter
      asyncVcenter(uuidList){
        let self = this;
        let event = self.createEvent('vcenter.action.sync', uuidList.length === 1 ? self.dbData.vCenters[uuidList[0]].name : '', uuidList.length);
        return self.dispatchActionWithEvent('vCenter/sync', uuidList, null, event);
      },
      //删除vCenter
      delete(uuidList){
        let self = this;
        let event = self.createEvent('vcenter.action.delete', uuidList.length === 1 ? self.dbData.vCenters[uuidList[0]].name : '', uuidList.length);
        return self.dispatchActionWithEvent('vCenter/delete', uuidList, null, event);
      },
      //创建vCenter
      create(param){
        let self = this, event = self.createEvent('vcenter.action.create', param.name);
        return self.dispatchActionWithEvent('vCenter/create', param, null, event);
      }
    }
  }
</script>

<style scoped>

</style>
