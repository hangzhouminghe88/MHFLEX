<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  // /* global localStorage:false */

  export default {
    created: function () {
    },
    methods: {
      delete: function (uuidList, isDeleteVolume, progressFn) {
        const self = this
        let event = self.createEvent('vm.action.delete', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          let p = rpc._delete(`vm-instances/${uuid}`, {}, event)
            .then(resp => {
              if (!self.windowData.uuidList) return
              let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
              let newTable = _.cloneDeep(self.windowData.table)
              self.incEventSuccess(event)
              // if (isDeleteVolume) {
              //   self.deleteDataVolume(uuid, event)
              // }
              delete newTable[uuid]
              self.updateWindow({
                uuidList: newUuidList,
                table: newTable
              })
              if (progressFn) progressFn()
              // self.updateCount()
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
          if (isDeleteVolume) {
            p = self.deleteDataVolume(uuid, event)
            tasks.push(p)
          }
        })
        return Promise.all(tasks)
      },
      isAttachVolume: function (uuid) {
        let vm = this.dbData.vm[uuid]
        if (vm && (vm.allVolumes.length) > 1) return true
        return false
      },
      openClonePanel: function (uuid, cb) {
        let self = this;
        self.vmCloneParam = {
          ok: (param) => {
            let names = []
            if (param.numbers > 1) {
              for (let i = 0; i < param.numbers; i++) {
                names.push(`${param.name}-${i + 1}`)
              }
            } else {
              names.push(`${param.name}`)
            }
            this.clone(uuid, param.strategy, names, param.systemTags).then((resp) => {
              if (cb) cb(resp)
            })
          },
          isVmware: true,
          showAttachedChecked: false
        }
        self.showVmClone = true;
      },
      deleteDataVolume: function (uuid, event) {
        let uuidList = []
        let self = this
        // let event = self.createEvent('vm.action.deleteDataVolume', self.dbData.vm[uuid].name)
        self.dbData.vm[uuid].allVolumes.forEach((item) => {
          if (item.type === 'Data') uuidList.push(item.uuid)
        })
        let isFailed = false
        if (uuidList.length > 0) {
          uuidList.forEach((uuid) => {
            rpc._delete(`volumes/${uuid}`, {}, event)
              .then((resp) => {
                // self.incEventSuccess(event)
              }, () => {
                if (!isFailed) {
                  self.incEventFail(event)
                  self.incEventFail(event) // fail twice to set back 1 success.
                  isFailed = true
                }
              })
          })
        }
      },
      expunge: function (uuidList) {
        const self = this
        let event = self.createEvent('vm.action.expunge', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.update('vm-instances', uuid, {
              'expungeVmInstance': {}
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.updateCount()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      start: function (uuidList) {
        const self = this
        let event = self.createEvent('vm.action.start', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.state = 'Starting'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
            let p = rpc.update('vm-instances', uuid, {
              'startVmInstance': {}
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      stop: function (uuidList, stopHa) {
        const self = this
        let event = self.createEvent('vm.action.stop', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.state = 'Stopping'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
            let p = rpc.update('vm-instances', uuid, {
              'stopVmInstance': {
                stopHA: stopHa
              }
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      recover: function (uuidList, progressFn, startVm) {
        const self = this
        let event = self.createEvent('vm.action.recover', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.update('vm-instances', uuid, {
              'recoverVmInstance': {}
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.updateCount()
                if (progressFn) progressFn()
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks).then(() => {
          if (startVm) {
            return self.start(uuidList)
          } else {
            return new Promise((resolve, reject) => { resolve() })
          }
        }).then(() => {
          self.$forceUpdate()
        })
      },
      reboot: function (uuidList) {
        const self = this
        let event = self.createEvent('vm.action.reboot', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.state = 'Rebooting'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
            let p = rpc.update('vm-instances', uuid, {
              'rebootVmInstance': {}
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      resume: function (uuidList) {
        let event = this.createEvent('vm.action.resume', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.update('vm-instances', uuid, {
              'resumeVmInstance': {}
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      pause: function (uuidList) {
        let event = this.createEvent('vm.action.pause', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.update('vm-instances', uuid, {
              'pauseVmInstance': {}
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      powerOff: function (uuidList, stopHa) {
        let event = this.createEvent('vm.action.forcestop', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.state = 'Stopping'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
            let p = rpc.update('vm-instances', uuid, {
              'stopVmInstance': {
                'type': 'cold',
                'stopHA': stopHa
              }
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      clone: function (uuid, strategy, names, systemTags) {
        let self = this
        const totalCount = names.length
        let event = self.createEvent('vm.action.clone', self.dbData.vm[uuid] ? self.dbData.vm[uuid].name : '', totalCount)
        return rpc.update('vm-instances', uuid, {
          'cloneVmInstance': {
            'strategy': strategy,
            'names': names,
            'systemTags': systemTags
          }
        }, event).then((resp) => {
          let successCount = resp.result.numberOfClonedVm
          event.successCount = successCount
          event.failCount = (totalCount - successCount)
          self.setEventFinished(event)
          if (self.param && self.param.refresh) self.param.refresh()
          return new Promise((resolve, reject) => { resolve(resp.result) })
        }, () => {
          event.successCount = 0
          event.failCount = totalCount
          self.setEventFinished(event)
        })
      },
      canClone: function (uuid) {
        if (!uuid) return false
        return _.includes(['Stopped', 'Running'], this.dbData.vm[uuid].state)
      },
      getResourceOwner: function (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.resourceOwner[uuid].name
          if (self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName) {
            value = self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName
          }
        } catch (e) {
        }
        return value
      },
      reimage: function (vmInstanceUuid) {
        let event = this.createEvent('vm.action.reimage', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        return rpc.update('vm-instances', vmInstanceUuid, {
          'reimageVmInstance': {}
        }, event)
          .then(resp => {
            this.incEventSuccess(event)
            return this.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: resp.inventory
            })
          }, () => {
            this.incEventFail(event)
          })
      },
      migrate: function (vmInstanceUuid, hostUuid) {
        let event = this.createEvent('vm.action.migrate', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        let originVm = _.cloneDeep(this.dbData.vm[vmInstanceUuid])
        this.updateDbRow({
          tableName: 'vm',
          id: vmInstanceUuid,
          data: { state: 'Migrating' }
        })
        return rpc.update('vm-instances', vmInstanceUuid, {
          'migrateVm': {
            'hostUuid': hostUuid
          }
        }, event)
          .then(resp => {
            this.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: resp.inventory
            })
          }, () => {
            this.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: originVm
            })
            this.incEventFail(event)
          })
      },
      coldMigrate: function (vmInstanceUuid, hostUuid) {
        let self = this
        let event = self.createEvent('vm.action.coldMigrate', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '')
        let rootVolumeUuid
        self.dbData.vm[vmInstanceUuid].allVolumes.forEach((item) => {
          if (item.type === 'Root') rootVolumeUuid = item.uuid
        })
        rpc.put(`primary-storage/local-storage/volumes/${rootVolumeUuid}/actions`, {
          'localStorageMigrateVolume': {
            'destHostUuid': hostUuid
          }
        }, event)
          .then(resp => {
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
      },
      attachL3NetworkToVm: function (l3NetworkUuidList, vmInstanceUuid, fn) {
        let event = this.createEvent('vm.action.attachL3NetworkToVm', this.dbData.l3network[l3NetworkUuidList[0]] ? this.dbData.l3network[l3NetworkUuidList[0]].name : '', l3NetworkUuidList.length)
        let tasks = []
        l3NetworkUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${uuid}`, event)
              .then(resp => {
                this.incEventSuccess(event)
                if (fn) fn()
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
      setVmSshKey: function (uuid, SshKey) {
        let event = this.createEvent('vm.action.setVmSshKey', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        rpc.update('vm-instances', uuid, {
          'setVmSshKey': {
            'SshKey': SshKey
          }
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      changeInstanceOffering: function (uuidList, instanceOfferingUuid) {
        let event = this.createEvent('vm.action.changeConfig', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.update('vm-instances', uuid, {
              'changeInstanceOffering': {
                'instanceOfferingUuid': instanceOfferingUuid
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      attachISOToVmInstance: function (isoUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.attachISOToVmInstance', isoUuidList.length > 1 ? this.dbData.vm[vmInstanceUuid].name : '', isoUuidList.length)
        const self = this
        let tasks = []
        isoUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmInstanceUuid}/iso/${uuid}`, {}, event)
              .then((resp) => {
                self.incEventSuccess(event)
                console.log(resp)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                // self.queryList()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      detachISOFromVmInstance: function (vmInstanceUuid) {
        let self = this
        let event = self.createEvent('vm.action.detachISOFromVmInstance', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '')
        return rpc._delete(`vm-instances/${vmInstanceUuid}/iso`, null, event)
          .then((resp) => {
            // self.queryList()
            self.incEventSuccess(event)
            console.log(resp)
            self.updateDbRow({
              tableName: 'vm',
              id: resp.inventory.uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
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
      attachDataVolumeToVm: function (volumeUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.attachDataVolumeToVm', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '', volumeUuidList.length)
        const self = this
        let tasks = []
        volumeUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.create(`volumes/${uuid}/vm-instances/${vmInstanceUuid}`, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'volume',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      detachDataVolumeFromVm: function (volumeUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.detachDataVolumeFromVm', this.dbData.volume[volumeUuidList[0]] ? this.dbData.volume[volumeUuidList[0]].name : '', volumeUuidList.length)
        const self = this
        let tasks = []
        volumeUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`volumes/${uuid}/vm-instances`, {vmUuid: vmInstanceUuid}, event)
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
      detachL3NetworkFromVm: function (vmNicUuidList, fn) {
        let event = this.createEvent('vm.action.detachL3NetworkFromVm', this.dbData.l3network[vmNicUuidList[0]] ? this.dbData.l3network[vmNicUuidList[0]].name : '', vmNicUuidList.length)
        const self = this
        let tasks = []
        vmNicUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/nics/${uuid}`, event)
              .then((resp) => {
                self.incEventSuccess(event)
                if (fn) fn()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      changeResourceOwner: async function (uuidList, accountUuid) {
        const self = this
        uuidList = await self.uniqCurrentAccountResources(uuidList, accountUuid)
        let event = this.createEvent('vm.action.changeResourceOwner', this.dbData.vm[uuidList[0]] ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.create(`account/${accountUuid}/resources`, {
              'resourceUuid': uuid
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
                vmInventory.accountUuid = resp.inventory.accountUuid
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: vmInventory
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      createVmInstanceScheduler: function (uuid, param, fn) {
        let event = this.createEvent('vm.action.createVmInstanceScheduler', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        let scheduler = param.scheduler
        delete param.scheduler
        let curTime = new Date().getTime() / 1000
        if (param.startTime !== 0 && param.startTime < curTime) {
          this.incEventFail(event)
          return
        }
        rpc.create(`vm-instances/${uuid}/schedulers/${scheduler}`, param, event)
          .then((resp) => {
            this.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'scheduler',
              id: resp.inventory.uuid,
              data: resp.inventory
            })
            if (fn) fn()
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
      setVmConsolePassword: function (uuid, password, isReboot) {
        let event = this.createEvent('vm.action.setVmConsolePassword', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        return rpc.put(`vm-instances/${uuid}/actions`, {
          'setVmConsolePassword': {
            'consolePassword': password
          }
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            return this.updateDbRow({
              tableName: 'vmInstancesConsolePassword',
              id: uuid,
              data: {
                hasPassword: true
              }
            })
          }, () => {
            this.incEventFail(event)
          })
          .then(() => {
            this.$forceUpdate()
            if (isReboot) {
              return this.reboot([uuid])
            } else return new Promise((resolve, reject) => { resolve() })
          })
      },
      setVmPassword: function (uuid, account, password) {
        let event = this.createEvent('vm.action.setVmPassword', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        rpc.put(`vm-instances/${uuid}/actions`, {
          'changeVmPassword': {
            'password': password,
            'account': account
          }
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            // console.log(resp)
          }, () => {
            this.incEventFail(event)
          })
      },
      openConsole: function (uuid) {
        let event = this.createEvent('vm.action.openConsole', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        rpc.create('consoles', {
          'vmInstanceUuid': uuid
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            let address = ''
            address = `${window.location.origin}/thirdparty/vnc_auto.html?host=${resp.inventory.hostname}&port=${resp.inventory.port}&token=${resp.inventory.token}&title=${this.dbData.vm[uuid].name}`
            window.open(address)
          }, () => {
            this.incEventFail(event)
          })
      },
      createSnapshot: function (volumeUuid, param) {
        let event = this.createEvent('vm.action.createSnapshot', this.dbData.volume[volumeUuid] ? this.dbData.volume[volumeUuid].name : '')
        return rpc.create(`volumes/${volumeUuid}/volume-snapshots`, {
          'name': param.name,
          'description': param.description
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      deleteVmSshKey: function (uuid) {
        let event = this.createEvent('vm.action.deleteVmSshKey', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        return rpc._delete(`vm-instances/${uuid}/ssh-keys`, null, event)
          .then((resp) => {
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      createImage: function (vmInstanceUuid, param) {
        let volumeUuid = this.dbData.vm[vmInstanceUuid].rootVolumeUuid
        let event = this.createEvent('vm.action.createImage', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        return rpc.create(`images/root-volume-templates/from/volumes/${volumeUuid}`, param, event)
          .then((resp) => {
            this.incEventSuccess(event)
            console.log(resp)
          }, () => {
            this.incEventFail(event)
          })
      },
      // pageOpenConsole: function () {
      //   if (!this.isSingleSelected) return
      //   this.openConsole(this.selectedList[0])
      // },
      // pageDelete: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('DeleteVmInstanceConfirm', {
      //       uuidList,
      //       ok: () => {
      //         self.delete(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      // pageExpunge: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('ExpungeVmInstanceConfirmDlg', {
      //       uuidList,
      //       ok: () => {
      //         self.expunge(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      // pageRecover: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   if (uuidList.length > 0) this.recover(uuidList)
      //   // let self = this
      //   // if (uuidList.length > 0) {
      //   //   this.openDialog('NormalVmInstanceConfirm', {
      //   //     'confirmDlgType': 'Recover',
      //   //     uuidList,
      //   //     ok: () => {
      //   //       self.recover(uuidList)
      //   //     }
      //   //   })
      //   //   .then(() => {
      //   //   })
      //   // }
      // },
      // pageStart: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   if (uuidList.length > 0) {
      //     this.start(uuidList)
      //   }
      // },
      // pageStop: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('NormalVmInstanceConfirm', {
      //       'confirmDlgType': 'Stop',
      //       uuidList,
      //       ok: () => {
      //         self.stop(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      // pageReboot: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('NormalVmInstanceConfirm', {
      //       'confirmDlgType': 'Reboot',
      //       uuidList,
      //       ok: () => {
      //         self.reboot(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      updateVmBootOrder: function (uuid, msg) {
        let event = this.createEvent('vm.action.updateVMBootOrder', this.dbData.vm[uuid].name)
        return rpc.put(`vm-instances/${uuid}/actions`, {
          'setVmBootOrder': {
            'bootOrder': msg
          }
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      // pagePause: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('NormalVmInstanceConfirm', {
      //       'confirmDlgType': 'Pause',
      //       uuidList,
      //       ok: () => {
      //         self.pause(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      // pageResume: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('NormalVmInstanceConfirm', {
      //       'confirmDlgType': 'Resume',
      //       uuidList,
      //       ok: () => {
      //         self.resume(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      // pagePowerOff: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let self = this
      //   if (uuidList.length > 0) {
      //     this.openDialog('NormalVmInstanceConfirm', {
      //       'confirmDlgType': 'PowerOff',
      //       uuidList,
      //       ok: () => {
      //         self.powerOff(uuidList)
      //       }
      //     })
      //     .then(() => {
      //     })
      //   }
      // },
      // pageClone: function () {
      //   if (!this.isSingleSelected) return
      //   this.openCreate('CloneVmInstanceDlg', (param) => {
      //     let names = []
      //     for (let i = 0; i < param.numbers; i++) {
      //       names.push(`${param.name}${i}`)
      //     }
      //     this.clone(this.selectedList[0], param.strategy, names)
      //   })
      // },
      // pageReimage: function () {
      //   if (!this.isSingleSelected) return
      //   this.openDialog('NormalVmInstanceConfirm', {
      //     'confirmDlgType': 'Reimage',
      //     uuidList: this.isSingleSelected,
      //     ok: () => {
      //       this.reimage(this.selectedList[0])
      //     }
      //   })
      // },
      // pageSetVmSshKey: function () {
      //   if (!this.isSingleSelected) return
      //   this.setVmSshKey([this.selectedList[0]], 'aaaaa')
      // },
      // pageSetVmConsolePassword: function () {
      //   if (!this.isSingleSelected) return
      //   this.setVmConsolePassword([this.selectedList[0]], 'password')
      // },
      // pageChangeInstanceOffering: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   if (uuidList.length > 0) {
      //     this.openInplaceDialog('InstanceOfferingListSingleSelectConfirmDlg', [], (uuid) => this.changeInstanceOffering(uuidList, uuid))
      //   }
      // },
      // pageChangeSnapshot: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   if (uuidList.length > 0) {
      //     // this.openInplaceDialog('InstanceOfferingListSingleSelectList', [], (uuid) => this.changeInstanceOffering(uuidList, uuid))
      //   }
      // },
      // pageChangeResourceOwner: function () {
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   let uuid = this.dbData.accountRef[this.selectedList[0]].accountUuid
      //   if (uuidList.length > 0) {
      //     this.openSideWindow('AccountListDlg', {
      //       uuid: uuid,
      //       select: (uuid) => this.changeResourceOwner(uuidList, uuid)
      //     })
      //   }
      // },
      // pageCreateVmInstanceScheduler: function () {
      //   if (!this.isSingleSelected) return
      //   let uuid = this.selectedList[0]
      //   let createSchedulerForVmInstance = (param) => this.createVmInstanceScheduler(uuid, param)
      //   let createSchedulerForRootVolume = (param) => this.createVolumeScheduler(uuid, param)
      //   this.openDialog('CreateScheduler', {
      //     createSchedulerForVmInstance: createSchedulerForVmInstance,
      //     createSchedulerForRootVolume: createSchedulerForRootVolume
      //   })
      //   .then((dialogUuid) => {
      //     let dialogList = _.cloneDeep(this.windowData.dialogList)
      //     dialogList.push(dialogUuid)
      //     this.updateWindow({ dialogList })
      //     .then(() => {
      //       this._updateWindow({
      //         id: dialogUuid,
      //         left: this.$el.offsetLeft,
      //         top: this.$el.offsetTop,
      //         right: 0,
      //         bottom: 0
      //       })
      //     })
      //   })
      // },
      // loadNetwork: function () {
      //   if (!this.isSingleSelected) return
      //   this.openInplaceDialog('L3NetworkMultiSelectList', ['system=false'], (uuidList) => this.attachL3NetworkToVm(uuidList, this.selectedList[0]))
      // },
      // loadVolume: function () {
      //   if (!this.isSingleSelected) return
      //   this.openSideWindow('VolumeList', {
      //     uuid: this.isSingleSelected,
      //     select: (volumeUuidList) => this.attachDataVolumeToVm(volumeUuidList, this.selectedList[0])
      //   })
      // },
      // unloadVolume: function () {
      //   if (!this.isSingleSelected) return
      //   if (this.dbData.vm[this.selectedList[0]].allVolumes.length === 1) return
      //   this.openInplaceDialog('AttachedDataVolumeListDlg', [this.selectedList[0]], (volumeUuidList) => this.detachDataVolumeFromVm(volumeUuidList))
      // },
      // loadISO: function () {
      //   if (!this.isSingleSelected) return
      //   this.openInplaceDialog('ISOList', [this.selectedList[0]], (isoUuidList) => this.attachISOToVmInstance(isoUuidList, this.selectedList[0]))
      // },
      // unloadISO: function () {
      //   if (!this.isSingleSelected) return
      //   this.detachISOFromVmInstance(this.selectedList[0])
      // },
      // openCreateSnapshot: function () {
      //   if (!this.isSingleSelected) return
      //   let create = (param) => this.createSnapshot(this.selectedList[0], param)
      //   this.openCreate('CreateSnapshotDlg', create)
      // },
      // openCreateImage: function () {
      //   if (!this.isSingleSelected) return
      //   let create = (param) => this.createImage(this.selectedList[0], param)
      //   this.openCreate('CreateImageForVmDlg', create)
      // },
      // openCreateVolume: function () {
      //   if (!this.isSingleSelected) return
      //   this.openCreate('CreateVolumeForVmDlg', (param) => this.createVolume(this.selectedList[0], param))
      // },
      // openCreateVmInstance: function () {
      //   this.openCreate('CreateVmInstanceDlg', this.create)
      // },
      updateHaLevel: function (uuid, haLevel) {
        if (haLevel === 'NeverStop') {
          this.setVmInstanceHaLevel(uuid)
        } else {
          this.deleteVmInstanceHaLevel(uuid)
        }
      },
      setVmInstanceHaLevel: function (uuidList) {
        let self = this
        let event = self.createEvent('vm.action.haLevel', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.create(`vm-instances/${uuid}/ha-levels`, {
              level: 'NeverStop'
            }, event).then((resp) => {
              self.incEventSuccess(event)
              let data = _.cloneDeep(self.dbData.vm[uuid])
              data.haLevel = 'NeverStop'
              self.updateDbRow({
                tableName: 'vm',
                id: uuid,
                data: data
              })
            }, () => {
              self.incEventFail(event)
            })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      changeResourceToAccountOrProject: async function (resourceUuidList, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(resourceUuidList, accountUuid)
        let event = this.createEvent('vm.action.changeResourceOwner', this.dbData.vm[uuidList[0]] ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      deleteVmInstanceHaLevel: function (uuidList) {
        let event = this.createEvent('vm.action.haLevel', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/${uuid}/ha-levels`, null, event)
              .then((resp) => {
                this.incEventSuccess(event)
                // delete this.dbData.vm[uuid].haLevel
                let data = _.cloneDeep(this.dbData.vm[uuid])
                data.haLevel = 'None'
                this.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: data
                })
              }, () => {
                this.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      deleteConsolePassword: function (uuid, isReboot) {
        let event = this.createEvent('vm.action.deleteVmConsolePassword', this.dbData.vm[uuid].name)
        rpc._delete(`vm-instances/${uuid}/console-password`, null, event)
          .then((resp) => {
            this.incEventSuccess(event)
            if (isReboot) {
              this.reboot([uuid])
            }
            this.updateDbRow({
              tableName: 'vmInstancesConsolePassword',
              id: uuid,
              data: {
                hasPassword: false
              }
            })
            this.$forceUpdate()
          }, () => {
            this.incEventFail(event)
          })
      },
      startVmFromHost: function (uuid, vmUuid) {
        let self = this
        let event = self.createEvent('vm.action.startVmFromHost', self.dbData.vm[vmUuid].name)
        rpc.put(`vm-instances/${vmUuid}/actions`, {
          startVmInstance: {
            hostUuid: uuid
          }
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'vm',
              id: resp.inventory.uuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
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
      isLoadISO: function () {
        if (!this.isSingleSelected) return
        let isLoad = false
        let systemTag = _.cloneDeep(this.dbData.vm[this.selectedList[0]].systemTag)
        if (!systemTag) return false
        let item
        for (item in systemTag) {
          let val = systemTag[item].tag.split('::')
          if (val[0] === 'iso' && systemTag[item].resourceUuid === this.selectedList[0]) {
            isLoad = true
          }
        }
        return isLoad
      },
      consolePasswordIsSet (uuid) {
        return this.dbData.vmInstancesConsolePassword[uuid] && this.dbData.vmInstancesConsolePassword[uuid].hasPassword
      },
      updateCount: function () {
        let conditionList = []
        if (this.selectedVCenterUuid && this.availableResourceUuids && this.availableResourceUuids.length > 0) {
          conditionList.push(`uuid?=${this.availableResourceUuids}`)
        }
        let availableCondition = ['type=UserVm', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX', 'state!=Destroyed']
        availableCondition = availableCondition.concat(conditionList)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          availableCondition = availableCondition.concat(this.windowData.searchConditionList)
        }
        rpc.query('vm-instances', {
          q: availableCondition,
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })

        let destroyedCondition = ['type=UserVm', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX', 'state=Destroyed']
        destroyedCondition = destroyedCondition.concat(conditionList)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          destroyedCondition = destroyedCondition.concat(this.windowData.searchConditionList)
        }
        rpc.query('vm-instances', {
          q: destroyedCondition,
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              destroyedCount: resp.total
            })
          })
      },
      ...Utils
    }
  }
</script>
