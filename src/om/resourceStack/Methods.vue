<script>
  import {mapGetters, mapState} from 'vuex';
  export default {
    name: "Methods",
    computed: {
      ...mapGetters({
        getList: 'resourceStack/getList'
      }),
      ...mapState({
        resourceStack: state => state.resourceStack
      })
    },
    methods: {
      delete(uuidList){
        let self = this;
        let event = self.createEvent('resourcestack.action.delete', uuidList.length === 1 ? self.resourceStack[uuidList[0]].name : '', uuidList.length)
        return self.dispatchActionWithEvent('resourceStack/delete',uuidList, null, event)
      },
      create(param){
        let self = this;
        let event = self.createEvent('resourcestack.action.create', param.name);
        return self.dispatchActionWithEvent('resourceStack/create', param, null, event);
      }
    }
  }
</script>

<style scoped>

</style>
