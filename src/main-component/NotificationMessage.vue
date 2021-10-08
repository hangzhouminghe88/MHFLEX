<template>
  <el-dropdown placement="bottom-start" @visible-change="visibleChange">
    <div class="recentoperation_icon">
      <i :class="`${prefixCls}-icon`" class="icon-caozuorizhi" style="font-size: 22px; color: #fff;"/>
    </div>
    <el-dropdown-menu style="height: 100%;margin-top:15px;overflow: hidden">
      <div :class="[`${prefixCls}-operation`]">
        <div :class="[`${prefixCls}-notification-title`]">
          <span :class="[`${prefixCls}-notification-title-left`]">{{$t("common.recentlyActions")}}</span>
          <span :class="[`${prefixCls}-notification-title-right`]" @click="$router.push({name: 'operationlog'})"
                style="cursor: pointer">{{$t('operationLog.checkAll')}}></span>
        </div>
        <el-tabs>
          <div :class="[`${prefixCls}-operation-item`]">
            <span :class="[`${prefixCls}-operation-item-2`]"
                  @click.capture="setCurrentTab('finish')">{{$t('operationLog.completed')}}</span>
            <span :class="[`${prefixCls}-operation-item-1`]"
                  @click.capture="setCurrentTab('running')">{{$t('operationLog.processing') + `(${$data.processingCount})`}}</span>
          </div>
          <div :class="`${prefixCls}-operation-item-active`" ref="active"></div>
          <div v-if="currentTab === 'running'" :class="[`${prefixCls}-operation-left`]">
            <div v-if="processingCount===0" style="font-size: 14px;text-align: center;padding: 20px 0px;">{{
              $t("operationLog.noProcessing") }}
            </div>
            <div v-if="processingCount>0">
              <el-dropdown-item v-for="(data, index) in incompleteList" :key="index" @click.native="openMessage(data)">
                <div :class="`${prefixCls}-running-body`">
                  <div :class="`${prefixCls}-running-body-left`">
                    <img src="~assets/notification_running.svg"/>
                  </div>
                  <div :class="`${prefixCls}-running-body-right`">
                    <div  style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" :title="$t(data.action, data) ">
                      {{ $t(data.action, data)}}
                    </div>
                    <div class="progress-container" v-if="dbData.messageProgress[data.id]">
                      <div class="progress">
                        <div class="progress-bar"
                             :style="{width: `${dbData.messageProgress[data.id].progress}%`}"></div>
                      </div>
                      <span class="progress-num">{{dbData.messageProgress[data.id].progress + '%'}}</span>
                    </div>
                    <div class="date" style="margin-top: 3px; font-size: 12px;line-height: 2">
                      {{formatDatetime(new Date(data.time))}}
                    </div>
                  </div>
                </div>
              </el-dropdown-item>
            </div>
          </div>
          <div v-if="currentTab === 'finish'" :class="[`${prefixCls}-operation`]">
            <el-dropdown-item v-for="(message, index) in  $data.completedList" :key="index" style="padding: 16px 40px 16px 0;
              border-bottom: 1px solid #eef3f7" @click.native="openMessage(message)">
              <div :class="`${prefixCls}-finish-body-left`">
                <img v-if="message.status === 'UNDONE'" src="~assets/notification_running.svg"/>
                <img v-if="message.status === 'ERR'" src="~assets/notification_error.svg"/>
                <img v-if="message.status === 'MIX'" src="~assets/notification_warning.svg"/>
                <img v-if="message.status === 'OK'" src="~assets/notification_success.svg"/>
              </div>
              <div :class="`${prefixCls}-finish-body-right`">
                <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" :title="$t(message.action, message) ">
                  {{ $t(message.action, message) }}
                </div>
                <div class="date">
                  {{ formatDatetime(new Date(message.time)) }}
                </div>
              </div>
            </el-dropdown-item>
          </div>
        </el-tabs>
      </div>
    </el-dropdown-menu>
    <notification-message-detail style="line-height: 25px;" :model="showMessageDialog" :message="detailMessage"
                                 @changShowVal="() => showMessageDialog = false"></notification-message-detail>
  </el-dropdown>
</template>

