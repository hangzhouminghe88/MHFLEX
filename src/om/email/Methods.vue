<script>
  import rpc from 'src/utils/rpc';
  export default {
    name: "Methods",
    methods: {
      enable: function (uuidList, fn) {
        const self = this
        let event = self.createEvent('monitoralarm.action.enableMedia', uuidList.length === 1 ? self.dbData.emailserversetting[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('sns/application-platforms', uuid, {
              'changeSNSApplicationPlatformState': {
                'stateEvent': 'enable'
              }
            }, event).then((resp) => {
              self.incEventSuccess(event)
              if (fn) fn()
            }, () => {
              self.incEventFail(event)
            })
          })(uuid)
        })
      },
      disable: function (uuidList, fn) {
        const self = this
        let event = self.createEvent('monitoralarm.action.disableMedia', uuidList.length === 1 ? self.dbData.emailserversetting[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('sns/application-platforms', uuid, {
              'changeSNSApplicationPlatformState': {
                'stateEvent': 'disable'
              }
            }, event).then((resp) => {
              self.incEventSuccess(event)
              if (fn) fn()
            }, () => {
              self.incEventFail(event)
            })
          })(uuid)
        })
      },
      shareAll (uuidList, fn) {
        let self = this
        let event = this.createEvent('emailserversetting.action.shareToAll', uuidList.length === 1 ? this.dbData.emailserversetting[uuidList[0]].name : '')
        return rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': uuidList,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            if(fn) fn();
            self.incEventSuccess(event)
          }, () => {
            if(fn) fn();
            self.incEventFail(event)
          })
      },
      recallAll (uuidList, fn) {
        let self = this
        let event = this.createEvent('emailserversetting.action.recallFromAll', uuidList.length === 1 ? this.dbData.emailserversetting[uuidList[0]].name : '')
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': uuidList,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            if(fn) fn()
            self.incEventSuccess(event)
          }, () => {
            if(fn) fn()
            self.incEventFail(event)
          })
      },
      changeResourceOwner(uuidList, accountUuid, fn) {
        const self = this
        let event = self.createEvent('emailserversetting.action.changeOwner', uuidList.length === 1 ? self.dbData.emailserversetting[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              if(fn) fn()
              self.incEventSuccess(event)
            }, () => {
              if(fn) fn()
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      validateSNSEmailPlatform: function (uuidList) {
        const self = this
        let event = self.createEvent('monitoralarm.action.validateSNSEmailPlatform', uuidList.length === 1 ? self.dbData.emailserversetting[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc.update('sns/application-platforms/email', uuid, {
              'validateSNSEmailPlatform': {
                'uuid': 'enable'
              }
            }, event).then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
            tasks.push(task)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      create: async function (params, fn) {
        let event = this.createEvent('monitoralarm.action.addMedia')
        try {
          await rpc.create('sns/application-platforms/email', params, event)
          this.incEventSuccess(event)
          if (fn) fn()
        } catch (e) {
          this.incEventFail(event)
        }
      },
    }
  }
</script>

<style scoped>

</style>
