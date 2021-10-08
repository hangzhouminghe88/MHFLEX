<template>
	 <detail-template>
		 <div slot="header" class="detail-header">
		   <span class="detail-title">
				 腾讯云Vpc详情
			 </span>
			 <span class="detail-header-item create-back" @click="close()">
				 <i class="el-icon-back"></i>
				 <span style="font-size: 12px;">
					 回到腾讯云Vpc列表
				 </span>
			 </span>
			 <span class="detail-header-item">
				 <drop-down class="detail-dropdown">
					 <span slot="title">
						 <span class="text">{{'腾讯云Vpc'+$t('hybridvirtualprivatecloud.Actions')}}</span>
					 </span>
					 <span slot="content">
						 <div class="dropdown-content">
							 <a style="padding: 12px 0px" @click="detailDelete()">{{$t('common.destroy')}}</a>
						 </div>
					 </span>
				 </drop-down>
			 </span>
			 <el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
				 <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
				 <el-tab-pane :label="'子网'" name="subNet"></el-tab-pane>
				 <el-tab-pane :label="$t('common.vrouterroutetable')" name="vrouterroutetable"></el-tab-pane>
				  <el-tab-pane name="vpcVpnGateway" :label="$t('common.hybridvpcvpngateway')"></el-tab-pane>
			 </el-tabs>
		 </div>

		 <div slot="body" class="detail-body" v-if="activeName === 'info'">
			 <div class="left">
				 <div class="left-header">
					 <div class="icon"></div>
				   <div class="after-icon">
					   <detail-info-state :state="tencentVpc && tencentVpc.status" outer-class-name="detail-page-state"/>
				   </div>
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
								 title: item.title,
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
						 title: item.title,
						 content: item.content,
						 copy: item.copy,
						 handler: () => {
                if(item.link){
                  $router.push({name: 'hybridtencentdatacenter', params: {uuid: tencentVpc.dataCenterUuid}})
								}
						 }
					 }"
				 />
				  <div class="split-line"></div>
			 </div>
		 </div>

		 <div slot="body" class="detail-body" v-if="activeName === 'subNet'">
			 <hybrid-tencent-sub-net-tab :param="{conditions: `ecsVpcUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, pageCreateVSwitch: pageCreateVSwitch, goToSubNetDetail: goToSubNetDetail}"></hybrid-tencent-sub-net-tab>
		 </div>

		 <div slot="body" class="detail-body" v-if="activeName === 'vrouterroutetable'">
			 <hybrid-tencent-vpc-vrouter-tab :param="{conditions: `vpcUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, goToTencentVRouter: goToTencentVRouter}"/>
		 </div>

		 <div slot="body" class="detail-body" v-if="activeName === 'vpcVpnGateway'">
			 <hybrid-tencent-vpc-vpn-gate-way-tab :param="{conditions: `vSwitchUuid?=${windowData.vSwitchUuidList}`, uuid: windowData.dataUuid, goToTencentVRouter: goToTencentVRouter}"/>
		 </div>

		 <div slot="footer">
			 <create-hybrid-tencent-sub-nets-page :param="createVswitchParam" v-if="showCreateVswitch" @close="showCreateVswitch = false"></create-hybrid-tencent-sub-nets-page>
			 <detail-hybrid-tencent-sub-net-page :param="detailVswitchParam" v-if="showDetailVswitch" @close="showDetailVswitch = false;"/>
			 <detail-hybrid-tencent-vpc-v-router  v-if="showTecentVpcVrouter"
                                          :param="tecentVpcVrouterParam"
                                           @close="showTecentVpcVrouter=false"/>
				<create-tencent-virtual-router-entry :param="createVurtualRouterEntryParam"
				                                      v-if="showCreateVrEntry"
																							@close="showCreateVrEntry = false;"></create-tencent-virtual-router-entry>
		 </div>
	 </detail-template>
</template>

<script>

import CreateTencentVirtualRouterEntry from 'src/tencent/vpc/create/CreateTencentVirtualRouterEntry';
import HybridTencentVpcVpnGateWayTab from 'src/tencent/vpc/components/HybridTencentVpcVpnGateWayTab';
import HybridTencentVpcVrouterTab from 'src/tencent/vpc/components/HybridTencentVpcVrouterTab';
import CreateHybridTencentSubNetsPage from '../create/CreateHybridTencentSubNetsPage';
import DetailHybridTencentSubNetPage from '../components/DetailHybridTencentSubNetPage';
import DetailHybridTencentVpcVRouter from '../components/DetailHybridTencentVpcVRouter';
import HybridTencentSubNetTab from '../components/HybridTencentSubNetTab';
import DetailInfoState from 'src/component/DetailInfoState';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import { mapGetters } from 'vuex';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';

