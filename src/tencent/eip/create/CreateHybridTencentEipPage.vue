<template>
	<create-template>
		<div slot="header" class="create-header">
			<span>{{$t('hybrideip.create')}}</span>
			<span class="create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px;">
					回到腾讯云公网Ip列表
				</span>
			</span>
		</div>

		<div slot="body" class="create-body">
			<mh-input type="slot"
			          :required="true"
								:label="'common.description'"
			          :show-error="emptydataCenterUuid"
								:error-message="rules.dataCenterUuid.message">
			  <add-or-delete-input @open="openDataCenterSelect"
				                     :value="dbData.hybridTencentDataCenter[dataCenterUuid] && dbData.hybridTencentDataCenter[dataCenterUuid].regionName"
														 :class="{'is-error': emptydataCenterUuid}"
														 @remove="removeUuid('dataCenterUuid')"/>
			</mh-input>

			<mh-input :label="'common.name'"
			          :required="true"
								:show-error="emptyname || invalidname"
								v-model="name"
								:error-message="rules.name.message"
								@validate="validate"
								prop="name"/>

			<mh-input :label="'common.description'"
			          type="textarea"
			          v-model="description"
								prop="description"/>

			<mh-input :label="'hybridecsinstance.ecsBandWidth'" style="width: 240px; display: inline-block;"
			          :required="true"
								type="number"
								:show-error="emptybandWithMb || invalidbandWithMb"
								v-model="bandWithMb"
								:error-message="rules.bandWithMb.message"
								@validate="validate"
								prop="bandWithMb"/>
			<div class="unit">{{bandWithMbUnit}}</div>

		</div>

		<div slot="footer" class="create-footer">
			<span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
			<span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
		</div>
	</create-template>
</template>

<script>

import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import CreateTemplate from 'src/component/CreateTemplate';
import WindowBase from 'src/windows/Window';
import Methods from '../Methods';

export default {
	name: 'CreateHybridTencentEipPage',

	mixins: [WindowBase],

	components: {
		CreateTemplate,
		AddOrDeleteInput
	},

	data() {
		return {
			canCreate: true,
			name: '',
			emptyname: false,
			invalidname: false,
			dataCenterUuid: '',
			emptydataCenterUuid: false,
			bandWithMb: '',
			description: '',
			emptybandWithMb: false,
			invalidbandWithMb: false,
			bandWithMbUnit: 'Mbps',
			rules: {
				name: {message: ''},
				dataCenterUuid: {message: ''},
				bandWithMb: {message: ''}
			},
			chargeType:'PayByTraffic',
      type: 'tencent'
		}
	},

	methods: {
		...{
			create: Methods.methods.create
		},

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
    //回到腾讯云公网Ip列表
		close() {
			this.$router.push({name: 'hybridtencenteip'});
		},
		//选择腾讯云地域
		openDataCenterSelect() {
			let self = this;
			self.openDialog('HybridTencentDataCenterSingleSelect',{
				conditions: [],
				select: (uuid) => {
					self.dataCenterUuid = uuid;
					self.validate('dataCenterUuid');
				}
			})
		},
		//移除addOrDeleteInput中的数据
		removeUuid(uuid) {
			let self = this;
			self[uuid] = "";
			self.validate('dataCenterUuid');
		},
		//单个校验
		validate(name) {
			let self = this, input = '', errorMsg = '';
			input = name === 'name'? String(self[name]).trim() : self[name];
			self[`empty${name}`] = false;
			self[`invalid${name}`] = false;
			self.rules[name].message = '';
			switch(name) {
				case 'dataCenterUuid':
					errorMsg = self.$t('common.hybriddatacenter');
					break;
				case 'name':
					errorMsg = self.$t('common.name');
					break;
				case 'bandWithMb':
					errorMsg = self.$t('hybridecsinstance.ecsBandWidth');
					break;
			}
			if(!input) {
			  self[`empty${name}`] = true;
				self.rules[name].message = self.$t('error.emptyInput') + errorMsg;
				return;
			}
			 if (name === 'name' && !isNaN(input)) {
					this[`invalid${name}`] = true;
					self.rules[name].message = self.$t('error.invalid') + errorMsg;
					return;
       }
		},
		validateAll() {
			let self = this,  props= ['name', 'bandWithMb', 'dataCenterUuid'];
			props.forEach((name) => {
				self.validate(name);
			})
			let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
			return invalid;
		},

		createParam() {
			return {
				name: this.name.trim(),
				description: this.description,
				dataCenterUuid: this.dataCenterUuid,
				bandWidthMb: Number(this.bandWithMb),
				chargeType: this.chargeType,
        type: this.type,
			}
		}
	}
}
</script>

<style scoped>
.unit{
	display: inline-block;
  width: 60px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #adb0b8;
}
</style>
