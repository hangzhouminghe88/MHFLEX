<script>
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'
  // global localStorage:false

  export default {
    methods: {
      create: async function (param) {
        let resp = {};
        if (param.applicationType === 'email') {
          let p = {
            name: param.name,
            description: param.description,
            email: param.email,
            platformUuid: param.platformUuid
          }
          resp = await this.createEmailEndpoint(p)
        } else if (param.applicationType === 'dingTalk') {
          let p = {
            name: param.name,
            description: param.description,
            url: param.url,
            atPersonPhoneNumbers: param.atPersonPhoneNumbers ? param.atPersonPhoneNumbers : null,
            atAll: param.atAll
          }
          resp = await this.createDingTalkEndpoint(p)
        } else {
          let p = {
            name: param.name,
            description: param.description,
            url: param.url
          }
          if (param.username !== '') p.username = param.username
          if (param.password !== '') p.password = param.password
          resp = await this.createHttpEndpoint(p)
        }
        return resp
      },
      bindEndpointWithTopic: async function (topicParam, endpointUuid) {
        let resp = await rpc.create('sns/topics', topicParam)
        if (!resp.inventory) return
        let topicUuid = resp.inventory.uuid
        await rpc.post(`sns/topics/${topicUuid}/endpoints/${endpointUuid}`, null)
        await this.updateDbRow({
          tableName: 'zwatchTopic',
          id: endpointUuid,
          data: resp.inventory
        })
      },
      createEmailEndpoint: async function (param) {
        let event = this.createEvent('zwatchEndpoint.action.createEmailEndpoint', param.name)
        let resp = {}
        try {
          resp = await rpc.create('sns/application-endpoints/emails', param, event)
          let uuid = resp.inventory.uuid
          let p = {
            name: param.name,
            description: param.description
          }
          await this.bindEndpointWithTopic(p, uuid)
          this.incEventSuccess(event)
          return resp
        } catch (err) {
          this.incEventFail(event)
        }
      },
      createDingTalkEndpoint: async function (param) {
        let event = this.createEvent('zwatchEndpoint.action.createDingTalkEndpoint', param.name)
        let resp = {}
        try {
          resp = await rpc.create('sns/application-endpoints/ding-talk', param, event)
          let uuid = resp.inventory.uuid
          let p = {
            name: param.name,
            description: param.description
          }
          await this.bindEndpointWithTopic(p, uuid)
          this.incEventSuccess(event)
          return resp
        } catch (err) {
          this.incEventFail(event)
        }
      },
      createHttpEndpoint: async function (param) {
        let event = this.createEvent('zwatchEndpoint.action.createHttpEndpoint', param.name)
        let resp = {}
        try {
          resp = await rpc.create('sns/application-endpoints/http', param, event)
          let uuid = resp.inventory.uuid
          let p = {
            name: param.name,
            description: param.description
          }
          await this.bindEndpointWithTopic(p, uuid)
          this.incEventSuccess(event)
          return resp
        } catch (err) {
          this.incEventFail(event)
        }
      },
      queryEmailList: async function (uuid) {
        let resp = await rpc.query(`sns/application-endpoints/emails/${uuid}`)
        return resp
      },
      queryDingTalkList: async function (uuid) {
        let resp = await rpc.query(`sns/application-endpoints/ding-talk/${uuid}`)
        return resp
      },
      queryHttpList: async function (uuid) {
        let resp = await rpc.query(`sns/application-endpoints/http/${uuid}`)
        return resp
      },
      _query: async function (type, uuid) {
        let resp = {}
        if (type === 'DingTalk') {
          resp = await this.queryDingTalkList(uuid)
        }
        if (type === 'Email') {
          resp = await this.queryEmailList(uuid)
        }
        if (type === 'HTTP') {
          resp = await this.queryHttpList(uuid)
        }
        await this.queryTopic(uuid)
        return await this.updateDbRow({
          tableName: 'zwatchEndpoint',
          id: uuid,
          data: resp.inventories[0]
        })
      },
      queryTopic: async function (endpointUuid) {
        let resp = await rpc.query('sns/topics', {
          q: `endpoints.uuid=${endpointUuid}`
        })
        if (!resp.inventories[0]) return
        await this.updateDbRow({
          tableName: 'zwatchTopic',
          id: endpointUuid,
          data: resp.inventories[0]
        })
      },
      queryAlarmForTopic: async function (endpointUuid) {
        if (!this.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = this.dbData.zwatchTopic[endpointUuid].uuid
        let alarmResp = await rpc.query('zwatch/alarms', {
          q: `actions.actionUuid=${topicUuid}`
        })
        let eventResp = await rpc.query('zwatch/events/subscriptions', {
          q: `actions.actionUuid=${topicUuid}`
        })
        let alarmUuidList = alarmResp.inventories.map(item => item.uuid)
        let eventUuidList = eventResp.inventories.map(item => item.uuid)
        await this.updateDbRow({
          tableName: 'zwatchTopicA',
          id: endpointUuid,
          data: {
            alarmUuidList: alarmUuidList,
            eventUuidList: eventUuidList
          }
        })
      },
      getEndpointName: function (uuid) {
        if (this.isSystemEndpointUuid([uuid])) {
          return this.$t('zwatchEndpoint.system-endpoint')
        }
        return this.dbData.zwatchEndpoint[uuid].name
      },
      getEndpointDescription: function (uuid) {
        if (this.isSystemEndpointUuid([uuid])) {
          return this.$t('zwatchEndpoint.system-endpoint-description')
        }
        return this.dbData.zwatchEndpoint[uuid].description
      },
      getSystemEndpointUuid: function () {
        if (this.dbData.common.systemEndpointUuid && this.dbData.common.systemEndpointUuid.length > 0) {
          return this.dbData.common.systemEndpointUuid
        }
        return ''
      },
      isSystemEndpointUuid: function (uuidList) {
        if(!uuidList) return;
        let systemUuid = this.getSystemEndpointUuid()
        let invalid =  uuidList.some((uuid) => {
          return systemUuid === uuid
        })
        return invalid;
      },
      getSystemEndpoint: async function () {
        let systemUuidList = this.getZWatchSystemAlarmTopicUuidList()
        let systemTopicUuid = systemUuidList[0]
        let resp = await rpc.query(`sns/application-endpoints/http`, {
          q: `topics.uuid=${systemTopicUuid}`
        })
        if (resp.inventories && resp.inventories.length > 0) {
          await this.updateDbObject({
            name: 'common',
            data: {
              systemEndpointUuid: resp.inventories[0].uuid
            }
          })
        }
      },
      getZWatchEndpointType: function (uuid) {
        if (!this.dbData.zwatchEndpoint[uuid]) return ''
        if (this.isSystemEndpointUuid([uuid])) {
          return this.$t(`common.system`)
        }
        let obj = {
          DingTalk: 'dingTalk',
          Email: 'email',
          HTTP: 'http'
        }
        let type = obj[this.dbData.zwatchEndpoint[uuid].type]
        return this.$t(`common.${type}`)
      },
      getZWatchEndpointAddress: function (uuid) {
        if (!this.dbData.zwatchEndpoint[uuid]) return ''
        if (this.isSystemEndpointUuid([uuid])) {
          return this.$t(`common.platform`)
        }
        let type = this.dbData.zwatchEndpoint[uuid].type
        if (type === 'DingTalk') {
          return this.dbData.zwatchEndpoint[uuid].url
        }
        if (type === 'Email') {
          return this.dbData.zwatchEndpoint[uuid].email
        }
        if (type === 'HTTP') {
          return this.dbData.zwatchEndpoint[uuid].url
        }
      },
      batchTaskWrapper: function (p = {
        eventName: '',
        taskFn: function () {},
        successCallback: null,
        uuidList: []
      }) {
        const self = this
        let event = self.createEvent(p.eventName, p.uuidList.length === 1 ? self.dbData.zwatchEndpoint[p.uuidList[0]].name : '', p.uuidList.length)
        let tasks = []
        p.uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = p.taskFn(event, uuid)
              .then((resp) => {
                self.incEventSuccess(event)
                if (p.successCallback) {
                  return p.successCallback(resp, uuid)
                }
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      changeSNSApplicationEndpointState: function (state, uuidList) {
        let task = (event, uuid) => {
          return rpc.update('sns/application-endpoints', uuid, {
            'changeSNSApplicationEndpointState': {
              'stateEvent': state
            }
          }, event)
        }
        let successCallback = (resp, uuid) => {
          return this.updateDbRow({
            tableName: 'zwatchEndpoint',
            id: uuid,
            data: resp.inventory
          })
        }
        return this.batchTaskWrapper({
          eventName: `zwatchEndpoint.action.${state}`,
          taskFn: task,
          successCallback,
          uuidList
        })
      },
      Enabled: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        return this.changeSNSApplicationEndpointState('enable', uuidList)
      },
      Disabled: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        return this.changeSNSApplicationEndpointState('disable', uuidList)
      },
      destroy: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        const self = this
        let event = self.createEvent(`zwatchEndpoint.action.destroy`, uuidList.length === 1 ? self.dbData.zwatchEndpoint[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`sns/application-endpoints/${uuid}`, null, event)
              .then(() => {
                let topicUuid = self.dbData.zwatchTopic[uuid].uuid
                return rpc._delete(`sns/topics/${topicUuid}`, null)
                  .then(() => {
                    self.incEventSuccess(event)
                  })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      isSystemTopic: function (uuidList) {
        let systemUuidList = this.getZWatchSystemTopicUuidList()
        return uuidList.some(uuid => systemUuidList.some(it => it === uuid))
      },
      isSystemAlarmTopic: function (uuidList) {
        let systemUuidList = this.getZWatchSystemAlarmTopicUuidList()
        return uuidList.some(uuid => systemUuidList.some(it => it === uuid))
      },
      getAssociatedAlarmUuidList: async function (topicUuid) {
        let alarmResp = await rpc.query('zwatch/alarms', {
          q: `actions.actionUuid=${topicUuid}`,
          fields: 'uuid'
        })
        let eventResp = await rpc.query('zwatch/events/subscriptions', {
          q: `actions.actionUuid=${topicUuid}`,
          fields: 'uuid'
        })
        let alarmUuidList = alarmResp.inventories.map(item => item.uuid)
        let eventUuidList = eventResp.inventories.map(item => item.uuid)
        let uuidList = alarmUuidList.concat(eventUuidList)
        return uuidList
      },
      genAlarmObjList: function (alarmItems) {
        let list = []
        Object.keys(alarmItems).forEach(key => {
          alarmItems[key].forEach(uuid => {
            list.push({
              type: key,
              uuid: uuid
            })
          })
        })
        return list
      },
      addAlarmToEndpoint: function (endpointUuid, alarmItems, name) {
        const self = this
        let topicName = name
        if (!self.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = self.dbData.zwatchTopic[endpointUuid].uuid
        if (!name) {
          topicName = self.dbData.zwatchTopic[endpointUuid].name
        }
        return this.addAlarmToTopic(topicUuid, alarmItems, topicName)
      },
      addAlarmToTopic: function (topicUuid, alarmItems, topicName) {
        const self = this
        let alarmList = this.genAlarmObjList(alarmItems)
        let alarm = alarmList[0]
        let alarmName = ''
        if (alarm.type === 'zwatchEventAlarm') {
          alarmName = self.dbData.zwatchEventAlarm[alarm.uuid].eventName
        } else if (alarm.type === 'zwatchResourceAlarm') {
          alarmName = self.dbData.zwatchResourceAlarm[alarm.uuid].name
        }
        let event = self.createEvent('zwatchTopic.action.addAlarm', alarmList.length === 1 ? alarmName : '', alarmList.length)
        let tasks = []
        let path = (alarm) => {
          let obj = {
            'zwatchResourceAlarm': `zwatch/alarms/${alarm.uuid}/actions`,
            'zwatchEventAlarm': `zwatch/events/subscriptions/${alarm.uuid}/actions`
          }
          if (!obj[alarm.type]) return ''
          return obj[alarm.type]
        }
        alarmList.forEach(function (item) {
          ((item) => {
            let task = rpc.create(path(item), {
              actionUuid: topicUuid,
              actionType: 'sns'
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(item)
        })
        return Promise.all(tasks)
      },
      canRemoveAlarm: function (uuid) {
        let topicUuid = this.dbData.zwatchTopic[uuid].uuid
        let alarmUuidList = this.dbData.zwatchTopicA[uuid].alarmUuidList
        let eventUuidList = this.dbData.zwatchTopicA[uuid].eventUuidList
        let uuidList = alarmUuidList.concat(eventUuidList)
        if (uuidList.length === 0) return false
        if (uuidList.length === 1) {
          let systemTopicUuidList = this.getZWatchSystemTopicUuidList()
          let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
          let isSystemTopic = systemTopicUuidList.some(item => item === topicUuid)
          if (!isSystemTopic) return true
          let isSystemAlarm = systemAlarmUuidList.some(item => uuidList.some(uuid => item === uuid))
          if (isSystemAlarm) return false
        }
        return true
      },
      removeAlarmFromEndpoint: function (endpointUuid, alarmItems, name) {
        const self = this
        let topicName = name
        if (!self.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = self.dbData.zwatchTopic[endpointUuid].uuid
        if (!name) {
          topicName = self.dbData.zwatchTopic[endpointUuid].name
        }
        return this.removeAlarmFromTopic(topicUuid, alarmItems, topicName)
      },
      removeAlarmFromTopic: function (topicUuid, alarmItems, topicName) {
        const self = this
        let alarmList = this.genAlarmObjList(alarmItems)
        let alarm = alarmList[0]
        let alarmName = ''
        if (alarm.type === 'zwatchEventAlarm') {
          alarmName = self.dbData.zwatchEventAlarm[alarm.uuid].eventName
        } else if (alarm.type === 'zwatchResourceAlarm') {
          alarmName = self.dbData.zwatchResourceAlarm[alarm.uuid].name
        }
        let event = self.createEvent('zwatchTopic.action.removeAlarm', alarmList.length === 1 ? alarmName : '', alarmList.length)
        let tasks = []
        let path = (alarm) => {
          let obj = {
            'zwatchResourceAlarm': `zwatch/alarms/${alarm.uuid}/actions/${topicUuid}`,
            'zwatchEventAlarm': `zwatch/events/subscriptions/${alarm.uuid}/actions/${topicUuid}`
          }
          if (!obj[alarm.type]) return ''
          return obj[alarm.type]
        }
        alarmList.forEach(function (item) {
          ((item) => {
            let task = rpc._delete(path(item), null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(item)
        })
        return Promise.all(tasks)
      },
      addSNSDingTalkAtPerson: function (endpointUuid, numbers) {
        const self = this
        let event = self.createEvent('zwatchEndpoint.action.addSNSDingTalkAtPerson', self.dbData.zwatchEndpoint[endpointUuid].name, numbers.length)
        let tasks = []
        numbers.forEach(function (number) {
          ((number) => {
            let task = rpc.create('sns/application-endpoints/ding-talk/at-persons', {
              phoneNumber: number,
              endpointUuid: endpointUuid
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(number)
        })
        return Promise.all(tasks)
      },
      removeSNSDingTalkAtPerson: function (endpointUuid, numbers) {
        const self = this
        let event = self.createEvent('zwatchEndpoint.action.removeSNSDingTalkAtPerson', self.dbData.zwatchEndpoint[endpointUuid].name, numbers.length)
        let tasks = []
        numbers.forEach(function (number) {
          ((number) => {
            let task = rpc._delete(`sns/application-endpoints/ding-talk/${endpointUuid}/at-persons/${number}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(number)
        })
        return Promise.all(tasks)
      },
      subscribeTopic: function (endpointUuid, topicUuidList) {
        const self = this
        let uuidList = topicUuidList
        let event = self.createEvent('zwatchEndpoint.action.subscribeTopic', self.dbData.zwatchEndpoint[endpointUuid].name, uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc.post(`sns/topics/${uuid}/endpoints/${endpointUuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      unSubscribeTopic: function (endpointUuid, topicUuidList) {
        const self = this
        let uuidList = topicUuidList
        let event = self.createEvent('zwatchEndpoint.action.unSubscribeTopic', self.dbData.zwatchEndpoint[endpointUuid].name, uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc._delete(`sns/topics/${uuid}/endpoints/${endpointUuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(task)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      getTopicNum: function (uuid) {
        let value = 0
        let topicNum = `topicNum-${uuid}`
        try {
          this[topicNum].toFixed(0)
          value = this[topicNum]
        } catch (e) {
          if (this.checkBounce(`getTopicNum-${uuid}`)) return 0
          value = 0
          rpc.query('sns/topics', {
            count: true,
            replyWithCount: true,
            q: [`endpoints.uuid=${uuid}`]
          }).then((resp) => {
            this[topicNum] = resp.total
          }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      ...Utils
    }
  }
</script>

