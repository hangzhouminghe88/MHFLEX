import rpc from 'src/utils/rpc';

export default {
  methods: {
   async queryList() {
     this.windowData.loading = true;
      await  this.updateCount()
      return rpc.query('volumes', {
        start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
        limit: this.windowData.pageSize,
        replyWithCount: true,
        // q: conditions,
        q: this.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then((resp) => {
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          total: resp.total
        })
        let volumeInventories = resp.inventories
        let uuidList = volumeInventories.map((item) => item.uuid)
        let table = {}
        let resourceUuidList
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        rpc.getResourceAccount(uuidList, this)
        if (uuidList.length > 0) {
          if (this.dbData.common.isAdmin) {
            return rpc.query('accounts/resources/refs', {
              q: 'resourceUuid?=' + uuidList
            })
              .then((resp) => {
                // let accountRefInventories = resp.inventories
                resp.inventories.forEach((it) => {
                  for (let i = 0; i < volumeInventories.length; i++) {
                    if (it.resourceUuid === volumeInventories[i].uuid) {
                      volumeInventories[i].accountUuid = it.accountUuid
                      break
                    }
                  }
                })
                resourceUuidList = [...new Set(resp.inventories.map((item) => item.accountUuid))].join()
                return rpc.query('accounts', {
                  q: 'uuid?=' + resourceUuidList
                })
                  .then((resp) => {
                    return this.updateDbTable({
                      tableName: 'account',
                      list: resp.inventories
                    })
                  })
              })
              .then(() => {
                if (this.dbData.common.isAdmin) {
                  return rpc.query('vcenters').then(resp => {
                    return this.updateDbTable({
                      tableName: 'vCenters',
                      list: resp.inventories
                    })
                  })
                } else return new Promise((resolve, reject) => { resolve() })
              })
              .then(() => {
                let psUuids = resp.inventories.map((item) => item.primaryStorageUuid)
                return rpc.query('primary-storage', {
                  q: `uuid?=${psUuids.join()}`
                }).then((resp) => {
                  let tasks = []
                  let p = null
                  let psList = resp.inventories
                  volumeInventories.forEach(volume => {
                    psList.forEach(ps => {
                      if (volume.primaryStorageUuid === ps.uuid) {
                        p = this.updateDbRow({
                          tableName: 'volumeA',
                          id: volume.uuid,
                          data: {
                            vCenterUuid: ps.vCenterUuid
                          }
                        })
                        tasks.push(p)
                      }
                    })
                  })
                  return Promise.all(tasks).then(() => {
                    return this.updateDbTable({
                      tableName: 'primarystorage',
                      list: resp.inventories
                    })
                  })
                })
              })
              .then(() => {
                resp.inventories.forEach((item) => {
                  rpc.query(`volumes/${item.uuid}/capabilities`)
                    .then((resp) => {
                      this.updateDbRow({
                        tableName: 'volumesCapabilities',
                        id: item.uuid,
                        data: resp.capabilities
                      })
                      item.MigrationInCurrentPrimaryStorage = resp.capabilities.MigrationInCurrentPrimaryStorage
                    })
                })
              })
              .then(() => {
                let tasks = []
                volumeInventories.forEach((item) => {
                  if (item.isShareable) {
                    let p = rpc.query('volumes/vm-instances/refs', {
                      q: `volumeUuid=${item.uuid}`
                    })
                      .then((resp) => {
                        if (resp.inventories.length > 0) {
                          item.vmInstanceUuid = []
                          resp.inventories.forEach((volumeRefs) => {
                            item.vmInstanceUuid.push(volumeRefs.vmInstanceUuid)
                          })
                        } else item.vmInstanceUuid = ''
                      })
                    tasks.push(p)
                  }
                })
                return Promise.all(tasks)
              }).then(() => {
                return this.isImageStoreInZone()
              }).then(() => {
                return Promise.all([this.updateDbTable({
                  tableName: 'volume',
                  list: volumeInventories
                }), this.updateWindow({ uuidList, table })]).then(() => {
                  this.itemList = this.getItemList();
                  this.windowData.loading = false;
                })
              })
          } else {
            return Promise.all([
              this.updateDbTable({
                tableName: 'volume',
                list: volumeInventories
              }).then(() => {
                return this.isImageStoreInZone()
              }).then(() => {
                return this.updateWindow({ uuidList, table })
              })
            ]).then(() => {
              this.itemList = this.getItemList();
              this.windowData.loading = false;
            })
          }
        } else {
          return this.updateWindow({ uuidList, table }).then(() => {
            this.itemList = this.getItemList();
            this.windowData.loading = false;
          })
        }
      })
    },

    getItemList(){
      let self = this;
      return self.windowData.uuidList.map((uuid) => {
         return self.dbData.volume[uuid];
      })
    },

    getCondition() {
      let conditionList = []
      if (this.selectedVCenterUuid && this.availableResourceUuids && this.availableResourceUuids.length > 0) {
        conditionList.push(`uuid?=${this.availableResourceUuids}`)
      }
      if (this.currTab === 'available') {
        conditionList = conditionList.concat(['status!=Deleted', 'status!=NotInstantiated', 'type=Data', `primaryStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'format=vmtx'])
      } else if (this.currTab === 'destroyed') {
        conditionList = conditionList.concat(['status=Deleted', 'type=Data', `primaryStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'format=vmtx'])
      } else {
        conditionList = conditionList.concat('status=NotInstantiated', 'type=Data')
      }
      // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
      if (this.selectVal !== '' && this.searchStr !== '') {
        conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
      }
      return conditionList
    },

    updateCount: function () {
      let conditionList = [], p= null, tasks = [];
      if (this.selectedVCenterUuid && this.availableResourceUuids && this.availableResourceUuids.length > 0) {
        conditionList.push(`uuid?=${this.availableResourceUuids}`)
      }
      p = rpc.query('volumes', {
        count: true,
        q: ['status!=Deleted', 'status!=NotInstantiated', 'type=Data', `primaryStorage.zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'format=vmtx'].concat(this.windowData.searchConditionList ? this.windowData.searchConditionList : [], conditionList)
      })
      tasks.push(p);
      p = rpc.query('volumes', {
        count: true,
        q: ['status=Deleted', 'type=Data', `primaryStorage.zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'format=vmtx'].concat(this.windowData.searchConditionList ? this.windowData.searchConditionList : [], conditionList)
      })
      tasks.push(p);
      p = rpc.query('volumes', {
        count: true,
        q: ['status=NotInstantiated', 'type=Data'].concat(this.windowData.searchConditionList ? this.windowData.searchConditionList : [], conditionList)
      })
      tasks.push(p);
      return Promise.all(tasks).then((resp) => {
        this.updateWindow({
          availableCount: resp[0].total,
          destroyedCount: resp[1].total,
          notInstantiatedCount: resp[2].total
        })
      })
    },

    getResourceOwner (uuid) {
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

    getVmInstanceName(uuid) {
      let value
      try {
        value = this.dbData.vm[uuid].name
      } catch (e) {
        if (this.checkBounce(`getVmInstanceName-${uuid}`)) return ''
        value = ''
        rpc.queryResourceNames(this, 'vm', uuid)
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },

    getPsName (uuid) {
      let value
      try {
        value = this.dbData.primarystorage[this.dbData.volume[uuid].primaryStorageUuid].name
      } catch (e) {
        if (this.checkBounce(`getPsName-${uuid}`)) return ''
        value = ''
        rpc.queryResourceNames(this, 'primarystorage', this.dbData.volume[uuid].primaryStorageUuid)
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },

    enabled(uuidList, fn) {
      const self = this
      let event = self.createEvent('volume.action.enable', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length)
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let volumeInventory = _.cloneDeep(self.dbData.volume[uuid])
          volumeInventory.state = 'Starting'
          self.updateDbRow({
            tableName: 'volume',
            id: uuid,
            data: volumeInventory
          })
          rpc.update('volumes', uuid, {
            'changeVolumeState': {
              'stateEvent': 'enable'
            }
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
              self.updateDbRow({
                tableName: 'volume',
                id: uuid,
                data: resp.inventory
              })
              if(fn) fn();
            }, () => {
              self.incEventFail(event)
            })
        })(uuid)
      })
    },

    disabled(uuidList, fn) {
      const self = this
      let event = self.createEvent('volume.action.disable', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length)
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let volumeInventory = _.cloneDeep(self.dbData.volume[uuid])
          volumeInventory.state = 'Stopping'
          self.updateDbRow({
            tableName: 'volume',
            id: uuid,
            data: volumeInventory
          })
          rpc.update('volumes', uuid, {
            'changeVolumeState': {
              'stateEvent': 'disable'
            }
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
              self.updateDbRow({
                tableName: 'volume',
                id: uuid,
                data: resp.inventory
              })
              if(fn) fn();
            }, () => {
              self.incEventFail(event)
            })
        })(uuid)
      })
    },

    attachToVm(uuid, vmUuidList) {
      const self = this
      let event = this.createEvent('volume.action.attachToVm', this.dbData.volume[uuid].name, vmUuidList.length)
      let tasks = []
      vmUuidList.forEach((vmUuid) => {
        let p = rpc.create(`volumes/${uuid}/vm-instances/${vmUuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
      })
      return Promise.all(tasks)
    },

    multipleAttachToVm(dataVolumeUuidList, vmUuid) {
      const self = this
      let event = self.createEvent('volume.action.attachToVm', self.dbData.volume[dataVolumeUuidList[0]].name, dataVolumeUuidList.length)
      let tasks = []
      let p = null
      dataVolumeUuidList.forEach(function (uuid) {
        ((uuid) => {
          p = rpc.create(`volumes/${uuid}/vm-instances/${vmUuid}`, null, event)
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

    delete (uuidList) {
      const self = this
      let event = self.createEvent('volume.action.delete', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let p = null
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          console.log(rpc)
          let volumeInventory = _.cloneDeep(self.dbData.volume[uuid])
          volumeInventory.state = 'Destroying'
          self.updateDbRow({
            tableName: 'volume',
            id: uuid,
            data: volumeInventory
          })
          p = rpc._delete(`volumes/${uuid}`, null, event)
            .then((resp) => {
              // let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
              // let newTable = _.cloneDeep(self.windowData.table)
              // delete newTable[uuid]
              // self.updateWindow({
              //   uuidList: newUuidList,
              //   table: newTable
              // })
              self.incEventSuccess(event)
              // self.updateCount()
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })(uuid)
      })
      return Promise.all(tasks)
    },
    detach (uuidList) {
      let event = this.createEvent('volume.action.detachFromVm', uuidList.length === 1 ? this.dbData.volume[uuidList[0]].name : '', uuidList.length)
      const self = this
      let tasks = []
      uuidList.forEach(function (uuid) {
        let p = rpc._delete(`volumes/${uuid}/vm-instances`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
            let data = _.cloneDeep(self.dbData.volume[uuid])
            data.vmInstanceUuid = ''
            return self.updateDbRow({
              tableName: 'volume',
              id: uuid,
              data: data
            })
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
      })
      return Promise.all(tasks)
    },

    expunge (uuidList) {
      let self = this, p = null, tasks= [];
      let event = self.createEvent('volume.action.expunge', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length)
      uuidList.forEach((uuid) => {
        ((uuid) => {
          p = rpc.update('volumes', uuid, {
            'expungeDataVolume': {}
          }, event)
            .then((resp) => {
              let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
              let newTable = _.cloneDeep(self.windowData.table)
              delete newTable[uuid]
              self.updateWindow({
                uuidList: newUuidList,
                table: newTable
              })
              self.updateCount()
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p);
        })(uuid)
      })
      return Promise.all(tasks);
    },

    recover (uuidList) {
      let self = this, p = null, tasks = [];
      let event = self.createEvent('volume.action.recover', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length)
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          p = rpc.update('volumes', uuid, {
            'recoverDataVolume': {}
          }, event)
            .then((resp) => {
              let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
              let newTable = _.cloneDeep(self.windowData.table)
              delete newTable[uuid]
              self.updateWindow({
                uuidList: newUuidList,
                table: newTable
              })
              self.updateCount()
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p);
        })(uuid)
      })
      return Promise.all(tasks);
    },

    create: async function (param) {
      let self = this
      let event = self.createEvent('volume.action.add', param.name)
      let msg = {
        name: param.name,
        description: param.description
      }
      let createPath
      msg.systemTags = []
      if (param.VirtioSCSI) {
        msg.systemTags.push('capability::virtio-scsi')
        if (param.shareable) {
          msg.systemTags.push('ephemeral::shareable')
        }
      }
      let ps
      if (param.primaryStorageUuid) {
        msg.primaryStorageUuid = param.primaryStorageUuid
        ps = self.dbData.primarystorage[param.primaryStorageUuid]
      }
      if (ps && ps.type === 'Ceph' && param.poolName) {
        msg.systemTags.push('ceph::pool::' + param.poolName)
      }
      // create volume by volumeOffering
      if (param.diskOfferingUuid) {
        msg.diskOfferingUuid = param.diskOfferingUuid
        createPath = 'volumes/data'
        if (ps && ps.type === 'LocalStorage') {
          msg.systemTags.push('localStorage::hostUuid::' + param.hostUuid + '')
        }
      }
      // create volume by volumeImage
      if (param.volumeImageUuid) {
        createPath = `volumes/data/from/data-volume-templates/${param.volumeImageUuid}`
        if (param.hostUuid) {
          msg.hostUuid = param.hostUuid
        }
      }
      let resp
      try {
        resp = await rpc.create(createPath, msg, event)
        self.incEventSuccess(event)
      } catch (e) {
        self.incEventFail(event)
        console.log(e)
        return
      }
      let dataVolumeUuid = resp.inventory.uuid
      let table = {}
      let row = {}
      let obj = {}
      let uuidList = []
      //  whether create resource in Volume page directly or not
      if (self.windowData.uuidList) {
        uuidList = self.windowData.uuidList.slice()
        if (uuidList.indexOf(resp.inventory.uuid) === -1) {
          uuidList.unshift(resp.inventory.uuid)
          row[resp.inventory.uuid] = {}
          row[resp.inventory.uuid].selected = false
        }
        table = Object.assign({}, { ...self.windowData.table }, row)
      }
      if (self.dbData.common.isAdmin) {
        let ownerResp = await rpc.query('accounts/resources/refs', {
          q: 'resourceUuid=' + resp.inventory.uuid
        })
        obj.accountUuid = ownerResp.inventories[0].accountUuid
      }
      if (param.vmInstanceUuid) {
        let attachVolumeToVm = self.createEvent('volume.action.attachToVm', param.name)
        rpc.create(`volumes/${dataVolumeUuid}/vm-instances/${param.vmInstanceUuid}`, '', attachVolumeToVm)
          .then((resp) => {
            self.incEventSuccess(attachVolumeToVm)
            self.updateDbRow({
              tableName: 'volume',
              id: resp.inventory.uuid,
              data: {
                ...resp.inventory,
                ...obj
              }
            }).then(() => {
              self.updateWindow({ uuidList, table })
              self.updateCount()
              self.queryList()
            })
          }, () => {
            self.incEventFail(attachVolumeToVm)
            rpc.query('volumes', {
              q: `uuid=${resp.inventory.uuid}`
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'volume',
                  id: resp.inventories[0].uuid,
                  data: {
                    ...resp.inventories[0],
                    ...obj
                  }
                }).then(() => {
                  self.updateWindow({ uuidList, table }).then(() => {
                    if (resp.inventories[0].status === 'NotInstantiated' && self.handleChangeTab) {
                      self.currTab = 'notInstantiated';
                      self.handleChangeTab()
                      self.updateCount()
                      self.queryList()
                    }
                  })
                })
              })
          })
      } else {
        if (resp.inventory.status === 'NotInstantiated' && self.handleChangeTab) {
          self.currTab = 'notInstantiated';
          self.handleChangeTab()
          self.updateCount()
          self.queryList()
          return
        }
        self.updateDbRow({
          tableName: 'volume',
          id: resp.inventory.uuid,
          data: {
            ...resp.inventory,
            ...obj
          }
        })
        self.updateWindow({ uuidList, table })
        self.updateCount()
        self.queryList()
      }
    },
  }
}
