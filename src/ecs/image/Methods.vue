<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  /* global localStorage:false */
  let uploadMap = {}

  export default {
    methods: {
      ...Utils,
      isUploading (uuid) {
        let image = this.dbData.image[uuid]
        let reg = /^upload:\/\/.*/
        return image && reg.test(image.url)
      },
      initAssisstantForUploadImage () {
        let self = this
        let uuidList = self.windowData.uuidList
        if (!uuidList) return

        let ListinDownloading = []
          ListinDownloading= uuidList.filter(uuid => {
            if(self.dbData.image[uuid].status)
            return ['Downloading', 'Creating'].indexOf(self.dbData.image[uuid].status) > -1
          })
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
        let self = this;
        self.interval = setInterval(() => {
          if(typeof (self.queryAllProgresses('imageProgress', ['Downloading', 'Creating'], 'status') && self.queryAllProgresses('imageProgress', ['Downloading', 'Creating'], 'status').then) === 'function') {
            return self.queryAllProgresses('imageProgress', ['Creating', 'Downloading'], 'status')
              .then(() => {
                self.queryList();
              })
          }else {
            return
          }
        }, 4000)
      },
      canMigrate: function (uuid) {
        return this.dbData.imageMigrate[uuid] && this.dbData.imageMigrate[uuid].canMigrate
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
      uploadImage (param, msg, jobUuid) {
        const self = this
        let event = self.createEvent('image.action.upload1', param.name)
        self.setJobUuid(jobUuid, 'Downloading', jobUuid)
        let refreshHandler = setTimeout(() => {
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
                  let event = self.createEvent('image.action.upload2', param.name, undefined, errorMsg, 'NotApiCall')
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
        let event = self.createEvent('image.action.add', param.name, undefined, undefined, undefined, {tableName: 'image', resourceUuid: jobUuid, jobUuid})
        return rpc.create('longjobs', {
          jobName: 'APIAddImageMsg',
          jobData: JSON.stringify(param)
        }, event, jobUuid)
          .then(() => {
            return self.triggerLongJobTask()
          }).catch(() => {
              self.incEventFail(event);
              return self.longJobHandler(event, self);
          })
      },
      create: async function (param) {
        const self = this
        let jobUuid = self.genUniqueId()
        let msg = {
          name: param.name,
          description: param.description,
          url: param.url,
          platform: param.platform,
          mediaType: param.mediaType,
          format: param.format,
          system: false,
          backupStorageUuids: param.backupStorageUuids,
          systemTags: [],
          resourceUuid: jobUuid
        }
        if (param.platform) msg.platform = param.platform
        if (param.Qemu) msg.systemTags.push('qemuga')
        if (param.bootMode) msg.systemTags.push(`bootMode::${param.bootMode}`)
        if (param.systemTags) msg.systemTags.push(param.systemTags)
        if (!_.isUndefined(param.localFile) && !_.isNull(param.localFile)) {
          return await self.uploadImage(param, msg, jobUuid)
        } else {
          return await self.addImage(msg, jobUuid).then(() => {
            if(self.queryList) self.queryList()
          })
        }
      },
      deleteExportImage: function (uuidList) {
        const self = this
        let event = self.createEvent('image.action.exportdelete', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length),
          tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let imageInventory = _.cloneDeep(self.dbData.image[uuid])
            imageInventory.state = 'Destroying'
            self.updateDbRow({
              tableName: 'image',
              id: uuid,
              data: imageInventory
            })
           p =  rpc._delete(`backup-storage/${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}/exported-images/${uuid}`, null, event)
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
      delete: function (uuidList) {
        const self = this
        let tasks = []
        let p = null
        let event = self.createEvent('image.action.delete', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(uuid => {
          let imageInventory = _.cloneDeep(self.dbData.image[uuid])
          imageInventory.state = 'Destroying'
          self.updateDbRow({
            tableName: 'image',
            id: uuid,
            data: imageInventory
          })
          let xhr = uploadMap[uuid]
          if (xhr) {
            xhr.abort()
          }
          p = rpc._delete(`images/${uuid}`, null, event).then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      start: function (uuidList) {
        let self = this, p= null, tasks = [];
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
           p = rpc.update('images', uuid, {
              'changeImageState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                return self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: resp.inventory
                }).then(() =>{
                  self.$forceUpdate();
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      stop: function (uuidList) {
        let  self = this, p = null, tasks = [];
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
            p = rpc.update('images', uuid, {
              'changeImageState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                return self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: resp.inventory
                }).then(() =>{
                  self.$forceUpdate();
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      downloadImageFile: function (url) {
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
          this.downloadImageFile(this.dbData.image[uuid].exportUrl)
        })
      },
      recover: function (uuidList) {
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
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      expunge: function (uuidList) {
        const self = this
        let event = self.createEvent('image.action.expunge', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length),
          tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('images', uuid, {
              'expungeImage': {
                'backupStorageUuids': [`${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}`]
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
                self.deleteDbRow({
                  tableName: 'image',
                  id: uuid
                })
                self.updateCount()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.unshift(p);
          })(uuid)
        })
        return Promise.all(tasks)
      },
      changeResourceOwner: async function (uuidList, accountUuid) {
        const self = this
        uuidList = await self.uniqCurrentAccountResources(uuidList, accountUuid)
        let event = self.createEvent('image.action.changeOwner', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.create(`account/${accountUuid}/resources`, {
              'resourceUuid': uuid
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'image',
                  id: uuid,
                  data: {
                    accountUuid: resp.inventory.accountUuid
                  }
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(uuid)
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
        let searchConditionList = []
        if(this.selectVal !== '' && this.searchStr !== '') {
          searchConditionList = searchConditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        let zoneUuid = `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`
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

        preStep
          .then(() => {
            if (this.dbData.common.isAdmin) {
              rpc.query('images', {
                replyWithCount: true,
                q: ['status!=Deleted', 'system=false', 'format!=vmtx', '__systemTag__!=remote', zoneUuid].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    availableCount: resp.total
                  })
                })

              rpc.query('images', {
                replyWithCount: true,
                q: ['status=Deleted', 'system=false', 'format!=vmtx', '__systemTag__!=remote', zoneUuid].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    destroyedCount: resp.total
                  })
                })

              rpc.query('images', {
                replyWithCount: true,
                q: ['exportUrl+not+null', 'system=false', 'format!=vmtx', '__systemTag__!=remote', zoneUuid].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    exportedCount: resp.total
                  })
                })
            } else {
              rpc.query('images', {
                replyWithCount: true,
                q: ['status!=Deleted', 'system=false', 'format!=vmtx', '__systemTag__!=remote', `uuid?=${myImageUuidList.join(',')}`, zoneUuid].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    mineCount: resp.total
                  })
                })

              rpc.query('images', {
                replyWithCount: true,
                q: ['status!=Deleted', 'system=false', 'format!=vmtx', '__systemTag__!=remote', `uuid!?=${myImageUuidList.join(',')}`, zoneUuid].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    shareCount: resp.total
                  })
                })
            }

            rpc.query('images', {
              replyWithCount: true,
              q: ['status=Deleted', 'system=false', 'format!=vmtx', '__systemTag__!=remote', zoneUuid].concat(searchConditionList)
            })
              .then((resp) => {
                this.updateWindow({
                  destroyedCount: resp.total
                })
              })
            rpc.query('images', {
              replyWithCount: true,
              q: ['exportUrl+not+null', 'system=false', 'format!=vmtx', '__systemTag__!=remote', zoneUuid].concat(searchConditionList)
            })
              .then((resp) => {
                this.updateWindow({
                  exportedCount: resp.total
                })
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
      toggleToPublic: function (uuidList) {
        if (Array.isArray(uuidList) && uuidList.length === 0) return
        let self = this
        uuidList.forEach((uuid) => {
          let data = _.cloneDeep(this.dbData.image[uuid])
          if (data.toPublic !== undefined) data.toPublic = !data.toPublic
          self.updateDbRow({
            tableName: 'image',
            id: uuid,
            data: data
          })
        })
      },
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('image.action.recallFromAll', uuidList.length === 1 ? this.dbData.image[uuidList[0]].name : '', uuidList.length)
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': uuidList,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            this.toggleToPublic(uuidList)
          }, () => {
            self.incEventFail(event)
          })
      },
      shareToAll: function (uuidList) {
        let self = this
        let event = this.createEvent('image.action.shareToAll', uuidList.length === 1 ? this.dbData.image[uuidList[0]].name : '', uuidList.length)
        return rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': uuidList,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            this.toggleToPublic(uuidList)
          }, () => {
            self.incEventFail(event)
          })
      },
      getAccountName: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.account[self.dbData.image[uuid].accountUuid].name
        } catch (e) {
          if (self.checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query(`resources/accounts?resourceUuids=${uuid}`)
            .then((accountRefResp) => {
              if (JSON.stringify(accountRefResp.inventories) === '{}' || !accountRefResp.inventories) return
              self.dbData.image[uuid].accountUuid = accountRefResp.inventories[uuid].uuid
              return self.updateDbRow({
                tableName: 'account',
                id: accountRefResp.inventories[uuid].uuid,
                data: accountRefResp.inventories[uuid]
              })
            }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      getResourceOwner: function (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.resourceOwner[uuid].name
          if (self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid] && self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName) {
            value = self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName
          }
        } catch (e) {
        }
        return value
      },
      canDelete: async function (uuid) {
        if (this.dbData.common.isAdmin) return true
        let accountName = await this.getAccountName(uuid)
        return accountName === localStorage.getItem('accountName')
      },
      queryBackupStatus: function () {
        const self = this
        let query = () => {
          rpc.query('backup-storage', {
            q: ['__systemTag__!=remote']
          }).then((resp) => {
            let backupStorageUuidList = resp.inventories.map((item) => item.uuid)
            backupStorageUuidList.forEach(uuid => {
              rpc.query('system-tags', {
                q: `resourceUuid=${uuid}`
              }).then((resp) => {
                if (resp.inventories.every(it => it.tag.indexOf('image::') < 0)) return
                let imageList = []
                let dstList = []
                resp
                  .inventories
                  .filter(it => it.tag.indexOf('image::') > -1)
                  .forEach(it => {
                    let info = it.tag.split('::')
                    imageList.push({
                      uuid: info[1],
                      status: info[7]
                    })
                    dstList.push({
                      uuid: info[5],
                      status: info[7]
                    })
                  })
                imageList = _.uniq(imageList)
                  .filter(it => !!self.dbData.image[it.uuid] && !(self.dbData.imageSystemTag[it.uuid] && self.dbData.imageSystemTag[it.uuid].tag === 'remote'))
                  .forEach(it => {
                    let imageData = _.cloneDeep(self.dbData.image[it.uuid])
                    if (it.status === 'success' || it.status === 'fail') {
                      self.updateDbRow({
                        tableName: 'image',
                        id: it.uuid,
                        data: {
                          ...imageData,
                          status: 'Ready'
                        }
                      })
                      return
                    } else {
                      imageData.status = 'backup-running'
                      self.updateDbRow({
                        tableName: 'image',
                        id: it.uuid,
                        data: imageData
                      })
                    }
                  })
                dstList = _.uniq(dstList)
                  .filter(it => !!self.dbData.image[it.uuid] && !(self.dbData.imageSystemTag[it.uuid] && self.dbData.imageSystemTag[it.uuid].tag === 'remote'))
                  .forEach(it => {
                    let dstData = _.cloneDeep(self.dbData.image[it.uuid])
                    if (it.status === 'success' || it.status === 'fail') {
                      self.updateDbRow({
                        tableName: 'image',
                        id: it.uuid,
                        data: {
                          ...dstData,
                          status: 'Ready'
                        }
                      })
                      return
                    } else {
                      dstData.status = `recovery-running`
                      self.updateDbRow({
                        tableName: 'image',
                        id: it.uuid,
                        data: dstData
                      })
                    }
                  })
              })
            })
          })
        }
        query()
      },
      backup: function (uuidList, param) {
        const self = this
        let event = self.createEvent('hybridBackup.action.syncImage', uuidList.length === 1 ? self.dbData.image[uuidList[0]].name : '', uuidList.length)
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
            let srcBackupStorageUuid = self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid
            let p = rpc.put(`images/${uuid}/actions`, {
              syncImageFromImageStoreBackupStorage: {
                name: param.name,
                description: param.description,
                srcBackupStorageUuid,
                dstBackupStorageUuid: param.backupStorageUuids[0]
              }
            }, event).then((resp) => {
              self.incEventSuccess(event)
              self.updateDbRow({
                tableName: 'image',
                id: resp.inventory.uuid,
                data: resp.inventory
              })
            }, () => {
              self.incEventFail(event)
              // if (self.dbData.backupstorage[srcBackupStorageUuid].imageStatusEnd && self.dbData.backupstorage[srcBackupStorageUuid].imageStatusTimer) {
              //   clearInterval(self.dbData.backupstorage[srcBackupStorageUuid].imageStatusTimer)
              //   self.queryList()
              //   return
              // }
            })
            tasks.push(p)
            // self.queryBackupStatus(srcBackupStorageUuid)
          })(uuid)
        })
        return Promise.all(tasks).then(() => {
          setTimeout(() => self.deleteAssistant(id), 3000)
        })
      },
      pageCanDelete() {
        let candelete = false, self = this;
        let uuidList = []

        uuidList = self.selectedList;
        if (uuidList.length === 0) return
        uuidList.forEach((uuid) => {
          if (this.canDelete(uuid)) {
            candelete = true
          }
        })
        return candelete
      },
      canExport () {
        let self = this

        if (!self.isSingleSelected) return false
        let uuid = self.selectedList[0]

        let image = self.dbData.image[uuid]
        if (!image) return false
        let backupStorage = image.backupStorageRefs && self.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid]
        return backupStorage && backupStorage.type === 'ImageStoreBackupStorage' && image.status === 'Ready' && !image.exportUrl
      },
      //恢复镜像
      pageRecover: function () {
        const self = this;
        let uuidList = self.selectedList;
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: "volume.recover",
            description: "volume.info.recoverConfirm",
            icon: 'volume_popupico',
            getName: (uuid) => {
              return self.dbData.image[uuid].name
            },
            uuidList,
            ok: () => {
              self.recover(uuidList)
            }
          })
        }
      },
      expungeImage() {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          return this.openDialog('ConfirmDlg', {
            title: 'common.expungeImage',
            description: 'image.info.expungeConfirm',
            uuidList: uuidList,
            icon: 'image_popupico',
            getName: (uuid) => {
              return this.dbData.image[uuid].name
            },
            ok: () => {
              self.expunge(uuidList).then(() => self.queryList());
            }
          })
        }
      },
      //下载镜像
      pageDownload: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) this.download(uuidList)
      },
      exportImage () {
        if (!this.isSingleSelected) return
        let event = this.createEvent('image.action.export', this.dbData.image[this.selectedList[0]].name)
        let self = this
        let selectedUuidList = self.selectedList
        rpc.put(`backup-storage/${this.dbData.image[selectedUuidList[0]].backupStorageRefs[0].backupStorageUuid}/actions`, {
          exportImageFromBackupStorage: {
            imageUuid: selectedUuidList[0]
          }
        }, event)
          .then((resp) => {
            let image = _.cloneDeep(this.dbData.image[selectedUuidList[0]])
            image.exportUrl = resp.imageUrl
            self.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'image',
              id: selectedUuidList[0],
              data: image
            })
            this.updateCount()
          }, () => {
            self.incEventFail(event)
          })
      },
      hasSharedToAll: function () {
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      hasNotSharedToAll: function () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      getSharedToAllList: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => this.dbData.image[uuid].toPublic)
          return list
        }
        return []
      },
      getNotSharedToAllList: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !this.dbData.image[uuid].toPublic)
          return list
        }
        return []
      },
      pageShareImageToAll: function () {
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('ShareToAllConfirm', {
            ok: () => {
              this.shareToAll(uuidList)
            }
          })
        }
      },
      pageRecallImageFromAll: function () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('RevokeAllConfirm', {
            ok: () => {
              this.recallFromAll(uuidList)
            }
          })
        }
      },
      // pageChangeResourceOwner: async function () {
      //   let self = this
      //   if (this.windowData.dialogList.length > 0) {
      //     await this.windowData.dialogList.forEach((it) => {
      //       self.closeDialog(it)
      //     })
      //     self.updateWindow({
      //       dialogList: []
      //     })
      //   }
      //   let uuidList = []
      //   this.windowData.uuidList.forEach((uuid) => {
      //     if (this.windowData.table[uuid].selected) uuidList.push(uuid)
      //   })
      //   if (uuidList.length === 1) {
      //     this.openSideWindow('AccountListDlg', {
      //       uuid: this.dbData.image[uuidList[0]].accountUuid,
      //       select: (uuid) => this.changeResourceOwner(uuidList, uuid)
      //     })
      //   } else if (uuidList.length > 1) {
      //     let accountUuid = ''
      //     if (uuidList.every((uuid) => self.dbData.image[uuid].accountUuid === self.dbData.image[uuidList[0]].accountUuid)) accountUuid = self.dbData.image[uuidList[0]].accountUuid
      //     this.openSideWindow('AccountListDlg', {
      //       uuid: accountUuid,
      //       select: (uuid) => {
      //         let list = []
      //         uuidList.forEach((item) => {
      //           if (self.dbData.image[item].accountUuid !== uuid[0]) list.push(item)
      //         })
      //         if (list.length === 0) return
      //         this.changeResourceOwner(list, uuid)
      //       }
      //     })
      //   }
      // },
      pageDelete: function () {
        let uuidList = []
        const self = this
        self.selectedList.forEach((uuid) => {
          if (self.canDelete(uuid)) uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          return self.openDialog('ConfirmDlg', {
            title: 'image.deleteImage',
            description: 'image.info.deleteConfirm',
            getName: (uuid) => {
              return self.dbData.image[uuid].name;
            },
            icon: 'image_popupico',
            uuidList,
            ok: () => {
              return self.delete(uuidList).then(() => {
                self.queryList()
              })
            }
          })
        }
      },
      pageBackup: function (uuidList) {
        const self = this
        self.openFullMainWindow('CreateHybridBackupDlg', {
          ok: (param) => self.backup(uuidList, param)
        })
      },
      storageMigrateImage: function (backupStorageUuid, imageUuid, srcBackupStorageUuid) {
        let self = this
        let jobUuid = this.genUniqueId()
        let event = self.createEvent('image.action.storageMigrateImage', self.dbData.image[imageUuid].name, undefined, undefined, undefined, {tableName: 'image', resourceUuid: imageUuid, jobUuid})
        self.updateDbRow({
          tableName: 'image',
          id: imageUuid,
          data: {
            status: 'Migrating'
          }
        })
        return rpc.create('longjobs', {
          jobName: 'APIBackupStorageMigrateImageMsg',
          jobData: JSON.stringify({
            imageUuid,
            srcBackupStorageUuid,
            'dstBackupStorageUuid': backupStorageUuid
          })
        }, event, jobUuid)
          .then(() => {
            return self.triggerLongJobTask()
          }, () => {
            self.incEventFail(event)
            return self.longJobHandler(event, self)
          })
      },
      getData(){
        let self = this;
        if (!_.isArray(self.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        self.windowData.uuidList = self.windowData.uuidList.filter(uuid => self.dbData.image[uuid])
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.image[uuid]
        })
      }
    }
  }
</script>

