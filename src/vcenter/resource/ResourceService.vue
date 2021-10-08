<script>
  import TableBodyItemState from 'src/component/TableBodyItemState';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from 'src/component/PageTemplate';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Utils from 'src/utils/utils';
  import {mapGetters} from  'vuex';
  import Methods from './Methods';

  export default {
    name: "ResourceService",
    components: {PageTemplate, TableBodyItemState},
    mixins: [WindowBase, MultiSelectList, PageBase, Methods],
    computed: {
      ...mapGetters({
        getList: 'vCenter/getList'
      })
    },
    data(){
      return {
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        searchStr:  '',
        selectVal: 'name',
        itemList: [],
        dataSource: {
          getItemList: () => this.itemList,
          handleSelection: this.handleSelect,
          handleSort: this.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => this.getField('name', item),
              className: 'link',
              onClick: item => { this.$router.push({name: 'detailResource', params: {uuid: item.uuid}}) },
              getHeaderContent: this.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => this.getField('domainName', item),
              getHeaderContent: this.$t('vcenter.domainName'),
              field: 'domainName'
            },
            {
              getContent: item => this.getField('userName', item),
              getHeaderContent: this.$t('user.name'),
              field: 'userName'
            },
            {
              getContent: item => this.getField('HTTPS', item),
              getHeaderContent: 'HTTPS/HTTP',
              field: 'HTTPS'
            },
            {
              getContent: item => this.getField('state', item),
              getHeaderContent: this.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => this.getField('status', item),
              getHeaderContent: this.$t('common.status'),
              field: 'status',
            },
          ]
        }
      }
    },
    created(){
      //初始化查询参数并查询
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
      //获得列表行数据
      getField(field, item){
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'state','domainName', 'status', 'userName']
        if (_.includes(normalFields, field)) return item[field]
        if (field === 'HTTPS') return item.https === true ? 'HTTPS' :'HTTP'
      },
      //获得查询条件
      getCondition(){
        let self = this, conditionList = [];
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`);
        if(self.selectVal !== '' && self.searchStr !== ''){
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList;
      },
      //查询vCenter 列表
      queryList(){
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction(`vCenter/basicQuery`, {
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
          }).then(() => {
            self.itemList = self.getItemList();
            self.windowData.loading = false;
          })
        })
      },
      getItemList(){
        let self = this;
        return self.getList(self.windowData.uuidList);
      },
      pageDelete(){
        let self = this;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg',{
          title:  'vcenter.delete',
          description: 'vcenter.info.deleteConfirm',
          warning: 'vcenter.deleteWarning',
          uuidList: self.selectedList,
          icon: 'vcenter_popup',
          ok(){
            self.delete(self.selectedList);
          },
          getName(uuid){
            return self.dbData.vCenters[uuid].name;
          }
        })
      },
      updateSelectedvCenter (uuidList) {
        let self = this;
        return self.dispatchAction(`vcenters`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: `uuid~=${uuidList.join(',')}`
        }).then((resp) => {
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          }).then(() => {
            self.itemList = self.getItemList();
          })
        })
      },
      pageAsync(){
        let self = this;
        if(!self.isSelected) return;
        self.asyncVcenter(self.selectedList)
          .then(() => {
            self.updateSelectedvCenter(self.selectedList);
          });
      },
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createResource'})
      }
    }
  }
</script>

<style scoped>

</style>
