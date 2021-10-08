<template>
  <create-template-no-route class="create-sgrule_container">
    <div slot="header">
      <span class="create-header-title">添加安全组规则</span>
      <help-trigger
        name="setRules"
        triangle="top"
        :style="{position:'relative', display: 'inline-block', top: '5px', left: '10px'}"
      />
      <span
        class="create-back el-icon-back"
        @click='close()'
      >
        回到安全组规则列表
      </span>
    </div>
    <div
      class="create-body"
      slot="body"
    >
      <mh-input
        label="IP类型"
        :required="true"
        v-model="ethertype"
        :selectGroup="ethertypeGroup"
        @changeOption="changeIpType"
        type="select"
      />

      <mh-input
        :label="$t('hybridSecurityGroupRule.direction')"
        :required="true"
        v-model="direction"
        :selectGroup="directionGroup"
        @changeOption="changeDirection"
        type="select"
      />

      <mh-input
        :label="$t('hybridSecurityGroupRule.protocol') + $t('hybridSecurityGroupRule.type')"
        :required="true"
        v-model="protocol"
        :selectGroup="protocolGroup"
        @changeOption="changeProtocol"
        type="select"
      />

      <mh-input
        :label="$t('hybridSecurityGroupRule.protocol')+ $t('hybridSecurityGroupRule.type')"
        :required="true"
        v-if="protocol === 'ICMP'"
        v-model="icmpValue"
        :selectGroup="icmpGroup"
        @changeOption="changeIcmpGroup"
        type="select"
      />

      <mh-input
        :label="'最小端口'"
        v-model="portRangeMin"
        :show-error="emptyportRangeMin ||invalidportRangeMin"
        :error-message="rules.portRangeMin.message"
        @validate="validate"
        prop="portRangeMin"
        placeholder="1~65535"
        :disabled="isDisabled"
        :required="true"
      />

      <mh-input
        :label="'最大端口'"
        v-model="portRangeMax"
        :show-error="emptyportRangeMax ||invalidportRangeMax"
        :error-message="rules.portRangeMax.message"
        @validate="validate"
        prop="portRangeMax"
        placeholder="1~65535"
        :disabled="isDisabled"
        :required="true"
      />

      <mh-input
        :label="$t('common.cidr')"
        v-model="cidrIp"
        :show-error="emptycidrIp ||invalidcidrIp"
        :error-message="rules.cidrIp.message"
        @validate="validate"
        prop="cidrIp"
        placeholder="192.168.1.0/24"
        :required="true"
      />
    </div>
    <div
      class="create-footer"
      slot="footer"
    >
      <span class="btn-confirm"
            @click="canCreate && confirm()"
            :class="{'disabled': !canCreate}">{{$t('common.confirm')}}</span>
      <span
        class="btn-cancel"
        @click='close()'
      >{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
import validator from "src/utils/validator";
import WindowBase from "src/windows/Window";

export default {
  name: "CreateHybridHuaweiSgRule",
  mixins: [WindowBase],
  components: {
    "create-template-no-route": CreateTemplateNoRoute
  },
  props: {
    param: {
      type: Object,
      default: () => {

      }
    }
  },
  data() {
    return {
      ethertype: "IPv4",
      direction: "ingress",
      protocol: "ICMP",
      icmpValue: "Any",
      portRangeMin: "-1",
      portRangeMax: "-1",
      cidrIp: "",
      emptyportRangeMin: false,
      invalidportRangeMin: false,
      emptyportRangeMax: false,
      invalidportRangeMax: false,
      emptycidrIp: false,
      invalidcidrIp: false,
      rules: {
        portRangeMin: { message: "" },
        portRangeMax: { message: "" },
        cidrIp: { message: "" }
      },
      ethertypeGroup: [
        {
          label: "IPv4",
          value: "IPv4"
        },
        {
          label: "IPv6",
          value: "IPv6"
        }
      ],
      directionGroup: [
        {
          label: "入方向",
          value: "ingress"
        },
        {
          label: "出方向",
          value: "egress"
        }
      ],
      protocolGroup: [
        {
          label: "全部",
          value: "Any"
        },
        {
          label: "TCP",
          value: "TCP"
        },
        {
          label: "UDP",
          value: "UDP"
        },
        {
          label: "ICMP",
          value: "ICMP"
        }
      ],
      icmpGroup: [
        {
          label: "Any",
          value: "Any"
        },
        {
          label: "Echo",
          value: "Echo"
        },
        {
          label: "Echo reply",
          value: "Echo reply"
        },
        {
          label: "Fragment need DF set",
          value: "Fragment need DF set"
        },
        {
          label: "Host redirect",
          value: "Host redirect"
        },
        {
          label: "Host TOS redirect",
          value: "Host TOS redirect"
        },
        {
          label: "Host unreachable",
          value: "Host unreachable"
        },
        {
          label: "Information reply",
          value: "Information reply"
        },
        {
          label: "Information request",
          value: "Information request"
        },
        {
          label: "Net redirect",
          value: "Net redirect"
        },
        {
          label: "Net TOS redirect",
          value: "Net TOS redirect"
        },
        {
          label: "Parameter problem",
          value: "Parameter problem"
        },
        {
          label: "Port unreachable",
          value: "Port unreachable"
        },
        {
          label: "Protocol unreachable",
          value: "Protocol unreachable"
        },
        {
          label: "Reassembly timeout",
          value: "Reassembly timeout"
        },
        {
          label: "Source Sourcequench",
          value: "Source Sourcequench"
        },
        {
          label: "Source route failed",
          value: "Source route failed"
        },
        {
          label: "Timestamp reply",
          value: "Timestamp reply"
        },
        {
          label: "Timestamp request",
          value: "Timestamp request"
        },
        {
          label: "TTL exceeded",
          value: "TTL exceeded"
        }
      ],
      canCreate: true
    };
  },
  computed: {
    isDisabled() {
      let _this = this;
      return _this.protocol === "ICMP" || _this.protocol === "Any";
    }
  },
  methods: {
    ...validator,
    close() {
      let _this = this;
      _this.$emit("close");
    },
    changeIpType() {},
    changeDirection() {},
    validate(name) {
      let self = this, errorMsg  = '';
      let propToBeTrimed = ["name", "cidrIp"];
      let input = self[name];
      switch (name) {
        case "cidrIp":
          errorMsg = "授权对象";
          break;
        case "portRangeMin":
          errorMsg = "最小端口";
          break;
        case "portRangeMax":
          errorMsg = "最大端口";
          break;
      }
      self[`empty${name}`] = false;
      if (!input) {
        self[`empty${name}`] = true;
        self.rules[name].message = self.$t("error.emptyInput") + errorMsg;
        return;
      }
      self[`invalid${name}`] = false;
      if (name === "cidrIp") {
        if (!self.isCidr(input)) {
          self[`invalid${name}`] = true;
          self.rules[name].message = self.$t("error.invalid") + errorMsg;
        }
      }
      if (name === "portRangeMax") {
        if (self.protocol === "TCP" || self.protocol === "UDP") {
          if (
            self.isIn(self.portRangeMax, { minValue: 1, maxValue: 65535 }) &&
            self.isIn(self.portRangeMin, { minValue: 1, maxValue: 65535 }) &&
            Number(self.portRangeMin) <= Number(self.portRangeMax)
          ) {
            self[`invalid${name}`] = false;
          } else {
            self[`invalid${name}`] = true;
            self.rules[name].message = "最小端口不能大于最大端口";
          }
        }
      }
      if (name === "port_range_min") {
        if (self.protocol === "TCP" || self.protocol === "UDP") {
          if (
            self.isIn(self.portRangeMax, { minValue: 1, maxValue: 65535 }) &&
            self.isIn(self.portRangeMin, { minValue: 1, maxValue: 65535 }) &&
            Number(self.portRangeMin) <= Number(self.portRangeMax)
          ) {
            self[`invalid${name}`] = false;
          } else {
            self[`invalid${name}`] = true;
            self.rules[name].message = "最大端口不能小于最小端口";
          }
        }
      }
    },
    changeProtocol(item) {
      let _this = this;
      _this.protocol = item.value;
      if (_this.protocol === "ICMP" || _this.protocol === "Any") {
        _this.icmpValue = "Any";
        _this.portRangeMin = "-1";
        _this.portRangeMax = "-1";
      } else {
        _this.portRangeMin = "";
        _this.portRangeMax = "";
      }
    },
    changeIcmpGroup(item) {
      let _this = this,
        portRange = {};
      switch (_this.icmpValue.replace(/\s+/g, "")) {
        case "Any":
          portRange = { portRangeMax: "-1", portRangeMin: "-1" };
          break;
        case "Echo":
          portRange = { portRangeMax: "8", portRangeMin: "0" };
          break;
        case "Echoreply":
          portRange = { portRangeMax: "0", portRangeMin: "0" };
          break;
        case "FragmentneedDFset":
          portRange = { portRangeMax: "4", portRangeMin: "3" };
          break;
        case "Hostredirect":
          portRange = { portRangeMax: "1", portRangeMin: "5" };
          break;
        case "HostTOSredirect":
          portRange = { portRangeMax: "3", portRangeMin: "5" };
          break;
        case "Hostunreachable":
          portRange = { portRangeMax: "1", portRangeMin: "3" };
          break;
        case "Informationreply":
          portRange = { portRangeMax: "0", portRangeMin: "16" };
          break;
        case "Informationrequest":
          portRange = { portRangeMax: "0", portRangeMin: "15" };
          break;
        case "Netredirect":
          portRange = { portRangeMax: "0", portRangeMin: "16" };
          break;
        case "NetTOSredirect":
          portRange = { portRangeMax: "2", portRangeMin: "5" };
          break;
        case "Netunreachable":
          portRange = { portRangeMax: "0", portRangeMin: "3" };
          break;
        case "Parameterproblem":
          portRange = { portRangeMax: "0", portRangeMin: "12" };
          break;
        case "Protocolunreachable":
          portRange = { portRangeMax: "2", portRangeMin: "3" };
          break;
        case "Portunreachable":
          portRange = { portRangeMax: "3", portRangeMin: "3" };
          break;
        case "Reassemblytimeout":
          portRange = { portRangeMax: "1", portRangeMin: "11" };
          break;
        case "Sourcequench":
          portRange = { portRangeMax: "0", portRangeMin: "4" };
          break;
        case "Sourceroutefailed":
          portRange = { portRangeMax: "5", portRangeMin: "3" };
          break;
        case "Timestampreply":
          portRange = { portRangeMax: "0", portRangeMin: "14" };
          break;
        case "Timestamprequest":
          portRange = { portRangeMax: "0", portRangeMin: "13" };
          break;
        case "TTLexceeded":
          portRange = { portRangeMax: "0", portRangeMin: "11" };
          break;
        default:
          portRange = { portRangeMax: "null", portRangeMin: "null" };
      }
      _this.portRangeMin = portRange.portRangeMin;
      _this.portRangeMax = portRange.portRangeMax;
    },

    validateAll() {
      let props = ["cidrIp"];
      if (this.protocol === "TCP" || this.protocol === "UDP") {
        props.push("portRangeMin", "portRangeMax");
      }
      props.forEach(item => this.validate(item));
      let isInvalid =
        props.some(item => this[`empty${item}`] || this[`invalid${item}`]) ||
        this.invalidcidr;
      return isInvalid;
    },
    createParam: function() {
      let msg = {
        ethertype: this.ethertype,
        direction: this.direction,
        protocol: this.protocol
      };
      if (this.portRangeMax) msg.portRangeMax = this.portRangeMax;
      if (this.portRangeMin) msg.portRangeMin = this.portRangeMin;
      if (this.cidrIp) msg.cidr = this.cidrIp;
      return msg;
    },
    confirm() {
      let _this = this;
      if(_this.validateAll()) return;
      _this.canCreate = false;
      _this.param.ok(_this.createParam())
      .then(() => {
        _this.$emit('close');
      })
      .catch(() => {
        _this.canCreate = true;
      })
    }
  }
};
</script>

<style lang="less" scoped>
.create-sgrule_container {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 999;
}
</style>
