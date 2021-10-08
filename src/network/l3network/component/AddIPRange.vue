<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #dae0e6;
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
    border: 1px solid #dae0e6;
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
    border-bottom: 1px solid #dae0e6;
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
</style>

<template>
  <create-template-no-route>
    <div slot="header">
        <span>
          {{$t('common.addIpRange')}}
        </span>
      <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
    </div>
    <div slot="body" class="">
      <div class="operation-row">
        <div class="title">{{$t('common.ipVersion')+$t('common.colon')}}{{param.isIPV6 ? 'IPv6': 'IPv4'}}</div>
      </div>
      <div class="operation-row">
        <div class="title"  v-if="param.isHideCidr">{{$t('common.method') + $t('common.colon')}}{{ $t("common.ipRange") }}</div>
        <div class="title required" v-else>{{$t('common.method')}}</div>
        <el-radio-group v-model="windowData.showMethod" v-if="!param.isHideCidr">
          <el-radio :label="false" v-permission="'L3_IP-RANGE.ADD'">{{ $t("common.ipRange ") }}</el-radio>
          <el-radio :label="true" v-permission="'LICENSE_BASIC_PAID'">{{ $t("common.cidr") }}</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row" v-if="param.isIPV6">
        <div class="title required">{{$t('l3network.mode')}}</div>
        <el-select v-model="windowData.mode" placeholder="请选择" style="width: 100%">
          <el-option label="Stateful-DHCP" value="Stateful-DHCP"></el-option>
          <el-option label="Stateless-DHCP" value="Stateless-DHCP" v-if="windowData.showMethod"></el-option>
          <el-option label="SLAAC" value="SLAAC" v-if="windowData.showMethod"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.startIp')}}</div>
        <input v-model="windowData.startIp" :class="{'is-error': windowData.emptystartIp || windowData.invalidstartIp}" @blur="validate('startIp')"/>
        <div class="error error-text" v-if="windowData.emptystartIp">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
        <div class="error error-text" v-if="!windowData.emptystartIp && windowData.invalidstartIp">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
      </div>
      <div class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">{{$t('common.endIp')}}</div>
        <input v-model="windowData.endIp" :class="{'is-error': windowData.emptyendIp || windowData.invalidendIp}" @blur="validate('endIp')"/>
        <div class="error error-text" v-if="windowData.emptyendIp">{{$t('error.emptyInput') + $t('common.endIp')}}</div>
        <div class="error error-text" v-if="!windowData.emptyendIp && windowData.invalidendIp">{{$t('error.invalid') + $t('common.endIp')}}</div>
      </div>
      <div class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">{{$t('common.netmask')}}</div>
        <input v-model="windowData.netmask" :class="{'is-error': windowData.emptynetmask || windowData.invalidnetmask}" @blur="validate('netmask')"/>
        <div class="error error-text" v-if="windowData.emptynetmask">{{$t('error.emptyInput') + $t('common.netmask')}}</div>
        <div class="error error-text" v-if="!windowData.emptynetmask && windowData.invalidnetmask">{{$t('error.invalid') + $t('common.netmask')}}</div>
      </div>
      <div class="operation-row" v-if="!windowData.showMethod && param.isIPV6">
        <div class="title required">{{$t('l3network.prefixLen')}}</div>
        <input v-model="windowData.prefixLen" placeholder="64~126" :class="{'is-error': windowData.emptyprefixLen || windowData.invalidprefixLen}" @blur="validate('prefixLen')"/>
        <div class="error error-text" v-if="windowData.emptyprefixLen">{{$t('error.emptyInput') + $t('l3network.prefixLen')}}</div>
        <div class="error error-text" v-if="!windowData.emptyprefixLen && windowData.invalidprefixLen">{{$t('error.invalid') + $t('l3network.prefixLen')}}</div>
      </div>
      <div class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">{{$t('common.gateway')}}</div>
        <input v-model="windowData.gateway" :class="{'is-error': windowData.emptygateway || windowData.invalidgateway}" @blur="validate('gateway')"/>
        <div class="error error-text" v-if="windowData.emptygateway">{{$t('error.emptyInput') + $t('common.gateway')}}</div>
        <div class="error error-text" v-if="!windowData.emptygateway && windowData.invalidgateway">{{$t('error.invalid') + $t('common.gateway')}}</div>
      </div>
      <div class="operation-row" v-if="windowData.showMethod">
        <div class="title required">{{$t('common.gateway')}}</div>
        <input v-model="windowData.cidr" :class="{'is-error': windowData.emptycidr || windowData.invalidcidr}" @blur="validate('cidr')"/>
        <div class="error error-text" v-if="windowData.emptycidr">{{$t('error.emptyInput') + $t('common.cidr')}}</div>
        <div class="error error-text" v-if="!windowData.emptycidr && windowData.invalidcidr">{{$t('error.invalid') + $t('common.cidr')}}</div>
      </div>
      <div class="operation-row" v-if="!param.isHideDHCP">
        <div class="title">{{$t('baremetal.dhcpService') + 'IP'}}</div>
        <help-trigger name="dhcpInCIDR"/>
        <input v-model="windowData.dhcp" :class="{'is-error': windowData.invaliddhcp}" disabled/>
        <div class="error error-text" v-if="windowData.invaliddhcp">{{$t('error.invalid') + $t('common.dhcp')}}</div>
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import rpc from 'src/utils/rpc';

  export default {
    name: "AddIPRangeDlg",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mixins: [WindowBase],
    components: {CreateTemplateNoRoute},
    data() {
      return {
        cloneFormConfig: {
          name: '',
          number: 1,
        },
        rules: {}
      }
    },
    computed: {
      cidrPlaceholder() {
        return this.param.isIPV6 ? '234e:0:4567::3d/64' : '192.168.1.0/24'
      },
      isHideCidr() {
        if (this.param) {
          return _.isUndefined(this.param.isHideCidr) ? false : this.param.isHideCidr
        }
        return false
      }
    },
    created() {
      let l3NetworkUuid = _.get(this, 'dialogData.param.l3NetworkUuid')
      if (l3NetworkUuid) this.getDHCPAbility(l3NetworkUuid)
      //this.$data.validator.add('dhcp', this.checkDhcp)


      this.updateWindow({
        showMethod: false,
        cidr: '',
        startIp: '',
        endIp: '',
        gateway: '',
        netmask: '',
        mode: 'Stateful-DHCP'
      })
    },
    methods: {
      checkDhcp(val) {
        let obj = {isValid: true, errMsg: ''}
        if (val === '') return obj
        let fuc = this.param.isIPV6 ? this.param.isIPV6IP : this.isIP
        if (!fuc(val)) {
          return ({isValid: false, errMsg: this.$t('error.ipOnly')})
        } else {
          return obj
        }
      },
      getDHCPAbility(l3NetworkUuid) {
        let tasks = []
        let p = rpc.query(`system-tags`, {q: `resourceUuid=${l3NetworkUuid}`}).then(resp => {
          if (resp.inventories.length === 0) return
          let hasDhcp = resp.inventories.some(tag => _.includes(tag.tag, 'DhcpServer::'))
          this.canSetDHCP = this.canSetDHCP || hasDhcp
        })
        tasks.push(p)
        p = rpc.query('l3-networks/network-services/refs', {q: `l3Network.uuid=${l3NetworkUuid}`}).then(resp => {
          let noDHCPService = resp.inventories.every(service => service.networkServiceType !== 'DHCP')
          this.canSetDHCP = this.canSetDHCP || noDHCPService
        })
        tasks.push(p)
        return Promise.all(tasks)
      },
      ...Validator,
      showInvalidIPRangeError: function () {
        if (!this.windowData.showMethod && !this.windowData.emptyendIp && !this.windowData.emptystartIp && !this.windowData.invalidstartIp && !this.windowData.invalidendIp && this.windowData.invalidipRange) return true
        else return false
      },
      toggleMethod: function () {
        if (this.param.isIPV6 && !this.windowData.showMethod && this.windowData.mode !== 'Stateful-DHCP') this.updateWindow({mode: 'Stateful-DHCP'})
        this.updateWindow({showMethod: this.windowData.showMethod})
      },
      createParam: function () {
        let param = {
          showMethod: this.windowData.showMethod,
          startIp: this.windowData.startIp,
          endIp: this.windowData.endIp,
          systemTags: [],
          netmask: this.windowData.netmask,
          gateway: this.windowData.gateway,
          networkCidr: this.windowData.cidr,
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
        debugger
        let windowData = this.windowData
        obj[`empty${name}`] = false
        let propToBeTrimed = ['startIp', 'endIp', 'netmask', 'gateway', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        let IPs = ['startIp', 'endIp', 'netmask', 'gateway']
        if (IPs.indexOf(name) > -1) {
          let fuc = this.param.isIPV6 ? this.isIPV6IP : this.isIP
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
          if (name === 'netmask' && !this.isValidNetMask(input)) {
            obj[`invalid${name}`] = true
          }
          // if (!obj[`invalid${name}`] && ['startIp', 'endIp'].indexOf(name) > -1) {
          //   obj.invalidstartIp = false
          //   obj.invalidendIp = false
          // }
        }
        if (name === 'prefixLen' && input) {
          obj.notInRangeForPrefixLen = false
          if (!this.isNumber(input)) {
            obj[`invalid${name}`] = true
          } else if (input < 64 || input > 126) {
            obj.notInRangeForPrefixLen = true
          }
        }
        if (name === 'cidr') {
          let fuc = this.param.isIPV6 ? this.isIPV6Cidr : this.isCidr
          obj.notInRangeForPrefixLenInCidr = false
          if (!fuc(input)) {
            obj[`invalid${name}`] = true
          } else if (this.isIPV6) {
            let num = parseInt(input.split('/')[1])
            if (num < 64 || num > 126) obj.notInRangeForPrefixLenInCidr = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let props
        if (this.windowData.showMethod) {
          props = ['cidr']
        } else {
          props = ['startIp', 'endIp', 'gateway']
          if (this.param.isIPV6) props.push('prefixLen')
          else props.push('netmask')
        }
        props.forEach(item => this.validate(item))
        let invalidInput = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        if (!this.windowData.showMethod && this.windowData.invalidipRange) invalidInput = true
        //invalidInput = invalidInput || !this.$data.validator.check('dhcp')
        this.updateWindow({invalidInput})
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) {
          return
        }
        this.param.ok(this.createParam())
        this.$emit('close');
      }

    }
  }
</script>

