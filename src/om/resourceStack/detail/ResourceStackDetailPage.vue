<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">资源栈详情</span>
     <span class="detail-header-item create-back" @click="$router.push({name: 'resourcestack'})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px">回到资源栈列表</span>
     </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('resourcestack.Actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" :class="{'disabled-text': !canResubmit()}" @click="canResubmit() && pageResubmit()">{{$t('resourcestack.resubmit')}}</a>
              <a style="margin-bottom: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('resourcestack.resourceStackContent')" name="resourceStackContent"></el-tab-pane>
        <el-tab-pane v-if="model && model.status === 'Created'" :label="$t('resourcestack.resource')" name="resource"></el-tab-pane>
        <el-tab-pane :label="$t('resourcestack.event')" name="event"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="detail_resource_stack"/>
          <div class="after-icon">
            <detail-info-state v-if="model && model.status" outer-class-name="detail-page-state" :state="model.status"/>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'common.owner',
              content: model && model.ownerName,
              handler(){
                $router.push({name: 'detailAccount', params: {uuid: model.ownerUuid}})
              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content:  model && model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content:  model && model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
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
           content:  model && model.uuid,
           copy: true
         }"
        />
        <detail-row
          :param="{
            title: 'resourcestack.reason',
            content:  model && model.reason,
            getContentClass(){
              return 'error-text'
            }
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'resourceStackContent'">
      <resource-stack-content :param="{ uuid: windowData.dataUuid, content: model && model.templateContent.replace(/ZStack::|ZStack/ig, ''), showTab: true }"></resource-stack-content>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'resource'">
      <resource-from-stack-tab :param="{ uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'event'">
      <event-tab :param="{conditions: [`stackUuid=${windowData.dataUuid}`], uuid: windowData.dataUuid}"></event-tab>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import ResourceStackDetailService from './ResourceStackDetailService';
  import EventTab from "../components/EventTab";
  import LogList from "../../../component/LogList";
  import ResourceFromStackTab from "../components/ResourceFromStackTab";
  export default {
    name: "ResourceStackDetailPage",
    components: {ResourceFromStackTab, LogList, EventTab},
    mixins: [ResourceStackDetailService]
  }
</script>

<style scoped lang="less">
 @import '../../../style/mixins.less';
  .icon{
    .detail-icon('~assets/detail_resource_stack.svg');
  }
</style>
