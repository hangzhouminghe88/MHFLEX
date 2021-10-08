<script>
  // import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PciDeviceMethods from './Methods'
  import { checkBounce } from 'src/utils/utils'
  import rpc from 'src/utils/rpc'
  // global localStorage:false

  export default {
    mixins: [PciDeviceMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      }
    },
    methods: {
      //获得可用状态List
      getAvaiableStateList: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        const self = this
        let uuidList = []
        this.selectedList.forEach(uuid => {
          let pci = self.dbData.pcidevice[uuid]
          let pciState = pci && pci.state
          if (stateList.indexOf(pciState) > -1) uuidList.push(uuid)
        })
        return uuidList
      },
      //判断是否在某个状态下
      hasOnState: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        const self = this
        let has = false
        this.selectedList.forEach(uuid => {
          let pci = self.dbData.pcidevice[uuid]
          let pciState = pci && pci.state
          if (stateList.indexOf(pciState) > -1) has = true
        })
        return has
      },
      getCondition: function () {
        let conditionList = []
        if (this.param.uuidList && this.param.uuidList.length > 0) {
          conditionList.push(`hostUuid?=${this.param.uuidList.join()}`)
        }
        conditionList.push('type=Moxa_Device')
        if (this.windowData.conditions) conditionList = conditionList.concat(this.windowData.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        if (this.dbData.common.isOpensource) {
          this.updateWindow({ uuidList: [], table: {} })
          return
        }
        let resp = await rpc.query('pci-device/pci-devices', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          total: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        await this.updateDbTable({
          tableName: 'pcidevice',
          list: resp.inventories,
        })
        await this.updateWindow({ uuidList, table })
        this.itemList = this.getItemList();
      },
      //获得列表数据
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.pcidevice[uuid];
        })
      },
      //获得物理机名称
      getHostName: function (uuid) {
        let pci = this.dbData.pcidevice[uuid]
        let value
        if (pci && this.dbData.host[pci.hostUuid]) {
          value = this.dbData.host[pci.hostUuid].name
        } else {
          if (checkBounce(`getHostName-${uuid}`)) return ''
          value = ''
          let hostUuid = pci && pci.hostUuid
          rpc.queryResourceNames(this, 'host', hostUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      //获得云主机名称
      getVmName: function (uuid) {
        let pci = this.dbData.pcidevice[uuid]
        let value
        if (pci && this.dbData.vm[pci.vmInstanceUuid]) {
          value = this.dbData.vm[pci.vmInstanceUuid].name
        } else {
          if (checkBounce(`getVmName-${uuid}`)) return ''
          value = ''
          let vmUuid = pci && pci.vmInstanceUuid
          rpc.queryResourceNames(this, 'vm', vmUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      canAttach () {
        if (!this.isSingleSelected) return false
        let pci = this.dbData.pcidevice[this.selectedList[0]]
        let host = pci && this.dbData.host[pci.hostUuid]
        let isAttachable = host && host.state === 'Enabled' && host.status === 'Connected'
        return this.hasOnState('Enabled') && pci && !pci.vmInstanceUuid && isAttachable
      },
      canDetach () {
        if (!this.isSingleSelected) return false
        let pci = this.dbData.pcidevice[this.selectedList[0]]
        return pci && pci.vmInstanceUuid
      },
      canDisable () {
        if (!this.isSelected) return false
        let uuidList = this.selectedList
        let canDis = this.hasOnState('Enabled')
        let hasNotAttachedVm = false
        uuidList.forEach(uuid => {
          let pci = this.dbData.pcidevice[uuid]
          let pciVmInstance = pci && pci.vmInstanceUuid
          if (!pciVmInstance) hasNotAttachedVm = true
        })
        return canDis && hasNotAttachedVm
      },
      pageEnable: function () {
        let uuidList = this.getAvaiableStateList('Disabled')
        const self = this
        if (uuidList.length > 0) {
          self.enable(uuidList).then(() => {
            self.queryList()
          })
        }
      },
      pageDisable: function () {
        let uuidList = this.getAvaiableStateList('Enabled')
        let attachedpci = this.selectedList.filter(pci => !!this.dbData.pcidevice[pci].vmInstanceUuid)
        uuidList = _.uniq(_.difference(uuidList, attachedpci))
        const self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'pciDevice.action.disable',
            description: 'pciDevice.disablePciDevice',
            uuidList: uuidList,
            icon: 'pci_popupico',
            ok: () => {
              self.disable(uuidList).then(() => self.queryList())
            },
           getName(uuid){
              return self.dbData.pcidevice[uuid].name;
           }
          })
        }
      },
      pageAttach: function () {
        let self = this
        let vmInstanceUuid = self.windowData.vmUuid
        self.openSideWindow('PciDeviceMultiSelectListDlg', {
          vmInstanceUuid,
          select: (uuidList) => self.attach(vmInstanceUuid, uuidList).then(() => self.queryList())
        })
      },
      pageDetach: function () {
        let self = this
        let uuidList = []
        let vmInstanceUuid = this.windowData.vmUuid
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'pciDevice.action.detach',
            description: 'pciDevice.detachPciDevice',
            uuidList: uuidList,
            icon: 'pci_popupico',
            ok: () => {
              self.detach(vmInstanceUuid, uuidList).then(() => self.queryList())
            },
            getName(uuid){
              return self.dbData.pcidevice[uuid].name;
            },
          })
        }
      }
    }
  }
</script>
