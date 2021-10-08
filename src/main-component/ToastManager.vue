<template>
  <div>
    <message-dialog :model="showDialog" :message="detailMessage" @setModelVal="()=>showDialog=false"></message-dialog>
    <notification-message-detail :model="showMessageDialog" :message="notificationDetailMessage" @changShowVal="() => showMessageDialog = false"></notification-message-detail>
    <div class="toast-container">
      <div v-for="(item, index) in toastList" :key="index">
        <div class="toast alarm" v-if="item.type === 'ticketMessage'" :class="getAlarmClassList(item)">
          <span class="text" style="margin-left: 15px;" :title="item.message.content">{{ item.message.content }}</span>
          <i @click="deleteToast($event, item)" style="position: absolute; right: 15px; top: 18px; cursor: pointer;" class="el-alert__closebtn el-icon-close" ></i>
        </div>
        <div class="toast alarm" v-if="item.type === 'alarmMessage'" :class="getAlarmClassList(item)" @click="()=>{showDialog = true; detailMessage = item}">
          <span class="icon">
            <i class="icon-zhaoshengbaobiao"></i>
          </span>
          <span class="text" :title="item.message.content">{{ item.message.content }}</span>
          <i @click="deleteToast($event, item)" style="position: absolute; right: 15px; top: 18px; cursor: pointer;" class="el-alert__closebtn el-icon-close"></i>
        </div>
        <div v-if="item.type !== 'ticketMessage' && item.type !== 'alarmMessage'" class="toast" @click="item.type !== 'textMessage' && openNoticeMessage(item)" :class="getClass(item)">
          <!-- <div v-for="item in toastList" class="toast success"> -->
          <span class="icon" />
          <span class="text" :title="$t(item.action, { name: `'${item.name}'` })" v-if="item.count === 1 && item.name !== undefined">{{ $t(item.action, { name: `"${item.name}"` }) }}</span>
          <span class="text" :title="$t(item.action, { name: '' })" v-if="item.count > 1 || item.name === undefined">
          <span style="width: 120px;">{{ $t(item.action, { name: '' }) }}</span>
          <span v-if="item.resultType === 'success'">成功 {{ item.count }}</span>
          <span v-if="item.resultType === 'fail'">失败 {{ item.count }}</span>
        </span>
          <!--<img @click="deleteToast($event, item)" style="position: absolute; right: 15px; top: 18px; cursor: pointer;" src="~assets/close.svg" />-->
          <i @click="deleteToast($event, item)" class="el-alert__closebtn el-icon-close" style="color: #ccc;font-size:16px"></i>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import MessageDialog from 'src/main-component/MessageDialog';
  import NotificationMessageDetail from './NotificationMessageDetail'
  /* eslint no-unused-vars: ["error", { "varsIgnorePattern": ".*" }] */

  export default {
    name: 'ToastManager',
    mixins: [WindowBase],
    components: {
      MessageDialog,
      NotificationMessageDetail
    },
    created: function () {
    },
    data: function () {
      return {
        longJobActions: [
          'vm.action.storageMigrateRootVolume',
          'volume.action.storageMigrateDataVolume',
          'image.action.storageMigrateImage',
          'volume.action.createRootImage',
          'volume.action.createDataImage',
          'vm.action.createImage',
          'image.action.add',
          'virtualRouterImage.action.add',
          'snapshot.action.delete',
          'snapshot.action.revert'
        ],
        detailMessage: {},
        notificationDetailMessage: {},
        showDialog: false,
        showMessageDialog: false
      }
    },
    methods: {
      getAlarmClassList (item) {
        let obj = {}
        if (item.message.ALARM_CURRENT_STATUS) {
          if (item.message.ALARM_CURRENT_STATUS === 'OK') {
            obj['success'] = true
          } else if (item.message.ALARM_CURRENT_STATUS !== 'OK') {
            obj['other'] = true
          }
        } else if (item.message.EVENT_EMERGENCY_LEVEL) {
          if (item.message.EVENT_EMERGENCY_LEVEL === 'Emergent') {
            obj['fail'] = true
          } else if (item.message.EVENT_EMERGENCY_LEVEL === 'Normal') {
            obj['other'] = true
          } else {
            obj['other'] = true
          }
        } else if (item.message.ticket) {
          if (item.message.status === 'Pending') {
            obj['running'] = true
          } else if (item.message.status === 'FinalApproved') {
            obj['success'] = true
          } else if (item.message.status === 'Rejected') {
            obj['fail'] = true
          }
        }
        return obj
      },
      getClass (item) {
        let obj = { 'running': (item.successCount + item.failCount) < item.count, 'success': item.successCount === item.count || item.resultType === 'success', 'fail': item.failCount === item.count || item.resultType === 'fail', 'other': (item.successCount + item.failCount) >= item.count && item.failCount !== item.count && item.successCount !== item.count }
        return obj
      },
      deleteToast: function ($event, item) {
        this.destroyToast(item.id)
        if (this.longJobActions.indexOf(item.action) > -1) {
          let longJobListName = `longJobList-${this.getIdentityUuid()}`
          let longJobList = JSON.parse(this.browserLocalStorageGetItem(longJobListName))
          longJobList.forEach(longJob => {
            if (longJob.id === item.id) {
              longJob.hasToast = false
            }
          })
          this.browserLocalStorageSetItem(longJobListName, JSON.stringify(longJobList))
        }
        $event.stopPropagation()
      },
      openNoticeMessage(item) {
        let self = this;
        self.notificationDetailMessage = {};
        self.notificationDetailMessage = item;
        self.showMessageDialog = true;
      },
      ...Utils
    },
    computed: {
      toastList: function () {
        let list = []
        Object.keys(this.$store.state.toastManager.toasts).forEach(_id => {
          list.push(this.$store.state.toastManager.toasts[_id])
        })
        list.sort((a, b) => {
          return a.time - b.time
        })
        return list
      }
    }
  }
