<script>
  // import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import { checkBounce } from 'src/utils/utils'
  import Methods from './Methods'
  import WindowBase from 'src/windows/Window';
  // /* global localStorage:false */

  export default {
    mixins: [WindowBase, Methods],
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
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    },
    methods: {
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.vm[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.vm[uuid]
          }
        )
      },
      canStart () {
        return this.isSelected && this.inStates(['Stopped'])
      },
      canReboot () {
        return this.isSelected
      },
      pageReconnect: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].status !== 'Connecting') uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'vpcVRouter.reconnect',
            description: 'vpcVRouter.info.reconnectConfirm',
            warning: 'vpcVRouter.reconnectWarning',
            ok: () => this.reconnect(uuidList),
            icon: 'virtual_router_popupico',
            getName: (uuid) => {
              return this.dbData.vm[uuid].name;
            }
          })
        }
      },
      canOpenConsole () {
        if (!this.isSingleSelected) return false
        return !this.inStates('Connection') && this.inStates('Running')
      },
      canCreateEip () {
        if (!this.isSingleSelected) return false
        return this.inStates('Running') && this.inStatuses('Connected')
      },
      canCreateLoadBalancer () {
        if (!this.isSingleSelected) return false
        return this.inStates('Running') && this.inStatuses('Connected')
      },
      canCreatePortForwarding () {
        if (!this.isSingleSelected) return false
        return this.inStates('Running') && this.inStatuses('Connected')
      },
      canCreateVip () {
        return this.isSingleSelected
      },
      canCreateIPsec () {
        if (!this.isSingleSelected) return false
        return this.inStates('Running') && this.inStatuses('Connected')
      },
      canSetVmConsolePassword () {
        if (!this.isSingleSelected) return false
        return !this.consolePasswordIsSet(this.selectedList[0])
      },
      canDeleteVmConsolePassword () {
        if (!this.isSingleSelected) return false
        return this.consolePasswordIsSet(this.selectedList[0])
      },
      pageOpenConsole: function () {
        this.openConsole(this.selectedList[0])
      },
      // get fields functions
      getDefaultL3NetworkIp: function (uuid) {
        let value = ''
        for (let i = 0; i < this.dbData.vm[uuid].vmNics.length; i++) {
          if (this.dbData.vm[uuid].defaultRouteL3NetworkUuid === this.dbData.vm[uuid].vmNics[i].l3NetworkUuid) {
            value = this.dbData.vm[uuid].vmNics[i].ip
            break
          }
        }
        return value
      },
      pageDelete: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('DeleteVirtualRouterVmInstanceConfirm', {
            uuidList,
            ok: () => {
              self.delete(uuidList).then(() => {
                self.queryList()
              })
            }
          })
        }
      },
      getClusterName: function (uuid) {
        let value
        try {
          value = this.dbData.cluster[this.dbData.vm[uuid].clusterUuid].name
        } catch (e) {
          if (checkBounce(`getClusterName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'cluster', this.dbData.vm[uuid].clusterUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getHostIp: function (uuid) {
        let value
        let hostUuid = this.dbData.vm[uuid].hostUuid ? this.dbData.vm[uuid].hostUuid : this.dbData.vm[uuid].lastHostUuid
        try {
          value = this.dbData.host[hostUuid].managementIp
        } catch (e) {
          if (checkBounce(`getHostName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'host', hostUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getHostName: function (uuid) {
        let value
        let hostUuid = this.dbData.vm[uuid].hostUuid ? this.dbData.vm[uuid].hostUuid : this.dbData.vm[uuid].lastHostUuid
        try {
          value = this.dbData.host[hostUuid].name
        } catch (e) {
          if (checkBounce(`getHostName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'host', hostUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getAccountName: function (uuid) {
        let value = ''
        try {
          value = this.dbData.account[this.dbData.vm[uuid].accountUuid].name
        } catch (e) {
          if (checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            this.dbData.vm[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', accountRefResp.inventories[0].accountUuid)
          })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      canLiveMigrate: function () {
        let uuid = this.selectedList[0]
        if (this.dbData.common.isAdmin) {
          let windows = ['Windows', 'WindowsVirtio']
          if (windows.indexOf(this.dbData.vm[uuid].platform) > -1 && this.getPrimaryStorageType(uuid) === 'LocalStorage') {
            return false
          }
        }
        if (this.dbData.vmInstancesCapabilities[uuid]) {
          return this.dbData.vmInstancesCapabilities[uuid].LiveMigration
        }
        return false
      },
      canMigrate: function () {
        let self = this
        if (!self.isSingleSelected) return false
        let uuid = self.selectedList[0]
        if (self.inStates('Stopped') && self.dbData.vmInstancesCapabilities[uuid] && self.dbData.vmInstancesCapabilities[uuid].VolumeMigration) {
          return true
        } else if (self.canLiveMigrate() && self.inStates('Running')) {
          return true
        }
        return false
      },
      getHaLevel: function (uuid) {
        if (this.queryListing) return ''
        let value
        if (this.dbData.vm[uuid].haLevel) {
          value = this.dbData.vm[uuid].haLevel
        } else {
          if (checkBounce(`getHaLevel-${uuid}`)) return 'None'
          if (this.dbData.common.isOpensource) return 'None'
          value = 'None'
          rpc.query(`vm-instances/${uuid}/ha-levels`)
            .then((resp) => {
              let level = resp.level === 'NeverStop' ? 'NeverStop' : 'None'
              this.dbData.vm[uuid].haLevel = level
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      }
    }
  }
</script>
