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

  .rule-body {
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }

  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 400px;
  }

  .el-radio-group {
    line-height: 40px;
    padding-top: 5px
  }

  .content-size {
    width: 300px;
  }

  .content-size input {
    width: calc(100% - 70px);
    position: relative;
  }

  .content-size .text {
    display: inline-block;
    left: 18px;
    line-height: 40px;
    position: relative;
  }

  .content-size .arrow {
    top: 3px;
    position: relative;
    left: 12px;
  }

  .content-size .size {
    float: right;
    height: 40px;
    width: 60px;
    position: relative;
    border: 1px solid #adb0b8;
    border-radius: 0 2px 2px 0;
    box-sizing: border-box;
  }

  .content-size .drop-size {
    position: relative;
    font-size: 0;
    top: -41px;
    right: 1px;
    width: 60px;
    z-index: 3000;
    background: #fff;
    border-radius: 0 2px 2px 2px;
    border: 1px solid #adb0b8;
    padding: 9px 0;
  }

  .content-size .drop-size a {
    padding: 5px 20px;
    text-decoration: none;
    display: block;
    font-size: 14px;
    color: #1a2736;
    letter-spacing: 0;
    line-height: 20px;
    text-align: center;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("vpcNetwork.create")}}
        </span>
      <span class="create-back" @click="$router.push('vpcvrouter')"><i class="el-icon-back"></i>回到VPC网络列表</span>
    </div>
    <div slot="body" class="create-body">
      <el-form label-position="left" ref="form" :model="windowData" :rules="formRules">
        <el-form-item :label="$t('common.name')" label-width="100px" prop="name">
          <el-input placeholder="请输入名称" style="width:300px;" v-model="windowData.name"/>
        </el-form-item>
        <el-form-item :label="$t('common.introduction')" label-width="100px" prop="introduction">
          <el-input type="textarea" style="width:300px;" :autosize="{ minRows: 3, maxRows: 4}"
                    v-model="windowData.introduction"/>
        </el-form-item>

        <div class="operation-row" style="width: 403px">
          <el-form-item :label="$t('common.l2network')" label-width="100px">
            <div v-if="windowData.l2NetworkUuid.length > 0">
              <add-or-delete-input
                :value="dbData.l2network[windowData.l2NetworkUuid] && dbData.l2network[windowData.l2NetworkUuid].name"
                @remove="removeUuid('l2NetworkUuid')"></add-or-delete-input>
            </div>
            <div class="content" @click="openSelectL2Network();" v-if="windowData.l2NetworkUuid.length===0">
              <div class="add"></div>
            </div>
          </el-form-item>
        </div>

        <div class="operation-row" style="width: 403px">
          <el-form-item :label="$t('common.vpcVRouter')" label-width="100px">
            <div v-if="windowData.vpcVRouterUuid.length > 0">
              <add-or-delete-input
                :value="dbData.vm[windowData.vpcVRouterUuid] && dbData.vm[windowData.vpcVRouterUuid].name"
                @remove="removeUuid('vpcVRouterUuid')"></add-or-delete-input>
            </div>
            <div class="content" @click="windowData.l2NetworkUuid && openSelectVpcVRouter()"
                 v-if="windowData.vpcVRouterUuid.length===0">
              <div class="add"></div>
            </div>
          </el-form-item>
        </div>

        <el-form-item label-width="100px">
          <el-checkbox v-model="windowData.DHCP">{{$t('common.closeDHCPServer')}}</el-checkbox>
          <help-trigger style="top: 0;" name="closeDHCPServer"/>
        </el-form-item>

        <div id="common-addIpRange" class="operation-block-header" style="margin-top: 40px;position: relative;">
          {{ $t("common.addIpRange") }}
        </div>

        <el-form-item :label="$t('common.method')" label-width="100px">
          <el-radio-group v-model="windowData.showMethod">
            <el-radio :label="false" v-permission="'L3_IP-RANGE.ADD'">{{ $t("common.ipRange") }}</el-radio>
            <el-radio :label="true" v-permission="'LICENSE_BASIC_PAID'">{{ $t("common.cidr") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('common.cidr')" label-width="100px" prop="cidr" v-if="windowData.showMethod">
          <el-input placeholder="192.168.1.0/24" style="width:300px;" v-model="windowData.cidr"/>
        </el-form-item>
        <el-form-item :label="$t('common.startIp')" label-width="100px" prop="startIp" v-if="!windowData.showMethod">
          <el-input placeholder="192.168.0.100" style="width:300px;" v-model="windowData.startIp"/>
        </el-form-item>
        <el-form-item :label="$t('common.endIp')" label-width="100px" prop="endIp" v-if="!windowData.showMethod">
          <el-input placeholder="192.168.0.255" style="width:300px;" v-model="windowData.endIp"/>
        </el-form-item>
        <el-form-item :label="$t('common.netmask')" label-width="100px" prop="netmask" v-if="!windowData.showMethod">
          <el-input placeholder="255.255.0.0" style="width:300px;" v-model="windowData.netmask"/>
        </el-form-item>

        <el-form-item :label="$t('common.gateway')" label-width="100px" prop="gateway" v-if="!windowData.showMethod">
          <el-input placeholder="192.168.0.1" style="width:300px;" v-model="windowData.gateway"/>
        </el-form-item>
        <el-form-item label="DHCP IP" label-width="100px" prop="dhcpIp">
          <el-input style="width:300px;" placeholder="192.168.0.100" v-model="windowData.dhcpIp" :disabled="windowData.DHCP"
                    :class="{'disabled': windowData.DHCP}"/>
        </el-form-item>

      </el-form>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('vpcnetwork')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Utils from 'src/utils/utils';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateVpcNetworkPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      let validateCidr = (rule, value, cb) => {
          if(value) {
            if(!this.isCidr(value)) {
              cb('cidr格式错误')
            }else {
              cb()
            }
          }else{
            cb('cidr不能为空')
          }
      }
      let validateIp = (rule, value, cb) => {
        if(value) {
          if(!this.isIP(value)) {
            cb(`${this.$t(`common.${rule.field}`)}格式错误`)
          }else if(rule.field === 'startIp' || rule.field === 'endIp'){
            let parts = value.split('.');
            let startIpParts = this.windowData.startIp.split('.')
            for (let i = 0; i < startIpParts.length; i++) {
              if (Number(startIpParts[i]) > Number(parts[i])) {
                cb(`无效的Ip范围`)
              }else{
                cb();
              }
            }
          }else {
            cb()
          }
        }else if(rule.field !== 'dhcpIp'){
          cb(`${this.$t(`common.${rule.field}`)}不能为空`)
        }else{
          cb();
        }
      }
      let validateNetmask = (rule, value, cb) => {
        if(value) {
          if(!this.isValidNetMask(value)) {
            cb(`${this.$t(`common.${rule.field}`)}格式错误`)
          } else{
            cb()
          }
        }else{
          cb(`${this.$t(`common.${rule.field}`)}不能为空`)
        }
      }
      return {
        vmwareL2NetworkList: [],
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'},
          ],
          cidr: [
            {trigger: 'blur', validator: validateCidr},
            {required: true, message: 'cidr不能为空', trigger: 'blur'}
          ],
          startIp: [
            {trigger: 'blur', validator: validateIp},
            {required: true, message: '起始IP不能为空', trigger: 'blur'}
          ],
          endIp: [
            {trigger: 'blur', validator: validateIp},
            {required: true, message: '起始IP不能为空', trigger: 'blur'}
          ],
          gateway: [
            {trigger: 'blur', validator: validateIp},
            {required: true, message: '起始IP不能为空', trigger: 'blur'}
          ],
          netmask: [
            {trigger: 'blur', validator: validateNetmask},
            {required: true, message: '起始IP不能为空', trigger: 'blur'}
          ],
          dhcpIp: [
            {trigger: 'blur', validator: validateIp},
          ]
        }
      }
    },
    computed: {},
    created() {
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
        showMoreSetting: false,
        showSecurytyGroup: false,
        selectedServices: [],
        l2networkList: [],
        virtualRouterOfferingUuid: '',
        vpcVRouterUuid: this.$route.params.vpcVRouterUuid ?  this.$route.params.vpcVRouterUuid : '',
        showMethod,
        vRouterNetworkList: ['DHCP', 'CentralizedDNS', 'SNAT', 'Eip', 'PortForwarding', 'IPsec', 'SecurityGroup', 'VRouterRoute', 'VipQos', 'DNS', 'Userdata', 'LoadBalancer'],
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
            vRouterNetwork[uuid] = ['IPsec', 'VRouterRoute', 'CentralizedDNS', 'VipQos', 'SNAT', 'PortForwarding', 'Eip', 'DNS', 'LoadBalancer']
          }
          if (networkServiceType[uuid].type === 'Flat') {
            vRouterNetwork[uuid] = ['DHCP', 'Userdata']
            flatNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
          }
        }
        return this.updateWindow({flatNetwork, vRouterNetwork})
      }).then(() => {
        return this.queryForAssistant()
      })
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Utils,
      ...Validator,
      removeUuid(uuid) {
        this.updateWindow({
          [uuid]: ''
        })
      },
      showInvalidIPRangeError: function () {
        if (!this.windowData.showMethod && !this.windowData.emptyendIp && !this.windowData.emptystartIp && !this.windowData.invalidstartIp && !this.windowData.invalidendIp && this.windowData.invalidipRange) return true
        else return false
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
          if (resourceName === 'VirtualRouterOffering') {
            priority = 1
          } else {
            priority = 2
          }
          self.createAssistant({
            id,
            operation,
            priority,
            title: 'vpcNetTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {

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
        const self = this
        self.openSideWindowForCreate('VirtualRouterInstanceOfferingListSingleSelectDlg', {
          conditions: ['state=Enabled', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'image.format!=vmtx'],
          select: (uuid) => {
            self.selectVRO(uuid)
          }
        })
      },
      selectVRO: function (uuid) {
        this.updateWindow({virtualRouterOfferingUuid: uuid})
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
        let vRouterNetwork = _.cloneDeep(this.windowData.vRouterNetwork)
        let networkServiceType = _.cloneDeep(this.dbData.networkServiceType)
        for (let uuid in networkServiceType) {
          if (networkServiceType[uuid].type === 'Flat') {
            if (this.windowData.DHCP) {
              delete vRouterNetwork[uuid]
            } else {
              vRouterNetwork[uuid] = ['Userdata', 'DHCP']
            }
            this.updateWindow({vRouterNetwork})
          }
        }
        let param = {
          name: this.windowData.name,
          type: 'L3VpcNetwork',
          l2NetworkUuid: this.windowData.l2NetworkUuid,
          vpcVRouterUuid: this.windowData.vpcVRouterUuid,
          system: false,
          startIp: this.windowData.startIp,
          endIp: this.windowData.endIp,
          netmask: this.windowData.netmask,
          gateway: this.windowData.gateway,
          dns: this.windowData.dns,
          cidr: this.windowData.cidr,
          ipRangeOrcidr: this.windowData.showMethod,
          networkServices: this.windowData.vRouterNetwork,
          routerInterfaceIp: this.windowData.routerInterfaceIp === '' ? undefined : this.windowData.routerInterfaceIp,
          category: 'Private'
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
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
          let parts = input.split('.')
          let isInvalid = false
          if (name === 'startIp' && windowData.endIp) {
            obj.invalidipRange = false
            let endIpParts = windowData.endIp.split('.')
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
          if (name === 'endIp' && windowData.startIp) {
            obj.invalidipRange = false
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
        if (name === 'cidr') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'l2NetworkUuid']
        if (!this.windowData.showMethod) {
          props = props.concat(['startIp', 'endIp', 'netmask', 'gateway'])
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
        let isInvalid = props.some(item => {
          return this.windowData[`empty${item}`] || this.windowData[`invalid${item}`]
        })
        if (isInvalid) obj.invalidInput = true
        if (!this.windowData.showMethod && this.windowData.invalidipRange) obj.invalidInput = true
        this.updateWindow(obj)
      },
      toggleMethod: function () {
        this.updateWindow({showMethod: !this.windowData.showMethod})
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
        const self = this
        let conditions = []
        if (this.windowData.vpcVRouterUuid) {
          conditions.push(`cluster.uuid=${self.dbData.vm[this.windowData.vpcVRouterUuid].clusterUuid}`)
        }

        this.openDialog('L2NetworkSingleSelectListDlg', {
          conditions: conditions,
          ok: (uuid) => {
            this.selectNetwork(uuid)
          }
        })
      },
      openSelectVpcVRouter: function () {
        let clusterUuidList = this.dbData.l2network[this.windowData.l2NetworkUuid] ? this.dbData.l2network[this.windowData.l2NetworkUuid].attachedClusterUuids : []
        this.openDialog('VpcVRouterSingleSelectListDlg', {
          conditions: [`cluster.uuid?=${clusterUuidList}`, 'state=Running'],
          ok: (uuid) => this.selectVpcVRouter(uuid)
        })
      },
      selectVpcVRouter: function (uuid) {
        this.updateWindow({vpcVRouterUuid: uuid})
      },
      selectNetwork: function (uuid) {
        this.updateWindow({l2NetworkUuid: uuid})
        this.validate('l2NetworkUuid')
      },
      removeL2Network: function ($e) {
        $e.stopPropagation()
        this.clearRow('l2NetworkUuid')
        if (!this.dialogData.param.vpcVRouterUuid) {
          this.clearRow('vpcVRouterUuid')
        }
        this.validate('l2NetworkUuid')
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
        this.$refs.form.validate((valid) => {
          this.validateAll()
          if(valid && !this.windowData.invalidInput) {
            this.create(this.createParam())
            this.$router.push({name: 'vpcnetwork'})
          }
        })
      }
    }
  }
</script>
