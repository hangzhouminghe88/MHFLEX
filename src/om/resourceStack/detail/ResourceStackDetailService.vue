<script>
  import ResourceStackContent from "../components/ResourceStackContent";
  import DetailTemplate from "../../../component/DetailTemplate";
  import DetailInfoState from "../../../component/DetailInfoState";
  import ResourceStackMethods from '../Methods';
  import WindowBase from 'src/windows/Window';
  import {formatDatetime, updateResource} from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  export default {
    name: "ResourceStackDetailService",
    components: {DetailTemplate, DetailInfoState, ResourceStackContent},
    mixins: [WindowBase, ResourceStackMethods],
    data(){
      return {
        currTab: 'info'
      }
    },
    computed: {
      ...mapGetters({
        get: 'resourceStack/getList'
      }),
      model(){
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    created(){
      let self = this,dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid :  '';
      self.updateWindow({
        dataUuid
      }).then(() => {
        self.query();
      })
    },
    methods: {
      ...{
        formatDatetime,
        updateResource
      },
      query(){
        let self = this;
        self.dispatchAction('resourceStack/basicQuery', {q:`uuid=${self.windowData.dataUuid}`});
      },
      updateResourceParam(param){
        let self = this;
        return {
          getValue(){
            return self.model && self.model[param];
          },
          setValue(newVal){
            if(_.isEqual(newVal, self.model[param])) return;
            self.updateResource('cloudformation/stack', 'updateResourceStack', param, 'resourceStack', newVal)
              .then(() => self.query())
          },
          canEdit(){
            return true;
          }
        }
      },
      canResubmit () {
        if(!this.model) return;
        return this.model.status === 'Failed' || this.model.status === 'Rollbacked'
      },
      detailDelete(){
          let self = this, uuidList = [];
          uuidList = [self.windowData.dataUuid];
          self.openDialog('ConfirmDlg', {
            title: 'resourcestack.delete',
            description: 'resourcestack.info.delete',
            warning: 'resourcestack.deleteWarning',
            uuidList,
            icon: 'pop_resource_stack_n',
            getName(uuid) {
              return self.dbData.resourceStack[uuid].name
            },
            ok() {
              self.delete(uuidList)
                .then(() => {
                  self.$router.push({name: 'resourcestack'})
                });
            }
          })
      },
      pageResubmit(){
        const self = this;
        self.$router.push({name: 'createResourceStack', params: {resourceStackUuid: self.$route.params.uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
