<script>
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import ResourceStackTemplateMethods from './Methods';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "ResourceTemplatePageService",
    components: {PageTemplate, TableBodyItemState},
    mixins: [WindowBase, MultiSelectList, ResourceStackTemplateMethods],
    data(){
      return {
        itemList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        isAdmin: false
      }
    },
    created(){
      let self = this, currTab = '';
      currTab = self.dbData.common.isAdmin ?  'available' : 'mine';
      self.isAdmin = self.dbData.common.isAdmin
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        currTab: currTab,
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      //获得查询条件
      getCondition: async function () {
        let conditionList = ['__systemTag__!=systemtemplate']
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //查询列表数据
      queryList: async function () {
        const self = this
        let preStep
         self.windowData.loading = true;
        let myResourceStackTemplateUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=StackTemplateVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myResourceStackTemplateUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
        }
        self.updateCount()
        await preStep
        let condition = await self.getCondition()
        if (!this.dbData.common.isAdmin) {
          if (this.windowData.currTab === 'mine') {
            condition = condition.concat(`uuid?=${myResourceStackTemplateUuidList.join(',')}`)
          } else if (this.windowData.currTab === 'share') {
            condition = condition.concat(`uuid!?=${myResourceStackTemplateUuidList.join(',')}`)
          }
        }
        let resp = await rpc.query('cloudformation/template', {
          count: false,
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: condition,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        })
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let tasks = []
        let p = null
        p = rpc.getResourceAccount(uuidList, self)
        tasks.push(p)

        let _tasks = resp.inventories.map((item, index) => {
          return this.isShareToAll(item.uuid)
            .then((toPublic) => {
              resp.inventories[index].toPublic = toPublic
            })
        })

        tasks.concat(_tasks)

        return Promise.all(tasks).then(() => {
          self.updateDbTable({
            tableName: 'resourceStackTemplate',
            list: resp.inventories
          })
          self.updateWindow({ uuidList})
            .then(() => {
              self.itemList = self.getItemList();
               self.windowData.loading = false;
            })
        })
      },
      //或得列表数据
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.resourceStackTemplate[uuid];
        })
      },
      //更新总数
      updateCount: async function () {
        const self = this
        if (this.dbData.common.isAdmin) {
          return rpc.query('cloudformation/template', {
            count: true,
            q: await self.getCondition()
          })
            .then((resp) => {
              this.updateWindow({
                availableCount: resp.total
              })
            })
        }

        let preStep
        let myResourceStackTemplateUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=StackTemplateVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myResourceStackTemplateUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
        }
        await preStep

        let condition = await self.getCondition()
        rpc.query('cloudformation/template', {
          count: true,
          q: condition.concat(`uuid?=${myResourceStackTemplateUuidList.join(',')}`)
        })
          .then((resp) => {
            this.updateWindow({
              mineCount: resp.total
            })
          })
        rpc.query('cloudformation/template', {
          count: true,
          q: condition.concat(`uuid!?=${myResourceStackTemplateUuidList.join(',')}`)
        })
          .then((resp) => {
            this.updateWindow({
              shareCount: resp.total
            })
          })
      },
      //查询是否全局共享
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
      //切换tab触发回调
      changeTab(e){
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          currTab: e.name,
          sortDirection: '-'
        }).then(() => {
          self.queryList();
        })
      },
      //是否可以停用启用
      instates(){
        let states = [], self = this;
        if(!self.selectedList) return false;
        for(let arg in arguments){
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every((uuid) => {
          return states.some((state) => state === self.dbData['resourceStackTemplate'][uuid].state);
        })
        return instate;
      },
      //停用启用资源栈模板
      pageEnable(param){
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        let selectedUuidList = self.selectedList
        this.changeTemplateState(selectedUuidList, param).then(() => self.queryList())
      },
      //生成资源栈
      openGenerateResourceStack (templateUuid) {
        const self = this;
        self.$router.push({name: 'createResourceStack', params: {templateUuid: templateUuid}})
      },
      //修改资源栈
      openModifyResourceStack (templateUuid) {
        let self = this
        let content = self.dbData.resourceStackTemplate[templateUuid].content
        self.openDialog('TemplateEditorDlg', {
          templateContent: content,
          mode: 'modify',
          ok: (templateContent) => {
            self.updateTemplateContent(templateUuid, templateContent)
          }
        })
      },
      //删除资源栈模板
      pageDelete(){
        let self = this;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          title: 'resourcestacktemplate.delete',
          description: 'resourcestacktemplate.info.delete',
          uuidList: self.selectedList,
          icon: 'pop_my_template_n',
          ok(){
            self.delete(self.selectedList)
              .then(() => self.queryList());
          },
          getName(uuid){
            return self.dbData.resourceStackTemplate[uuid].name;
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
      //判断是否可以全局共享
      hasSharedToAll: function () {
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      //判断是否可以全局召回
      hasNotSharedToAll: function () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      //获得全局共享的UUIDList
      getSharedToAllList() {
        let uuidList = []
         uuidList = this.selectedList;
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => this.dbData.resourceStackTemplate[uuid].toPublic)
          return list
        }
        return []
      },
      //全局共享
      pageShareToAll () {
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title:"common.shareToAll",
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              this.shareToAll(uuidList)
            }
          })
        }
      },
      //全局召回
      pageRecallFromAll () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title:'common.recallFromAll',
            warning: 'account.recall',
            ok: () => {
              this.recallFromAll(uuidList)
            }
          })
        }
      },
      //跳转到创建页面
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createResourceStackTemplate'})
      },
      //跳转到详情页
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailResourceStackTemplate', params:{uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
