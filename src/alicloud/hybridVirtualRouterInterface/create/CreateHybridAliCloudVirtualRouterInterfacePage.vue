<template>
	<create-template>
    <div slot="header" class="create-header">
			<span>{{$t('hybridrouterinterfacepair.add')}}</span>
			<span class="create-back el-icon-back" @click="$router.push({name: 'hybridalicloudvirtualrouterinterface',params: {currTab: $route.params.currTab}})">
				<span class="text" style="font-size: 12px;">
					回到阿里云路由器接口列表
				</span>
			</span>
		</div>

		<div slot="body" class="create-body">

      <div class="operation-row">
				<div class="title required">{{$t('common.name')}}</div>
				<input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
				<div class="error error-text" v-show="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
			</div>

			<div class="operation-row">
				<div class="title required">{{$t('common.description')}}</div>
				<textarea type="text" rows="3" v-model="description"/>
			</div>

			<div class="operation-row">
				<div class="title">{{$t('hybridrouterinterfacepair.spec')}}</div>
				<el-select v-model="spec" style="width: 100%;">
					<el-option v-for="(item, index) in specList" :key="index"
					   :value="item" :label="item"></el-option>
				</el-select>
			</div>

			<div class="operation-row">
				<div class="title required">{{$t('common.hybriddatacenter')}}</div>
				<add-or-delete-input :value="dbData.hybridDataCenter[dataCenterUuid] && dbData.hybridDataCenter[dataCenterUuid].regionName"
				                     @open="openHybridDataCenterSelect" @remove="removeUuid('dataCenterUuid')"
														 :class="{'is-error': emptydataCenterUuid}"/>
				<div class="error error-text" v-show="emptydataCenterUuid">{{$t('error.unselected') + $t('common.hybriddatacenter')}}</div>
			</div>
			<div class="operation-row" v-if="$route.params.currTab === 'vbr'">
				<div class="title required">{{$t('common.hybridvirtualborderrouter')}}</div>
				<add-or-delete-input :value="dbData.hybridvirtualborderrouter[vBRouterUuid] && dbData.hybridvirtualborderrouter[vBRouterUuid].regionName"
				                     @open="openHybridBorderRouterSelect" @remove="removeUuid('vBRouterUuid')"
														 :class="{'is-error': emptyvBRouterUuid}"/>
				<div class="error error-text" v-show="emptyvBRouterUuid">{{$t('error.unselected') + $t('common.hybridvirtualborderrouter')}}</div>
			</div>
				<div class="operation-row" v-if="$route.params.currTab === 'vrouter'">
				<div class="title required">{{$t('hybridaliyunvirtualrouter.virtualrouter')}}</div>
				<add-or-delete-input :value="dbData.hybridAliyunVirtualRouter[vRouterUuid] && dbData.hybridAliyunVirtualRouter[vRouterUuid].name"
				                     @open="openHybridAliyunVRouterDlg" @remove="removeUuid('vRouterUuid')"
														 :class="{'is-error': emptyvRouterUuid}"/>
				<div class="error error-text" v-show="emptyvRouterUuid">{{$t('error.unselected') + $t('common.hybridvirtualborderrouter')}}</div>
			</div>
			<div class="operation-row">
				<div class="title required">{{$t('hybridvirtualborderrouter.accessPoint')}}</div>
				<add-or-delete-input :value="dbData.hybridConnectionAccessPoint[accessPointUuid] && dbData.hybridConnectionAccessPoint[accessPointUuid].name"
				                     @open="openHybridAccessPointSelect" @remove="removeUuid('accessPointUuid')"
														 :class="{'is-error': emptyaccessPointUuid}"/>
				<div class="error error-text" v-show="emptyaccessPointUuid">{{$t('error.unselected') + $t('hybridvirtualborderrouter.accessPoint')}}</div>
			</div>
		</div>

		<div slot="footer" class="create-footer">
			<span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
			<span class="btn-cancel" @click="$router.push({name: 'hybridalicloudvirtualrouterinterface', params: {currTab: $route.params.currTab}})">{{$t('common.cancel')}}</span>
		</div>
	</create-template>
