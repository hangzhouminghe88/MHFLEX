<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">报警器详情</span>
      <span class="create-back detail-header-item" @click="$router.push({name: 'zwatchendpoint'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到报警器列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('zwatchEndpoint.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" :class="{'disabled-text': instate('Enabled')}" @click="!instate('Enabled') && pageEnable('Enabled');">{{$t('common.enable')}}</a>
              <a :class="{'disabled-text': instate('Disabled')}" @click="!instate('Disabled') && pageEnable('Disabled')">{{$t('common.disable')}}</a>
              <a @click="detailAddAlarm()">{{$t('zwatchTopic.addAlarm')}}</a>
              <a :class="{'disabled-text': model.uuid && !canRemoveAlarm(windowData.dataUuid)}" @click="model.uuid && canRemoveAlarm(windowData.dataUuid) && detailRemoveAlarm()">{{$t('zwatchTopic.removeAlarm')}}</a>
              <a style="margin-bottom: 12px;" :class="{ 'disabled-text': isSystemEndpointUuid([windowData.dataUuid]) }" @click="!isSystemEndpointUuid([windowData.dataUuid]) && detailDestroy()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.zwatchalarm')" name="zwatchalarm"></el-tab-pane>
        <el-tab-pane :label="$t('zwatchAlarm.alarmLog')" name="alarmLog"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="zwatch_endpoint_ico"/>
          <div class="after-icon">
            <detail-info-state v-if="model.state" outer-class-name="detail-page-state" :state="model.state"/>
          </div>
          <detail-name class="name" v-if="model.name" :param="updateResourceParam('name')"/>
          <detail-description class="description" v-if="model.description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'zwatchEndpoint.type',
              content: getZWatchEndpointType(windowData.dataUuid)
            }"
          />
          <detail-row
            :param="{
              title: 'zwatchEndpoint.urlAddress',
              content: getZWatchEndpointAddress(windowData.dataUuid),
              copy: true
            }"
          />
          <detail-row
            v-if="model.type && model.type === 'email'"
            :param="{
             title: 'zwatchEndpoint.emailServer',
             content: getPlatformName(windowData.dataUuid),
             handler(){

             }
            }"
          />
          <detail-row
           v-if="model.type && model.type === 'DingTalk'"
           :param ="{
             title: 'zwatchEndpoint.target',
             content: getZwatchDingTalkEndpointMember(windowData.dataUuid)
           }"
          />
          <detail-row-list class="editable"
            v-if="model.type && model.type === 'DingTalk' && model.atPersonPhoneNumbers && model.atPersonPhoneNumbers.length>0"
            :param="{
              title: 'zwatchEndpoint.appointMember',
             contentList:model.atPersonPhoneNumbers,
             canEdit: true,
             handler(){
               editAtPersonPhoneNumbers();
             }
            }"
          />
          <detail-row class="editable"
            v-if="model.atPersonPhoneNumbers && model.atPersonPhoneNumbers.length===0"
            :param="{
              title: 'zwatchEndpoint.appointMember',
              editable: () => {
                return true;
              },
              handler(){
               editAtPersonPhoneNumbers();
              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model.uuid && model.uuid,
            copy: true
          }"
        />
      </div>
    </div>
    <div slot="body" v-if="currTab === 'zwatchalarm'" class="detail-body">
      <zwatch-alarm-tab :param="{conditions: `actions.actionUuid=${dbData.zwatchTopic[windowData.dataUuid].uuid}`, uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" v-if="currTab === 'log'" class="detail-body">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" v-if="currTab == 'alarmLog'" class="detail-body">
      <alarm-log-list :param="{endpointUuid: windowData.dataUuid}" />
    </div>
  </detail-template>
</template>

<script>
  import DetailService from "./DetailService";
  export default {
    name: "ZwatchEndPointDetailPage",
    mixins: [DetailService],
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/zwatch_endpoint_ico.svg')
  }
</style>
