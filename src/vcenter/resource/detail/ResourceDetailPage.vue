<template>
  <detail-template>

    <div slot="header" class="detail-header">
      <span class="detail-title">基础资源详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'resource'})">
        <i class="el-icon-back"></i>
        <span class="detail-header-text">回到基础资源列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.vCenterActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a  style="padding-top: 12px;" @click="detailAsync()">{{$t('vcenter.sync')}}</a>
              <a  style="padding-bottom: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.cluster')" name="cluster"></el-tab-pane>
        <el-tab-pane :label="$t('common.primaryStorage')" name="primaryStorage"></el-tab-pane>
        <el-tab-pane :label="$t('common.backupStorage')" name="backupStorage"></el-tab-pane>
        <el-tab-pane :label="$t('common.host')" name="host"></el-tab-pane>
        <el-tab-pane :label="$t('common.pool')" name="pool"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="vcenter_management_large"/>
          <div class="after-icon">
            <detail-long-info-state outer-class-name="detail-page-state" v-if="model.state" :state="model.state"/>
            <detail-long-info-state outer-class-name="detail-page-state" v-if="model.status" :state="model.status"/>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header" v-text="$t('common.overview')"></div>

          <detail-row
            :param="{
              title: 'HTTP/HTTPS',
              content: model.https === true ? 'HTTPS' : 'HTTP'
            }"
          />

          <detail-row
            :param="{
              title: 'vcenter.domainName',
              content: model && model.domainName
            }"
          />

          <detail-row
            :param="{
             title: 'vcenter.portNum',
             content: model && model.port
          }"
          />

          <detail-row
            :param="{
              title: 'user.name',
              content: model && model.userName
            }"
          />

          <detail-row
            :param="{
              title: 'common.password',
              content: '******'
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
            title: 'UUID',
            content: model.uuid,
            copy: true
          }"
        />
        <div class="split-line"></div>
        <div class="detail-block-header" v-text="$t('ticket.resourceInfo')"></div>
        <detail-row
          :param="{
            title: 'vcenter.clusterCount',
            content: model.clusterUuids ? model.clusterUuids.length : 0
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.resourcePoolCount',
            content: subResources.resourcePoolCount
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.primaryStorageCount',
            content:  model.primarystorageUuids ? model.primarystorageUuids.length : 0
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.backupStorageCount',
            content: model.backupstorageUuids ? model.backupstorageUuids.length : 0
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.imageCount',
            content: subResources.imageCount
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.hostCount',
            content: subResources.hostCount
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.vmInstanceCount',
            content: subResources.vmInstanceCount
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.volumeCount',
            content: subResources.volumeCount
          }"
        />
        <detail-row
          :param="{
            title: 'vcenter.l3NetworkCount',
            content: subResources.l3NetworkCount
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'cluster'">
      <v-center-cluster-tab :param="{conditions: `uuid?=${model.clusterUuids}`}"></v-center-cluster-tab>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'primaryStorage'">
      <v-center-primary-storage-tab :param="{conditions: `uuid?=${model.primarystorageUuids}`, vCenterUuid: windowData.dataUuid}"></v-center-primary-storage-tab>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'backupStorage'">
      <v-center-backup-storage-tab :param="{conditions: `uuid?=${model.backupstorageUuids}`, vCenterUuid: windowData.dataUuid}"></v-center-backup-storage-tab>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'host'">
      <v-center-host-tab :param="{conditions: `clusterUuid?=${model.clusterUuids}`}"></v-center-host-tab>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"></log-list>
    </div>

    <div slot="body" class="detail-body" v-if="model && currTab === 'pool'">
      <v-center-pool-tab  :param="{conditions: `vCenterClusterUuid?=${model.clusterUuids}`, vCenterUuid: windowData.dataUuid}"></v-center-pool-tab>
    </div>

  </detail-template>
</template>

<script>
  import ResourceService from 'src/vcenter/resource/detail/ResourceDetailService';
  import LogList from "../../../component/LogList";

  export default {
    name: "ResourceDetailPage",
    components: {LogList},
    mixins: [ResourceService]
  }
</script>

<style scoped lang="less">
 @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/vcenter_management_large.svg');
  }
</style>
