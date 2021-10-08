<template>
 <detail-template>
   <div class="detail-header" slot="header">
     <span class="detail-title">阿里云安全组详情</span>
     <span class="detail-header-item create-back"
           @click="$router.push({name: 'hybridalicloudsecuritygroup'})">
       <i class="el-icon-back"></i>
        <span class="text" style="font-size: 12px;">
          回到阿里云安全组列表
        </span>
     </span>
     <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">{{$t('hybridesecuritygroup.Actions')}}</span>
         </span>
         <span slot="content">
           <div class="dropdown-content">
             <a style="padding: 12px 0px" @click="detailDelete()">{{$t('common.destroy')}}</a>
           </div>
         </span>
       </drop-down>
     </span>
     <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
       <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
       <el-tab-pane :label="$t('common.securityGroupRule')" name="securityGroupRule"></el-tab-pane>
     </el-tabs>
   </div>

   <div slot="body" class="detail-body" v-if="currTab === 'info'">
     <div class="left">
       <div class="left-header">
         <base-icon name="sg_ico"/>
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
             title: 'hybridesecuritygroup.securityGroupId',
             content: hybridAliCloudSecurityGroup.securityGroupId && hybridAliCloudSecurityGroup.securityGroupId
           }"
         />
         <detail-row
           :param="{
             title: 'hybridvirtualprivatecloud.ecsInstanceNum',
             content: hybridAliCloudSecurityGroup.ecsInstanceNum && hybridAliCloudSecurityGroup.ecsInstanceNum
           }"
         />
         <detail-row
           :param="{
             title: 'common.createDate',
             content: hybridAliCloudSecurityGroup.createDate && formatDatetime(new Date(hybridAliCloudSecurityGroup.createDate))
           }"
         />
         <detail-row
           :param="{
             title: 'common.lastOpDate',
             content: hybridAliCloudSecurityGroup.lastOpDate && formatDatetime(new Date(hybridAliCloudSecurityGroup.lastOpDate))
           }"
         />
       </div>
     </div>
     <div class="right">
       <div style="height: 40px"></div>
       <div class="detail-block-header">
         {{$t('common.moreInformation')}}
       </div>
       <detail-row
         :param="{
           title: 'UUID',
           content: windowData.dataUuid
         }"
       />
       <detail-row
         :param="{
           title: 'VPC',
           content: hybridAliCloudSecurityGroup.vpcName && hybridAliCloudSecurityGroup.vpcName.replace(/ZStack-/ig,  ''),
           handler: () => {
             $router.push({name: 'detailHybridAliCloudVpc', params:{uuid: hybridAliCloudSecurityGroup.ecsVpcUuid}})
           }
         }"
       />
     </div>
   </div>

   <div slot="body" class="detail-body" v-if="currTab === 'securityGroupRule'">
     <hybrid-ali-cloud-security-group-rule-tab :param="{uuid: windowData.dataUuid, pageCreateRule: pageCreateRule}"/>
   </div>

   <div slot="footer" class="detail-footer">
     <create-hybrid-ali-cloud-security-group-rule :param="createRuleParam" v-if="showCreateRule" @close="showCreateRule = false;"/>
   </div>
 </detail-template>
</template>

<script>
    import DetailTemplate from "../../../component/DetailTemplate";
    import WindowBase from 'src/windows/Window';
    import PageBase from 'src/windows/PageBase';
    import Utils from 'src/utils/utils';
    import Methods from  '../Methods';
    import { mapGetters } from 'vuex';
    import HybridAliCloudSecurityGroupRuleTab from "../component/HybridAliCloudSecurityGroupRuleTab";
    import CreateHybridAliCloudSecurityGroupRule from "../create/CreateHybridAliCloudSecurityGroupRule";

    export default {
      name: "DetailHybridAliCloudSecurityGroupPage",

      mixins: [Methods, WindowBase, PageBase],

      components: {CreateHybridAliCloudSecurityGroupRule, HybridAliCloudSecurityGroupRuleTab, DetailTemplate},

      computed: {
        ...mapGetters({
          get: 'hybridAliCloudSecurityGroup/get'
        }),
        hybridAliCloudSecurityGroup() {
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
        }).then( () =>{
          self.detailQuery();
        })
      },

      data() {
        return{
          currTab: 'info',
          showCreateRule: false,
          createRuleParam: {}
        }
      },

      methods: {
        ...Utils,
        //单个查询
        detailQuery() {
          let self = this;
          return self.dispatchAction('hybridAliCloudSecurityGroup/basicQuery', {q: [`uuid=${self.windowData.dataUuid}`]});
        },
        //删除
        detailDelete() {
          let self = this, uuidList = [self.windowData.dataUuid];
          self.openDialog('ConfirmDlg', {
            title: 'hybridesecuritygroup.deleteSecurityGroup',
            description: 'hybridesecuritygroup.delete',
            icon: 'sg_popupico',
            uuidList,
            isChecked: true,
            warning: 'hybridSecurityGroupRule.info.deleteWarning',
            checkBoxText: 'hybrid.deleteOrigin',
            getName: (uuid) => {
              return self.hybridAliCloudSecurityGroup.name;
            },
            ok: (isOrigin) => {
              self.delete(isOrigin, uuidList)
                .then(() => {
                  self.$router.push({name: 'hybridalicloudsecuritygroup'});
                });
            }
          })
        },
        //更新
        updateResourceParam(param) {
          let self = this;
          return {
            getValue: () => {
              return self.hybridAliCloudSecurityGroup[param];
            },
            setValue: (newVal) => {
              if(newVal === self.hybridAliCloudSecurityGroup[param]) return;
              self.updateAliyunResouce([self.windowData.dataUuid], 'hybrid/aliyun/security-group', 'updateEcsSecurityGroup', param, newVal, 'hybridSecurityGroup');
            },
            canEdit: () => {
              return true;
            }
          }
        },
        //创建安全组规则
        pageCreateRule(param) {
          let self = this;
          self.createRuleParam = param;
          self.showCreateRule = true;
        }
      }
    }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/sg_ico.svg')
  }
</style>
