<script>
  import ResourceStackContent from "../../resourceStack/components/ResourceStackContent";
  import DetailInfoState from 'src/component/DetailInfoState';
  import DetailTemplate from 'src/component/DetailTemplate';
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from '../Methods';
  import {mapGetters} from 'vuex';
  export default {
    name: "SysResStackTemService",
    components: {DetailTemplate, DetailInfoState, ResourceStackContent, LogList},
    mixins: [WindowBase, Methods],
    data(){
      return {
        currTab: 'info',
        value: {}
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid
      }).then(() => {
        self.detailQuery();
      })
    },
    computed: {
      ...mapGetters({
        getList: 'sysResourceStackTemplate/getList'
      }),
      model:{
        get(){
          let self = this;
          return self.value;
        },
        set(val){
          let self = this;
          self.value = val;
        }
      }
    },
    methods: {
      ...Utils,
      detailQuery(){
        let self = this;
        return self.dispatchAction('sysResourceStackTemplate/basicQuery', {q: [`uuid=${self.windowData.dataUuid}`]})
          .then(() => {
            self.model = self.getList(self.windowData.dataUuid);
          });
      },
      updateResourceParam(param){
        let self = this;
        return {
          getValue(){
            return param === 'name' ? self.model.name  && self.model[param].replace(/ZStack\./g, '') : self.model && self.model[param];
          },
          canEdit: () => {
            return false;
          }
        }
      },
      //是否可以停用启用
      instates(){
        let states = [], self = this;
        for(let arg in arguments){
          states.push(arguments[arg]);
        }
        let instate = [self.windowData.dataUuid].every((uuid) => {
          return states.some((state) => state === self.model.state);
        })
        return instate;
      },
      //停用启用资源栈模板
      detailEnable(param){
        const self = this
        this.changeTemplateState([self.windowData.dataUuid], param).then(() => self.detailQuery())
      },
      //回到创建资源栈
      openGenerateResourceStack(templateUuid){
        let self = this;
        self.$router.push({name: 'createResourceStack', params: {templateUuid}})
      },
    }
  }
</script>
