<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import AlarmMessageToResource from '../AlarmMessageToRescource';
  import DetailRowList from 'src/component/Detail/RowList';
  import ZwatchAlarmMethods from 'src/om/zwatchalarm/Methods';
  import Utils from 'src/utils/utils';
  import MessageCenterList from '../List';

  export default {
    name: "DetailService",
    mixins: [MessageCenterList, ZwatchAlarmMethods],
    components: {DetailTemplate, DetailRowList},
    props: {
      param:{
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    created(){
      let self = this;
      self.checkResourceStatus();
    },
    computed: {
      model(){
        return JSON.parse(window.localStorage.getItem('messageDetailItem'));
      },
      msgType () {
        if ((this.message.type === 'event' || !this.message.alarmUuid)) {
          return 'event'
        } else {
          return 'alarm'
        }
      },
      resourceUuid () {
        if (this.model.resourceUuid || this.model.resourceId || this.model.ALARM_RESOURCE_ID || this.model.EVENT_RESOURCE_ID) return this.model.resourceUuid || this.model.resourceId || this.model.ALARM_RESOURCE_ID || this.model.EVENT_RESOURCE_ID
        else return ''
      },
      alarmUuid () {
        if (this.model.alarmUuid || this.model.ALARM_UUID) return this.model.alarmUuid || this.model.ALARM_UUID
        else return ''
      },
      dataUuid () {
        if (this.model.dataUuid || this.model.ALARM_DATA_UUID) return this.model.dataUuid || this.model.ALARM_DATA_UUID
        else return ''
      },
      time () {
        if (this.model.time || this.model.ALARM_TIME) return this.model.time ? this.formatDatetime(new Date(this.model.time)) : this.formatDatetime(new Date(this.model.ALARM_TIME))
        else return ''
      },
      namespace () {
        if (this.model.namespace || this.model.ALARM_NAMESPACE || this.model.EVENT_NAMESPACE) return this.model.namespace || this.model.ALARM_NAMESPACE || this.model.EVENT_NAMESPACE
        else return ''
      },
      resourceList () {
        let result = []
        let self = this;
        if (self.resourceUuid) {
          let resourceInfo = AlarmMessageToResource[self.namespace]
          let list = self.resourceUuid.split('|')
          let contentList = list.map(uuid => {
            let content = {
              value: uuid,
              canLink: () => {
                if(self.param.hideResourceLink)
                return !self.isDeleted[uuid] && !!resourceInfo && !self.param.hideResourceLink
              },
              handler: () => {
                if (!resourceInfo) return ''
                let detailPageName = resourceInfo.detailPage
                this.$router.push({name: detailPageName, params: { uuid }})
              }
            }
            if (resourceInfo) {
              let tableName = resourceInfo.tableName
              let path = resourceInfo.path
              if (self.dbData[tableName][uuid] && !self.isDeleted[uuid] && self.isDeleted[uuid] !== undefined) {
                content.value = self.dbData[tableName][uuid].name
              } else {
                Utils.queryResourceByUuid(path, uuid, tableName, self)
              }
            }
            if (_.get(self.model, ['resourceName'])) content.value = _.get(self.model, [ 'resourceName'])
            content.value = content.value.replace(/\"/g, '');
            content.canLink = () => !this.isDeleted[uuid] && !!resourceInfo && !this.param.hideResourceLink,
              content.handler = () => {
                if (!resourceInfo) return ''
                let detailPageName = resourceInfo.detailPage
                this.$router.push({name: detailPageName, params: { uuid:self.resourceUuid }})
              };
            return content
          })
          result.push({
            data: {
              title: 'zwatchAlarm.resourceList',
              contentList: contentList,
              getStyle: () => self.$lang === 'en' ? 'margin-left: 0px;overflow: visible' : 'margin-left: 140px'
            },
            getStyle: () => 'padding-top: 0;height: 24px;',
            ctrl: DetailRowList
          })
        }
        return result
      },
      itemList () {
        let list = []
        let self = this;
        if (self.alarmUuid) {
          debugger
          let alarmUuid = self.alarmUuid
          let getValue = () => {
            if (self.alarmIsDeleted) return alarmUuid
                if (self.dbData.zwatchResourceAlarm[alarmUuid]) {
                  let name = self.dbData.zwatchResourceAlarm[alarmUuid].name
                  return self.getSystemALarmName(name)
                } else {
                    Utils.queryResourceByUuid('zwatch/alarms', alarmUuid, 'zwatchResourceAlarm', self)
              }
             if (_.get(self.dbData.zwatchResourceAlarm, 'alarmUuid')) return _.get(self.dbData.zwatchResourceAlarm, 'alarmUuid').name
          }
          list.push({
            data: {
              title: 'common.zwatchalarm',
              id: alarmUuid,
              contentList: [{
                  value: getValue(),
                  getStyle: () => {
                  },
                  canLink: () => { return !self.alarmIsDeleted && !self.param.hideResourceLink },
                  handler: () => {
                    self.$router.push({name: 'detailZwatchAlarm', params:{uuid:alarmUuid, currTab: 'zwatchResourceAlarm'}});
                  }
                }],
            },
            ctrl: DetailRowList
          })
        }
        return list
      },
      content () {
        if (_.get(this, 'model.content')) return _.get(this, 'model.content')
        if (_.get(this, 'model.getContent')) return this.model.getContent()
        return ''
      }
    },
    data(){
      return {
        message: this.keyMapMessage(),
        isDeleted: {},
        alarmIsDeleted: false
      }
    },
    methods: {
      //检查资源状态，如果删除则不能跳转
      checkResourceStatus: async function () {
        let uuidList = this.resourceUuid.split('|')
        if (AlarmMessageToResource[this.namespace]) {
          let path = AlarmMessageToResource[this.namespace].path
          uuidList.forEach(async uuid => {
            this.isDeleted[uuid] = await Utils.checkResourceIsDeletedByUuid(path, uuid, this)
          })
        }
        if (this.alarmUuid) {
          this.alarmIsDeleted = await Utils.checkResourceIsDeletedByUuid('zwatch/alarms', this.alarmUuid, this)
        }
      },
      //格式化消息
      formatMessage (message) {
        delete message['content']
        if (message.time) {
          message.time = this.formatDatetime(new Date(message.time))
        }
        if (message.emergencyLevel) {
          message.emergencyLevel = '●  ' + message.emergencyLevel
        }
        if (message.labels) {
          message.labels = JSON.stringify(message.labels, null, 4)
          message.labels = message.labels.replace(/\\/g, '')
        }
        if (message.error) {
          message.error = JSON.stringify(message.error, null, 4)
          message.error = message.error.replace(/\\/g, '')
        }
        return message
      },
      keyMapMessage () {
        let message = JSON.parse(window.localStorage.getItem('messageDetailItem'));
        let newMsg = {
          name: message.name || message.EVENT_NAME,
          resourceName: message.resourceName || message.EVENT_RESOURCE_NAME,
          alarmUuid: message.alarmUuid || message.ALARM_UUID,
          namespace: message.namespace || message.ALARM_NAMESPACE || message.EVENT_NAMESPACE,
          metricName: message.metricName || message.ALARM_METRIC || message.EVENT_NAME,
          accountUuid: message.accountUuid || message.ALARM_ACCOUNT_UUID || message.EVENT_ACCOUNT_UUID,
          resourceUuid: message.resourceUuid || message.resourceId || message.ALARM_RESOURCE_ID || message.EVENT_RESOURCE_ID,
          resourceType: message.resourceType || message.ALARM_RESOURCE_TYPE,
          alarmStatus: message.alarmStatus || message.ALARM_CURRENT_STATUS,
          dataUuid: message.dataUuid || message.ALARM_DATA_UUID || message.EVENT_DATA_UUID,
          alarmName: message.alarmname || message.ALARM_NAME,
          threshold: message.threshold || message.ALARM_THRESHOLD,
          period: message.period || message.ALARM_DURATION,
          labels: message.labels || message.ALARM_LABELS || message.EVENT_LABELS,
          metricValue: message.metricValue || message.ALARM_CURRENT_VALUE,
          comparisonOperator: message.comparisonOperator || message.ALARM_COMPARISON_OPERATOR,
          time: message.time || message.ALARM_TIME || message.EVENT_TIME,
          emergencyLevel: message.emergencyLevel || message.ALARM_EMERGENCY_LEVEL || message.EVENT_EMERGENCY_LEVEL,
          error: message.error || message.ALARM_ERROR || message.EVENT_ERROR,
          type: message.type
        }
        if (message.threshold === 0 || message.ALARM_THRESHOLD === 0) {
          newMsg.threshold = 0
        }
        if (message.metricValue === 0 || message.ALARM_CURRENT_VALUE === 0) {
          newMsg.metricValue = 0
        }
        return this.formatMessage(newMsg)
      },
      //复制所有信息
      copy: function () {
        if (typeof InstallTrigger !== 'undefined') { // firefox
          var range = document.createRange()
          range.selectNode(this.$refs.valueElm)
          window.getSelection().addRange(range)
          document.execCommand('copy')
          window.getSelection().removeAllRanges()
        } else {
          this.$nextTick(() => {
            var range = document.createRange()
            range.selectNode(this.$refs.valueElm)
            window.getSelection().removeAllRanges()
            this.$nextTick(() => {
              // var range = document.createRange()
              range.selectNode(this.$refs.valueElm)
              window.getSelection().addRange(range)
              document.execCommand('copy')
              window.getSelection().removeAllRanges()
            })
          })
        }
      },
    },
    destroyed(){
      window.localStorage.removeItem('messageDetailItem');
    }
  }
</script>

<style scoped>

</style>
