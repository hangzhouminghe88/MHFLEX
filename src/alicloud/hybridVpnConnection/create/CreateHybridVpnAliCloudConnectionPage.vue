<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybridvpcvpnconnection.create')}}</span>
      <span class="create-back" @click="$router.push({name:'hybridalicloudvpcvpnconnection'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">
          回到阿里云vpn连接列表
        </span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div v-show="step === 0">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input type="text" maxlength="255" v-model="name"
                 :class="{'is-error':emptyname || invalidname}"
                 @blur="validate('name')"/>
          <div class="error-text error" v-if="emptyname && !invalidname">
            {{$t('error.emptyInput') + $t('common.name')}}
          </div>
          <div class="error error-text" v-if="!emptyname && invalidname">
            {{$t('error.invalid') + $t('common.name')}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea rows="3" v-model="description"/>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.virtualRouterDevice') + '(' + $t('common.productionNameForPlaceholderUpperCase')+')'}}</div>
          <add-or-delete-input @open="openVmInplaceDialog"
                               :value="dbData.vm[VRouterUuid] && dbData.vm[VRouterUuid].name"
                               :class="{'is-error': emptyVRouterUuid}"/>
          <div class="error error-text" v-show="emptyVRouterUuid">
            {{$t('error.unselected') + $t('common.virtualRouterDevice') + '(' + $t('common.productionNameForPlaceholderUpperCase')+')'}}
          </div>
        </div>
          <div v-if="showVRouterNetwork" class="operation-row">
            <div class="title required">
              {{$t("common.privateNetwork")}}({{ $t('common.productionNameForPlaceholderUpperCase') }})
            </div>
            <add-or-delete-input @open="openPrivateNetWorkSelect"
                                 :value="getL3NetworkName(privateUuid)"
                                 :class="{'is-error': emptyprivateUuid}"/>
            <div class="error error-text" v-show="emptyprivateUuid">
              {{$t('error.unselected')+$t('common.network')}}
            </div>
          </div>
        <div class="operation-row">
          <div class="title required">{{$t("hybridvpcvpnconnection.vpnGateway")}}</div>
          <add-or-delete-input @open="openVpnGatewaySelect"
                               :value="dbData.hybridVpcVpnGateway[vpnGatewayUuid] && dbData.hybridVpcVpnGateway[vpnGatewayUuid].name"
                               :class="{'is-error': emptyvpnGatewayUuid}"/>
          <div class="error error-text" v-show="emptyvpnGatewayUuid">
            {{$t('error.unselected') + $t("hybridvpcvpnconnection.vpnGateway")}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('hybridvpcvpnconnection.userGateway') + `(${$t("common.aliyun")})`}}</div>
          <add-or-delete-input @open="openVpnUserGatewaySelect"
                               :value="dbData.hybridVpcUserVpnGateway[userGatewayUuid] && dbData.hybridVpcUserVpnGateway[userGatewayUuid].name"
                               :class="{'is-error': emptyuserGatewayUuid}"/>
          <div class="error error-text" v-show="emptyuserGatewayUuid">
            {{$t('error.unselected') + $t('hybridvpcvpnconnection.userGateway') + `(${$t("common.aliyun")})`}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.psk')}}</div>
          <input type="text" v-model="IKEpsk" :class="{'is-error': emptyIKEpsk}" @blur="validate('IKEpsk')"/>
          <div class="error error-text" v-show="emptyIKEpsk">
            {{$t('error.emptyInput') + 'IKE' +$t('hybridvpcikeconfig.psk') }}
          </div>
        </div>
      </div>
      <div v-show="step === 1">
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.salifetime')}}</div>
          <input type="number" v-model="IKElifetime" :class="{'is-error': emptyIKElifetime}"
                 @blur="validate('IKElifetime')"/>
          <div class="error error-text" v-if="emptyIKElifetime">
            {{$t('error.emptyInput') + 'IKE' + $t('hybridvpcikeconfig.salifetime')}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.remoteIp')}}</div>
          <input type="text" v-model="IKEremoteIp"
                 :class="{'is-error': emptyIKEremoteIp || invalidIKEremoteIp}"
                 @blur="validate('IKEremoteIp')"/>
          <div class="error error-text" v-if="emptyIKEremoteIp && !invalidIKEremoteIp">
            {{$t('error.emptyInput') + 'IKE' + $t('hybridvpcikeconfig.remoteIp')}}
          </div>
          <div class="error error-text" v-if="!emptyIKEremoteIp && invalidIKEremoteIp">
            {{$t('error.invalid') + 'IKE' + $t('hybridvpcikeconfig.remoteIp')}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required"> IKE {{$t('hybridvpcikeconfig.localIp')}}</div>
          <input type="text" v-model="IKElocalIp"
                 :class="{'is-error': emptyIKElocalIp || invalidIKElocalIp}"
                 @blur="validate('IKElocalIp')"/>
          <div class="error error-text" v-show="emptyIKElocalIp && !invalidIKElocalIp">
            {{$t('error.emptyInput') + 'IKE' + $t('hybridvpcikeconfig.localIp')}}
          </div>
          <div class="error error-text" v-show="!emptyIKElocalIp && invalidIKElocalIp">
            {{$t('error.invalid') + 'IKE' + $t('hybridvpcikeconfig.localIp')}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required"> IKE {{$t('hybridvpcikeconfig.version')}}</div>
          <el-select v-model="IKEversion" style="width: 100%;">
            <el-option v-for="(item, index) in IKEversionList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.mode')}}</div>
          <el-select v-model="IKEmode" style="width: 100%;">
            <el-option v-for="(item, index) in IKEmodeList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.encodeAlgorithm')}}</div>
          <el-select v-model="IKEencAlg" style="width: 100%;">
            <el-option v-for="(item, index) in IKEencAlgList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.authAlgorithm')}}</div>
          <el-select v-model="IKEauthAlg" style="width: 100%;">
            <el-option v-for="(item, index) in IKEauthAlgList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IKE {{$t('hybridvpcikeconfig.dhGroups')}}</div>
          <el-select v-model="IPSecpfs" style="width: 100%;">
            <el-option v-for="(item, index) in IPSecpfsList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IPSec {{$t('hybridvpcipsecconfig.salifetime')}}</div>
          <input type="number" v-model="IPSeclifetime" :class="{'is-error': emptyIPSeclifetime}"
                 @blur="validate('IPSeclifetime')"/>
          <div class="error error-text" v-if="emptyIPSeclifetime">
            {{$t('error.emptyInput') + 'IPSec' + $t('hybridvpcipsecconfig.salifetime')}}}}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required">IPSec {{$t('hybridvpcipsecconfig.encodeAlgorithm')}}</div>
          <el-select v-model="IPSecencAlg" style="width: 100%;">
            <el-option v-for="(item, index) in IPSecencAlgList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IPSec {{$t('hybridvpcipsecconfig.authAlgorithm')}}</div>
          <el-select v-model="IPSecauthAlg" style="width: 100%;">
            <el-option v-for="(item, index) in IPSecauthAlgList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">IPSec {{$t('hybridvpcipsecconfig.dhGroups')}}</div>
          <el-select v-model="IPSecpfs" style="width: 100%;">
            <el-option v-for="(item, index) in IPSecpfsList" :value="item"
                       :key="index"></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" v-show="step === 1" @click="prev()">{{$t('common.prevStep')}}</span>
      <span class="btn-confirm" v-show="step === 1" :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-confirm" v-show="step === 0" @click="next()">高级</span>
      <span class="btn-cancel" @click="$router.push({name:'hybridalicloudvpcvpnconnection'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import {checkBounce} from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'


  export default {
    name: "CreateHybridVpnAliCloudConnectionPage",

    components: {AddOrDeleteInput, CreateTemplate},

    mixins: [WindowBase],

    data() {
      return {
        step: 0,
        name: '',
        description: '',
        vpnGatewayUuid: '',
        userGatewayUuid: '',
        localCidr: '',
        remoteCidr: '',
        active: false,
        ikeConfUuid: '',
        ipsecConfUuid: '',
        IKEpsk: '',
        IKEpfs: 'group2',
        IKEpfsList: ['disabled', 'group2', 'group5', 'group14'],
        IKEversion: 'ikev1',
        IKEversionList: ['ikev1', 'ikev2'],
        IKEmode: 'main',
        IKEmodeList: ['main', 'aggressive'],
        IKEencAlg: '3des',
        IKEencAlgList: ['3des', 'aes-128', 'aes-192', 'aes-256', 'des'],
        IKEauthAlg: 'sha1',
        IKEauthAlgList: ['md5', 'sha1'],
        IKElifetime: 86400,
        IKElocalIp: '',
        IKEremoteIp: '',
        IPSecpfs: 'group2',
        IPSecpfsList: ['disabled', 'group2', 'group5', 'group14'],
        IPSecencAlg: '3des',
        IPSecencAlgList: ['3des', 'aes-128', 'aes-192', 'aes-256', 'des'],
        IPSecauthAlg: 'sha1',
        IPSecauthAlgList: ['md5', 'sha1'],
        IPSeclifetime: 86400,
        showVRouterNetwork: false,
        privateUuidList: [],
        privateUuid: '',
        VRouterUuid: '',
        vpcUuid: '',
        emptyname: false,
        invalidname: false,
        emptyIKElifetime: false,
        emptyIKEremoteIp: false,
        invalidIKEremoteIp: false,
        emptyIKElocalIp: false,
        invalidIKElocalIp: false,
        emptyIPSeclifetime: false,
        emptyVRouterUuid: false,
        emptyvpnGatewayUuid: false,
        emptyuserGatewayUuid: false,
        emptyIKEpsk:false,
        emptyprivateUuid: false,
        canCreate: true
      }
    },

    methods: {
      ...Validator,
      ...{
        create: Methods.methods.create
      },
      //点击高级触发
      next() {
        let self = this;
        if(self.validateAll()) return;
        self.step = 1;
      },
      //上一步
      prev() {
        let self =  this;
        self.step = 0;
      },
      //校验
      validate(name) {
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'IKElocalIp', 'IKEremoteIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name]).trim() : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        if ((name === 'IKElocalIp' || name === 'IKEremoteIp') && !this.isIP(input)) {
          self[`invalid${name}`] = true
        }
        if (name === 'name' && this.isNumber(input)) {
          self[`invalid${name}`] = true
        }
      },
      //整体校验
      validateAll() {
        let self = this;
        let props = ['name', 'vpnGatewayUuid', 'userGatewayUuid', 'VRouterUuid', 'IKEpsk'];
        if(self.step === 1) {
          props.push('localCidr', 'remoteCidr', 'IKElocalIp', 'IKEremoteIp', 'IPSeclifetime', 'IKElifetime');
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => self[`empty${item}`] || self[`invalid${item}`])
        return isInvalid;
      },
      //确定添加
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
        self.$router.push({name:'hybridalicloudvpcvpnconnection'})
      },
      //添加参数
      createParam() {
        let self = this;
        return {
          name: self.name,
          description: self.description,
          vpnGatewayUuid: self.vpnGatewayUuid,
          userGatewayUuid: self.userGatewayUuid,
          localCidr: self.localCidr,
          remoteCidr: self.remoteCidr,
          active: self.active,
          ikeConfUuid: self.ikeConfUuid,
          ipsecConfUuid: self.ipsecConfUuid,

          IKEpsk: self.IKEpsk,
          IKEpfs: self.IKEpfs,
          IKEversion: self.IKEversion,
          IKEmode: self.IKEmode,
          IKEencAlg: self.IKEencAlg,
          IKEauthAlg: self.IKEauthAlg,
          IKElifetime: self.IKElifetime,
          IKElocalIp: self.IKElocalIp,
          IKEremoteIp: self.IKEremoteIp,

          IPSecpfs: self.IPSecpfs,
          IPSecencAlg: self.IPSecencAlg,
          IPSecauthAlg: self.IPSecauthAlg,
          IPSeclifetime: self.IPSeclifetime,

          vpcUuid: self.vpcUuid,
        }
      },

      openVmInplaceDialog() {
        let self = this;
        self.openDialog('VirtualRouterVmInstanceListSingleSelectDlg', {
          conditions: ['hypervisorType=KVM', 'state=Running', 'type=ApplianceVm', 'status=Connected', 'applianceVmType=vrouter'],
          select: (uuid) =>{
            this.selectVRouter(uuid)
          }
        })
      },

      //选择vpc网关
      selectVRouter(uuid) {
        this.getVRouterPrivateNetwork(uuid)
        this.VRouterUuid = uuid;
        this.showVRouterNetwork =  true;
        this.validate('VRouterUuid')
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

      openVpnGatewaySelect() {
        let self = this;
        self.openDialog('HybridAliCloudVpnGatewaySingleSelectList', {
          conditions: [],
          ok: (uuid) => {
           self.selectHybridVpcVpnGateway(uuid);
          }
        })
      },

      openVpnUserGatewaySelect() {
        let self = this;
        self.openDialog('HybridAliCloudUserVpnGatewaySingleSelectList', {
          conditions: [],
          ok: (uuid) => {
            self.selectHybridVpcUserVpnGateway(uuid);
          }
        })
      },

      selectHybridVpcVpnGateway (uuid) {
        let vpcVpnGateway = _.cloneDeep(this.dbData.hybridVpcVpnGateway[uuid])
        this.vpnGatewayUuid = uuid;
        this.validate('vpnGatewayUuid')
        if (vpcVpnGateway) {
          this.IKElocalIp = vpcVpnGateway.publicIp;
          this.validate('IKElocalIp')
          rpc.query('hybrid/aliyun/vswitch', {
            q: `uuid=${vpcVpnGateway.vSwitchUuid}`
          })
            .then((resp) => {
              if (resp.inventories.length === 1) {
                this.updateDbRow({
                  tableName: 'hybridVSwitch',
                  id: resp.inventories[0].uuid,
                  list: resp.inventories[0]
                })
                this.vpcUuid = resp.inventories[0].ecsVpcUuid;
                return rpc.query('hybrid/aliyun/vpc', {
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

      selectHybridVpcUserVpnGateway (uuid) {
        let vpcUserVpnGateway = _.cloneDeep(this.dbData.hybridVpcUserVpnGateway[uuid])
        this.userGatewayUuid =  uuid;
        this.validate('userGatewayUuid')
        if (vpcUserVpnGateway) {
          this.IKEremoteIp = vpcUserVpnGateway.ip;
          this.validate('IKEremoteIp')
        }
      },

      getL3NetworkName (uuid) {
        let value = ''
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
        return value
      },

      openPrivateNetWorkSelect() {
        let self = this;
        self.openDialog('L3NetworkSingleSelectListDlg',{
          conditions:['category=Private', `uuid?=${self.privateUuidList}`],
          select:(uuid) => self.selectPrivateNetwork(uuid),
        })
      },

      selectPrivateNetwork(uuid) {
        this.privateUuid = uuid;
        this.remoteCidr = this.dbData.l3network[uuid].ipRanges[0].networkCidr
        this.validate('privateUuid')
      }
    }
  }
</script>

<style scoped>

</style>
