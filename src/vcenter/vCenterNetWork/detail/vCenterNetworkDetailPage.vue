<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">vCenter网络详情</span>
      <div class="detail-header-item create-back" @click="$router.push({name:'vcenternetwork'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">返回vCenter网络列表</span>
      </div>
      <div class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.privateNetworkActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="openDetailAddIpRange()">{{$t('common.addIpRange')}}</a>
              <a @click="openDetailAddDns()">{{$t('common.addDns')}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="dbData.l3network[windowData.dataUuid] && hasNotSharedToAll() && detailShareVCenterNetworkToAll()" :class="{ 'disabled-text': (dbData.l3network[windowData.dataUuid] && !hasNotSharedToAll())}">{{$t("common.shareToAll")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="dbData.l3network[windowData.dataUuid] && hasSharedToAll() && detailRecallVCenterNetworkFromAll()" :class="{ 'disabled-text': (dbData.l3network[windowData.dataUuid] && !hasSharedToAll())}">{{$t("common.recallFromAll")}}</a>
              <a style="padding-bottom: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
        <el-tab-pane :label="$t('common.cluster')" name="cluster"></el-tab-pane>
        <el-tab-pane :label="$t('common.netRange')" name="ipRanges"></el-tab-pane>
        <el-tab-pane label="DNS" name="dns"></el-tab-pane>
        <el-tab-pane :label="$t('common.share')" name="shared"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <div class="icon" :class="_classes"></div>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="name" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header" v-text="$t('common.overview')"></div>
          <detail-row
            :param="{
              title: 'common.networkType',
              content: model.networkServiceType ? $t(`l3network.type.${model.networkServiceType}`) : ''
            }"
          />
          <detail-row
            :param="{
              title: 'common.shareToAll',
              content: model && model.toPublic === true ? '是' : '否'
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
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">{{$t('common.moreInformation')}}</div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model.uuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
            title: 'common.l2network',
            content: model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].name
          }"
        />
        <detail-row
          :param="{
            title: 'common.type',
            content: model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].type
          }"
        />
        <detail-row v-if="(model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].type !== 'VxlanNetwork') && (model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].type !== 'VxlanNetworkPool')"
          :param="{
            title: 'common.physicalInterface',
            content: model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].physicalInterface
          }"
        />
        <detail-row v-if="(model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].type !== 'VxlanNetwork') && (model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].type !== 'L2NoVlanNetwork') && (model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].type !== 'VxlanNetworkPool')"
          :param="{
            title: 'vlan',
            content: model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].vlan
          }"
        />
        <detail-row v-if="model.system === false && model.networkServiceType === 'vrouter'"
          :param="{
            title: 'common.virtualRouterOffering',
            content: dbData.instanceOffering[windowData.virtualRouterOfferingUuid] && dbData.instanceOffering[windowData.virtualRouterOfferingUuid].name
          }"
        />
        <detail-row v-if="dbData.common.isAdmin"
          :param="{
            title: 'vCenter',
            content:dbData.l3networkA[windowData.dataUuid] && dbData.l3networkA[windowData.dataUuid].vCenterUuid && getVenterName(dbData.l3networkA[windowData.dataUuid].vCenterUuid),
            handler() {

            }
          }"
        />
        <div style="height: 40px" v-if="!model.system"></div>
        <div class="detail-block-header network-service-icon" v-if="!model.system">
          {{$t("common.networkService")}}
        </div>
        <div class="detail-row" v-if="model.system" v-for=" item in getNetworkService(model.networkServices) ">
          <div class="detail-title">
            {{item.networkServiceType}}
          </div>
        </div>
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'vm'">
      <v-center-vm-tab :param="{conditions: `vmNics.l3NetworkUuid=${windowData.dataUuid}`}"></v-center-vm-tab>
    </div>

    <div slot="body" class="detail-body"  v-if="currTab === 'cluster'">
      <cluster-tab-list :param="{conditions: `l2Network.uuid=${dbData.l3network[windowData.dataUuid].l2NetworkUuid}`, uuid: `${dbData.l3network[windowData.dataUuid].l2NetworkUuid}`}"></cluster-tab-list>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'ipRanges'">
     <ip-ranges-tab :param="{conditions: `l3Network.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, createIpRange: createIpRange}"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'dns'">
      <dns-tab :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'shared'">
      <share-tab-list :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'l3network'}"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}" />
    </div>

    <div slot="footer">
      <add-ip-range v-if="showAddIpRange" :param="addIpRangeMessage" @close="showAddIpRange = false;"/>
    </div>
  </detail-template>
</template>

<script>
  import vCenterNetworkDetailService from './vCenterNetworkDetailService';
  export default vCenterNetworkDetailService;
</script>

<style scoped>
  .icon{
    position: absolute;
    display: inline-block;
    width: 62px;
    height: 62px;
    background-repeat: no-repeat;
  }
  .private_network {
    background-image: url('~assets/private_network_ico.svg');
  }

  .public_network {
    background-image: url('~assets/public_network_ico.svg');
  }

  .system_network {
    background-image: url('~assets/system_network__ico.svg');
  }
</style>
