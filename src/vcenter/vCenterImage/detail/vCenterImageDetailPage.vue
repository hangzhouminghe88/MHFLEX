<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">vCenter镜像详情</span>
      <div class="detail-header-item create-back" @click="$router.push({name: 'vcenterimage'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到vCenter镜像列表</span>
      </div>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.imageActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" :class="{'disabled-text': inStates('Enabled')}" @click="!inStates('Enabled') && detailStartOrStop('Enabled')" v-if="!inStates('Deleted')">{{$t('common.start')}}</a>
              <a :class="{'disabled-text': inStates('Disabled')}" @click="!inStates('Disabled') && detailStartOrStop('Disabled')" v-if="!inStates('Deleted')">{{$t('common.stop')}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="!inStates('Delete') && !model.toPublic && detailShareImageToAll()" :class="{ 'disabled-text': inStates('Delete') || model.toPublic}"
                 v-if="dbData.common.isAdmin && !inStates('Deleted')">{{$t("common.shareToAll")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="!inStates('Delete') && !model.toPublic && detailRecallImageFromAll()" :class="{ 'disabled-text': !inStates('Delete') || model.toPublic}"
                 v-if="dbData.common.isAdmin && !inStates('Deleted')">{{$t("common.recallFromAll")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="detailChangeResourceOwner()"
                 v-if="dbData.common.isAdmin && !inStates('Deleted') && $route.params.currTab !== 'exported'">{{$t("common.changeResourceOwner")}}</a>
              <a v-permission="'IMAGE.DELETE'" style="padding-bottom:12px;" @click="!inStates('Deleted') && deleteImage('delete')" v-if="!inStates('Deleted') && !model.exportUrl">{{$t("common.destroy")}}</a>
              <a v-permission="'IMAGE.DELETE'" @click="model.exportUrl && deleteImage('deleteExportImage')" v-if="model.exportUrl && !inStates('Deleted')">{{$t("common.destroy")}}</a>
              <a style="padding-top:12px;" v-permission="'IMAGE.RECOVER'" @click="inStates('Deleted') && detailRecoverImage()" :class="{ 'disabled-text': !inStates('Deleted')}" v-if="$route.params.currTab === 'destroyed' && inStates('Deleted')">{{$t("common.recover")}}</a>
              <a style="padding-bottom:12px;" v-permission="'IMAGE.EXPUNGE'" @click="inStates('Deleted') && deleteImage('expunge')" v-if="$route.params.currTab === 'destroyed' && inStates('Deleted')">{{$t("common.expunge")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.share')" name="share"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="image_large"/>
          <div class="after-icon">
            <detail-info-state v-show="model.state" outer-class-name="detail-page-state" :state="model.state"/>
            <detail-info-state v-show="model.status" outer-class-name="detail-page-state" :state="model.status"/>
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
              title: 'common.shareToAll',
              content: model.toPublic ? $t('common.yes') : $t('common.no')
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
              title: 'image.imageType',
              content: $t(`image.${model && model.mediaType === 'DataVolumeTemplate' ? 'volumeImage' : 'systemImage'}`)
            }"
          />
          <detail-row
            :param="{
              title: 'common.format',
              content: model.format
            }"
          />
          <detail-dropdown
            :param="{
              getTitle:() => $t('common.platform'),
              getOptionList: () =>  {
                 return platformList
              },
              getIndex: () => {
                return platformList.findIndex((item) => {
                  return model.platform === item;
                })
              },
              setIndex: (index) => {
                if(platformList[index] === model.platform) return;
                 updateResource('images', 'updateImage', 'platform', 'image', platformList[index], query);
              },
            }"
          />
          <detail-row
            :param="{
              title: 'common.owner',
              content: getResourceOwner(model.uuid),
              handler: () => {
                if(!(dbData.resourceOwner[windowData.dataUuid]
                 && dbData.resourceOwner[windowData.dataUuid].uuid
                 && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid]
                 && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid)){
                   $router.push({name: 'detailAccount', params:{uuid:  dbData.resourceOwner[windowData.dataUuid].uuid }})
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
        <div style="height: 40px"></div>
        <div class="detail-block-header" v-text="$t('common.moreInformation')"></div>
        <detail-row
          :param="{
              title: 'URL',
              content: model.url,
              copy: true
            }"
        />
        <detail-row
          :param="{
              title: 'common.imageInstallPath',
              content: model.backupStorageRefs && model.backupStorageRefs[0].installPath,
              copy: true
            }"
        />
        <detail-row
          :param="{
            title: 'common.backupStorage',
            content: model.backupStorageRefs && dbData.backupstorage[model.backupStorageRefs[0].backupStorageUuid] && dbData.backupstorage[model.backupStorageRefs[0].backupStorageUuid].name
          }"
        />
        <detail-row
          :param="{
            title: 'vCenter',
            content: dbData.imageA[windowData.dataUuid] && dbData.imageA[windowData.dataUuid].vCenterUuid && dbData.vCenters[dbData.imageA[windowData.dataUuid].vCenterUuid] && dbData.vCenters[dbData.imageA[windowData.dataUuid].vCenterUuid].name,
            handler: () => {
              $router.push({name: 'detailResource', params: {uuid: dbData.imageA[windowData.dataUuid].vCenterUuid}})
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

    <div slot="body" class="detail-body" v-if="currTab === 'share'">
      <account-share-tab-list :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'image'}" />
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import vCenterImageDetailService from './vCenterImageDetailService'

  export default {
    name: "vCenterImageDetailPage",
    mixins: [vCenterImageDetailService]
  }
</script>

<style scoped lang="less">
  @import '../../../style/mixins.less';
  .icon{
    .detail-icon('~assets/image_large.svg');
  }
</style>
