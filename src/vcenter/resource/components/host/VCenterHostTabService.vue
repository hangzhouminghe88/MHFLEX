<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import HostList from 'src/om/host/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';

  export default {
    name: "VCenterHostTabService",
    mixins: [HostList, MultiSelectList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: [],
        dataSource:{
          getItemList: () => self.itemList,
          handleSort: self.handleSort,
          handleSelection: self.handleSelect,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => self.getField('managementIp', item),
              getHeaderContent: self.$t('common.managementIp'),
              field: 'managementIp',
              sortable: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              field: 'status'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            },
          ]
        },
      }
    },

    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-'
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      ...Utils,
      //查询条件
      getCondition() {
        let conditionList = []
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //列表数据
      getField(field, item){
        let self = this;
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'type', 'managementIp', 'state','status']
        if (_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
      }
    }
  }
</script>

<style scoped>

</style>
