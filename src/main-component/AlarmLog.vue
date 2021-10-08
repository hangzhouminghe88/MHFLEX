<style scoped lang="less">
  @prefixCls: ~'ticketMessage';
  .@{prefixCls} {
    &-notification {
      width: 360px;
      height: 435px;
      overflow: hidden;

      .el-dropdown-menu__item {
        height: auto !important;
        white-space: nowrap;
      }

      &-title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        &-left {
          display: inline-block;
          padding-left: 20px;
          font-size: 14px;
        }

        &-right {
          display: inline-block;
          padding-right: 20px;
          font-size: 12px;
          color: #409EFF;
          cursor: pointer;
        }
      }
    }

    &-content {
      display: block;
      line-height: 20px;
      font-size: 14px;
      margin-top: 7px;
      width: 290px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    &-date {
      display: block;
      line-height: 12px;
      font-size: 12px;
    }

    &-body {
      &-left {
        display: inline-block;
        position: relative;
        top: -10px;
        padding-right: 10px;
        margin-left: 20px;

        .light {
          top: 7px;
          margin-right: 10px;
          position: relative;
          float: left;
          height: 5px;
          width: 5px;
          border-radius: 50%;
        }
      }

      &-right {
        display: inline-block;
        position: relative;
      }
    }

    .unread {
      background-color: rgba(250, 253, 255, 1);
    }

    .item .read {
      background: #360;
    }

    .item .unread {
      background: #fafdff !important;
    }

    .el-dropdown-selfdefine {
      .el-badge__content.is-fixed {
        transform: translateY(0%) translateX(47%) !important;
      }
    }

    .unreadMessageCount {
      position: absolute;
      top: 1px;
      right: 1px;
      z-index: 9999;
      display: block;
      font-style: normal;
      min-width: 18px;
      min-height: 8px;
      border: 0;
      font-family: ArialMT;
      font-size: 10px;
      letter-spacing: 0;
      line-height: 16px;
      border-radius: 100px;
      text-align: center;
      background-color: #EC5960;
      color: #fff;
      padding: 1px;
    }

  }
  .notification_icon{
    display: inline-block;
    position: relative;
    width: 30px;
    height: 60px;
    line-height: 60px;
    font-size: 25px;
    top: 5px;
  }
</style>
<template>
  <el-dropdown :class="prefixCls">
    <div class="notification_icon">
      <i class="unreadMessageCount" v-if="unreadMessageTotal !== 0">{{ unreadMessageTotal }}</i>
      <!--<img src="../assets/notification.svg" style="width:40px;"/>-->
      <i class="icon-zhaoshengbaobiao" style="font-size: 30px; color: #fff;"></i>
    </div>
    <el-dropdown-menu style="margin-top:5px;overflow: hidden;">
      <div :class="[`${prefixCls}-notification`]">
        <div :class="[`${prefixCls}-notification-title`]">
          <span :class="[`${prefixCls}-notification-title-left`]">最近消息</span>
          <span :class="[`${prefixCls}-notification-title-right`]" @click="$router.push({name: 'messagecenter'})">查看全部></span>
        </div>
        <el-dropdown-item v-for="(message, index) in allMessageList" :command="message.name" :key="index"
                          style="padding: 16px 40px 16px 0;
              border-bottom: 1px solid #eef3f7">
          <div class="item" style="cursor: pointer;" :class="message.status === 'Unread' ? 'unread' : 'read'"
               @click.navtive="openMessage(message)">
            <div :class="`${prefixCls}-body`">
              <div :class="`${prefixCls}-body-left`">
                <div class="light"
                     :style="{ backgroundColor: message.status === 'Unread' ? '#EC5960' : '#fff' }"></div>
                <img class="icon" src="../assets/notification-waring.svg"/>
              </div>
              <div :class="`${prefixCls}-body-right`">
                <div :class="[`${prefixCls}-content`]">
                  {{ message.content }}
                </div>
                <div :class="[`${prefixCls}-date`]">
                  {{ formatDatetime(new Date(message.time)) }}
                </div>
              </div>
            </div>
          </div>
        </el-dropdown-item>
      </div>
    </el-dropdown-menu>
    <message-dialog :model="showDialog" :message="dialogMessage" @setModelVal="setModelVal"></message-dialog>
  </el-dropdown>
