<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import MessageCenterMethods from './Methods';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "List",
    mixins: [WindowBase, MessageCenterMethods, MultiSelectList],
    components: {PageTemplate},
    data() {
      let self = this;
      return {
        currTab: 'messageCenter',
        currMessageList: [],
        allEventMessageList: [],
        allAlarmMessageList: [],
        end_at: '',
        start_at: '',
        date: new Date(),
        pickerOptions0: {
          disabledDate: (time) => {

          }
        },
        pickerOptions1: {
          disabledDate: (time) => {
            let self = this;
            return time.getTime() < self.start_at;
          }
        },
        optionList: [
          {
            text: self.$t('message.all'),
            value: 'all'
          },
          {
            text: self.$t('zwatchAlarm.read'),
            value: 'read'
          },
          {
            text: self.$t('zwatchAlarm.unRead'),
            value: 'unread'
          }
        ],
        alarmType: 'all',
        contentType: 'all',
        optionAlarmList: [
          {
            text: self.$t('message.all'),
            value: 'all'
          },
          {
            text: self.$t('zwatchAlarm.zwatchResourceAlarm'),
            value: 'alarm'
          },
          {
            text: self.$t('zwatchAlarm.zwatchEventAlarm'),
            value: 'event'
          }
        ]
      }
    },
    computed: {
      getContentTitle() {
        let self = this;
        return `${self.$t('zwatchAlarm.messageContent')}(${_.find(self.optionList, ['value', self.contentType]).text})`
      },
      getAlarmTitle() {
        let self = this;
        return `${self.$t('zwatchAlarm.messageType')}(${_.find(self.optionAlarmList, ['value', self.alarmType]).text})`
      },
      start_time: {
        get() {
          let self = this;
          return new Date(self.start_at);
        },
        set(val) {
          let self = this;
          self.start_at = val;
        }
      },
      end_time: {
        get() {
          let self = this;
          return new Date(self.end_at);
        },
        set(val) {
          let self = this;
          self.end_at = val;
        }
      },
    },
    created() {
      const initTab = 'alarm'
      this.updateWindow({
        currItemUuid: '',
        currMessage: null,
        // zwatchIndex,
        currTab: initTab,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        showSearchBox: false,
        operationLogCount: 0,
        systemMessageCount: 0,
        currMessageList: [] ,
        loading: false,
        methods: {
          queryList: this.queryList,
          refresh: this.refresh
        }
      }).then(() => {
        this.getCurrTime().then(() => {
          this.queryList()
        })
      })
    },
    methods: {
      handleChangeDate(value){
        let self = this;
        if(Date.parse(self.start_time) > Date.parse(self.end_time)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },
      handleSelectMessageType(e) {
        let self = this;
        self.alarmType = e;
        self.queryList();
      },
      handleSelectContent(e) {
        let self = this;
        self.contentType = e;
        self.queryList();
      },
      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
            self.start_at = self.end_at - 259200000
            self.updateWindow({
              end_at: self.end_at,
              start_at: self.start_at
            })
          })
      },
      queryList: async function () {
        this.updateWindow({
          currMessage: null
        })
        let currMessageList = []
        if (this.alarmType === 'all') {
          currMessageList = currMessageList.concat(await this.getAllAlarmMessage(), await this.getAllEventMessage())
        } else {
          currMessageList = this.alarmType === 'alarm' ? await this.getAllAlarmMessage() : await this.getAllEventMessage()
        }
        currMessageList.sort((item1, item2) => {
          return item2.time - item1.time
        })
        this.currMessageList = currMessageList.length > 300 ? currMessageList.splice(0, 300) : currMessageList
        this.updateWindow({
          allCount: this.currMessageList.length
        })
        this.chunkList(this.windowData.pageSize)
      },
      getAllAlarmMessage: async function () {
        const self = this
        self.windowData.loading = true;
        let param = {
          limit: 300,
          startTime: this.start_time.getTime(),
          endTime: this.end_time.getTime()
        }
        let statusCondition = this.getStatusCondition()
        if (statusCondition) {
          param['conditions'] = statusCondition
        }
        let resp = await rpc.query('zwatch/alarm-histories', param)
        let histories = resp.histories
        histories.forEach(item => {
          if (!item.dataUuid) item['dataUuid'] = self.genUniqueId()
          item['getContent'] = () => this.getAlarmMessageContent(item)
          item['status'] = item.readStatus || 'Read'
          item.mark = this.markAlarmMessageAsRead
          item.type = 'alarm'
        })
          self.windowData.loading = false;
        return histories
      },
      getAllEventMessage: async function () {
        const self = this
         self.windowData.loading = true;
        let param = {
          limit: 300,
          startTime: self.start_time.getTime(),
          endTime: self.end_time.getTime(),
          conditions: ['emergencyLevel=Emergent']
        }
        let statusCondition = this.getStatusCondition()
        if (statusCondition) {
          param['conditions'].push(statusCondition)
        }
        let resp = await rpc.query('zwatch/events', param)
        let events = resp.events
        events.forEach(item => {
          if (!item.dataUuid) item['dataUuid'] = self.genUniqueId()
          item['getContent'] = () => self.getEventMessageContent(item)
          item['status'] = item.labels.readStatus || 'Read'
          item.mark = self.markEventMessageAsRead
          item.type = 'event'
        })
        self.windowData.loading = false;
        return events
      },
      chunkList: function (size = 20) {
        this.messageList = _.chunk(_.cloneDeep(this.currMessageList), size)
        let currMessageList = this.messageList[this.windowData.pageIndex - 1]
        let count = this.messageList.length === 0 ? 1 : this.messageList.length
        let obj = {
          pageCount: count,
          currMessageList
        }
        if (this.windowData.pageIndex > count) obj.pageIndex = count
        this.updateWindow(obj)
      },
      getMessageAlarmType: function (message) {
        if (!_.get(message, ['type'])) return ''
        return _.get(message, ['type']) === 'alarm' ? this.$t('zwatchAlarm.zwatchResourceAlarm') : this.$t('zwatchAlarm.zwatchEventAlarm')
      },
      getStatusCondition() {
        let val = this.contentType
        let obj = {
          'all': '',
          'read': 'Read',
          'unread': 'Unread'
        }
        let value
        if (val === 'all') {
          value = ''
        } else {
          value = `readStatus=${obj[val]}`
        }
        return value
      },
      clickRow: function (value) {
        value.mark(value.dataUuid).then(() => this.updateUnreadMessageCount())
        this.updateWindow({
          currMessage: value,
          currItemUuid: value.dataUuid
        })
      },
      openDialogForMarkingAllAsRead(){
        let self = this;
        self.openDialog('ConfirmDlg',{
          title: "zwatchAlarm.markAllMessageAsRead",
          icon: '',
          description: 'zwatchAlarm.markAsReadConfirm',
          ok: () => {
            this.markAllAsRead(this.alarmType)
              .then(() => {
                this.queryList()
                this.updateUnreadMessageCount()
              })
          }
        })
      },
      ...Utils
    },
    watch: {
      'dbData.common.recentlyMessageList': {
        deep: true,
        handler: function (val, oldVal) {
          let self =  this;
          if (_.isEqual(val, oldVal)) return
          if (!Array.isArray(val)) return
          if(!self.windowData.currMessageList) return;
          val.forEach(it => {
            self.currMessageList.forEach(item => {
              if (item.dataUuid === it.dataUuid) {
                item.status = it.status
              }
            })
            let currMessageList = _.cloneDeep(self.windowData.currMessageList)
            let canUpdate = false
            currMessageList.forEach(item => {
              if (item.dataUuid === it.dataUuid) {
                item.status = it.status
              }
            })
            if (canUpdate) {
              self.updateWindow({
                currMessageList
              })
            }
          })
        }
      },
    }
  }
</script>

<style scoped>

</style>
