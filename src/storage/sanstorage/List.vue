<script>
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import methods from './Methods'
  import { mapGetters, mapState } from 'vuex'
  import Utils from 'src/utils/utils'

  export default {
    mixins: [methods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    computed: {
      ...mapState({
        webStorage: state => state.webStorage,
        fiberChannelController: state => state.fiberChannelController,
        fiberChannelLun: state => state.fiberChannelLun
      }),
      ...mapGetters({
        getWebStorageByUuidList: 'webStorage/getList',
        getComposedList: 'webStorage/getComposedList',
        getLunList: 'fiberChannelLun/get',
        getFcComposedList: 'fiberChannelController/get',
        getChild: 'webStorage/getChild'
      }),
      lunList () {
        let uuidList = _.get(this, `windowData.uuidList`)
        if (!_.isArray(uuidList) || uuidList.length === 0) return []
        return _.values(this.fiberChannelLun).filter(it => _.includes(uuidList, it.uuid))
      }
    },
    methods: {
      getData(){
        let uuidList = _.get(this, `windowData.uuidList`)
        if (!_.isArray(uuidList) || uuidList.length === 0) return []
        if (this.currTab === 'fc') {
          return this.getFcComposedList(uuidList)
        } else {
          return this.getComposedList(uuidList)
        }
      },
      pageAttachVm () {
        const self = this
        let lun = _.find(self.itemList, item => item.uuid === self.selectedList[0])
        let hostUuids = lun.scsiLunHostRefs.map(v => v.hostUuid)
        let attachedVms = lun.scsiLunVmInstanceRefs.map(v => v.vmInstanceUuid)
        let conditions = ['type=UserVm', 'hypervisorType=KVM', `hostUuid?=${hostUuids}`, `uuid!?=${attachedVms}`, `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        return rpc.query('vm-instances', {
          q: conditions
        }).then(resp => {
          return self.openDialog('VmInstanceMultiSelectListDlg', {
            conditions: [`uuid?=${resp.inventories.map(v => v.uuid)}`, 'state!=Destroyed'],
            select: vmUuidList => self.attachVm(lun.uuid, vmUuidList).then(self.queryList)
          })
        })
      },
      pageDetachVm () {
        const self = this
        let lun = _.find(self.itemList, item => item.uuid === self.selectedList[0])
        let attachedVms = lun.scsiLunVmInstanceRefs.map(v => v.vmInstanceUuid)
        self.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: [`uuid?=${attachedVms}`],
          select: vmUuidList => self.detachVm(lun.uuid, vmUuidList).then(self.queryList)
        })
      },
      async pageCheckClusterStatus () {
        const self = this
        let lunUuid = self.selectedList[0]
        let hostResp = await rpc.query('hosts', { q: [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM'] })
        let clusterUuids = _.uniq(hostResp.inventories.map(v => v.clusterUuid))
        self.openDialog('ClusterListSingleSelectList', {
          conditions: ['type=zstack', `uuid?=${clusterUuids}`],
          toolbar: true,
          select: clusterUuid => self.openDialog('CheckClusterStatusDlg', { lunUuid, clusterUuid })
        })
      },
      queryScsiLun: async function () {
        const { pageSize, pageIndex, sortBy, sortDirection } = this.windowData
        return this.dispatchAction('fiberChannelLun/queryScsiLun', {
          start: (pageIndex - 1) * pageSize,
          limit: pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${sortDirection}${sortBy}`
        }).then(resp => {
          let uuidList = resp.uuidList
          let table = Utils.createTableObjFromUuidList(uuidList)
          this.updateWindow({
            uuidList,
            table,
            pageCount: this.computePageCount(resp.total, pageSize)
          })
        })
      },
      clickCheckbox: function (uuid, $event) {
        let newState = {
          table: {
            ...this.windowData.table,
            [uuid]: {
              selected: !this.windowData.table[uuid].selected,
              expanded: this.windowData.table[uuid].expanded
            }
          }
        }
        this.updateWindow(newState)
        $event.stopPropagation()
        let uuidList = this.windowData.uuidList.filter(uuid => this.windowData.table[uuid].selected)
        if (uuidList.length !== 1) {
          this.updateWindow({ currItemUuid: '' })
          this.destroyDialogs()
          this.destroyChildrenPanels(this.windowId)
        }
      },
      onRowClickInFc (uuid, $event) {
        let itemList = this.itemList || []
        let item = _.find(itemList, item => item.uuid === uuid)
        if (!item.isLeaf) return this.expandData(item.uuid)
        return this.clickCheckbox(uuid, $event)
      },
      onRowClickInISCSI (uuid, $event) {
        let itemList = this.itemList || []
        let item = _.find(itemList, item => item.uuid === uuid)
        if (item.isLeaf) return
        return this.clickCheckbox(uuid, $event)
      },
      getField (field, item) {
        if (_.isUndefined(item)) return ''
        let normalFields = ['ip', 'port', 'state', 'name', 'iqn']
        if (_.includes(normalFields, field)) return item[field]
        if (field === 'createDate') return this.formatDatetime(new Date(item[field]))
      },
      getFcField (field, item) {
        if (_.isUndefined(item)) return ''
        if (field === 'wwn') return item.isLeaf ? item['wwn'] : item['wwnn']
        if (field === 'size') return item.isLeaf ? this.bytesToSize(item[field]) : '-'
        if (field === 'attachedVmCount') return item.isLeaf ? item.scsiLunVmInstanceRefs.length : '-'
        if (_.includes(['wwid', 'type'], field)) return item.isLeaf ? item[field] : '-'
        return item[field]
      },
      expandData (uuid) {
        let self = this
        let table = _.cloneDeep(self.windowData.table)
        let toOpen = !table[uuid].expanded
        table[uuid].expanded = toOpen
        let uuidList = _.cloneDeep(self.windowData.uuidList) || []
        let index = uuidList.indexOf(uuid)
        let item = _.find(self.itemList, it => it.uuid === uuid)
        let uuidsToChange = item.children.map(v => v.uuid)
        uuidsToChange.forEach(uid => { table[uid] = { selected: false } })
        if (toOpen) {
          uuidList.splice(index + 1, 0, ...uuidsToChange)
        } else {
          _.remove(uuidList, uid => _.includes(uuidsToChange, uid))
        }
        let obj = { table }
        obj.uuidList = uuidList
        self.updateWindow(obj)
      },
      getItemList (uuidList) {
        if (this.currTab === 'fc') {
          return _.values(this.fiberChannelController, item => _.includes(uuidList, item.uuid))
        } else {
          console.log(_.values(this.webStorage, item => _.includes(uuidList, item.uuid)))
          return _.values(this.webStorage, item => _.includes(uuidList, item.uuid))
        }
      },
      canDetach () {
        if (!this.isSingleSelected) return false
        let uuid = this.selectedList[0]
        let iscsi = _.find(this.itemList, it => it.uuid === uuid)
        return iscsi.iscsiClusterRefs && iscsi.iscsiClusterRefs.length > 0
      },
      canDetachVm () {
        if (!this.isSingleSelected) return false
        let uuid = this.selectedList[0]
        let lun = _.find(this.itemList, it => it.uuid === uuid)
        return lun.scsiLunVmInstanceRefs && lun.scsiLunVmInstanceRefs.length > 0
      },
      canAttach () {
        if (!this.isSingleSelected) return false
        return true
      },
      pageSyncDevice () {
        return this.syncDevice()
      },
      queryList () {
        this.windowData.loading = true;
        if (this.updateCount) this.updateCount()
        let action = this.currTab === 'fc' ? 'fiberChannelController/query' : 'webStorage/queryList'
        const { pageSize, pageIndex, sortBy, sortDirection } = this.windowData

        return this.dispatchAction(action, {
          start: (pageIndex - 1) * pageSize,
          limit: pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${sortDirection}${sortBy}`
        }).then(resp => {
          this.windowData.loading = false;
          let itemList = this.getItemList(resp.uuidList)
          let uuidList = itemList.map(item => item.uuid)
          let table = Utils.createTableObjFromUuidList(uuidList)
          for (let key in table) {
            table[key].expanded = false
          }
          console.log('queryList ====' + resp.uuidList)

          return this.updateWindow({
            composedUuidList: uuidList,
            uuidList: resp.uuidList,
            table: table,
            pageCount: Utils.computePageCount(resp.total, pageSize),
            total: resp.total
          })
        }).then(()=>{
          this.itemList = this.getData();
        })
      }
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    }
  }
</script>
