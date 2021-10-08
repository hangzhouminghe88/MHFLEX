<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import METRICS from 'src/om/zwatchalarm/Metrics.json'
  import  ZWatchAlarmMethods from 'src/om/zwatchalarm/Methods'

  export default {
    data () {
      return {
        oppositeMap: {
          GreaterThan: 'LessThanOrEqualTo',
          GreaterThanOrEqualTo: 'LessThan',
          LessThan: 'GreaterThanOrEqualTo',
          LessThanOrEqualTo: 'GreaterThan'
        }
      }
    },
    methods: {
      markAllAsRead (mode, type) {
        let param = {
          'updateMode': 'All',
          'readStatus': 'Read'
        }
        // if (type === 'event' && mode === 'InRange') return Promise.all([this.updateEventData(param)])
        // else if (type === 'alarm' && mode === 'InRange') return Promise.all([this.updateAlarmData(param)])
        let event = this.createEvent('zwatchAlarm.actions.markAllMessageAsRead')
        return Promise.all([this.updateEventData(param, event), this.updateAlarmData(param, event)])
          .then(() => this.incEventSuccess(event), () => this.incEventFail(event))
      },
      updateEventData (param, event = null) {
        return rpc.put('zwatch/events/actions', {
          'updateEventData': param
        }, event)
      },
      updateAlarmData (param, event = null) {
        return rpc.put('zwatch/alarm-histories/actions', {
          'updateAlarmData': param
        }, event)
      },
      updateDbMessageList (dataUuid) {
        let dataList = _.cloneDeep(this.dbData.common.recentlyMessageList)
        if (!dataList) dataList = []
        let index = _.find(dataList, item => item.dataUuid === dataUuid)
        if (index > -1) dataList[index].status = 'Read'
        else dataList.push({ dataUuid, status: 'Read' })
        this.updateDbObject({
          name: 'common',
          data: {
            recentlyMessageList: dataList
          }
        })
      },
      updatewindowMessageList (dataUuid) {
        let dataList = _.cloneDeep(this.windowData.currMessageList)
        dataList.forEach((item) => {
          if (item.dataUuid === dataUuid) {
            item.status = 'Read'
          }
        })
        this.updateWindow({
          currMessageList: dataList
        })
        this.updateUnreadMessageCount()
      },
      updateCurrMessageList (dataUuid) {
        let dataList = _.cloneDeep(this.currMessageList)
        dataList.forEach((item) => {
          if (item.dataUuid === dataUuid) {
            item.status = 'Read'
          }
        })
        this.currMessageList = dataList
        this.messageList = _.chunk(dataList, this.windowData.pageSize)
      },
      markEventMessageAsRead (dataUuid) {
        return rpc.put('zwatch/events/actions', {
          'updateEventData': {
            'updateMode': 'OnlyOne',
            'readStatus': 'Read',
            'dataUuid': dataUuid
          }
        }).then((resp) => {
          if (resp.success) {
            if (this.windowData.currMessageList) this.updatewindowMessageList(dataUuid)
            if (this.currMessageList) this.updateCurrMessageList(dataUuid)
            else this.updateDbMessageList(dataUuid)
          }
        })
      },
      markAlarmMessageAsRead (dataUuid) {
        return rpc.put('zwatch/alarm-histories/actions', {
          'updateAlarmData': {
            'updateMode': 'OnlyOne',
            'readStatus': 'Read',
            'dataUuid': dataUuid
          }
        }).then((resp) => {
          if (resp.success) {
            if (this.windowData.currMessageList) this.updatewindowMessageList(dataUuid)
            if (this.currMessageList) this.updateCurrMessageList(dataUuid)
            else this.updateDbMessageList(dataUuid)
          }
        })
      },
      getAlarmMessageContent: function (message) {
        const self = this
        let type = this.getResourceType(message.namespace)
        let resourceName = message.resourceUuid ? self.getAlarmResourceName(type, message.resourceUuid) : ''
        let metricName = self.$t(`zwatchAlarm.metricName.${type}.${message.metricName}`, { name: resourceName })
        let comparisonOperator = self.$t(`zwatchAlarm.${message.comparisonOperator}`)
        let threshold = message.threshold
        let unit = METRICS[message.namespace][message.metricName].unit
        if (unit === 'percent') {
          threshold = threshold + '%'
        }
        if (unit === 'byte') {
          threshold = self.bytesToSize(Math.abs(threshold))
        }
        if (unit === 'byte/s') {
          threshold = self.bytesToSize(Math.abs(threshold)) + '/s'
        }
        if (message.alarmStatus === 'OK') {
          let recovered = self.$t('zwatchAlarm.recovered')
          comparisonOperator = self.$t(`zwatchAlarm.${self.oppositeMap[message.comparisonOperator]}`)
          return `${recovered} ${metricName}${comparisonOperator}${threshold}`
        }
        return `${metricName}${comparisonOperator}${threshold}`
      },
      getAlarmResourceUnit (message) {
        const self = this
        let unit = METRICS[message.namespace][message.metricName].unit
        let value = message.metricValue
        if (unit === 'percent') {
          value = value.toFixed(2)
          value = value + '%'
        }
        if (unit === 'byte') {
          value = self.bytesToSize(Math.abs(value))
        }
        if (unit === 'byte/s') {
          value = self.bytesToSize(Math.abs(value)) + '/s'
        }
        return value
      },
      getAlarmResourceName: function (tableName, uuid) {
        let name = ''
        try {
          name = this.dbData[tableName][uuid].name
        } catch (e) {
          rpc.query('resources/names', { uuids: [uuid] })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                this.updateDbRow({
                  id: uuid,
                  tableName,
                  data: {
                    name: resp.inventories[0].resourceName,
                    ...resp.inventories[0]
                  }
                })
              }
            })
        }
        return name
      },
      getEventMessageContent: function (message) {
        let name = message.resourceName ? this.$t(`zwatchAlarm.eventName.${message.name}`, {name: message.resourceName}) : this.$t(`zwatchAlarm.eventName.${message.name}`)
        return name
      },
      goToDetail(param, content){
        let self = this;
        param.content = content;
        window.localStorage.setItem('messageDetailItem',JSON.stringify(param));
        self.$router.push({name: 'detailMessageCenter', params:{uuid: param.dataUuid}});
      },
      ...Utils,
      ...{
        getResourceType: ZWatchAlarmMethods.methods.getResourceType
      }
    }
  }
</script>
