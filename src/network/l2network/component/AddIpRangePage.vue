<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('common.addIpRange')}}</span>
      <span class="el-icon-back create-back" @click="$emit('close')">返回</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title">{{$t('common.ipVersion') + $t('common.colon') + `IPv${dbData.l3network[windowData.dataUuid].ipVersion}`}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.type') + $t('common.colon') + $t('common.ipRange')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.startIp')}}</div>
        <input type="text" v-model="startIp" :class="{'is-error': emptystartIp || invalidstartIp || invalidipRange}" @blur="validate('startIp')"/>
        <div class="error-text error" v-if="emptystartIp">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
        <div class="error-text error" v-if="!emptystartIp && invalidstartIp">{{$t('error.invalid') + $t('common.startIp')}}</div>
        <div class="error-text error" v-if="!emptystartIp && !invalidstartIp && invalidipRange"> {{$t("error.invalid")+$t("common.ipRange")}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.endIp')}}</div>
        <input type="text" v-model="endIp" :class="{'is-error': emptyendIp || invalidendIp || invalidipRange}" @blur="validate('endIp')"/>
        <div class="error-text error" v-if="emptyendIp">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
        <div class="error-text error" v-if="!emptyendIp && invalidendIp">{{$t('error.invalid') + $t('common.startIp')}}</div>
        <div class="error-text error" v-if="!emptyendIp && !invalidendIp && invalidipRange"> {{$t("error.invalid")+$t("common.ipRange")}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.netmask')}}</div>
        <input type="text" v-model="netmask" :class="{'is-error': emptynetmask || invalidnetmask}" @blur="validate('netmask')"/>
        <div class="error-text error" v-if="emptynetmask">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
        <div class="error-text error" v-if="!emptynetmask && invalidnetmask">{{$t('error.invalid') + $t('common.startIp')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.gateway')}}</div>
        <input type="text" v-model="gateway" :class="{'is-error': emptygateway || invalidgateway}" @blur="validate('gateway')"/>
        <div class="error-text error" v-if="emptygateway">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
        <div class="error-text error" v-if="!emptygateway && invalidgateway">{{$t('error.invalid') + $t('common.startIp')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('baremetal.dhcpService') + 'IP'}}</div>
        <input type="text" v-model="dhcp" :class="{'is-error': invaliddhcp}" @blur="validate('dhcp')"/>
        <div class="error-text error" v-if="invaliddhcp">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';

  export default {
    name: "AddIpRange",
    components: {CreateTemplateNoRoute},
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data(){
      return {
        startIp: '',
        emptystartIp: false,
        endIp: '',
        invalidendIp: false,
        emptyendIp: false,
        netmask: '',
        invalidnetmask: false,
        emptynetmask: false,
        gateway: '',
        invalidgateway: false,
        emptygateway: false,
        dhcp:'',
        invaliddhcp: false,
        invalidipRange: false
      }
    },

    created(){
      let self = this;
      self.updateWindow({
        dataUuid: self.param.uuid
      })
    },

    methods: {
      ...Validator,
      validate (name) {
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['startIp', 'endIp', 'netmask', 'gateway', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        let IPs = ['startIp', 'endIp', 'netmask', 'gateway']
        if (IPs.indexOf(name) > -1) {
          if (!this.isIP(input)) {
            self[`invalid${name}`] = true
            return
          }
          let parts = input.split('.')
          let isInvalid = false
          if (name === 'startIp' && self.endIp) {
            self.invalidipRange = false
            let endIpParts = self.endIp.split('.')
            for (let i = 0; i < endIpParts.length; i++) {
              if (Number(endIpParts[i]) > Number(parts[i])) {
                break
              }
              if (Number(endIpParts[i]) < Number(parts[i])) {
                self.invalidipRange = true
                break
              }
            }
          }
          if (name === 'endIp' && self.startIp) {
            self.invalidipRange = false
            let startIpParts = self.startIp.split('.')
            for (let i = 0; i < startIpParts.length; i++) {
              if (Number(startIpParts[i]) < Number(parts[i])) {
                break
              }
              if (Number(startIpParts[i]) > Number(parts[i])) {
                self.invalidipRange = true
                break
              }
            }
          }
          self[`invalid${name}`] = isInvalid
          if (name === 'netmask' && !this.isValidNetMask(input)) {
            self[`invalid${name}`] = true
          }
        }
        if (name === 'dhcp') {
          if (!this.isIp(input)) {
            self[`invalid${name}`] = true
          }
        }
      },

      validateAll () {
        let self = this , invalidInput = false, props = [];
        props = ['startIp', 'endIp', 'netmask', 'gateway']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => {
          return self[`empty${item}`] || self[`invalid${item}`] || self.invalidipRange
        })
        if (isInvalid) invalidInput = true;
        return invalidInput;
      },

      trimProp(name){
        let self = this;
        return String(self[name]).trim();
      },

      createParam() {
        let self = this, systemTags = [];
        if (this.dhcp) {
          let dhcp = self.dbData.l3network[self.windowData.dataUuid].ipVersion === 6 ? this.dhcp.replace(/::/g, '--') : this.dhcp
          systemTags.push(`flatNetwork::DhcpServer::${dhcp}::ipUuid::null`)
        }
        return {
          showMethod: false,
          startIp: self.startIp,
          endIp: self.endIp,
          netmask: self.netmask,
          gateway: self.gateway,
          systemTags: systemTags
        }
      },

      confirm() {
        let self = this, invalid = self.validateAll();
        if(invalid) return;
        self.param.ok(self.createParam());
        self.$emit('close');
      }
    }
  }
</script>

<style scoped>

</style>