</script>

<style scoped>
  .toast-container {
    position: absolute;
    z-index: 6000;
    top: 60px;
    width: 300px;
    right: 10px;
    /*bottom: 0px;*/
  }

  .toast {
    position: relative;
    font-size: 14px;
    color: #1A2736;
    height: 54px;
    line-height: 54px;
    /*text-align: center;*/
    margin-top: 10px;
    border-radius: 2px;
    cursor: pointer;
  }

  .toast .icon {
    position: absolute;
    display: block;
    left: 18px;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
  }

  .toast .text {
    display: block;
    margin-left: 60px;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toast.alarm {
    border: 1px solid rgb(255, 70, 76);
    background-color: #FFFCFC;
    border-left: 2px solid yellow;
  }

  .toast.alarm.other {
    border: 1px solid rgb(255, 70, 76);
    background-color: #FFFCFC;
    border-left: 2px solid yellow;
  }

.toast.alarm .icon .icon-zhaoshengbaobiao {
    display: inline-block;
    font-size: 25px;
    color: #f36a2f;
  }

.toast.alarm.other .icon{
  background-image: none;
}

  .toast.alarm.other .icon .icon-zhaoshengbaobiao{
    display: inline-block;
    font-size: 25px;
    color: #f36a2f;
  }

  .toast.alarm .icon{
    width: 100%;
    height: 100%;
    display: inline-block;
    vertical-align: middle;
    line-height: 30px;
  }

  .toast.alarm .other{
    width: 100%;
    height: 100%;
    display: inline-block;
    vertical-align: middle;
  }

  .toast.success {
    border: 1px solid rgba(69,187,121,0.30);
    background-color: #FAFFFC;
  }

  .success .icon {
    top: 17px;
    height: 20px;
    width: 20px;
    background-image: url('~assets/notification_success.svg');
    animation: none;
  }

  .toast.running {
    border: 1px solid #ABD8FA;
    background-color: #F5FBFF;
  }

  .running .icon {
    top: 18px;
    height: 18px;
    width: 20px;
    border-radius: 100%;
    background-image: url('~assets/notification_running.svg');
    animation:run 2s linear infinite;
    background-repeat: no-repeat;
  }

  @keyframes run {
    　from {
      transform:rotate(0deg);
    } to {
        transform:rotate(360deg);
      }
  }

  .toast.fail {
    border: 1px solid #F7BABC;
    background-color: #FFFCFC;
  }

  .fail .icon {
    top: 17px;
    height: 20px;
    width: 20px;
    background-image: url('~assets/notification_error.svg');
  }

  .toast.other {
    border: 1px solid #FFD883;
    background-color: #FFFBF4;
  }

  .other .icon {
    top: 17px;
    height: 20px;
    width: 20px;
    background-image: url('~assets/notification_warning.svg');
  }

</style>
