<script>
  import CreateNoRouteTemplate from 'src/component/CreateTemplateNoRoute';
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';

  export default {
    name: "AddIpRangeService",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    components: {CreateNoRouteTemplate},
    data() {
      return {
        uuid: '',
        ipVersion: '',
        showMethod: true,
        startIp: '',
        emptystartIp: false,
        invalidstartIp: false,
        endIp: '',
        emptyendIp: false,
        invalidendIp: false,
        gateway: '',
        emptygateway: false,
        invalidgateway: false,
        netmask: '',
        emptynetmask: false,
        invalidnetmask: false,
        dhcp: '',
        cidr: '',
        emptycidr: false,
        invalidcidr: false,
        invalidipRange: false
      }
    },
    created() {
      let self = this;
      self.uuid = self.param.uuid ? self.param.uuid : '';
      self.ipVersion = self.dbData.l3network[self.uuid].ipVersion;
    },
    methods: {
      ...Validator,

      confirm() {
        let self = this;
        let invalid = self.validateAll()
        if (invalid) return
        self.param.ok(this.createParam())
        self.$emit('close');
      },

      createParam () {
        let self = this;
        return {
          showMethod: !self.showMethod,
          startIp: self.startIp,
          endIp: self.endIp,
          netmask: self.netmask,
          gateway: self.gateway,
          networkCidr: self.cidr
        }
      },

      validate(name) {
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['startIp', 'endIp', 'netmask', 'gateway', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? self.trimProp(name) : self[name]
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
        if (name === 'cidr') {
          if (!this.isCidr(input)) {
            self[`invalid${name}`] = true
          }
        }
      },

      trimProp(name) {
        let self = this;
        return String(self[name]).trim();
      },

      validateAll() {
        let self = this, invalidInput = false;
        let props
        if (!self.showMethod) {
          props = ['cidr']
        } else {
          props = ['startIp', 'endIp', 'netmask', 'gateway']
        }
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => {
          return self[`empty${item}`] || self[`invalid${item}`]
        })
        if (isInvalid) invalidInput = true
        if (self.showMethod && self.invalidipRange) invalidInput = true;
        return invalidInput;
      },
    }
  }
</script>

