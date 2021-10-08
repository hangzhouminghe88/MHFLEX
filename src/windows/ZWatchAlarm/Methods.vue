<script>
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import METRICS from './Metrics.json'
  //import EndPointMethods from 'src/windows/ZWatchEndpoint/Methods'
  // global localStorage:false

  export default {
    methods: {
      ...{
        //getEndpointName: EndPointMethods.methods.getEndpointName,
        //isSystemEndpointUuid: EndPointMethods.methods.isSystemEndpointUuid,
        //getSystemEndpointUuid: EndPointMethods.methods.getSystemEndpointUuid
      },
      filterSystemTopic: function (uuid) {
        let systemTopicUuidList = this.getZWatchSystemTopicUuidList()
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        if (systemAlarmUuidList.some(item => uuid === item)) {
          return systemTopicUuidList
        }
        return []
      },
      getZWatchAlarmItemWithCondition: function (uuid, currTableName) {
        if (!currTableName) currTableName = this.windowData.currTab
        if (!this.dbData[currTableName][uuid]) return ''
        let namespace = this.dbData[currTableName][uuid].namespace
        let type = this.getResourceType(namespace, uuid)
        if (currTableName === 'zwatchResourceAlarm') {
          let metricName = this.dbData[currTableName][uuid].metricName
          let operator = this.dbData[currTableName][uuid].comparisonOperator
          let threshold = this.dbData[currTableName][uuid].threshold
          operator = this.$t(`zwatchAlarm.${operator}`)
          metricName = this.$t(`zwatchAlarm.metricName.${type}.${metricName}`, {name: ''})

          let unit = METRICS[this.dbData.zwatchResourceAlarm[uuid].namespace][this.dbData.zwatchResourceAlarm[uuid].metricName].unit
          if (unit === 'percent') {
            threshold = threshold + '%'
          }
          if (unit === 'byte') {
            threshold = this.bytesToSize(Math.abs(threshold))
          }
          if (unit === 'byte/s') {
            threshold = this.bytesToSize(Math.abs(threshold), 'B/s')
          }
          return `${metricName}${operator}${threshold}`
        }
        if (currTableName === 'zwatchEventAlarm') {
          let eventName = this.dbData[currTableName][uuid].eventName
          return this.$t(`zwatchAlarm.eventName.${type}.${eventName}`, {name: ''})
        }
      },
      getSystemALarmName: function (name) {
        let obj = {
          'ZStack Data Directory Capacity Alarm': this.$t('zwatchAlarm.systemAlarm'),
          'ZStack Primary Storage Available Capacity Alarm': this.$t('zwatchAlarm.primaryStorageAvailableCapacity'),
          'ZStack Backup Storage Available Capacity Alarm': this.$t('zwatchAlarm.backupStorageAvailableCapacity'),
          'VRouterDisconnected': this.$t('zwatchAlarm.vRouterDisconnected'),
          'BackupStorageDisconnected': this.$t('zwatchAlarm.backupStorageDisconnected'),
          'ManagementNodeLeft': this.$t('zwatchAlarm.managementNodeLeft'),
          'PrimaryStorageDisconnected': this.$t('zwatchAlarm.primaryStorageDisconnected')
        }
        return obj[name] || name
      },
      getAlarmName: function (uuid, currTab) {
        if (!currTab) currTab = this.windowData.currTab
        if (!this.dbData[currTab][uuid]) return
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        let isSystemAlarm = systemAlarmUuidList.some(item => item === uuid)
        if (currTab === 'zwatchResourceAlarm') {
          let name = this.dbData[currTab][uuid].name
          return name
          // if (isSystemAlarm) {
          //   return name
          // }
        }
        if (currTab === 'zwatchEventAlarm') {
          let eventName = this.dbData[currTab][uuid].eventName
          if (isSystemAlarm) {
            return eventName
          }
          return this.$t(`zwatchAlarm.eventName.${eventName}`, {name: ''})
        }
      },
      getDetailAlarmName: function (uuid, currTab) {
        if (!currTab) currTab = this.windowData.currTab
        if (!this.dbData[currTab][uuid]) return
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        let isSystemAlarm = systemAlarmUuidList.some(item => item === uuid)
        if (currTab === 'zwatchResourceAlarm') {
          let name = this.dbData[currTab][uuid].name
          if (isSystemAlarm) {
            return this.getSystemALarmName(name)
          }
        }
        if (currTab === 'zwatchEventAlarm') {
          let eventName = this.dbData[currTab][uuid].eventName
          if (isSystemAlarm) {
            return this.getSystemALarmName(eventName)
          }
          return this.$t(`zwatchAlarm.eventName.${eventName}`, {name: ''})
        }
      },
      getCurrTableName: function () {
        if (this.windowData.currTab === 'eventAlarm') {
          return 'zwatchEventAlarm'
        }
        return 'zwatchResourceAlarm'
      },
      getResourceType: function (namespace, uuid) {
        let key = namespace
        if (this.dbData.zwatchResourceAlarmA && this.dbData.zwatchResourceAlarmA[uuid] && this.dbData.zwatchResourceAlarmA[uuid].tag === 'VRouter') {
          key = 'ZStack/VRouter'
        }
        let types = {
          'ZStack/Image': 'image',
          'ZStack/VM': 'vm',
          'ZStack/BackupStorage': 'backupStorage',
          'ZStack/System': 'system',
          'ZStack/Volume': 'volume',
          'ZStack/Host': 'host',
          'ZStack/PrimaryStorage': 'primaryStorage',
          'ZStack/VIP': 'vip',
          'ZStack/L3Network': 'l3network',
          'ZStack/VRouter': 'vRouter',
          'ZStack/VCenter': 'vCenter',
          'ZStack/MN': 'mn',
          'ZStack/AliyunNasHost': 'primaryStorage'
        }
        let type = types[key]
        return type
      },
      getZWatchAlarmResourceType: function (uuid) {
        let currTableName = this.windowData.currTab
        if (!this.dbData[currTableName][uuid]) return ''
        let namespace = this.dbData[currTableName][uuid].namespace
        let type = this.getResourceType(namespace, uuid)
        return this.$t(`zwatchAlarm.${type}`)
      },
      getZWatchAlarmItem: function (uuid, currTableName) {
        if (!currTableName) currTableName = this.windowData.currTab
        if (!this.dbData[currTableName][uuid]) return ''
        let namespace = this.dbData[currTableName][uuid].namespace
        let type = this.getResourceType(namespace, uuid)

        if (currTableName === 'zwatchResourceAlarm') {
          let metricName = this.dbData[currTableName][uuid].metricName
          return this.$t(`zwatchAlarm.metricName.${type}.${metricName}`, { name: '' })
        }
        if (currTableName === 'zwatchEventAlarm') {
          let eventName = this.dbData[currTableName][uuid].eventName
          return this.$t(`zwatchAlarm.eventName.${type}.${eventName}`, {name: ''})
        }
      },
      getTopicNum: function (uuid, dbName = this.windowData.currTab) {
        if (this.dbData[dbName] && !this.dbData[dbName][uuid]) return ''
        let actions = this.dbData[dbName][uuid].actions
        let num = actions.length
        return num
      },
      create: async function (param, type) {
        if (type === 'zwatchEventAlarm') {
          await this.createZWatchEventAlarm(param)
        } else {
          await this.createZwatchResourceAlarm(param)
        }
      },
      addUserTagToAlarm: function (uuid, tag) {
        return rpc.create('user-tags', {
          resourceType: 'AlarmVO',
          resourceUuid: uuid,
          tag: tag
        })
      },
      createZwatchResourceAlarm: async function (param) {
        let event = this.createEvent('zwatchAlarm.action.create.zwatchResourceAlarm', param.name)
        try {
          if (param.namespace === 'ZStack/VRouter') {
            param.namespace = 'ZStack/VM'
            let resp = await rpc.create('zwatch/alarms', param, event)
            await this.addUserTagToAlarm(resp.inventory.uuid, 'VRouter')
          } else {
            await rpc.create('zwatch/alarms', param, event)
          }
          this.incEventSuccess(event)
        } catch (err) {
          this.incEventFail(event)
        }
      },
      createZWatchEventAlarm: async function (param) {
        let eventName = this.$t(`zwatchAlarm.eventName.${param.eventName}`, {name: ''})
        let event = this.createEvent('zwatchAlarm.action.create.zwatchEventAlarm', eventName)
        try {
          await rpc.create('zwatch/events/subscriptions', param, event)
          this.incEventSuccess(event)
        } catch (err) {
          this.incEventFail(event)
        }
      },
      getAssociatedEndpointUuidList: async function (topicUuid) {
        let endpointResp = await rpc.query('sns/application-endpoints', {
          q: `topics.uuid=${topicUuid}`,
          fields: 'uuid'
        })
        let endpointUuidList = endpointResp.inventories.map(item => item.uuid)
        return endpointUuidList
      },
      addEndpointToAlarm: function (alarmUuid, endpointUuidList, type) {
        const self = this
        let topicUuidList = endpointUuidList.map(uuid => {
          if (!self.dbData.zwatchTopic[uuid]) return
          return self.dbData.zwatchTopic[uuid].uuid
        })
        if (topicUuidList.length === 0) return
        let topicName = self.getEndpointName(endpointUuidList[0])
        return this.addTopicToAlarm(alarmUuid, topicUuidList, topicName, type)
      },
      addTopicToAlarm: function (alarmUuid, topicUuidList, topicName, type) {
        const self = this
        let uuidList = topicUuidList
        let event = self.createEvent('zwatchAlarm.action.addEndpoint', topicUuidList.length === 1 ? topicName : '', uuidList.length)
        let tasks = []
        let path = {
          'zwatchResourceAlarm': `zwatch/alarms/${alarmUuid}/actions`,
          'zwatchEventAlarm': `zwatch/events/subscriptions/${alarmUuid}/actions`
        }
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc.create(path[type], {
              actionUuid: uuid,
              actionType: 'sns'
            }, event)
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
      getCurrState: function (uuidList, currState) {
        return uuidList.some(uuid => this.dbData.zwatchResourceAlarm[uuid].state === currState)
      },
      canRemoveEndpoint: function (uuid, type) {
        if (!this.dbData[type][uuid] || !Array.isArray(this.dbData[type][uuid].actions)) return false
        let topicUuidList = this.dbData[type][uuid].actions.map(item => item.actionUuid)
        let systemTopicUuidList = this.filterSystemTopic(uuid)
        if (systemTopicUuidList.length > 0) {
          topicUuidList = topicUuidList.filter(uuid => !systemTopicUuidList.some(item => item === uuid))
        }
        if (topicUuidList.length > 0) return true
        return false
      },
      removeEndpointFromAlarm: function (alarmUuid, endpointUuidList, type) {
        const self = this
        let topicUuidList = endpointUuidList.map(uuid => {
          if (!self.dbData.zwatchTopic[uuid]) return
          return self.dbData.zwatchTopic[uuid].uuid
        })
        if (topicUuidList.length === 0) return
        let topicName = self.getEndpointName(endpointUuidList[0])

        return this.removeTopicFromAlarm(alarmUuid, topicUuidList, topicName, type)
      },
      removeTopicFromAlarm: function (alarmUuid, topicUuidList, topicName, type) {
        const self = this
        let uuidList = topicUuidList
        let event = self.createEvent('zwatchAlarm.action.removeEndpoint', topicUuidList.length === 1 ? topicName : '', uuidList.length)
        let tasks = []
        let path = (uuid) => {
          let obj = {
            'zwatchResourceAlarm': `zwatch/alarms/${alarmUuid}/actions/${uuid}`,
            'zwatchEventAlarm': `zwatch/events/subscriptions/${alarmUuid}/actions/${uuid}`
          }
          return obj[type]
        }
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc._delete(path(uuid), null, event)
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
      subscribeTopic: function (alarmUuid, topicUuidList, name, currTab) {
        const self = this
        let uuidList = topicUuidList
        let event = self.createEvent('zwatchAlarm.action.subscribeTopic', name, uuidList.length)
        let tasks = []
        let path = {
          'zwatchResourceAlarm': `zwatch/alarms/${alarmUuid}/actions`,
          'zwatchEventAlarm': `zwatch/events/subscriptions/${alarmUuid}/actions`
        }
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc.create(path[currTab], {
              actionUuid: uuid,
              actionType: 'sns'
            }, event)
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
      unSubscribeTopic: function (alarmUuid, topicUuidList, name, currTab) {
        const self = this
        let uuidList = topicUuidList
        let event = self.createEvent('zwatchAlarm.action.unSubscribeTopic', name, uuidList.length)
        let tasks = []
        let path = (uuid) => {
          let obj = {
            'zwatchResourceAlarm': `zwatch/alarms/${alarmUuid}/actions/${uuid}`,
            'zwatchEventAlarm': `zwatch/events/subscriptions/${alarmUuid}/actions/${uuid}`
          }
          return obj[currTab]
        }
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc._delete(path(uuid), null, event)
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
      getZWatchResourceAlarmName: function (uuid) {
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        if (systemAlarmUuidList.some(item => item === uuid)) {
          return this.$t('zwatchAlarm.systemAlarm')
        }
        return this.dbData.zwatchResourceAlarm[uuid].name
      },
      changeAlarmState: function (state, uuidList) {
        const self = this
        let event = self.createEvent(`zwatchAlarm.action.${state}`, uuidList.length === 1 ? this.getZWatchResourceAlarmName(uuidList[0]) : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc.update('zwatch/alarms', uuid, {
              'changeAlarmState': {
                'stateEvent': state
              }
            }, event).then((resp) => {
              self.incEventSuccess(event)
              self.updateDbRow({
                tableName: 'zwatchResourceAlarm',
                id: uuid,
                data: resp.inventory
              })
            }, () => {
              self.incEventFail(event)
            })
            tasks.push(task)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      enable: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        return this.changeAlarmState('enable', uuidList)
      },
      disable: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        return this.changeAlarmState('disable', uuidList)
      },
      canDestroy: function (uuidList) {
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        return !uuidList.some(uuid => systemAlarmUuidList.some(item => item === uuid))
      },
      destroy: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        const self = this
        let event = self.createEvent(`zwatchAlarm.action.delete`, uuidList.length === 1 ? self.dbData.zwatchResourceAlarm[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc._delete(`zwatch/alarms/${uuid}`, null, event)
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
      unSubscribeEvent: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        const self = this
        let uuid = self.dbData.zwatchEventAlarm[uuidList[0]].uuid
        let eventName = self.getAlarmName(uuid, 'zwatchEventAlarm')
        let event = self.createEvent(`zwatchAlarm.action.delete`, uuidList.length === 1 ? eventName : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let task = rpc._delete(`zwatch/events/subscriptions/${uuid}`, null, event)
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
      updateCount: function () {
        let conditions = []
        let updateZWatchResourceAlarmCount = () => {
          rpc.query('zwatch/alarms', {
            q: conditions,
            count: true
          })
            .then((resp) => {
              this.updateWindow({
                zwatchResourceAlarmCount: resp.total
              })
            })
        }

        let updateZWatchEventAlarmCount = () => {
          rpc.query('zwatch/events/subscriptions', {
            q: conditions,
            count: true
          })
            .then((resp) => {
              this.updateWindow({
                zwatchEventAlarmCount: resp.total
              })
            })
        }

        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditions = conditions.concat(this.windowData.searchConditionList)
          if (this.windowData.currTab === 'zwatchResourceAlarm') {
            updateZWatchResourceAlarmCount()
          }
          if (this.windowData.currTab === 'zwatchEventAlarm') {
            updateZWatchEventAlarmCount()
          }
          return
        }
        updateZWatchResourceAlarmCount()
        updateZWatchEventAlarmCount()
      },
      sizeRoundToString: function (size, unit = '') {
        const self = this
        var K = 1024
        var M = K * K
        var G = M * K
        var T = G * K
        var sizeMap = {
          'K': K,
          'M': M,
          'G': G,
          'T': T
        }
        var suffixes = ['T', 'G', 'M', 'K']
        function round () {
          var s = suffixes.shift()
          if (!size || size < 1024) {
            return self.toFixed(size / 1024, 2) + ' K' + unit
          }
          var q = sizeMap[s]
          var ret = size / q
          if (ret >= 1) {
            return self.toFixed(ret, 2) + ' ' + s + unit
          } else {
            return round()
          }
        }
        return round()
      },
      setAlarmStrategy: function (param, uuid) {
        let _param = {}
        if (param.strategy === 'repeat') {
          _param = {
            repeatCount: -1
          }
          if (param.repeatInterval) _param.repeatInterval = param.repeatInterval
        } else _param = { repeatCount: 1 }
        let event = this.createEvent(`zwatchAlarm.action.resetStrategy`, this.dbData.zwatchResourceAlarm[uuid].name)
        return rpc.update('zwatch/alarms', uuid, {
          updateAlarm: _param
        }, event).then(() => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
      },
      ...Utils
    }
  }
</script>
