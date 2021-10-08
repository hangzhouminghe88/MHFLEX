<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云Vpc详情</span>
      <span class="detail-header-item create-back"
            @click="$router.push({name: 'hybridalicloudvpc'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">
          回到阿里云Vpc列表
        </span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('hybridvirtualprivatecloud.Actions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px 0px;" @click="detailDelete()">
                {{$t('common.destroy')}}
              </a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs v-model="activeName" class="detail-tab" tab-position="bottom">
        <el-tab-pane name="info" :label="$t('common.basicAttributes')"></el-tab-pane>
        <el-tab-pane name="vSwitch" :label="$t('hybridvswitch.vSwitch')"></el-tab-pane>
        <el-tab-pane name="virtualRoute" :label="$t('hybridaliyunvirtualrouter.virtualrouter')"></el-tab-pane>
        <el-tab-pane name="securityGroup" :label="$t('common.securityGroup')"></el-tab-pane>
        <el-tab-pane name="vpcVpnGateway" :label="$t('common.hybridvpcvpngateway')"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="vpc_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-show="hybridAliCloudVpc.status" :state="hybridAliCloudVpc.status"/>
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
              title: 'hybridvirtualprivatecloud.vpcId',
              content: hybridAliCloudVpc && hybridAliCloudVpc.ecsVpcId
            }"
          />
          <detail-row
            :param="{
              title: 'CIDR',
              content: hybridAliCloudVpc && hybridAliCloudVpc.cidrBlock
            }"
          />
          <detail-row
            :param="{
              title: 'hybridvirtualprivatecloud.ecsInstanceNum',
              content: hybridAliCloudVpc && getEcsInstanceNum(hybridAliCloudVpc.uuid)
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudVpc && hybridAliCloudVpc.createDate && formatDatetime(new Date(hybridAliCloudVpc.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudVpc && hybridAliCloudVpc.lastOpDate && formatDatetime(new Date(hybridAliCloudVpc.lastOpDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
         :param="{
           title: 'UUID',
           content: hybridAliCloudVpc && hybridAliCloudVpc.uuid
         }"
        />
        <detail-row
          :param="{
           title: 'common.hybriddatacenter',
           content: hybridAliCloudVpc && hybridAliCloudVpc.dataCenterName,
           handler: () => {
             $router.push({name: 'detailHybridAliCloudDataCenter',  params: {uuid: hybridAliCloudVpc.dataCenterUuid}})
           }
         }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vSwitch'">
      <hybrid-ali-cloud-v-switch-tab :param="{ conditions: `ecsVpcUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid,
                                     pageCreateVSwitch: pageCreateVSwitch, goToAliCloudVSwitch: goToAliCloudVSwitch}"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'virtualRoute'">
      <hybrid-ali-cloud-virtual-route-tab :param="{ conditions: `vpcUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, goToAliCloudVRouter: goToAliCloudVRouter }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'securityGroup'">
      <hybrid-ali-cloud-security-group-tab :param="{ conditions: `ecsVpcUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vpcVpnGateway'">
      <hybrid-ali-cloud-vpc-gateway-tab :param="{ conditions: `vSwitchUuid=${windowData.vSwitchUuidList}`, uuid: windowData.dataUuid }" />
    </div>

    <div slot="footer">
      <create-hybrid-ali-cloud-v-switch v-if="showCreateVSwitch"
                                        :param="createVSwitchParam"
                                        @close="showCreateVSwitch = false;"></create-hybrid-ali-cloud-v-switch>
      <detail-hybrid-ali-cloud-switch v-if="showAliCloudSwitch"
                                      :param="aliCloudSwitchParam"
                                      @close="showAliCloudSwitch=false"/>
      <detail-hybrid-ali-cloud-v-router v-if="showAliCloudVrouter"
                                        :param="aliCloudVrouterParam"
                                        @close="showAliCloudVrouter = false"/>
      <create-hybrid-ali-cloud-vroute-entry v-if="showCreateEntry"
                                            :param="createEntryParam"
                                            @close="showCreateEntry = false"/>
    </div>
  </detail-template>
</template>

<script>
  import CreateHybridAliCloudVrouteEntry from "../component/CreateHybridAliCloudVrouteEntry";
  import HybridAliCloudSecurityGroupTab from "../component/HybridAliCloudSecurityGroupTab";
  import HybridAliCloudVirtualRouteTab from "../component/HybridAliCloudVirtualRouteTab";
  import DetailHybridAliCloudVRouter from "../component/DetailHybridAliCloudVRouter";
  import CreateHybridAliCloudVSwitch from "../component/CreateHybridAliCloudVSwitch";
  import HybridAliCloudVpcGatewayTab from "../component/hybridAliCloudVpnGatewayTab";
  import DetailHybridAliCloudSwitch from "../component/DetailHybridAliCloudSwitch";
  import HybridAliCloudVSwitchTab from "../component/HybridAliCloudVSwitchTab";
  import DetailInfoState from "src/component/DetailInfoState";
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import  Methods from '../Methods';
  import { mapGetters } from 'vuex';
  import rpc from  'src/utils/rpc';

  export default {
    name: "DetailHybridAliCloudVpcPage",

    components: {
      HybridAliCloudVpcGatewayTab,
      CreateHybridAliCloudVrouteEntry,
      DetailHybridAliCloudVRouter,
      DetailHybridAliCloudSwitch,
      HybridAliCloudSecurityGroupTab,
      HybridAliCloudVirtualRouteTab,
      CreateHybridAliCloudVSwitch, HybridAliCloudVSwitchTab, DetailInfoState, DetailTemplate},

    mixins: [WindowBase, Methods],

    data() {
      return {
        activeName: 'info',
        showCreateVSwitch: false,
        createVSwitchParam: {},
        showAliCloudSwitch: false,
        aliCloudSwitchParam: {},
        aliCloudVrouterParam: {},
        showAliCloudVrouter: false,
        showCreateEntry: false,
        createEntryParam: {}
      }
    },

    provide() {
      return {
        detailAliCloudVpc: this
      }
    },

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudVpc/get'
      }),
      hybridAliCloudVpc() {
        let self = this;
        return self.get(self.windowData.dataUuid);
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.detailQuery
        }
      }).then( () => {
        self.detailQuery();
      }).then(() => {
        this.queryVSwitch()
        this.$forceUpdate()
      })
    },

    methods: {
      formatDatetime,
      //查询交换机
      queryVSwitch () {
        return rpc.query(`hybrid/aliyun/vswitch`, {
          q: `ecsVpcUuid=${this.windowData.dataUuid}`,
          fields: 'uuid'
        })
          .then(resp => {
            let vSwitchUuidList = resp.inventories.map((item) => item.uuid)
            return this.updateWindow({ vSwitchUuidList })
          })
      },

      //查看交换机详情
      goToAliCloudVSwitch(item) {
        let self = this;
        self.aliCloudSwitchParam = item;
        self.showAliCloudSwitch = true;
      },

      goToAliCloudVRouter(param) {
        let self = this;
        self.aliCloudVrouterParam = param;
        self.showAliCloudVrouter = true;
      },

      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridAliCloudVpc/basicQuery', {q: [`uuid=${self.windowData.dataUuid}`]})
      },

      updateResourceParam(name) {
        let self = this;
        return {
          getValue: () => {
            return self.hybridAliCloudVpc &&  self.hybridAliCloudVpc[name].replace(/ZStack-/ig,  '');
          },
          setValue: (newVal) => {
            if(self.hybridAliCloudVpc && _.isEqual(newVal, self.hybridAliCloudVpc[name])) return;
            let event = self.createEvent(`common.updateInfo${name}`, self.hybridAliCloudVpc.name);
            let param ={
              "uuid": self.windowData.dataUuid,
              "param": {
                [name]: newVal
              }
            }
            self.dispatchActionWithEvent('hybridAliCloudVpc/update',param , null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },

      pageCreateVSwitch(param) {
        let self = this;
        self.createVSwitchParam = param;
        self.showCreateVSwitch = true;
      },

      detailDelete() {
        let self = this, uuidList = [];
        uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          uuidList,
          title: 'hybridvirtualprivatecloud.DeleteVirtualPrivateCloud',
          description: 'hybridvirtualprivatecloud.delete',
          icon: 'vpc_popupico',
          warning:'hybridvirtualprivatecloud.info.deleteWarning',
          checkBoxText: "hybrid.deleteOrigin",
          isChecked: true,
          ok: (deleteOrigin) => {
            self.delete(deleteOrigin, uuidList)
              .then( () => {
                self.$router.push({name: 'hybridalicloudvpc'});
              });
          },
          getName:(uuid) => {
            return self.dbData.hybridVirtualPrivateCloud[uuid].name;
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .icon{
    .detail-icon('~assets/vpc_ico.svg')
  }
</style>
