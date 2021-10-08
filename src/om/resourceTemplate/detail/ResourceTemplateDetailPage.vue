<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">资源栈模板详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'resourcestacktemplate'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到资源栈模板列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('resourcestacktemplate.Actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" :class="{'disabled-text': instates(true)}" @click="!instates(true) && detailEnable(true)">{{$t('common.enable')}}</a>
              <a :class="{'disabled-text': instates(false)}" @click="!instates(false) && detailEnable(false)">{{$t('common.disable')}}</a>
              <a :class="{'disabled-text': instates(false)}" @click="!instates(false) && openGenerateResourceStack(windowData.dataUuid)">{{$t('resourcestacktemplate.generateResourceStack')}}</a>
              <a @click="openModifyResourceStack(model.uuid)">{{$t("resourcestacktemplate.modify")}}</a>
              <a :class="{'disabled-text': model.toPublic === true}" @click="model.toPublic !== true && detailShareToAll()">{{$t("common.shareToAll")}}</a>
              <a :class="{'disabled-text': model.toPublic === false}" @click="model.toPublic !== false && detailRecallFromAll()">{{$t("common.recallFromAll")}}</a>
              <a @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('resourcestacktemplate.resourceStackTemplateContent')" name="resourceStackTemplateContent"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="detail_template"/>
          <div class="after-icon">
            <detail-info-state :state="String(model.state)" outer-class-name="detail-page-state"></detail-info-state>
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
              title: 'common.shareToAll',
              content: model.toPublic ? $t('common.yes') : $t('common.no')
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
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model.uuid,
            copy:  true
          }"
        />
        <detail-row
          :param="{
            title: 'md5sum',
            content: model.md5sum,
            copy:  true
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'resourceStackTemplateContent'">
      <resource-stack-content :param="{ uuid: windowData.dataUuid, content: model.content.replace(/ZStack::|ZStack/ig, ''), showTab: false }"/>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import ResourceTemplateDetailService from './ResourceTemplateDetailService';
  export default {
    name: "ResourceTemplateDetailPage",
    mixins: [ResourceTemplateDetailService]
  }
</script>

<style scoped lang="less">
  @import  '../../../style/mixins';
  .icon{
    .detail-icon('~assets/detail_template.svg')
  }
</style>
