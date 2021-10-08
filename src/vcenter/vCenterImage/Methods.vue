<script>
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: 'Methods',
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(this.conditions[this.windowData.currTab])
        conditionList.push('system=false')
        conditionList.push('format=vmtx')
        conditionList.push(`backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.selectedVCenterUuid && this.availableResourceUuids && this.availableResourceUuids.length > 0) {
          conditionList.push(`uuid?=${this.availableResourceUuids}`)
        }
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: function () {
        this.windowData.loading =  true;
        this.updateCount()
        let preStep
        let myImageUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=ImageVO', `accountUuid=${localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myImageUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
        }

        return preStep
          .then(() => {
            let condition = this.getCondition()
            if (!this.dbData.common.isAdmin) {
              if (this.windowData.currTab === 'mine') {
                condition = condition.concat(`uuid?=${myImageUuidList.join(',')}`)
              } else if (this.windowData.currTab === 'share') {
                condition = condition.concat(`uuid!?=${myImageUuidList.join(',')}`)
              }
            }
            return rpc.query('images', {
              start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
              limit: this.windowData.pageSize,
              replyWithCount: true,
              q: condition,
              // q: ['system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`].concat(windowDataConditions),
              sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
            }).then((resp) => {
              this.updateWindow({
                pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
                total: resp.total
              })
              let table = {}
              let uuidList = []
              if (resp.inventories.length === 0) {
                this.updateWindow({ uuidList, table })
                  .then(() => {
                    this.itemList = this.getItemList();
                    this.windowData.loading =  false;
                  })
                return
              }
              let backupStorageUuidList = resp.inventories.map((item) => item.backupStorageRefs[0] && item.backupStorageRefs[0].backupStorageUuid).join()
              let resourceUuidList
              let accountInventories
              uuidList = resp.inventories.map((item) => item.uuid)
              let imageList = resp.inventories
              uuidList.forEach((uuid) => {
                table[uuid] = {
                  selected: false
                }
              })
              rpc.getResourceAccount(uuidList, this)
              rpc.query('backup-storage', {
                q: 'uuid?=' + backupStorageUuidList
              })
                .then((resp) => {
                  let tasks = []
                  let p = null
                  let bsList = resp.inventories
                  imageList.forEach(image => {
                    bsList.forEach(bs => {
                      if (image.backupStorageRefs[0] && image.backupStorageRefs[0].backupStorageUuid === bs.uuid) {
                        p = this.updateDbRow({
                          tableName: 'imageA',
                          id: image.uuid,
                          data: {
                            vCenterUuid: bs.vCenterUuid
                          }
                        })
                        tasks.push(p)
                      }
                    })
                  })
                  return Promise.all(tasks).then(() => {
                    return this.updateDbTable({
                      tableName: 'backupstorage',
                      list: bsList
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
                  if (this.dbData.common.isAdmin) {
                    return rpc.query('accounts/resources/refs', {
                      q: 'resourceUuid?=' + uuidList
                    })
                  } else {
                    return new Promise((resolve, reject) => { resolve() })
                  }
                })
                .then((resp) => {
                  if (this.dbData.common.isAdmin) {
                    accountInventories = resp.inventories
                    accountInventories.forEach((item) => {
                      item.uuid = item.resourceUuid
                    })
                    resourceUuidList = [...new Set(resp.inventories.map((item) => item.accountUuid))].join()
                    return rpc.query('accounts', {
                      q: 'uuid?=' + resourceUuidList
                    })
                  } else {
                    return new Promise((resolve, reject) => { resolve() })
                  }
                })
                .then((resp) => {
                  if (this.dbData.common.isAdmin) {
                    accountInventories.forEach((item, index) => {
                      item.uuid = item.resourceUuid
                      resp.inventories.forEach((i) => {
                        if (i.uuid === item.accountUuid) {
                          item.owner = i
                        }
                      })
                    })
                    return this.updateDbTable({
                      tableName: 'accountRef',
                      list: accountInventories
                    })
                  } else {
                    return new Promise((resolve, reject) => { resolve() })
                  }
                })
                .then(() => {
                  if (this.dbData.common.isAdmin) {
                    let tasks = () => {
                      return resp.inventories.map((item, index) => {
                        return this.isShareToAll(item.uuid)
                          .then((toPublic) => {
                            resp.inventories[index].toPublic = toPublic
                          })
                      })
                    }
                    return Promise.all(tasks())
                  } else {
                    return new Promise((resolve, reject) => { resolve() })
                  }
                })
                .then(() => {
                  this.updateDbTable({
                    tableName: 'image',
                    list: resp.inventories
                  })
                  this.updateWindow({ uuidList, table })
                }).then(() => {
                  this.itemList = this.getItemList();
                  this.windowData.loading =  false;
              })
            })
          })
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.image[uuid];
        })
      },

      isShareToAll: function (uuid) {
        return rpc.query('accounts/resources', {
          q: `resourceUuid=${uuid}`
        })
          .then((resp) => {
            let toPublic = false
            resp.inventories.forEach((item) => {
              if (item.toPublic) toPublic = true
            })
            return toPublic
          })
      },
      changeResourceToAccountOrProject: async function (resourceUuidList, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(resourceUuidList, accountUuid)
        let event = this.createEvent('image.action.changeOwner', this.dbData.image[uuidList[0]] ? this.dbData.image[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
              self.updateDbRow({
                tableName: 'image',
                id: uuid,
                data: {
                  accountUuid: resp.inventory.accountUuid
                }
              })
              return self.updateDbRow({
                tableName: 'resourceOwner',
                id: uuid,
                data: {
                  uuid: resp.inventory.accountUuid,
                  name: self.dbData.account[resp.inventory.accountUuid].name
                }
              })
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
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
      create(param) {
        var self = this;
        var jobUuid = self.genUniqueId();
        var msg = {
          name: param.name,
          description: param.description,
          url: param.url,
          platform: param.platform,
          system: false,
          backupStorageUuids: param.backupStorageUuids,
          systemTags: [],
          resourceUuid: jobUuid
        };
        if (param.Qemu) msg.systemTags.push('qemuga');
        if (param.mediaType === 'Image') {
          msg.mediaType = 'RootVolumeTemplate';
          if (self.dbData.backupstorage[param.backupStorageUuids[0]].type === 'VCenter') msg.format = 'vmtx';else msg.format = 'qcow2';
        } else if (param.mediaType === 'ISO') {
          msg.mediaType = 'ISO';
          if (self.dbData.backupstorage[param.backupStorageUuids[0]].type === 'VCenter') msg.format = 'vmtx';else msg.format = 'iso';
        }
        if (!param.isSystem) msg.mediaType = 'DataVolumeTemplate';
        if (param.systemTags) msg.systemTags.push(param.systemTags);
        var event = self.createEvent('image.action.add', param.name, undefined, undefined, undefined, { tableName: 'image', resourceUuid: jobUuid, jobUuid: jobUuid });
        return rpc.create('longjobs', {
          jobName: 'APIAddImageMsg',
          jobData: JSON.stringify(msg)
        }, event, jobUuid).then(()=>{
          return self.triggerLongJobTask();
        }, () => {
          self.incEventFail(event);
          return self.longJobHandler(event, self);
        });
      },
      queryResourceProgress () {
        this.interval = setInterval(() => {
          return this.queryAllProgresses('imageProgress', ['Creating', 'Downloading'], 'status')
        }, 4000)
      },
      isUploading (uuid) {
        let image = this.dbData.image[uuid]
        let reg = /^upload:\/\/.*/
        return image && reg.test(image.url)
      },
      deleteExportImage: function (uuidList) {
        const self = this
        let event = self.createEvent('image.action.exportdelete', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            console.log(rpc)
            let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            imageInventory.state = 'Destroying'
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: imageInventory
            })
            rpc._delete(`backup-storage/${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}/exported-images/${uuid}`, null, event)
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
          })(uuid)
        })
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('image.action.delete', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        let p = null
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            imageInventory.state = 'Destroying'
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: imageInventory
            })
            p = rpc._delete(`images/${uuid}`, null, event)
              .then(() => {
                self.updateCount()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      enabled(uuidList, fn) {
        const self = this
        let event = self.createEvent('image.action.enable', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            imageInventory.state = 'Starting'
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: imageInventory
            })
            rpc.update('images', uuid, {
              'changeImageState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'image',
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
        let event = self.createEvent('image.action.disable', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            imageInventory.state = 'Stopping'
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: imageInventory
            })
            rpc.update('images', uuid, {
              'changeImageState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'image',
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
      downloadFile: function (url) {
        let aNode = document.createElement('a')
        aNode.setAttribute('type', 'hidden')
        aNode.href = url
        aNode.download = url
        document.body.appendChild(aNode)
        aNode.click()
        aNode.remove()
      },
      download: function (uuidList) {
        uuidList.forEach((uuid) => {
          this.downloadFile(this.dbData.image[uuid].exportUrl)
        })
      },
      recover: function (uuidList, fn) {
        const self = this
        let event = self.createEvent('image.action.recover', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            // let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            // imageInventory.state = 'Recovering'
            // self.updateDbRow({
            //   tableName: 'image',
            //   id: uuid,
            //   data: imageInventory
            // })
            rpc.update('images', uuid, {
              'recoverImage': {
                'backupStorageUuids': [
                  self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid
                ]
              }
            }, event)
              .then((resp) => {
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: resp.inventory
                })
                self.updateCount()
                self.incEventSuccess(event)
                if(fn) fn();
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      expunge (uuidList, fn) {
        let self = this, p = null, tasks = [];
        let event = self.createEvent('image.action.expunge', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p =  rpc.update('images', uuid, {
              'expungeImage': {
                'backupStorageUuids': [`${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}`]
              }
            }, event)
              .then((resp) => {
                self.updateCount()
                self.incEventSuccess(event)
                if(fn) fn();
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.race(tasks);
      },
      changeResourceOwner: function (uuidList, accountUuid) {
        const self = this
        let event = self.createEvent('image.action.changeOwner', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let accountRefInventory
            rpc.create(`account/${accountUuid}/resources`, {
              'resourceUuid': uuid
            }, event)
              .then((resp) => {
                accountRefInventory = resp.inventory
                accountRefInventory.uuid = uuid
                self.incEventSuccess(event)
                return rpc.query('accounts', {
                  q: 'uuid=' + accountRefInventory.accountUuid
                })
              }, () => self.incEventFail(event))
              .then((resp) => {
                accountRefInventory.owner = resp.inventories[0]
                self.updateDbRow({
                  tableName: 'accountRef',
                  id: uuid,
                  data: accountRefInventory
                })
              })
          })(uuid)
        })
      },
      shareImage: function (uuid, accountUuid) {
        const self = this
        let event = self.createEvent('image.action.share', self.dbData.image[uuid].name)
        rpc.update('accounts', 'resources', {
          'shareResource': {
            'resourceUuids': uuid,
            'accountUuids': accountUuid,
            'toPublic': false
          }
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      shareImageToAll: function (uuid) {
        const self = this
        let event = self.createEvent('image.action.shareToAll', self.dbData.image[uuid].name)
        rpc.update('accounts', 'resources', {
          'shareResource': {
            'resourceUuids': uuid,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      updateCount: function () {
        let conditionList = []
        let zoneUuid = `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`
        if (this.selectedVCenterUuid && this.availableResourceUuids && this.availableResourceUuids.length > 0) {
          conditionList.push(`uuid?=${this.availableResourceUuids}`)
        }

        let preStep
        let myImageUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=ImageVO', `accountUuid=${localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myImageUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
        }

        if (this.dbData.common.isAdmin) {
          rpc.query('images', {
            count: true,
            q: ['status!=Deleted', 'system=false', 'format=vmtx', zoneUuid].concat(conditionList)
          })
            .then((resp) => {
              this.updateWindow({
                availableCount: resp.total
              })
            })
        } else {
          preStep
            .then(() => {
              rpc.query('images', {
                replyWithCount: true,
                q: ['status!=Deleted', 'system=false', 'format=vmtx', '__systemTag__!=remote', `uuid?=${myImageUuidList.join(',')}`, zoneUuid].concat(conditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    mineCount: resp.total
                  })
                })

              rpc.query('images', {
                replyWithCount: true,
                q: ['status!=Deleted', 'system=false', 'format=vmtx', '__systemTag__!=remote', `uuid!?=${myImageUuidList.join(',')}`, zoneUuid].concat(conditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    shareCount: resp.total
                  })
                })
            })
        }
        rpc.query('images', {
          count: true,
          q: ['status=Deleted', 'system=false', 'format=vmtx', zoneUuid].concat(conditionList)
        })
          .then((resp) => {
            this.updateWindow({
              destroyedCount: resp.total
            })
          })
      },
      recallImage: function (uuid, accountUuid) {
        let self = this
        let event = this.createEvent('image.action.recall', this.dbData.image[uuid].name)
        rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': [uuid],
            'toPublic': false,
            'accountUuids': accountUuid,
            'all': false
          }
        })
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('image.action.recallFromAll', uuidList.length === 1 ? this.dbData.image[uuidList[0]].name : '')
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': uuidList,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      shareToAll: function (uuidList) {
        let self = this
        let event = this.createEvent('image.action.shareToAll', uuidList.length === 1 ? this.dbData.image[uuidList[0]].name : '')
        return rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': uuidList,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      canExported: function (uuid) {
        return this.dbData.image[uuid] && this.dbData.image[uuid].backupStorageRefs && this.dbData.backupstorage[this.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid] && this.dbData.backupstorage[this.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid].type === 'ImageStoreBackupStorage' && this.dbData.image[uuid].status !== 'Deleted' && !this.dbData.image[uuid].exportUrl
      },
      ...Utils
    }
  }
</script>
