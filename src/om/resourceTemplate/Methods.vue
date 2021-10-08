<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import ResourceStackMethods from 'src/om/resourceStack/Methods'

  export default {
    methods: {
      ...{
        createResourceStack: ResourceStackMethods.methods.create
      },
      isEnabled: function (uuid) {
        if (!this.dbData.resourceStackTemplate[uuid]) return false
        return this.dbData.resourceStackTemplate[uuid].state
      },
      delete (uuidList, fn) {
        const self = this
        let event = self.createEvent('resourcestacktemplate.action.delete', uuidList.length === 1 ? self.dbData.resourceStackTemplate[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`cloudformation/template/${uuid}`, null, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      create: function (param) {
        const self = this
        let event = self.createEvent('resourcestacktemplate.action.create', param.name)
        return rpc.create('cloudformation/template', param, event).then(resp => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
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
      changeTemplateState: function (uuidList, state) {
        const self = this
        if (!Array.isArray(uuidList)) {
          uuidList = [uuidList]
        }
        let event = self.createEvent(`resourcestacktemplate.action.${state}`, uuidList.length === 1 ? this.dbData.resourceStackTemplate[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('cloudformation/template', uuid, {
              'updateStackTemplate': {
                state: state
              }
            }, event)
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
      updateTemplateContent: function (templateUuid, templateContent, fn) {
        let self = this
        if (templateContent === self.dbData.resourceStackTemplate[templateUuid].content) return
        let event = self.createEvent('resourcestacktemplate.action.modify', self.dbData.resourceStackTemplate[templateUuid].name)
        return rpc.update('cloudformation/template', templateUuid, {
          'updateStackTemplate': {
            templateContent: templateContent
          }
        }, event).then((resp) => {
          if (fn) fn(templateUuid)
          self.incEventSuccess(event)
          return this.updateDbRow({
            tableName: 'resourceStackTemplate',
            id: templateUuid,
            data: resp.inventory
          })
        }, () => self.incEventFail(event))
      },
      updateCount: function () {
        rpc.query('cloudformation/template', {
          replyWithCount: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('resourcestacktemplate.action.recallFromAll', uuidList.length === 1 ? this.dbData.resourceStackTemplate[uuidList[0]].name : '')
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
        let event = this.createEvent('resourcestacktemplate.action.shareToAll', uuidList.length === 1 ? this.dbData.resourceStackTemplate[uuidList[0]].name : '')
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
      toggleToPublic: function (uuidList) {
        if (Array.isArray(uuidList) && uuidList.length === 0) return
        let self = this
        uuidList.forEach((uuid) => {
          let data = _.cloneDeep(this.dbData.resourceStackTemplate[uuid])
          if (data.toPublic !== undefined) data.toPublic = !data.toPublic
          self.updateDbRow({
            tableName: 'resourceStackTemplate',
            id: uuid,
            data: data
          })
        })
      },
      ...Utils
    }
  }
</script>
