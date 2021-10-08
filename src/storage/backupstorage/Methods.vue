<script>
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      getData() {
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.backupstorage[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.backupstorage[uuid]
          }
        )
      },
      getCondition () {
        let conditionList = []
        conditionList.push(`zone.uuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push('__systemTag__!?=remote,onlybackup,aliyun,remotebackup')
        /*
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }*/
        if (this.selectVal !=='' && this.searchStr !== '') {
          conditionList.push(`${this.selectVal}~=%25${this.searchStr}%25`)
        }


        return conditionList
      },
      queryList: async function () {

        this.updateWindow({
          loading: true
        })

        //alert(JSON.stringify(this.getCondition()));
        //alert("2222");

        let conditions = this.windowData.conditions
        if (conditions === undefined) conditions = []
        let resp
        if (conditions.length === 3 && conditions[2] !== 'type!=VCenter') {
          let volumeUuid = conditions[2]
          // let queryConditions = conditions.slice(0, 2)
          resp = await rpc.query(`images/volumes/${volumeUuid}/candidate-backup-storage`, {
            count: false,
            start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
            limit: this.windowData.pageSize,
            replyWithCount: true,
            sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
            q: this.getCondition()
            // q: queryConditions
          })
        } else {
          resp = await rpc.query('backup-storage', {
            count: false,
            start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
            limit: this.windowData.pageSize,
            replyWithCount: true,
            sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
            // q: [`attachedZoneUuids=${localStorage.getItem('currZoneUuid')}`].concat(this.windowData.conditions)
            q: this.getCondition()
          })
        }
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        return this.updateDbTable({
          tableName: 'backupstorage',
          list: resp.inventories
        }).then(() => {
          return this.updateWindow({loading: false,uuidList, table })
        }).then(() => {
          this.itemList = this.getData();
        })
      },
      create (param) {
        let event = this.createEvent('backupStorage.action.create', param.name)
        return rpc.create(`backup-storage/${param.type}`, param, event).then(resp => {
          this.incEventSuccess(event)
          if (param.type === 'image-store' && param.importImages) {
            this.importImages(resp.inventory, self)
          }
          let curSelectZoneUuid = param.zoneUuid
          // Attach BackupStorage To Zone
          return rpc.create(`zones/${curSelectZoneUuid}/backup-storage/${resp.inventory.uuid}`)
        }, () => {
          this.incEventFail(event)
        })
      },
      delete (uuidList) {
        let self=this
        let event = self.createEvent('backupStorage.action.delete', uuidList.length === 1 ? self.dbData.backupstorage[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc._delete(`backup-storage/${uuid}`, null, event).then(() => {
            self.deleteDbRow({
              tableName: 'localBackupStorage',
              id: uuid
            })
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      enable (uuidList) {
        let self=this
        let tasks = []
        let p = null
        let event = self.createEvent('backupStorage.action.enable', uuidList.length === 1 ? self.dbData.backupstorage[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(uuid => {
          p = rpc.update('backup-storage', uuid, {
            'changeBackupStorageState': {
              'stateEvent': 'enable'
            }
          }, event).then(resp => {
            self.incEventSuccess(event)
            self.queryList()
            return self.updateDbRow({
              tableName: 'backupstorage',
              id: uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      reclaimSpaceFromImageStore () {
        let self = this
        if (self.selectedList && self.selectedList.length > 0) {
          let imageStoreList = self.selectedList.filter(uuid => this.dbData.backupstorage[uuid].type === 'ImageStoreBackupStorage')
          if (imageStoreList.length > 0) {
            self.openDialog('ConfirmDlg',{
              title: 'backupStorage.clear',
              description: 'backupStorage.clearBS',
              warning: 'backupStorage.clearWarning',
              uuidList: imageStoreList,
              icon: 'primary_storage_popupico',
              ok: () => {
                self.clear(imageStoreList).then(() => {
                  if (self.queryList) {
                    self.queryList().then(() => self.$forceUpdate())
                  }
                })
              },
              getName: (uuid) => {
                return self.dbData.backupstorage[uuid].name;
              }
            })
          }
        }
      },
      canClear(){
        let self = this;
        if(self.selectedList && self.selectedList.length > 0){
         return self.selectedList.every((uuid)=>{
            self.dbData.background[uuid].type !== 'ImageStoreBackupStorage'
          })
        }else{
          return false;
        }
      },
      clear (imageStoreList) {
        let self = this
        let event = self.createEvent('backupStorage.action.clear', imageStoreList.length === 1 ? self.dbData.backupstorage[imageStoreList[0]].name : '', imageStoreList.length)
        let task = []
        let p = null
        imageStoreList.forEach(uuid => {
          p = rpc.update(`backup-storage/image-store`, uuid, {
            'reclaimSpaceFromImageStore': {}
          }, event).then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          task.push(p)
        })
        return Promise.all(task)
      },
      disable (uuidList) {
        let self = this
        let tasks = []
        let p = null
        let event = self.createEvent('backupStorage.action.disable', uuidList.length === 1 ? self.dbData.backupstorage[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(uuid => {
          p = rpc.update('backup-storage', uuid, {
            'changeBackupStorageState': {
              'stateEvent': 'disable'
            }
          }, event).then(resp => {
            self.incEventSuccess(event)
            this.queryList()
            return self.updateDbRow({
              tableName: 'backupstorage',
              id: uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      reconnect (uuidList) {
        let self = this
        let tasks = []
        let p = null
        let event = self.createEvent('backupStorage.action.reconnect', uuidList.length === 1 ? self.dbData.backupstorage[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(uuid => {
          let bs = _.cloneDeep(self.dbData.backupstorage[uuid])
          self.updateDbRow({
            tableName: 'backupstorage',
            id: uuid,
            data: {
              status: 'Connecting'
            }
          })
          p = rpc.update('backup-storage', uuid, {
            'reconnectBackupStorage': {}
          }, event).then(resp => {
            self.incEventSuccess(event)
            return self.updateDbRow({
              tableName: 'backupstorage',
              id: uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
            return self.updateDbRow({
              tableName: 'backupstorage',
              id: uuid,
              data: bs
            })
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      detilStart (uuid) {
        let uuidlist = []
        uuidlist.push(uuid)
        return this.enable(uuidlist).then(() => this.query())
      },
      getType (uuid) {
        if(this.dbData.backupstorage[uuid]) return;
        let bs = this.dbData.backupstorage[uuid]
        let type = bs && bs.type
        return type ? type.replace(/BackupStorage$/g, '') : '';
      },
      detailStop (uuid) {
        let uuidList = [uuid], self = this;
        this.openDialog('ConfirmDlg', {
          uuidList,
          title: 'backupStorage.disable',
          description: 'backupStorage.info.disableConfirm',
          icon: 'primary_storage_popupico',
          ok: () => {
            self.disable(uuidList).then(() => {
              self.query();
            })
          },
          getName: (uuid) => {
            return self.dbData.backupstorage[uuid].name;
          }
        })
      },
      detailDelete (uuid) {
        let uuidList = [uuid], self = this;
        self.openDialog('ConfirmDlg',{
          title: 'backupStorage.delete',
          description: 'backupStorage.deleteBS',
          uuidList: uuidList,
          icon: 'primary_storage_popupico',
          warning:'backupStorage.deleteWarning',
          ok: () => {
            self.delete(uuidList).then(() => {
              self.$router.push({name: 'backupstorage'})
            })
          },
          getName: (uuid) => {
            return self.dbData.backupstorage[uuid].name;
          }
        })
      },
      detailReconnect (uuid) {
        let uuidList = [uuid], self = this;
        return self.openDialog('ConfirmDlg', {
          title: 'backupStorage.reconnect',
          warning: 'backupStorage.reconnectWarning',
          uuidList: uuidList,
          icon: 'primary_storage_popupico',
          ok: () => {
            return self.reconnect(uuidList, self).then(() => {
              self.query()
            })
          },
          cancel: () => {
            return self.query()
          },
          getName: (uuid) =>  {
            return self.dbData.backupstorage[uuid].name;
          }
        })
      },
      pageDelete () {
        let self = this
        let uuidList = self.selectedList;

        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'backupStorage.delete',
            description: 'backupStorage.deleteBS',
            uuidList: uuidList,
            icon: 'primary_storage_popupico',
            warning:'backupStorage.deleteWarning',
            ok: () => {
              self.delete(uuidList).then(() => {
                if (self.queryList) {
                  self.queryList().then(() => self.$forceUpdate())
                }
              })
            },
            getName: (uuid) => {
              return self.dbData.backupstorage[uuid].name;
            }
          })
        }
      },
      pageEnable () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) this.enable(uuidList).then(() => {
          this.queryList();
        })
      },
      pageDisable () {
        let self=this
        let uuidList = this.selectedList
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'backupStorage.disable',
            description: 'backupStorage.info.disableConfirm',
            uuidList: uuidList,
            icon: 'primary_storage_popupico',
            ok: () => {
              self.disable(uuidList).then(() => {
                this.queryList();
              });
            },
            getName: (uuid) => {
              return self.dbData.backupstorage[uuid].name;
            }
          })
        }
      },
      pageReconnect () {
        let self=this
        let uuidList = this.selectedList
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'backupStorage.reconnect',
            warning: 'backupStorage.reconnectWarning',
            uuidList: uuidList,
            icon: 'primary_storage_popupico',
            ok: () => {
              return self.reconnect(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.backupstorage[uuid].name;
            }
          })
        }
      },
      openCreateBackupStorage (zoneUuid) {
        this.$router.push('createbackupstorage');
      },
      updateCount () {
        return rpc.query('backup-storage', {
          replyWithCount: true,
          q: [`zone.uuid=${localStorage.getItem('currZoneUuid')}`]
        }).then(resp => {
          return this.updateWindow({
            availableCount: resp.total
          })
        })
      },
      refresh (uuid) {
        return this.updateWindow({
          currItemUuid: ''
        }).then(() => {
          return this.queryList()
        })
      },
      ...Utils
    }
  }
</script>

