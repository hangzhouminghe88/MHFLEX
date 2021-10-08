<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window'
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';

  export default {
    name: "ResourceFromStackTabService",
    mixins: [WindowBase, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    created: function () {
      let dataUuid = this.param.uuid
      this.updateWindow({
        dataUuid
      }).then(() => this.init())
    },
    destroyed: function () {
    },
    updated: function () {
    },
    mounted() {
    },
    data() {
      return {
        allTypeResources: [],
        columns: [
          {name: "resourcestack.type", width: 'auto'},
          {name: "resourcestack.name", width: 'auto'},
          {name: ' common.createDate', width: 'auto'}
        ]
      }
    },
    methods: {
      getResourceMap: function (item) {
        let getL3NetworkDetail = (l3NetworkType) => {
          let obj = {
            'L3BasicNetwork': 'L3Network',
            'L3VpcNetwork': 'VpcNetwork'
          }
          return obj[l3NetworkType]
        }
        let obj = {
          'VmInstance': {
            name: 'common.vm',
            path: 'VmInstance'
          },
          'DataVolume': {
            name: 'common.volume',
            path: 'Volume'
          },
          'L3Network': {
            name: 'common.l3network',
            path: getL3NetworkDetail(item.type)
          },
          'L2VxlanNetworkPool': {
            name: 'common.l2network',
            path: 'L2Network'
          },
          'L2NoVlanNetwork': {
            name: 'common.l2network',
            path: 'L2Network'
          },
          'L2VlanNetwork': {
            name: 'common.l2network',
            path: 'L2Network'
          },
          'L2VxlanNetwork': {
            name: 'common.l2network',
            path: 'L2Network'
          },
          'VpcVRouter': {
            name: 'common.vpcVRouter',
            path: 'VpcVRouter'
          },
          'SecurityGroup': {
            name: 'common.securitygroup',
            path: 'SecurityGroup'
          },
          'Vip': {
            name: 'common.vip',
            path: 'Vip'
          },
          'Eip': {
            name: 'common.eip',
            path: 'Eip'
          },
          'PortForwardingRule': {
            name: 'common.portForwarding',
            path: 'PortForwarding'
          },
          'LoadBalancer': {
            name: 'common.loadBalancer',
            path: 'LoadBalancer'
          },
          'LoadBalancerListener': {
            name: 'common.listener',
            path: 'LoadBalancerListener'
          },
          'SecurityGroupRule': {
            name: 'common.securityGroupRule',
            path: ''
          }
        }
        return obj
      },
      getResourceType: function (item, type) {
        let map = this.getResourceMap(item)
        let name = this.$t(map[type].name)
        return name
      },
      getResourceDetailPath: function (item, type) {
        let map = this.getResourceMap(item)
        return map[type].path
      },
      openResourceDetail: function (item, type) {
        let resourceUuid = item.uuid
        let path = this.getResourceDetailPath(item, type)
        if (path === '') return
        let fullPath = `detail${path}`
        this.$router.push({name: fullPath, params: {uuid: resourceUuid}})
      },
      resource2Detail: function (resourceType) {
        let detail = ''
        return detail
      },
      format: function (resources) {
        let allTypes = [
          'VmInstance',
          'DataVolume',
          'L3Network',
          'L2VxlanNetworkPool',
          'L2NoVlanNetwork',
          'L2VlanNetwork',
          'L2VxlanNetwork',
          'VpcVRouter',
          'SecurityGroup',
          'Vip',
          'Eip',
          'PortForwardingRule',
          'LoadBalancer',
          'LoadBalancerListener',
          'SecurityGroupRule'
        ]
        let obj = {}
        resources.forEach(item => {
          let keys = Object.keys(item)
          keys.forEach(key => {
            let _key = key
            if (key === 'VirtualRouterVm' && item[key].applianceVmType && item[key].applianceVmType === 'vpcvrouter') {
              _key = 'VpcVRouter'
            }
            if (!obj[_key]) obj[_key] = []
            obj[_key].push(item[key])
          })
        })
        let allTypeResources = allTypes
          .filter(item => !!obj[item])
          .map(item => {
            return {
              type: item,
              resources: obj[item]
            }
          })
        return allTypeResources
      },
      init: function () {
        const self = this
        return rpc.query(`cloudformation/stack/resources?uuid=${self.windowData.dataUuid}`)
          .then((resp) => {
            if (resp.resources && resp.resources.length === 0) return
            let resourceFromResourceStack = resp.resources
            self.allTypeResources = self.format(resourceFromResourceStack)
          })
      },
      ...Utils
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            dataUuid: this.param && this.param.uuid
          }).then(() => this.init())
        }
      }
    }
  }
</script>

<style scoped>

</style>
