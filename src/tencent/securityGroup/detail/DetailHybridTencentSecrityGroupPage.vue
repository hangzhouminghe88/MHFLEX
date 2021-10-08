<template>
  <detail-template>
	  <div slot="header" class="detail-header">
		  <span class="detail-title">
			  腾讯云安全组详情
			</span>
			<span class="detail-header-item create-back" @click="close()">
        <i class="el-icon-back"></i>
				<span style="font-size: 12px;">
					回到腾讯云列表
				</span>
			</span>
			<span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
				  	<span class="text">
              {{$t('hybridesecuritygroup.Actions')}}
					  </span>
			  	</span>
				  <span slot="content">
					  <div class="dropdown-content">
						  <a style="padding: 12px 0px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
					  </div>
				  </span>
				</drop-down>
			</span>
 			<el-tabs v-model="activeName" class="detail-tab" tab-position="bottom">
				 <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
				 <el-tab-pane :label="$t('hybridesecuritygroup.HybridSecurityGroupRule')" name="securitygrouprule"></el-tab-pane>
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
					  v-for="(item, index) in leftItemGroup"
						:key="index"
						:param="{
							title: $t(item.title),
							content: item.content
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
				  v-for="(item, index) in rightItemGroup"
					:key="index"
					:param="{
						title: $t(item.title),
						content: item.content,
						copy: item.copy,
						handler: () => {
              if(!item.copy)
							$router.push({name: 'detailHybridTencentDataCenter', params: {uuid: tencentSg.dataCenterUuid}})
						}
					}"
				/>
			</div>
		</div>

		<div slot="body" v-if="activeName === 'securitygrouprule'" class="detail-body">
      <hybrid-tencent-security-group-rule-tab  :param="{uuid: windowData.dataUuid, pageCreateRule: pageCreateRule}"/>
		</div>

		<div slot="footer" class="detail-footer">
     <create-hybrid-tencent-security-group-rule :param="createRuleParam" v-if="showCreateRule" @close="showCreateRule = false;"/>
   </div>
	</detail-template>
</template>

<script>

import CreateHybridTencentSecurityGroupRule from '../create/CreateHybridTencentSecurityGroupRule';
import HybridTencentSecurityGroupRuleTab from '../components/HybridTencentSecurityGroupRuleTab';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import Methods from '../Methods';
import { mapGetters } from 'vuex';

export default {
	name: 'DetailHybridTencentSecurityGroup',

	mixins: [WindowBase, PageBase, Methods],

	components: {
		DetailTemplate,
		HybridTencentSecurityGroupRuleTab,
		CreateHybridTencentSecurityGroupRule
	},

	computed: {
		...mapGetters({
		  get: 'hybridTencentSecurityGroup/get'
		}),
		tencentSg() {
			return this.get(this.windowData.dataUuid);
		},
		leftItemGroup() {
			return [
				{title: 'hybridesecuritygroup.securityGroupId', content: this.tencentSg && this.tencentSg.securityGroupId},
				{title: 'hybridvirtualprivatecloud.ecsInstanceNum', content: this.tencentSg && this.tencentSg.ecsInstanceNum},
				{title: 'common.createDate', content: this.tencentSg && this.tencentSg.createDate && formatDatetime(new Date(this.tencentSg.createDate))},
				{title: 'common.lastOpDate',content: this.tencentSg && this.tencentSg.lastOpDate && formatDatetime(new Date(this.tencentSg.lastOpDate))}
			]
		},
		rightItemGroup() {
			return [
				{title: 'common.uuid', content: this.tencentSg && this.tencentSg.uuid, copy: true},
				{title: 'common.datacenter', content: this.tencentSg && this.tencentSg.dataCenterName}
			]
		}
	},

	data() {
		return {
			activeName: 'info',
			createRuleParam: {},
			showCreateRule: false,
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
		detailQuery() {
			let self = this;
			return self.dispatchAction('hybridTencentSecurityGroup/basicQuery', {
				q: [`uuid=${self.windowData.dataUuid}`]
			})
		},
		//回到腾讯云安全组列表
		close() {
     this.$router.push({name: 'hybridtencentsecuritygroup'})
		},
		//更新腾讯云参数
		updateResourceParam(param) {
			let self = this;
			return {
				getValue: () => {
					return self.tencentSg && self.tencentSg[param];
				},
				setValue: (newVal) => {
					if(newVal === self.tencentSg[param]) return;
					let event = self.createEvent(`common.updateInfo${param}`, self.tencentSg.name);
					let realParam = {};
					realParam['uuid'] = self.windowData.dataUuid;
					realParam['param'] = {
						[param]: newVal
					}
					self.dispatchActionWithEvent('hybridTencentSecurityGroup/update', realParam, null, event);
				}
			}
		},
		//删除腾讯云安全组
		detailDelete() {
			let self = this, uuidList = [self.windowData.dataUuid];
		  self.openDialog('ConfirmDlg', {
        title: 'hybridesecuritygroup.deleteSecurityGroup',
        description: 'hybridesecuritygroup.delete',
        icon: 'sg_popupico',
        uuidList,
        isChecked: true,
        warning: 'hybridSecurityGroupRule.info.deleteWarning',
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return self.dbData.hybridTencentSecurityGroup[uuid].name;
        },
        ok: (isOrigin) => {
          self.delete(isOrigin, uuidList)
            .then( () => {
              self.close();
            });
        }
      })
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
	@import url('../../../style/mixins.less');
	.icon{
		.detail-icon('~assets/sg_ico.svg');
	}
</style>
