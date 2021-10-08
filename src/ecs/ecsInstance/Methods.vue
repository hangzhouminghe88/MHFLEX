<script>
  import _ from 'lodash'
  import StoreUtils from '../../../store/utils'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  // import TagPartialForResourceMethods from 'src/windows/Tag/partials/TagPartialForResourceMethods'
  import { mapGetters, mapState } from 'vuex'
  // /* global localStorage:false */

  export default {
    // mixins: [TagPartialForResourceMethods],
    created: function () {
    },
    computed: {
      ...mapState({
        vm: state => state.vm,
        volume: state => state.volume,
        instanceOffering: state => state.instanceOffering
      }),
      ...mapGetters({
        get: 'vm/get',
        getTag: 'tag/get'
      })
    },
    methods: {
      removeVueStore (state, uuid) {
        StoreUtils.remove(state, uuid)
      },
      _pageMigrate: async function (vmUuid, cb) {
        let promiseResolve = null,
        p = new Promise((resolve) => { promiseResolve = resolve }),
        self = this, msgId = '',
        RootPsType = this.getPrimaryStorageType(vmUuid),
        hasLocalStorageVolume = await self.hasLocalStorageVolume(vmUuid)
        if (RootPsType === 'LocalStorage') {
          if ((self.isAttachVolume(vmUuid) && hasLocalStorageVolume) || self.hasPciDevice(vmUuid) || self.hasUsbDevice(vmUuid) || self.hasISOAttached(vmUuid)) {
            msgId = 'vm.remindMigrate'
          }
        } else if (_.includes(['NFS', 'Ceph', 'SharedMountPoint', 'SharedBlock', 'AliyunNAS'], RootPsType)) {
          if (self.hasPciDevice(vmUuid) || self.hasUsbDevice(vmUuid)) {
            msgId = 'vm.remindMigrate2'
          }
          if (self.isAttachVolume(vmUuid) && hasLocalStorageVolume) {
            msgId = 'vm.remindMigrate3'
          }
        }
        if (msgId !== '') {
          self.$msgbox({title: this.$t('common.migrate'), message: this.$t(msgId)})
          return p
        }
        //当存在Running，paused状态的云主机的时候可以绑定host
        if (this.inStates('Running', 'Paused')) {
          rpc.query(`vm-instances/${vmUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid)
              self.hostMessage = {
                hostUuidList: hostUuidList,
                type: 'migrate',
                vmUuid: vmUuid
              };
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
              self.hostMessage = {
                hostUuidList: hostUuidList,
                type: 'migrate',
                vmUuid: vmUuid
              };
              self.showHostSingleDlg = true;
            })
        }
        return p
      },
      //判断所选择的vm是否满足状态条件
      inStates() {
        let uuidList = [];
        if (this.selectedList.length <=0) return
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        uuidList = this.selectedList;
        if (this.selectList.length === 1) {
          return !stateList.every((item, index, array) => {
            return item !== this.dbData.vm[uuidList[0]].state
          })
        }
        let resp = true
        uuidList.forEach((uuid) => {
          if (!stateList.every((item, index, array) => { return item !== this.dbData.vm[uuid].state })) resp = true
        })
        return resp
      },
      //是否绑定Iso镜像
      hasISOAttached (uuid) {
        // return this.dbData.vmISO[uuid].value.length > 0
        return this.get(uuid).isoUuids && this.get(uuid).isoUuids.length > 0
      },
      updateRelatedPci (vmUuid) {
        let pciTable = _.cloneDeep(this.dbData.pcidevice)
        let tasks = []
        let p = null
        _.keys(pciTable).forEach(pciUuid => {
          if (pciTable[pciUuid].vmInstanceUuid === vmUuid) {
            let pci = _.cloneDeep(pciTable[pciUuid])
            delete pci.vmInstanceUuid
            p = this.forceUpdateDbRow({
              tableName: 'pcidevice',
              id: pciUuid,
              data: pci
            })
            tasks.push(p)
          }
        })
        return Promise.all(tasks)
      },
      //是否绑定云盘
      isAttachVolume: function (uuid) {
        let vm = this.get(uuid)
        if (!vm) return false
        let normalVolumeCount = vm.allVolumes.length
        let shareableVolumeCount = 0
        if (vm.shareableVolumeUuidList) {
          shareableVolumeCount = vm.shareableVolumeUuidList.length
        }
        if (normalVolumeCount + shareableVolumeCount > 1) return true
        return false
      },
      delete: function (uuidList, isDeleteVolume, progressFn) {
        if (progressFn) progressFn()
        let tasks = []
        tasks.push(
          this.dispatchActionWithEvent('vm/delete', uuidList)
          // this line of code converts every reject to resolve
          // refer to https://davidwalsh.name/promises-results
            .catch(() => undefined)
        )
        if (isDeleteVolume) {
          let self = this
          let volumeList = uuidList.reduce((total, vmUuid) => {
            let volumeUuids = self.vm[vmUuid].allVolumes.filter(v => v.type === 'Data').map(v => v.uuid)
            total = total.concat(volumeUuids)
            return total
          }, [])
          if (volumeList.length > 0) {
            tasks.push(
              this.dispatchActionWithEvent('volume/delete', volumeList)
            )
          }
        }
        return Promise.all(tasks)
      },
      updateRelatedVolume: function (vmUuid) {
        const self = this
        if (self.dbData.vm[vmUuid].allVolumes && self.dbData.vm[vmUuid].allVolumes.length > 0) {
          self.dbData.vm[vmUuid].allVolumes.forEach((volume) => {
            if (self.dbData.volume[volume.uuid]) {
              let volumeData = _.cloneDeep(self.dbData.volume[volume.uuid])
              volumeData.vmInstanceUuid = ''
              self.updateDbRow({
                tableName: 'volume',
                id: volumeData.uuid,
                data: volumeData
              })
            }
          })
        }
      },
      queryResourceProgress () {
        this.interval = setInterval(() => {
          return this.queryAllProgresses('vmProgress', ['Migrating', 'ColdMigrating', 'VolumeMigrating'])
        }, 4000)
      },
      getCandidateAffinityGroupForVmAttaching: async function (vmUuid) {
        let affinityGroupResp = await rpc.query(`affinity-groups`, {q: 'state=Enabled'})
        let affinityGroupUuids = affinityGroupResp.inventories.map(affinityGroup => affinityGroup.uuid)
        if (affinityGroupUuids.length === 0) return []
        if (!this.dbData.common.isAdmin) return affinityGroupUuids
        function getAccountRelatedAffinityGroup (affinityGroupUuids, accountUuid) {
          let result = []
          let tasks = []
          let p = null
          affinityGroupUuids.forEach(affinityGroupUuid => {
            p = rpc.query(`accounts/resources/refs`, {
              q: [`resourceUuid=${affinityGroupUuid}`, `accountUuid=${accountUuid}`]
            }).then(resp => {
              if (resp.inventories.length !== 0) result.push(affinityGroupUuid)
            })
            tasks.push(p)
          })
          return Promise.all(tasks).then(() => {
            return result
          })
        }
        if (!vmUuid) {
          let accountUuid = window.localStorage.getItem('accountUuid')
          let result = await getAccountRelatedAffinityGroup(affinityGroupUuids, accountUuid)
          return result
        } else {
          let accountResp = await rpc.query(`resources/accounts`, {resourceUuids: vmUuid})
          let accountUuid = accountResp.inventories[vmUuid].uuid
          affinityGroupUuids = await getAccountRelatedAffinityGroup(affinityGroupUuids, accountUuid)
        }
        let affinityGroupInSameAccount = affinityGroupResp.inventories.filter(affinityGroup => _.includes(affinityGroupUuids, affinityGroup.uuid))
        let vm = this.dbData.vm[vmUuid]
        if (!vm) return []
        async function getHostRelatedAffinityGroup (affinityGroups, hostUuid) {
          let excludeAffinity = []
          let affinityGroupUuids = affinityGroups.map(affinityGroup => affinityGroup.uuid)
          let tasks = []
          let p = null
          affinityGroups.forEach(async (affinityGroup) => {
            if (affinityGroup.policy === 'ANTIHARD') {
              let vmInAffinity = affinityGroup.usages.map(item => item.resourceUuid)
              p = rpc.query(`vm-instances`, {q: [`uuid?=${vmInAffinity}`, 'state=Running']}).then(runningVmResp => {
                let hostUuids = []
                runningVmResp.inventories.forEach(runningVm => {
                  hostUuids.push(runningVm.hostUuid)
                })
                if (_.includes(hostUuids, hostUuid)) {
                  excludeAffinity.push(affinityGroup.uuid)
                }
              })
              tasks.push(p)
              p = rpc.query(`vm-instances`, {q: ['state=Stopped', `uuid?=${vmInAffinity}`, `rootVolume.localStorageHostRef.hostUuid=${hostUuid}`]}).then(stoppedLocalVmResp => {
                if (stoppedLocalVmResp.inventories.length !== 0) {
                  excludeAffinity.push(affinityGroup.uuid)
                }
              })
              tasks.push(p)
            }
          })
          await Promise.all(tasks)
          return _.difference(affinityGroupUuids, excludeAffinity)
        }
        if (vm.state === 'Running') {
          let result = await getHostRelatedAffinityGroup(affinityGroupInSameAccount, vm.hostUuid)
          return result
        }
        if (vm.state === 'Stopped') {
          let result = null
          let vmResp = await rpc.query(`vm-instances`, {q: [`uuid=${vmUuid}`, 'rootVolume.primaryStorage.type=LocalStorage']})
          if (vmResp.inventories.length === 1) {
            result = await getHostRelatedAffinityGroup(affinityGroupInSameAccount, vm.lastHostUuid)
          } else {
            result = affinityGroupInSameAccount.map(affinityGroup => affinityGroup.uuid)
          }
          return result
        }
      },
      joinAffinityGroup (uuid, affinityGroupUuid) {
        return this.dispatchActionWithEvent('vm/addVmToAffinityGroup', {
          uuid,
          affinityGroupUuid
        })
      },
      getAffinityGroup: function (vmUuid) {
        let affinityGroup = this.dbData.vmAffinityGroup[vmUuid]
        if (!affinityGroup) return
        return affinityGroup.uuid
      },
      leaveAffinityGroup (uuid, affinityGroupUuid, fn) {
        return this.dispatchActionWithEvent('vm/removeVmFromAffinityGroup', {
          uuid,
          affinityGroupUuid
        }).then(() => {
          if(fn) fn();
        })
      },
      expunge: function (uuidList, cb) {
        const self = this
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            cb
          }
        })
        return self.dispatchActionWithEvent('vm/expunge', paramList)
      },
      start: function (uuidList) {
        return this.dispatchActionWithEvent('vm/start', uuidList)
          .then(() => {
            return this.dispatchAction('vm/query', { q: `uuid?=${uuidList.join(',')}` })
          })
      },
      stop: function (uuidList, stopHa, fn) {
        let paramList = uuidList.map(uuid => ({ uuid, stopHa }))
        return this.dispatchActionWithEvent('vm/stop', paramList)
          .then(() => {
            if(fn) fn();
          })
      },
      recover: function (uuidList, progressFn, startVm, cb) {
        if (progressFn) {
          progressFn()
        }
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            cb
          }
        })
        return this.dispatchActionWithEvent('vm/recover', paramList)
          .then(() => {
            if (startVm) {
              return this.dispatchActionWithEvent('vm/start', uuidList)
            }
          })
      },
      consolePasswordIsSet (uuid) {
        return !!this.dbData.vmConsolePassword[uuid] && this.dbData.vmConsolePassword[uuid].value !== ''
        // return this.dbData.vmInstancesConsolePassword[uuid] && this.dbData.vmInstancesConsolePassword[uuid].hasPassword
      },
      isNotFusionstor: function (uuid) {
        const self = this
        let isNotFusionstor = true
        if (self.dbData.vm[uuid]) {
          self.dbData.vm[uuid].allVolumes.forEach((item) => {
            if (item.type === 'Root') {
              if (item.installPath && (item.installPath.indexOf('fusionstor:') > -1)) {
                isNotFusionstor = false
              }
            }
          })
        }
        return isNotFusionstor
      },
      canBackupInHybrid (uuid) {
        let vm = this.dbData.vm[uuid]
        if (!vm) return false
        let inStates = ['Running', 'Stopped'].indexOf(this.dbData.vm[uuid].state) > -1
        if (!inStates) return false
        let rootVolume
        for (let i = 0; i < vm.allVolumes.length; i++) {
          if (vm.allVolumes[i].type === 'Root') {
            rootVolume = vm.allVolumes[i]
            break
          }
        }
        if (!rootVolume) return false
        let primaryStorage = this.dbData.primarystorage[rootVolume.primaryStorageUuid]
        if (!primaryStorage) {
          return false
        }
        return this.getBackupStoragesInCurrentZone() && ['NFS', 'LocalStorage', 'SharedMountPoint', 'Ceph', 'SharedBlock', 'AliyunNAS'].indexOf(primaryStorage.type) > -1
        // return this.dbData.common.hasImageStore && ['NFS', 'LocalStorage', 'SharedMountPoint', 'Ceph'].indexOf(primaryStorage.type) > -1
      },
      canBackup (uuid) {
        let vm = this.dbData.vm[uuid]
        if (!vm) return false
        let inStates = ['Running'].indexOf(this.dbData.vm[uuid].state) > -1
        if (!inStates) return false
        return true
      },
      canClone: function (uuid) {
        if (!uuid) return false
        if (this.dbData.vm[uuid].state === 'Stopped' || this.dbData.vm[uuid].state === 'Running' || this.dbData.vm[uuid].state === 'Paused') {
          return this.getBackupStoragesInCurrentZoneType('ImageStoreBackupStorage') || this.getBackupStoragesInCurrentZoneType('Ceph')
        }
        return false
      },
      canCreateImage: function (uuid) {
        if (!uuid) return false
        if (this.dbData.vm[uuid].state === 'Stopped') {
          return this.getBackupStoragesInCurrentZone()
          // return _.keys(self.dbData.backupStoragesInCurrentZone).length > 0
        }
        if (this.dbData.vm[uuid].state === 'Running') {
          return this.getBackupStoragesInCurrentZoneType('ImageStoreBackupStorage') || this.getBackupStoragesInCurrentZoneType('Ceph')
        }
        return false
      },
      queryVmInstanceCapabilities: function (uuid) {
        return rpc.query(`vm-instances/${uuid}/capabilities`)
          .then((resp) => {
            return this.updateDbRow({
              tableName: 'vmInstancesCapabilities',
              id: uuid,
              data: resp.capabilities
            })
          })
      },
      canReimage (uuid) {
        if (!uuid) return false
        let value
        try {
          value = this.dbData.vmInstancesCapabilities[uuid].Reimage
        } catch (e) {
          this.queryVmInstanceCapabilities(uuid)
        }
        return value
      },
      canVolumeMigrate: function (uuid) {
        if (!uuid) return false
        let value
        try {
          value = this.dbData.vmInstancesCapabilities[uuid].VolumeMigration
        } catch (e) {
          this.queryVmInstanceCapabilities(uuid)
        }
        return value
      },
      canMigrate: function (uuid) {
        if (!uuid) return false
        let psType = this.getPrimaryStorageType(uuid)
        if (this.inStates('Stopped') && this.canVolumeMigrate(uuid)) {
          return true
        } else if (this.inStates('Running', 'Paused') && this.canLiveMigrate(uuid) && psType !== 'LocalStorage') {
          return true
        } else if (this.inStates('Running') && this.canLiveMigrate(uuid) && psType === 'LocalStorage') {
          return true
        }
        return false
      },
      canStorageMigrate: function (uuid) {
        let psType = this.getPrimaryStorageType(uuid)
        if (!this.inStates('Stopped') || ['Ceph', 'NFS', 'SharedBlock'].indexOf(psType) === -1) return false
        return true
      },
      canStartFromHost: function (uuid) {
        if (this.dbData.common.isAdmin) {
          if (this.inStates('Stopped') && this.getPrimaryStorageType(uuid) === 'LocalStorage') return false
        }
        if (this.inStates('Stopped') && this.canLiveMigrate(uuid) && !this.hasPciDevice(uuid)) return true
        else return false
      },

      //是否装有驱动
      hasPciDevice (vmUuid) {
        let vm = this.get(vmUuid)
        return vm.pciDeviceUuidList && vm.pciDeviceUuidList.length > 0
      },
      //是否配置Usb
      hasUsbDevice (vmUuid) {
        let vm = this.get(vmUuid)
        return vm.usbDeviceUuidList && vm.usbDeviceUuidList.length > 0
      },
      hasAttachedVolume (vmUuid) {
        let vm = this.get(vmUuid)
        if (vm.allVolumes && vm.allVolumes.length >= 2) return true
        if (vm.shareableVolumeUuidList && vm.shareableVolumeUuidList.length > 0) return true
        return false
      },
      isChangeConfigDisabled: function () {
        if (this.dbData.common.liveMigrate) {
          return !this.inStates('Stopped', 'Running')
        } else {
          return !this.inStates('Stopped')
        }
      },
      reboot: function (uuidList, type, fn) {
        return this.dispatchActionWithEvent('vm/reboot', uuidList)
        .then(() => {
          if(fn) fn();
        })
        // const self = this
        // let event = self.createEvent('vm.action.reboot', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        // let tasks = []
        // uuidList.forEach(uuid => {
        //   let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
        //   vmInventory.state = 'Rebooting'
        //   self.updateDbRow({
        //     tableName: 'vm',
        //     id: uuid,
        //     data: vmInventory
        //   })
        //   let p = rpc.update('vm-instances', uuid, {
        //     'rebootVmInstance': {}
        //   }, event)
        //   .then(() => {
        //     self.incEventSuccess(event)
        //   }, () => {
        //     self.incEventFail(event)
        //   })
        //   tasks.push(p)
        // })
        // return Promise.all(tasks).then(() => {
        //   self.$forceUpdate()
        //   self.query(uuidList)
        // })
      },
      resume: function (uuidList, type, fn) {
        return this.dispatchActionWithEvent('vm/resume', uuidList)
         .then(() => {
          if(fn) fn();
        })
        // let event = this.createEvent('vm.action.resume', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        // const self = this
        // let tasks = []
        // uuidList.forEach(function (uuid) {
        //   ((uuid) => {
        //     let p = rpc.update('vm-instances', uuid, {
        //       'resumeVmInstance': {}
        //     }, event)
        //     .then(resp => {
        //       self.incEventSuccess(event)
        //       self.updateDbRow({
        //         tableName: 'vm',
        //         id: uuid,
        //         data: resp.inventory
        //       })
        //       // self.queryList()
        //     }, () => {
        //       self.incEventFail(event)
        //     })
        //     tasks.push(p)
        //   })(uuid)
        // })
        // return Promise.all(tasks).then(() => {
        //   self.$forceUpdate()
        // })
      },
      pause: function (uuidList, type, fn) {
        return this.dispatchActionWithEvent('vm/pause', uuidList)
        .then(() => {
          if(fn) fn();
        })
        // let event = this.createEvent('vm.action.pause', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        // const self = this
        // let tasks = []
        // uuidList.forEach(uuid => {
        //   let p = rpc.update('vm-instances', uuid, {
        //     'pauseVmInstance': {}
        //   }, event)
        //   .then(resp => {
        //     self.incEventSuccess(event)
        //     return self.updateDbRow({
        //       tableName: 'vm',
        //       id: uuid,
        //       data: resp.inventory
        //     })
        //   }, () => {
        //     self.incEventFail(event)
        //   })
        //   tasks.push(p)
        // })
        // return Promise.all(tasks).then(() => {
        //   self.$forceUpdate()
        // })
      },
      powerOff: function (uuidList, stopHa, fn) {
        let param = uuidList.map(uuid => {
          return {
            uuid,
            stopHa
          }
        })
        return this.dispatchActionWithEvent('vm/powerOff', param)
         .then(() => {
          if(fn) fn();
        })
        // let event = this.createEvent('vm.action.forcestop', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        // const self = this
        // let tasks = []
        // uuidList.forEach(uuid => {
        //   ((uuid) => {
        //     self.updateDbRow({
        //       tableName: 'vm',
        //       id: uuid,
        //       data: {
        //         state: 'Stopping'
        //       }
        //     })
        //     let p = rpc.update('vm-instances', uuid, {
        //       'stopVmInstance': {
        //         'type': 'cold',
        //         'stopHA': stopHa
        //       }
        //     }, event).then(resp => {
        //       self.incEventSuccess(event)
        //       let vm = _.cloneDeep(self.dbData.vm[uuid])
        //       delete vm.hostUuid
        //       return self.forceUpdateDbRow({
        //         tableName: 'vm',
        //         id: uuid,
        //         data: vm
        //       }).then(() => {
        //         self.query(uuid)
        //       })
        //       // self.updateDbRow({
        //       //   tableName: 'vm',
        //       //   id: uuid,
        //       //   data: resp.inventory
        //       // })
        //     }, () => {
        //       self.incEventFail(event)
        //       self.query(uuid)
        //       // let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
        //       // self.updateDbRow({
        //       //   tableName: 'vm',
        //       //   id: uuid,
        //       //   data: vmInventory
        //       // })
        //     })
        //     tasks.push(p)
        //   })(uuid)
        // })
        // return Promise.all(tasks).then(() => {
        //   self.$forceUpdate()
        // })
      },
      clone: function (uuid, param) {
        let self = this
        const totalCount = param.names.length
        let event = self.createEvent('vm.action.clone', self.dbData.vm[uuid] ? self.dbData.vm[uuid].name : '', totalCount)
        return this.dispatchAction('vm/clone', { uuid, param, event }).then((result) => {
          let successCount = result.numberOfClonedVm
          event.successCount = successCount
          event.failCount = (totalCount - successCount)
          self.setEventFinished(event)
          return Promise.resolve(result)
        }, () => {
          event.successCount = 0
          event.failCount = totalCount
          self.setEventFinished(event)
        })
      },
      openClonePanel: async function (uuid, cb) {
        const self = this
        let availableCephPrimaryStorageUuidList = []
        let vm = _.get(self.vm, uuid)
        const { allVolumes } = vm
        let rootVolume = allVolumes.find(it => it.type === 'Root')
        if (self.getPrimaryStorageType(uuid) === 'Ceph' && rootVolume) {
          let zql = "query CephPrimaryStorage.uuid where type='Ceph' and fsid in (query CephPrimaryStorage.fsid where uuid='" + `${rootVolume.primaryStorageUuid}` + "')"
          let tasks = []
          let p = rpc.query('/zql', {
            zql: encodeURIComponent(zql)
          }).then((resp) => {
            if (resp.results && resp.results.length > 0) {
              availableCephPrimaryStorageUuidList = _.map(resp.results[0].inventories, (item) => item.uuid)
            }
          })
          tasks.push(p)
          await Promise.all(tasks)
        }
        let showAttachedChecked =  self.canCloneDataVolume() && self.isNasPs(uuid);
        self.cloneVmMessage = {
          vmUuid: uuid,
          availableCephPrimaryStorageUuidList,
          showAttachedChecked: showAttachedChecked
        }
        self.showCloneVm = true;
        self.$emit('showCloneVmInstance', {show: self.showCloneVm, cloneVmMessage: self.cloneVmMessage})
        // await self.openFullPanel('windows/VmInstance/dialogs/CloneVmInstance', {
        //   vmUuid: uuid,
        //   availableCephPrimaryStorageUuidList,
        //   ok: (param) => {
        //     let names = []
        //     if (param.numbers > 1) {
        //       for (let i = 0; i < param.numbers; i++) {
        //         names.push(`${param.name}-${i + 1}`)
        //       }
        //     } else {
        //       names.push(`${param.name}`)
        //     }
        //     param.names = names
        //     delete param.name
        //     delete param.numbers
        //     self.clone(uuid, param).then((resp) => {
        //       if (cb) cb(resp)
        //     })
        //   },
        //   showAttachedChecked: self.canCloneDataVolume() && self.isNasPs(uuid)
        // })
      },
      isNasPs: function (vmUuid) {
        let self = this
        let vm = self.dbData.vm[vmUuid]
        if (vm) {
          let rootVolume = self.dbData.volume[vm.rootVolumeUuid]
          if (rootVolume) {
            let ps = self.dbData.primarystorage[rootVolume.primaryStorageUuid]
            if (ps.type === 'AliyunNAS') {
              return false
            }
          }
        }
        return true
      },
      canCloneDataVolume () {
        if (!this.dbData.common.isAdmin) return true
        let result = false
        _.values(this.dbData.backupstorage).forEach(bs => {
          if (bs.type === 'ImageStoreBackupStorage' && bs.state === 'Enabled' && bs.status === 'Connected') {
            result = true
          }
        })
        return result
      },
      reimage: function (uuid) {
        return this.dispatchActionWithEvent('vm/reimage', {
          uuid
        })
      },
      changeVmImage: function (vmInstanceUuid, imageUuid) {
        const self = this
        let event = self.createEvent('vm.action.changeVmImage', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '')
        return rpc.update('vm-instances', vmInstanceUuid, {
          'changeVmImage': {
            'imageUuid': imageUuid
          }
        }, event)
          .then(resp => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      migrate: function (uuid, hostUuid) {
        return this.dispatchActionWithEvent('vm/liveMigrate', {
          uuid,
          hostUuid
        }).then(() => {
          this.dispatchAction('vm/queryRelatedData', this.get(uuid))
        })
        // let event = this.createEvent('vm.action.migrate', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        // let vmInventory = _.cloneDeep(this.dbData.vm[vmInstanceUuid])
        // vmInventory.state = 'VolumeMigrating'
        // let originState = this.dbData.vm[vmInstanceUuid].state
        // let jobUuid = this.genUniqueId()
        // this.updateDbRow({
        //   tableName: 'vm',
        //   id: vmInstanceUuid,
        //   data: vmInventory
        // }).then(() => {
        //   this.setJobUuid(vmInstanceUuid, 'VolumeMigrating', jobUuid)
        //   if (!this.interval) {
        //     this.queryResourceProgress()
        //   }
        // })
        // return rpc.update('vm-instances', vmInstanceUuid, {
        //   'migrateVm': {
        //     'hostUuid': hostUuid
        //   }
        // }, event, jobUuid)
        // .then(resp => {
        //   this.deleteJobUuid(vmInstanceUuid, jobUuid)
        //   this.incEventSuccess(event)
        //   return this.updateDbRow({
        //     tableName: 'vm',
        //     id: vmInstanceUuid,
        //     data: resp.inventory
        //   })
        // }, () => {
        //   this.deleteJobUuid(vmInstanceUuid, jobUuid)
        //   let obj = {state: originState}
        //   this.updateDbRow({
        //     tableName: 'vm',
        //     id: vmInstanceUuid,
        //     data: obj
        //   })
        //   this.incEventFail(event)
        // })
      },
      coldMigrate: function (uuid, hostUuid) {
        return this.dispatchActionWithEvent('vm/coldMigrate', {
          uuid,
          hostUuid
        }).then(() => {
          this.dispatchAction('vm/queryRelatedData', this.get(uuid))
        })
        // let self = this
        // let event = self.createEvent('vm.action.coldMigrate', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '')
        // let rootVolumeUuid
        // let jobUuid = this.genUniqueId()
        // self.dbData.vm[vmInstanceUuid].allVolumes.forEach((item) => {
        //   if (item.type === 'Root') rootVolumeUuid = item.uuid
        // })
        // let originState = this.dbData.vm[vmInstanceUuid].state
        // let vmInventory = _.cloneDeep(this.dbData.vm[vmInstanceUuid])
        // vmInventory.state = 'ColdMigrating'
        // this.updateDbRow({
        //   tableName: 'vm',
        //   id: vmInstanceUuid,
        //   data: vmInventory
        // }).then(() => {
        //   this.setJobUuid(vmInstanceUuid, 'ColdMigrating', jobUuid)
        //   if (!this.interval) {
        //     this.queryResourceProgress()
        //   }
        // })
        // return rpc.put(`primary-storage/local-storage/volumes/${rootVolumeUuid}/actions`, {
        //   'localStorageMigrateVolume': {
        //     'destHostUuid': hostUuid
        //   }
        // }, event, jobUuid)
        // .then(resp => {
        //   this.deleteJobUuid(vmInstanceUuid, jobUuid)
        //   self.incEventSuccess(event)
        //   let obj = {state: originState, hostUuid: hostUuid}
        //   return self.updateDbRow({
        //     tableName: 'vm',
        //     id: vmInstanceUuid,
        //     data: obj
        //   })
        // }, () => {
        //   this.deleteJobUuid(vmInstanceUuid, jobUuid)
        //   let obj = {state: originState}
        //   this.updateDbRow({
        //     tableName: 'vm',
        //     id: vmInstanceUuid,
        //     data: obj
        //   })
        //   self.incEventFail(event)
        // })
      },
      createVmNic: function (nicConfig, vmInstanceUuid) {
        let event = this.createEvent('vm.action.attachL3NetworkToVm', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        if (nicConfig.networkType === 'double') {
          let param = nicConfig.ipv4StaticIP ? {
            params: {
              staticIp: nicConfig.ipv4StaticIP
            }
          } : {}
          return rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${nicConfig.ipv4NetworkUuid}`, param, event)
            .then((resp) => {
              let vmNicUuid
              resp.inventory.vmNics.forEach((vmNic) => {
                if (vmNic.l3NetworkUuid === nicConfig.ipv4NetworkUuid) vmNicUuid = vmNic.uuid
              })
              if (vmNicUuid) {
                param = nicConfig.ipv6StaticIP ? {
                  params: {
                    staticIp: nicConfig.ipv6StaticIP
                  }
                } : {}
                return rpc.post(`nics/${vmNicUuid}/l3-networks/${nicConfig.ipv6NetworkUuid}`, param)
                  .then(() => this.incEventSuccess(event), () => this.incEventFail(event))
              } else return new Promise((resolve, reject) => { resolve() })
            }, () => {
              this.incEventFail(event)
            })
        } else {
          let param = nicConfig.staticIp ? {
            params: {
              staticIp: nicConfig.staticIp
            }
          } : {}
          return rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${nicConfig.l3network}`, param, event)
            .then(resp => {
              this.incEventSuccess(event)
              return this.updateDbRow({
                tableName: 'vm',
                id: resp.inventory.uuid,
                data: resp.inventory
              })
            }, () => {
              this.incEventFail(event)
            })
        }
      },
      attachL3NetworkToVm: function (l3NetworkUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.attachL3NetworkToVm', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '', l3NetworkUuidList.length)
        let tasks = []
        l3NetworkUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${uuid}`, null, event)
              .then(resp => {
                this.incEventSuccess(event)
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventory.uuid,
                  data: resp.inventory
                })
              }, () => {
                this.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      setVmSshKey: function (uuid, sshKey) {
        return this.dispatchActionWithEvent('vm/setVmSshKey', {
          uuid,
          sshKey
        })
        // let event = this.createEvent('vm.action.setVmSshKey', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        // return rpc.update('vm-instances', uuid, {
        //   'setVmSshKey': {
        //     'SshKey': SshKey
        //   }
        // }, event)
        // .then((resp) => {
        //   // resp.inventory.sshKey = SshKey
        //   // this.updateDbRow({
        //   //   tableName: 'vmInstanceSshKey',
        //   //   id: uuid,
        //   //   data: {
        //   //     'sshKey': SshKey
        //   //   }
        //   // })
        //   // this.updateDbRow({
        //   //   tableName: 'vm',
        //   //   id: uuid,
        //   //   data: resp.inventory
        //   // })
        //   this.incEventSuccess(event)
        //   return this.query(uuid)
        // }, () => {
        //   this.incEventFail(event)
        // })
      },
      // getInstanceOfferingName: function (uuid) {
      //   let name = ''
      //   try {
      //     name = this.dbData.instanceOffering[this.dbData.vm[uuid].instanceOfferingUuid].name
      //   } catch (e) {
      //     rpc.query('resources/names', {
      //       uuids: [`${this.dbData.vm[uuid].instanceOfferingUuid}`]
      //     }).then((resp) => {
      //       let item = {
      //         uuid: this.dbData.vm[uuid].instanceOfferingUuid
      //       }
      //       if (resp.inventories.length > 0) {
      //         item.name = resp.inventories[0].resourceName
      //       }
      //       return this.updateDbRow({
      //         tableName: 'instanceOffering',
      //         id: item.uuid,
      //         data: item
      //       })
      //     })
      //     if (this.dbData.common.isAdmin) {
      //       rpc.query('instance-offerings', { q: `uuid=${this.dbData.vm[uuid].instanceOfferingUuid}` })
      //       .then((resp) => {
      //         return this.updateDbTable({
      //           tableName: 'instanceOffering',
      //           list: resp.inventories
      //         })
      //       })
      //     }
      //   }
      //   return name
      // },
      changeInstanceOffering: function (uuidList, instanceOfferingUuid) {
        let paramList = uuidList.map(uuid => ({ uuid, instanceOfferingUuid }))
        return this.dispatchActionWithEvent('vm/changeInstanceOffering', paramList)
        // let event = this.createEvent('vm.action.changeConfig', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        // const self = this
        // let tasks = []
        // uuidList.forEach(function (uuid) {
        //   ((uuid) => {
        //     let p = rpc.update('vm-instances', uuid, {
        //       'changeInstanceOffering': {
        //         'instanceOfferingUuid': instanceOfferingUuid
        //       }
        //     }, event)
        //     .then((resp) => {
        //       self.incEventSuccess(event)
        //       self.updateDbRow({
        //         tableName: 'vm',
        //         id: uuid,
        //         data: resp.inventory
        //       })
        //       // self.queryList()
        //     }, () => {
        //       self.incEventFail(event)
        //     })
        //     tasks.push(p)
        //   })(uuid)
        // })
        // return Promise.all(tasks)
      },
      attachISOToVmInstance: function (isoUuidList, vmUuid) {
        let name = this.get(vmUuid).name
        let paramList = isoUuidList.map(uuid => ({ uuid, name, vmUuid }))
        return this.dispatchActionWithEvent('vm/attachIso', paramList)
        // let event = this.createEvent('vm.action.attachISOToVmInstance', this.dbData.vm[vmInstanceUuid].name, isoUuidList.length)
        // const self = this
        // let tasks = []
        // isoUuidList.forEach(function (uuid) {
        //   ((uuid) => {
        //     let p = rpc.post(`vm-instances/${vmInstanceUuid}/iso/${uuid}`, {}, event)
        //     .then(() => {
        //       self.incEventSuccess(event)
        //     }, () => {
        //       self.incEventFail(event)
        //     })
        //     tasks.push(p)
        //   })(uuid)
        // })
        // return Promise.all(tasks)
      },
      detachISOFromVmInstance: function (isoUuidList, vmUuid) {
        let name = this.get(vmUuid).name
        let paramList = isoUuidList.map(uuid => ({ uuid, name, vmUuid }))
        return this.dispatchActionWithEvent('vm/detachIso', paramList)
        // let self = this
        // let event = self.createEvent('vm.action.detachISOFromVmInstance', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '', isoUuidList.length)
        // let tasks = []
        // let p = null
        // isoUuidList.forEach(isoUuid => {
        //   p = rpc._delete(`vm-instances/${vmInstanceUuid}/iso`, {
        //     isoUuid
        //   }, event)
        //   .then((resp) => {
        //     self.incEventSuccess(event)
        //   }, () => {
        //     self.incEventFail(event)
        //   })
        //   tasks.push(p)
        // })
        // return Promise.all(tasks)
      },
      createVolume: function (vmInstanceUuid, param) {
        param.systemTags = []
        if (param.VirtioSCSI) {
          param.systemTags.push('capability::virtio-scsi')
          if (param.shareable) {
            param.systemTags.push('ephemeral::shareable')
          }
        }
        let event = this.createEvent('volume.action.create', param.name)
        rpc.create('volumes/data', param, event)
          .then((resp) => {
            rpc.create(`volumes/${resp.inventory.uuid}/vm-instances/${vmInstanceUuid}`, '', event)
              .then((resp) => {
                let uuidList = this.windowData.uuidList.slice()
                uuidList.unshift(resp.inventory.uuid)
                let row = {}
                row[resp.inventory.uuid] = {}
                row[resp.inventory.uuid].selected = false
                let table = Object.assign({}, { ...this.windowData.table }, row)
                this.updateWindow({ uuidList, table })
                this.updateDbTable({
                  tableName: 'volume',
                  list: [resp.inventory]
                })
                this.incEventSuccess(event)
              }, () => {
                this.incEventFail(event)
              })
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      attachDataVolumeToVm: function (volumeUuidList, vmUuid) {
        let paramList = volumeUuidList.map(uuid => ({ uuid, vmUuid }))
        return this.dispatchActionWithEvent('volume/attach', paramList)
        // let event = this.createEvent('vm.action.attachDataVolumeToVm', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '', volumeUuidList.length)
        // const self = this
        // let tasks = []
        // volumeUuidList.forEach(function (uuid) {
        //   ((uuid) => {
        //     let p = rpc.create(`volumes/${uuid}/vm-instances/${vmInstanceUuid}`, null, event)
        //     .then((resp) => {
        //       self.incEventSuccess(event)
        //       // let obj = {}
        //       // if (self.dbData.volume[uuid].isShareable) {
        //       //   obj.hasShareVolume = true
        //       // }
        //       // self.updateDbRow({
        //       //   tableName: 'vm',
        //       //   id: vmInstanceUuid,
        //       //   data: obj
        //       // }).then(() => {
        //       //   self.updateDbRow({
        //       //     tableName: 'volume',
        //       //     id: resp.inventory.uuid,
        //       //     data: resp.inventory
        //       //   }).then(() => {
        //       //     if (!self.dbData.isVmAttachedVolume[vmInstanceUuid].attached) {
        //       //       return self.updateDbRow({
        //       //         tableName: 'isVmAttachedVolume',
        //       //         id: vmInstanceUuid,
        //       //         data: {
        //       //           attached: true
        //       //         }
        //       //       })
        //       //     } else {
        //       //       return new Promise((resolve, reject) => { resolve() })
        //       //     }
        //       //   })
        //       // })
        //     }, () => {
        //       self.incEventFail(event)
        //     })
        //     tasks.push(p)
        //   })(uuid)
        // })
        // return Promise.all(tasks)
      },
      detachDataVolumeFromVm: function (volumeUuidList, vmUuid) {
        let normalVolumeUuidList = _.filter(volumeUuidList, uuid => !this.volume[uuid].isShareable)
        let shareableVolumeUuidList = _.filter(volumeUuidList, uuid => this.volume[uuid].isShareable)
        let tasks = []
        if (normalVolumeUuidList.length > 0) {
          tasks.push(
            this.dispatchActionWithEvent('volume/detach', normalVolumeUuidList)
          )
        }
        if (shareableVolumeUuidList.length > 0) {
          let vmUuidList = [vmUuid]
          tasks.push(
            this.dispatchActionWithEvent('volume/detachShareable', {
                volumeUuidList: shareableVolumeUuidList,
                vmUuidList
              }, undefined,
              this.createEvent('action.volume.detachShareable', '', shareableVolumeUuidList.length * vmUuidList.length))
          )
        }
        return Promise.all(tasks)
        // let event = this.createEvent('vm.action.detachDataVolumeFromVm', this.dbData.volume[volumeUuidList[0]] ? this.dbData.volume[volumeUuidList[0]].name : '', volumeUuidList.length)
        // const self = this
        // let tasks = []
        // volumeUuidList.forEach(function (uuid) {
        //   ((uuid) => {
        //     let p = rpc._delete(`volumes/${uuid}/vm-instances`, {vmUuid: vmInstanceUuid}, event)
        //     .then((resp) => {
        //       self.incEventSuccess(event)
        //     }, () => {
        //       self.incEventFail(event)
        //     })
        //     tasks.push(p)
        //   })(uuid)
        // })
        // return Promise.all(tasks).then(() => {
        //   _.keys(self.dbData.shareableVolumeVmInstanceRef).forEach(uuid => {
        //     if (volumeUuidList.indexOf(self.dbData.shareableVolumeVmInstanceRef[uuid].volumeUuid) >= 0) {
        //       self.deleteDbRow({
        //         tableName: 'shareableVolumeVmInstanceRef',
        //         id: uuid
        //       })
        //     }
        //   })
        //   return self.query(vmInstanceUuid)
        //   // return rpc.query('vm-instances', {q: `uuid=${vmInstanceUuid}`}).then(vmResp => {
        //   //   return self.updateDbRow({
        //   //     tableName: 'vm',
        //   //     id: vmInstanceUuid,
        //   //     data: vmResp.inventories[0]
        //   //   }).then(() => {
        //   //     return rpc.query('volumes/vm-instances/refs', {
        //   //       q: `vmInstanceUuid=${vmInstanceUuid}`,
        //   //       fields: 'volumeUuid'
        //   //     }).then(resp => {
        //   //       let hasShareVolume = false
        //   //       if (resp.inventories.length > 0) {
        //   //         hasShareVolume = true
        //   //       }
        //   //       let isAttachedVolume = true
        //   //       if (self.dbData.vm[vmInstanceUuid].allVolumes.length === 1 && !hasShareVolume) {
        //   //         isAttachedVolume = false
        //   //       }
        //   //       return self.updateDbRow({
        //   //         tableName: 'isVmAttachedVolume',
        //   //         id: vmInstanceUuid,
        //   //         data: {
        //   //           attached: isAttachedVolume
        //   //         }
        //   //       })
        //   //     })
        //   //   })
        //   // })
        // })
      },
      detachL3NetworkFromVm: function (vmNicUuidList, vmUuid) {
        let event = this.createEvent('vm.action.detachL3NetworkFromVm', (vmNicUuidList.length === 1 && this.dbData.vm[vmUuid]) ? this.dbData.vm[vmUuid].name : '', vmNicUuidList.length)
        const self = this
        let tasks = []
        vmNicUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/nics/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      changeResourceOwner: async function (uuidList, accountUuid) {
        uuidList = await Utils.uniqCurrentAccountResources(uuidList, accountUuid)
        let paramList = uuidList.map(uuid => ({ uuid, accountUuid }))
        return this.dispatchActionWithEvent('vm/changeOwner', paramList)
        // const self = this
        // let uuidList = await self.uniqCurrentAccountResources(uuidListParam, accountUuid)
        // let event = this.createEvent('vm.action.changeResourceOwner', this.dbData.vm[uuidList[0]] ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        // let tasks = []
        // uuidList.forEach(uuid => {
        //   let p = rpc.create(`account/${accountUuid}/resources`, {
        //     'resourceUuid': uuid
        //   }, event)
        //   .then((resp) => {
        //     self.incEventSuccess(event)
        //     return self.query(uuid)
        //   }, () => {
        //     self.incEventFail(event)
        //   })
        //   tasks.push(p)
        // })
        // return Promise.all(tasks).then(() => self.$forceUpdate())
      },
      changeResourceToAccountOrProject: async function (uuidList, accountUuid) {
        uuidList = await Utils.uniqCurrentAccountResources(uuidList, accountUuid)
        let paramList = uuidList.map(uuid => ({ uuid, accountUuid }))
        return this.dispatchActionWithEvent('vm/changeOwner', paramList)
      },
      createVmInstanceScheduler: function (uuid, param) {
        let event = this.createEvent('vm.action.createVmInstanceScheduler', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        let scheduler = param.scheduler
        delete param.scheduler
        let curTime = new Date().getTime() / 1000
        if (param.startTime !== 0 && param.startTime < curTime) {
          this.incEventFail(event)
          return new Promise((resolve, reject) => { resolve({}) })
        }
        return rpc.create(`vm-instances/${uuid}/schedulers/${scheduler}`, param, event)
          .then((resp) => {
            this.incEventSuccess(event)
            return this.updateDbRow({
              tableName: 'scheduler',
              id: resp.inventory.uuid,
              data: resp.inventory
            })
          }, () => {
            this.incEventFail(event)
          })
      },
      createVolumeScheduler: function (vmInstanceUuid, param) {
        let volumeUuid = this.dbData.vm[vmInstanceUuid].rootVolumeUuid
        let event = this.createEvent('vm.action.createVmInstanceScheduler', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        let scheduler = param.scheduler
        delete param.scheduler
        rpc.create(`volumes/${volumeUuid}/schedulers/${scheduler}`, param, event)
          .then((resp) => {
            this.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'scheduler',
              id: resp.inventory.uuid,
              data: resp.inventory
            })
          }, () => {
            this.incEventFail(event)
          })
      },
      setVmConsolePassword: function (uuid, password, isReboot, fn) {
        return this.dispatchActionWithEvent('vm/setConsolePassword', {
          uuid,
          password
        }).then(() => {
          if (isReboot) {
            this.reboot([uuid], type, fn)
          }
        })
      },
      setVmPassword: function (uuid, account, password) {
        return this.dispatchActionWithEvent('vm/setVmPassword', {
          uuid,
          account,
          password
        })
      },
      openConsole: function (uuid, name) {
        let self = this
        return this.dispatchActionWithEvent('vm/openConsole', uuid)
          .then(function (inventory) {
            let address = ''
            address = `${window.location.origin}/thirdparty/vnc_auto.html?host=${inventory.hostname}&port=${inventory.port}&token=${inventory.token}&title=${name}`
            if (self.dbData.common.isOpensource) {
              address += '&opensource=1'
            }
            window.open(address)
          })
      },
      createSnapshot: function (volumeUuid, param) {
        let event = this.createEvent('vm.action.createSnapshot', param.name)
        return this.dispatchActionWithEvent('volume/createSnapshot', {
          uuid: volumeUuid,
          param
        }, null, event)
      },
      deleteVmSshKey: function (uuid, type, fn) {
        return this.dispatchActionWithEvent('vm/deleteVmSshKey', {
          uuid
        }).then(() => {
          if(fn) fn();
        })
      },
      createImage: function (param) {
        let jobUuid = this.genUniqueId()
        param.format = 'qcow2'
        if (param.isSystem) {
          param.rootVolumeUuid = param.volumeUuid
          param.mediaType = 'RootVolumeTemplate'
        } else {
          param.mediaType = 'DataVolumeTemplate'
        }

        let longJobInfo = {tableName: 'image', resourceUuid: jobUuid, jobUuid}
        let event = this.createEvent('vm.action.createImage', this.dbData.vm[param.vmUuid] ? this.dbData.vm[param.vmUuid].name : '', undefined, undefined, undefined, longJobInfo)

        return this.dispatchActionWithEvent('volume/createImage', {
          uuid: param.volumeUuid,
          jobUuid,
          param
        }, longJobInfo, event)
      },
      setRdpMode: function (uuidList, enable) {
        let paramList = uuidList.map(uuid => ({ uuid, enable }))
        return this.dispatchActionWithEvent('vm/setRdpMode', paramList)
      },
      setUsbRedirect: function (uuidList, enable) {
        let paramList = uuidList.map(uuid => ({ uuid, enable }))
        return this.dispatchActionWithEvent('vm/setUsbRedirect', paramList)
      },
      setVmInstanceScreenNum: function (uuid, monitorNumber) {
        return this.dispatchActionWithEvent('vm/setVDIMonitorNumber', {
          uuid,
          monitorNumber
        })
      },
      deleteConsolePassword: function (uuid, isReboot, fn) {
        return this.dispatchActionWithEvent('vm/deleteConsolePassword', {
          uuid
        }).then(() => {
          if (isReboot) {
            this.reboot([uuid], fn)
          }
        })
      },
      startVmFromHost: function (hostUuid, uuid) {
        return this.dispatchActionWithEvent('vm/startVmFromHost', {
          uuid,
          hostUuid
        })
      },
      resizeRootVolume: function (uuid, volumeUuid, size) {
        return this.dispatchActionWithEvent('vm/resizeRootVolume', {
          uuid,
          volumeUuid,
          size
        })
      },
      storageMigrate: function (vmInstanceUuid, dstPrimaryStorageUuid, withDataVolumes) {
        let vm = this.get(vmInstanceUuid)
        let psType = vm.rootVolumePrimaryStorageType
        if (psType === 'SharedBlock') {
          let jobUuid = this.genUniqueId()
          return this.dispatchActionWithEvent('vm/storageMigrate', {
            // uuid for getting name
            uuid: vmInstanceUuid,
            jobUuid,
            param: {
              vmInstanceUuid,
              dstPrimaryStorageUuid,
              withDataVolumes
            }
          }, {tableName: 'vm', resourceUuid: vmInstanceUuid, jobUuid})
        } if (psType === 'NFS' || psType === 'Ceph') {
          let jobUuid = this.genUniqueId()
          // need to override volume storage migrate event. so, create event.
          let longJobInfo = {tableName: 'vm', resourceUuid: vmInstanceUuid, jobUuid}
          let event = this.createEvent('action.vm.storageMigrate', vm.name, 1, undefined, undefined, longJobInfo)
          return this.dispatchActionWithEvent('volume/storageMigrate', {
              // uuid for getting name
              uuid: vmInstanceUuid,
              jobUuid,
              param: {
                volumeUuid: vm.rootVolumeUuid,
                dstPrimaryStorageUuid,
                withDataVolumes
              }
            },
            longJobInfo,
            event)
        }
        // let self = this
        // let jobUuid = this.genUniqueId()
        // let event = self.createEvent('vm.action.storageMigrateRootVolume', self.dbData.vm[vmInstanceUuid].name, undefined, undefined, undefined, {tableName: 'vm', resourceUuid: vmInstanceUuid, jobUuid})
        // self.updateDbRow({
        //   tableName: 'vm',
        //   id: vmInstanceUuid,
        //   data: {
        //     state: 'VolumeMigrating'
        //   }
        // })
        // let jobName = 'APIPrimaryStorageMigrateVolumeMsg'
        // let jobData = {
        //   'volumeUuid': volumeUuid,
        //   'dstPrimaryStorageUuid': primaryStorageUuid
        // }
        // if (isClearVolumes !== undefined) {
        //   jobName = 'APIPrimaryStorageMigrateVmMsg'
        //   jobData = {
        //     'vmInstanceUuid': vmInstanceUuid,
        //     'dstPrimaryStorageUuid': primaryStorageUuid,
        //     'withDataVolumes': isClearVolumes,
        //     'withSnapshots': true
        //   }
        // }
        // return rpc.create('longjobs', {
        //   jobName: jobName,
        //   jobData: JSON.stringify(jobData)
        // }, event, jobUuid)
        // .then(() => {
        //   return self.triggerLongJobTask()
        // }, () => {
        //   self.incEventFail(event)
        //   return self.longJobHandler(event, self)
        // })
      },
      // inStates: function () {
      //   if (!this.isSelected) return
      //   let stateList = []
      //   for (let i = 0; i < arguments.length; i++) {
      //     stateList.push(arguments[i])
      //   }
      //   if (this.isSingleSelected) {
      //     return !stateList.every((item, index, array) => {
      //       return item !== this.dbData.vm[this.selectedList[0]].state
      //     })
      //   }
      //   let uuidList = []
      //   let resp = true
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   uuidList.forEach((uuid) => {
      //     if (!stateList.every((item, index, array) => { return item !== this.dbData.vm[uuid].state })) resp = true
      //   })
      //   return resp
      // },
      isLoadISO: function (uuid) {
        return !!this.dbData.vmISO[uuid] && this.dbData.vmISO[uuid].value.length > 0
      },
      getBackupStorageType: function (uuid) {
        let bs = this.dbData.backupStorageForVm[uuid]
        return bs && bs.type
      },
      getBackupStoragesInCurrentZoneType: function (type) {
        // return this.dbData.common.hasImageStore
        return this.dbData.common.backupStorageInCurrentZoneUuidList.some(bsUuid => this.dbData.backupstorage[bsUuid].type === type)
        // // const self = this
        // // let backupStoragesInCurrentZone = _.cloneDeep(self.dbData.backupStoragesInCurrentZone)
        // // let backupStoragesInCurrentZoneList = _.values(backupStoragesInCurrentZone) || []
        // // return backupStoragesInCurrentZoneList.some(item => item.type === type)
      },
      getBackupStoragesInCurrentZone: function () {
        // return this.dbData.common.hasImageStore
        return this.dbData.common.backupStorageInCurrentZoneUuidList.length > 0
        // // const self = this
        // // let backupStoragesInCurrentZone = _.cloneDeep(self.dbData.backupStoragesInCurrentZone)
        // // if (Object.keys(backupStoragesInCurrentZone).length > 0) return true
        // // else return false
      },
      // 判断是否有本地存储的数据盘
      hasLocalStorageDataVolume: async function (uuid) {
        let has = false
        if (!this.dbData.common.isAdmin) return has
        // let self = this
        let tasks = []
        let p, primaryStorageUuid
        // let vm = self.dbData.vm[uuid]
        let vm = this.get(uuid)
        vm.allVolumes.forEach((item) => {
          if (item.type === 'Data') {
            primaryStorageUuid = item.primaryStorageUuid
            p = rpc.query('primary-storage', {
              q: `uuid=${primaryStorageUuid}`,
              fields: 'type'
            }).then(resp => {
              let type = resp.inventories[0].type
              if (type === 'LocalStorage') {
                has = true
              }
            })
            tasks.push(p)
          }
        })
        await Promise.all(tasks)
        return has
      },
      // 判断是否有磁盘在本地存储上
      async hasLocalStorageVolume(uuid) {
        let has = false
        if (!this.dbData.common.isAdmin) return has
        // let self = this
        let tasks = []
        let p, primaryStorageUuid
        // let vm = self.dbData.vm[uuid]
        let vm = this.get(uuid)
        vm.allVolumes.forEach((item) => {
          primaryStorageUuid = item.primaryStorageUuid
          p = rpc.query('primary-storage', {
            q: `uuid=${primaryStorageUuid}`,
            fields: 'type'
          }).then(resp => {
            let type = resp.inventories[0].type
            if (type === 'LocalStorage') {
              has = true
            }
          })
          tasks.push(p)
        })
        //同步请求
        await Promise.all(tasks)
        return has
      },
      getHostIp: function (uuid) {
        const self = this
        let value
        try {
          if (self.dbData.vm[uuid].state !== 'Stopped') {
            value = self.dbData.host[self.dbData.vm[uuid].hostUuid].managementIp
          } else if (self.dbData.vm[uuid].state === 'Stopped' && this.getPrimaryStorageType(uuid) === 'LocalStorage') {
            value = self.dbData.host[self.dbData.vm[uuid].hostUuid].managementIp
          }
        } catch (e) {
          // if (self.dbData.common.isAdmin) {
          //   if (self.checkBounce(`getHostIp-${uuid}`)) return ''
          //   value = ''
          //   rpc.query('primary-storage/local-storage/resource-refs', {
          //     q: `volume.uuid=${self.dbData.vm[uuid].rootVolumeUuid}`
          //   }).then((resp) => {
          //     let vm = _.cloneDeep(self.dbData.vm[uuid])
          //     if (resp.inventories.length > 0) { // LocalStorage PrimaryStorage
          //       vm.hostUuid = resp.inventories[0].hostUuid
          //       return self.updateDbRow({
          //         tableName: 'vm',
          //         id: uuid,
          //         data: vm
          //       }).then(() => {
          //         return rpc.query(`hosts/${vm.hostUuid}`)
          //         .then((resp) => {
          //           if (resp.inventories.length > 0) {
          //             self.updateDbRow({
          //               tableName: 'host',
          //               id: self.dbData.vm[uuid].hostUuid,
          //               data: resp.inventories[0]
          //             })
          //           } else {
          //             return ''
          //           }
          //         })
          //       })
          //     } else {
          //       if (vm && vm.hostUuid) {
          //         return rpc.query(`hosts/${vm.hostUuid}`)
          //         .then((resp) => {
          //           if (resp.inventories.length > 0) {
          //             self.updateDbRow({
          //               tableName: 'host',
          //               id: self.dbData.vm[uuid].hostUuid,
          //               data: resp.inventories[0]
          //             })
          //           } else {
          //             return ''
          //           }
          //         })
          //       } else {
          //         return ''
          //       }
          //     }
          //   })
          //   .then(() => this.$nextTick(this.$forceUpdate))
          // } else {
          //   return ''
          // }
        }
        return value
      },
      //查询主机名称
      getHostName: function (uuid) {
        let self = this
        let value
        try {
          value = self.dbData.host[uuid].name
        } catch (e) {
            if (self.checkBounce(`getHostName-${uuid}`)) return ''
            value = ''
             rpc.query(`hosts/${uuid}`)
              .then((resp) => {
                if (resp.inventories.length > 0) {
                  self.updateDbRow({
                    tableName: 'host',
                    id: uuid,
                    data: resp.inventories[0]
                  })
                }
            })
            .then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      //查询主存储类型
      getPrimaryStorageType: function (uuid) {
        let vm = this.get(uuid)
        if (!vm) return ''
        return vm.rootVolumePrimaryStorageType
        // if (!this.dbData.common.isAdmin) return ''
        // let value = ''
        // try {
        //   let volume = this.dbData.volume[this.dbData.vm[uuid].rootVolumeUuid]
        //   if (!volume) return value
        //   let ps = this.dbData.primarystorage[volume.primaryStorageUuid]
        //   if (!ps) return value
        //   value = ps.type
        // } catch (e) {}
        // return value
      },
      //设置启动顺序
      setVmBootOrder: function (selectList) {
        let self = this
        self.setModeMessage = {
          bootOrder: self.vm[selectList.uuid].bootOrder,
          cdromBootOnce: self.vm[selectList.uuid].cdromBootOnce,
        }
        self.updateWindow({
          vmUuidList: selectList.uuid
        })
        self.showVmBootOrderDlg = true;
      },
      closeVmBootOrderDlg(param){
        let self = this, uuidList = [];
        if(param){
          self.updateVmBootOrder(self.windowData.vmUuidList, param.bootOrder, param.cdromBootOnce)
        }
        self.showVmBootOrderDlg = false;
      },
      openSetConsoleModeDlg: function (uuidList) {
        const self = this
        if (!_.isArray(uuidList)) {
          uuidList = [uuidList]
        }
        self.openDialog('SetConsoleModeDlg', {
          // originMode: self.dbData.vmConsoleMode[uuidList[0]].value === 'vnc' ? 'vnc' : 'spice',
          originMode: self.vm[uuidList[0]].vmConsoleMode === 'vnc' ? 'vnc' : 'spice',
          ok: (mode) => {
            self.toggleConsoleMode(uuidList, mode)
          }
        })
      },
      openSetHaLevelDlg: function (uuidList) {
        if (_.isUndefined(uuidList)) return
        if (!_.isArray(uuidList)) {
          uuidList = [uuidList]
        }
        let defaultValue = 'None'
        if (uuidList.length === 1) {
          defaultValue = this.vm[uuidList[0]].ha === 'NeverStop' ? this.vm[uuidList[0]].ha : 'None'
          // defaultValue = this.dbData.vmHaLevel[uuidList[0]].value === 'NeverStop' ? this.dbData.vmHaLevel[uuidList[0]].value : 'None'
        }
        this.openDialog('SetHaLevelDlg', {
          uuidList,
          haLevel: defaultValue,
          ok: (msg) => {
            this.updateHaLevel(uuidList, msg)
          }
        })
      },
      backup: function (uuidList, param) {
        const self = this
        let event = self.createEvent('hybridBackup.action.backupVm', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let sync = param.sync
        delete param.sync
        uuidList.forEach(uuid => {
          let rootVolumeUuid = self.dbData.vm[uuid].rootVolumeUuid
          let p = rpc.create(`volumes/${rootVolumeUuid}/volume-backups`, param, event).then(resp => {
            self.incEventSuccess(event)
            if (sync) {
              let backupId = resp.inventory.uuid
              let localBsId = resp.inventory.backupStorageRefs[0].backupStorageUuid
              let remoteBsId = _.keys(this.dbData.remoteBackupStorage)[0]
              let name = resp.inventory.name
              return self.sync(backupId, localBsId, remoteBsId, name)
            }
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      sync (uuid, srcBackupStorageUuid, remoteBsUuid, name) {
        let event = this.createEvent('backupData.action.sync', name)
        return rpc.update('volume-backups', uuid, {
          'syncBackupFromImageStoreBackupStorage': {
            srcBackupStorageUuid: srcBackupStorageUuid,
            dstBackupStorageUuid: remoteBsUuid
          }
        }, event).then(() => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
      },
      pageBackup: function (uuidList) {
        const self = this
        self.openFullPanel('windows/BackupData/dialogs/CreateBackup', {
          ok: (param) => {
            self.backup(uuidList, param).then(() => {
              self.refreshChild(self.backupDataAssignedId)
            })
          }
        })
      },
      backupInHybrid: function (uuidList, param) {
        const self = this
        let event = self.createEvent('hybridBackup.action.backupVm', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let id = `assistant-${this.genUniqueId()}`
        self.createAssistant({
          id,
          hide: false,
          operation: 'skipTo',
          title: 'backupTitle',
          ownerId: self.windowData.id,
          content: 'skipToDisasterBackup',
          handler: () => {
            this.$router.push('/main/hybridbackup')
          }
        })
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let rootVolumeUuid = self.dbData.vm[uuid].rootVolumeUuid
            let p = rpc.create(`images/root-volume-templates/from/volumes/${rootVolumeUuid}`, param, event).then((resp) => {
              if (resp.inventory) {
                self.updateDbRow({
                  tableName: 'image',
                  id: resp.inventory.uuid,
                  data: resp.inventory
                })
              }
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks).then(() => {
          setTimeout(() => self.deleteAssistant(id), 3000)
        })
      },
      pageBackupInHybrid: function (uuidList) {
        const self = this
        self.openFullMainWindow('CreateHybridBackupDlg', {
          ok: (param) => {
            self.backupInHybrid(uuidList, param)
            // self.queryForAssistant()
          }
        })
      },
      getRootVolume: function (vmInstanceUuid) {
        const self = this
        let rootVolume;
        if(self.dbData.vm[vmInstanceUuid]){
          self.dbData.vm[vmInstanceUuid].allVolumes.forEach((item) => {
            if (item.type === 'Root') rootVolume = item
          })
        }else{
          vmInstanceUuid.allVolumes.forEach((item) => {
            if(item.type === 'Root') rootVolume = item;
          })
        }
        return rootVolume
      },
      toggleConsoleMode: function (uuidList, mode) {
        let param = uuidList.map(uuid => {
          return {
            uuid,
            mode
          }
        })
        return this.dispatchActionWithEvent('vm/setConsoleMode', param)
      },
      toggleBootMode: function (uuidList, mode) {
        let param = uuidList.map(uuid => {
          return {
            uuid,
            mode
          }
        })
        return this.dispatchActionWithEvent('vm/setBootMode', param)
      },
      openStorageMigrateCanditateList: function (vmUuid, withDataVolumes) {
        let self = this
        let url = `vm-instances/${vmUuid}/storage-migration-candidates`
        rpc.query(url).then(resp => {
          let primaryStorageUuidList = resp.inventories.map(item => item.uuid)
          self.openDialog('ClusterAttachPrimaryStorageDlg', {
            action: 'storageMigrate',
            conditions: `uuid?=${primaryStorageUuidList}`,
            select: primaryStorageUuid => self.storageMigrate(vmUuid, primaryStorageUuid[0], withDataVolumes)
          })
        })
      },
      openStorageMigrateDlg (vmUuid) {
        let self = this
        let hasPeripheralAttached = self.hasPciDevice(vmUuid) || self.hasUsbDevice(vmUuid)
        let hasISO = self.hasISOAttached(vmUuid)
        let psType = this.getPrimaryStorageType(vmUuid)
        const { allVolumes, shareableVolumeUuidList } = self.get(vmUuid)
        let isAttachedDataVolume = allVolumes.length >= 2
        let isAttachedShareableVolume = shareableVolumeUuidList && shareableVolumeUuidList.length > 0
        let isAttachedVolume = isAttachedDataVolume || isAttachedShareableVolume
        const psTypeTable = {
          NFS: hasPeripheralAttached || isAttachedVolume,
          Ceph: hasPeripheralAttached || isAttachedVolume || hasISO,
          SharedBlock: hasPeripheralAttached || isAttachedShareableVolume
        }
        const reminderTable = {
          SharedBlock: 'remindStorageMigrate2',
          NFS: 'remindStorageMigrate',
          Ceph: 'remindMigrate'
        }
        let isoUuidList = this.get(vmUuid) && this.get(vmUuid).isoUuids;
        if(hasISO) {
          self.openDialog('ConfirmDlg', {
            description: '请先卸载云主机上所挂载的ISO',
            title: '存储迁移',
            getName: () => {

            },
            ok: () => {
              self.detachISOFromVmInstance(isoUuidList, vmUuid)
                  .then(() => {
                     self.openStorageMigrateCanditateList(vmUuid)
                  })
            }
          })
        }
        if (psTypeTable[psType]) return self.openDialog('RemindMigrateVmConfirmDlg', { type: reminderTable[psType] })
        if (psType === 'SharedBlock' && isAttachedDataVolume) {
          return self.openDialog('RemindMigrateVmConfirmDlg', {
            type: 'withDataVolumes',
            ok: withDataVolumes => self.openStorageMigrateCanditateList(vmUuid, withDataVolumes)
          })
        }
        self.openStorageMigrateCanditateList(vmUuid)
      },
      updateHaLevel: function (uuidList, level) {
        let candidateUuidList = uuidList.filter(uuid => this.vm[uuid].ha !== level)
        let param = candidateUuidList.map(uuid => {
          return {
            uuid,
            level
          }
        })
        if(param.length >=1)
        return this.dispatchActionWithEvent('vm/setHa', param)
      },
      ...Utils
    }
  }
</script>
