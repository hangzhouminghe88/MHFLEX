<template>
  <div class="container">
    <div class="operation-row">
      <div class="sole-title">
        {{$t("common.l2network")}}{{$t("common.colon")}}
      </div>
      <div class="sole-content">
        {{ dbData.l2network[windowData.l2NetworkUuid] && dbData.l2network[windowData.l2NetworkUuid].name }}
      </div>
    </div>

    <div class="operation-row">
      <div class="title required">
        {{$t("common.name")}}
      </div>
      <help-trigger name="l3network"/>
      <input :value="windowData.name" :class="{'error-input': windowData.emptyname}"
             @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
             @keydown.enter="validate('name')"/>
      <div class="error" v-if="windowData.emptyname">
        {{$t("error.emptyInput")+$t("common.name")}}
      </div>
    </div>

    <div class="operation-row">
      <div class="title">
        {{$t("common.description")}}
      </div>
      <textarea rows="3" :value="windowData.description"
                @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
    </div>

    <div  class="operation-row">
      <div class="title">
        {{$t("common.networkServiceType")}}
      </div>
      <el-radio v-model="windowData.showPrivate">{{$t("common.flatNetwork")}}</el-radio>
    </div>

    <div class="operation-block-header" style="margin-top: 40px;">
      {{ $t("common.addIpRange") }}
    </div>
    <div class="operation-row">
      <div class="title ">
        {{ $t("common.method") }}
      </div>
      <el-radio v-model="type" label="ipRange">{{ $t("common.ipRange ") }}</el-radio>
      <el-radio v-model="type" label="cidr">{{ $t("common.cidr") }}</el-radio>
    </div>
    <div class="operation-row" v-if="type==='cidr'">
      <div class="title required">
        {{$t("common.cidr")}}
      </div>
      <input :value="windowData.cidr" placeholder="192.168.1.0/24"
             :class="{'is-error': windowData.emptycidr || windowData.invalidcidr}"
             @input="(e) => { updateWindow({ 'cidr': e.target.value }) }" @blur="validate('cidr')"
             @keydown.enter="validate('cidr')"/>
      <div class="error" v-if="type==='cidr' && windowData.emptycidr">
        {{$t("error.emptyInput")+$t("common.cidr")}}
      </div>
      <div class="error error-text" v-if="type==='cidr' && !windowData.emptycidr && windowData.invalidcidr">
        {{$t("error.invalid")+$t("common.cidr")}}
      </div>
    </div>
    <div class="operation-row"  v-if="type==='ipRange'">
      <div class="title required">
        {{$t("common.startIp")}}
      </div>
      <input :value="windowData.startIp" placeholder="192.168.0.100"
             :class="{'is-error': windowData.emptystartIp || windowData.invalidstartIp}" @blur="validate('startIp')"
             @keydown.enter="validate('startIp')" @input="(e) => { updateWindow({ 'startIp': e.target.value }) }"/>
      <div class="error error-text" v-if="type==='ipRange' && windowData.emptystartIp">
        {{$t("error.emptyInput")+$t("common.startIp")}}
      </div>
      <div class="error error-text" v-if="type==='ipRange' && !windowData.emptystartIp && windowData.invalidstartIp">
        {{$t("error.invalid")+$t("common.startIp")}}
      </div>
    </div>
    <div class="operation-row" v-if="type==='ipRange'">
      <div class="title required">
        {{$t("common.endIp")}}
      </div>
      <input :value="windowData.endIp" placeholder="192.168.0.200"
             :class="{'is-error': windowData.emptyendIp || windowData.invalidendIp}" @blur="validate('endIp')"
             @keydown.enter="validate('endIp')" @input="(e) => { updateWindow({ 'endIp': e.target.value }) }"/>
      <div class="error error-text" v-if="type==='ipRange' && windowData.emptyendIp">
        {{$t("error.emptyInput")+$t("common.endIp")}}
      </div>
      <div class="error error-text" v-if="type==='ipRange' && !windowData.emptyendIp && windowData.invalidendIp">
        {{$t("error.invalid")+$t("common.endIp")}}
      </div>
    </div>
    <div class="operation-row" v-if="type==='ipRange'">
      <div class="title required">
        {{$t("common.netmask")}}
      </div>
      <input :value="windowData.netmask" placeholder="255.255.255.0"
             :class="{'is-error': windowData.emptynetmask || windowData.invalidnetmask}"
             @input="(e) => { updateWindow({ 'netmask': e.target.value }) }" @blur="validate('netmask')"
             @keydown.enter="validate('netmask')"/>
      <div class="error" v-if="type==='ipRange' && windowData.emptynetmask">
        {{$t("error.emptyInput")+$t("common.netmask")}}
      </div>
      <div class="error error-text" v-if="type==='ipRange' && !windowData.emptynetmask && windowData.invalidnetmask">
        {{$t("error.invalid")+$t("common.netmask")}}
      </div>
    </div>
    <div class="operation-row" v-if="type==='ipRange'">
      <div class="title required">
        {{$t("common.gateway")}}
      </div>
      <input :value="windowData.gateway" placeholder="192.168.0.1"
             :class="{'is-error': windowData.emptygateway || windowData.invalidgateway}"
             @input="(e) => { updateWindow({ 'gateway': e.target.value }) }" @blur="validate('gateway')"
             @keydown.enter="validate('gateway')"/>
      <div class="error error-text" v-if="type==='ipRange' && windowData.emptygateway">
        {{$t("error.emptyInput")+$t("common.gateway")}}
      </div>
      <div class="error error-text" v-if="type==='ipRange' && !windowData.emptygateway && windowData.invalidgateway">
        {{$t("error.invalid")+$t("common.gateway")}}
      </div>
    </div>
    <div class="operation-block-header" style="margin-top: 40px;">
      {{ $t("common.addDns") }}
    </div>
    <div id="common-dns" class="operation-row">
      <div class="title">
        {{$t("common.dns")}}
      </div>
      <input :value="windowData.dns" placeholder="223.5.5.5" :class="{'is-error': windowData.invaliddns}"
             @input="(e) => { updateWindow({ 'dns': e.target.value }) }" @blur="validate('dns')"
             @keydown.enter="validate('dns')"/>
      <div class="error error-text" v-if="windowData.invaliddns">
        {{$t("error.invalid")+$t("common.dns")}}
      </div>
    </div>
  </div>
