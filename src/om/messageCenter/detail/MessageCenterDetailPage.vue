<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">消息中心详情</span>
     <span class="detail-header-item create-back" @click="$router.push({name:'messagecenter'})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px">回到消息中心列表</span>
     </span>
    </div>
    <div slot="body" class="detail-body">
      <div>
        <div class="left-header">
          <base-icon name="notification_large"/>
          <div style="font-size: 24px; color: #1A2736; display: inline-block; padding-left: 30px; width: 560px;margin-left: 60px;height: 60px;">
                <span style="word-break: break-all;display: inline-block; line-height: 60px;" v-if="content">
                    <template v-if="msgType === 'event'">
                      {{ getEventMessageContent(message) }}
                    </template>
                    <template v-else>
                      {{ getAlarmMessageContent(message) }}
                    </template>
                </span>
          </div>
        </div>
        <div class="detail-block-header" style="margin-top:30px;">
          {{$t('common.overview')}}
          <div class="btn-primary" style="position: absolute;right: 86px;font-size: 12px;padding:4px 20px;"  @click="copy()">{{$t('common.copy')}}</div>
        </div>
        <div class="left-body" ref="valueElm">
          <component class="item-container message-center-item" v-for="(item, index) in resourceList" :key="index" style="margin-top:19px; margin-bottom: 14px;" :getStyle="item.getStyle()" :param="item.data" :is="item.ctrl"></component>
          <component class="item-container" v-for="(item, index) in itemList" :key="item.alarmUuid" :param="item.data" :is="item.ctrl"></component>
          <div v-if="msgType === 'event'">
            <detail-row :param="{
                    title: 'zwatchAlarm.namespace',
                    content: message.namespace
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.resourceUuid',
                    content: message.resourceUuid,
                    copy: true,
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.time',
                    content: message.time
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.emergencyLevel',
                    content: message.emergencyLevel,
                    getContentClass: () => 'content-pre',
                    getStyle: () => {
                      return {
                        'color': '#EC5960'
                      }
                    }
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.labels',
                    content:  message.labels,
                    getDetailRowClass: () => 'detail-row-pre',
                    getContentClass: () => 'content-pre'
                }"/>
            <detail-row v-if="message.error" :param="{
                    title: 'zwatchAlarm.error',
                    content: message.error,
                    getDetailRowClass: () => 'detail-row-pre',
                    getContentClass: () => 'content-pre'
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.dataUuid',
                    content: message.dataUuid,
                    copy: true
                }"/>
          </div>
          <div v-if="msgType==='alarm'">
            <!--<detail-row :data="{
                title: 'zwatchAlarm.monitoralarm',
                content: getAlarmMetricName(message),
                canLink: true
            }"/>-->
            <detail-row :param="{
                    title: 'zwatchAlarm.namespace',
                    content: message.namespace
                }"/>
            <!-- <detail-row :data="{
                title: 'zwatchAlarm.resourceNum',
                content: message.resourceNum
            }"/> -->
            <detail-row v-if="message.resourceUuid" :param="{
                    title: 'zwatchAlarm.resourceUuid',
                    content: message.resourceUuid,
                    copy: true
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.conditions',
                    content: getAlarmMessageContent(message)
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.metricValue',
                    content: getAlarmResourceUnit(message)
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.period',
                    content: message.period + ' ' + $t('time.second')
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.time',
                    content: message.time
                }"/>
            <detail-row :param="{
                    title: 'zwatchAlarm.dataUuid',
                    content: message.dataUuid,
                    copy: true
                }"/>
          </div>
        </div>
      </div>
    </div>
  </detail-template>
</template>

<script>
  import DetailService from './DetailService';

  export default {
    name: "MessageCenterDetailPage",
    mixins: [DetailService]
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";

  .icon {
    .detail-icon("~assets/notification_large.svg")
  }
</style>