<script>
  import Utils from 'src/utils/utils';
  import Root from 'src/windows/Root';
  import NotificationMessageDetail from '../main-component/NotificationMessageDetail';

  const prefixCls = 'notification';
  export default {
    name: "NotificationMessage",
    mixins: [Root],
    data() {
      return {
        currentTab: 'finish',
        prefixCls: prefixCls,
        processingCount: 0,
        incompleteList: null,
        completedList: null,
        timerId: `timerTask-${this.genUniqueId()}`,
        showMessageDialog: false,
        detailMessage: null,
        startTimerTask: false
      }
    },
    components: {
      NotificationMessageDetail
    },
    mounted() {
      let self = this;
      self.$refs.active.style.transform = 'translateX(0)';
      this.queryLocalStorageMessage()
    },
    methods: {
      ...Utils,
      setCurrentTab(tab) {
        let self = this;
        self.startTimerTask = false;
        if (tab && tab !== self.currentTab) {
          self.currentTab = tab;
        }
        if (tab && tab === 'running') {
          self.startTimerTask = true;
          self.startTask();
          self.$refs.active.style.transform = 'translateX(100%)';
        }
        if (tab && tab === 'finish') {
          self.$refs.active.style.transform = 'translateX(0)';
        }
      },

      startTask()  {
        this.addTimerTask({
          id: this.timerId,
          interval: 4,
          stopFlag: () => {
            if(this.startTimerTask && this.incompleteList.length>0) return false;
            return true;
          },
          method: () => {
            this.queryLocalStorageMessage()
          }
        })
      },
      visibleChange(e) {
        let self = this;
        if (e) {
          self.currentTab = 'finish';
          self.$refs.active.style.transform = 'translateX(0)';
        }
        self.queryLocalStorageMessage();
      },
      queryLocalStorageMessage: async function () {
        let incompleteList = []
        let eventListName = `eventList-${this.getIdentityUuid()}`
        let eventList = JSON.parse(this.getEventDataFromWindow(eventListName))
        if (!eventList) eventList = []
        eventList.forEach((eventId) => {
          let event = JSON.parse(this.getEventDataFromWindow(eventId))
          if (event) {
            if (event.projectUuid) {
              if (this.dbData.common.currProject && this.dbData.common.currProject.uuid === event.projectUuid) incompleteList.push(event)
            } else {
              incompleteList.push(event)
            }
          }
        })
        let longJobListName = `longJobList-${this.getIdentityUuid()}`
        let longJobList = JSON.parse(this.browserLocalStorageGetItem(longJobListName))
        if (!longJobList) longJobList = []
        longJobList.forEach((longJob) => {
          let longJobId = longJob.id
          let event = JSON.parse(this.browserLocalStorageGetItem(longJobId))
          if (event) {
            if (event.projectUuid) {
              if (this.dbData.common.currProject && this.dbData.common.currProject.uuid === event.projectUuid) incompleteList.push(event)
            } else {
              incompleteList.push(event)
            }
          }
        })
        this.$data.incompleteList = incompleteList.sort((a, b) => {
          return b.time - a.time
        })
        this.$data.processingCount = incompleteList.length;
        let completedList = await this.getActionList()
        this.$data.completedList = completedList
      },
      openMessage: function (message) {
        if (message)
          this.detailMessage = message;
        this.showMessageDialog = true;
      }
    },

    destroyed () {
      this.removeTimerTask(this.$data.timerId)
    },
  }
</script>

<style scoped lang="less">
  @prefixCls: ~"notification";
  .@{prefixCls} {
    &-operation {
      width: 300px;
      height: 100%;
      border-radius: 2px;
    }

    &-operation-right {
      display: inline-block;
    }

    &-operation-left {
      display: inline-block;
      width: 100%;
    }

    &-operation-item {
      width: 100%;
      display: flex;
      border-bottom: 1px solid #e4e7ed;
      height: 30px;
      line-height: 30px;
      cursor: pointer;
      //.isActive{
      //  border-bottom: 1px solid #409EFF;
      //  transition: border-bottom .3s cubic-bezier(.645,.045,.355,1);
      //}
      &-1 {
        display: inline-block;
        flex: 1 1 50%;
        text-align: center;
        font-size: 14px;
      }

      &-2 {
        display: inline-block;
        flex: 1 1 50%;
        text-align: center;
        font-size: 14px;
      }

      &-active {
        width: 49%;
        background-color: #409eff;
        height: 2px;
        transition: transform .3s cubic-bezier(.645, .045, .355, 1);
      }
    }

    &-notification-title {
      font-size: 16px;
      padding: 20px;

      &-left {
        float: left;
      }

      &-right {
        float: right;
        font-size: 14px;
        color: #409EFF;
      }
    }

    &-icon {
      vertical-align: middle;
    }

    &-finish-body-left {
      display: inline-block;
      padding-right: 10px;
      margin-left: 20px;
      position: relative;
      top: -8px;
      height: 29px;
    }

    &-finish-body-right {
      display: inline-block;
      width: 200px;
      font-size: 14px;
      line-height: 16px;
      padding-left: 10px;

      .date {
        height: 20px;
        font-size: 12px;
      }
    }

    &-running-body {
      width: 100%;
      padding: 16px 40px 16px 0px;
      border-bottom: 1px solid #eef3f7;
      position: relative;
    }

    &-running-body-left {
      display: inline-block;
      vertical-align: middle;
      position: absolute;
      top: 25px;
    }

    &-running-body-right {
      display: inline-block;
      margin-left: 30px;
    }
  }

  .recentoperation_icon {
    display: inline-block;
    position: relative;
    width: 32px;
    height: 60px;
    line-height: 60px;
    font-size: 25px;
  }

  .progress-container {
    display: inline-block;
    width: 150px;
    line-height: 0;
  }

  .progress {
    width: 80%;
    display: inline-block;
    height: 5px;
    border-radius: 5px;
    line-height: 5px;
    background: #dae0e6;
    border: #eef3f7;
    position: relative;
  }

  .progress-num {
    display: inline-block;
    margin-left: 10px;
    width: 4%;
  }

  .progress-bar {
    background: #409EFF;
    height: 100%;
    border-radius: 5px;
  }

  .progress-bar:before {
    content: '';
    height: 5px;
    line-height: 5px;
    position: relative;
    top: -2px;
    width: 100%;
    display: inline-block;
    border-radius: 5px;
    background-image: linear-gradient(#52C4FF, #52C4FF);
    animation: progress-keyframe 1s ease-in infinite;
  }

  @keyframes progress-keyframe {
    from {
      background: #fff;
      width: 0;
      opacity: 0.2;
    }
    to {
      background: #409EFF;
      width: 100%;
      opacity: 1;
    }
  }
</style>
