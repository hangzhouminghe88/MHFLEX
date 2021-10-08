<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      create: async function (param) {
        let event = this.createEvent('instanceOffering.action.vrcreate', param.name)
        let resp
        try {
          resp = await rpc.create('instance-offerings/virtual-routers', param, event)
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
          return
        }
        let uuidList = []
        let table = {}
        if (this.windowData.uuidList) {
          uuidList = this.windowData.uuidList.slice()
          uuidList.unshift(resp.inventory.uuid)
        }
        let row = {}
        row[resp.inventory.uuid] = {}
        row[resp.inventory.uuid].selected = false
        table = Object.assign({}, { ...this.windowData.table }, row)
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'instanceOffering',
          list: [resp.inventory]
        })
        if (this.queryList) this.queryList()
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      updateCount: function () {
        rpc.query('instance-offerings/virtual-routers', {
          count: true,
          q: this.getCondition()
        }).then((resp) => {
          this.updateWindow({
            availableCount: resp.total
          })
        })
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
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.vrdestory', uuidList.length === 1 ? self.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc._delete(`instance-offerings/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateCount()
              }, () => self.incEventFail(event))
          })(uuid)
        })
      },
      start: function (uuidList) {
        const self = this
        let event = self.createEvent('virtualRouterOffering.enableState', uuidList.length === 1 ? self.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('instance-offerings', uuid, {
              'changeInstanceOfferingState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'instanceOffering',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(uuid)
        })
      },
      stop: function (uuidList) {
        const self = this
        let event = self.createEvent('virtualRouterOffering.disableState', uuidList.length === 1 ? self.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('instance-offerings', uuid, {
              'changeInstanceOfferingState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'instanceOffering',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(uuid)
        })
      },
      recover: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.action.recover', uuidList.length === 1 ? self.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
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
              }, () => self.incEventFail(event))
          })(uuid)
        })
      },
      shareInstanceOffering: function (uuid, accountUuid) {
        const self = this
        let event = self.createEvent('instanceOffering.action.share', self.dbData.instanceOffering[uuid].name)
        rpc.create(`accounts/resources`, {
          'resourceUuids': uuid,
          'accountUuids': accountUuid
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'instanceOffering',
              id: uuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
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
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('instanceOffering.action.vrrecallFromAll', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': uuidList,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            self.setEventSuccess(event)
            this.toggleToPublic(uuidList)
          }, () => {
            self.setEventFail(event)
          })
      },
      isVCenterVirtualRouterOffering: function (uuid) {
        let value
        let self = this
        let virtualRouterOffering = _.cloneDeep(self.dbData.instanceOffering[uuid])
        if(!virtualRouterOffering) return;
        try {
          value = self.dbData.instanceOffering[uuid].isVCenterVirtualRouterOffering
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getEcsInstanceNum-${uuid}`)) return false
          value = false
          rpc.query('images', {
            q: `uuid=${virtualRouterOffering.imageUuid}`,
            fields: 'format'
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                if (resp.inventories[0].format === 'vmtx') {
                  virtualRouterOffering.isVCenterVirtualRouterOffering = true
                } else {
                  virtualRouterOffering.isVCenterVirtualRouterOffering = false
                }
              } else {
                virtualRouterOffering.isVCenterVirtualRouterOffering = false
              }
              return self.updateDbRow({
                tableName: 'instanceOffering',
                id: uuid,
                data: virtualRouterOffering
              })
            })
            .then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      shareInstanceOfferingToAll: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.action.vrshareToAll', uuidList.length === 1 ? this.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        return rpc.update('accounts', 'resources', {
          'shareResource': {
            'resourceUuids': uuidList,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            self.setEventSuccess(event)
            this.toggleToPublic(uuidList)
          }, () => {
            self.setEventFail(event)
          })
      },
      ...Utils
    }
  }
</script>

