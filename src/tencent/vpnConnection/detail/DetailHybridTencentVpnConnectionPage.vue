<template>
 <detail-template>
   <div slot="header" class="detail-header">
     <span class="detail-title">
       阿里云VPN连接详情
     </span>
     <span class="detail-header-item" @click="close()">
       <span class="create-back el-icon-back">
         回到VPN连接列表
       </span>
     </span>
     <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">{{$t('hybridvpcvpnconnection.Actions')}}</span>
         </span>
         <span slot="content">
           <div class="dropdown-content">
             <a style="padding: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
           </div>
         </span>
       </drop-down>
     </span>
     <el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
       <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
     </el-tabs>
   </div>

   <div slot="body" class="detail-body" v-if="activeName === 'info'">
     <div class="left">
       <div class="left-header">
         <div class="icon"></div>
         <div class="after-icon">
           <detail-info-state outer-class-name="detail-page-state" v-show="tencentVpnConnection && tencentVpnConnection.status" :state="tencentVpnConnection.status"/>
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
             title: 'hybridvpcvpnconnection.localSubnet',
             content: tencentVpnConnection && tencentVpnConnection.localSubnet,
             copy: true
           }"
         />

         <detail-row
           :param="{
             title: 'hybridvpcvpnconnection.remoteSubnet',
             content: tencentVpnConnection && tencentVpnConnection.remoteSubnet,
             copy: true
           }"
         />

         <detail-row
           :param="{
             title: 'common.createDate',
             content: tencentVpnConnection && tencentVpnConnection.createDate && formatDatetime(new Date(tencentVpnConnection.createDate))
           }"
         />

         <detail-row
           :param="{
             title: 'common.lastOpDate',
             content: tencentVpnConnection && tencentVpnConnection.lastOpDate && formatDatetime(new Date(tencentVpnConnection.lastOpDate))
           }"
         />

       </div>
       <div class="split-line" style="border-bottom:none;"></div>
     </div>
     <div class="right">
       <div style="height: 40px"></div>
       <div class="detail-block-header">
         {{$t('common.moreInformation')}}
       </div>
       <detail-row
         :param="{
           title: 'common.uuid',
           content: tencentVpnConnection && tencentVpnConnection.uuid,
           copy: true
         }"
       />
       <div class="split-line">
         {{$t('hybridvpcipsecconfig.ipsec')}}
       </div>

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.encodeAlgorithm',
           content: tencentVpnConnection && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid] && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid].encodeAlgorithm
         }"
       />

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.authAlgorithm',
           content: tencentVpnConnection && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid] && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid].authAlgorithm
         }"
       />

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.dhGroups',
           content:  tencentVpnConnection && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid] && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid].pfs
         }"
       />

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.salifetime',
           content:  tencentVpnConnection && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid] && dbData.hybridTencentVpcIpSecConfig[tencentVpnConnection.ipsecConfigUuid].lifetime
         }"
       />

       <div class="split-line">
         {{$t('common.hybridVpcIkeConfig')}}
       </div>

       <detail-row
         :param="{
           title:'hybridvpcikeconfig.encodeAlgorithm',
           content: tencentVpnConnection && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid] && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid].encodeAlgorithm
         }"
       />

       <detail-row
         :param="{
           title:'hybridvpcikeconfig.dhGroups',
           content: tencentVpnConnection && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid] && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid].pfs
         }"
       />

       <detail-row
         :param="{
          title:'hybridvpcikeconfig.salifetime',
           content: tencentVpnConnection && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid] && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid].lifetime
         }"
       />

       <detail-row
         :param="{
           title:'MHFLEX端IP',
           content: tencentVpnConnection && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid] && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid].localIp
         }"
       />

       <detail-row
         :param="{
           title:'腾讯云远端IP',
           content: tencentVpnConnection && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid] && dbData.hybridTencentVpcIkeConfig[tencentVpnConnection.ikeConfigUuid].remoteIp
         }"
       />
     </div>
   </div>
 </detail-template>
</template>

<script>
  import DetailInfoState from "src/component/DetailInfoState";
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import { mapGetters } from 'vuex';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "DetailHybridTencentVpnConnectionPage",

    components: {DetailInfoState, DetailTemplate},

    mixins: [WindowBase],

    data() {
      return {
        activeName: 'info'
      }
    },

    computed: {
      ...mapGetters({
        get: 'hybridTencentVpcVpnConnection/get'
      }),
      tencentVpnConnection() {
        return this.get([this.windowData.dataUuid]);
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.detailQuery,
          refresh: self.detailQuery
        }
      }).then( () => {
        self.detailQuery();
      })
    },

    methods: {
      formatDatetime,

      ...{
        delete: Methods.methods.delete
      },

      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridTencentVpcVpnConnection/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        }).then( () => {
          return self.updateWindow({
            ikeConfigUuid: self.tencentVpnConnection.ikeConfigUuid,
            ipsecConfigUuid: self.tencentVpnConnection.ipsecConfigUuid
          }).then(() => {
            self.queryIKE()
            self.queryIPSec()
          })
        })
      },

      queryIKE () {
        const self = this
        return rpc.query(`hybrid/tencent/vpn-connection/ike/${self.windowData.ikeConfigUuid}`)
          .then(resp => {
            self.updateDbRow({
              tableName: 'hybridTencentVpcIkeConfig',
              id: self.windowData.ikeConfigUuid,
              data: resp.inventories[0]
            }).then(() => {
              self.$forceUpdate()
            })
          })
      },
      queryIPSec () {
        const self = this
        return rpc.query(`hybrid/tencent/vpn-connection/ipsec/${self.windowData.ipsecConfigUuid}`)
          .then(resp => {
            return self.updateDbRow({
              tableName: 'hybridTencentVpcIpSecConfig',
              id: self.windowData.ipsecConfigUuid,
              data: resp.inventories[0]
            }).then(() => {
              self.$forceUpdate()
            })
          })
      },


      //更新名称描述
      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.tencentVpnConnection && this.tencentVpnConnection[name];
          },
          setValue: (newVal) => {
            if(this.tencentVpnConnection && this.tencentVpnConnection[name] && this.tencentVpnConnection[name] === newVal) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.tencentVpnConnection.name),
              param= {
               uuid: this.windowData.dataUuid,
                param: {
                 [name]: newVal
                }
              }
            this.dispatchActionWithEvent('hybridTencentVpcVpnConnection/update', param, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },

      detailDelete() {
        let self = this, uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybridvpcvpnconnection.delete',
          description: 'hybridvpcvpnconnection.deleteVpcVpnConnection',
          uuidList,
          icon: 'vpn_connection_popupico',
          isChecked: true,
          checkBoxText: '同时删除腾讯云上资源',
          getName: (uuid) => {
            return self.dbData.tencentVpnConnection[uuid].name;
          },
          ok: (isOrigin) => {
            self.delete(uuidList, isOrigin).then(() => self.close())
          }
        })
      },

      //回到VPN连接列表
      close() {
        let self = this;
        self.$router.push({name: 'hybridtencentvpnconnection'});
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";

 .split-line{
   border-bottom:0.5px solid #5e6978;
   padding: 10px 0px;
   color: #1a2736;
   font-size: 16px;
 }

  .icon{
    .detail-icon('~assets/vpn_connection_ico.svg')
  }
</style>
