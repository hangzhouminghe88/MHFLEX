<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';


  export default {
    name: "VCenterPoolTabService",
    mixins: [MultiSelectList, WindowBase],
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
              getContent: item => self.getField('parentItem', item),
              getHeaderContent: self.$t('vcenter.parentItem'),
              field: 'parentItem',
              tooltip: true
            },
            {
              getContent: item => self.getField('CPULimit', item),
              getHeaderContent: self.$t('vcenter.CPULimit'),
              field: 'CPULimit'
            },
            {
              getContent: item => self.getField('memoryLimit', item),
              getHeaderContent: self.$t('vcenter.memoryLimit'),
              field: 'memoryLimit'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            },
          ]
        },
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
      }
    },

    created: function () {
      let self = this
      self.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      })
        .then(self.queryCluster)
        .then(self.queryVmInstance)
        .then(self.queryList)
    },

    methods: {
      ...Utils,
      queryList () {
        let conditions = this.param.conditions
        return rpc.query('vcenters/clusters/resourcepools', {q: conditions}).then(resp => {
          let list = resp.inventories
          let temp = {}
          list.forEach(it => { temp[it.uuid] = it })
          let getVmTotal = poolUuid => {
            let res = 0
            let pool = temp[poolUuid]
            if (!pool) return res
            if (pool.subResources) {
              res += pool.subResources.filter(it => it.resourceType === 'VmInstanceVO').length
              pool.subResources.filter(it => it.resourceType !== 'VmInstanceVO').forEach(it => {
                res += getVmTotal(it.resourceUuid)
              })
            }
            return res
          }
          list.forEach(pool => {
            // get parentItem's name
            if (pool.parentUuid) {
              pool.parentItem = temp[pool.parentUuid].name
            } else {
              pool.parentItem = this.dbData.cluster[pool.vCenterClusterUuid].name
            }
            // count Vm
            if (!pool.subResources || pool.subResources.length === 0) {
              pool.vmInResourcePool = '-/-'
            } else {
              let used = pool.subResources.filter(it => it.resourceType === 'VmInstanceVO').length
              let total = getVmTotal(pool.uuid)
              pool.vmInResourcePool = used + '/' + total
            }
          })
          this.updateDbTable({
            tableName: 'vcenterResourcePool',
            list
          })
          let uuidList = list.filter(v => !v.parentUuid).map(v => v.uuid)
          const table = {}
          uuidList.forEach(uuid => { table[uuid] = { expanded: false, level: 0 } })
          return this.updateWindow({ uuidList, table })
        })
      },
      queryVmInstance () {
        return rpc.query('vm-instances', {q: `hypervisorType=ESX`}).then(resp => {
          return this.updateDbTable({
            tableName: 'vm',
            list: resp.inventories
          })
        })
      },
      queryCluster () {
        return rpc.query('vcenters/clusters', {q: `hypervisorType=ESX`}).then(resp => {
          let tasks = resp.inventories.map(cluster => this.updateDbRow({
            tableName: 'cluster',
            id: cluster.uuid,
            data: cluster
          }))
          return Promise.all(tasks)
        })
      },
      getField (field, item) {
        let isResourcePool = !_.isUndefined(item.CPUShares)
        if (field === 'type') return isResourcePool ? this.$t('vcenter.resourcePool') : this.$t('common.vm')
        if (!isResourcePool && !_.includes(['name', 'createDate'], field)) return '-'
        if (field === 'CPULimit') return item.CPULimit === -1 ? this.$t('common.unlimited') : this.hzConvert(item.CPULimit) + 'Hz'
        if (field === 'memoryLimit') return item.memoryLimit === -1 ? this.$t('common.unlimited') : this.bytesToSize(item.memoryLimit)
        if (field === 'createDate') return this.formatDatetime(new Date(item[field]))
        return item[field]
      },
      hzConvert (value) {
        if (value < 0) value = 0
        var sizes = [' ', 'K', 'M', 'G', 'T', 'P']
        if (value === 0) return '0 ' + sizes[0]
        let width = 2
        var num = Math.pow(10, width)
        var i = Math.floor(Math.log(value) / Math.log(1000))
        if (i < 0) i = 0
        if (sizes[i] === ' ') num = 1
        if (i >= 5) i = 5
        return Math.round(value / Math.pow(1000, i) * num) / num + ' ' + sizes[i]
      },
      getComposeList (itemList) {
        let result = []
        for (let item of itemList) {
          item.children = []
          if (item.subResources) {
            item.children = item.subResources
          }
          result.push(item)
        }
        return result
      },
    },
    computed: {
      itemList () {
        let uuidList = this.windowData.uuidList || []
        let list = uuidList.map(uuid => this.dbData.vcenterResourcePool[uuid] || this.dbData.vm[uuid])
        return this.getComposeList(list)
      }
    },
  }
</script>

<style scoped>

</style>
