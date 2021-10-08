<script>
  import {mapGetters} from 'vuex';
  export default {
    name: "Methods",
    computed: {
      ...mapGetters({
        get: 'accessKey/getList'
      })
    },
    methods: {
      Enabled(uuidList, fn){
        let self = this;
        let event = self.createEvent('accesskey.action.enable', uuidList.length === 1 ? self.dbData.accesskey[uuidList[0]].AccessKeyID : '', uuidList.length)
        return self.dispatchActionWithEvent('accessKey/enable', uuidList, null, event)
          .then(() => {
            if(fn) fn();
          });
      },
      Disabled(uuidList, fn){
        let self = this;
        let event = self.createEvent('accesskey.action.disable', uuidList.length === 1 ? self.dbData.accesskey[uuidList[0]].AccessKeyID : '', uuidList.length)
        return self.dispatchActionWithEvent('accessKey/disable', uuidList, null, event)
          .then(() => {
            if(fn) fn();
          });
      },
      delete(uuidList, fn){
        let self = this;
        let event = self.createEvent('accesskey.action.delete', uuidList.length === 1 ? self.dbData.accesskey[uuidList[0]].AccessKeyID : '', uuidList.length)
        return self.dispatchActionWithEvent('accessKey/delete', uuidList, null, event)
          .then(() => {
            if(fn) fn();
          });
      },
      create(_param, fn){
        let self = this;
        debugger
        let event = self.createEvent('accesskey.action.create', _param.AccessKeyID)
        return self.dispatchActionWithEvent('accessKey/create', _param, null, event)
          .then(() => {
            fn ? fn() : ''
          });
      }
    }
  }
</script>

<style scoped>

</style>
