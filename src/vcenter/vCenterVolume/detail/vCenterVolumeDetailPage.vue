<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">vCente云盘详情</span>
      <div class="detail-header-item create-back" @click="$router.push({name: 'vcentervolume'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到vCenter云盘列表</span>
      </div>
      <div class="detail-header-item ">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.volumeActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px" @click="model.state && model.state !== 'Enabled' && enabled([windowData.dataUuid], query)"
                 :class="{'disabled-text': model.state && model.state === 'Enabled'}"
                 v-if="model && model.status !== 'Deleted' && model.type !== 'Root'">{{$t('common.start')}}</a>
              <a @click="model.state && model.state !== 'Disabled' && disabled([windowData.dataUuid], query)"
                 :class="{'disabled-text': model.state && model.state === 'Disabled'}"
                 v-if="model && model.status !== 'Deleted' && model.type !== 'Root'">{{$t('common.stop')}}</a>
              <a v-permission="'VOLUME_VM.ATTACH'" @click="!isRoot() &&  canAttach() && attachVolume()"
                 :class="{'disabled-text': !canAttach() || isRoot()}"
                 v-if="model && model.status !== 'Deleted' && model.type !== 'Root'">{{$t("common.attach")}}</a>
              <a v-permission="'VOLUME_VM.DETACH'" @click="canDetach() &&  !isRoot() && detachVolume()"
                 :class="{'disabled-text': !canDetach() || isRoot()}"
                 v-if="model && model.status !== 'Deleted' && model.status !== 'NotInstantiated' && model.type !== 'Root'">{{$t("common.detach")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="!isRoot() && detailChangeResourceOwner()"
                 :class="{'disabled-text': isRoot()}"
                 v-if="dbData.common.isAdmin && model && model.status !== 'Deleted' && model.type !== 'Root'">{{$t("common.changeResourceOwner")}}</a>
              <a style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'" @click="!isRoot() && deleteVolume()"
                 v-if="model && model.status !== 'Deleted' && model.type !== 'Root'"
                 :class="{'disabled-text': isRoot()}">{{$t("common.destroy")}}</a>
              <a style="padding-top:12px;" @click="recoverVolume"
                 v-if="model && model.status === 'Deleted' && model.type !== 'Root'">{{$t("common.recover")}}</a>
              <a style="padding-bottom:12px;" v-permission="'VOLUME.EXPUNGE'" @click="expungeVolume"
                 v-if="model && model.status === 'Deleted' && model.type !== 'Root'">{{$t("common.expunge")}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <el-tabs v-model="currTab" tab-position="bottom"  class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="volume_large"/>
          <div class="after-icon">
            <detail-info-state v-if="model.state" :state="model.state" outer-class-name="detail-page-state"/>
            <detail-info-state v-if="model.status" :state="model.status" outer-class-name="detail-page-state"/>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header" v-text="$t('common.overview')"></div>

          <detail-row
            :param="{
              title: 'common.size',
              content: bytesToSize(model.size)
            }"
          />

          <detail-row
            :param="{
              title: 'common.actualSize',
              content: bytesToSize(model.actualSize)
            }"
          />

          <detail-row
            :param="{
              title: 'common.format',
              content: model.format
            }"
          />

          <detail-row
           :param="{
             title: 'common.type',
             content: model.type
           }"
          />

          <detail-row v-if="model.WWN"
            :param="{
              title: 'WWN',
              content: model.WWN
            }"
          />

          <detail-row
            :param="{
              title: 'common.owner',
              content: getResourceOwner(windowData.dataUuid),
              handler: ()=> {
                if(!(dbData.resourceOwner[windowData.dataUuid]
                && dbData.resourceOwner[windowData.dataUuid].uuid
                && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid]
                && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid)){
                  $router.push({name: 'detailAccount', params: {uuid: dbData.resourceOwner[windowData.dataUuid].uuid}})
                }
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
        <div class="detail-block-header" v-text="$t('common.moreInformation')"></div>

        <detail-row
          :param="{
            title: 'common.installPath',
            content: model.installPath,
            copy: true
          }"
        />

        <detail-row v-if="!model.isShareable"
          :param="{
            title: 'common.vm',
            content: dbData.vm[model.vmInstanceUuid] && dbData.vm[model.vmInstanceUuid].name,
            handler: () => {
              $router.push({'name': 'detailVCenterVmInstance', params:  {uuid: model.vmInstanceUuid}})
            }
          }"
        />

        <detail-row v-if="dbData.primarystorage[model.primaryStorageUuid]"
          :param="{
            title: 'common.primarystorage',
            content: dbData.primarystorage[model.primaryStorageUuid].name
          }"
        />

        <detail-row
          :param="{
            title: 'vCenter',
            content:  model.vCenterUuid && dbData.vCenters[model.vCenterUuid] && dbData.vCenters[model.vCenterUuid].name,
            handler: () => {
              $router.push({name: 'detailResource', params: {uuid: model.vCenterUuid}})
            }
          }"
        />

        <detail-row
          :param="{
            title: 'UUID',
            content: model.uuid,
            copy: true
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import vCenterVolumeDetailPage from 'src/vcenter/vCenterVolume/detail/vCenterVolumeDetailService';
  export  default vCenterVolumeDetailPage;
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .icon{
    .detail-icon('~assets/volume_large.svg')
  }
</style>