export default {
	name: 'DetailHybridTencentVirtaulPrivateCloudPage',

	mixins: [WindowBase, Methods],

	components: {
		DetailTemplate,
		DetailInfoState,
		HybridTencentSubNetTab,
		CreateHybridTencentSubNetsPage,
		DetailHybridTencentSubNetPage,
		HybridTencentVpcVrouterTab,
		DetailHybridTencentVpcVRouter,
		HybridTencentVpcVpnGateWayTab,
		CreateTencentVirtualRouterEntry
	},
	 //祖孙传值
	provide(){
		return {
        detailTencentVpc: this
    }
	},

	computed: {
		...mapGetters({
			get: 'hybridTencentVpc/get'
		}),
		tencentVpc() {
			return this.get(this.windowData.dataUuid);
		},
		leftItemGroup() {
			return [
				{title: 'hybridvirtualprivatecloud.vpcId', content: this.tencentVpc && this.tencentVpc.ecsVpcId},
				{title: 'Cidr', content: this.tencentVpc && this.tencentVpc.cidrBlock},
				{title: 'hybridvirtualprivatecloud.ecsInstanceNum', content: this.tencentVpc && this.getTencentEcsInstanceNum(this.tencentVpc.uuid)},
				{title: 'common.createDate', content: this.tencentVpc && this.tencentVpc.createDate && formatDatetime(new Date(this.tencentVpc.createDate))},
				{title: 'common.lastOpDate', content: this.tencentVpc && this.tencentVpc && this.tencentVpc.lastOpDate && formatDatetime(new Date(this.tencentVpc.lastOpDate))}
			]
		},
		rightItemGroup() {
			return [
				{title: 'common.uuid', content: this.windowData.dataUuid, copy: true},
				{title: 'common.datacenter', content: this.tencentVpc && this.tencentVpc.dataCenterName, link: true}
			]
		}
	},

	created() {
		let self = this, dataUuid = '';
		dataUuid = self.$route.params.uuid ? self.$route.params.uuid : "";
		self.updateWindow({
			dataUuid,
			methods: {
				query: self.detailQuery
			}
		}).then( () => {
			self.detailQuery();
		}).then(() => {
			 self.querySwitch();
		})
	},

	data() {
		return {
			activeName: 'info',
			createVswitchParam: {},
			showCreateVswitch: false,
			detailVswitchParam: {},
			showDetailVswitch: false,
			showTecentVpcVrouter: false,
			tecentVpcVrouterParam: {},
			createVurtualRouterEntryParam: {},
		  showCreateVrEntry: false
		}
	},

	methods: {
		detailQuery() {
			let self = this;
			return self.dispatchAction('hybridTencentVpc/basicQuery', {
				q: [`uuid=${self.windowData.dataUuid}`]
			})
		},
		//删除Vpc回到腾讯云列表
		detailDelete() {
				let self = this, uuidList = [];
			uuidList = [self.windowData.dataUuid];
			self.openDialog('ConfirmDlg', {
				uuidList,
				title: 'hybridvirtualprivatecloud.DeleteVirtualPrivateCloud',
        description: 'hybridvirtualprivatecloud.delete',
        icon: 'vpc_popupico',
        warning:'hybridvirtualprivatecloud.info.deleteWarning',
        checkBoxText: "同时删除腾讯云上资源",
        isChecked: true,
				getName: () => {
          return self.tencentVpc.name;
				},
				ok: (isOrigin) => {
					 self.delete(uuidList, isOrigin)
					 .then(() => {
						 self.close();
					 });
				}
			})
		},
		//回到腾讯云Vpc列表
		close() {
			this.$router.push({name: 'hybridtencentvpc'})
		},
		//修改名称、简介
		updateResourceParam(param) {
			return {
				getValue: () => {
					return this.tencentVpc && this.tencentVpc[param];
				},
				setValue: (newVal) => {
					if(newVal === this.tencentVpc[param]) return;
					let event = this.createEvent(`common.updateInfo${param}`, this.tencentVpc.name),
					realParam = {
						uuid: this.windowData.dataUuid,
						param: {
							[param]: newVal
						}
					};
					return this.dispatchActionWithEvent('hybridTencentVpc/update', realParam, null, event)
					.then(() => {this.detailQuery()});
				},
				canEdit: () => {
					return true;
				}
			}
		},
		//创建子网
		pageCreateVSwitch(param) {
			let self = this;
			self.createVswitchParam = param;
			self.showCreateVswitch = true;
		},
		//子网详情
		goToSubNetDetail(param) {
			let self = this;
			self.detailVswitchParam = param;
			self.showDetailVswitch = true;
		},
		//路由表详情
		goToTencentVRouter(param) {
      let self = this;
      self.tecentVpcVrouterParam = param;
      self.showTecentVpcVrouter = true;
		},
		//查询子网
		querySwitch(){
        let self = this
        rpc.query('/hybrid/tencent/vswitch',{
          q:`ecsVpcUuid=${self.windowData.dataUuid}`,
            fileds: 'uuid'
        }).then((resp)=>{
          let vSwitchUuidList = resp.inventories.map((item) => item.uuid);
          return self.updateWindow({ vSwitchUuidList });
      })
    }
	}
}
</script>

<style scoped lang="less">
  @import url('../../../style/mixins.less');
	.icon{
		.detail-icon('~assets/vpc_ico.svg')
	}
</style>