</template>

<script>
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  import Root from '../windows/Root';
  import ZWatchAlarmMethods from 'src/windows/ZWatchAlarm/Methods';
  import MessageCenterMethods from 'src/windows/MessageCenter/Methods';
  import MessageDialog from 'src/main-component/MessageDialog';

  const prefixCls = "ticketMessage";
  export default {
    name: "TicketMessage",
    mixins: [Root, ZWatchAlarmMethods, MessageCenterMethods],
    data() {
      return {
        prefixCls: prefixCls,
        eventListLengthLimit: 5,
        end_at: 0,
        messageList: [],
        // allMessageList: [],
        allEventMessageList: [],
        allAlarmMessageList: [],
        showDialog: false,
        dialogMessage: null
      }
    },
    components: {
      MessageDialog
    },
    mounted() {
      this.getCurrTime().then(() => {
        this.intAllMessage()
      })
      this.updateUnreadMessageCount();
    },
    destroyed() {
    },
    computed: {
      'allMessageList': function () {
        let list = this.dbData.common.recentlyMessageList || []
        return list
      },
      unreadMessageTotal() {
        if (!this.dbData.common.unreadMessageCount) return 0
        let count = parseInt(this.dbData.common.unreadMessageCount)
        if (count > 99) return '99+'
        return count
      },
    },
    methods: {
      ...Utils,
      async updateUnreadMessageCount() {
        let eventResp = await rpc.query('zwatch/events', {
          conditions: ['readStatus=Unread', 'emergencyLevel=Emergent'],
          count: true
        })
        let alarmResp = await rpc.query('zwatch/alarm-histories', {
          conditions: 'readStatus=Unread',
          count: true
        })
        let total = eventResp.total + alarmResp.total
        if (_.isNaN(total)) total = 0
        this.updateDbObject({
          name: 'common',
          data: {
            unreadMessageCount: total
          }
        })
      },
      toMessageCeneter() {
        let windows = this.$store.state.windowManager.windows
        Object.keys(windows).forEach(key => {
          if (key.indexOf('MessageCenterListPage') > -1) {
            if (_.get(windows, `${key}.methods.refresh`)) {
              let refresh = _.get(windows, `${key}.methods.refresh`)
              refresh()
            }
          }
        })
      },
      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
          })
      },
      openMessage(message) {
        message.mark(message.dataUuid)
          .then(() => this.updateUnreadMessageCount())
        this.dialogMessage = message;
        this.showDialog = true;
      },
      intAllMessage: async function () {
        await this.getAllAlarmMessage()
        await this.getAllEventMessage()
        let allMessageList = this.allAlarmMessageList.concat(this.allEventMessageList)
        allMessageList.sort((item1, item2) => {
          return item2.time - item1.time
        })
        this.updateDbObject({
          name: 'common',
          data: {
            recentlyMessageList: allMessageList
          }
        })
      },
      getAllAlarmMessage: async function () {
        let resp = await rpc.query('zwatch/alarm-histories', {
          limit: this.eventListLengthLimit,
          // startTime: this.start_at
          endTime: this.end_at
        })
        let histories = resp.histories
        histories.forEach(item => {
          item['content'] = this.getAlarmMessageContent(item)
          item['status'] = item.readStatus || 'Read'
          item.mark = this.markAlarmMessageAsRead
        })
        this.allAlarmMessageList = histories
      },
      getAllEventMessage: async function () {
        let resp = await rpc.query('zwatch/events', {
          limit: this.eventListLengthLimit,
          // startTime: this.start_at
          endTime: this.end_at,
          conditions: ['emergencyLevel=Emergent']
        })
        let events = resp.events
        events.forEach(item => {
          item['content'] = this.getEventMessageContent(item)
          item['status'] = item.labels.readStatus || 'Read'
          item.mark = this.markEventMessageAsRead
        })
        this.allEventMessageList = events
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

        function round() {
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
      },
      setModelVal(e) {
        this.showDialog = e;
      }
    },
  }
</script>
