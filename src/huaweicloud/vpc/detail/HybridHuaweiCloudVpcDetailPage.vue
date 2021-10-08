<template>
   <detail-template>
     <div class="detail-header" slot="header">
       <span class="detail-header-item">
         <span class="detail-title">华为云Vpc详情</span>
         <span class="create-back el-icon-back" @click="close()">
           回到华为云Vpc列表
         </span>
       </span>
       <span class="detail-header-item">
         <drop-down class="detail-dropdown">
           <span slot="title">
             <span class="text">{{$t('common.actions')}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
               <a style="padding: 12px 0px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
             </div>
           </span>
         </drop-down>
       </span>
       <el-tabs class="detail-tab"
                tab-position="bottom"
                v-model="currTab">
         <el-tab-pane :label="$t('common.basicAttributes')"  name="info"></el-tab-pane>
         <el-tab-pane :label="'子网'"  name="subnet"></el-tab-pane>
       </el-tabs>
     </div>
     <div class="detail-body" slot="body" v-if="currTab === 'info'">
        <div class="left">
          <div class="left-header">
            <div class="icon"></div>
            <div class="after-icon"></div>
            <detail-name class="name" :param="updateReourceParam('name')"/>
            <detail-description class="description" :param="updateReourceParam('description')"/>
          </div>
          <div class="left-body">
            <div class="detail-block-header">
              {{$t('common.overview')}}
            </div>
            <detail-row :param="{
               title: $t('hybridvirtualprivatecloud.vpcId'),
               content: hybridHuaweiVpc && hybridHuaweiVpc.ecsVpcId
            }"/>
            <detail-row :param="{
               title: $t('common.cidr'),
               content: hybridHuaweiVpc && hybridHuaweiVpc.cidrBlock
            }"/>
            <detail-row :param="{
               title: $t('hybridvirtualprivatecloud.ecsInstanceNum'),
               content: hybridHuaweiVpc && getHuaweiEcsInstanceNum(hybridHuaweiVpc.uuid)
            }"/>
             <detail-row :param="{
               title: $t('common.createDate'),
               content: hybridHuaweiVpc && hybridHuaweiVpc.createDate && formatDatetime(new Date(hybridHuaweiVpc.createDate))
            }"/>
            <detail-row :param="{
               title: $t('common.lastOpDate'),
               content: hybridHuaweiVpc && hybridHuaweiVpc.lastOpDate && formatDatetime(new Date(hybridHuaweiVpc.lastOpDate))
            }"/>
          </div>
        </div>
        <div class="right">
          <div style="height: 40px"></div>
            <div  class="detail-block-header">
             {{$t('common.moreInformation')}}
            </div>
            <detail-row :param="{
              title:  'common.uuid',
              content: windowData.dataUuid,
              copy: true
            }"></detail-row>
            <detail-row :param="{
               title: 'hybriddatacenter.region',
               content: hybridHuaweiVpc && hybridHuaweiVpc.dataCenterName,
               handler: () => {

               }
            }"/>
        </div>
     </div>

     <div slot="body"  class="detail-body" v-if="currTab === 'subnet'">
       <hybrid-huawei-sub-nets-page :param="{uuid: windowData.dataUuid, conditions:[`ecsVpcId=${windowData.dataUuid}`], setCreateSubNetParam: getCreateSubNetParam, showCreateSubNet: () => showCreatePage = true}"></hybrid-huawei-sub-nets-page>
     </div>

     <template slot="footer">
       <create-hybrid-huawei-sub-net-page :param="createSubNetParam" v-if="showCreatePage" @close="showCreatePage = false"/>
     </template>
   </detail-template>
</template>

<script>
import CreateHybridHuaweiSubNetPage from 'src/huaweicloud/vpc/components/CreateHybridHuaweiSubNetPage';
import HybridHuaweiSubNetsPage from 'src/huaweicloud/vpc/components/HybridHuaweiSubNetsPage';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import {mapGetters} from 'vuex';
import Methods from '../Methods';

export default {
  name: 'HybridHuaweiCloudVpcDetailPage',
  mixins: [WindowBase, Methods],
  components: {
    DetailTemplate,
    HybridHuaweiSubNetsPage,
    CreateHybridHuaweiSubNetPage
  },
  computed: {
    ...mapGetters({
      get: `hybridHuaweiVpc/get`
    }),
    hybridHuaweiVpc() {
      return this.get(this.windowData.dataUuid);
    }
  },
  data() {
    return {
      currTab: 'info',
      showCreatePage: false,
      createSubNetParam: {}
    }
  },
  created() {
    let _this = this, dataUuid = '';
    dataUuid = _this.$route.params.uuid ? _this.$route.params.uuid : '';
    _this.updateWindow({
      dataUuid,
      methods: {
        query: _this.detailQuery
      }
    }).then(() => {
      _this.detailQuery();
    })
  },
  methods: {
    formatDatetime,
    detailQuery() {
      let _this = this;
      return _this.dispatchAction('hybridHuaweiVpc/basicQuery', {
        q: [`uuid=${_this.windowData.dataUuid}`]
      });
    },
    updateReourceParam(arg) {
      let _this = this;
      return {
        getValue: () => {
           return _this.hybridHuaweiVpc && _this.hybridHuaweiVpc[arg] && _this.hybridHuaweiVpc[arg];
        },
        setValue: (newVal) => {
          if(newVal === _this.hybridHuaweiVpc[arg]) return;
					let event = _this.createEvent(`common.updateInfo${arg}`, _this.hybridHuaweiVpc.name),
					realParam = {
						uuid: _this.windowData.dataUuid,
						param: {
							[arg]: newVal
						}
					};
					return _this.dispatchActionWithEvent('hybridHuaweiVpc/update', realParam, null, event)
					.then(() => {_this.detailQuery()});
        },
        canEdit: () => {
          return true;
        }
      }
    },
    close() {
      let _this = this;
      _this.$router.push({name: 'hybridtencentvpc'})
    },
    detailDelete() {
       let _this = this, uuidList = [];
      uuidList = [_this.windowData.dataUuid];
      console.log(uuidList);
      _this.openDialog('ConfirmDlg', {
        title:  _this.$t('hybridvirtualprivatecloud.DeleteVirtualPrivateCloud'),
        description:  'hybridvirtualprivatecloud.delete',
        icon: 'vpc_popupico',
        uuidList,
        isChecked: true,
        checkBoxText: "同时删除华为云上资源",
        warning: _this.$t('hybridvirtualprivatecloud.info.deleteWarning'),
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiVirtualPrivateCloud[uuid].name;
        },
        ok: (isDeleteOrign) => {
           _this.delete(uuidList, isDeleteOrign)
                .then(() =>{
                  _this.close();
                });
        }
      })
    },
    getCreateSubNetParam(param) {
      let _this = this;
      _this.createSubNetParam = param;
    }
  }
}
</script>

<style lang="less" scoped>
  @import url('../../../style/mixins.less');
  .icon{
    .detail-icon('~assets/vpc_ico.svg');
  }
</style>
