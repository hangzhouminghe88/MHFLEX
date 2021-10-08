<template>
	<create-template-no-route style="z-index: 999">
		<div slot="header">
			<span class="title">创建腾讯云路由表</span>
			<span class="create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px">回到腾讯云路由表列表</span>
			</span>
		</div>

		<div slot="body" class="create-body">
			<mh-input :label="'hybridvirtualrouterentry.destinationCidrBlock'" 
			          :required="true" 
								placeholder="192.168.1.0/24" 
								v-model="cidrBlock" 
								:show-error="emptycidrBlock || invalidcidrBlock" 
								:error-message="rules.cidrBlock.message" 
								@validate="validate"
								 prop="cidrBlock"/>

			<mh-input type="select" 
			          :required="true" 
								:label="'hybridvirtualrouterentry.nextHopType'"
								v-model="nextHopType" 
								:selectGroup="nextHopTypeGroup" 
								@changeOption="handleSelectChange"/>

			<mh-input :label="'hybridecsinstance.instance'" 
			          v-if="nextHopType === 'Instance'"
			          :required="true" 
								type="slot"
								:show-error="emptyecsInstanceUuid" 
								:error-message="rules.ecsInstanceUuid.message">
			  <add-or-delete-input :value="dbData.hybridTencentEcsInstance[ecsInstanceUuid] && dbData.hybridTencentEcsInstance[ecsInstanceUuid].name" 
				                     @remove="removeUuid('ecsInstanceUuid')"
														 @open="openHybridTencenEcsSelect" 
														 :class="{'is-error': emptyecsInstanceUuid}"/>					
			</mh-input>

			<mh-input :label="'hybridvpcvpngateway.vpnGateway'" 
			          :required="true" 
								type="slot"
								v-if="nextHopType === 'VPN'"
								:show-error="emptyvpnUuid" 
								:error-message="rules.vpnUuid.message">
			  <add-or-delete-input :value="dbData.hybridTencentVpcVpnGateway[vpnUuid] && dbData.hybridTencentVpcVpnGateway[vpnUuid].name" 
				                     @remove="removeUuid('ecsInstanceUuid')"
														 @open="openHybridTencentVpnSelect" 
														 :class="{'is-error': emptyvpnUuid}"/>					
			</mh-input>

			<mh-input :label="''" 
			           type="slot">
				<el-checkbox-group  v-model="VRouterType">
					<el-checkbox label="USER">{{$t('hybridTencentvirtualrouterentry.USER')}}</el-checkbox>
				</el-checkbox-group>
			</mh-input>
		</div>

		<div slot="footer" class="create-footer">
			<div class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</div>
			<div class="btn-cancel" @click="close()">{{$t('common.cancel')}}</div>
		</div>
	</create-template-no-route>
</template>

<script>

import CreateTemplateNoRoute from 'src/component/CreateTemplateNoRoute';
import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import WindowBase from 'src/windows/Window';
import Validator from 'src/utils/validator';

export default {
	name: 'CreateTencentVirtualRouterEntry',

	mixins: [WindowBase],

	components: {AddOrDeleteInput, CreateTemplateNoRoute},

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
			nextHopTypeGroup: [
				{label: this.$t('hybridecsinstance.instance'), value: 'Instance'},
				{label: 'vpn', value: 'VPN'},
			],
			nextHopType: 'Instance',
			VRouterType: false,
			cidrBlock: '',
			emptycidrBlock: false,
			invalidcidrBlock: false,
			ecsInstanceUuid: '',
			emptyecsInstanceUuid: false,
			vpnUuid:"",
			emptyvpnUuid: false,
			vRouterUuid: '',
			canCreate: true,
			rules: {
				cidrBlock: {message: ''},
				ecsInstanceUuid: {message:''},
				vpnUuid: {message: ''}
			}
		}
	},
	 
	created() {
		let self = this;
		self.vRouterUuid = self.param.uuid;
	},

	methods: {
		...Validator,
    //返回
		close() {
			let self = this;
			self.$emit('close');
		},
    //处理下拉选择框
		handleSelectChange(item) {
			let self = this;
			self.nextHopType = item.value;
		},
    //选择ECS
		openHybridTencenEcsSelect() {
			let self = this;
			self.openDialog('HybridTencentEcsInstanceSingleSelect', {
				conditions: [],
				select : (uuid) => {
					self.ecsInstanceUuid = uuid;
					self.nextHopUuid = uuid;
					self.validate('ecsInstanceUuid');
				}
			})
		},
    //选择Vpn
		openHybridTencentVpnSelect() {
	    let self = this;
			self.openDialog('HybridTencentVpcVpnGateWaySingleSelect', {
				conditions: [],
				ok: (uuid) => {
					self.vpnUuid = uuid;
					self.nextHopUuid = uuid;
					self.validate('vpnUuid');
				}	
			})
		},
    //清理选择框
		removeUuid(uuid) {
			 let self = this;
			 self[uuid] = "";
			 self.validate(uuid);
		},
    //单个校验
		validate(name) {
			 let self = this, input = '', errorMsg = '';
			 input = name === 'name' ? String(self[name]).trim() : self[name];
			 self[`empty${name}`] = false;
			 self[`invalid${name}`] = false;
			 self.rules[name].message = '';
			 name === 'vpcUuid' ? errorMsg = 'hybridvpcvpngateway.vpnGateway'
			 : name === 'ecsInstanceUuid' ? errorMsg = 'hybridecsinstance.instance' 
			 : name === 'cidrBlock' ? errorMsg = 'hybridvirtualrouterentry.destinationCidrBlock' 
			 : '';
			 if(!input) {
				 self[`empty${name}`] = true;
				 self.rules[name].message = self.$t('error.emptyInput') + self.$t(errorMsg);
				 return;
			 }
			 if(name === 'cidrBlock') {
				 if(!this.isCidr(input)) {
						self[`invalid${name}`] = true;
						self.rules[name].message = self.$t('error.invalid') + self.$t(errorMsg);
						return;
				 }
			 }
		},
		//构造添加参数
		createParam() {
			return {
				 dstCidrBlock: this.cidrBlock,
         nextHopUuid: this.nextHopUuid,
         nextHopType: this.nextHopType,
         vRouterType: this.VRouterType ? 'USER' : '',
         vRouterUuid: this.vRouterUuid
			}
		},
		//整体校验
		validateAll() {
			let self = this, props = ['cidrBlock'];
			if(this.nextHopType == 'Instance') {
        props.unshift('ecsInstanceUuid');
			}else{
				props.unshift('vpnUuid');
			}
			props.forEach(name => {
				self.validate(name);
			})
			let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
			return invalid;
		},
    //确定添加
		confirm() {
			let self = this;
			if(self.validateAll()) return;
			self.canCreate = false;
			self.param.ok(self.createParam())
			self.close();
		}
	}
}
</script>

<style scoped>

</style>
