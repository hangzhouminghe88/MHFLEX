<template>
  <create-template>
		<div slot="header" class="create-header">
			<span class="create-title">创建对端网关</span>
			<span class="create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px;">回到腾讯云对端网关列表</span>
			</span>
		</div>

		<div slot="body" class="create-body">
			<mh-input :label="'common.name'" 
			          :required="true" 
								v-model="name" 
								:error-message="rules.name.message" 
								:show-error="emptyname || invalidname" 
								prop="name" 
								@validate="validate"/>

			<mh-input :label="'common.description'" 
								v-model="description" 
					      type="textarea"/>

			<mh-input :label="'common.ip'" 
			          :required="true" 
								v-model="userIp" 
								:error-message="rules.userIp.message" 
								:show-error="emptyuserIp || invaliduserIp" 
								prop="userIp" 
								placeholder="192.168.1.1"
								helperName="tencentUserGateWayIp"
								@validate="validate"/>

			<mh-input :label="'common.hybriddatacenter'" 
			          :required="true" 
								:error-message="rules.dataCenterUuid.message" 
								:show-error="emptydataCenterUuid" 
								type="slot">
			  <add-or-delete-input :value="dbData.hybridTencentDataCenter[dataCenterUuid] && dbData.hybridTencentDataCenter[dataCenterUuid].regionName" 
														 :class="{'is-error': emptydataCenterUuid}"
														 @open="openTencentDataCenterSelect" 
														 @remove="removeUuid('dataCenterUuid')"/>					
			</mh-input>

		</div>

		<div slot="footer" class="create-footer">
			<div class="btn-confirm"
			     :class="{'disabled':!canCreate}" 
			     @click="canCreate && confirm()">{{$t('common.confirm')}}</div>
			<div class="btn-cancel" @click="close()">{{$t('common.cancel')}}</div>
		</div>
	</create-template>
</template>

<script>

import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import CreateTemplate from 'src/component/CreateTemplate';
import WindowBase from 'src/windows/Window';
import Validator from 'src/utils/validator';
import Methods from '../Methods';

export default {
	name: 'CreateHybridTencentVpnGateWayPage',

	components: {CreateTemplate, AddOrDeleteInput},

	mixins: [WindowBase],

	data() {
		return {
			name: '',
			emptyname: false,
			invalidname: false,
			description: '',
			userIp: '',
			emptyuserIp: false,
			invaliduserIp: false,
			dataCenterUuid: '',
			emptydataCenterUuid: false,
			canCreate: true,
			rules: {
				name: {message: ''},
				userIp: {message: ''},
				dataCenterUuid: {message: ''}
			}
		}
	},

	methods: {
		...{
			create: Methods.methods.create,
		},
		...Validator,
		//回到腾讯云用户网关列表
		close() {
			let self = this;
			self.$router.push({name: 'hybridtencentvpnusergateway'});
		},
		//确定添加
		confirm() {
			let self = this;
			if(self.validateAll()) return;
			self.canCreate = false;
			self.create(self.createParam())
			.then(() => {
				self.close();
			}).catch(() => {
        self.canCreate = true;
			})
		},
		//校验
		validate(name) {
			let  self = this, input = '', errorMsg = '';
			input = name === 'name' ? String(self[name]).trim() : self[name];
			switch(name) {
        case 'name':
					errorMsg  = "common.name";
					break;
				case 'userIp':
					errorMsg = "";
					break;
				case 'dataCenterUuid':
					errorMsg = 'common.hybriddatacenter';
					break;
			}
			self[`empty${name}`] = false;
			self[`invalid${name}`] = false;
			self.rules[name].message = "";
			if(!input) {
					self[`empty${name}`] = true;
					self.rules[name].message = self.$t('error.emptyInput') + self.$t(errorMsg);
					return;
			}
			if(name === 'name') {
				if(!/^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5_a-zA-Z0-9-]+$/.test(input)) {
					 self[`invalid${name}`] = true;
					 self.rules[name].message = self.$t('error.invalid') + self.$t(errorMsg);
					 return;
				}
			}
			if(name === 'userIp') {
				if(!self.isIP(input)) {
					 self[`invalid${name}`] = true;
					 self.rules[name].message = self.$t('error.invalid') + self.$t(errorMsg);
					 return;
				}
			}
		},
		//整体校验
		validateAll() {
			let self = this, props=['name', 'userIp', 'dataCenterUuid'];
			props.forEach(name => {
				self.validate(name);
			})
			let invalid = props.some(name => {
				return self[`empty${name}`] === true || self[`invalid${name}`] === true;
			})
			return invalid;
		},
		//构造创建参数
		createParam() {
			let self = this;
			return {
				name: self.name, 
				description: self.description,
				ip: self.userIp,
				dataCenterUuid: self.dataCenterUuid
			}
		},
		//选择地域
		openTencentDataCenterSelect() {
			let self = this;
			self.openDialog('HybridTencentDataCenterSingleSelect', {
				conditions: [],
				select: (uuid) => {
					self.dataCenterUuid = uuid;
					self.validate('dataCenterUuid');
				}
			})
		},
		//移除地域
		removeUuid(uuid) {
			let self = this;
			self[uuid] = "";
			self.validate('dataCenterUuid');
		}
	} 
}
</script>

<style scoped lang="less">

</style>
