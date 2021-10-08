<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">{{ getCategory() === 'Public' ? $t("common.publicnetwork") : getCategory() === 'System' ? $t("common.systemnetwork") : $t("common.privatenetwork")}}详情</span>
      <span
        @click="getCategory() === 'Public' ? $router.push({name:'publicnetwork'}) : getCategory() === 'System' ? $router.push({name:'systemnetwork'}) : $router.push({name:'privatenetwork'})"
        class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到{{ getCategory() === 'Public' ? $t("common.publicnetwork") : getCategory() === 'System' ? $t("common.systemnetwork") : $t("common.privatenetwork")}}列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{ getCategory() === 'Public' ? $t("common.publicNetworkActions") : getCategory() === 'System' ? $t("common.systemNetworkActions") : $t("common.privateNetworkActions")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-addIpRange" style="padding-top:12px;"
                           v-permission.or="['L3_IP-RANGE.ADD', 'L3_IP-RANGE_CIDR.ADD']" @click="pageAddIpRange()">{{ $t("common.addIpRange") }}</a>
                        <a id="common-addDns" v-if="getCategory() !== 'System'" v-permission="'L3.DNS.ADD'"
                           @click="pageAddDns()">{{ $t("common.addDns") }}</a>
                        <a id="common-attachVirtualRouterOffering" @click="PageAttachVirtualRouterOffering()"
                           v-if="model && !model.system && model.networkServiceType === 'vrouter'"
                           :class="{ 'disabled-text': windowData.virtualRouterOfferingUuid !=='' }">{{ $t("common.attachVirtualRouterOffering") }}</a>
                        <a id="common-detachVirtualRouterOffering" @click="PageDetachVirtualRouterOffering"
                           :class="{ 'disabled-text': windowData.virtualRouterOfferingUuid ==='' }"
                           v-if="dbData.l3network[windowData.dataUuid] && !dbData.l3network[windowData.dataUuid].system && dbData.l3network[windowData.dataUuid].networkServiceType === 'vrouter'">{{ $t("common.detachVirtualRouterOffering") }}</a>
                        <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'"
                           @click="model && !model.toPublic && pageSharePrivateNetworkToAll()"
                           :class="{ 'disabled-text': model && model.toPublic}" v-if="dbData.common.isAdmin">{{$t("common.shareToAll")}}</a>
                        <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'"
                           @click="model && model.toPublic && pageRecallPrivateNetworkFromAll()"
                           :class="{ 'disabled-text': model && !model.toPublic}" v-if="dbData.common.isAdmin">{{$t("common.recallFromAll")}}</a>
                        <a id="common-destroy" style="padding-bottom:12px;" v-permission="'L3.DELETE'"
                           :class="{'disabled-text':!canDelete(windowData.dataUuid)}"
                           @click="canDelete(windowData.dataUuid) && pageDelete()">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane v-if="model && !model.system" :label="$t('common.vm')" name="vm"
        ></el-tab-pane>
        <el-tab-pane v-if="hasPermission()" :label="$t('common.netRange')" name="ipRanges"
        ></el-tab-pane>
        <el-tab-pane v-if="getCategory() !== 'System'" label="DNS" name="dns"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" :label="$t('common.share')"
                     name="share"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('vm.monitor')" name="monitor"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('vm.monitoralarm')" name="monitoralarm"
        ></el-tab-pane>
        <el-tab-pane v-if="isFlatNetwork && !isIPv6Network" :label="$t('vRouterRouteEntry.entry')"
                     name="vRouterRouteEntry"
        ></el-tab-pane>
        <el-tab-pane v-if="hasPermission()" v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
           <base-icon :name="getCategory() === 'Private'
                      ? 'private_network_ico' : getCategory() === 'Public'
                      ? 'public_network_ico' : getCategory() === 'System'
                      ? 'private_network_ico' : ''
           "/>
          <!-- <div class="icon" :class="{
                    'private_network': getCategory() === 'Private',
                    'public_network': getCategory() === 'Public',
                    'system_network': getCategory() === 'System'
                  }"></div> -->
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
                    title:'MTU',
                    content: model && getL3NetworkMtu(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: $t('common.ipVersion'),
                    content: model && `IPv${model.ipVersion}`
                  }"/>

          <detail-row :param="{
                    title: $t('common.networkType'),
                    content:(getCategory() === 'Public' || getCategory() === 'System') ? $t(`common.${getCategory()}`) : model && model.networkServiceType ? $t(`l3network.type.${model.networkServiceType}`) : ''
                  }"/>

          <detail-row :param="{
                    title: $t('common.shareToAll'),
                    content: model && $t(`common.${model.toPublic}`)
                  }"/>

          <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid),
                    handler: () => {

                    }
                  }"
                      v-if="dbData.resourceOwner[windowData.dataUuid] && dbData.resourceOwner[windowData.dataUuid].uuid && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid] && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid),
                    }" v-else/>

          <detail-row :param="{
                    title: 'DHCP IP',
                    content:model && model.dhcpip ? model.dhcpip : ''
                  }"/>

          <detail-row :param="{
                    title: $t('l3network.routerInterfaceIp'),
                    content: model && getL3NetworkRouterInterfaceIp(windowData.dataUuid)}"/>

          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: model &&  model.createDate && formatDatetime(new Date(model.createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: model &&  model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
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
                  $router.push({name: 'detaill2network', params: {uuid: model.l2NetworkUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'common.virtualRouterOffering',
                content: dbData.instanceOffering[windowData.virtualRouterOfferingUuid] && dbData.instanceOffering[windowData.virtualRouterOfferingUuid].name,
                handler: () => {
                   $router.push({name: 'detailvirtualrouteroffering', params: {uuid: windowData.virtualRouterOfferingUuid}})
                }
              }"
                    v-if="dbData.common.isAdmin && model && model.system === false && model.networkServiceType === 'vrouter'"/>
        <detail-row :param="{
                title: 'common.virtualRouterDevice',
                content: dbData.vm[windowData.virtualRouterVmUuid] && dbData.vm[windowData.virtualRouterVmUuid].name,
                handler: () => {
                   $router.push({name: 'detailVirtualRouter', params: {uuid: windowData.virtualRouterVmUuid}})
                }
              }"
                    v-if="dbData.common.isAdmin && model && model.system === false && model.networkServiceType === 'vrouter' && windowData.virtualRouterVmUuid"/>
        <div style="height: 40px" v-if="model && !model.system"></div>
        <div id="common-networkService" class="detail-block-header network-service-icon" v-if="model && !model.system">
          {{$t("common.networkService")}}
        </div>
        <div class="detail-row" v-if="model && !model.system" v-for="item in getNetworkService() ">
          <div class="detail-title">
            {{item.networkServiceType}}
          </div>
        </div>
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vm' && !model.system">
      <vm-tab-list
        :param="{conditions: [`vmNics.usedIp.l3NetworkUuid=${windowData.dataUuid}`, 'state!=Destroyed', 'type=UserVm'], uuid: windowData.dataUuid, isSubListOfL3Network: true}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'ipRanges'">
      <ip-range-tab-list
        :param="{conditions: `l3Network.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, refresh: query, isSystem: getCategory() === 'System', addIpRange: pageAddIpRange}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'dns' && getCategory() !== 'System'">
      <dns-tab-list :assigned-id="tablistAssignedUuid.dns" :param="{ uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'share'">
      <account-tab-list
        :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'l3network'}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitoralarm'">
      <zwatch-alarm-tab-list-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'l3network' }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <l3network-monitor :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vRouterRouteEntry'">
      <flat-route-entry-tab-list :param="{ uuid: windowData.dataUuid, addRouteEntry: addRouteEntry }"/>
    </div>

    <div slot="footer">
      <add-ip-range v-if="showAddIpRange" :param="ipRangeParam" @close="showAddIpRange = false;"/>
      <add-route-entry v-if="showAddRouteEntry" :param="routeEntryParam" @close="showAddRouteEntry = false"/>
    </div>
  </detail-template>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'
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

  import VmTabList from "./component/VmTabList";
  import IpRangeTabList from "./component/IpRangeTabList";
  import DnsTabList from "./component/DnsTabList";
  import L3networkMonitor from "./component/Monitor";
  import ZwatchAlarmTabListForResource from "src/om/zwatchalarm/TabListForResource";

  import AccountTabList from "src/om/account/component/ShareTabList";
  import AddIpRange from "../l3network/component/AddIPRange";
  import FlatRouteEntryTabList from "./component/FlatRouteEntryTabList";
  import AddRouteEntry from "./component/AddRouteEntry";

  export default {
    name: "L3NetworkDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddRouteEntry,
      FlatRouteEntryTabList,
      AddIpRange,
      DetailTemplate,
      VmTabList,
      IpRangeTabList,
      DnsTabList,
      "l3network-monitor": L3networkMonitor,
      LogList,
      ZwatchAlarmTabListForResource,
      AccountTabList
    },
    created() {
      window.addEventListener('click', this.onWindowClick)
      this.TablistAssignedInit('dns', 'ipRanges')
      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        currentAccountUuid: window.localStorage.getItem('accountUuid'),
        // dHCPServer: false,
        virtualRouterOfferingUuid: '',
        virtualRouterVmUuid: '',
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
      this.isFlatNetwork = this.assertFlatNetwork(this.windowData.dataUuid)

    },
    mounted() {

    },
    computed: {
      isIPv6Network() {
        return _.get(this.dbData.l3network, [this.windowData.dataUuid, 'ipVersion']) === 6
      },
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
          virtualRouterVmUuid: '',
          tagForVirtualRouterOfferingUuid: '',
          networkServiceList: []
        })
          .then(() => {
            this.query()
            this.isFlatNetwork = this.assertFlatNetwork(this.param.uuid)
            if (this.isFlatNetwork === false && this.windowData.currTab === 'vRouterRouteEntry') {
              this.updateWindow({currTab: 'info'})
            }
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
        isFlatNetwork: false,
        l3network: null,
        showAddIpRange: false,
        ipRangeParam: {},
        showAddRouteEntry: false,
        routeEntryParam: {}
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
      getCategory: function () {
        return _.get(this.dbData, `l3network.${this.windowData.dataUuid}.category`)
      },
      query: function () {
        return rpc.query(`l3-networks/${this.windowData.dataUuid}`)
          .then((resp) => {
            const self = this
            let L3NetworkInventories = resp.inventories[0]
            let tasks = []
            let p = null
            p = rpc.getResourceAccount([self.windowData.dataUuid], self)
            tasks.push(p)
            let queryOffering = (virtualRouterOfferingUuid) => {
              return rpc.query(`instance-offerings/${virtualRouterOfferingUuid}`)
                .then(resp => {
                  if (resp.inventories.length === 0) {
                    return this.updateWindow({
                      virtualRouterOfferingUuid: '',
                      tagForVirtualRouterOfferingUuid: ''
                    })
                  }
                  return this.updateDbRow({
                    tableName: 'instanceOffering',
                    id: virtualRouterOfferingUuid,
                    data: resp.inventories[0]
                  })
                })
            }
            if (this.dbData.common.isAdmin) {
              p = rpc.query('l2-networks', {
                q: `uuid=${resp.inventories[0].l2NetworkUuid}`
              }).then((l2resp) => {
                return this.updateDbRow({
                  tableName: 'l2network',
                  id: resp.inventories[0].l2NetworkUuid,
                  data: l2resp.inventories[0]
                })
              })
              tasks.push(p)
            }
            p = rpc.query(`zones`, {
              q: `uuid=${resp.inventories[0].zoneUuid}`
            })
              .then((zoneResp) => {
                return this.updateDbRow({
                  tableName: 'zone',
                  id: resp.inventories[0].zoneUuid,
                  data: zoneResp.inventories[0]
                })
              })
            tasks.push(p)
            p = rpc.query(`network-services/providers`, {}).then((resp) => {
              return this.updateDbTable({
                tableName: 'networkServiceType',
                list: resp.inventories
              })
            })
            tasks.push(p)

            p = rpc.query('system-tags', {
              q: ['resourceType=InstanceOfferingVO', `tag=guestL3Network::${resp.inventories[0].uuid}`]
            })
              .then(resp => {
                if (resp.inventories.length === 0) return
                this.updateWindow({
                  virtualRouterOfferingUuid: resp.inventories[0].resourceUuid,
                  tagForVirtualRouterOfferingUuid: resp.inventories[0].uuid
                })
                return queryOffering(resp.inventories[0].resourceUuid)
              })
            tasks.push(p)
            if (this.dbData.common.isAdmin) {
              p = this.isShareToAll(L3NetworkInventories.uuid)
                .then((resp) => {
                  L3NetworkInventories.toPublic = resp
                })
              tasks.push(p)
            }
            p = rpc.query(`resources/accounts`, {
              resourceUuids: [self.windowData.dataUuid]
            }).then((resp) => {
              L3NetworkInventories.accountUuid = resp.inventories[self.windowData.dataUuid].uuid
              if (self.dbData.common.isAdmin) {
                return rpc.query(`accounts/${resp.inventories[self.windowData.dataUuid].uuid}`)
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
            p = rpc.query(`system-tags`, {q: `resourceUuid=${this.windowData.dataUuid}`}).then(dhcpipResp => {
              let dhcpip = ''
              dhcpipResp.inventories.forEach(item => {
                if (item.tag.indexOf('DhcpServer::') > -1) {
                  dhcpip = item.tag.split('::')[2]
                }
              })
              L3NetworkInventories.dhcpip = dhcpip.replace(/--/, '::')
            })
            tasks.push(p)
            p = rpc.query('vm-instances/appliances/virtual-routers', {
              q: `vmNics.l3Network.uuid=${this.windowData.dataUuid}`
            }).then((resp) => {
              if (resp.inventories.length > 0) {
                this.updateWindow({virtualRouterVmUuid: resp.inventories[0].uuid})
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
              } else {
                this.updateWindow({virtualRouterVmUuid: ''})
              }
            })
            tasks.push(p)
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
                  this.model = _.get(this.dbData.l3network, this.windowData.dataUuid);
                })
              })
          })
      },

      hasPermission: function () {
        let hasPermission = this.dbData.common.isAdmin || this.dbData.l3network[this.windowData.dataUuid] && this.dbData.l3network[this.windowData.dataUuid].accountUuid === this.windowData.currentAccountUuid
        return hasPermission
      },

      // canOperateResource: function () {
      //   return this.dbData.common.isAdmin || (this.dbData.account[this.windowData.dataUuid] && (this.dbData.account[this.windowData.dataUuid].uuid === this.windowData.currentAccountUuid))
      // },
      isShareToAll: function (uuid) {
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

      getNetworkService: function () {
        let self = this;
        if (!self.model || !self.model.networkServices) return;
        let networkservices = _.cloneDeep(self.model.networkServices)
        return networkservices.sort((a, b) => a.networkServiceType > b.networkServiceType)
      },

      getNetworkServiceTypeName: function (l3network) {
        const self = this
        if (l3network.networkServices.length === 0) return false
        let networkServices = l3network.networkServices.filter((item) => item.networkServiceType !== 'SecurityGroup')
        if (networkServices.length === 0) return false
        // let networkServiceProviderUuid = networkServices[0].networkServiceProviderUuid
        let networkServiceProviderUuid = null
        let flag = false // true = vrouter
        let type = ''
        networkServices.forEach(function (item) {
          ((item) => {
            // if (item.networkServiceType === 'Eip') networkServiceProviderUuid = item.networkServiceProviderUuid
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
        // if (this.dbData.networkServiceType[networkServiceProviderUuid]) {
        //   return this.dbData.networkServiceType[networkServiceProviderUuid].type
        // }
        // return ''
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

      PageAttachVirtualRouterOffering: function () {
        if (this.windowData.tagForVirtualRouterOfferingUuid !== '') return
        this.openDialog('VirtualRouterInstanceOfferingListSingleSelectDlg', {
          conditions: ['image.format!=vmtx'],
          ok: (resourceUuid) => this.attachVirtualRouterOffering(this.windowData.dataUuid, resourceUuid)
        })
      },

      PageDetachVirtualRouterOffering: function () {
        let self = this
        if (this.windowData.tagForVirtualRouterOfferingUuid === '') return
        this.openDialog('ConfirmDlg', {
          title: 'common.detachVirtualRouterOffering',
          description: 'l3network.detachVirtualRouterOffering',
          icon: 'instance_offering_popupico',
          uuidList: [this.windowData.virtualRouterOfferingUuid],
          ok: () => {
            self.detachVirtualRouterOffering(self.windowData.dataUuid, self.windowData.tagForVirtualRouterOfferingUuid)
          },
          getName: (uuid) => {
            return self.dbData.instanceOffering[uuid].name
          }
        })
      },

      pageAddIpRange: function (fn) {
        let self = this;
        self.ipRangeParam = {
          isIPV6: self.model.ipVersion === 6,
          l3NetworkUuid: this.windowData.dataUuid,
          isHideCidr: this.dbData.l3network[this.windowData.dataUuid].ipRanges.length > 0,
          isHideDHCP: this.getCategory() === 'System',
          ok: (params) => {
            this.addIpRange(this.windowData.dataUuid, params, fn)
          }
        }
        self.showAddIpRange = true;
      },

      pageAddDns: function () {
        let self = this
        self.openDialog('AddDNSDlg', {
          isIPv6: this.dbData.l3network[self.windowData.dataUuid].ipVersion === 6,
          ok: (dns) => self.addDnsToL3Network(self.windowData.dataUuid, dns)
        })
      },

      addIpRange: function (l3NetworkUuid, params, fn) {
        let self = this
        let name = self.dbData.l3network[l3NetworkUuid].name
        let event = this.createEvent('l3network.action.addIpRange', name)
        if (!params.showMethod) {
          let url
          let param = {
            name: name,
            startIp: params.startIp,
            endIp: params.endIp,
            systemTags: params.systemTags,
            gateway: params.gateway
          }
          if (this.dbData.l3network[l3NetworkUuid].ipVersion === 6) {
            url = `l3-networks/${l3NetworkUuid}/ipv6-ranges`
            param.prefixLen = params.prefixLen
            param.addressMode = params.addressMode
          } else {
            param.netmask = params.netmask
            url = `l3-networks/${l3NetworkUuid}/ip-ranges`
          }
          return rpc.create(url, param, event).then((resp) => {
            this.getIpAddressCapacity(l3NetworkUuid)
            this.query()
            this.incEventSuccess(event)
            if (fn) fn();
          }, () => this.incEventFail(event))
        } else {
          return this.addIpRangeByNetworkCidr(l3NetworkUuid, params, event).then(() => this.query())
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
        let self = this, uuidList = [];
        let networkType = self.getCategory();
        let lowerCase = () => {
          return networkType.replace(/\b(\w)|\s(\w)/g, (m) => {
            return m.toLowerCase();
          })
        }
        uuidList = [self.windowData.dataUuid];
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: `l3network.delete${networkType}Network`,
            description: this.$t("l3network.info.deleteConfirm", {
              length: uuidList.length,
              resourceName: this.$t(`common.${lowerCase()}Network`)
            }),
            warning: `l3network.info.${lowerCase()}NetworkDeleteWarning`,
            uuidList: uuidList,
            icon: (lowerCase() + 'Network').replace('N', '_n').replace(/$/, '_n'),
            ok: () => {
              self.delete(uuidList).then(() => {
                self.$router.push({name: (lowerCase() + 'Network').replace('N', 'n')})
              })
            },
            getName: (uuid) => {
              return self.dbData.l3network[uuid].name;
            }
          })
        }
      },

      pageRecallPrivateNetworkFromAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.recallFromAll',
          warning: 'account.recall',
          ok: () => {
            this.recallFromAll([this.windowData.dataUuid])
              .then(() => this.query())
          }
        })
      },

      pageSharePrivateNetworkToAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.shareToAll',
          warning: 'instanceOffering.shareToAllText',
          ok: () => {
            this.shareL3NetworkToAll([this.windowData.dataUuid])
              .then(() => this.query())
          }
        })
      },

      pageStart: function () {
        this.start([this.windowData.dataUuid])
      },

      pageStop: function () {
        this.stop([this.windowData.dataUuid])
      },

      isToPublic: function (uuid) {
        if (this.dbData.common.isAdmin) {
          rpc.query('accounts/resources', {
            q: [`resourceUuid?=${uuid}`]
          }).then((resp) => {
            // resp.inventories.forEach((list) => {
            //   if (list.receiverAccountUuid === undefined) state = list.toPublic
            // })
            let list = []
            let state = false
            for (list in resp.inventories) {
              if (resp.inventories[list].receiverAccountUuid === undefined) state = resp.inventories[list].toPublic
            }
            return state
          })
        }
      },

      assertFlatNetwork: function (dataUuid) {
        let row = this.dbData.l3network[dataUuid]
        if (row && row.category === 'Private' && row.networkServiceType === 'Flat') {
          return true
        }
        return false
      },

      addRouteEntry(param) {
        let self = this;
        self.routeEntryParam = param;
        self.showAddRouteEntry = true;
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
    background-image: url('~assets/detail_vxlanpool.svg');
  }

  .disabled-text {
    color: #97A4B6;
  }

  .disabled-text:hover {
    color: #97A4B6;
  }
</style>
