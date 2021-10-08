<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云用户网关详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name:'hybridalicloudvpcuservpngateway'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到阿里云用户网关列表</span>
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
         <base-icon name="user_gateway_ico"/>
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
              content: hybridAliCloudUserVpnGateway &&hybridAliCloudUserVpnGateway.ip,
              copy: true
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudUserVpnGateway && hybridAliCloudUserVpnGateway.createDate && formatDatetime(new Date(hybridAliCloudUserVpnGateway.createDate)),
            }"
          ></detail-row>
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudUserVpnGateway && hybridAliCloudUserVpnGateway.lastOpDate && formatDatetime(new Date(hybridAliCloudUserVpnGateway.lastOpDate)),
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
      <hybrid-ali-cloud-vpc-connection-tab :param="{ conditions: `userGatewayUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>

  </detail-template>
</template>

<script>
  import HybridAliCloudVpcConnectionTab from "src/alicloud/hybridVpcGateway/component/HybridAliCloudVpcConnectionTab";
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import { mapGetters } from 'vuex';
  import Methods from '../Methods';

  export default {

    name: "DetailHybridAliCloudUserVpcVpnGatewayPage",

    components: {HybridAliCloudVpcConnectionTab, DetailTemplate},

    mixins: [WindowBase, Methods],

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudUserVpnGateway/get'
      }),
      hybridAliCloudUserVpnGateway() {
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
        return self.dispatchAction('hybridAliCloudUserVpnGateway/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },

      updateResourceParam(name){
        return {
          getValue: () => {
            return this.hybridAliCloudUserVpnGateway[name];
          },
          setValue: (newVal) => {
            if(newVal === this.hybridAliCloudUserVpnGateway[name]) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.hybridAliCloudUserVpnGateway.name);
            let updateParam = {
              uuid: this.windowData.dataUuid,
              param: {
                [name]: newVal
              }
            }
            this.dispatchActionWithEvent('hybridAliCloudUserVpnGateway/update', updateParam, null, event);
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
          checkBoxText: self.$t('hybrid.deleteOrigin'),
          getName: (uuid) => {
            return self.dbData.hybridVpcUserVpnGateway[uuid].name;
          },
          ok: (isOrigin) => {
            self.delete(uuidList, isOrigin)
              .then( () => {
                self.$router.push({name:'hybridalicloudvpcuservpngateway'});
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
