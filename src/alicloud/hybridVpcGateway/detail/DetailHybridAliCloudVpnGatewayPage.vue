<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云VPN网关详情</span>
      <span class="detail-header-item">
        <span class="create-back" @click="$router.push({name: 'hybridalicloudvpcvpngateway'})">
          <i class="el-icon-back"></i>
          <span style="font-size: 12px;">
            回到VPN网关详情
          </span>
        </span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybridvpcvpngateway.Actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px 0px" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs v-model="currTab" tab-position="bottom" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybridvpcvpnconnection')" name="vpcVpnConnection"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="vpn_gateway_ico"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
           <div class="detail-block-header">
             {{$t('common.overview')}}
           </div>
          <detail-row
            :param="{
              title: 'hybridvpcvpngateway.ip',
              content: hybridAliCloudVpcVpnGateway && hybridAliCloudVpcVpnGateway.publicIp
            }"
          />
          <detail-row
            :param="{
              title: 'hybridvpcvpngateway.spec',
              content: hybridAliCloudVpcVpnGateway && hybridAliCloudVpcVpnGateway.spec
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudVpcVpnGateway && formatDatetime(new Date(hybridAliCloudVpcVpnGateway.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudVpcVpnGateway && formatDatetime(new Date(hybridAliCloudVpcVpnGateway.lastOpDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
         <div style="height: 40px;"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
           title: 'UUID',
           content: windowData.dataUuid,
           copy: true
          }"
        />
        <detail-row
          :param="{
           title: 'common.hybrididentityzone',
           content: hybridAliCloudVpcVpnGateway && hybridAliCloudVpcVpnGateway.vSwitchUuid && getIdentityZoneName(windowData.dataUuid),
           handler: () => {
             $router.push({name: 'detailHybridAliCloudIdentityZone', params: {uuid: dbData.hybridVpcVpnGateway[windowData.dataUuid].identityZoneUuid}})
           }
          }"
        />
        <detail-row
          :param="{
           title: 'VPC',
           content: hybridAliCloudVpcVpnGateway && hybridAliCloudVpcVpnGateway.vSwitchUuid && getEcsVpcName(windowData.dataUuid),
           handler: () => {
             $router.push({name: 'detailHybridAliCloudVpc', params: {uuid: dbData.hybridVpcVpnGateway[windowData.dataUuid].ecsVpcUuid}})
           }
          }"
        />
        <detail-row
          :param="{
           title: 'hybridvswitch.vSwitch',
           content: hybridAliCloudVpcVpnGateway && hybridAliCloudVpcVpnGateway.vSwitchName,
           handler: () => {
             goToAliCloudVSwitch({uuid: dbData.hybridVpcVpnGateway[windowData.dataUuid].vSwitchUuid, type: 'gateWay'})
           }
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'vpcVpnConnection'">
      <hybrid-ali-cloud-vpc-connection-tab :param="{ conditions: `vpnGatewayUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <detail-hybrid-ali-cloud-switch v-if="showAliCloudSwitch"
                                      :param="aliCloudSwitchParam"
                                      @close="showAliCloudSwitch=false"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from "src/utils/utils";
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';
  import { mapGetters } from 'vuex';
  import DetailHybridAliCloudSwitch from "../../hybridVpc/component/DetailHybridAliCloudSwitch";
  import HybridAliCloudVpcConnectionTab from "../component/HybridAliCloudVpcConnectionTab";

  export default {
    name: "DetailHybridAliCloudVpnGatewayPage",

    mixins: [WindowBase, Methods],

    data() {
      return {
        currTab: 'info',
        showAliCloudSwitch: false,
        aliCloudSwitchParam: {},
      }
    },

    components: {HybridAliCloudVpcConnectionTab, DetailHybridAliCloudSwitch, DetailTemplate},

    computed: {
      ...mapGetters(['hybridAliCloudVpcGateway/get']),
      hybridAliCloudVpcVpnGateway() {
        let self = this;
        return self['hybridAliCloudVpcGateway/get']([self.windowData.dataUuid]);
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
      }).then(() => {
        self.detailQuery();
      })
    },

    methods: {
      formatDatetime,

      goToAliCloudVSwitch(item) {
        let self = this;
        self.aliCloudSwitchParam = item;
        self.showAliCloudSwitch = true;
      },

      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridAliCloudVpcGateway/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        });
      },

      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.hybridAliCloudVpcVpnGateway[name];
          },
          setValue: (newVal) => {
            if(newVal === this.hybridAliCloudVpcVpnGateway[name]) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.hybridAliCloudVpcVpnGateway.name);
            let realParam ={
              uuid: this.windowData.dataUuid,
              param: {
                [name]: newVal
              }
            }
            return this.dispatchActionWithEvent('hybridAliCloudVpcGateway/update', realParam, null, event);
          },
          canEdit:() => {
            return true;
        }
        }
      },

      detailDelete() {
        let self = this,uuidList = [];
        uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybridvpcvpngateway.delete',
          description: 'hybridvpcvpngateway.deleteVpnGateway',
          uuidList,
          icon: 'vpn_gateway_popupico',
          getName: (uuid) => {
            return self.dbData.hybridVpcVpnGateway[uuid].name;
          },
          ok: () => {
            self.delete(uuidList)
              .then( () => {
                self.$router.push({name: 'hybridalicloudvpcvpngateway'});
              });
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
 @import "../../../style/mixins";

  .icon{
    .detail-icon('~assets/vpn_gateway_ico.svg')
  }
</style>
