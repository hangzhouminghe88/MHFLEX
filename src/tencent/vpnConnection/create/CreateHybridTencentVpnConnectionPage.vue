<template>
  <create-template>
	  <div slot="header" class="create-header">
			<span class="create-title">创建Vpn连接</span>
			<span class="create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px;">
					回到腾讯云vpn链接列表
				</span>
			</span>
		</div>

		<div slot="body" class="create-body">
      <div v-if="step === 0">
				<mh-input :label="'common.name'"
				          :required="true"
									v-model="name"
									:show-error="emptyname || invalidname"
									:error-message="rules.name.message"
									prop="name"
									helperName="vpnTencentConnection"
									@validate="validate"/>

				<mh-input :label="'common.description'"
				          type="textarea"
									v-model="description"/>

				<mh-input :label="'common.virtualRouterDevice'"
				          :required="true"
									:show-error="emptyvRouterUuid"
									type="slot"
									:error-message="rules.vRouterUuid.message">
				  <add-or-delete-input :value="dbData.vm[vRouterUuid] && dbData.vm[vRouterUuid].name"
					                     @open="openVRouterSelect"
															 :class="{'is-error': emptyvRouterUuid}"
															 @remove="removeUuid('vRouterUuid')"/>
				</mh-input>

					<mh-input :label="'common.privateNetwork'"
					          v-if="showVRouterNetwork"
				            :required="true"
									  :show-error="emptyprivateUuid"
								  	type="slot"
									  :error-message="rules.privateUuid.message">
				  <add-or-delete-input :value="l3NetWorkValue"
					                     @open="openPrivateNetWorkSelect"
															 :class="{'is-error': emptyprivateUuid}"
															 @remove="removeUuid('privateUuid')"/>
				</mh-input>

				<mh-input :label="'VPN网关(腾讯云)'"
				          :required="true"
									:show-error="emptyvpnGatewayUuid"
									type="slot"
									:error-message="rules.vpnGatewayUuid.message">
				  <add-or-delete-input :value="dbData.hybridTencentVpcVpnGateway[vpnGatewayUuid] && dbData.hybridTencentVpcVpnGateway[vpnGatewayUuid].name"
					                     @open="openVpnGateWaySelect"
															 :class="{'is-error': emptyvpnGatewayUuid}"
															 @remove="removeUuid('vpnGatewayUuid')"/>
				</mh-input>

				<mh-input :label="'对端网关'"
				          :requried="true"
									:show-error="emptyuserGatewayUuid"
									type="slot"
									:required="true"
									:error-message="rules.userGatewayUuid.message">
				  <add-or-delete-input :value="dbData.hybridTencentVpcUserGateway[userGatewayUuid] && dbData.hybridTencentVpcUserGateway[userGatewayUuid].name"
					                     @open="openUserGateWaySelect"
															 :class="{'is-error': emptyuserGatewayUuid}"
															 @remove="removeUuid('userGatewayUuid')"/>
				</mh-input>

				<mh-input :label="'IKE'+$t('hybridvpcikeconfig.psk')"
				          :required="true"
									v-model="IKEpsk"
									:show-error="emptyIKEpsk || invalidIKEpsk"
									:error-message="rules.IKEpsk.message"
									prop="IKEpsk"
									helperName="tencentIKEpsk"
									@validate="validate"/>
			</div>
			<div v-if="step === 1">
				<mh-input :label="'IKE' + $t('hybridvpcikeconfig.salifetime')"
				          :required="true"
									v-model="IKElifetime"
									type="number"
									:show-error="emptyIKElifetime || invalidIKElifetime"
									:error-message="rules.IKElifetime.message"
									prop="IKElifetime"
									@validate="validate"/>

				<mh-input :label="'IKE' + $t('hybridvpcikeconfig.localIp')"
				          :required="true"
									v-model="IKElocalIp"
									:show-error="emptyIKElocalIp || invalidIKElocalIp"
									:error-message="rules.IKElocalIp.message"
									prop="IKElocalIp"
									@validate="validate"/>

				<mh-input :label="'IKE' + '腾讯云端IP'"
				          :required="true"
									v-model="IKEremoteIp"
									:show-error="emptyIKEremoteIp || invalidIKEremoteIp"
									:error-message="rules.IKEremoteIp.message"
									prop="IKEremoteIp"
									@validate="validate"/>

				<mh-input :label="'IKE' + '明和端IP'"
				          :required="true"
									type="select"
									v-model="IKEversion"
									:selectGroup="IKEversionGroup"
									@changeOption="changeIKEversion"/>

				<mh-input :label="'IKE' + $t('hybridvpcikeconfig.mode')"
				          :required="true"
									type="select"
									v-model="IKEmode"
									:selectGroup="IKEmodeGroup"
									@changeOption="changeIKEmode"/>

				<mh-input :label="'IKE' + $t('hybridvpcikeconfig.encodeAlgorithm')"
				          :required="true"
									type="select"
									v-model="IKEencAlg"
									:selectGroup="IKEencAlgGroup"
									@changeOption="changeIKEencAlg"/>

				<mh-input :label="'IKE' + $t('hybridvpcikeconfig.authAlgorithm')"
				          :required="true"
									type="select"
									v-model="IKEauthAlg"
									:selectGroup="IKEauthAlgGroup"
									@changeOption="changeIKEauthAlg"/>

				<mh-input :label="'IKE' + $t('hybridvpcikeconfig.dhGroups')"
				          :required="true"
									type="select"
									v-model="IKEpfs"
									helperName="tencentDH"
									:selectGroup="IKEpfsGroup"
									@changeOption="changeIKEpfs"/>

				<mh-input :label="'IPSec' + $t('hybridvpcipsecconfig.salifetime')"
				          :required="true"
									v-model="IPSeclifetime"
									type="number"
									:show-error="emptyIPSeclifetime || invalidIPSeclifetime"
									:error-message="rules.IPSeclifetime.message"
									prop="IPSeclifetime"
									@validate="validate"/>

				<mh-input :label="'IPSec' + $t('hybridvpcipsecconfig.encodeAlgorithm')"
				          :required="true"
									type="select"
									v-model="IPSecencAlg"
									:selectGroup="IPSecencAlgGroup"
									@changeOption="changeIPSecencAlg"/>

				<mh-input :label="'IPSec' + $t('hybridvpcipsecconfig.authAlgorithm')"
				          :required="true"
									type="select"
									v-model="IPSecauthAlg"
									:selectGroup="IPSecauthAlgGroup"
									@changeOption="changeIPSecauthAlg"/>

				<mh-input :label="'IPSec' + $t('hybridvpcipsecconfig.dhGroups')"
				          :required="true"
									type="select"
									v-model="IPSecpfs"
									helperName="tencentDH"
									:selectGroup="IPSecpfsGroup"
									@changeOption="changeIPSecpfs"/>
			</div>
		</div>

		<div slot="footer" class="create-footer">
			<span class="btn-confirm" @click="prev()" v-show="step === 1">上一步</span>
			<span class="btn-confirm" @click="next()" v-show="step === 0">高级选项</span>
			<span class="btn-confirm" :class="{'disabled': !canCreate}"
			                          @click="canCreate && confirm()" v-show="step === 1">{{$t('common.confirm')}}</span>
			<span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
		</div>
	</create-template>
