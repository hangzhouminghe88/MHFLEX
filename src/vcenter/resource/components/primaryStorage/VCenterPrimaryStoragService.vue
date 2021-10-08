<script>
  import PrimaryStorageList from 'src/storage/primarystorage/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VCenterPrimaryStoragService",
    mixins: [WindowBase, MultiSelectList, PrimaryStorageList],
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
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.type'),
              field: 'type',
              sortable: true
            },
            {
              getContent: item => self.getField('url', item),
              getHeaderContent: self.$t('common.url'),
              field: 'url',
              tooltip: true
            },
            {
              getContent: item => self.getField('availableCapacity', item),
              getHeaderContent: self.$t('common.availableCapacity'),
              field: 'availableCapacity'
            },
            {
              getContent: item => self.getField('availablePhysicalCapacity', item),
              getHeaderContent: self.$t('common.availablePhysicalCapacity'),
              field: 'availablePhysicalCapacity'
            },
            {
              getContent: item => self.getField('totalCapacity', item),
              getHeaderContent: self.$t('common.totalCapacity'),
              field: 'totalCapacity'
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
          ]
        },
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
        primaryStorageUuidList: []
      }
    },

    created(){
      let self = this;
      self.init();
    },

    methods: {
      ...Utils,
      //查询条件
      getCondition () {
        let conditionList = []
        conditionList.push(`uuid?=${this.primaryStorageUuidList.join()}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //获得数据
      getField(field, item){
        let self = this;
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'type', 'url', 'state','status']
        if (_.includes(normalFields, field)) return item[field];
        let sizeFields = ['availableCapacity', 'availablePhysicalCapacity', 'totalCapacity'];
        if(_.includes(sizeFields, field)) return self.bytesToSize(item[field])
      },

      init () {
        const self = this
        let primaryStorageUuidList = []
        let tasks = []
        let p = rpc.query('vcenters/primary-storage', {
          q: `vCenterUuid=${self.param.vCenterUuid}`
        }).then((resp) => {
          primaryStorageUuidList = primaryStorageUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        tasks.push(p)
        Promise.all(tasks).then(() => {
          self.primaryStorageUuidList = primaryStorageUuidList
          self.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            currItemUuid: '',
            sortBy: 'createDate',
            sortDirection: '-',
            methods: {
              queryList: self.queryList
            }
          }).then(() => {
            self.queryList()
          })
        })
      },
    }
  }
</script>

<style scoped>

</style>
