<template>
  <detail-template>
		<div slot="header" class="detail-header">
			<span class="page-header-title">
				腾讯云CVM云主机详情
			</span>
			<span class="detail-header-item create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span class="text" style="font-size: 12px;">回到腾讯云CVM列表</span>
			</span>
			<span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">{{$t('hybridecsinstance.hybridecsinstanceActions')}}</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
							  <a style="padding-top: 12px;" :class="{'disabled-text': inStates('RUNNING')}" @click="!inStates('RUNNING') && detailEnableOrDisable('Running')">{{$t('common.start')}}</a>
								<a :class="{'disabled-text': inStates('STOPPED')}" @click="!inStates('STOPPED') && detailEnableOrDisable('Stopped')">{{$t('common.stop')}}</a>
							  <a @click="!inStates('STOPPED') && detailReboot()" :class="{'disabled-text': !!inStates('STOPPED')}">{{$t("common.reboot")}}</a>
                <a @click="inStates('RUNNING') && detailOpenConsole()" :class="{ 'disabled-text': !inStates('RUNNING')}">{{ $t("vm.console") }}</a>
                <a @click="detailSetVmConsolePassword()">{{$t("common.setConsolePassword")}}</a>
                <a @click="detailUpdateEcsRootPassword()">{{$t("hybridecsinstance.updateRootPassword")}}</a>
                <a @click="detailDelete()" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
						</div>
					</span>
				</drop-down>
			</span>
			<el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
				<el-tab-pane :label="$t('common.disk')" name="disk"></el-tab-pane>
			</el-tabs>
		</div>

		<div slot="body" class="detail-body" v-if="activeName === 'info'">
		  <div class="left">
				<div class="left-header">
					<div class="icon"></div>
					<div class="after-icon">
						<detail-info-state outer-class-name="detail-page-state" v-if="hybridTecentEcs && hybridTecentEcs.ecsStatus"
                               :state="hybridTecentEcs && hybridTecentEcs.ecsStatus && (hybridTecentEcs.ecsStatus.charAt(0) + hybridTecentEcs.ecsStatus.slice(1).toLowerCase())"/>
            <span class="console" v-if="hybridTecentEcs && hybridTecentEcs.ecsStatus && (hybridTecentEcs.ecsStatus).toLowerCase() === 'running'"
                  @click="detailOpenConsole()">
               <span class="console-label">{{$t('common.console')}}</span>
            </span>
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
						v-if="item.show"
					  :param="{
							title: $t(item.title),
							content: item.content,
							copy: item.copy
						}"
					/>
				</div>
				<div class="split-line"></div>
			</div>
			<div class="right">
				<div style="height: 40px;"></div>
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
                handleLink(item.to);
							}
					}"
				/>
				<div class="split-line"></div>
			</div>
		</div>

		<div slot="body" class="detail-body" v-if="activeName === 'disk'">
			<hybrid-tencent-disk-tab :param="{uuid: windowData.dataUuid, conditions:`ecsInstanceUuid=${windowData.dataUuid}`}"/>
		</div>
	</detail-template>
</template>

<script>

import HybridTencentDiskTab from 'src/tencent/ecs/component/HybridTencentDiskTab';
import DetailInfoState from "src/component/DetailInfoState";
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import windowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import Methods from '../Methods';
import { mapGetters } from 'vuex';

