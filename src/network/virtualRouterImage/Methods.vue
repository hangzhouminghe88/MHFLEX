<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  let uploadMap = {}

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.currTab === 'available') {
          conditionList.push('status!=Deleted')
        } else if (this.windowData.currTab === 'destroyed') {
          conditionList.push('status=Deleted')
        } else {
          conditionList.push('exportUrl!=null')
        }
        conditionList.push('system=true')
        // conditionList.push('format!=vmtx')
        conditionList.push(`backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      queryList: function () {
        // __printCallStack()
        // const self = this
        // let windowDataConditions = this.windowData.conditions ? this.windowData.conditions : []
        this.windowData.loading = true;
        return rpc.query(`images`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: ['system=true', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`].concat(windowDataConditions)
        }).then((resp) => {
            this.windowData.loading = false;
          if (this.windowData.currTab === 'available') {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              availableCount: resp.total
            })
          } else if (this.windowData.currTab === 'destroyed') {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              destroyedCount: resp.total
            })
          } else {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              exportedCount: resp.total
            })
          }
          let uuidList = []
          let table = {}
          if (resp.inventories.length === 0) {
            this.updateWindow({ uuidList, table })
            return
          }
          uuidList = resp.inventories.map((item) => item.uuid)
          let backupStorageUuidList = resp.inventories.map((item) => {
            if (item.backupStorageRefs && item.backupStorageRefs.length > 0) {
              return item.backupStorageRefs[0].backupStorageUuid
            }
          }).join()
          let resourceUuidList
          let accountInventories
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          return rpc.query(`backup-storage`, {
            q: 'uuid?=' + backupStorageUuidList
          })
            .then((resp) => {
              return this.updateDbTable({
                tableName: 'backupstorage',
                list: resp.inventories
              })
            })
            .then(() => {
              return rpc.query(`accounts/resources/refs`, {
                q: 'resourceUuid?=' + uuidList
              })
            })
            .then((resp) => {
              accountInventories = resp.inventories
              accountInventories.forEach((item) => {
                item.uuid = item.resourceUuid
              })
              resourceUuidList = [...new Set(resp.inventories.map((item) => item.accountUuid))].join()
              return rpc.query(`accounts`, {
                q: 'uuid?=' + resourceUuidList
              })
            })
            .then((resp) => {
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
            })
            .then(() => {
              this.updateDbTable({
                tableName: 'image',
                list: resp.inventories
              }).then(()=>{
                this.itemList = this.getData();
              })
              this.updateWindow({ uuidList, table })
            })
        })
      },
      uploadImage (param, msg, jobUuid) {
        const self = this
        let event = self.createEvent('virtualRouterImage.action.upload1', param.name)
        self.setJobUuid(jobUuid, 'Downloading', jobUuid)
        let refreshHandler = setTimeout(() => {
          //  whether create resource in Image page directly or not
          if (self.queryList) {
            self.queryList().then(() => {
              if (!self.interval) {
                self.queryResourceProgress()
              }
              if (!self.checkImageUploading) {
                self.checkUploadingStatus()
              }
            })
          }
        }, 2000)
        return rpc.create('images', msg, event, jobUuid).then(resp => {
          self.incEventSuccess(event)
          if (!_.isUndefined(param.localFile) && !_.isNull(param.localFile)) {
            let formData = new window.FormData()
            formData.append('upload-image', param.localFile)
            let xhr = new window.XMLHttpRequest()
            let imageUuid = resp.inventory.backupStorageRefs[0].imageUuid
            uploadMap[imageUuid] = xhr
            xhr.onreadystatechange = function () {
              if (xhr.readyState === window.XMLHttpRequest.DONE) {
                let failed = false
                let respObj = null
                if (xhr.status !== 200) {
                  failed = true
                } else {
                  if (!xhr.response) {
                    respObj = { success: true }
                  } else {
                    respObj = JSON.parse(JSON.parse(xhr.response))
                    if (!respObj.success) {
                      failed = true
                    }
                  }
                }
                if (failed) {
                  self.deleteJobUuid(jobUuid, jobUuid)
                  clearTimeout(refreshHandler)
                  let errorMsg = `http status: ${xhr.status}`
                  if (respObj && respObj.error) {
                    errorMsg = respObj.error
                  }
                  let event = self.createEvent('virtualRouterImage.action.upload2', param.name, undefined, errorMsg, 'NotApiCall')
                  self.setEventFail(event)
                  setTimeout(() => {
                    self.queryList()
                  }, 12 * 1000)
                }
              }
            }
            xhr.addEventListener('progress', (e) => { }, false)
            xhr.addEventListener('load', (e) => {
              delete uploadMap[imageUuid]
            }, false)
            xhr.addEventListener('error', (e) => {
              delete uploadMap[imageUuid]
            }, false)
            xhr.addEventListener('abort', (e) => {
              delete uploadMap[imageUuid]
            }, false)
            xhr.open('POST', `${Utils.getServerUrl()}/upload?size=${param.localFile.size}&uuid=${resp.inventory.backupStorageRefs[0].imageUuid}&url=${resp.inventory.backupStorageRefs[0].installPath}`, true)
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
            xhr.send(formData)
          }
          if (_.isUndefined(param.localFile) || _.isNull(param.localFile)) {
            self.deleteJobUuid(jobUuid, jobUuid)
            clearTimeout(refreshHandler)
          }
          //  whether create resource in Image page directly or not
          if (self.queryList) {
            self.queryList()
          }
        }, () => {
          self.deleteJobUuid(jobUuid, jobUuid)
          self.incEventFail(event)
        })
      },
      addImage (param, jobUuid) {
        const self = this
        let event = self.createEvent('virtualRouterImage.action.add', param.name, undefined, undefined, undefined, {tableName: 'image', resourceUuid: jobUuid, jobUuid})
        return rpc.create('longjobs', {
          jobName: 'APIAddImageMsg',
          jobData: JSON.stringify(param)
        }, event, jobUuid)
          .then(() => {
            self.longJobHandler(event, self)
            return self.triggerLongJobTask()
          }, () => {
            self.incEventFail(event)
            return self.longJobHandler(event, self)
          })
      },
      create: async function (param) {
        let self = this
        let jobUuid = self.genUniqueId()
        let msg = {
          name: param.name,
          description: param.description,
          url: param.url,
          platform: param.platform,
          system: param.system,
          mediaType: param.mediaType,
          format: param.format,
          backupStorageUuids: param.backupStorageUuids,
          resourceUuid: jobUuid,
          systemTags: []
        }
        if (self.dbData.backupstorage[param.backupStorageUuids[0]].type === 'VCenter') {
          msg.format = 'vmtx'
          msg.mediaType = 'RootVolumeTemplate'
          if (param.systemTags) msg.systemTags.push(param.systemTags)
        }
        if (!_.isUndefined(param.localFile) && !_.isNull(param.localFile)) {
          return await  self.uploadImage(param, msg, jobUuid)
        } else {
          return await  self.addImage(msg, jobUuid).then(() => {
            if(self.queryList) {
              self.queryList()
            }
          })
        }
      },
      isUploading (uuid) {
        let image = this.dbData.image[uuid]
        let reg = /^upload:\/\/.*/
        return image && reg.test(image.url)
      },
      initAssisstantForUploadImage () {
        let self = this
        let uuidList = self.windowData.uuidList
        if (!uuidList) return
        let ListinDownloading = uuidList.filter(uuid => ['Downloading', 'Creating'].indexOf(self.dbData.image[uuid].status) > -1)
        let hasImageUploading = ListinDownloading.some(uuid => self.isUploading(uuid))
        let newAssisatant = () => {
          let id = `assistant-${self.genUniqueId()}`
          self.createAssistant({
            id,
            title: 'tips',
            hide: false,
            ownerId: self.windowData.id,
            operation: 'noResource',
            handler: null,
            content: 'uploadingImage'
          })
        }
        if (hasImageUploading) newAssisatant()
        else {
          self.deleteCurrAssistant(self.windowData.id)
          clearInterval(self.checkImageUploading)
          self.checkImageUploading = null
        }
      },
      checkUploadingStatus () {
        this.checkImageUploading = setInterval(() => { return this.initAssisstantForUploadImage() }, 4000)
      },
      queryResourceProgress () {
        this.interval = setInterval(() => {
           if(typeof (this.queryAllProgresses('imageProgress', ['Downloading', 'Creating'], 'status') && this.queryAllProgresses('imageProgress', ['Downloading', 'Creating'], 'status').then) === 'function') {
             return this.queryAllProgresses('imageProgress', ['Creating', 'Downloading'], 'status')
               .then(() => {
                 this.queryList();
               })
           }else {
             return
           }
        }, 4000)
      },
      delete: function (uuidList) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.delete', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`images/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateCount()
              }, () => self.incEventFail(event))
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      enable: function (uuidList, fn) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.enable', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('images', uuid, {
              'changeImageState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
                if(fn) fn();
              }, () => self.incEventFail(event))
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      disable: function (uuidList, fn) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.disable', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('images', uuid, {
              'changeImageState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
                if(fn) fn();
              }, () => self.incEventFail(event))
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      recover: function (uuidList) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.recover', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('images', uuid, {
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
                self.incEventSuccess(event)
                self.updateCount()
              }, () => self.incEventFail(event))
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      expunge: function (uuidList) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.expunge', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let image = _.cloneDeep(self.dbData.image[uuid])
            p = rpc.put(`images/${uuid}/actions`, {
              'expungeImage': {
                'backupStorageUuids': [`${image.backupStorageRefs[0].backupStorageUuid}`]
              }
            }, event)
              .then((resp) => {
                let imageUuidList = _.cloneDeep(self.windowData.uuidList)
                let newUuidList = imageUuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.incEventSuccess(event)
                self.updateCount()
              }, () => self.incEventFail(event))
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      deleteExportImage: function (uuidList) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.exportdelete', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            imageInventory.state = 'Destroying'
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: imageInventory
            })
            p = rpc._delete(`backup-storage/${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}/exported-images/${uuid}`, null, event)
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
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      changeResourceOwner: function (uuidList, accountUuid) {
        const self = this
        let task = []
        let p = null
        let event = self.createEvent('virtualRouterImage.action.changeOwner', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.create(`account/${accountUuid}/resources`, {
              'resourceUuid': uuid
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            task.push(p)
          })(uuid)
        })
        return Promise.all(task)
      },
      downloadVirtualRouterImage: function (url) {
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
          this.downloadVirtualRouterImage(this.dbData.image[uuid].exportUrl)
        })
      },
      shareImage: function (uuid, accountUuid) {
        const self = this
        let event = self.createEvent('virtualRouterImage.action.share', self.dbData.image[uuid].name)
        rpc.create(`accounts/resources`, {
          'resourceUuids': uuid,
          'accountUuids': accountUuid
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
        rpc.query('images', {
          replyWithCount: true,
          q: [this.conditions.available, 'system=true', 'format!=vmtx', `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`]
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
        rpc.query('images', {
          replyWithCount: true,
          q: [this.conditions.destroyed, 'system=true', 'format!=vmtx', `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`]
        })
          .then((resp) => {
            this.updateWindow({
              destroyedCount: resp.total
            })
          })
        rpc.query('images', {
          count: true,
          q: ['exportUrl+not+null', 'system=true', 'format!=vmtx', `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`]
        })
          .then((resp) => {
            this.updateWindow({ exportedCount: resp.total })
          })
      },
      ...Utils
    }
  }
</script>
