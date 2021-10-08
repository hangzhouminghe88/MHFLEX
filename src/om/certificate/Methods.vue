<script>
  export default {
    name: "Methods",
    methods: {
      create(param){
        let self = this;
        let event = self.createEvent('certificate.action.create', param.name);
        return self.dispatchActionWithEvent('certificate/create', param, null, event);
      },
      delete(uuidList,fn){
        let self = this;
        let event = self.createEvent('certificate.action.delete', uuidList.length === 1 ? self.dbData.certificate[uuidList[0]].name : uuidList.length);
        return self.dispatchActionWithEvent('certificate/delete', uuidList, null, event)
          .then(() => {
            if(fn) fn();
          })
      },
      detach(uuidList,certificateUuid, fn){
        let self = this;
        let paramList = uuidList.map(uuid => {
          return {
            certificateUuid,
            uuid
          }
        })
        let event = self.createEvent('certificate.action.detach', uuidList.length === 1 ? self.dbData.certificate[uuidList[0]].name : uuidList.length);
        return self.dispatchActionWithEvent('certificate/detach', paramList, null, event)
          .then(() => {
            if(fn) fn();
          })
      },
      getCertServerType(uuid) {
        const self = this
        if (self.dbData.certificate[uuid].listeners.length > 0) {
          return self.$t('common.loadBalancer')
        } else {
          return ''
        }
      },
    }
  }
</script>

<style scoped>

</style>
