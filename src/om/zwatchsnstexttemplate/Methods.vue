<script>
  import {mapGetters, mapState} from 'vuex';
  export default {
    name: "Methods",
    computed: {
      ...mapGetters({
        get: 'zwatchSNSTextTemplate/getList'
      }),
      ...mapState({
        zwatchSNSTextTemplate: state => state.zwatchSNSTextTemplate
      })
    },
    methods: {
      default(uuid, param){
        let self = this;
        let realParam= {
          uuid,
          param
        }
        let event = self.createEvent(`zwatchSNSTextTemplate.action.${param ? 'setDefault' : 'unsetDefault'}`, self.zwatchSNSTextTemplate[uuid].name);
        self.dispatchActionWithEvent('zwatchSNSTextTemplate/setDefault', realParam, null, event);
      },
      delete(uuidList, fn){
        if (!Array.isArray(uuidList)) return
        const self = this
        let event = self.createEvent('zwatchSNSTextTemplate.action.destroy', uuidList.length === 1 ? self.zwatchSNSTextTemplate[uuidList[0]].name : '', uuidList.length);
        return self.dispatchActionWithEvent('zwatchSNSTextTemplate/delete', uuidList, null, event)
          .then(() => {
            if(fn) fn();
          });
      },
      create(param){
        let self = this;
        let event = this.createEvent('zwatchSNSTextTemplate.action.create', param.name)
        return self.dispatchActionWithEvent('zwatchSNSTextTemplate/create', param, null, event)
      }
    }
  }
</script>

<style scoped>

</style>
