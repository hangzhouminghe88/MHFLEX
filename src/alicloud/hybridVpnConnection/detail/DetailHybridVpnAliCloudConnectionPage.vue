<template>
 <detail-template>
   <div slot="header" class="detail-header">
     <span class="detail-title">
       阿里云VPN连接详情
     </span>
     <span class="detail-header-item" @click="$router.push({name: 'hybridalicloudvpcvpnconnection'})">
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
         <base-icon name="vpn_connection_ico"/>
         <div class="after-icon">
           <detail-info-state outer-class-name="detail-page-state" v-show="hybridAliCloudVpnConnection && hybridAliCloudVpnConnection.status" :state="hybridAliCloudVpnConnection.status"/>
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
             content: hybridAliCloudVpnConnection && hybridAliCloudVpnConnection.localSubnet,
             copy: true
           }"
         />

         <detail-row
           :param="{
             title: 'hybridvpcvpnconnection.remoteSubnet',
             content: hybridAliCloudVpnConnection && hybridAliCloudVpnConnection.remoteSubnet,
             copy: true
           }"
         />

         <detail-row
           :param="{
             title: 'common.createDate',
             content: hybridAliCloudVpnConnection && hybridAliCloudVpnConnection.createDate && formatDatetime(new Date(hybridAliCloudVpnConnection.createDate))
           }"
         />

         <detail-row
           :param="{
             title: 'common.lastOpDate',
             content: hybridAliCloudVpnConnection && hybridAliCloudVpnConnection.lastOpDate && formatDatetime(new Date(hybridAliCloudVpnConnection.lastOpDate))
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
           content: hybridAliCloudVpnConnection && hybridAliCloudVpnConnection.uuid,
           copy: true
         }"
       />
       <div class="split-line">
         {{$t('hybridvpcipsecconfig.ipsec')}}
       </div>

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.encodeAlgorithm',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid] && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid].encodeAlgorithm
         }"
       />

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.authAlgorithm',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid] && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid].authAlgorithm
         }"
       />

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.dhGroups',
           content:  hybridAliCloudVpnConnection && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid] && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid].pfs
         }"
       />

       <detail-row
         :param="{
           title: 'hybridvpcipsecconfig.salifetime',
           content:  hybridAliCloudVpnConnection && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid] && dbData.hybridVpcIpSecConfig[hybridAliCloudVpnConnection.ipsecConfigUuid].lifetime
         }"
       />

       <div class="split-line">
         {{$t('common.hybridVpcIkeConfig')}}
       </div>

       <detail-row
         :param="{
           title:'hybridvpcikeconfig.encodeAlgorithm',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid] && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid].encodeAlgorithm
         }"
       />

       <detail-row
         :param="{
           title:'hybridvpcikeconfig.dhGroups',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid] && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid].pfs
         }"
       />

       <detail-row
         :param="{
          title:'hybridvpcikeconfig.salifetime',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid] && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid].lifetime
         }"
       />

       <detail-row
         :param="{
           title:'hybridvpcikeconfig.localIp',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid] && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid].localIp
         }"
       />

       <detail-row
         :param="{
           title:'hybridvpcikeconfig.remoteIp',
           content: hybridAliCloudVpnConnection && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid] && dbData.hybridVpcIkeConfig[hybridAliCloudVpnConnection.ikeConfigUuid].remoteIp
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
    name: "DetailHybridVpnAliCloudConnectionPage",

    components: {DetailInfoState, DetailTemplate},

    mixins: [WindowBase],

    data() {
      return {
        activeName: 'info'
      }
    },

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudVpnConnection/get'
      }),
      hybridAliCloudVpnConnection() {
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
        return self.dispatchAction('hybridAliCloudVpnConnection/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        }).then( () => {
          return self.updateWindow({
            ikeConfigUuid: self.hybridAliCloudVpnConnection.ikeConfigUuid,
            ipsecConfigUuid: self.hybridAliCloudVpnConnection.ipsecConfigUuid
          }).then(() => {
            self.queryIKE()
            self.queryIPSec()
          })
        })
      },

      queryIKE () {
        const self = this
        return rpc.query(`hybrid/vpn-connection/ike/${self.windowData.ikeConfigUuid}`)
          .then(resp => {
            self.updateDbRow({
              tableName: 'hybridVpcIkeConfig',
              id: self.windowData.ikeConfigUuid,
              data: resp.inventories[0]
            }).then(() => {
              self.$forceUpdate()
            })
          })
      },
      queryIPSec () {
        const self = this
        return rpc.query(`hybrid/vpn-connection/ipsec/${self.windowData.ipsecConfigUuid}`)
          .then(resp => {
            return self.updateDbRow({
              tableName: 'hybridVpcIpSecConfig',
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
            return this.hybridAliCloudVpnConnection && this.hybridAliCloudVpnConnection[name];
          },
          setValue: (newVal) => {
            if(this.hybridAliCloudVpnConnection && this.hybridAliCloudVpnConnection[name] && this.hybridAliCloudVpnConnection[name] === newVal) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.hybridAliCloudVpnConnection.name),
              param= {
               uuid: this.windowData.dataUuid,
                param: {
                 [name]: newVal
                }
              }
            this.dispatchActionWithEvent('hybridAliCloudVpnConnection/update', param, null, event);
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
          checkBoxText: 'hybrid.deleteOrigin',
          getName: (uuid) => {
            return self.dbData.hybridVpcVpnConnection[uuid].name;
          },
          ok: (isOrigin) => {
            self.delete(uuidList, isOrigin).then(() => self.$router.push({name: 'hybridalicloudvpcvpnconnection'}))
          }
        })
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
