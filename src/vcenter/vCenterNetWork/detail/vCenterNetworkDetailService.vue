<script>
  import vCenterVmTab from 'src/vcenter/vCenterNetWork/components/vCenterVmTab';
  import IpRangesTab from 'src/vcenter/vCenterNetWork/components/IpRangesTab';
  import ClusterTabList from "../../../om/cluster/components/ClusterTabList";
  import AddIpRange from 'src/vcenter/vCenterNetWork/components/AddIpRange';
  import ShareTabList from "../../../ecs/image/component/ShareTabList";
  import vCenterNetworkList from 'src/vcenter/vCenterNetWork/Methods';
  import DnsTab from 'src/vcenter/vCenterNetWork/components/DnsTab';
  import DetailTemplate from 'src/component/DetailTemplate';
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "vCenterNetworkDetailService",
    components: {LogList, ClusterTabList, DetailTemplate, vCenterVmTab, IpRangesTab, DnsTab, ShareTabList, AddIpRange},
    mixins: [WindowBase, vCenterNetworkList],
    data() {
      return {
        currTab: 'info',
        updateMtu: null,
        l3network: {},
        showAddIpRange: false,
        addIpRangeMessage: {}
      }
    },
    created() {
      let dataUuid = this.$route.params.uuid
      this.updateWindow({
        dataUuid,
        currentAccountUuid: window.localStorage.getItem('accountUuid'),
        virtualRouterOfferingUuid: '',
        tagForVirtualRouterOfferingUuid: '',
        networkServiceList: [],
        methods: {
          query: this.query
        }
      })
        .then(() => {
          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
        })
      let update = (key, newValue) => {
        if (this.dbData.l3network[this.windowData.dataUuid][key] === newValue) return
        let self = this
        let event = self.createEvent('l3network.action.updateMtu', this.dbData.l3network[this.windowData.dataUuid].name)
        let param = {}
        param[key] = newValue
        rpc.create(`l3-networks/${self.windowData.dataUuid}/mtu`, param, event)
          .then(resp => {
            let l3network = _.cloneDeep(self.dbData.l3network[self.windowData.dataUuid])
            l3network.mtu = newValue
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'l3network',
              id: self.windowData.dataUuid,
              data: l3network
            })
          }, () => {
            self.incEventFail(event)
          })
      }
      this.updateMtu = _.debounce(update, 100)
    },
    computed: {
      model: {
        get() {
          let self = this;
          return self.l3network && self.l3network;
        },
        set(val) {
          let self = this;
          self.l3network = val;
        }
      },
      _classes(){
        let self = this;
        return {
          'private_network': self.model.category === 'Private',
          'public_network': self.model.category === 'Public',
          'system_network': self.model.category === 'System'
        }
      },
      selectedList(){
        return [this.windowData.dataUuid];
      },
      isSelectedList(){
        let self = this;
        return  [this.windowData.dataUuid].length > 0;
      },
      isSingleSelected(){
        let self = this;
        return  [this.windowData.dataUuid].length > 0;
      },
    },
    methods: {
      ...Utils,
      query() {
        return rpc.query(`l3-networks/${this.windowData.dataUuid}`)
          .then((resp) => {
            let L3NetworkInventories = resp.inventories[0]
            let queryOffering = (virtualRouterOfferingUuid) => {
              return rpc.query(`instance-offerings/${virtualRouterOfferingUuid}`)
                .then((resp) => {
                  return this.updateDbRow({
                    tableName: 'instanceOffering',
                    id: virtualRouterOfferingUuid,
                    data: resp.inventories[0]
                  })
                })
            }
            let getVcenterUuid = () => {
              return rpc.query('system-tags', {
                q: [`resourceUuid?=${L3NetworkInventories.l2NetworkUuid}`, 'resourceType=L2NetworkVO', 'tag~=%25::vcenter::%25']
              }).then((resptags) => {
                let obj = {}
                for (let i = resptags.inventories.length - 1; i >= 0; i--) {
                  if (resptags.inventories[i].resourceUuid === L3NetworkInventories.l2NetworkUuid) {
                    obj.vCenterUuid = resptags.inventories[i].tag.split('::')[2]
                  }
                }
                return this.updateDbRow({
                  tableName: 'l3networkA',
                  id: L3NetworkInventories.uuid,
                  data: obj
                })
              })
            }
            let queryL2network = () => {
              if (this.dbData.common.isAdmin) {
                rpc.query('l2-networks', {
                  q: `uuid=${resp.inventories[0].l2NetworkUuid}`
                }).then((l2resp) => {
                  return this.updateDbRow({
                    tableName: 'l2network',
                    id: resp.inventories[0].l2NetworkUuid,
                    data: l2resp.inventories[0]
                  })
                })
              }
            }
            let queryZone = () => {
              rpc.query(`zones`, {
                q: `uuid=${resp.inventories[0].zoneUuid}`
              })
                .then((zoneResp) => {
                  return this.updateDbRow({
                    tableName: 'zone',
                    id: resp.inventories[0].zoneUuid,
                    data: zoneResp.inventories[0]
                  })
                })
            }
            let querySystemTag = () => {
              return rpc.query('system-tags', {
                q: ['resourceType=InstanceOfferingVO', `tag=guestL3Network::${resp.inventories[0].uuid}`]
              })
                .then((resp) => {
                  if (resp.inventories.length === 0) return
                  this.updateWindow({
                    virtualRouterOfferingUuid: resp.inventories[0].resourceUuid,
                    tagForVirtualRouterOfferingUuid: resp.inventories[0].uuid
                  })
                  return queryOffering(resp.inventories[0].resourceUuid)
                })
            }
            let resourceIsShareToAll = () => {
              if (this.dbData.common.isAdmin) {
                return this.isShareToAll(L3NetworkInventories.uuid)
                  .then((resp) => {
                    L3NetworkInventories.toPublic = resp
                  })
              }
            }
            let getResourceAccount = this.getResourceAccount
            let tasks = [querySystemTag(), queryZone(), queryL2network(), resourceIsShareToAll(), getResourceAccount(), getVcenterUuid()]
            if (this.dbData.common.isAdmin) tasks.push(getVcenterUuid())
            Promise.all(tasks)
              .then(() => {
                resp.inventories.forEach((item) => {
                  if (!this.getNetworkServiceTypeName(item)) return
                  item.networkServiceType = this.getNetworkServiceTypeName(item)
                })
                this.hasPermission()
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: this.windowData.dataUuid,
                  data: L3NetworkInventories
                }).then(() => {
                  this.model = _.get(this.dbData.l3network, this.windowData.dataUuid);
                })
              })
          })
      },

      isShareToAll(uuid) {
        return rpc.query('accounts/resources', {
          q: `resourceUuid=${uuid}`
        })
          .then((resp) => {
            let toPublic = false
            resp.inventories.forEach((item) => {
              if (item.toPublic) toPublic = true
            })
            return toPublic
          })
      },

      hasPermission() {
        let hasPermission = this.dbData.common.isAdmin || this.dbData.account[this.windowData.dataUuid] && (this.dbData.account[this.windowData.dataUuid].uuid === this.windowData.currentAccountUuid)
        this.updateWindow({hasPermission})
      },

      getResourceAccount() {
        let self = this
        return rpc.query(`resources/accounts`, {
          resourceUuids: [self.windowData.dataUuid]
        }).then((resp) => {
          return self.updateDbRow({
            tableName: 'account',
            id: self.windowData.dataUuid,
            data: resp.inventories[self.windowData.dataUuid]
          })
        })
      },

      getNetworkServiceTypeName(l3network) {
        if (l3network.networkServices.length === 0) return false
        let networkServices = l3network.networkServices.filter((item) => item.networkServiceType !== 'SecurityGroup')
        if (networkServices.length === 0) return false
        let networkServiceProviderUuid = null
        networkServices.forEach(function (item) {
          ((item) => {
            if (item.networkServiceType === 'Eip') networkServiceProviderUuid = item.networkServiceProviderUuid
          })(item)
        })
        if (this.dbData.networkServiceType[networkServiceProviderUuid]) {
          return this.dbData.networkServiceType[networkServiceProviderUuid].type
        }
        return ''
      },

      updateResourceParam(param) {
        let self = this;
        return {
          getValue() {
            return self.model[param]
          },
          setValue(newVal) {
            if (newVal !== self.model[param]) {
              self.updateResource('l3-networks', 'updateL3Network', param, 'l3network', newVal, self.query)
            }
          }
        }
      },

      getNetworkService(_networkservices) {
        let networkservices = _.cloneDeep(_networkservices)
        if (networkservices)
          return networkservices.sort((a, b) => a.networkServiceType > b.networkServiceType)
      },

      getVenterName(uuid) {
        let value = '', self = this;
        try {
          value = self.dbData.vCenter[uuid].name;
        } catch (e) {
          if(Utils.checkBounce(`getVCenter-${uuid}`)) return;
          rpc.query(`vcenters`, {q: [`uuid=${uuid}`]})
            .then((resp) => {
              self.updateDbRow({
                tableName: 'vCenter',
                id: uuid,
                data: resp.inventories[0]
              })
            })
        }
        return value;
      },

      detailShareVCenterNetworkToAll() {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning:  'instanceOffering.shareToAllText',
            ok: () => {
              this.shareVpcNetworkToAll(uuidList)
                .then(() => {
                  this.query();
                })
            }
          })
        }
      },

      detailRecallVCenterNetworkFromAll () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning:  'account.recall',
            ok: () => {
              this.recallFromAll(uuidList)
                .then(() => {
                  this.query();
                })
            }
          })
        }
      },

      detailDelete(){
        let self = this;
        self.openDialog('ConfirmDlg', {
          title:'vCenterNetwork.delete',
          description: 'vCenterNetwork.confirm.delete',
          icon: 'l2_popupico',
          uuidList: self.selectedList,
          getName(uuid){
            return self.dbData.l3network[uuid].name;
          },
          warning: 'vCenterNetwork.confirm.warning',
          ok(){
            self.delete(self.selectedList, self.query)
          }
        })
      },

      openDetailAddIpRange(){
        let self  = this;
        self.addIpRangeMessage= {
          uuid: self.selectedList[0],
          ok(params){
            self.addIpRange(self.selectedList[0], params);
          }
        }
        self.showAddIpRange = true;
      },

      openDetailAddDns(){
        let self = this;
        let selectedUuidList = self.selectedList
        self.openDialog('AddDNSDlg', {
          ok: (dns) => self.addDnsToL3Network(selectedUuidList[0], dns)
        })
      },

      createIpRange(){
        let self  = this;
        self.addIpRangeMessage= {
          uuid: self.selectedList[0],
          dhcpDisabled: true,
          ok(params){
            self.addIpRange(self.selectedList[0], params);
          }
        }
        self.showAddIpRange = true;
      }
    },
  }
</script>
