<script>
// import _ from 'lodash'
import rpc from 'src/utils/rpc'
import Utils from 'src/utils/utils'
import Window from 'src/windows/Window'
import ZWatchAlarmMethods from 'src/om/zwatchalarm/Methods'
import METRICS from 'src/om/zwatchalarm/Metrics.json'
import ZwatchCallbacks from './ZwatchCallbacks';
const alarmAudio = require('../assets/audios/alarm.mp3');

export default {
  mixins: [Window, ZWatchAlarmMethods],
  created () {
    let zwatchIndex = rpc.zwatch.subscribe(this.receviceSystemAlarmMessage)
    this.updateWindow({
      zwatchIndex: zwatchIndex
    })
    this.updateUnreadMessageCount()
  },
  destroyed () {
    rpc.zwatch.unsubscribe(this.windowData.zwatchIndex)
  },
  data () {
    return {
      toastTimeout: 10 * 1000,
      oppositeMap: {
        GreaterThan: 'LessThanOrEqualTo',
        GreaterThanOrEqualTo: 'LessThan',
        LessThan: 'GreaterThanOrEqualTo',
        LessThanOrEqualTo: 'GreaterThan'
      }
    }
  },
  methods: {
    ...Utils,
    receviceSystemAlarmMessage: function (message) {
      this.create(message)
      this.updateUnreadMessageCount()
    },
    create: function (message) {
      if (message && message.haProgress) return // uniq haProgress (VM HA)
      if (message && message.schedulerProcess) {
        return ZwatchCallbacks['schedulerProcess'].call(this, message.schedulerProcess)
      }
      if (['HostCheckAlive', 'VMHA'].indexOf(message.EVENT_NAME) > -1) return // uniq haProgress (VM HA)
      let content = ''
      let type
      if (message.ticket) {
        rpc.query('tickets', {
          q: ['status=Pending'],
          count: true
        }).then(resp => {
          this.updateDbObject({
            name: 'common',
            data: {
              pendingTicketCount: resp.total
            }
          })
        })
        this.getTicketMessageContent(message)
        .then(content => {
          type = 'ticketMessage'
          let id = `${this.genUniqueId()}`
          let param = {
            id,
            type,
            message: {
              content,
              ...message
            }
          }
          this.createToast(param)
          let self = this
          setTimeout(() => {
            if (self.$store.state.toastManager.toasts[id]) {
              self.destroyToast(id)
            }
          }, self.toastTimeout)
        })
      } else {
        if (message.ALARM_METRIC) {
          content = this.getAlarmMessageContent(message)
          type = 'alarmMessage'
        } else if (message.EVENT_NAME) {
          content = this.getEventMessageContent(message)
          type = 'alarmMessage'
        } else {
          content = this.getEventMessageContent(message)
        }
        let id = `${this.genUniqueId()}`
        let param = {
          id,
          type,
          message: {
            content,
            ...message
          }
        }
				this.createToast(param);
				let audioDom = document.createElement('audio');
				audioDom.setAttribute('id', 'sound');
				audioDom.setAttribute('autoplay', 'autoplay');
				audioDom.setAttribute('duration', 3000);
				document.body.appendChild(audioDom);
				document.getElementById('sound').src= alarmAudio;
        let self = this
        setTimeout(() => {
          if (self.$store.state.toastManager.toasts[id]) {
						self.destroyToast(id)
						document.body.removeChild(document.getElementById('sound'));
          }
        }, self.toastTimeout)
      }
    },
    getTicketMessageContent: function (message) {
      let p
      if (message.operatorType === 'IAM2VirtualIDVO') {
        p = rpc.query('iam2/virtual-ids', {
          q: [`uuid=${message.operatorUuid}`]
        })
      } else {
        p = rpc.query('accounts', {
          q: [`uuid=${message.operatorUuid}`]
        })
      }
      return p.then((resp) => {
        return new Promise((resolve, reject) => {
          let name = ''
          if (resp.inventories.length > 0 && resp.inventories[0].name) {
            name = resp.inventories[0].name
          }
          resolve(name + ' ' + this.$t(`ticket.action.${message.status}`, message.ticket))
        })
      })
    },
    getAlarmMessageContent: function (message) {
      let type = this.getResourceType(message.ALARM_NAMESPACE)
      let resourceName = message.ALARM_RESOURCE_ID ? this.getAlarmResourceName(type, message.ALARM_RESOURCE_ID) : ''
      let metricName = this.$t(`zwatchAlarm.metricName.${type}.${message.ALARM_METRIC}`, {name: resourceName})
      let comparisonOperator = this.$t(`zwatchAlarm.${message.ALARM_COMPARISON_OPERATOR}`)

      let threshold = message.ALARM_THRESHOLD
      let unit = METRICS[message.ALARM_NAMESPACE][message.ALARM_METRIC].unit
      if (unit === 'percent') {
        threshold = threshold + '%'
      }
      if (unit === 'byte') {
        threshold = this.bytesToSize(Math.abs(threshold))
      }
      if (unit === 'byte/s') {
        threshold = this.bytesToSize(Math.abs(threshold)) + '/s'
      }
      if (message.ALARM_CURRENT_STATUS === 'OK') {
        let recovered = this.$t('zwatchAlarm.recovered')
        comparisonOperator = this.$t(`zwatchAlarm.${this.oppositeMap[message.ALARM_COMPARISON_OPERATOR]}`)
        return `${recovered} ${metricName}${comparisonOperator}${threshold}`
      }
      return `${metricName}${comparisonOperator}${threshold}`
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
      let name = this.$t(`zwatchAlarm.eventName.${message.EVENT_NAME}`, {name: ''})
      return name
    },
    sizeRoundToString: function (size) {
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
          return self.toFixed(size / 1024, 2) + ' K'
        }
        var q = sizeMap[s]
        var ret = size / q
        if (ret >= 1) {
          return self.toFixed(ret, 2) + ' ' + s
        } else {
          return round()
        }
      }
      return round()
    }
  }
}
</script>

<style scoped>

</style>
