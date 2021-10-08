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
      pageOpenConsole: function () {
        if (!this.isSingleSelected) return
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
      pageReconnect: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].status !== 'Connecting') uuidList.push(uuid)
        })
         if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'virtualRouter.reconnect',
            description: 'virtualRouter.info.reconnectConfirm',
            icon: 'virtual_router_popupico',
            warning: 'virtualRouter.reconnectWarning',
            ok: () => this.reconnect(uuidList),
            getName: (uuid) => {
              return this.dbData.vm[uuid].name;
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
        let value, self = this;
        let hostUuid = self.dbData.vm[uuid].hostUuid ? self.dbData.vm[uuid].hostUuid : self.dbData.vm[uuid].lastHostUuid
        try {
          value = self.dbData.host[hostUuid].name
        } catch (e) {
          if (checkBounce(`getHostName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(self, 'host', hostUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getAccountName(uuid) {
        let value = '', self = this;
        try {
          value = self.dbData.account[self.dbData.vm[uuid].accountUuid].name
        } catch (e) {
          if (checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            self.dbData.vm[uuid].accountUuid = accountRefResp.inventories[0].accountUuid;
            rpc.queryResourceNames(self, 'account', accountRefResp.inventories[0].accountUuid)
          })

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
      },
      //删除
      pageDelete: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'virtualRouter.delete',
            description: 'virtualRouter.info.deleteConfirm',
            isChecked: true,
            checkBoxText: '我已知晓上述风险',
            icon: 'virtual_router_popupico',
            warning: 'virtualRouter.deleteWarning',
            ok: (isDelete) => {
              if(isDelete)
                self.delete(uuidList).then(() => self.queryList())
            },
            getName:(uuid) => {
              return this.dbData.vm[uuid].name;
            }
          })
        }
      },
      pageExpunge: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].hypervisorType !== 'ESX') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'virtualRouter.delete',
            description: 'virtualRouter.info.deleteConfirm',
            isChecked: true,
            checkBoxText: '我已知晓上述风险',
            icon: 'virtual_router_popupico',
            warning: 'virtualRouter.deleteWarning',
            ok: () => {
              self.expunge(uuidList).then(() => self.queryList())
            },
            getName:(uuid) => {
              return this.dbData.vm[uuid].name;
            }
          })
        }
      },
      pageRecover: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].hypervisorType !== 'ESX') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.recover(uuidList)
      },
      pageStart: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state !== 'Running' && this.dbData.vm[uuid].state !== 'Paused') uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          this.start(uuidList)
        }
      },
      pageStop: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'virtualRouter.Stop',
            description: this.$t(`virtualRouter.vmActionTitle`,
              {type: this.$t(`virtualRouter.stop`), length: uuidList.length, text: '云路由器'}),
            icon: 'virtual_router_popupico',
            ok: () => {
              self.stop(uuidList).then(() => self.queryList())
            },
            getName:(uuid) => {
              return this.dbData.vm[uuid].name;
            }
          })
        }
      },
      pageReboot: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state === 'Running') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: this.$t('virtualRouter.reboot') + this.$t('common.virtualrouter'),
            description: this.$t(`virtualRouter.vmActionTitle`,
              {type: this.$t(`virtualRouter.reboot`), length: uuidList.length, text: '云路由器'}),
            icon: 'virtual_router_popupico',
            ok: () => {
              self.reboot(uuidList).then(() => {self.queryList()})
            },
            getName: (uuid) => {
              return this.dbData.vm[uuid].name;
            }
          })
        }
      },
      pagePowerOff: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected && this.dbData.vm[uuid].hypervisorType !== 'ESX') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVirtualRouterVmInstanceConfirm', {
            'confirmDlgType': 'PowerOff',
            uuidList,
            ok: () => {
              self.powerOff(uuidList)
            }
          })
            .then(() => {
            })
        }
      },
      pageMigrate: function () {
        if (!this.isSingleSelected) return
        let self = this
        let vmUuid = self.selectedList[0]
        if (self.inStates('Running')) {
          rpc.query(`vm-instances/${vmUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid)
              self.hostSingleMessage = {
                hostUuidList: hostUuidList,
                type: 'migrate',
                vmUuid
              }
              self.showHostSingleDlg = true;
            })
        } else {
          let rootVolumeUuid
          self.dbData.vm[vmUuid].allVolumes.forEach((item) => {
            if (item.type === 'Root') rootVolumeUuid = item.uuid
          })
          rpc.query(`volumes/${rootVolumeUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid)
              self.hostSingleMessage = {
                hostUuidList: hostUuidList,
                type: 'migrate',
                vmUuid
              }
              self.showHostSingleDlg = true;
            })
        }
      },
      pageSetVmConsolePassword: function () {
        let self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openDialog('ModifyVpcVRouterDlg', {
          ok: (msg, isReboot) => {
            self.setVmConsolePassword(selectedUuidList, msg, isReboot)
              .then(() => self.queryList())
          }
        })
      },
      pageDeleteVmConsolePassword: function () {
        let self = this
        if (self.selectedList.length === 0) return
        let uuidList = []
        self.selectedList.forEach((uuid) => {
          if (self.dbData.vmInstancesConsolePassword[uuid].hasPassword) uuidList.push(uuid)
        })
        self.openDialog('ConfirmDlg', {
          uuidList,
          title: this.$t('virtualRouter.cancel') + this.$t('common.virtualrouter'),
          description: this.$t('virtualRouter.vmActionTitle', {
            type: this.$t('virtualRouter.cancel'),
            length: uuidList.length,
            text: this.$t('virtualRouter.consolePassword')
          }),
          icon: 'virtual_router_popupico',
          warning: 'account.accountWarning',
          isChecked: true,
          checkBoxText: 'common.rebootRouter',
          ok: (isReboot) => {
            self.deleteVmConsolePassword(uuidList, isReboot)
              .then(() => self.queryList())
          },
          getName: (uuid) => {
            return self.dbData.vm[uuid].name;
          }
        })
      },
      inPsType: function () {
        let uuid
        this.dbData.vm[this.selectedList[0]].allVolumes.forEach((item) => {
          if (item.type === 'Root') uuid = item.primaryStorageUuid
        })
        let type = this.dbData.primarystorage[uuid].type
        let typeList = []
        for (let i = 0; i < arguments.length; i++) {
          typeList.push(arguments[i])
        }
        return !typeList.every((item, index, array) => {
          return item !== type
        })
      },
      canDeleteConsolepassword: function () {
        if (this.selectedList.length === 0) return
        return !this.selectedList.every((uuid) => {
          return !this.dbData.vmInstancesConsolePassword[uuid].hasPassword
        })
      },

      closeHostSingleDlg(param) {
        let self = this;
        if(param) {
          self.migrate(param.vmUuid, param.uuid)
            .then(() => self.queryList())
        }
        self.showHostSingleDlg = false;
      },

    }
  }
</script>
