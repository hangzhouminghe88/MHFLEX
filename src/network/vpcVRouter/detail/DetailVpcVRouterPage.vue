<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">VPC路由器详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'vpcvrouter'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到VPC路由器列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('vpcVRouter.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
                 <a style="padding-top: 12px;" :class="{'disabled-text': inStatuses('Connecting') || inStates('Running')}"
                    @click="!inStatuses('Connecting') && !inStates('Running') && detailStart()">{{$t('common.start')}}</a>
                 <a :class="{'disabled-text': inStatuses('Connecting') || inStates('Stopped')}"
                 @click="!inStatuses('Connecting') && !inStates('Stopped') && detailOperation('stop')">{{$t('common.stop')}}</a>
                 <a :class="{'disabled-text': inStatuses('Connecting')}"
                 @click="!inStatuses('Connecting') && detailOperation('reboot')">{{$t('common.reboot')}}</a>
                 <a id="common-reconnect"
                 v-permission="'VR.RECONNECT'"
                 :class="{'disabled-text': inStatuses('Connecting') }"
                 @click="!inStatuses('Connecting') && detailOperation('reconnect')">{{ $t("common.reconnect") }}</a>
                  <a id="vm-migrate" v-permission="'VM.MIGRATE'" @click="vpcVRouter && canMigrate() && detailMigrate()"
                     :class="{ 'disabled-text': !vpcVRouter || !canMigrate() }">{{ $t("vm.migrate") }}</a>
                  <a id="vm-console" v-permission="'CONSOLE-ACCESS.REQUEST'"
                     @click="vpcVRouter && canOpenConsole() && detailOpenConsole()" :class="{ 'disabled-text':!vpcVRouter || !canOpenConsole() }">{{ $t("vm.console") }}</a>
                  <a id="common-setConsolePassword" v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']"
                     @click="vpcVRouter && canSetVmConsolePassword() && pageSetVmConsolePassword()"
                     :class="{ 'disabled-text': !vpcVRouter || !canSetVmConsolePassword()}">{{ $t("common.setConsolePassword") }}</a>
                  <a id="vm-deleteConsolePassword" v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']"
                     :class="{ 'disabled-text': !vpcVRouter || !canDeleteConsolepassword()}"
                     @click="vpcVRouter && canDeleteVmConsolePassword() && pageDeleteVmConsolePassword()">{{ $t("vm.deleteConsolePassword") }}</a>
                  <a id="common-destroy" v-permission="'VM.DESTROY'" @click="detailOperation('delete')"
                     style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs v-model="activeName" class="detail-tab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.network')" name="network"></el-tab-pane>
        <el-tab-pane label="DNS" name="dns"></el-tab-pane>
        <el-tab-pane :label="$t('common.vip')" name="vip"></el-tab-pane>
        <el-tab-pane :label="$t('common.eip')" name="eip"></el-tab-pane>
        <el-tab-pane :label="$t('common.ipsec')" name="ipsec"></el-tab-pane>
        <el-tab-pane :label="$t('common.portforwarding')" name="portforwarding"></el-tab-pane>
        <el-tab-pane :label="$t('common.loadbalancer')" name="loadbalancer"></el-tab-pane>
        <el-tab-pane :label="$t('common.monitor')" name="monitor"></el-tab-pane>
        <el-tab-pane :label="$t('common.zwatchalarm')" name="zwatchalarm"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="vpc_vrouter_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-if="vpcVRouter && vpcVRouter.state" :state="vpcVRouter.state"/>
            <div style="position: relative; color: #005596;">
              <img style="position: absolute; left: 30px; top: 8px;" src="~assets/kvm.svg" />
              <div style="padding-left: 0px;">
                {{vpcVRouter && vpcVRouter['hypervisorType']}}
              </div>
            </div>
            <span class="console-container">
               <span class="console" v-if="!inStates(['Running'])"
                     @click="detailOpenConsole()">
                     <span class="console-label">{{$t('common.console')}}</span>
                </span>
            </span>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row class="editable"
            :param="{
              title: 'CPU',
              content: vpcVRouter && vpcVRouter.cpuNum,
              handler:() => {

              },
              editable: true
            }"
          />
          <detail-row class="editable"
            :param="{
              title: 'common.memorySize',
              content: vpcVRouter && bytesToSize(vpcVRouter.memorySize),
              handler:() => {

              },
              editable: true
            }"
          />
          <div class="detail-row editable">
            <div class="detail-title">{{$t('common.platform') + $t('common.colon')}}</div>
            <div class="detail-container">
              <span v-if="showPlatform">
                {{vpcVRouter && vpcVRouter.platform}}
              <i class="edit-icon el-icon-edit"
                 style="font-size:20px; color:#409EFF;" @click="clickPlatform()"></i>
              </span>
              <el-select v-model="platformText" v-show="showPlatformTextSelect"
                         @change="updateResource(platformText, 'platform'); showPlatformTextSelect=false;showPlatform = true;"
                         @blur="showPlatformTextSelect=false;showPlatform = true;">
                <el-option v-for="(platform, index) in platformList"
                           :key="index" :value="platform" :label="platform"></el-option>
              </el-select>
            </div>
          </div>
          <detail-switch
            :param="{
              disabled: !inStates(['Running']) || (vpcVRouter && vpcVRouter.status !== 'Connected'),
              doc: 'vpcDistributeVRouter',
              getTitle () {
                return $t('vpcVRouter.distributedRouting')
              },
              getRightText(){
                 return $t('vpcVRouter.distributedRoutingOn')
              },
              getLeftText(){
                return $t('vpcVRouter.distributedRoutingOff')
              },
              getValue () {
                return vpcVRouter && vpcVRouter.distributedRoutingEnabled
              },
              setValue() {
               if(inStates(['Running']) && vpcVRouter && vpcVRouter.status === 'Connected')
                setVpcVRouterDistributedRoutingStatus(windowData.dataUuid)
              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.defaultIp',
              content:defaultIp,
              copy: true,
            }"
          />
          <detail-row
            :param="{
              title: 'common.managementIp',
              content:manageIp,
              copy: true,
            }"
          />
          <detail-row v-if="vpcVRouter && vpcVRouter.vmNics && vpcVRouter.vmNics.length > 0"
            :param="{
              title: 'MAC',
              content: getMac,
              copy: true,
            }"
          />
          <detail-row
            :param="{
              title: 'common.owner',
              content: vpcVRouter && dbData.account[vpcVRouter.accountUuid] && dbData.account[vpcVRouter.accountUuid].name,
              handler: () => {

              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: vpcVRouter && vpcVRouter.createDate && formatDatetime(new Date(vpcVRouter.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: vpcVRouter && vpcVRouter.lastOpDate && formatDatetime(new Date(vpcVRouter.lastOpDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: windowData.dataUuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
            title: 'common.image',
            content: vpcVRouter && vpcVRouter.imageUuid &&  getVirtualrouterImageName(windowData.dataUuid),
            handler: () => {
            if(vpcVRouter && vpcVRouter.imageUuid)
               $router.push({name: 'detailImage', params: {uuid: vpcVRouter.imageUuid}})
            }
          }"
        />
        <detail-row
          :param="{
            title: 'common.virtualRouterOffering',
            content: vpcVRouter && vpcVRouter.instanceOfferingUuid && getInstanceOfferingName(windowData.dataUuid),
            handler: () => {
              if(vpcVRouter && vpcVRouter.instanceOfferingUuid)
               $router.push({name: 'detailvirtualrouteroffering', params: {uuid: vpcVRouter.instanceOfferingUuid}})
              }
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType === 'KVM'"
          :param="{
            title: 'common.host',
            content: vpcVRouter && vpcVRouter.hostUuid && dbData.host[vpcVRouter.hostUuid] && dbData.host[vpcVRouter.hostUuid].name,
            handler: () => {
               if(vpcVRouter && vpcVRouter.hostUuid){
                $router.push({name: 'detailHost', params: {uuid: vpcVRouter.hostUuid}})
              }
            }
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType === 'ESX'"
                    :param="{
            title: 'common.host',
            content: vpcVRouter && vpcVRouter.hostUuid && dbData.host[vpcVRouter.hostUuid] && dbData.host[vpcVRouter.hostUuid].name,
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType === 'ESX'"
                    :param="{
            title: 'common.lastHost',
            content: vpcVRouter && vpcVRouter.hostUuid && dbData.host[vpcVRouter.lastHostUuid] && dbData.host[vpcVRouter.lastHostUuid].name,
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType === 'KVM'"
                    :param="{
            title: 'common.lastHost',
            content: vpcVRouter && vpcVRouter.lastHostUuid && dbData.host[vpcVRouter.lastHostUuid] && dbData.host[vpcVRouter.lastHostUuid].name,
            handler: () => {
             if(vpcVRouter && vpcVRouter.lastHostUuid){
               $router.push({name: 'detailHost', params: {uuid: vpcVRouter.lastHostUuid}})
             }
            }
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType === 'KVM'"
          :param="{
            title: 'common.cluster',
            content: vpcVRouter && vpcVRouter.clusterUuid && dbData.cluster[vpcVRouter.clusterUuid] && dbData.cluster[vpcVRouter.clusterUuid].name,
            handler: () => {
            if(vpcVRouter && vpcVRouter.clusterUuid){
               $router.push({name: 'detailCluster', params: {uuid: vpcVRouter.clusterUuid}})
             }
            }
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType === 'ESX'"
                    :param="{
            title: 'common.cluster',
            content: vpcVRouter && vpcVRouter.clusterUuid && dbData.cluster[vpcVRouter.clusterUuid] && dbData.cluster[vpcVRouter.clusterUuid].name
          }"
        />
        <detail-row v-if="vpcVRouter && vpcVRouter.hypervisorType !== 'ESX' && dbData.common.isAdmin"
          :param="{
            title: 'common.console',
            content: vpcVRouter && vpcVRouter.vmConsoleAddress
          }"
        />
        <detail-row
          :param="{
            title: 'vrouterroutetable.Table',
            content: vpcVRouter && vpcVRouter.routeTableUuid && dbData.vRouterRouteTable[vpcVRouter.routeTableUuid].name,
            handler: () => {

            }
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'network'">
       <vpc-v-router-net-work-tab :param="{ uuid:windowData.dataUuid, conditions: `vmNic.vmInstanceUuid=${windowData.dataUuid}` }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'dns'">
      <vpc-vpn-add-dns-tab :param="{ uuid: windowData.dataUuid, init: init }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'eip'">
      <vpc-vrouter-eip-tab :param="{ uuid: windowData.dataUuid, conditions: `vip.uuid?=${windowData.forEipUuidList}`, init: init, createEip: createEip}"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vip'">
      <vip-tab-list :param="{ uuid:windowData.dataUuid, customizedVips: windowData.forCustomizedVipUuidList, systemVips: windowData.forSNATUuidList, init: init}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'ipsec'">
      <ip-sec-tab-list :param="{ uuid:windowData.dataUuid, conditions: `vip.uuid?=${windowData.forIPsecUuidList}`, init: init }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'portforwarding'">
      <port-forward-tab-list :param="{ uuid:windowData.dataUuid, conditions: `vip.uuid?=${windowData.forPortForwardingUuidList}`, init: init }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'loadbalancer'">
       <load-balance-tab-list :param="{ uuid:windowData.dataUuid, conditions: `vip.uuid?=${windowData.forLoadBalancerUuidList}`, init: init }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <vm-monitor :param="windowData.dataUuid"></vm-monitor>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'zwatchalarm'">
      <zwatch-alaram-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'vRouter' }"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>

    <div slot="footer">
       <create-eip-for-vpv-vrouter-page v-if="showCreateEip" :param="createEipParam" @close="showCreateEip = false;"/>
      <host-single-dlg :model="showHostSingleDlg"
                       :message="hostSingleMessage"
                       v-if="showHostSingleDlg"
                       @close="closeHostSingleDlg"/>
    </div>
  </detail-template>
</template>

<script>
  import VpcVRouterNetWorkTab from "src/network/vpcVRouter/component/VpcVRouterNetWorkTab";
  import ZwatchAlaramForResource from "../../../om/zwatchalarm/ZwatchAlaramForResource";
  import CreateEipForVpvVrouterPage from "../component/CreateEipForVpvVrouterPage";
  import VmMonitor from "../../../ecs/ecsInstance/component/VmMonitor";
  import VipTabList from "src/network/vpcVRouter/component/VipTabList";
  import LoadBalanceTabList from "../component/LoadBalanceTabList";
  import PortForwardTabList from "../component/PortForwardTabList";
  import VpcVpnAddDnsTab from "../component/VpcVRouterAddDnsTab";
  import VpcVrouterEipTab from "../component/VpcVrouterEipTab";
  import  {bytesToSize, formatDatetime} from "src/utils/utils";
  import DetailInfoState from "src/component/DetailInfoState";
  import DetailTemplate from "src/component/DetailTemplate";
  import HostSingleDlg from "src/dialog/HostSingleSelectDlg";
  import IpSecTabList from "../component/IpSecTabList";
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';

  export default {
    name: "DetailVpcVRouterPage",

    components: {
      HostSingleDlg,
      LogList,
      ZwatchAlaramForResource,
      VmMonitor,
      LoadBalanceTabList,
      IpSecTabList,
      PortForwardTabList,
      VipTabList,
      CreateEipForVpvVrouterPage,
      VpcVrouterEipTab, VpcVpnAddDnsTab, VpcVRouterNetWorkTab, DetailInfoState, DetailTemplate},

    mixins: [WindowBase, PageBase, Methods],

    data() {
      return {
        activeName: 'info',
        model: null,
        showPlatform: true,
        platformText:'',
        showPlatformTextSelect: false,
        platformList: [
          'Linux',
          'Windows',
          'WindowsVirtio',
          'Other',
          'Paravirtualization',
        ],
        showCreateEip: false,
        createEipParam: {},
        showHostSingleDlg: false,
        hostSingleMessage: {},
      }
    },

    computed: {
      vpcVRouter: {
        get() {
           return this.model && this.model;
        },
        set(val){
          if(val)
            this.model = val;
        }
      },
      defaultIp() {
        let self = this;
        if(self.vpcVRouter && self.vpcVRouter.vmNics) {
          for (let nic in self.vpcVRouter.vmNics){
            return (self.vpcVRouter.defaultRouteL3NetworkUuid === self.vpcVRouter.vmNics[nic].l3NetworkUuid) ? self.vpcVRouter.vmNics[nic].ip : '';
          }
        }
      },
      manageIp() {
        let self = this;
        if(self.vpcVRouter && self.vpcVRouter.vmNics) {
          for (let nic in self.vpcVRouter.vmNics){
            return (self.vpcVRouter.managementNetworkUuid === self.vpcVRouter.vmNics[nic].l3NetworkUuid) ? self.vpcVRouter.vmNics[nic].ip : '';
          }
        }
      },
      getMac() {
        let self = this;
        if(self.vpcVRouter && self.vpcVRouter.vmNics) {
          for (let nic in self.vpcVRouter.vmNics){
            return (self.vpcVRouter.defaultRouteL3NetworkUuid === self.vpcVRouter.vmNics[nic].l3NetworkUuid) ? self.vpcVRouter.vmNics[nic].mac : '';
          }
        }
      }
    },

    created() {
      //初始化查询
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.query
        }
      }).then(() => {
        self.init()
          .then(() => {
            self.platformText = self.vpcVRouter.platform;
          });
      })
    },

    methods: {
      bytesToSize,

      formatDatetime,

      clickPlatform() {
        let self = this;
        self.showPlatformTextSelect = true;
        self.showPlatform = false;
        self.platformText = self.vpcVRouter.platform;
      },
      //创建Eip
      createEip(param) {
        let self = this;
        self.createEipParam = param;
        self.showCreateEip = true;
      },

      //查询单条数据
      query: function () {
        let uuid = this.windowData.dataUuid
        let vmInventories = {}
        return rpc.query(`vpc/virtual-routers`, {
          q: `uuid=${this.windowData.dataUuid}`
        }).then((resp) => {
          vmInventories = resp.inventories[0]
        })
          .then(() => {
            let tasks = []
            let p = null
            if (this.dbData.common.isAdmin) {
              let accountUuid = uuid
              p = rpc.query('accounts/resources/refs', {
                q: `resourceUuid=${accountUuid}`
              }).then((resp) => {
                vmInventories.accountUuid = resp.inventories[0].accountUuid
                return rpc.queryResourceNames(this, 'account', [vmInventories.accountUuid])
              })
              tasks.push(p)
            }
            let clusterUuid = vmInventories.clusterUuid
            p = rpc.query('clusters', {
              q: `uuid=${clusterUuid}`
            }).then((resp) => {
              return this.updateDbRow({
                tableName: 'cluster',
                id: clusterUuid,
                data: resp.inventories[0]
              })
            })
            tasks.push(p)

            let hostUuid = vmInventories.hostUuid ? vmInventories.hostUuid : vmInventories.lastHostUuid
            p = rpc.query('hosts', {
              q: `uuid=${hostUuid}`
            }).then((resp) => {
              return this.updateDbRow({
                tableName: 'host',
                id: hostUuid,
                data: resp.inventories[0]
              })
            })
            tasks.push(p)

            let accountUuid = uuid
            p = rpc.query('accounts/resources/refs', {
              q: `resourceUuid=${accountUuid}`
            }).then((resp) => {
              let accountInventories = resp.inventories[0]
              return rpc.query('accounts', {
                q: `uuid=${accountInventories.accountUuid}`
              }).then((resp) => {
                accountInventories.owner = resp.inventories[0]
                accountInventories.uuid = accountInventories.resourceUuid
                return this.updateDbTable({
                  tableName: 'accountRef',
                  list: [accountInventories]
                })
              })
            })
            tasks.push(p)
            if (!this.dbData.common.isOpensource) {
              p = rpc.query(`vm-instances/${uuid}/ha-levels`).then(resp => {
                vmInventories.haLevel = resp.level || 'None'
              })
              tasks.push(p)
              let distributedRoutingTask = rpc.query(`vpc/virtual-routers/${uuid}/distributed-routing`)
                .then((resp) => {
                  vmInventories.distributedRoutingEnabled = resp.enabled
                  return this.updateWindow({
                    distributedRoutingEnabled: resp.enabled
                  })
                }).catch((err) => {
                  console.error(err)
                })
              let p = Promise.race([
                distributedRoutingTask,
                new Promise(function (resolve, reject) {
                  setTimeout(() => {
                    resolve('request timeout')
                  }, 5000)
                })
              ])
              tasks.push(p)
            }

            p = rpc.query(`vm-instances/${uuid}/capabilities`)
              .then((resp) => {
                this.updateDbRow({
                  tableName: 'vmInstancesCapabilities',
                  id: uuid,
                  data: resp.capabilities
                })
                vmInventories = _.assign(vmInventories, resp)
              })
            tasks.push(p)

            p = rpc.query('images')
              .then((resp) => {
                return this.forceUpdateDbTable({
                  tableName: 'image',
                  list: resp.inventories
                })
              })
            tasks.push(p)

            p = rpc.query('instance-offerings')
              .then((resp) => {
                return this.forceUpdateDbTable({
                  tableName: 'instanceOffering',
                  list: resp.inventories
                })
              })
            tasks.push(p)

            p = rpc.query(`vm-instances/${uuid}/console-passwords`)
              .then((resp) => {
                let hasPassword = false
                if (!_.isUndefined(resp.password)) {
                  hasPassword = true
                }
                this.updateDbRow({
                  tableName: 'vmInstancesConsolePassword',
                  id: uuid,
                  data: {
                    hasPassword
                  }
                })
              })
            tasks.push(p)
            if (!this.dbData.common.isOpensource) {
              p = rpc.query('vrouter-route-tables/virtual-router-refs', {
                q: `virtualRouterVmUuid=${uuid}`
              })
                .then((resp) => {
                  if (resp.inventories.length === 0) return
                  vmInventories.routeTableUuid = resp.inventories[0].routeTableUuid
                  return rpc.queryResourceNames(this, 'vRouterRouteTable', [resp.inventories[0].routeTableUuid]).then(() => {
                  })
                })
              tasks.push(p)
            }

            if (this.dbData.common.isAdmin && vmInventories.state === 'Running') {
              p = rpc.query(`vm-instances/${uuid}/console-addresses`)
                .then((vnsResp) => {
                  if (!vnsResp.success) return
                  vmInventories.vmConsoleAddress = vnsResp.protocol + '://' + vnsResp.hostIp + ':' + vnsResp.port
                })
              tasks.push(p)
            }
            let self = this;
            return Promise.all(tasks).then((resp) => {
              return this.updateDbRow({
                tableName: 'vm',
                id: uuid,
                data: vmInventories
              })
            }).then( () => {
              self.model = _.get(self.dbData.vm, self.windowData.dataUuid);
            })
          })
      },

      //判断云主机状态
      inStates() {
        let self = this, states = [];
        if(!self.vpcVRouter) return true;
        for(let i in arguments) {
          states.unshift(arguments[i]);
        }
        let  instate =  states.some((state) => state === self.vpcVRouter.state);
        return instate;
      },
      //打开控制台
      detailOpenConsole (uuid) {
        let event = this.createEvent('vpcVRouter.action.openConsole', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        rpc.create('consoles', {
          'vmInstanceUuid': uuid
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            let address = ''
            address = `${window.location.origin}/thirdparty/vnc_auto.html?host=${resp.inventory.hostname}&port=${resp.inventory.port}&token=${resp.inventory.token}&title=${this.dbData.vm[uuid].name}`
            window.open(address)
          }, () => {
            this.incEventFail(event)
          })
      },
      //更新参数
      updateResourceParam(name) {
        let self = this;
        return {
          getValue() {
            return self.vpcVRouter && self.vpcVRouter[name];
          },
          setValue(newVal) {
            if(self.vpcVRouter && newVal === self.vpcVRouter[name]) return;
            self.updateResource(newVal, name);
          }
        }
      },
      //更新名称请求
      updateResource(newVal, name) {
        let self = this, event = null;
        event = self.createEvent('vpcVRouter.action.update', self.vpcVRouter ? self.vpcVRouter.name : '');
        let param = {};
        param[name] = newVal;
        rpc.update('vm-instances', self.windowData.dataUuid, {
          'updateVmInstance': param
        }, event)
          .then( () => {
            self.incEventSuccess(event);
            self.query();
          })
          .catch(() => {
            self.incEventFail(event);
          })
      },
      //是否开启分布式路由器
      setVpcVRouterDistributedRoutingStatus (uuid) {
        if (!this.dbData.vm[uuid]) return
        let event = this.createEvent(`${this.dbData.vm[uuid].distributedRoutingEnabled ? 'vpcVRouter.action.disableDistributedRouting' : 'vpcVRouter.action.enableDistributedRouting'}`, this.dbData.vm[uuid].name)
        rpc.post(`vpc/virtual-routers/${uuid}/distributed-routing`, {
          params: {
            stateEvent: this.dbData.vm[uuid].distributedRoutingEnabled ? 'disable' : 'enable'
          }
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: {
                distributedRoutingEnabled: resp.enabled
              }
            }).then(() => {
              this.$nextTick(this.$forceUpdate)
              // NOTICE: (shixiang.ma) The view can not be updated,so we call force update in nexttick.
            })
          }, () => {
            this.incEventFail(event)
          })
      },
      //出始化eip
      init: function () {
        this.querySshKey(this.windowData.dataUuid)
        return this.query().then(() => {
          return this.queryL3Network().then(() => this.queryVip())
        })
      },
      //查询sshKey
      querySshKey: function (uuid) {
        return rpc.query(`vm-instances/${uuid}/ssh-keys`)
          .then((resp) => {
            if (!resp.sshKey) return
            this.dbData.vm[this.windowData.dataUuid].sshKey = resp.sshKey
            this.updateDbRow({
              tableName: 'vm',
              id: this.windowData.dataUuid,
              data: this.dbData.vm[this.windowData.dataUuid]
            })
          })
      },
      //查询三层网络
      queryL3Network () {
        return rpc.query('l3-networks', {
          q: `vmNic.vmInstanceUuid=${this.windowData.dataUuid}`
        }).then((resp) => {
          let vpcNetworkUuidList = resp.inventories.filter((item) => item.type === 'L3VpcNetwork').map((item) => item.uuid)
          let otherNetworkUuidList = resp.inventories.filter((item) => item.type !== 'L3VpcNetwork').map((item) => item.uuid)
          return this.updateWindow({
            vpcNetworkUuidList,
            otherNetworkUuidList,
            l3NetworkUuidList: vpcNetworkUuidList.concat(otherNetworkUuidList)
          })
        })
      },
      //查询虚拟Ip
      queryVip: function () {
        return rpc.query('vips', {
          q: [`l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, `l3NetworkUuid?=${this.windowData.l3NetworkUuidList}`]
        }).then((resp) => {
          let noPeerL3Vips = resp.inventories.filter(item => {
            return !item.peerL3NetworkUuids && (!item.useFor || item.useFor.split(',').every(it => it !== 'SNAT'))
          })
          let associatedVips = resp.inventories.filter(item => {
            return this.dbData.vm[this.windowData.dataUuid].virtualRouterVips.some(uuid => uuid === item.uuid)
          })
          let candidateVips = noPeerL3Vips.concat(associatedVips)
          let useForObj = {}
          candidateVips.forEach(item => {
            if (!item.useFor) return
            item.useFor.split(',').forEach(it => {
              if (useForObj[it]) {
                useForObj[it].push(item.uuid)
              } else {
                useForObj[it] = [item.uuid]
              }
            })
          })
          let forCustomizedVipUuidList = candidateVips.filter(item => !item.useFor || item.useFor.split(',').every(it => it !== 'SNAT')).map(item => item.uuid)
          return this.updateWindow({
            forCustomizedVipUuidList,
            forEipUuidList: useForObj['Eip'] || [],
            forLoadBalancerUuidList: useForObj['LoadBalancer'] || [],
            forPortForwardingUuidList: useForObj['PortForwarding'] || [],
            forSNATUuidList: useForObj['SNAT'] || [],
            forIPsecUuidList: useForObj['IPsec'] || []
          })
        })
      },

      inStatuses () {
        let  statuses = [];
        if(!this.vpcVRouter) return true;
        for(let i in arguments) {
          statuses.unshift(arguments[i])
        }
        let instatus = statuses.some((status) => status === this.vpcVRouter.status);
        return instatus;
      },

      canMigrate () {
        let self = this
        let uuid = self.windowData.dataUuid
        if (self.inStates('Stopped') && self.dbData.vmInstancesCapabilities[uuid] && self.dbData.vmInstancesCapabilities[uuid].VolumeMigration) {
          return true
        } else if (self.canLiveMigrate() && self.inStates('Running')) {
          return true
        }
        return false
      },

      canLiveMigrate () {
        let uuid = this.windowData.dataUuid
        if (this.dbData.common.isAdmin) {
          let windows = ['Windows', 'WindowsVirtio']
          if (windows.indexOf(this.dbData.vm[uuid].platform) > -1 && this.getPrimaryStorageType(uuid) === 'LocalStorage') {
            return false
          }
        }
        if (this.dbData.vmInstancesCapabilities[uuid]) {
          return this.dbData.vmInstancesCapabilities[uuid].LiveMigration
        }
        return false
      },

      canOpenConsole () {
        return !this.inStates('Connection') && this.inStates('Running')
      },

      canSetVmConsolePassword () {
        return !this.consolePasswordIsSet([this.windowData.dataUuid])
      },

      canDeleteConsolepassword () {
        return this.dbData.vmInstancesConsolePassword[this.windowData.dataUuid] && this.dbData.vmInstancesConsolePassword[this.windowData.dataUuid].hasPassword
      },
      //迁移
      detailMigrate () {
        let self = this
        let vmUuid = self.windowData.dataUuid;
        if (self.inStates('Running')) {
          rpc.query(`vm-instances/${vmUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid);
              self.hostSingleMessage = {
                hostUuidList: hostUuidList,
                type: 'migrate',
                vmUuid
              }
              self.showHostSingleDlg = true;
            })
        } else {
          let rootVolumeUuid
          self.dbData.vm[vmUuid].allVolumes.forEach((item) => {
            if (item.type === 'Root') rootVolumeUuid = item.uuid
          })
          rpc.query(`volumes/${rootVolumeUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid)
              self.hostSingleMessage = {
                hostUuidList: hostUuidList,
                type: 'migrate',
                vmUuid
              }
              self.showHostSingleDlg = true;
            })
        }
      },

      closeHostSingleDlg(param) {
        let self = this;
        if(param) {
          self.migrate(param.vmUuid, param.uuid)
        }
        self.showHostSingleDlg = false;
      },

      detailOperation(operation) {
        let self = this,
        uuidList = [self.windowData.dataUuid],
        options = {
          uuidList,
          title: `vpcVRouter.${operation}`,
          description: `vpcVRouter.info.${operation}Confirm`,
          warning: `vpcVRouter.${operation}Warning`,
          ok: (isConfirm) => {
            if(operation === 'delete') {
              if (!isConfirm) return;
              this[operation](uuidList).then(() => {
                self.$router.push({name: 'vpcvrouter'})
              })
            }
            else this[operation](uuidList).then(() => self.init())
          },
          icon: 'virtual_router_popupico',
          getName: (uuid) => {
            return this.dbData.vm[uuid].name;
          }
        };
        if(operation === 'delete') {
          options['warning'] = `vpcVRouter.info.${operation}Warning`;
          options['isChecked'] = true;
          options['checkBoxText'] = '我已知晓上述风险';
        }
        if(operation === 'reboot') {
          delete options.warning;
          options['isChecked'] = true;
          options['checkBoxText'] = self.$t('common.rebootRouter');
        }
        if(operation === 'stop') {
          delete options.warning;
        }
        this.openDialog('ConfirmDlg', options)
      },

      detailStart() {
        let self = this;
        self.start([self.windowData.dataUuid], self.init)
      },

      detailOpenConsole() {
        this.openConsole(this.windowData.dataUuid)
      },

      pageDeleteVmConsolePassword() {
        let self = this;
        self.openDialog('ConfirmDlg',{
          uuidList: [self.windowData.dataUuid],
          title: `vpcVRouter.cancelConsolePassword`,
          description: `vpcVRouter.cancelConsolePassword_Confirm`,
          ok: (isReboot) => {
            self.deleteVmConsolePassword([self.windowData.dataUuid], isReboot);
          },
          icon: 'virtual_router_popupico',
          getName: (uuid) => {
            return this.dbData.vm[uuid].name;
          }
        })
      },

      canDeleteVmConsolePassword () {
        return this.consolePasswordIsSet(this.windowData.dataUuid)
      },

      pageSetVmConsolePassword() {
        let self = this;
        self.openDialog('ModifyVpcVRouterDlg', {
          ok: (msg, isReboot) => {
            self.setVmConsolePassword(self.windowData.dataUuid, msg, isReboot).then(() => {
              self.$forceUpdate()
            })
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
  @import '../../../style/mixins';

  .icon {
    .detail-icon('~assets/vpc_vrouter_ico.svg')
  }
  .console{
    width: 30px;
    height: 30px;
    background-image: url('~assets/open_console.svg');
    cursor: pointer;
    background-repeat: no-repeat;
    position: relative;
    display: inline-block;
    .console-label{
      display: none;
      padding: 10px;
      position: absolute;
      top: 35px;
      width: 70px;
      left: -25px;
      color: #409EFF;
      border: 1px solid #3c73b9;
      background: #fff;
      text-align: center;
      z-index: 2;
      font-size: 12px;
    }
    &:hover{
      .console-label{
        display: inline-block;
      }
    }
  }
  .console-container{
    width: 100%;
    text-align: center;
    display: inline-block;
    height: 30px;
    position: absolute;
    top: 14px;
  }
</style>
