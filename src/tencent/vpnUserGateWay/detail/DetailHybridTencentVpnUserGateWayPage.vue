<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">腾讯云对端网关详情</span>
      <span class="detail-header-item create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到腾讯云对端网关列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybridvpcuservpngateway.Actions')}}</span>
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
      <el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybridvpcvpnconnection')" name="vpcVpnConnection"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
       <div class="left-header">
         <div class="icon"></div>
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
              title: 'MHFLEX '+$t('common.ip'),
              content: tencentUserVpnGateway && tencentUserVpnGateway.ip,
              copy: true
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: tencentUserVpnGateway && tencentUserVpnGateway.createDate && formatDatetime(new Date(tencentUserVpnGateway.createDate)),
            }"
          ></detail-row>
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: tencentUserVpnGateway && tencentUserVpnGateway.lastOpDate && formatDatetime(new Date(tencentUserVpnGateway.lastOpDate)),
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
            content: windowData.dataUuid,
            copy: true
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vpcVpnConnection'">
      	<hybrid-tencent-vpn-connection-tab :param="{conditions: `userGatewayUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"/>
    </div>

  </detail-template>
</template>

<script>

import HybridTencentVpnConnectionTab from 'src/tencent/vpnGateWay/component/HybridTencentVpnConnectionTab';
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
	import { mapGetters } from 'vuex';
	import Methods from '../Methods';

  export default {

    name: "DetailHybridTencentUserVpcVpnGatewayPage",

    components: {DetailTemplate, HybridTencentVpnConnectionTab},

    mixins: [WindowBase, Methods],

    computed: {
      ...mapGetters({
        get: 'hybridTencentVpcUserGateway/get'
      }),
      tencentUserVpnGateway() {
        let self = this;
        return self.get([self.windowData.dataUuid]);
      }
    },

    data() {
      return {
        activeName: "info"
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
      })
    },

    methods: {
      formatDatetime,

      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridTencentVpcUserGateway/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },

			close() {
				this.$router.push({name:'hybridtencentvpnusergateway'})
			},
      updateResourceParam(name){
        return {
          getValue: () => {
            return this.tencentUserVpnGateway[name];
          },
          setValue: (newVal) => {
            if(newVal === this.tencentUserVpnGateway[name]) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.tencentUserVpnGateway.name);
            let updateParam = {
              uuid: this.windowData.dataUuid,
              param: {
                [name]: newVal
              }
            }
            this.dispatchActionWithEvent('hybridTencentVpcUserGateway/update', updateParam, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },

      // 删除网关
      detailDelete() {
        let self = this,uuidList = [];
        uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybridvpcuservpngateway.delete',
          description: 'hybridvpcuservpngateway.deleteConfirm',
          uuidList,
          icon: 'vpn_gateway_popupico',
          isChecked: true,
          checkBoxText: '同时删除腾讯云上资源',
          getName: (uuid) => {
            return self.tencentUserVpnGateway.name;
          },
          ok: (isOrigin) => {
            self.delete(uuidList, isOrigin)
              .then( () => {
                self.close();
              });
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/user_gateway_ico.svg')
  }
</style>
