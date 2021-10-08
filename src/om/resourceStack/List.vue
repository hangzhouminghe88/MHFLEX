<script>
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from './Methods';

  export default {
    name: "List",
    mixins: [WindowBase, MultiSelectList, Methods],
    components: {PageTemplate, TableBodyItemState},
    data() {
      return {
        currTab: 'available',
        itemList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ]
      }
    },
    created() {
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
      getCondition: function () {
        let conditionList = []
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList() {
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('resourceStack/basicQuery', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          q: self.getCondition(),
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
      pageDelete() {
        let self = this, uuidList = [];
        if (!self.isSelected) return;
        uuidList = self.selectedList;
        self.openDialog('ConfirmDlg', {
          title: 'resourcestack.delete',
          description: 'resourcestack.info.delete',
          warning: 'resourcestack.deleteWarning',
          uuidList,
          icon: 'pop_resource_stack_n',
          getName(uuid) {
            return self.resourceStack[uuid].name
          },
          ok() {
            self.delete(uuidList)
              .then(() => {
                self.queryList();
              });
          }
        })
      },
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createResourceStack'})
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailResourceStack', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
