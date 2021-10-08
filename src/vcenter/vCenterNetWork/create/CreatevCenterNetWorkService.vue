<script>
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import CreateTemplate from 'src/component/CreateTemplate';
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreatevCenterNetWorkService",
    components: {AddOrDeleteInput, CreateTemplate},
    mixins: [WindowBase, Methods],
    data(){
      return {
        showNetworkType: true,
        name: '',
        emptyname: false,
        description: '',
        l2type: 'L2NoVlanNetwork',
        vlan: '',
        emptyvlan: false,
        physicalInterface: '',
        emptyphysicalInterface: false,
        clusterUuid: '',
        emptyclusterUuid: false,
        networkType: 'Flat',
        DHCP: true,
        showMethod: true,
        startIp: '',
        emptystartIp: false,
        invaldstartIp: false,
        endIp: '',
        emptyendIp: false,
        invaldendIp: false,
        netmask: '',
        emptynetmask: false,
        invalidnetmask: false,
        gateway: '',
        emptygateway: false,
        invalidgateway: false,
        dns: '',
        invaliddns: false,
        cidr: '',
        emptycidr: false,
        invalidcidr: false,
        emptyvirtualRouterOfferingUuid: false,
        virtualRouterOfferingUuid: ''
      }
    },

    created(){
      let self = this;
      self.queryL3Network()
        .then(() => {
          self.queryNetworkServices()
            .then(() => {
              let flatNetwork = {}
              let vRouterNetwork = {}
              let networkServiceType = _.cloneDeep(this.dbData.networkServiceType)
              for (let uuid in networkServiceType) {
                if (networkServiceType[uuid].type === 'SecurityGroup') {
                  flatNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
                  vRouterNetwork[uuid] = networkServiceType[uuid].networkServiceTypes
                  this.updateWindow({ flatNetwork, vRouterNetwork })
                }
                if (networkServiceType[uuid].type === 'vrouter') {
                  vRouterNetwork[uuid] = ['IPsec', 'DNS', 'SNAT', 'LoadBalancer', 'PortForwarding', 'Eip', 'DHCP']
                  this.updateWindow({ vRouterNetwork })
                }
              }
            })
        })
    },

    methods: {
      ...Validator,
      queryL3Network: function () {
        let l2networkList = []
        return rpc.query('l3-networks', {
          fields: 'l2NetworkUuid'
        }).then((resp) => {
          l2networkList = resp.inventories.map((item) => item.l2NetworkUuid)
          this.updateWindow({ l2networkList })
          console.log(resp)
        })
      },

      queryNetworkServices () {
        return rpc.query(`network-services/providers`, {
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'networkServiceType',
            list: resp.inventories
          })
        })
      },

      validate(name){
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'startIp', 'endIp', 'netmask', 'gateway', 'dns', 'cidr', 'physicalInterface']
        let input = propToBeTrimed.indexOf(name) > -1 ? self.trimProp(name) : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        let IPs = ['startIp', 'endIp', 'netmask', 'gateway', 'dns']
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
          // if (!obj[`invalid${name}`] && ['startIp', 'endIp'].indexOf(name) > -1) {
          //   obj.invalidstartIp = false
          //   obj.invalidendIp = false
          // }
          if (name === 'netmask' && !self.isValidNetMask(input)) {
            self[`invalid${name}`] = true
          }
        }
        if (name === 'cidr') {
          if (!self.isCidr(input)) {
            self[`invalid${name}`] = true
          }
        }
      },

      validateAll () {
        let self = this ,invalidInput = false;
        let props = ['name']
        if (self.showMethod) {
          props = props.concat(['startIp', 'endIp', 'netmask', 'gateway', 'physicalInterface'])
        } else {
          props.push('cidr')
        }
        if (this.dbData.common.isAdmin && !this.showNetworkType) {
          if (!self.showNetworkType && self.networkType === 'vrouter') {
            props.push('virtualRouterOfferingUuid')
          }
        }
        if (this.dns) {
          props.push('dns')
        }
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => {
          return self[`empty${item}`] || self[`invalid${item}`]
        })
        if (isInvalid) invalidInput = true
        if (!self.showMethod && self.invalidipRange) invalidInput = true
        return invalidInput;
      },

      trimProp(name){
        let self = this;
        return String(self[name]).trim();
      },

      openClusterSelect(){
        let self = this;
        self.openDialog('ClusterSelectListDlg', {
          conditions: ['type=vmware', 'state=Enabled'],
          type: 'radio',
          select: (uuid) => this.selectCluster(uuid)
        })
      },

      selectCluster(uuid){
        let self = this;
        self.clusterUuid = uuid;
        self.validate('clusterUuid');
      },

      removeUuid(uuid){
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      },

      openVirturalRouterOfferingSelect(){
        const self = this
        self.openDialog('VirtualRouterInstanceOfferingListSingleSelectDlg', {
          conditions: ['state=Enabled', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'image.format=vmtx'],
          select: (uuid) => {
            self.selectVRO(uuid)
          }
        })
      },

      selectVRO (uuid) {
        let self = this;
        self.virtualRouterOfferingUuid = uuid;
        self.validate('virtualRouterOfferingUuid')
      },

      createParam() {
        let networkServices = {}, self = this;
        if (!self.showNetworkType) { // vrouter Network
          networkServices = _.cloneDeep(self.windowData.vRouterNetwork)
          if (self.networkType !== 'vrouter') { // Flat Network
            networkServices = undefined
          }
        }
        let hash = {
          'L2NoVlanNetwork': 'no-vlan',
          'L2VlanNetwork': 'vlan'
        }
        let param = {
          showNetworkType: self.showNetworkType,
          name: self.name,
          l2type: hash[self.l2type],
          vlan: self.vlan === '' ? undefined :self.vlan,
          physicalInterface: self.physicalInterface,
          zoneUuid: `${window.localStorage.getItem('currZoneUuid')}`,
          clusterUuid: self.clusterUuid,
          type: 'L3BasicNetwork',
          l2NetworkUuid: self.l2NetworkUuid,
          // system: this.windowData.showNetworkType, // true or false
          category:self.showNetworkType ? 'Public' : 'Private',
          startIp: self.startIp,
          endIp: self.endIp,
          netmask: self.netmask,
          gateway: self.gateway,
          dns: self.dns,
          cidr: self.cidr,
          ipRangeOrcidr: !self.showMethod,
          networkServices: networkServices,
          virtualRouterOfferingUuid: self.virtualRouterOfferingUuid
        }
        return param
      },

      confirm() {
        let self = this;
        let invalidInput = self.validateAll()
        if (invalidInput) return
        this.create(this.createParam())
        self.$router.push({name: 'vcenternetwork'});
      }
    }
  }
</script>
