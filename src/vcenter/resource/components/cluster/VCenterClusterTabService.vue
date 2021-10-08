<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import ClusterList from 'src/om/cluster/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';

  export default {
    name: "VCenterClusterTabService",
    mixins: [MultiSelectList, WindowBase, ClusterList],
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
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => self.getField('hypervisorType', item),
              getHeaderContent: self.$t('common.hypervisorType'),
              field: 'hypervisorType',
              sortable: true
            },
            {
              getContent: item => self.getField('hostNum', item),
              getHeaderContent: self.$t('common.hostNum'),
              field: 'hostNum'
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            },
          ]
        },
        itemList: [],
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        selectVal:  'name',
        searchStr: ''
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
      getCondition () {
        let conditionList = []
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //获得数据
      getField(field, item){
        let self = this;
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'state','hypervisorType']
        if (_.includes(normalFields, field)) return item[field];
        if(field === 'hostNum') return self.dbData.clusterA[item.uuid].hostNum;
        if (field === 'createDate') return self.formatDatetime(new Date(item[field]));
      }
    }
  }
</script>

<style scoped>

</style>
