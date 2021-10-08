<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width: 303px
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 300px;
  }

  .el-radio-group {
    line-height: 40px;
    padding-top: 5px
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("l3network.create.private")}}
        </span>
      <span class="create-back" @click="$router.push('privatenetwork')"><i class="el-icon-back"></i>回到私有网络列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="privateNetwork"/>
        <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keydown.enter="validate('name')"/>
        <div id="common-name" class="error error-text" v-if="windowData.emptyname">
          {{$t("error.emptyInput")+$t("common.name")}}
        </div>
      </div>
      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>
      <div id="common-l2network" class="operation-row">
        <div class="title required">
          {{$t("common.l2network")}}
        </div>
        <div v-if="windowData.l2NetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l2network[windowData.l2NetworkUuid] && dbData.l2network[windowData.l2NetworkUuid].name"
            @remove="removeL2network()"></add-or-delete-input>
        </div>
        <div class="content" @click="openSelectL2Network();" v-if="windowData.l2NetworkUuid.length===0">
          <div class="add" v-if="!windowData.l2NetworkUuid"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptyl2NetworkUuid">
          {{$t("error.unselected")+$t("common.l2network")}}
        </div>
      </div>
      <div id="common-closeDHCPServer" class="operation-row">
        <el-checkbox v-model="windowData.DHCP">{{$t('common.closeDHCPServer')}}</el-checkbox>
        <help-trigger name="closeDHCPServer"/>
      </div>
      <div class="operation-row">
        <el-radio-group v-model="windowData.showPrivate" @change="changePrivate">
          <el-radio :label="false">{{$t("common.flatNetwork")}}</el-radio>
          <el-radio :label="true">{{$t("common.vRouter")}}</el-radio>
        </el-radio-group>
        <help-trigger name="networkType"/>
      </div>
      <div id="common-virtualRouterOffering" class="operation-row" v-if="windowData.showPrivate">
        <div class="title required">
          {{ $t("common.virtualRouterOffering") }}
        </div>
        <div v-if="windowData.virtualRouterOfferingUuid.length > 0">
          <add-or-delete-input
            :value="dbData.instanceOffering[windowData.virtualRouterOfferingUuid] && dbData.instanceOffering[windowData.virtualRouterOfferingUuid].name"
            @remove="removeVirtualRouter()"></add-or-delete-input>
        </div>
        <div class="content" @click="openVirtualRouterOfferingSelect();"
             v-if="windowData.virtualRouterOfferingUuid.length===0">
          <div class="add" v-if="windowData.virtualRouterOfferingUuid === ''"></div>
        </div>
        <div class="error" v-if="windowData.showPrivate && windowData.emptyvirtualRouterOfferingUuid">
          {{$t("error.unselected")+$t("common.virtualRouterOffering")}}
        </div>
      </div>
      <div id="common-addIpRange" class="operation-block-header" style="margin-top: 40px;position: relative;">
        {{ $t("common.addIpRange") }}
        <help-trigger style="top: 0;" v-show="!useIpv6 && windowData.showNetworkServiceType === 'Flat'"
                      name="ipv4FlatNetworkRange"/>
        <help-trigger style="top: 0;" v-show="useIpv6 && windowData.showNetworkServiceType === 'Flat'"
                      name="ipv6FlatNetworkRange"/>
        <help-trigger style="top: 0;" v-show="windowData.showNetworkServiceType === 'vrouter'"
                      name="vrouterNetworkRange"/>
      </div>
      <div id="common-method" class="operation-row" v-show="windowData.showNetworkServiceType === 'Flat'">
        <div class="title">
          {{ $t("common.ipType") }}
        </div>
        <el-radio-group v-model="useIpv6">
          <el-radio :label="false" v-permission="'L3_IP-RANGE.ADD'">IPv4</el-radio>
          <el-radio :label="true" v-permission="'LICENSE_BASIC_PAID'">IPv6</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row">
        <div class="title">
          {{ $t("common.method") }}
        </div>
        <el-radio-group v-model="windowData.showMethod">
          <el-radio :label="false" v-permission="'L3_IP-RANGE.ADD'">{{ $t("common.ipRange ") }}</el-radio>
          <el-radio :label="true" v-permission="'LICENSE_BASIC_PAID'">{{ $t("common.cidr") }}</el-radio>
        </el-radio-group>
      </div>
      <div id="image-imageFormat" class="operation-row zs-select" v-if="useIpv6">
        <div class="title">
          {{$t("l3network.mode")}}
        </div>
        <help-trigger name="l3NetworkMode"/>
        <el-select v-model="windowData.mode" placeholder="请选择">
          <el-option label="Stateful-DHCP" value="Stateful-DHCP"></el-option>
          <el-option label="Stateless-DHCP" value="Stateless-DHCP" v-if="windowData.showMethod"></el-option>
          <el-option label="SLAAC" value="SLAAC" v-if="windowData.showMethod"></el-option>
        </el-select>
      </div>
      <div id="common-cidr" class="operation-row" v-if="windowData.showMethod">
        <div class="title required">
          {{$t("common.cidr")}}
        </div>
        <input v-model="windowData.cidr"
               :class="{'is-error': windowData.emptycidr || windowData.invalidcidr || windowData.notInRangeForPrefixLenInCidr}"
               @input="(e) => { updateWindow({ 'cidr': e.target.value }) }" @blur="validate('cidr')"
               :placeholder="cidrPlaceholder" @keydown.enter="validate('cidr')"/>
        <div class="error" v-if="windowData.showMethod && windowData.emptycidr">
          {{$t("error.emptyInput")+$t("common.cidr")}}
        </div>
        <div class="error error-text" v-if="windowData.showMethod && !windowData.emptycidr && windowData.invalidcidr">
          {{$t("error.invalid")+$t("common.cidr")}}
        </div>
        <div class="error error-text"
             v-if="windowData.showMethod && !windowData.emptycidr && !windowData.invalidcidr && windowData.notInRangeForPrefixLenInCidr">
          {{$t("l3network.warning.notInRangeForPrefixLen")}}
        </div>
      </div>

      <div id="common-startIp" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.startIp")}}
        </div>
        <input :placeholder="ipPlaceholder" v-model="windowData.startIp"
               :class="{'is-error': windowData.emptystartIp || windowData.invalidstartIp || showInvalidIPRangeError()}"
               @blur="validate('startIp')" @keydown.enter="validate('startIp')"
               @input="(e) => { updateWindow({ 'startIp': e.target.value }) }"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptystartIp">
          {{$t("error.emptyInput")+$t("common.startIp")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptystartIp && windowData.invalidstartIp">
          {{$t("error.invalid")+$t("common.startIp")}}
        </div>
        <div class="error error-text" v-if="showInvalidIPRangeError()">
          {{$t("error.invalid")+$t("common.ipRange")}}
        </div>
      </div>

      <div id="common-endIp" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.endIp")}}
        </div>
        <input :placeholder="ipPlaceholder" v-model="windowData.endIp"
               :class="{'is-error': windowData.emptyendIp || windowData.invalidendIp || showInvalidIPRangeError()}"
               @blur="validate('endIp')" @keydown.enter="validate('endIp')"
               @input="(e) => { updateWindow({ 'endIp': e.target.value }) }"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptyendIp">
          {{$t("error.emptyInput")+$t("common.endIp")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptyendIp && windowData.invalidendIp">
          {{$t("error.invalid")+$t("common.endIp")}}
        </div>
        <div class="error error-text" v-if="showInvalidIPRangeError()">
          {{$t("error.invalid")+$t("common.ipRange")}}
        </div>
      </div>

      <div id="common-netmask" class="operation-row" v-if="!windowData.showMethod && !useIpv6">
        <div class="title required">
          {{$t("common.netmask")}}
        </div>
        <input placeholder="255.255.0.0" v-model="windowData.netmask"
               :class="{'is-error': windowData.emptynetmask || windowData.invalidnetmask}"
               @input="(e) => { updateWindow({ 'netmask': e.target.value }) }" @blur="validate('netmask')"
               @keydown.enter="validate('netmask')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptynetmask">
          {{$t("error.emptyInput")+$t("common.netmask")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptynetmask && windowData.invalidnetmask">
          {{$t("error.invalid")+$t("common.netmask")}}
        </div>
      </div>

      <div id="common-prefixLen" class="operation-row" v-if="!windowData.showMethod && useIpv6">
        <div class="title required">
          {{$t("l3network.prefixLen")}}
        </div>
        <input v-model="windowData.prefixLen" placeholder="64~126"
               :class="{'is-error': windowData.emptyprefixLen || windowData.invalidprefixLen || windowData.notInRangeForPrefixLen}"
               @input="(e) => { updateWindow({ 'prefixLen': e.target.value }) }" @blur="validate('prefixLen')"
               @keydown.enter="validate('prefixLen')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptyprefixLen">
          {{$t("error.emptyInput")+$t("l3network.prefixLen")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptyprefixLen && windowData.invalidprefixLen">
          {{$t("error.invalid")+$t("l3network.prefixLen")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptyprefixLen && windowData.notInRangeForPrefixLen">
          {{$t("l3network.warning.notInRangeForPrefixLen")}}
        </div>
      </div>

      <div id="common-gateway" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.gateway")}}
        </div>
        <input :placeholder="gateWayPlaceholder" v-model="windowData.gateway"
               :class="{'is-error': windowData.emptygateway || windowData.invalidgateway}"
               @input="(e) => { updateWindow({ 'gateway': e.target.value }) }" @blur="validate('gateway')"
               @keydown.enter="validate('gateway')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptygateway">
          {{$t("error.emptyInput")+$t("common.gateway")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptygateway && windowData.invalidgateway">
          {{$t("error.invalid")+$t("common.gateway")}}
        </div>
      </div>
      <component style="margin-top: 20px;" :param="dhcpItem.param" :is="dhcpItem.ctrl"/>
      <div id="common-addDns" class="operation-block-header" style="margin-top: 40px;">
        {{ $t("common.addDns") }}
      </div>
      <div class="operation-row">
        <div class="title">
          DNS
        </div>
        <help-trigger v-if="!useIpv6" name="dns"/>
        <help-trigger v-else name="ipv6Dns"/>
        <input v-model="windowData.dns" :placeholder="dnsPlaceholder"
               :class="{'is-error': !windowData.emptydns && windowData.invaliddns}"
               @input="(e) => { updateWindow({ 'dns': e.target.value }) }" @blur="validate('dns')"
               @keydown.enter="validate('dns')"/>
        <div id="common-dns" class="error error-text" v-if="!windowData.emptydns && windowData.invaliddns">
          {{$t("error.invalid")+$t("common.dns")}}
        </div>
      </div>
      <div class="operation-block-header" style="margin-top: 40px;"
           v-if="!windowData.showMethod && windowData.showPrivate">
        {{$t("common.moreSettings")}}
      </div>

      <div class="more-wrapper" v-if="windowData.showMoreSetting && !windowData.showMethod && windowData.showPrivate">
        <div v-permission="'L3_ROUTER-INTERFACE-IP.SET'" id="l3network-routerInterfaceIp"
             class="operation-row zs-select">
          <div class="title">
            {{$t('l3network.routerInterfaceIp')}}
          </div>
          <help-trigger name="privateNetworkInterface"/>
          <input v-permission="'L3_ROUTER-INTERFACE-IP.SET'" v-model="windowData.routerInterfaceIp"
                 placeholder="192.168.0.1" :class="{'is-error': windowData.invalidrouterInterfaceIp}"
                 @input="(e) => { updateWindow({ 'routerInterfaceIp': e.target.value }) }"
                 @blur="validate('routerInterfaceIp')" @keydown.enter="validate('routerInterfaceIp')"/>
          <div class="error error-text" v-if="windowData.invalidrouterInterfaceIp">
            {{$t("error.invalid")+$t("l3network.routerInterfaceIp")}}
          </div>
        </div>
      </div>
    </div>


    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('privatenetwork')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import L2NetworkMethods from 'src/network/l2network/Methods';
  import CreateTemplate from 'src/component/CreateTemplate';
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import FullPanel from 'src/windows/Base/FullPanel'
  import Validator from 'src/utils/validator';
  import Utils from 'src/utils/utils'

  export default {
    name: "CreatePrivateNetworkPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate,
      ClusterSingleDlg
    },
    data() {
      return {
        canCreate: true,
        modeTypes: [
          'Stateful-DHCP',
          'Stateless-DHCP',
          'SLAAC'
        ],
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ]
        },
        vmwareL2NetworkList: [],
        useIpv6: false,
        dhcp: '',
        dhcpItem: {
          param: {
            getTitle: () => 'DHCP IP',
            getValue: () => this.dhcp,
            setValue: val => {
              this.dhcp = val
            },
            getDoc: () => this.windowData.showMethod ? 'dhcpInCIDR' : 'dhcpInRange',
            permission: 'LICENSE_BASIC_PAID',
            getDisabled: () => this.windowData.DHCP,
            getPlaceholder: () => !this.windowData.DHCP ? this.ipPlaceholder : '',
            getValidationResult: () => this.$data.validator.getValidationResult('dhcp')
          },
        }
      }
    },
    computed: {
      cidrPlaceholder() {
        return this.useIpv6 ? '234e:0:4567::3d/64' : '192.168.1.0/24'
      },
      ipPlaceholder() {
        return this.useIpv6 ? 'CDCD:910A:2222:5498:8475:1111:3900:2020' : '192.168.0.100'
      },
      dnsPlaceholder() {
        return this.useIpv6 ? '240c::6644' : '223.5.5.5'
      },
      gateWayPlaceholder() {
        return this.useIpv6 ? 'CDCD:910A:2222:5498:8475:1111:3900:2020' : '172.20.0.1'
      }
    },
    created() {
      //this.$data.validator.add('dhcp', this.checkDhcp)

      this.deleteAllAssistant()
      let showMethod = false
      if (!this.getApiPermission('L3_IP-RANGE.ADD')) {
        showMethod = true
      }
      this.updateWindow({
        name: '',
        type: 'L3BasicNetwork',
        l2NetworkUuid: '',
        system: false,
        cidr: '',
        startIp: '',
        endIp: '',
        netmask: '',
        gateway: '',
        dns: '',
        DHCP: false,
        routerInterfaceIp: '',
        networkServiceTypes: [],
        showMoreSetting: true,
        showSecurytyGroup: false,
        useIpv6: false,
        selectedServices: [],
        l2networkList: [],
        virtualRouterOfferingUuid: '',
        showMethod,
        mode: 'Stateful-DHCP',
        showPrivate: false,
        flatNetworkList: ['Userdata', 'Eip', 'DHCP', 'SecurityGroup'],
        ipv6NetworkService: ['Eip', 'DHCP', 'SecurityGroup'],
        vRouterNetworkList: ['DHCP', 'CentralizedDNS', 'SNAT', 'Eip', 'PortForwarding', 'LoadBalancer', 'IPsec', 'SecurityGroup', 'VRouterRoute', 'VipQos', 'DNS', 'Userdata'],
        showNetworkServiceType: 'Flat',
        showMoreDropdownNetworkServiceType: false
      }).then(() => {
        return this.getVmwareL2Network()
      }).then(() => {
        return this.queryNetworkServices()
      }).then(() => {
        let flatNetwork = {}
        let vRouterNetwork = {}
        let networkServiceType = _.cloneDeep(this.dbData.networkServiceType)
        for (let uuid in networkServiceType) {
          if (networkServiceType[uuid].type === 'SecurityGroup') {
            flatNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
            vRouterNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
          }
          if (networkServiceType[uuid].type === 'vrouter') {
            vRouterNetwork[uuid] = ['IPsec', 'VRouterRoute', 'CentralizedDNS', 'VipQos', 'SNAT', 'LoadBalancer', 'PortForwarding', 'Eip', 'DNS']
          }
          if (networkServiceType[uuid].type === 'Flat') {
            vRouterNetwork[uuid] = ['DHCP', 'Userdata']
            flatNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
          }
        }
        return this.updateWindow({flatNetwork, vRouterNetwork})
      }).then(() => {
        this.initL2Network()
        return this.queryForAssistant()
      })
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      removeL2network() {
        this.updateWindow({
          l2NetworkUuid: ''
        })
      },
      removeVirtualRouter() {
        this.updateWindow({
          virtualRouterOfferingUuid: ''
        })
      },
      changePrivate(label) {
        if (label)
          this.toggleNetworkServiceType("vrouter")
        else
          this.toggleNetworkServiceType("Flat")
      },
      closeDHCPHandler() {
        let closeDhcp = this.windowData.DHCP
        this.dhcp = ''
        this.updateWindow({DHCP: !closeDhcp})
      },
      ...Utils,
      ...Validator,
      ...{
        setVxlanPoolSystemTags: L2NetworkMethods.methods.setVxlanPoolSystemTags,
        createL2Network: L2NetworkMethods.methods.create
      },
      createVirtualRouterOffering: async function (param) {
        let event = this.createEvent('instanceOffering.action.vrcreate', param.name)
        let resp
        try {
          resp = await rpc.create('instance-offerings/virtual-routers', param, event)
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
          return
        }
        let uuidList = []
        let table = {}
        if (this.windowData.uuidList) {
          uuidList = this.windowData.uuidList.slice()
          uuidList.unshift(resp.inventory.uuid)
        }
        let row = {}
        row[resp.inventory.uuid] = {}
        row[resp.inventory.uuid].selected = false
        table = Object.assign({}, {...this.windowData.table}, row)
        this.updateWindow({uuidList, table})
        this.updateDbTable({
          tableName: 'instanceOffering',
          list: [resp.inventory]
        })
        if (this.queryList) this.queryList()
      },
      checkDhcp(val) {
        let obj = {isValid: true, errMsg: ''}
        if (val === '') return obj
        let fuc = this.useIpv6 ? this.isIPV6IP : this.isIP
        if (!fuc(val)) {
          return ({isValid: false, errMsg: this.$t('error.ipOnly')})
        } else {
          return obj
        }
      },
      checkIpVersion(useIpv6) {
        if (this.useIpv6 === useIpv6) return
        this.useIpv6 = useIpv6
        this.initValidate()
        this.initIPCongig()
      },
      showInvalidIPRangeError: function () {
        if (!this.windowData.showMethod && !this.windowData.emptyendIp && !this.windowData.emptystartIp && !this.windowData.invalidstartIp && !this.windowData.invalidendIp && this.windowData.invalidipRange) return true
        else return false
      },
      initL2Network: function () {
        const self = this
        let l2NetworkUuidList = []
        let conditions = [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'cluster.type=zstack']
        let l2Path = 'l2-networks'
        let l2Inventories
        if (!this.dbData.common.isAdmin) {
          l2Path = 'l2-networks/vxlan'
        }
        conditions.push('type!=VxlanNetworkPool')
        return rpc.query('l3-networks', {
          q: [`l2Network.cluster.type!=vmware`, `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`],
          fields: 'l2NetworkUuid'
        }).then((l2resp) => {
          l2NetworkUuidList = l2NetworkUuidList.concat(l2resp.inventories.map(it => it.l2NetworkUuid))
          conditions.push(`uuid!?=${l2NetworkUuidList}`)
          return rpc.query(l2Path, {q: conditions}).then(resp => {
            l2Inventories = resp.inventories
            return self.updateDbTable({
              tableName: 'l2network',
              list: resp.inventories
            })
          }).then(() => {
            if (l2Inventories.length === 1) {
              self.updateWindow({l2NetworkUuid: l2Inventories[0].uuid})
            }
          })
        })
      },
      initValidate() {
        let obj = {
          emptygateway: false,
          emptycidr: false,
          emptynetmask: false,
          emptystartIp: false,
          emptyendIp: false,
          emptyprefixLen: false,
          invalidgateway: false,
          invalidcidr: false,
          invalidnetmask: false,
          invalidstartIp: false,
          invalidendIp: false,
          invalidprefixLen: false,
          invaliddns: false
        }
        this.updateWindow(obj)
      },
      initIPCongig() {
        let obj = {
          startIp: '',
          endIp: '',
          netmask: '',
          gateway: '',
          dns: '',
          cidr: ''
        }
        this.dhcp = ''
        this.updateWindow(obj)
      },
      getVmwareL2Network() {
        return rpc.query(`l3-networks`, {q: `l2Network.cluster.type=vmware`}).then(resp => {
          let vmwareL2NetworkList = resp.inventories.map(l2 => l2.l2NetworkUuid)
          this.$data.vmwareL2NetworkList = vmwareL2NetworkList
        })
      },
      queryNetworkServices() {
        return rpc.query(`network-services/providers`, {}).then((resp) => {
          this.updateDbTable({
            tableName: 'networkServiceType',
            list: resp.inventories
          })
        })
      },
      clearRow: function (resourceName) {
        let obj = {}
        obj[resourceName] = ''
        this.updateWindow(obj)
      },
      toggleMoreSetting: function () {
        let showMoreSetting = this.windowData.showMoreSetting
        this.updateWindow({showMoreSetting: !showMoreSetting})
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          let priority
          let hide
          let content = `lackOf${resourceName}`
          if (resourceName === 'VirtualRouterOffering') {
            priority = 1
            if (!self.dbData.common.isAdmin) {
              hide = true
              content = 'lackOfVirtualRouterOfferingContactAdmin'
            }
          } else {
            priority = 2
          }
          self.createAssistant({
            id,
            operation,
            hide,
            priority,
            title: 'privateNetTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {
              if(resourceName === 'L2Network'){
                self.$router.push({name: 'createl2network'})
              }
              if(resourceName === 'VirtualRouterOffering') {
                self.$router.push({name: 'createvirtualrouteroffering'})
              }
            }
          })
        }
        let l2Path = 'l2-networks'
        if (!this.dbData.common.isAdmin) {
          l2Path = 'l2-networks/vxlan'
        }
        rpc.query(l2Path, {
          count: true,
          q: [zoneUuid, `uuid!?=${this.$data.vmwareL2NetworkList}`, 'type!=VxlanNetworkPool']
        }).then(resp => {
          if (resp.total === 0) newAssistant('L2Network', 'create')
        })
        if (this.windowData.showNetworkServiceType === 'vrouter') {
          rpc.query('instance-offerings/virtual-routers', {count: true, q: [zoneUuid]})
            .then(resp => {
              if (resp.total === 0) newAssistant('VirtualRouterOffering', 'create')
            })
        }
      },
      openNetworkServicesTypeSelect: function () {
        this.openInplaceDialogWithChecking('L3NetworkNetworkServiceTypeListMultiSelect', {
          showNetworkServiceType: this.windowData.showNetworkServiceType,
          parentWindowUuid: this.windowId
        }, this.selectNetworkServiceType)
      },
      openVirtualRouterOfferingSelect: function () {
        let self = this
        this.openDialog('VirtualRouterInstanceOfferingListSingleSelectDlg', {
          conditions: ['state=Enabled', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'image.format!=vmtx'],
          ok: (uuid) => {
            self.selectVRO(uuid)
          }
        })
      },
      selectVRO: function (uuid) {
        this.updateWindow({virtualRouterOfferingUuid: uuid})
        this.validate('virtualRouterOfferingUuid')
      },
      removeVirtualRouterOffering: function () {
        this.updateWindow({virtualRouterOfferingUuid: ''})
      },
      removeService: function (service, e) {
        if (!this.checkDialogList()) return
        let services = this.windowData.networkServiceTypes.filter((item) => item !== service)
        this.updateWindow({networkServiceTypes: services})
        this.windowData.networkServiceTypeListWindowData.methods.removeService(service)
      },
      selectService: function ($event, service, i) {
        let services = _.cloneDeep(this.windowData.selectedServices)
        let types = _.cloneDeep(this.windowData.networkServiceTypes)
        types.slice(i, 1)
        services.push(service)
        this.updateWindow({selectedServices: services, networkServiceTypes: types})
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      createParam: function () {
        let networkServices = {}
        if (!this.windowData.showPrivate) { // Flat Network
          networkServices = _.cloneDeep(this.windowData.flatNetwork)
        }
        if (this.windowData.showPrivate) { // vrouter Network
          networkServices = _.cloneDeep(this.windowData.vRouterNetwork)
        }
        // let networkServices = _.cloneDeep(this.windowData.networkServices)
        let networkServiceType = _.cloneDeep(this.dbData.networkServiceType)
        for (let uuid in networkServiceType) {
          if (networkServiceType[uuid].type === 'Flat') {
            if (this.windowData.DHCP) {
              if (!this.windowData.showPrivate) {
                networkServices[uuid] = ['Eip']
              } else {
                delete networkServices[uuid]
              }
            } else {
              if (!this.windowData.showPrivate) {
                networkServices[uuid] = networkServiceType[uuid].networkServiceTypes
              } else {
                networkServices[uuid] = ['Userdata', 'DHCP']
              }
            }
            // networkServices[uuid] = networkServiceType[uuid].networkServiceTypes
            if (this.useIpv6) {
              _.forIn(networkServices, (value, key) => {
                _.remove(networkServices[key], (item) => item === 'Userdata' || item === 'HostRoute')
              })
            }
            this.updateWindow({networkServices})
          }
        }


        let param = {
          name: this.windowData.name,
          type: 'L3BasicNetwork',
          l2NetworkUuid: this.windowData.l2NetworkUuid,
          system: false,
          startIp: this.windowData.startIp,
          endIp: this.windowData.endIp,
          netmask: this.windowData.netmask,
          gateway: this.windowData.gateway,
          systemTags: [],
          dns: this.windowData.dns,
          cidr: this.windowData.cidr,
          ipRangeOrcidr: this.windowData.showMethod,
          networkServices: networkServices,
          showPrivate: this.windowData.showPrivate,
          virtualRouterOfferingUuid: this.windowData.virtualRouterOfferingUuid,
          routerInterfaceIp: this.windowData.routerInterfaceIp === '' ? undefined : this.windowData.routerInterfaceIp,
          category: 'Private',
          useIpv6: this.useIpv6,
          addressMode: this.windowData.mode,
          prefixLen: this.windowData.prefixLen
        }
        if (this.dhcp) {
          let dhcp = this.useIpv6 ? this.dhcp.replace(/::/g, '--') : this.dhcp
          param.systemTags.push(`flatNetwork::DhcpServer::${dhcp}::ipUuid::null`)
        }
        return param
      },
      validate(name) {
        let obj = {}
        let windowData = this.windowData
        obj[`empty${name}`] = false
        let propToBeTrimed = ['name', 'startIp', 'endIp', 'netmask', 'gateway', 'dns', 'routerInterfaceIp', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        let IPs = ['startIp', 'endIp', 'netmask', 'gateway', 'dns', 'routerInterfaceIp']
        if (IPs.indexOf(name) > -1) {
          let fuc = this.useIpv6 ? this.isIPV6IP : this.isIP
          if (!fuc(input)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
          let parts = input.split('.')
          let isInvalid = false
          if (name === 'startIp' && windowData.endIp) {
            obj.invalidipRange = false
            if (this.useIpv6) obj.invalidipRange = this.ValidateIPv6IPRange(windowData.startIp, windowData.endIp)
            else {
              let endIpParts = this.useIpv6 ? windowData.endIp.split(':') : windowData.endIp.split('.')
              for (let i = 0; i < endIpParts.length; i++) {
                if (Number(endIpParts[i]) > Number(parts[i])) {
                  break
                }
                if (Number(endIpParts[i]) < Number(parts[i])) {
                  obj.invalidipRange = true
                  break
                }
              }
            }
          }
          if (name === 'endIp' && windowData.startIp) {
            obj.invalidipRange = false
            if (this.useIpv6) obj.invalidipRange = this.ValidateIPv6IPRange(windowData.startIp, windowData.endIp)
            else {
              let startIpParts = windowData.startIp.split('.')
              for (let i = 0; i < startIpParts.length; i++) {
                if (Number(startIpParts[i]) < Number(parts[i])) {
                  break
                }
                if (Number(startIpParts[i]) > Number(parts[i])) {
                  obj.invalidipRange = true
                  break
                }
              }
            }
          }
          obj[`invalid${name}`] = isInvalid
          // if (!obj[`invalid${name}`] && ['startIp', 'endIp'].indexOf(name) > -1) {
          //   obj.invalidstartIp = false
          //   obj.invalidendIp = false
          // }
          if (name === 'netmask' && !this.isValidNetMask(input)) {
            obj[`invalid${name}`] = true
          }
          if (name === 'routerInterfaceIp' && windowData.routerInterfaceIp && windowData.startIp && windowData.endIp && windowData.netmask) {
            let validateRouterInterfaceIp = this.ValidateIPRange(windowData.routerInterfaceIp, windowData.netmask, windowData.startIp, windowData.endIp)
            console.log(validateRouterInterfaceIp)
            if (validateRouterInterfaceIp) {
              obj[`invalid${name}`] = true
            }
          }
        }
        if (name === 'prefixLen' && input) {
          obj.notInRangeForPrefixLen = false
          if (!this.isNumber(input)) {
            obj[`invalid${name}`] = true
          } else if (input < 64 || input > 126) {
            obj.notInRangeForPrefixLen = true
          }
        }

        if (name === 'gateway' && this.windowData.startIp && this.windowData.endIp) {
          obj.invalidgateway = false
          if (this.validateGateway(this.windowData.gateway, this.windowData.startIp, this.windowData.endIp, this.useIpv6)) obj.invalidgateway = true
        }

        if (name === 'cidr') {
          let fuc = this.useIpv6 ? this.isIPV6Cidr : this.isCidr
          obj.notInRangeForPrefixLenInCidr = false
          if (!fuc(input)) {
            obj[`invalid${name}`] = true
          } else if (this.useIpv6) {
            let num = parseInt(input.split('/')[1])
            if (num < 64 || num > 126) obj.notInRangeForPrefixLenInCidr = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let props = ['name', 'l2NetworkUuid']
        if (!this.windowData.showMethod) {
          props = props.concat(['startIp', 'endIp', 'gateway'])
          if (this.useIpv6) props.push('prefixLen')
          else props.push('netmask')
          if (this.windowData.showPrivate && this.windowData.routerInterfaceIp) {
            props.push('routerInterfaceIp')
          }
        } else {
          props.push('cidr')
        }
        if (this.dbData.common.isAdmin && this.windowData.showPrivate) {
          props.push('virtualRouterOfferingUuid')
        }
        if (this.windowData.dns) {
          props.push('dns')
        }
        props.forEach(item => this.validate(item))
        let invalidInput = props.some(item => {
          return this.windowData[`empty${item}`] || this.windowData[`invalid${item}`]
        })
        if (!this.windowData.showMethod && this.windowData.invalidipRange) invalidInput = true
        //invalidInput = invalidInput || !this.$data.validator.check('dhcp')
        this.updateWindow({invalidInput})
      },
      toggleMethod: function () {
        if (!this.windowData.showMethod && this.windowData.mode !== 'Stateful-DHCP') this.updateWindow({mode: 'Stateful-DHCP'})
        this.updateWindow({showMethod: this.windowData.showMethod})
      },
      toggleNetworkServiceType: function (showNetworkServiceType) {
        if (this.windowData.dialogList && this.windowData.dialogList.length > 0 && this.checkDialogList()) {
          this.windowData.networkServiceTypeListWindowData.methods.init(showNetworkServiceType)
        }
        this.updateWindow({
          networkServiceTypes: [],
          virtualRouterOfferingUuid: '',
          showNetworkServiceType: showNetworkServiceType
        })
          .then(() => {
            this.deleteCurrAssistant(this.windowData.id)
            this.queryForAssistant()
          })
      },
      selectInstanceOffering: function (uuid) {
        this.updateWindow({instanceOfferingUuid: uuid})
      },
      selectImage: function (uuid) {
        this.updateWindow({imageUuid: uuid})
      },
      openSelectL2Network: function () {
        this.openDialog('SingleSelectListForL3CreatingDlg', {
          ok: (uuid) => {
            this.selectNetwork(uuid)
          }
        })
      },
      selectNetwork: function (uuid) {
        this.updateWindow({l2NetworkUuid: uuid}).then(() => {
          this.validate('l2NetworkUuid')
        })
      },
      selectNetworkServiceType: function (types, param) {
        this.updateWindow({networkServiceTypes: types, networkServices: param})
      },
      checkDialogList: function () {
        let NetworkServiceTypeList = this.windowData.dialogList.filter((item) =>
          item.indexOf('L3NetworkNetworkServiceTypeListMultiSelect') > -1
        )
        if (NetworkServiceTypeList.length === 0) return false
        return NetworkServiceTypeList[0]
      },
      getNetworkServiceTypeListWindowData: function () {
        let WindowUuid = this.checkDialogList()
        if (!WindowUuid) return
        return this.$store.state.windowManager.windows[WindowUuid]
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return
        this.canCreate = false
        this.create(this.createParam())
          .then(() => {
            this.$router.push({name: 'privatenetwork'});
          })
          .catch(() => {
            this.canCreate = true;
          })
      }
    }
  }
</script>
