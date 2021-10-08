<script>
  import TableBodyItemState from 'src/component/TableBodyItemState';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import Methods from './Methods';

  export default {
    name: "List",
    components: {PageTemplate, TableBodyItemState},
    mixins: [MultiSelectList, WindowBase, PageBase, Methods],
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value:  'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed:{
      ...mapGetters({
        getList: 'sysResourceStackTemplate/getList'
      })
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      //查询条件系统标签为：系统模板
      async getCondition() {
        let conditionList = ['__systemTag__=systemtemplate'], self = this;
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      //查询列表数据
      async queryList(){
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('sysResourceStackTemplate/basicQuery', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          q: await self.getCondition(),
          replyWithCount: true
        }).then((resp) => {
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        }).then(() => {
          self.itemList = self.getList(self.windowData.uuidList);
          self.windowData.loading = false;
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
      openGenerateResourceStack(templateUuid){
        let self = this;
        self.$router.push({name: 'createResourceStack', params: {templateUuid}})
      },
      //回到资源栈详情列表
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailSysResourceStackTemplate', params: {uuid}})
      }
    },
  }
</script>

<style scoped>

</style>