export default {
	name: 'DetialHybridTecentEcsPage',

	mixins: [windowBase, PageBase, Methods],

	components: {
		DetailTemplate,
		DetailInfoState,
		HybridTencentDiskTab
	},

	computed: {
    ...mapGetters({
			get: 'hybridTencentEcsInstance/getList'
		}),
		hybridTecentEcs() {
			return this.get(this.windowData.dataUuid);
		},
		leftItemGroup() {
			return [
				{title: 'CVM云主机Id', content: this.hybridTecentEcs && this.hybridTecentEcs.ecsInstanceId, show: true},
				{title: 'common.cpu', content: this.hybridTecentEcs && this.hybridTecentEcs.cpuCores, show: true},
				{title: 'common.memorySize', content: this.hybridTecentEcs && this.hybridTecentEcs.memorySize + 'G', show: true},
				{title: 'common.privateNetworkIP', content: this.hybridTecentEcs && this.hybridTecentEcs.privateIpAddress, copy: true, show: true},
				{title: 'common.publicNetworkIP', content: this.hybridTecentEcs && this.hybridTecentEcs.publicIpAddress, copy: true, show: true},
				{title: 'hybridecsinstance.ecsBandWidth', content: this.hybridTecentEcs && this.hybridTecentEcs.ecsBandWidth &&  this.hybridTecentEcs.ecsBandWidth === -1 ? this.$t('common.no') : `${this.hybridTecentEcs && this.hybridTecentEcs.ecsBandWidth}Mbps`, show: this.hybridTecentEcs && this.hybridTecentEcs.publicIpAddress},
				{title: 'hybridecsinstance.ecsRootVolumeCategory', content: this.hybridTecentEcs && this.hybridTecentEcs.ecsRootVolumeCategory && (this.hybridTecentEcs.ecsRootVolumeCategory).toLowerCase() === 'cloud_efficiency' ? this.$t('hybridecsinstance.cloud_efficiency') : this.$t('hybridecsinstance.cloud_ssd'), show: true},
				{title: 'hybridecsinstance.paymentInformation', content: this.hybridTecentEcs && this.hybridTecentEcs.chargeType ? this.$t(`hybridTencentEcsInstance.${this.hybridTecentEcs.chargeType}`) : this.$t('hybridecsinstance.afterPayment'), show: true},
				{title: 'hybridecsinstance.expireDate', content: (this.hybridTecentEcs && this.hybridTecentEcs.chargeType === 'PrePaid') ? formatDatetime(new Date(this.hybridTecentEcs.expireDate)) : this.$t('hybridecsinstance.notexpire'), show: true},
				{title: 'common.createDate', content: this.hybridTecentEcs && this.hybridTecentEcs.createDate && formatDatetime(new Date(this.hybridTecentEcs.createDate)), show: true},
				{title: 'common.lastOpDate', content: this.hybridTecentEcs && this.hybridTecentEcs.lastOpDate && formatDatetime(new Date(this.hybridTecentEcs.lastOpDate)), show: true},
			]
		},
		rightItemGroup() {
			return [
				{title: 'common.uuid', content: this.windowData.dataUuid, copy: true},
				{title: 'hybrididentityzone.identityzone', content: this.hybridTecentEcs && this.hybridTecentEcs.identityZoneName, link: true, to: 'izone'},
				{title: 'common.image', content: this.hybridTecentEcs && this.hybridTecentEcs.imageName, link: true, to: 'image'},
				{title: 'VPC', content: this.hybridTecentEcs && this.hybridTecentEcs.vpcName, link: true, to: 'vpc'},
				{title: 'hybridesecuritygroup.securitygroup', content: this.hybridTecentEcs && this.hybridTecentEcs.securityGroupName, link: true, to: 'sg'},
			]
		}
	},

	data() {
		return {
			activeName: 'info'
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
			return self.dispatchAction('hybridTencentEcsInstance/basicQuery', {
				q: [`uuid=${self.windowData.dataUuid}`]
			});
		},
		 //打开控制台
      detailOpenConsole() {
        let self = this;
        self.getEcsInstanceVncUrl([self.windowData.dataUuid]);
			},
		//回到腾讯云Ecs列表
		close() {
			this.$router.push({name: 'hybridtencentecs'})
		},
		//判断能否操作
		inStates() {
			let self = this, states = [];
			for(let arg in arguments) {
				states.push(arguments[arg]);
			}
			let instate = [self.windowData.dataUuid].every((uuid) => {
        return states.some((state) => {
          return self.hybridTecentEcs && self.hybridTecentEcs.ecsStatus === state;
        })
      })
      return instate;
		},

			//删除云主机
		detailDelete () {
			let self = this, uuidList = [];
			uuidList = [self.windowData.dataUuid];
			self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.deleteEcsInstance',
        description: 'hybridecsinstance.delete',
        uuidList,
        icon: 'vm_popupico',
        type: 'delete',
        isChecked: true,
        checkBoxText: "同时删除腾讯云上资源",
        ok: (deleteOrigion) => {
					return self.delete(uuidList, deleteOrigion)
					.then(() => {
						self.close();
					});
        },
        getName: (uuid) => {
          return self.dbData.hybridTencentEcsInstance[uuid].name;
        }
      })
		},
		//重启云主机
		detailReboot() {
			let self = this,
       uuidList = [self.windowData.dataUuid];
      self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.reboot',
        description: 'hybridecsinstance.rebotHybridEcsInstance',
        icon: 'vm_popupico',
        uuidList,
        getName: (uuid) => {
          return self.dbData.hybridTencentEcsInstance[uuid].name;
        },
        ok: () => {
					self.action(uuidList,'reboot').then(() => self.detailQuery());
        }
      })
		},
		//设置控制台密码
		detailSetVmConsolePassword() {
      let self = this;
      let uuid = self.windowData.dataUuid;
      self.openDialog('HybridModifyConsolePassword', {
        ok: (param) => {
          self.updateEcsInstancePassword(uuid, param, 'Console')
          .then(() => self.detailQuery())
        }
      })
    },
     //修改系统用户密码
    detailUpdateEcsRootPassword() {
      let self = this;
      let uuid = self.windowData.dataUuid;
      self.openDialog('HybridModifyRootPassword', {
        ok: (newPassword) => {
          self.updateEcsInstancePassword (uuid, newPassword, 'Root')
            .then(() => self.detailQuery());
        }
      })
		},
		//停用启用云主机
		detailEnableOrDisable(operate ) {
			let self = this, uuidList = [self.windowData.dataUuid];
			if (operate === 'Running') self.action(uuidList, 'start').then(() => self.detailQuery());
			if(operate === 'Stopped')
			 self.openDialog('ConfirmDlg', {
				title: 'hybridecsinstance.stop',
				description: 'hybridecsinstance.stop',
				icon: 'vm_popupico',
				uuidList,
				getName: (uuid) => {
					return self.dbData.hybridTencentEcsInstance[uuid].name;
				},
				ok: () => {
					self.action(uuidList,'stop').then(() => self.detailQuery());
				}
			})
		},
		//更新云主机参数
		updateResourceParam(param) {
			let self = this;
			return {
				getValue: () => {
					return self.hybridTecentEcs && self.hybridTecentEcs[param];
				},
				setValue: (newVal) => {
					if(newVal === self.hybridTecentEcs[param]) return;
					let event = self.createEvent(`common.updateInfo${param}`, self.hybridTecentEcs.name),
					realParam = {};
					realParam = {
						uuid: self.windowData.dataUuid,
						param: {
							[param]: newVal,
						}
					}
					if(param === 'description') {
						realParam = {
							uuid: self.windowData.dataUuid,
						  param: {
								[param]: newVal,
								name: self.hybridTecentEcs.name
						  }
						}
					}
					return self.dispatchActionWithEvent('hybridTencentEcsInstance/update', realParam, null, event).then(() => self.detailQuery());
				}
			}
		},
		//跳转
		handleLink(to) {
			let self = this;
      switch(to) {
				case 'image':
				   self.$router.push({name: 'detailHybridTencentImage', params: {uuid: this.hybridTecentEcs.ecsImageUuid}});
				   break;
				case 'vpc':
					self.$router.push({name: 'detailHybridTencentVpc', params: {uuid: this.hybridTecentEcs.ecsVpcUuid}});
					break;
				case 'izone':
					self.$router.push({name: 'detailHybridTencentIdentityZone', params: {uuid: this.hybridTecentEcs.identityZoneUuid}});
					break;
				case 'sg':
					self.$router.push({name: 'detailHybridTencentSecurityGroup', params: {uuid: this.hybridTecentEcs.ecsSecurityGroupUuid}});
					break;
			}
		}
	},
};
</script>

<style scoped lang="less">
 @import url('../../../style/mixins.less');
 .icon{
	 .detail-icon('~assets/ecs_vm_ico.svg')
 }

  .after-icon{
    display: flex;
    justify-content: space-between;
  }

  .console{
    width: 30px;
    height: 30px;
    background-image: url('~assets/open_console.svg');
    cursor: pointer;
    background-repeat: no-repeat;
    position: relative;
    flex: 1 1 30%;
    .console-label{
      display: none;
      padding: 10px 20px;
      position: absolute;
      top: 35px;
      left: -25px;
      color: #409EFF;
      border: 1px solid #3c73b9;
      background: #fff;
      text-align: center;
      z-index: 2;
      font-size: 12px;
    }
    &:hover{
      .console-label{
        display: inline-block;
      }
    }
  }
  .detail-page-state{
    flex: 1 1 70%!important;
  }
</style>
