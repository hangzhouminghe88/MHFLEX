<template>
   <detail-template>
     <div class="detail-header" slot="header">
       <span class="detail-header-title">华为云安全组详情</span>
       <span class="detail-header-item" @click="close()">
         <span class="create-back el-icon-back">回到华为云安全组列表</span>
       </span>
       <span class="detail-header-item">
         <drop-down class="detail-dropdown">
           <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
               <a style="padding: 12px 0px" @click="detialDelete()">
                 {{$t('common.destroy')}}
               </a>
             </div>
           </span>
         </drop-down>
       </span>
       <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
         <el-tab-pane label="安全组规则" name="rule"></el-tab-pane>
       </el-tabs>
     </div>
     <div class="detail-body" slot="body" v-if="currTab === 'info'">
       <div class="left">
         <div class="left-header">
           <div class="icon"></div>
           <div class="after-icon"></div>
           <detail-name class="name" :param="updateResourceParam('name')"/>
           <detail-description class="description" :param="updateResourceParam('description')"/>
         </div>
         <div class="left-body">
           <div class="detail-block-header">{{$t('common.overview')}}</div>
           <detail-row :param="{
             title: '安全组ID',
             content: huaweiVpc && huaweiVpc.securityGroupId
           }"/>
           <detail-row :param="{
             title: '云主机数量',
             content:  huaweiVpc && huaweiVpc.ecsInstanceNum
           }"/>
           <detail-row :param="{
              title: $t('common.createDate'),
              content:  huaweiVpc && huaweiVpc.createDate && formatDatetime(new Date(huaweiVpc.createDate))
           }"/>
           <detail-row :param="{
              title: $t('common.lastOpDate'),
              content: huaweiVpc && huaweiVpc.lastOpDate && formatDatetime(new Date(huaweiVpc.lastOpDate))
           }"/>
         </div>
         <div class="split-line"></div>
       </div>
       <div class="right">
         <div style="height: 40px"></div>
         <div class="detail-block-header">{{$t('common.moreInformation')}}</div>
         <detail-row :param="{
           title: $t('common.uuid'),
           content: windowData.dataUuid,
           copy: true
         }"/>
          <detail-row :param="{
           title: 'VPC',
           content: windowData.dataUuid,
           handler: () => {

           }
         }"/>
          <div class="split-line"></div>
       </div>
     </div>
     <div class="detail-body" slot="body" v-if="currTab === 'rule'">
        <hybrid-huawei-secirity-group-rule-tab-list :param="{uuid: windowData.dataUuid, conditions:[`securityGroupUuid=${windowData.dataUuid}`], setAddRuleParam: getAddRuleParam, openCreateSgRule: () => {showCreateRule = true}}"/>
     </div>

     <template slot="footer">
       <transition name="fade">
           <create-hybrid-huawei-sg-rule v-if="showCreateRule" :param="addRuleParam" @close="showCreateRule = false;"></create-hybrid-huawei-sg-rule>
       </transition>
     </template>
   </detail-template>
</template>

<script>
import HybridHuaweiSecurityGroupRuleTabList from 'src/huaweicloud/securityGroup/components/HybridHuaweiSecurityGroupRuleTabList';
import CreateHybridHuaweiSgRule from 'src/huaweicloud/securityGroup/components/CreateHybridHuaweiSgRule';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import { mapGetters } from 'vuex';
import Methods from '../Methods';
export default {
  name: 'HybrodHuaweiSecurityGroupDetailPage',
  mixins: [WindowBase, Methods],
  components: {
    DetailTemplate,
    CreateHybridHuaweiSgRule,
    'hybrid-huawei-secirity-group-rule-tab-list': HybridHuaweiSecurityGroupRuleTabList
  },
  computed: {
    ...mapGetters({
      get: `hybridHuaweiSecurityGroup/get`
    }),
    huaweiVpc() {
      return this.get(this.windowData.dataUuid);
    }
  },
  data() {
    return {
      currTab: 'info',
      addRuleParam: {},
      showCreateRule: false
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
      _this.detailQuery()
    })
  },
  methods: {
    formatDatetime,
    detailQuery() {
      let _this = this;
      return _this.dispatchAction(`hybridHuaweiSecurityGroup/basicQuery`, {
        q: [`uuid=${_this.windowData.dataUuid}`]
      })
    },
    close() {
      let _this = this;
      _this.$router.push({name: 'hybridhuaweisecuritygroup'})
    },
    updateResourceParam(param) {
      let _this = this;
      return {
        getValue: () => {
          return _this.huaweiVpc && _this.huaweiVpc[param];
        },
        setValue: () => {

        },
        canEdit: () => {
          return true;
        }
      }
    },
    detialDelete() {
      let _this = this, uuidList = [];
      uuidList = [_this.windowData.dataUuid];
      _this.openDialog('ConfirmDlg', {
         title: 'hybridesecuritygroup.deleteSecurityGroup',
        description: 'hybridesecuritygroup.delete',
        icon: 'sg_popupico',
        uuidList,
        isChecked: true,
        warning: 'hybridSecurityGroupRule.info.deleteWarning',
        checkBoxText: '同时删除华为云上资源',
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiSecurityGroup[uuid].name;
        },
        ok: (isDeleteOrigin) => {
          _this.delete(uuidList, isDeleteOrigin)
               .then(() => {
                 _this.close();
               })
        }
      })
    },
    getAddRuleParam(param) {
      let _this = this;
      _this.addRuleParam = param;
    }
  }
}
</script>

<style lang="less" scoped>
	@import url('../../../style/mixins.less');
	.icon{
		.detail-icon('~assets/sg_ico.svg');
  }
  .fade-in{
    animation: dialog-transition-enter .5s;
  }

  @keyframes dialog-transition-enter {
       0% {
        -webkit-transform: scale3d(0, 0, 0);
        transform: scale3d(0.5, 0.5, 0.5);
        opacity: 0;
    }
    50% {
        -webkit-animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
        animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
    }
    100% {
        -webkit-transform: scale3d(1, 1, 1);
        transform: scale3d(1, 1, 1);
        -webkit-animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 1;
    }
  }
</style>
