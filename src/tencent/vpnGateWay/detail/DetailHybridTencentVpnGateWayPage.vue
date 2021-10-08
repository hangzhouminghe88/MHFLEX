<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">腾讯云网关详情</span>
      <div class="detail-header-item create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到腾讯云Vpn网关列表</span>
      </div>
			<div class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">腾讯云Vpn网关操作</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
							<a style="padding-top: 12px;" @click="pageAsync()">{{$t('adLdapServer.sync')}}</a>
							<a style="padding-bottom: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
						</div>
					</span>
				</drop-down>
			</div>
			<el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
				<el-tab-pane :label="'VPN连接'" name="vpnConnection"></el-tab-pane>
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
					<div class="detail-block-detail">
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
				<div style="height:40px;"></div>
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
                goToDistination(item.nameSpace);
							}
						}"
					/>
				<div class="split-line"></div>
			</div>
		</div>

		<div slot="body" class="detail-body" v-if="activeName === 'vpnConnection'">
			<hybrid-tencent-vpn-connection-tab :param="{conditions: `vpnGatewayUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"/>
		</div>

		<div slot="footer">
      <detail-hybrid-tencent-sub-net-page :param="detailSubNetParam" v-if="showDetailSubNet" @close="showDetailSubNet=false;"/>
		</div>
  </detail-template>
</template>

<script>

import HybridTencentVpnConnectionTab from 'src/tencent/vpnGateWay/component/HybridTencentVpnConnectionTab';
import DetailHybridTencentSubNetPage from 'src/tencent/vpc/components/DetailHybridTencentSubNetPage';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WndowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import { mapGetters } from 'vuex';
import Methods from '../Methods';

export default {
	name: 'DetailHybridTencentVpnGateWayPage',

	components: {DetailHybridTencentSubNetPage, DetailTemplate, HybridTencentVpnConnectionTab},

	mixins:[WndowBase, PageBase, Methods],

	data() {
		return {
			detailSubNetParam: {},
			showDetailSubNet: false,
			activeName: 'info'
		}
	},

	computed: {
    ...mapGetters({
			get: 'hybridTencentVpcVpnGateway/get'
		}),
		tencentVpnGateWay() {
			return this.get(this.windowData.dataUuid);
		},
		leftItemGroup() {
			let self = this;
      return [
				{title: '腾讯云Ip地址', content: self.tencentVpnGateWay && self.tencentVpnGateWay.ip},
				{title: 'common.createDate', content: self.tencentVpnGateWay && self.tencentVpnGateWay.createDate && formatDatetime(new Date(self.tencentVpnGateWay.createDate))},
				{title: 'common.lastOpDate', content: self.tencentVpnGateWay && self.tencentVpnGateWay.lastOpDate && formatDatetime(new Date(self.tencentVpnGateWay.lastOpDate))},
			]
		},
		rightItemGroup() {
			let self = this;
      return [
				{title: 'common.uuid', content: self.windowData.dataUuid, copy: true},
				{title: 'common.hybrididentityzone', content: (self.tencentVpnGateWay &&  self.tencentVpnGateWay.vSwitchUuid) ? self.getIdentityZoneName(self.windowData.dataUuid) : '', nameSpace: 'iZone'},
				{title: 'VPC', content: (self.tencentVpnGateWay && self.tencentVpnGateWay.vSwitchUuid) ? self.getEcsVpcName(self.windowData.dataUuid) : '', nameSpace: 'vpc'},
				{title: 'hybridvswitch.vSwitch', content:self.tencentVpnGateWay && self.tencentVpnGateWay.vSwitchName, nameSpace: 'vSwitch'},
			]
		}
	},

	created() {
		let self = this, dataUuid = '';
		dataUuid  = self.$route.params.uuid ? self.$route.params.uuid : '';
		self.updateWindow({
			dataUuid,
			methods: {
				query: self.detailQuery
			}
		}).then(() => {
			self.detailQuery();
		})
	},

	methods: {
    //查询详情
		detailQuery() {
			let self = this;
			return self.dispatchAction('hybridTencentVpcVpnGateway/basicQuery', {
				q: [`uuid=${self.windowData.dataUuid}`]
			});
		},
    //更新参数列表
		updateResourceParam(type) {
      return {
				getValue: () => {
					return this.tencentVpnGateWay && this.tencentVpnGateWay[type];
				},
				setValue: () => {
					return
				},
				canEdit: () => {
					return false;
				}
			}
		},
		//跳转到相关的详情页
		goToDistination(nameSpace) {
			let self = this;
			switch(nameSpace) {
				case  'iZone':
					self.$router.push({name: 'detailHybridTencentIdentityZone', params: {uuid: self.dbData.hybridTencentVpcVpnGateway[self.windowData.dataUuid].identityZoneUuid}})
					break;
				case 'vpc':
					self.$router.push({name: 'detailHybridTencentVpc', params: {uuid: self.dbData.hybridTencentVpcVpnGateway[self.windowData.dataUuid].ecsVpcUuid}})
					break;
				case 'vSwitch':
					self.detailSubNetParam = {uuid: self.tencentVpnGateWay.vSwitchUuid, refresh: self.detailQuery};
					self.showDetailSubNet = true;
					break;
			}
		},
		//删除本地vpn
		detailDelete() {
			let self = this, uuidList = [self.windowData.dataUuid];
			 self.openDialog('ConfirmDlg', {
        title: 'hybridvpcvpngateway.delete',
        description: 'hybridvpcvpngateway.deleteVpnGateway',
        uuidList,
        icon: 'vpn_gateway_popupico',
        isChecked: true,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return self.dbData.hybridTencentVpcVpnGateway[uuid].name;
        },
        ok: (isOrigin) => {
          self.delete(isOrigin, uuidList)
            .then( () => {
              self.queryList();
            });
        }
      })
		},
		//返回
		close() {
      this.$router.push({name: 'hybridtencentvpcvpngateway'})
		}
	}
};
</script>

<style scoped>
</style>
