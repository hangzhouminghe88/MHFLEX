<template>
  <detail-template>
    <div slot="header" class="detail-header">
     <span class="detail-title">
       IPsec详情
     </span>
      <span class="detail-header-item" @click="$router.push({name: 'ipsec'})">
       <span class="create-back el-icon-back">
         回到IPsec列表
       </span>
     </span>
      <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">{{$t('common.ipsecActions')}}</span>
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
        <el-tab-pane :label="$t('common.network')" name="network"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="ipsec"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-show="IPsec && IPsec.state" :state="IPsec.state"/>
            <detail-info-state outer-class-name="detail-page-state" v-show="IPsec && IPsec.status" :state="IPsec.status"/>
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
              title: 'common.vip',
              content:  IPsec && IPsec.vipUuid && getVipName(windowData.dataUuid),
              handler: () => {
                $router.push({name: 'detailvip', params: {uuid: IPsec.vipUuid}})
              }
            }"
          />

          <detail-row
            :param="{
              title: 'common.vipIp',
              content: IPsec && IPsec.vipUuid && dbData.vip[IPsec.vipUuid] && dbData.vip[IPsec.vipUuid].ip,
            }"/>

          <detail-row
            :param="{
              title: 'common.peerAddress',
              content:  IPsec && IPsec.peerAddress,
            }"
          />

          <detail-row
            :param="{
              title: 'common.createDate',
              content:  IPsec && IPsec.createDate && formatDatetime(new Date(IPsec.createDate)),
            }"
          />

          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content:  IPsec && IPsec.lastOpDate && formatDatetime(new Date(IPsec.lastOpDate)),
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
            title:'common.uuid',
            content: IPsec && IPsec.uuid,
            copy: true
          }"
        />

        <detail-row
          :param="{
            title:'common.authMode',
            content: IPsec && IPsec.authMode
          }"
        />

        <detail-row
          :param="{
            title:'common.authKey',
            content: IPsec && IPsec.authKey
          }"
        />

        <detail-row
          :param="{
            title:'common.policyMode',
            content: IPsec && IPsec.policyMode,
          }"
        />

        <detail-row
          :param="{
            title:'common.ikeAuthAlgorithm',
            content: IPsec && IPsec.ikeAuthAlgorithm,
          }"
        />

        <detail-row
          :param="{
            title: 'common.ikeDhGroup',
            content: IPsec && IPsec.ikeDhGroup
          }"
        />

        <detail-row
          :param="{
            title: 'common.ikeEncryptionAlgorithm',
            content: IPsec && IPsec.ikeEncryptionAlgorithm,
          }"
        />

        <detail-row
          :param="{
            title: 'common.transformProtocol',
            content: IPsec && IPsec.transformProtocol
          }"
        />

        <detail-row
          :param="{
            title: 'common.policyAuthAlgorithm',
            content: IPsec && IPsec.policyAuthAlgorithm
          }"
        />

        <detail-row
          :param="{
            title: 'common.policyEncryptionAlgorithm',
            content: IPsec && IPsec.policyEncryptionAlgorithm
          }"
        />

        <detail-row
          :param="{
            title: 'common.showMoreDropdownPfs',
            content: IPsec && IPsec.pfs
          }"
        />

      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'network'">
      <net-work-for-IPsec-tab-list  :param="{
            uuid: windowData.dataUuid,
            parentWindowId: windowId,
            refresh: query,
            isVpcNetwork: isVpcNetwork
          }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list  :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
    import NetworkForIPsecTab from "src/network/IPsec/components/NetworkForIPsecTab";
    import DetailInfoState from "src/component/DetailInfoState";
    import DetailTemplate from "src/component/DetailTemplate";
    import { formatDatetime } from "src/utils/utils";
    import WindowBase from 'src/windows/Window';
    import rpc from 'src/utils/rpc';
    import Methods from '../Methods';
    import LogList from "../../../component/LogList";

    export default {
      name: "DetailIPsecPage",

      components: {
        LogList,
        'net-work-for-IPsec-tab-list':NetworkForIPsecTab,
        DetailInfoState,
        DetailTemplate
      },

      mixins: [WindowBase, Methods],

      data() {
        return {
          activeName: 'info',
          model: {}
        }
      },

      computed: {
        IPsec: {
          get() {
            return this.model && this.model;
          },
          set(val) {
            this.model = val;
          }
        },
      },

      created() {
        let self = this,dataUuid = '';
        dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
        self.updateWindow({
          dataUuid,
          methods: {
            query: self.query
          }
        }).then(() => {
          self.query()
        })
      },

      methods: {

        isVpcNetwork: function () {
          let l3NetworkRefs = this.dbData.ipsec[this.windowData.dataUuid].l3NetworkRefs
          if (l3NetworkRefs.length === 0) return true
          let l3NetworkUuid = l3NetworkRefs[0].l3NetworkUuid
          return this.dbData.l3network[l3NetworkUuid] && (this.dbData.l3network[l3NetworkUuid].type === 'L3VpcNetwork')
        },

        formatDatetime,
        //查询单个隧道
        query: function () {
          let ipsecInventories
          return rpc.query(`ipsec/${this.windowData.dataUuid}`)
            .then((resp) => {
              ipsecInventories = resp.inventories[0]
              return rpc.query(`l3-networks`, {
                q: `uuid?=${ipsecInventories.l3NetworkRefs.map(item => item.l3NetworkUuid)}`
              })
            })
            .then((resp) => {
              return this.updateDbTable({
                tableName: 'l3network',
                list: resp.inventories
              })
            })
            .then(() => {
              return this.updateDbRow({
                tableName: 'ipsec',
                id: this.windowData.dataUuid,
                data: ipsecInventories
              }).then( () => {
                this.model = _.get(this.dbData.ipsec, this.windowData.dataUuid);
              })
            })
        },
        //修改资源参数
        updateResourceParam(name) {
          let self = this;
          return {
            getValue: () => {
              return this.IPsec && this.IPsec[name];
            },
            setValue: (newVal) => {

            },
            canEdit: () => {
              return true;
            }
          }
        },
        //删除IPsec
        detailDelete() {
          let uuidList = [this.windowData.dataUuid];
          let self = this
          if (uuidList.length > 0) {
            self.openDialog('ConfirmDlg',{
              title: 'common.destroyIPsec',
              description: 'ipsec.deleteIpsec',
              uuidList: uuidList,
              icon: 'ipsec_popupico',
              ok: () => {
                self.delete(uuidList).then(() => {
                  return self.$router.push({name: 'ipsec'})
                })
              },
              getName: (uuid) => {
                return self.dbData.ipsec[uuid].name;
              }
            })
          }
        }
      }
    }
</script>

<style scoped lang="less">
   @import "../../../style/mixins";

  .icon{
   .detail-icon('~assets/ipsec.svg');
 }
</style>
