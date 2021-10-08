<script>
 import rpc from 'src/utils/rpc';
  import ImageMethods from 'src/ecs/image/Methods';
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner';
  export default {
    name: "List",
    mixins: [ImageMethods],
    computed: {
    },
    methods: {
      getCondition () {
        let conditionList = [], self = this;
        if(self.windowData.currTab)
          conditionList = conditionList.concat(self.conditions[self.windowData.currTab])
        conditionList.push(`backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push('__systemTag__!=remote')
        if (self.selectVal && self.selectVal !== '' && self.searchStr && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      queryList () {
        const self = this;
        self.updateCount()
        self.windowData.loading = true;
        let preStep
        let myImageUuidList = []
        if (self.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => {
            resolve()
          })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=ImageVO', `accountUuid=${localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myImageUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => {
                resolve()
              })
            })
        }

        return preStep
          .then(() => {
            let condition = self.getCondition()
            if (!self.dbData.common.isAdmin) {
              if (self.windowData.currTab === 'mine') {
                condition = condition.concat(`uuid?=${myImageUuidList.join(',')}`)
              } else if (self.windowData.currTab === 'share') {
                condition = condition.concat(`uuid!?=${myImageUuidList.join(',')}`)
              }
            }
            return rpc.query('images', {
              start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
              limit: self.windowData.pageSize,
              replyWithCount: true,
              q: condition,
              sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
            })
          })
          .then((resp) => {
            self.updateWindow({
              pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
              total: resp.total
            })
            let table = {}
            let uuidList = []
            if (resp.inventories.length === 0) {
              self.updateWindow({uuidList, table})
              return
            }
            let imageInventories = resp.inventories
            let backupStorageUuidList = resp.inventories.map((item) => {
              if (item.backupStorageRefs && item.backupStorageRefs.length > 0) {
                return item.backupStorageRefs[0].backupStorageUuid
              }
            }).join()
            let resourceUuidList
            uuidList = resp.inventories.map((item) => item.uuid)
            rpc.getResourceAccount(uuidList, self)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            return rpc.query('backup-storage', {
              q: 'uuid?=' + backupStorageUuidList
            })
              .then((resp) => {
                return this.updateDbTable({
                  tableName: 'backupstorage',
                  list: resp.inventories
                })
              })
              .then(() => {
                let tasks = []
                let p
                uuidList.forEach(uuid => {
                  if (self.dbData.common.isAdmin && !self.dbData.common.isOpensource) {
                    p = rpc.query('backup-storage', {fields: 'type', q: [`image.uuid=${uuid}`]}).then((resp) => {
                      let canMigrate = (resp.inventories.length > 0) && (resp.inventories[0].type === 'Ceph')
                      return self.updateDbRow({
                        tableName: 'imageMigrate',
                        id: uuid,
                        data: {
                          canMigrate: canMigrate
                        }
                      })
                    })
                  } else {
                    p = self.updateDbRow({
                      tableName: 'imageMigrate',
                      id: uuid,
                      data: {
                        canMigrate: false
                      }
                    })
                  }
                  tasks.push(p)
                })
                return Promise.all(tasks)
              })
              .then(() => {
                if (this.dbData.common.isAdmin) {
                  return rpc.query('accounts/resources/refs', {
                    q: 'resourceUuid?=' + uuidList
                  })
                } else {
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
                }
              })
              .then((resp) => {
                if (this.dbData.common.isAdmin) {
                  resp.inventories.forEach((it) => {
                    for (let i = 0; i < imageInventories.length; i++) {
                      if (it.resourceUuid === imageInventories[i].uuid) {
                        imageInventories[i].accountUuid = it.accountUuid
                        break
                      }
                    }
                  })
                  resourceUuidList = [...new Set(resp.inventories.map((item) => item.accountUuid))].join()
                  return rpc.query('accounts', {
                    q: 'uuid?=' + resourceUuidList
                  })
                } else {
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
                }
              })
              .then((resp) => {
                if (this.dbData.common.isAdmin) {
                  return this.updateDbTable({
                    tableName: 'account',
                    list: resp.inventories
                  })
                } else {
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
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
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
                }
              })
              .then(() => {
                this.updateDbTable({
                  tableName: 'image',
                  list: imageInventories
                }).then(() => {
                  this.updateWindow({uuidList, table})
                })
              })
          }).then(() => {
            this.windowData.loading = false;
            this.itemList = this.getData();
            return this.isImageStoreInZone()
          })
      },
      ...{
        changeResourceOwnerDlg: ChangeResourceOwnerDlg.changeResourceOwnerDlg
      },
      //启动镜像
      pageStart: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.image[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.start(uuidList)
      },
      //停用镜像
      pageStop: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.image[uuid].state !== 'Disabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.stop(uuidList)
      },
      //判断是否共享给所有列表
      getNotSharedToAllList () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !this.dbData.image[uuid].toPublic)
          return list
        }
        return []
      },
      //共享镜像
      pageShareImageToAll: function () {
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              this.shareToAll(uuidList)
            }
          })
        }
      },
      //全局召回
      pageRecallImageFromAll: function () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning: 'account.recall',
            ok: () => {
              this.recallFromAll(uuidList)
            }
          })
        }
      },
      //更改所有者
      pageChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
      },
      pageStorageMigrateImage () {
        if (!this.isSingleSelected) return
        let imageUuid = this.selectedList[0]
        let backupStorageUuidList = []
        let srcBackupStorageUuid = this.dbData.image[imageUuid].backupStorageRefs[0].backupStorageUuid
        const self = this
        rpc.query(`backup-storage/${srcBackupStorageUuid}/migration-candidates`)
          .then((resp) => {
            backupStorageUuidList = resp.inventories.map((item) => item.uuid)
            self.openDialog('BackupStorageSelectListConfirmDlg', {
              action: 'storageMigrate',
              conditions: [`uuid?=${backupStorageUuidList}`, '__systemTag__!=remote'],
              ok: (backupStorageUuid) => self.storageMigrateImage(backupStorageUuid, imageUuid, srcBackupStorageUuid).then(() => self.queryList())
            })
          }, () => {
            self.showBsSingleDlg  = true;
            // self.openSideWindow('BackupStorageSelectListConfirmDlg', {
            //   conditions: `uuid?=[]`,
            //   action: 'storageMigrate',
            //   ok: (backupStorageUuid) => self.storageMigrateImage(backupStorageUuid, imageUuid, srcBackupStorageUuid)
            // })
          })
      },
      closeBsSingleDlg(param){
        let self = this;
        if(param){

        }
        self.showBsSingleDlg  = false;
      },

       inStates () {
        let self = this, states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every( (uuid) => {
          return states.some( (state) => {
            return self.dbData.image[uuid].state === state;
          })
        })
        return instate;
      }
    },
    watch: {
      'windowData.pageIndex': function (newVal, oldVal) {
        let self = this;
        if(newVal !== 'undefined' && newVal !== oldVal){
          self.queryList();
        }
      },
      'windowData.pageSize': function (newVal, oldVal) {
        let self = this;
        if(newVal !== 'undefined' && newVal !== oldVal){
          self.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
