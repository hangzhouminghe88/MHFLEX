<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import Controller from './Controller'

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push('type=UserVm')
        if (this.selectVal !=='' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
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
      getMaxInstancePerHost: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.systemtags[self.dbData.instanceOffering[uuid].maxInstancePerHostUuid].maxInstancePerHost
        } catch (e) {
          if (self.checkBounce(`getMaxInstancePerHost-${uuid}`)) return ''
          value = ''
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=InstanceOfferingVO', 'tag~=maxInstancePerHost::%25']
          })
            .then((resp) => {
              let instanceOffering = _.cloneDeep(self.dbData.instanceOffering[uuid])
              if (resp.inventories.length > 0) {
                instanceOffering.maxInstancePerHostUuid = resp.inventories[0].uuid
                self.updateDbRow({
                  tableName: 'systemtags',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                }).then(() => {
                  self.updateDbRow({
                    tableName: 'instanceOffering',
                    id: uuid,
                    data: instanceOffering
                  })
                })
              } else {
                return ''
              }
            }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      addSystemTags: function (list, value) {
        return Controller.addSystemTags(list, value, this)
      },
      pushVolumeToSystemTags: function (list, value) {
        return Controller.pushVolumeToSystemTags(list, value, this)
      },
      create: function (param) {
        return Controller.create(param, this)
//      let event = this.createEvent('instanceOffering.action.create', param.name)
//      let msg = {
//        name: param.name,
//        description: param.description,
//        cpuNum: param.cpuNum,
//        memorySize: param.memorySize
//      }
//      msg.systemTags = []
//      if (param.volumeTotalBandwidth !== '') msg.systemTags.push(`volumeTotalBandwidth::${param.volumeTotalBandwidth}`)
//      if (param.networkInboundBandwidth !== '') msg.systemTags.push(`networkInboundBandwidth::${param.networkInboundBandwidth}`)
//      if (param.networkOutboundBandwidth !== '') msg.systemTags.push(`networkOutboundBandwidth::${param.networkOutboundBandwidth}`)
//      let resp
//      try {
//        resp = await rpc.create('instance-offerings', msg, event)
//        this.incEventSuccess(event)
//      } catch (e) {
//        this.incEventFail(event)
//      }
//      // if (param.volumeTotalBandwidth !== '') {
//      //   let body = {
//      //     'resourceType': 'InstanceOfferingVO',
//      //     'resourceUuid': resp.inventory.uuid,
//      //     'tag': 'volumeTotalBandwidth::' + param.volumeTotalBandwidth
//      //   }
//      //   rpc.create('system-tags', body)
//      // }
//      // if (param.networkInboundBandwidth !== '') {
//      //   let body = {
//      //     'resourceType': 'InstanceOfferingVO',
//      //     'resourceUuid': resp.inventory.uuid,
//      //     'tag': 'networkInboundBandwidth::' + param.networkInboundBandwidth
//      //   }
//      //   rpc.create('system-tags', body)
//      // }
//      // if (param.networkOutboundBandwidth !== '') {
//      //   let body = {
//      //     'resourceType': 'InstanceOfferingVO',
//      //     'resourceUuid': resp.inventory.uuid,
//      //     'tag': 'networkOutboundBandwidth::' + param.networkOutboundBandwidth
//      //   }
//      //   rpc.create('system-tags', body)
//      // }
//      //  whether create resource in InstanceOffering page directly or not
//      if (this.windowData.uuidList) {
//        let uuidList = this.windowData.uuidList.slice()
//        uuidList.unshift(resp.inventory.uuid)
//        let row = {}
//        row[resp.inventory.uuid] = {}
//        row[resp.inventory.uuid].selected = false
//        let table = Object.assign({}, { ...this.windowData.table }, row)
//        this.updateWindow({ uuidList, table })
//      }
//      let obj = {toPublic: false}
//      this.updateDbRow({
//        tableName: 'instanceOffering',
//        id: resp.inventory.uuid,
//        data: {
//          ...resp.inventory,
//          ...obj
//        }
//      })
//      // updateCount only been invoked when creating Resource in List Page
//      if (this.queryList) {
//        this.queryList()
//      }
      },
      delete: function (uuidList) {
        const self = this
        let event = this.createEvent('instanceOffering.destory', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let instanceOfferingInventory = _.cloneDeep(self.dbData.instanceOffering[uuid])
            instanceOfferingInventory.state = 'Destroying'
            self.updateDbRow({
              tableName: 'instanceOffering',
              id: uuid,
              data: instanceOfferingInventory
            })
            rpc._delete(`instance-offerings/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.deleteDbRow({
                  tableName: 'instanceOffering',
                  id: uuid
                })
                self.updateCount()
              }, () => {
                self.incEventFail(event)
                // self.updateDbTable({
                //   tableName: 'vm',
                //   list: [resp.inventory]
                // })
              })
          })(uuid)
        })
      },
      updateAllocatorStrategy: function (uuid, value) {
        const self = this
        let obj = {}
        obj['updateInstanceOffering'] = {}
        obj['updateInstanceOffering']['allocatorStrategy'] = value
        let event = self.createEvent('common.updateInfoallocatorStrategy')
        return rpc.update('instance-offerings', uuid, obj, event)
          .then((resp) => {
            self.incEventSuccess(event)
            return self.updateDbRow({
              tableName: 'instanceOffering',
              id: uuid,
              data: resp.inventory
            })
          }, () => self.incEventFail(event))
      },
      start: function (uuidList) {
        const self = this
        return this.dispatchActionWithEvent('instanceOffering/enable', uuidList)
          .then(() => {
            return this.dispatchAction('instanceOffering/query', { q: `uuid?=${uuidList.join(',')}` })
          })
      },
      stop: function (uuidList) {
        const self = this
        // let event = self.createEvent('instanceOffering.disableState', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        // let tasks = []
        // let p
        return this.dispatchActionWithEvent('instanceOffering/disable', uuidList)
          .then(() => {
            return this.dispatchAction('instanceOffering/query', { q: `uuid?=${uuidList.join(',')}` })
          })
        // uuidList.forEach(uuid => {
        //   let instanceOfferingInventory = _.cloneDeep(self.dbData.instanceOffering[uuid])
        //   self.updateDbRow({
        //     tableName: 'instanceOffering',
        //     id: uuid,
        //     data: {
        //       state: 'Stopping'
        //     }
        //   })
        //   p = rpc.update('instance-offerings', uuid, {
        //     'changeInstanceOfferingState': {
        //       'stateEvent': 'disable'
        //     }
        //   }, event)
        //     .then((resp) => {
        //       self.incEventSuccess(event)
        //       self.updateDbRow({
        //         tableName: 'instanceOffering',
        //         id: uuid,
        //         data: {
        //           ...resp.inventory,
        //           toPublic: instanceOfferingInventory.toPublic
        //         }
        //       })
        //     }, () => {
        //       self.incEventFail(event)
        //       self.updateDbRow({
        //         tableName: 'instanceOffering',
        //         id: uuid,
        //         data: instanceOfferingInventory
        //       })
        //     })
        //   tasks.push(p)
        // })
        // return Promise.all(tasks)
      },
      recover: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.action.recover', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('instance-offerings', uuid, {
              'RecoverVolume': {}
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'instanceOffering',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      shareInstanceOffering: function (uuidList, accountUuid) {
        let event = this.createEvent('instanceOffering.action.share', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        const self = this
        rpc.update('accounts', 'resources', {
          'shareResource': {
            'resourceUuids': uuidList,
            'accountUuids': accountUuid,
            'toPublic': false
          }
        }, event)
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
          let data = _.cloneDeep(this.dbData.instanceOffering[uuid])
          if (data.toPublic !== undefined) data.toPublic = !data.toPublic
          self.updateDbRow({
            tableName: 'instanceOffering',
            id: uuid,
            data: data
          })
        })
      },
      shareInstanceOfferingToAll: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.action.shareToAll', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '')
        return rpc.update('accounts', 'resources', {
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
      recallInstanceOffering: function (uuid, accountUuid) {
        let self = this
        let event = this.createEvent('instanceOffering.action.recall', this.dbData.instanceOffering[uuid].name)
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
        let event = this.createEvent('instanceOffering.action.recallFromAll', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '')
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
      updateCount: function () {
        rpc.query('instance-offerings', {
          replyWithCount: true,
          q: 'type=UserVm'
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      ...Utils
    }
  }
</script>
