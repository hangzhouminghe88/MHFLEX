<template>
	<detail-template class="detail__tencent__subnet">
		<div slot="header" class="detail-header">
			<span class="detail-title">子网详情</span>
			<div class="detail-header-item create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px;">回到子网列表</span>
			</div>
			<div class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">子网{{$t('common.actions')}}</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
							 <a style="padding: 12px 0px;" @click="pageTencentDetailSubnetsDelete([windowData.dataUuid])">{{$t('common.destroy')}}</a>
						</div>
					</span>
				</drop-down>
			</div>
			<el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
			</el-tabs>
 		</div>
		<div slot="body" class="detail-body">
			<div class="left">
				<div class="left-header">
					<div class="icon"></div>
				  <div class="after-icon">
					  <detail-info-state outer-class-name="detail-page-state" :state="tencentSubNet && tencentSubNet.status"/>
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
								if($route.name.indexOf(item.nameSpace) > -1) close();
								switch(item.nameSpace) {
									case 'TencentIdentityZone':
									  $router.push({name: 'detailHybridTencentIdentityZone', params: {uuid: tencentSubNet.identityZoneUuid}});
										break;
									case 'TencentVpc':
									  $router.push({name: 'detailHybridTencentVpc', params: {uuid: tencentSubNet.ecsVpcUuid}});
										break;
								}
							}
						}"
					/>
			</div>
		</div>
	</detail-template>
</template>

<script>

import TencentSubNetMethods from 'src/tencent/hybridSubNet/Methods';
import DetailInfoState from 'src/component/DetailInfoState';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime  } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import { mapGetters } from 'vuex';

export default {
	name: 'DetailHybridTencentSubNetPage',

	mixins: [WindowBase, PageBase, TencentSubNetMethods],

	components: {
		DetailTemplate,
		DetailInfoState
	},

	props: {
		param: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},

	data() {
		return {
			activeName: "info"
		}
	},

	computed: {
    ...mapGetters({
			get: `hybridTencentSubNets/get`
		}),
		tencentSubNet() {
			return this.get(this.windowData.dataUuid);
		},
		leftItemGroup() {
			return [
				{title:'hybridHuaweiSubNets.subNetId', content: this.tencentSubNet && this.tencentSubNet.vSwitchId},
				{title: 'hybridHuaweiSubNets.subNetCidr', content: this.tencentSubNet && this.tencentSubNet.cidrBlock},
				{title: 'hybridHuaweiSubNets.availableIpCount', content: this.tencentSubNet && this.tencentSubNet.availableIpAddressCount},
				{title: '云主机数量:', content: this.tencentSubNet && this.getTencentEcsInstanceNum(this.windowData.dataUuid)},
				{title: 'common.createDate', content: this.tencentSubNet && this.tencentSubNet.createDate && formatDatetime(new Date(this.tencentSubNet.createDate))},
			  {title: 'common.lastOpDate', content: this.tencentSubNet && this.tencentSubNet.lastOpDate && formatDatetime(new Date(this.tencentSubNet.lastOpDate))},
			]
		},
		rightItemGroup() {
			return [
				{title: 'common.uuid', content: this.windowData.dataUuid, copy: true},
				{title: 'common.hybrididentityzone', content: this.tencentSubNet && this.tencentSubNet.izoneName, nameSpace: 'TencentIdentityZone'},
				{title: 'common.uuid', content:this.tencentSubNet && this.tencentSubNet.vpcName, nameSpace: 'TencentVpc'},
			]
		}
	},

	created() {
		let self = this, dataUuid = '';
		dataUuid = self.param.uuid ? self.param.uuid : '';
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
			return self.dispatchAction('hybridTencentSubNets/basicQuery', {
				q: [`uuid=${self.windowData.dataUuid}`]
			});
		},
		//反回到子网列表
		close() {
			this.param.refresh();
			this.$emit('close');
		},
		//更新参数
		updateResourceParam(type) {
			return {
				getValue: () => {
					return this.tencentSubNet && this.tencentSubNet[type];
				},
				setValue: (newVal) => {
					 if(newVal === this.tencentSubNet[type]) return;
					 let event = this.createEvent(`common.updateInfo${type}`, this.tencentSubNet.name),
					 param = {
						 uuid: this.windowData.dataUuid,
						 param: {
							 [type]: newVal
						 }
					 }
					 this.dispatchActionWithEvent('hybridTencentSubNets/update', param, null, event)
					 .then( () => {
						 this.detailQuery();
					 });
				}
			}
		},
		//删除子网
		pageTencentDetailSubnetsDelete(uuidList) {
			const self = this
      self.openDialog('ConfirmDlg', {
        title: 'hybridvswitch.deleteVSwitch',
        description: 'hybridvswitch.delete',
        icon: 'vswitch_popupico',
        uuidList,
        warning: 'hybridvswitch.info.deleteWarning',
        isChecked: true,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return this.tencentSubNet.name;
        },
        ok: (deleteOrigin) => {
					self.delete(uuidList, deleteOrigin)
					.then(() => {self.close()})
        }
      })
		}
	}
}
</script>

<style scoped lang="less">
 .detail__tencent__subnet{
	  position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    z-index: 20;
 }
 @import url('../../../style/mixins.less');
 .icon{
	 .detail-icon('~assets/vswitch.svg');
 }
</style>