</template>

<script>

import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import CreateTemplate from 'src/component/CreateTemplate';
import { checkBounce } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import Validator from 'src/utils/validator';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';

export default {
	name: 'CreateHybridTencentVpnConnectionPage',

	components: {CreateTemplate, AddOrDeleteInput},

	mixins: [WindowBase],

	data() {
		return {
			step: 0,
			name: '',
			emptyname: false,
			invalidname: false,
			description: '',
			vRouterUuid: '',
			emptyvRouterUuid: false,
			privateUuid: '',
			emptyprivateUuid: false,
			vpnGatewayUuid: '',
			emptyvpnGatewayUuid: false,
			userGatewayUuid: '',
			emptyuserGatewayUuid: false,
			showVRouterNetwork:  false,
			IKEpsk: '',
			emptyIKEpsk: false,
			invalidIKEpsk: false,
			IKElifetime: 86400,
			emptyIKElifetime: false,
			invalidIKElifetime: false,
			IKElocalIp: '',
			invalidIKElocalIp: false,
			emptyIKElocalIp: false,
			IKEremoteIp: '',
			emptyIKEremoteIp: false,
			invalidIKEremoteIp: false,
			IPSeclifetime: 86400,
			emptyIPSeclifetime: false,
			invalidIPSeclifetime: false,
			IKEversion: 'ikev1',
			IKEmode: 'MAIN',
			IKEencAlg: '3DES-CBC',
			IKEauthAlg: 'MD5',
			IKEpfs: 'GROUP1',
			IPSecencAlg: '3DES-CBC',
			IPSecauthAlg: 'MD5',
			IPSecpfs: 'NULL',
			remoteCidr: '',
			privateUuidList: [],
			localCidr:  '',
			vpcUuid: '',
      canCreate: true,
      l3NetWorkValue: '',
			rules: {
				name: {message: ''},
				vRouterUuid: {message: ''},
				privateUuid: {message: ''},
				vpnGatewayUuid: {message: ''},
				userGatewayUuid: {message: ''},
				IKEpsk: {message: ''},
				IKElifetime: {message: ''},
				IKElocalIp: {message: ''},
				IKEremoteIp: {message: ''},
				IPSeclifetime: {message: ''},
			},
			IKEversionGroup: [
				{label: 'ikev1', value: 'ikev1'},
				{label: 'ikev2', value: 'ikev2'}
			],
			IKEmodeGroup: [
				{label: 'MAIN', value: 'MAIN'},
				{label: 'AGGRESSIVE', value: 'AGGRESSIVE'}
			],
			IKEencAlgGroup: [
				{label: '3DES-CBC', value: '3DES-CBC'},
				{label: 'AES-CBC-128', value: 'AES-CBC-128'},
				{label: 'AES-CBS-192', value: 'AES-CBS-192'},
				{label: 'AES-CBC-256', value: 'AES-CBC-256'},
				{label: 'DES-CBC',value: 'DES-CBC'}
			],
			IKEauthAlgGroup: [
				{label: 'MD5', value: 'MD5'},
				{label: 'SHA1', value: 'SHA1'}
			],
			IKEpfsGroup: [
				{label: 'GROUP1', value: 'GROUP1'},
				{label: 'GROUP2', value: 'GROUP2'},
				{label: 'GROUP5', value: 'GROUP5'},
				{label: 'GROUP14', value: 'GROUP14'},
				{label: 'GROUP24', value: 'GROUP24'},
			],
			IPSecencAlgGroup: [
	      {label: '3DES-CBC', value: '3DES-CBC'},
				{label: 'AES-CBC-128', value: 'AES-CBC-128'},
				{label: 'AES-CBS-192', value: 'AES-CBS-192'},
				{label: 'AES-CBC-256', value: 'AES-CBC-256'},
				{label: 'DES-CBC',value: 'DES-CBC'}
			],
			IPSecauthAlgGroup: [
	      {label: 'MD5', value: 'MD5'},
				{label: 'SHA1',value: 'SHA1'}
			],
			IPSecpfsGroup: [
				{label: 'NULL', value: 'NULL'},
				{label:  'DH-GROUP1', value: 'DH-GROUP1'},
				{label:  'DH-GROUP2', value: 'DH-GROUP2'},
				{label:  'DH-GROUP5', value: 'DH-GROUP5'},
				{label:  'DH-GROUP14', value: 'DH-GROUP14'},
				{label:  'DH-GROUP24', value: 'DH-GROUP24'}
			]
		}
	},

	computed: {

	},

	methods: {
		...Validator,
		...{
			create: Methods.methods.create
		},
		//回到腾讯云vpn连接列表
		close() {
			let self = this;
			self.$router.push({name: 'hybridtencentvpnconnection'})
		},
		//移除
		removeUuid(uuid) {
			let self = this;
			self[uuid] = "";
			self.validate(uuid);
		},
		//选择vRoute云主机
		openVRouterSelect() {
      let self = this;
      self.openDialog('VirtualRouterVmInstanceListSingleSelectDlg', {
        conditions: ['hypervisorType=KVM', 'state=Running', 'type=ApplianceVm', 'status=Connected', 'applianceVmType=vrouter'],
        select: (uuid) =>{
          this.selectVRouter(uuid)
        }
      })
		},
		 //选择路由器
      selectVRouter(uuid) {
        this.getVRouterPrivateNetwork(uuid)
        this.vRouterUuid = uuid;
        this.showVRouterNetwork =  true;
        this.validate('vRouterUuid')
      },
		//选择vpn网关
		openVpnGateWaySelect() {
      let self = this;
        self.openDialog('HybridTencentVpcVpnGateWaySingleSelect', {
          conditions: [],
          select: (uuid) => {
           self.selectHybridVpcVpnGateway(uuid);
          }
        })
		},
		  //获得私有网络
      getVRouterPrivateNetwork (uuid) {
        rpc.query('l3-networks', {
          q: [`vmNic.vmInstance.uuid=${uuid}`, 'category=Private']
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              this.updateDbTable({
                tableName: 'l3network',
                list: resp.inventories
              })
              let privateUuidList = resp.inventories.map((item) => item.uuid)
              this.privateUuidList = privateUuidList;
              this.privateUuid = privateUuidList[0];
              this.remoteCidr = this.dbData.l3network[privateUuidList[0]].ipRanges[0].networkCidr;
              this.validate('privateUuid')
            }
          })
      },
		//选择用户网关
		openUserGateWaySelect() {
      let self = this;
      self.openDialog('HybridTencentVpcVpnUserGateWaySelectList', {
         conditions: [],
          ok: (uuid) => {
            self.selectHybridVpcUserVpnGateway(uuid);
        }
      })
		},
		//
		validate(name) {
       let self = this, errorMsg = '';
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'IKElocalIp', 'IKEremoteIp']
				let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name]).trim() : self[name]
				self.rules[name].message = '';
				errorMsg = self.getErrorMessage(name);
        if (!input) {
					self[`empty${name}`] = true;
					self.rules[name].message = self.$t('error.emptyInput') + errorMsg;
          return
        }
        self[`invalid${name}`] = false
        if ((name === 'IKElocalIp' || name === 'IKEremoteIp') && !this.isIP(input)) {
					self[`invalid${name}`] = true;
					self.rules[name].message = self.$t('error.emptyInput') + self.$t(errorMsg);
					return;
        }
        if (name === 'name' && this.isNumber(input)) {
					self[`invalid${name}`] = true;
					self.rules[name].message = self.$t('error.emptyInput') + self.$t(errorMsg);
					return
        }
		},
		//获得错误信息
		getErrorMessage(name) {
			switch(name) {
				case 'name':
					return this.$t('common.name');
				case 'IKElocalIp':
					return '明和端IP';
				case 'IKEremoteIp':
					return '腾讯云端IP';
				case 'privateUuid':
					return this.$t('common.privateNetwork');
				case 'vRouterUuid':
					return this.$t('common.virtualRouterDevice');
				case 'vpnGatewayUuid':
					return 'VPN网关(腾讯云)';
				case 'userGatewayUuid':
					return '对端网关';
				case 'IKEpsk':
					return this.$t('hybridvpcikeconfig.psk');
				case 'IKElifetime':
					return 'IKE' + this.$t('hybridvpcikeconfig.lifetime');
				case 'IPSeclifetime':
					return 'IPSec' + this.$t('hybridvpcipsecconfig.salifetime');
			};
		},
		 //整体校验
		 validateAll() {
			 let self = this, props = [];
			 if(self.step === 0) {
					 props = ['name', 'vRouterUuid', 'vpnGatewayUuid', 'userGatewayUuid', 'IKEpsk'];
					 if(self.showVRouterNetwork) {
						 props.concat('privateUuid');
					 }
			 }
			 if(self.step === 1) {
					props = ['name', 'vRouterUuid', 'vpnGatewayUuid', 'userGatewayUuid', 'IKElifetime', 'IPSeclifetime', 'IKElocalIp', 'IKEremoteIp', 'IKEpsk'];
					 if(self.showVRouterNetwork) {
						 props.concat('privateUuid');
					 }
			 }
			 props.forEach((name) => self.validate(name));
			 let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
			 return invalid;
		 },
		//上一步
		prev() {
			let self = this;
			self.step --;
		},
		//下一步
		next() {
			let self = this;
			if(self.validateAll()) return;
			self.step ++;
		},
		//选择IKE版本
		 changeIKEversion() {

		 },
    //打开选择私网弹框
		openPrivateNetWorkSelect() {
        let self = this;
        self.openDialog('L3NetworkSingleSelectListDlg',{
          conditions:['category=Private', `uuid?=${self.privateUuidList}`],
          select:(uuid) => self.selectPrivateNetwork(uuid),
        })
    },
    //选择私有网络
    selectPrivateNetwork(uuid) {
        this.privateUuid = uuid;
        this.remoteCidr = this.dbData.l3network[uuid].ipRanges[0].networkCidr
        this.validate('privateUuid');
        this.getL3NetworkName();
    },
    //设置私有网络名称
    getL3NetworkName() {
			let self = this, value = '', uuid = self.privateUuid;
			if(!uuid) return '';
        try {
          value = this.dbData.l3network[uuid].name
        } catch (e) {
          if (checkBounce(`getL3NetworkName-${uuid}`)) return ''
          rpc.query('l3-networks', {
            q: `uuid=${uuid}`
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: resp.inventories[0]
                })
              }
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        this.l3NetWorkValue = value
		},
		//选择vpn网管
		selectHybridVpcVpnGateway (uuid) {
        let vpcVpnGateway = _.cloneDeep(this.dbData.hybridVpcVpnGateway[uuid])
        this.vpnGatewayUuid = uuid;
        this.validate('vpnGatewayUuid')
        if (vpcVpnGateway) {
          this.IKElocalIp = vpcVpnGateway.publicIp;
          this.validate('IKElocalIp')
          rpc.query('hybrid/tencent/vswitch', {
            q: `uuid=${vpcVpnGateway.vSwitchUuid}`
          })
            .then((resp) => {
              if (resp.inventories.length === 1) {
                this.updateDbRow({
                  tableName: 'hybridTencentSubNets',
                  id: resp.inventories[0].uuid,
                  list: resp.inventories[0]
                })
                this.vpcUuid = resp.inventories[0].ecsVpcUuid;
                return rpc.query('hybrid/tencent/vpc', {
                  q: `uuid=${resp.inventories[0].ecsVpcUuid}`
                })
                  .then((resp) => {
                    if (resp.inventories.length === 0) return
                    return this.localCidr = resp.inventories[0].cidrBlock
                  })
              }
            })
        }
			},
			//选择对端网关
			selectHybridVpcUserVpnGateway(uuid) {
        let vpcUserVpnGateway = _.cloneDeep(this.dbData.hybridVpcUserVpnGateway[uuid])
        this.userGatewayUuid =  uuid;
        this.validate('userGatewayUuid')
        if (vpcUserVpnGateway) {
          this.IKEremoteIp = vpcUserVpnGateway.ip;
          this.validate('IKEremoteIp')
        }
			},
			//添加参数
			 createParam: function () {
        return {
          name: this.name,
          description: this.description,
          vpnGatewayUuid: this.vpnGatewayUuid,
          userGatewayUuid: this.userGatewayUuid,
          localCidr: this.localCidr,
          remoteCidr: this.remoteCidr,
          active: this.active,
          ikeConfUuid: this.ikeConfUuid,
          ipsecConfUuid: this.ipsecConfUuid,
          preShareKey: this.IKEpsk,

          IKEpsk: this.IKEpsk,
          IKEpfs: this.IKEpfs,
          IKEversion: this.IKEversion,
          IKEmode: this.IKEmode,
          IKEencAlg: this.IKEencAlg,
          IKEauthAlg: this.IKEauthAlg,
          IKElifetime: this.IKElifetime,
          IKElocalIp: this.IKElocalIp,
          IKEremoteIp: this.IKEremoteIp,

          IPSecpfs: this.IPSecpfs,
          IPSecencAlg: this.IPSecencAlg,
          IPSecauthAlg: this.IPSecauthAlg,
          IPSeclifetime: this.IPSeclifetime,

          vpcUuid: this.vpcUuid
        }
			},
			//创建Vpn连接
			confirm() {
				let self = this;
				if(self.validateAll()) return;
				self.canCreate = false;
				self.create(self.createParam())
				.then(() => {
					self.close()
				}).catch(() => {
					self.canCreate = true;
				})
			},
				//更新IKE模式
		changeIKEmode(item) {
			let self = this;
			self.IKEmode = item.value;
		},
		//更新IKE算法
		changeIKEencAlg(item) {
			let self = this;
			self.IPSecencAlg = item.value;
		},
		//更新IKE签名算法
		changeIKEauthAlg(item) {
			let self = this;
			self.IKEauthAlg = item.value;
		},
		//更新IKEpfs
		changeIKEpfs(item) {
			let self = this;
			self.IKEpfs = item.value;
		},
		//更新IPSecencAlg
		changeIPSecencAlg(item) {
			let self = this;
			self.IPSecencAlg = item.value;
		},
		//更新IPSecauthAlg
		changeIPSecauthAlg(item) {
			let self = this;
			self.IPSecauthAlg = item.value;
		},
		//更新IPSecpfs
		changeIPSecpfs(item) {
			let self = this;
			self.IPSecpfs = item.value;
		}
	 }
}
</script>

<style scoped>

</style>