</template>

<script>
import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import CreateTemplate from 'src/component/CreateTemplate';
import WindowBase from 'src/windows/Window';
import Methods from '../Methods';

export default {
	name: 'CreateHybridVirtualRouterInterfacePage',

	mixins: [WindowBase],

	components: {
		CreateTemplate,
		AddOrDeleteInput
	},

	data() {
		return {
			name: '',
			emptyname: false,
			description: '',
			spec: 'Large.1',
			specList: ['Large.1', 'Large.2', 'Large.5'],
			dataCenterUuid: '',
			emptydataCenterUuid: false,
			vRouterUuid: '',
			emptyvRouterUuid: false,
			accessPointUuid: '',
			emptyaccessPointUuid: false,
			canCreate: true,
			routerType: 'VRouter',
			vBRouterUuid: '',
			emptyvBRouterUuid: ''
		}
	},

  created() {
		let self = this;
		self.$route.params === 'vbr' ? self.routerType = 'VBR' :  'VRouter';
	},

	methods: {
		...{
			create: Methods.methods.create
		},

		validate(name) {
			let self = this, input = '';
			input = name=== 'name' ? String(self[name]).trim() : self[name];
			self[`empty${name}`] = false;
			self[`invalid${name}`] = false;
			if(!input) {
				self[`empty${name}`] = true;
				return;
			}
		},

		openHybridDataCenterSelect() {
			let self = this;
			self.openDialog('HybridAliCloudDataCenterSingleSelect', {
				conditins: [],
				select: (uuid) => {
          this.dataCenterUuid = uuid;
          this.validate('dataCenterUuid');
				}
			})
		},

		openHybridBorderRouterSelect() {
			let self = this;
			self.openDialog('HybridAliCloudVirtualBorderRouterSingleSelect', {
				conditins: [],
				select: (uuid) => {
          this.vBRouterUuid = uuid;
          this.validate('vBRouterUuid');
				}
			})
		},

		openHybridAccessPointSelect() {
				let self = this;
			self.openDialog('HybridAliCloudAccessPointSingleSelect', {
				conditions: [],
				ok: (uuid) => {
          this.accessPointUuid = uuid;
          this.validate('accessPointUuid');
				}
			})
		},

     openHybridAliyunVRouterDlg: function () {
      this.openDialog('HybridAliCloudVirtualRouterSingleSelect', {
        conditions: [],
        ok: (uuid) => {
					this.vRouterUuid = uuid;
					this.validate('vRouterUuid');
        }
      })
		},

		removeUuid(uuid) {
			let self = this;
			self[uuid] = '';
			self.validate(uuid);
		},

		createParam() {
			let obj =  {
        name: this.name,
        description: this.description === '' ? undefined : this.windowData.description,
        dataCenterUuid: this.dataCenterUuid,
        accessPointUuid: this.accessPointUuid,
        spec: this.spec,
        routerType: this.routerType
			}
			if(this.$route.params.currTab === 'vbr') {
				obj['vBRouterUuid'] = this.vBRouterUuid
			}else{
				obj['vRouterUuid'] = this.vRouterUuid
			}
			return obj;
		},

		validateAll() {
			let self = this, props= ['name', 'dataCenterUuid', 'accessPointUuid'];
			if(self.$route.params.currTab === 'vbr') {
				if(!props.includes('vBRouterUuid')) {
					props.push('vBRouterUuid')
				}
			}else {
				props.push('vRouterUuid');
			}
			props.forEach((name) => {
				self.validate(name);
			})
			let invalid = props.some((name) => {
				  return self[`empty${name}`] === true || self[`invalid${name}`] === true;
				})
			console.log(invalid);
			return invalid;
		},

		confirm() {
			let self = this;
			if(self.validateAll()) return;
			self.canCreate = false;
			self.create(self.createParam())
			.then( () => {
				self.$router.push({name: 'hybridalicloudvirtualrouterinterface', params: {currTab: self.$route.params.currTab}});
			}).catch( () => {
				self.canCreate = true;
			})
		}
	}

}
</script>

<style lang="less" scoped>

</style>
