<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from './Methods';
  export default {
    name: "List",
    mixins: [MultiSelectList, WindowBase, Methods],
    components: {PageTemplate},
    data(){
      return {
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
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
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      queryDefaultTemplate: async function () {
        let self = this;
        let resp = await self.dispatchAction(`zwatchSNSTextTemplate/basicQuery`, {
          q: ['defaultTemplate=true']
        })
        let uuidList = resp.uuidList
        await this.updateWindow({
          defaultUuidList: uuidList
        })
      },
      getCondition () {
        let conditionList = [], self = this;
        if (self.searchStr !== '' && self.selectVal !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      async queryList(){
        let self = this;
        self.windowData.loading = true;
        if (self.getCondition().length <=0) {
          await this.queryDefaultTemplate()
        } else {
          this.updateWindow({
            defaultUuidList: []
          })
        }
        return await self.dispatchAction(`zwatchSNSTextTemplate/basicQuery`, {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          replyWithCount: true,
          q: self.getCondition()
        }).then(resp => {
          let uuidList = resp.uuidList
          return this.updateWindow({
            uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            availableCount: resp.total
          }).then(() => {
            self.itemList = self.get(self.windowData.uuidList);
             self.windowData.loading = false;
          })
        })
      },
      //或得模板名，判断是否是默认模板
      getTemplateName (uuid) {
        let self = this;
        if (!self.zwatchSNSTextTemplate[uuid]) return ''
        let name = self.zwatchSNSTextTemplate[uuid].name
        if (self.zwatchSNSTextTemplate[uuid].defaultTemplate) {
          return `${name}(${self.$t('zwatchSNSTextTemplate.default')})`
        }
        return name
      },
      //获得模板类型
      getApplicationPlatformType(uuid) {
        let self = this;
        if (!self.zwatchSNSTextTemplate[uuid]) return ''
        let type = _.lowerFirst(self.dbData.zwatchSNSTextTemplate[uuid].applicationPlatformType)
        return self.$t(`common.${type}`)
      },
      //是否可以设置默认,若存在defaultTemplate返回false,否则返回true
      canSetDefault(uuid) {
        let self = this;
        return self.zwatchSNSTextTemplate[uuid] && !self.zwatchSNSTextTemplate[uuid].defaultTemplate
      },
      //设置默认请求触发器
      setDefault(uuid, param){
        let self = this;
        if(!self.isSingleSelected) return;
        self.default(uuid, param);
      },
      //删除模板
      pageDelete(){
        let self = this;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg',{
          title: 'zwatchSNSTextTemplate.delete',
          icon: 'zwatch_snstext_template_n',
          description: 'zwatchSNSTextTemplate.deleteConfirm',
          uuidList: self.selectedList,
          getName(uuid){
            return self.zwatchSNSTextTemplate[uuid].name;
          },
          ok(){
            self.delete(self.selectedList, self.queryList);
          }
        })
      },
      //回到创建模板页
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createZwatchSNSTextTemplate'})
      },
      //跳转到告警模板详情页
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailZwatchSNSTextTemplate', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
