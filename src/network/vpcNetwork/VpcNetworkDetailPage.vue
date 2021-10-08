<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">VPC网络详情</span>
      <span @click="$router.push({name:'vpcnetwork'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到VPC网络列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t("vpcNetwork.actions")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-addIpRange" style="padding-top: 12px;"
                           v-permission.or="['L3_IP-RANGE.ADD', 'L3_IP-RANGE_CIDR.ADD']" @click="pageAddIpRange()">{{ $t("common.addIpRange") }}</a>
                        <a id="vpcNetwork-attachVpcNetworkToVpcVRouter" v-permission="'VM_L3.ATTACH'"
                           @click="!getVpcVRouterUuid() && pageAttachVpcNetworkToVpcVRouter()"
                           :class="{ 'disabled-text': getVpcVRouterUuid()}">{{ $t("vpcNetwork.attachVpcNetworkToVpcVRouter") }}</a>
                        <a id="vpcNetwork-detachVpcNetworkFromVpcVRouter" v-permission="'VM_L3.DETACH'"
                           @click="getVpcVRouterUuid() && pageDetachVpcNetworkFromVpcVRouter()"
                           :class="{ 'disabled-text': !getVpcVRouterUuid()}">{{ $t("vpcNetwork.detachVpcNetworkFromVpcVRouter") }}</a>
                        <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'"
                           @click="!model.toPublic && pageShareVpcNetworkToAll()"
                           :class="{ 'disabled-text': model && model.toPublic}" v-if="dbData.common.isAdmin">{{$t("common.shareToAll")}}</a>
                        <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'"
                           @click="model.toPublic && pageRecallVpcNetworkFromAll()"
                           :class="{ 'disabled-text': model && !model.toPublic}" v-if="dbData.common.isAdmin">{{$t("common.recallFromAll")}}</a>
                        <a id="common-destroy" style="padding-bottom: 12px;" v-permission="'L3.DELETE'"
                           :class="{'disabled-text':!canDelete(windowData.dataUuid)}"
                           @click="canDelete(windowData.dataUuid) && pageDelete()">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.vm')" name="vm" v-if="model && !model.system"></el-tab-pane>
        <el-tab-pane :label="$t('common.netRange')" name="ipRanges"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.share')" name="share"
                     v-if="dbData.common.isAdmin"></el-tab-pane>
        <el-tab-pane v-permission="'MONITORING'" :label="$t('vm.monitor')" name="monitor"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('vm.monitoralarm')"
                     name="monitoralarm"></el-tab-pane>
        <el-tab-pane v-if="hasPermission()" v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')"
                     name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="vpc_network_ico"/>
          <div class="after-icon">

          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>

          <detail-row :param="{
                    title: 'MTU',
                    content: model && getL3NetworkMtu(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: model &&  getResourceOwner(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: 'DHCP IP',
                    content: model && model.dhcpip
                  }"/>

          <detail-row :param="{
                    title: $t('l3network.routerInterfaceIp'),
                    content: model && getL3NetworkRouterInterfaceIp(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: $t('common.shareToAll'),
                    content: model && $t(`common.${model.toPublic}`)
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: model && model.createDate &&  formatDatetime(new Date(model.createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content:  model && model.lastOpDate &&  formatDatetime(new Date(model.lastOpDate))
                  }"/>
          <div class="detail-splitter"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row :param="{
                title: 'common.uuid',
                content: windowData.dataUuid,
                copy: true
              }"/>
        <detail-row :param="{
                title: 'common.l2network',
                content: model && dbData.l2network[model.l2NetworkUuid] && dbData.l2network[model.l2NetworkUuid].name,
                handler: () => {
                  $router.push({name:'detaill2network', params: {uuid: model.l2NetworkUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'common.vpcVRouter',
                content: getVpcVRouterUuid() && dbData.vm[getVpcVRouterUuid()] && dbData.vm[getVpcVRouterUuid()].name,
                  handler: () => {
                  $router.push({name:'detailVpcVRouter', params: {uuid: getVpcVRouterUuid()}})
                }
              }"/>
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vm' && !model.system">
      <vpc-network-vm-tab-list
        :param="{conditions: [`vmNics.l3NetworkUuid=${windowData.dataUuid}`, 'state!=Destroyed', 'type=UserVm'], uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'ipRanges'">
      <ipRange-tab-list :assigned-id="tablistAssignedUuid.ipRanges"
                        :param="{conditions: `l3Network.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, refresh: query, addIpRange: pageAddIpRange}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'share'">
      <account-tab-list
        :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'l3network'}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <l3network-monitor :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitoralarm'">
      <zwatch-alarm-tab-list-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'l3network' }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <add-ip-range v-if="showIpRangeDlg" :param="ipRangeParam" @close="showIpRangeDlg = false;"/>
    </div>
  </detail-template>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  import PageTemplate from "../../component/PageTemplate";
  import DetailTemplate from "../../component/DetailTemplate";
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import LogList from "../../component/LogList";
  import DetailInfoState from "../../component/DetailInfoState";
  import DetailLongContent from "../../main-component/DetailLongContent";

  import VpcNetworkVmInstanceTabList from "./component/VmTabList";
  import VpcNetworkipRangesTabList from 'src/network/l3network/component/IpRangeTabList'
  import AccountTabList from "src/om/account/component/ShareTabList";
  import ZWatchAlarmTabListForResource from "src/om/zwatchalarm/TabListForResource";
  import L3networkMonitor from "src/network/l3network/component/Monitor";
  import AddIpRange from "../l2network/component/AddIpRangePage";

  export default {
    name: "VpcNetworkDetail",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddIpRange,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      'vpc-network-vm-tab-list': VpcNetworkVmInstanceTabList,
      'ipRange-tab-list': VpcNetworkipRangesTabList,
      AccountTabList,
      L3networkMonitor,
      'zwatch-alarm-tab-list-for-resource': ZWatchAlarmTabListForResource,
    },
    created() {
      window.addEventListener('click', this.onWindowClick)
      this.TablistAssignedInit('dns', 'ipRanges')
      let dataUuid = dataUuid = this.$route.params ? this.$route.params.uuid : ''
      this.updateWindow({
        dataUuid,
        currentAccountUuid: window.localStorage.getItem('accountUuid'),
        currTab: 'info',
        dHCPServer: false,
        vpcVRouterUuid: '',
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
    mounted() {

    },
    computed: {
      model: {
        get() {
          let self = this;
          if (self.l3network) {
            return self.l3network;
          }
        },

        set(val) {
          let self = this;
          self.l3network = val;
        }
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'dbData.l3network': function (conditions, oldConditions) {
        setTimeout(this.resizeHeader, 0)
      },
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({
          dataUuid: this.param.uuid,
          virtualRouterOfferingUuid: '',
          tagForVirtualRouterOfferingUuid: '',
          networkServiceList: []
        })
          .then(() => {
            this.query()
          })
        this.destroyDialogs()
      }
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        editMtuNum: false,
        newMtuNum: '',
        newName: '',
        editDescription: false,
        newDescription: '',
        updateMtu: null,
        l3network: null,
        showIpRangeDlg: false,
        ipRangeParam: {}
      }
    },
    methods: {
      ...Utils,
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.l3network[this.windowData.dataUuid]) {
              return this.dbData.l3network[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('l3-networks', 'updateL3Network', 'name', 'l3network', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.l3network[self.windowData.dataUuid]) {
              return this.dbData.l3network[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('l3-networks', 'updateL3Network', 'description', 'l3network', value)
          }
        }
      },
      getVpcVRouterUuid: function () {
        let self = this;
        if (self.model)
          return _.get(this.dbData, `l3network.${this.windowData.dataUuid}.vpcVRouterUuid`)
      },
      query: function () {
        let self = this;
        return rpc.query(`l3-networks/${self.windowData.dataUuid}`)
          .then((resp) => {
            let L3NetworkInventories = resp.inventories[0]
            let tasks = []
            let p = null
            let queryOffering = (virtualRouterOfferingUuid) => {
              return rpc.query(`instance-offerings/${virtualRouterOfferingUuid}`)
                .then((resp) => {
                  return self.updateDbRow({
                    tableName: 'instanceOffering',
                    id: virtualRouterOfferingUuid,
                    data: resp.inventories[0]
                  })
                })
            }
            let actionPath = 'l2-networks'
            if (!self.dbData.common.isAdmin) {
              actionPath = 'l2-networks/vxlan'
            }
            p = rpc.getResourceAccount([self.windowData.dataUuid], self)
            tasks.push(p)
            p = rpc.query(actionPath, {
              q: `uuid=${resp.inventories[0].l2NetworkUuid}`
            }).then((l2resp) => {
              return this.updateDbRow({
                tableName: 'l2network',
                id: resp.inventories[0].l2NetworkUuid,
                data: l2resp.inventories[0]
              })
            })
            tasks.push(p)
            p = rpc.query(`zones`, {
              q: `uuid=${resp.inventories[0].zoneUuid}`
            })
              .then((zoneResp) => {
                return self.updateDbRow({
                  tableName: 'zone',
                  id: resp.inventories[0].zoneUuid,
                  data: zoneResp.inventories[0]
                })
              })
            tasks.push(p)
            p = rpc.query('system-tags', {
              q: ['resourceType=InstanceOfferingVO', `tag=guestL3Network::${resp.inventories[0].uuid}`]
            })
              .then((resp) => {
                if (resp.inventories.length === 0) return
                self.updateWindow({
                  virtualRouterOfferingUuid: resp.inventories[0].resourceUuid,
                  tagForVirtualRouterOfferingUuid: resp.inventories[0].uuid
                })
                return queryOffering(resp.inventories[0].resourceUuid)
              })
            tasks.push(p)
            p = rpc.query(`system-tags`, {q: `resourceUuid=${self.windowData.dataUuid}`}).then(dhcpipResp => {
              let dhcpip = ''
              dhcpipResp.inventories.forEach(item => {
                if (item.tag.indexOf('DhcpServer::') > -1) {
                  dhcpip = item.tag.split('::')[2]
                }
              })
              L3NetworkInventories.dhcpip = dhcpip.replace(/--/, '::')
            })
            tasks.push(p)
            p = rpc.query(`resources/accounts`, {
              resourceUuids: [self.windowData.dataUuid]
            }).then((resp) => {
              L3NetworkInventories.accountUuid = resp.inventories[this.windowData.dataUuid].uuid
              if (this.dbData.common.isAdmin) {
                rpc.query(`accounts/${resp.inventories[this.windowData.dataUuid].uuid}`)
                  .then((resp) => {
                    self.updateDbRow({
                      tableName: 'account',
                      id: resp.inventories[0].uuid,
                      data: resp.inventories[0]
                    })
                  })
              }
            })
            tasks.push(p)
            p = rpc.query(`l3-networks/${self.windowData.dataUuid}`, {
              q: 'networkServices.networkServiceType=DHCP'
            })
              .then((resp) => {
                if (resp.inventories.length > 0) {
                  self.updateWindow({dHCPServer: true})
                } else {
                  self.updateWindow({dHCPServer: false})
                }
              })
            tasks.push(p)
            p = rpc.query('vm-instances/appliances/virtual-routers', {
              q: [`vmNics.l3Network.uuid=${self.windowData.dataUuid}`, 'applianceVmType=vpcvrouter']
            }).then((resp) => {
              let l3network = _.cloneDeep(L3NetworkInventories)
              if (resp.inventories.length > 0) {
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
                l3network.vpcVRouterUuid = resp.inventories[0].uuid
              } else {
                l3network.vpcVRouterUuid = ''
              }
              return self.forceUpdateDbRow({
                tableName: 'l3network',
                id: self.windowData.dataUuid,
                data: l3network
              })
            })
            tasks.push(p)
            if (this.dbData.common.isAdmin) {
              p = this.isShareToAll(L3NetworkInventories.uuid)
                .then((resp) => {
                  L3NetworkInventories.toPublic = resp
                })
              tasks.push(p)
            }
            tasks.push(this.hasAttachedVm())
            return Promise.all(tasks)
              .then(() => {
                resp.inventories.forEach((item) => {
                  if (!this.getNetworkServiceTypeName(item)) return
                  item.networkServiceType = this.getNetworkServiceTypeName(item)
                })
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: this.windowData.dataUuid,
                  data: L3NetworkInventories
                }).then(() => {
                  this.model = _.get(this.dbData.l3network, this.windowData.dataUuid)
                })
              })
          })
      },
      hasAttachedVm: function () {
        return rpc.query('vm-instances', {
          q: ['type=UserVm', `vmNics.l3NetworkUuid=${this.windowData.dataUuid}`]
        }).then((resp) => {
          let has = resp.inventories.length > 0
          // let l3network = _.cloneDeep(this.dbData.l3network[this.windowData.dataUuid])
          return this.updateDbRow({
            tableName: 'l3network',
            id: this.windowData.dataUuid,
            data: {
              hasAttachedVm: has
            }
          })
        })
      },
      hasPermission: function () {
        let hasPermission = this.dbData.common.isAdmin || this.dbData.l3network[this.windowData.dataUuid] && this.dbData.l3network[this.windowData.dataUuid].accountUuid === this.windowData.currentAccountUuid
        return hasPermission
      },
      getNetworkService: function (_networkservices) {
        let networkservices = _.cloneDeep(_networkservices)
        return networkservices.sort((a, b) => a.networkServiceType > b.networkServiceType)
      },
      getNetworkServiceTypeName: function (l3network) {
        const self = this
        if (l3network.networkServices.length === 0) return false
        let networkServices = l3network.networkServices.filter((item) => item.networkServiceType !== 'SecurityGroup')
        if (networkServices.length === 0) return false
        let networkServiceProviderUuid = null
        let flag = false // true = vrouter
        let type = ''
        networkServices.forEach(function (item) {
          ((item) => {
            networkServiceProviderUuid = item.networkServiceProviderUuid
            if (self.dbData.networkServiceType[networkServiceProviderUuid]) {
              if (self.dbData.networkServiceType[networkServiceProviderUuid].type === 'vrouter' || self.dbData.networkServiceType[networkServiceProviderUuid].type === 'VirtualRouter') {
                flag = true
                type = 'vrouter'
              }
              if (self.dbData.networkServiceType[networkServiceProviderUuid].type === 'Flat') {
                type = 'Flat'
              }
            }
          })(item)
        })
        if (flag) {
          return 'vrouter'
        } else {
          return type
        }
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({currTab: tabName})
        }
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      pageAddIpRange: function (fn) {
        let self = this;
        self.ipRangeParam = {
          uuid: self.windowData.dataUuid,
          isHideCidr: this.dbData.l3network[self.windowData.dataUuid].ipRanges.length > 0,
          ok: (params) => {
            this.addIpRange(this.windowData.dataUuid, params, fn)
          }
        }
        self.showIpRangeDlg = true;
      },
      pageAddDns: function () {
        let self = this
        self.openDialog('AddDNSDlg', {
          ok: (dns) => self.addDnsToL3Network(self.windowData.dataUuid, dns).then(() => self.refreshChild(self.tablistAssignedUuid.dns))
        })
      },
      pageRecallVpcNetworkFromAll: function () {
        this.openDialog('ConfirmDlg', {
          title: 'common.recallFromAll',
          description: 'account.recall',
          uuidList: [this.windowData.dataUuid],
          icon: 'vm_plain',
          ok: () => {
            this.recallFromAll([this.windowData.dataUuid]).then(() => {
              this.query();
            })
          },
          getName: (uuid) => {
            return this.dbData.l3network[uuid].name;
          }
        })
      },
      pageShareVpcNetworkToAll: function () {
        this.openDialog('ConfirmDlg', {
          title: 'common.shareToAll',
          uuidList: [this.windowData.dataUuid],
          description: 'instanceOffering.shareToAllText',
          icon: 'vm_plain',
          ok: () => {
            this.shareVpcNetworkToAll([this.windowData.dataUuid])
              .then(() => {
                this.query();
              })
          },
          getName: (uuid) => {
            return this.dbData.l3network[uuid].name;
          }
        })
      },
      pageAttachVpcNetworkToVpcVRouter: function () {
        const self = this
        // let vpcNetworkUuidList = []
        // let taskList = []
        // let p = rpc.query(`vm-instances/${vpcVRouterUuid}/l3-networks-candidates`, {
        // }).then((resp) => {
        //   vpcNetworkUuidList = vpcNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
        // })
        // taskList.push(p)
        // Promise.all(taskList)
        // .then(() => {
        let conditions = ['state=Running']
        let l2NetworkUuid = this.dbData.l3network[self.windowData.dataUuid].l2NetworkUuid
        let clusterUuidList = this.dbData.l2network[l2NetworkUuid] ? this.dbData.l2network[l2NetworkUuid].attachedClusterUuids : []
        if (clusterUuidList.length > 0) conditions.push(`cluster.uuid?=${clusterUuidList}`)
        self.openDialog('VpcVRouterSingleSelectListDlg', {
          conditions: conditions,
          select: (vpcVRouterUuid) => self.attachVpcNetworkToVpcVRouter([self.windowData.dataUuid], vpcVRouterUuid).then(() => this.query())
        })
      },
      pageDetachVpcNetworkFromVpcVRouter: function () {
        let self = this
        if (self.dbData.l3network[self.windowData.dataUuid].hasAttachedVm) {
          this.openDialog('ConfirmDlg', {
            title: 'vpcNetwork.detachVpcVRouter',
            description: 'vpcNetwork.detachVpcVRouterConfirm',
            uuidList: [self.dbData.l3network[self.windowData.dataUuid].vpcVRouterUuid],
            icon: 'vpc_vrouter_popupico',
            warning: 'vpcNetwork.detachVpcNetworkFromVpcVRouterWarning',
            getName: (uuid) => {
              return self.dbData.vm[uuid].name;
            }
          })
        } else {
          rpc.query('vm-instances/nics', {
            q: `l3Network.uuid=${self.windowData.dataUuid}`
          }).then((resp) => {
            let vmNicUuidList = resp.inventories.map(it => it.uuid)
            this.openConfirmDialog({
              title: 'vpcNetwork.detachVpcVRouter',
              desc: 'vpcNetwork.detachVpcVRouterConfirm',
              uuidList: [self.dbData.l3network[self.windowData.dataUuid].vpcVRouterUuid],
              icon: 'vpc_vrouter_popupico',
              ok: () => {
                self.detachVpcNetworkFromVpcVRouter(vmNicUuidList)
                  .then(() => {
                    self.query()
                  })
              },
              tableName: 'vm'
            })
          })
        }
      },
      pageDeleteIpRange: function () {
        let self = this
        this.detailOpenInplaceDialog('IPRangeListConfirmDlg', this.windowData.dataUuid, (uuidList) => this.deleteIpRange(uuidList))
      },
      addIpRange: function (l3NetworkUuid, params, fn) {
        let event = this.createEvent('l3network.action.addIpRange', this.dbData.l3network[l3NetworkUuid].name)
        if (!params.showMethod) {
          return rpc.create(`l3-networks/${l3NetworkUuid}/ip-ranges`, {
            'name': this.dbData.l3network[l3NetworkUuid].name,
            'startIp': params.startIp,
            'endIp': params.endIp,
            'netmask': params.netmask,
            'gateway': params.gateway,
            systemTags: params.systemTags
          }, event).then((resp) => {
            this.getIpAddressCapacity(l3NetworkUuid)
            this.incEventSuccess(event)
            if (fn) fn();
          }, () => this.incEventFail(event))
        } else {
          return this.addIpRangeByNetworkCidr(l3NetworkUuid, params, event)
        }
      },
      pageDeleteDns: function () {
        this.detailOpenInplaceDialog('DnsListConfirmDlg', this.windowData.dataUuid, (dnsList) => this.removeDnsFromL3Network(this.windowData.dataUuid, dnsList))
      },
      removeDnsFromL3Network: function (l3NetworkUuid, dnsList) {
        let event = this.createEvent('l3network.action.deleteDns', this.dbData.l3network[l3NetworkUuid].name)
        const self = this
        dnsList.forEach(function (dns) {
          ((dns) => {
            rpc._delete(`l3-networks/${l3NetworkUuid}/dns/${dns}`, null, event)
              .then((resp) => {
                self.query()
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(dns)
        })
      },
      pageDelete: function () {
        const self = this
        self.openDialog('ConfirmDlg', {
          title: 'vpcNetwork.delete',
          description: 'vpcNetwork.deleteConfirm',
          icon: 'vpc_network_popupico',
          uuidList: [self.windowData.dataUuid],
          ok: () => {
            return self.delete([self.windowData.dataUuid]).then(() => self.$router.push({name: 'vpcnetwork'}))
          },
          tableName: 'l3network',
          warning: 'l3network.info.vpcNetworkDeleteWarning',
          getName: (uuid) => {
            return self.dbData.l3network[uuid].name;
          }
        })
      },
      pageStart: function () {
        this.start([this.windowData.dataUuid])
      },
      pageStop: function () {
        this.stop([this.windowData.dataUuid])
      }
    }
  }
</script>

<style scoped>
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 58px;
    height: 60px;
  }

  .disabled-text {
    color: #97A4B6;
  }

  .disabled-text:hover {
    color: #97A4B6;
  }
</style>