</template>

<script>
  //添加三层网络校验
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  export default {
    name: "WizardL3Network",
    mixins: [WindowBase],
    data(){
      let self = this;
      return {
        type: 'ipRange',
      }
    },
    props: ['param', 'parentWindowUuid'],
    created () {
      let wizard = _.cloneDeep(this.$store.state.windowManager.windows[this.parentWindowUuid].wizard)
      this.updateWindow({
        name: 'L3Network-1',
        description: '',
        type: 'L3BasicNetwork',
        l2NetworkUuid: wizard.l2networks.uuid,
        wizard: wizard,
        system: false,
        cidr: '',
        startIp: '',
        endIp: '',
        netmask: '',
        gateway: '',
        dns: '223.5.5.5',
        networkServicesUuid: '',
        networkServiceTypes: [],
        showSecurytyGroup: false,
        flatNetworkList: ['Userdata', 'Eip', 'DHCP', 'SecurityGroup'],
        selectedServices: [],
        showNetworkServiceType: 'Flat',
        showMoreDropdownNetworkServiceType: false,
      })
        .then(() => {
          let flatNetwork = {}
          let networkServiceType = _.cloneDeep(this.dbData.networkServiceType)
          for (let uuid in networkServiceType) {
            if (networkServiceType[uuid].type === 'Flat') {
              flatNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
              this.updateWindow({ flatNetwork })
            }
          }
        })
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true)
    },
    methods: {
      //切换更多dropdown框
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      ...Validator,
      //添加三层网络参数
      createParam: function () {
        let networkServices = _.cloneDeep(this.windowData.flatNetwork)
        let param = {
          name: this.windowData.name,
          description: this.windowData.description,
          type: 'L3BasicNetwork',
          l2NetworkUuid: this.windowData.l2NetworkUuid,
          system: false,
          dns: this.windowData.dns,
          networkServices: networkServices,
          category: 'Private'
        }
        if (this.type==='cidr') {
          param['cidr'] = this.windowData.cidr
          return param
        } else {
          let ipRange = {
            startIp: this.windowData.startIp,
            endIp: this.windowData.endIp,
            netmask: this.windowData.netmask,
            gateway: this.windowData.gateway
          }
          return Object.assign(param, ipRange)
        }
      },
      //选择网络
      selectNetwork: function (uuid) {
        this.updateWindow({ l2NetworkUuid: uuid })
      },
      //选择网络服务类型
      selectNetworkServiceType: function (types, param) {
        this.updateWindow({ networkServiceTypes: types, networkServices: param })
      },
      checkDialogList: function () {
        let NetworkServiceTypeList = this.windowData.dialogList.filter((item) =>
          item.indexOf('L3NetworkNetworkServiceTypeListMultiSelect') > -1
        )
        if (NetworkServiceTypeList.length === 0) return false
        return NetworkServiceTypeList[0]
      },
      //单个校验
      validate (name) {
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
      //整体校验
      validateAll () {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'l2NetworkUuid']
        if (this.type==='ipRange') {
          props = props.concat(['startIp', 'endIp', 'netmask', 'gateway'])
        } else {
          props.push('cidr')
        }
        if (this.windowData.showPrivate) {
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
        this.updateWindow(obj)
      },
      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        self.validateAll();
        if(this.windowData.invalidInput) return;
        self.param.update(self.createParam());
      }
    },
    destroyed(){
      let self = this;
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true)
    }
  }
</script>

<style scoped>

</style>
