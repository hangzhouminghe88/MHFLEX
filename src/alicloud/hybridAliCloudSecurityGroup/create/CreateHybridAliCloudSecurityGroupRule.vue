<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('securityGroup.setRules')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到安全组规则列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.nicType')}}
        </div>
        <el-select v-model="nicType" style="width: 100%;">
          <el-option value="intranet" :label="$t('hybridSecurityGroupRule.intranet')"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.direction')}}
        </div>
        <el-select v-model="direction" style="width: 100%;">
          <el-option v-for="(item, index) in directionList"
                     :value="item.value"
                     :label="item.label"
                     :key="index"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.policy')}}
        </div>
        <el-select v-model="policy" style="width: 100%;">
          <el-option v-for="(item, index) in policyList"
                     :value="item.value"
                     :label="item.label"
                     :key="index"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.protocol')}}
        </div>
        <el-select v-model="protocol" style="width: 100%;" @change="handleProtocolChange">
          <el-option v-for="(item, index) in protocolList"
                     :value="item.value"
                     :label="item.label"
                     :key="index"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.portRange')}}
        </div>
        <input type="text" v-model="portRange"
               :class="{'is-error': emptyportRange || invalidportRange,
               'disabled': ['ALL', 'ICMP', 'GRE'].includes(protocol)}"
               :placeholder="portRangePlaceholder"
               @blur="validate('portRange')"/>
        <div class="error error-text" v-show="emptyportRange && !invalidportRange">
          {{$t('error.emptyInput') + $t('hybridSecurityGroupRule.portRange')}}
        </div>
        <div class="error error-text" v-show="!emptyportRange && invalidportRange">
          {{$t('error.invalid') + $t('hybridSecurityGroupRule.portRange')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.authorizationObject')}}
        </div>
        <input type="text" v-model="cidrIp"
               :class="{'is-error': emptycidrIp || invalidcidrIp}"
               placeholder="192.168.1.0/24"
               @blur="validate('cidrIp')"/>
        <div class="error error-text" v-show="emptycidrIp && !invalidcidrIp">
          {{$t('error.emptyInput') + $t('hybridSecurityGroupRule.authorizationObject')}}
        </div>
        <div class="error error-text" v-show="!emptycidrIp && invalidcidrIp">
          {{$t('error.invalid') + $t('hybridSecurityGroupRule.authorizationObject')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridSecurityGroupRule.priority')}}
        </div>
        <input type="number" step="1" min="1" v-model="priority"
               :class="{'is-error': emptypriority || invalidpriority}"
               @blur="validate('priority')"/>
        <div class="error error-text" v-show="emptypriority && !invalidpriority">
          {{$t('error.emptyInput') + $t('hybridSecurityGroupRule.priority')}}
        </div>
        <div class="error error-text" v-show="!emptypriority && invalidpriority">
          {{$t('error.invalid') + $t('hybridSecurityGroupRule.priority')}}
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{disabled: !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>

  import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
  import Validator from 'src/utils/validator';

  export default {

    name: "CreateHybridAliCloudSecurityGroupRule",

    components: {CreateTemplateNoRoute},

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data() {
      let self = this;
      return {
        nicType: 'intranet',
        direction: 'ingress',
        directionList: [
          {
            label: self.$t('hybridSecurityGroupRule.ingress'),
            value: 'ingress'
          },
          {
            label: self.$t('hybridSecurityGroupRule.egress'),
            value: 'egress'
          }
        ],
        policy: 'accept',
        policyList: [
          {
            label: self.$t('hybridSecurityGroupRule.accept'),
            value: 'accept'
          },
          {
            label: self.$t('hybridSecurityGroupRule.drop'),
            value: 'drop'
          }
        ],
        protocol: 'ALL',
        portRange: '-1/-1',
        portRangePlaceholder: '-1/-1',
        emptyportRange: false,
        invalidportRange: false,
        protocolList: [
          {
            label: 'ALL',
            value: 'ALL'
          },
          {
            label: 'TCP',
            value: 'TCP'
          },
          {
            label: 'UDP',
            value: 'UDP'
          },
          {
            label: 'ICMP',
            value: 'ICMP'
          },
          {
            label: 'GRE',
            value: 'GRE'
          },
        ],
        cidrIp: '',
        emptycidrIp: false,
        invalidcidrIp: false,
        priority: '1',
        emptypriority: false,
        invalidpriority: false,
        canCreate: true
      }
    },

    methods: {
      ...Validator,

      handleProtocolChange() {
        let self = this;
        if(['UDP', 'TCP'].includes(self.protocol)){
          self.portRange='';
          self.portRangePlaceholder='22/24';
        }else{
          self.portRange='-1/-1';
        }
      },

      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        if(!input) {
          self[`empty${name}`] = true;
          return;
        }
        if (name === 'priority') {
          let range = {
            maxValue: 100,
            minValue: 1
          }
          if (!self.isIn(input, range)) {
            self[`invalid${name}`] = true
            return
          }
        }
        if (name === 'cidrIp') {
          if (!self.isCidr(input)) {
            self[`invalid${name}`] = true
          }
        }
        if (name === 'portRange') {
          if (self.protocol === 'TCP' || self.protocol === 'UDP') {
            if (input.indexOf('/') > 0) {
              let ports = input.split('/')
              if (ports.length === 2 && !isNaN(ports[0]) && !isNaN(ports[1]) && self.isIn(ports[0], {minValue: 1, maxValue: 65535}) && self.isIn(ports[1], {minValue: 1, maxValue: 65535}) && Number(ports[0]) <= Number(ports[1])) {
                self[`invalid${name}`] = false
              } else {
                self[`invalid${name}`] = true
              }
            } else {
              self[`invalid${name}`] = true
            }
          }
        }
      },

      validateAll() {
        let self = this, props = ['cidrIp', 'portRange', 'priority'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => {
          return self[`empty${name}`] === true || self[`invalid${name}`] === true;
        })
        return invalid;
      },

      createParam() {
        let self = this;
        return {
          nictype: self.nicType,
          direction: self.direction,
          policy: self.policy,
          protocol: self.protocol,
          priority: self.priority,
          portRange: self.portRange,
          cidr: self.cidrIp
        }
      },

      confirm() {
        let self = this, invalid = self.validateAll();
        if(invalid) return;
        self.canCreate = false;
        self.param.ok(self.createParam())
          .then(() => {
            self.$emit('close');
          })
          .catch(() => {
            self.canCreate = true;
          })
      }
    }
  }
</script>

<style scoped>

</style>
