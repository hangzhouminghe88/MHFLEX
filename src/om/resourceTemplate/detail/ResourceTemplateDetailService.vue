<script>
  import ResourceStackContent from "../../resourceStack/components/ResourceStackContent";
  import DetailTemplate from "../../../component/DetailTemplate";
  import DetailInfoState from 'src/component/DetailInfoState';
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "ResourceTemplateDetailService",
    mixins: [WindowBase, Methods],
    components: {DetailTemplate, DetailInfoState, ResourceStackContent, LogList},
    data(){
      return {
        value: {},
        currTab: 'info'
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid
      }).then(() =>{
        return self.query();
      })
    },
    computed:{
      model:{
        get(){
          return this.value;
        },
        set(val){
          this.value = val;
        }
      },
    },
    methods: {
      ...Utils,
     query(){
        let self = this;
        return rpc.query(`cloudformation/template/${self.windowData.dataUuid}`)
          .then((resp) =>{
            let tasks = [], p = null;
            p = rpc.getResourceAccount([self.windowData.dataUuid], self)
            tasks.push(p)
            tasks.push(p);
            return Promise.all(tasks)
              .then( async () =>  {
                await self.isShareToAll(self.windowData.dataUuid)
                  .then((toPublic) => {
                    resp.inventories[0].toPublic = toPublic
                  })
                await self.updateDbRow({
                  tableName: 'resourceStackTemplate',
                  id: self.windowData.dataUuid,
                  data: resp.inventories[0]
                })
                self.model = self.dbData.resourceStackTemplate[self.windowData.dataUuid];
              })
          })
      },
      updateResourceParam(param){
        let self = this;
        return {
          getValue(){
            return self.model[param];
          },
          setValue(newValue){
            if(self.model[param] === newValue) return;
            self.updateResource('cloudformation/template', 'updateStackTemplate', param, 'resourceStackTemplate', newValue)
              .then(() => {
                return self.query();
              })
          },
          canEnabled(){
            return true;
          }
        }
      },
      instates(){
        let self = this, states = [];
        for(let arg in arguments){
          states.push(arguments[arg]);
        }
        let instate = [self.windowData.dataUuid].every(() => {
          return states.some((state) => state === self.model.state)
        })
        return instate;
      },
      detailEnable(param){
        let self = this;
        this.changeTemplateState([self.windowData.dataUuid], param).then(() => self.query())
      },
      //生成资源栈
      openGenerateResourceStack (templateUuid) {
        const self = this;
        self.$router.push({name: 'createResourceStack', params: {templateUuid: templateUuid}})
      },
      //修改资源栈
      openModifyResourceStack (templateUuid) {
        let self = this
        let content = self.model.content
        self.openDialog('TemplateEditorDlg', {
          templateContent: content,
          mode: 'modify',
          ok: (templateContent) => {
            self.updateTemplateContent(templateUuid, templateContent)
          }
        })
      },
      //获得未全局共享的UUIDList
      getNotSharedToAllList () {
        let list = []
        this.selectedList.forEach((uuid, index) => {
          if (this.dbData.resourceStackTemplate[uuid] && !this.dbData.resourceStackTemplate[uuid].toPublic) {
            list.push(uuid)
          }
        })
        return list
      },
      //全局共享
      detailShareToAll () {
        let uuidList = [this.windowData.dataUuid];
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title:"common.shareToAll",
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              this.shareToAll(uuidList)
                .then(() => this.query());
            }
          })
        }
      },
      //全局召回
      detailRecallFromAll () {
        let uuidList = [this.windowData.dataUuid];
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title:'common.recallFromAll',
            warning: 'account.recall',
            ok: () => {
              this.recallFromAll(uuidList)
                .then(() => this.query());
            }
          })
        }
      },
      //删除资源栈模板
      detailDelete(){
        let self  = this;
        self.openDialog('ConfirmDlg', {
          title: 'resourcestacktemplate.delete',
          description: 'resourcestacktemplate.info.delete',
          uuidList: [self.windowData.dataUuid],
          icon: 'pop_my_template_n',
          ok(){
            self.delete([self.windowData.dataUuid])
              .then(() => self.$router.push({name: 'resourcestacktemplate'}));
          },
          getName(){
            return self.model.name;
          }
        })
      },
      isShareToAll (uuid) {
        return rpc.query('accounts/resources', {
          q: `resourceUuid=${uuid}`
        })
          .then((resp) => {
            let toPublic = false
            resp.inventories.forEach((item) => {
              if (item.toPublic) toPublic = true
            })
            return toPublic
          })
      },
    }
  }
</script>

<style scoped>

</style>
