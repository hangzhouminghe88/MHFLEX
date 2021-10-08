<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">云路由器详情</span>
      <span class="detail-header-item" @click="$router.push({name: 'virtualrouter'})">
        <span class="create-back">
          <i class="el-icon-back"></i>
          <span style="font-size: 12px">
            回到云路由器列表
          </span>
        </span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a id="common-reconnect" style="padding-top: 12px;"
                  @click="pageReconnect()">{{ $t("common.reconnect") }}</a>
                  <a @click="virtualRouter && canMigrate.platform && canMigrate() && inStates('Stopped', 'Running') && pageMigrate()"
                     :class="{ 'disabled-text': !(virtualRouter && canMigrate.platform && canMigrate() && inStates('Stopped', 'Running'))}">{{ $t("vm.migrate") }}</a>
                  <a @click="inStates('Running') && pageOpenConsole()"
                     :class="{ 'disabled-text': !inStates('Running')}">{{ $t("vm.console") }}</a>
                  <a @click="inStates('Running', 'Stopped') && !consolePasswordIsSet([windowData.dataUuid]) && pageSetVmConsolePassword()"
                     :class="{ 'disabled-text': !inStates('Running', 'Stopped') || consolePasswordIsSet([windowData.dataUuid])}">{{ $t("common.setConsolePassword") }}</a>
                  <a :class="{ 'disabled-text': !(inStates('Running', 'Stopped') && consolePasswordIsSet([windowData.dataUuid]))}"
                     @click="inStates('Running', 'Stopped') && consolePasswordIsSet([windowData.dataUuid]) && pageDeleteVmConsolePassword()">{{ $t("vm.deleteConsolePassword") }}</a>
                  <a  @click="pageDelete()"
                     style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.config')" name="config"></el-tab-pane>
        <el-tab-pane :label="$t('common.monitor')" name="monitor"></el-tab-pane>
        <el-tab-pane :label="$t('common.zwatchAlarm')" name="zwatchAlarm"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="virtual_router"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state"
                               v-show="virtualRouter && virtualRouter.state"
                               :state="virtualRouter && virtualRouter.state"/>
            <div style="position: relative; color: #005596;">
              <img style="position: absolute; left: 30px; top: 8px;" src="~assets/kvm.svg" />
              <div style="padding-left: 0px;">
                {{virtualRouter && virtualRouter['hypervisorType']}}
              </div>
            </div>

            <span class="console-container">
               <span class="console" v-if="inStates('Running')"
                     @click="inStates('Running') && pageOpenConsole()">
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

          <detail-input
            :param="{
              title: 'CPU',
              getValue: () => {
                return virtualRouter && virtualRouter.cpuNum
              },
              setValue: (newVal) => {
                if(virtualRouter && virtualRouter.cpuNum && virtualRouter.cpuNum === newVal) return;
              },
              fontSize: '14px'
            }"
          />

          <div class="detail-row editable">
            <div class="detail-title">
              {{$t('common.memorySize')}}
            </div>
            <span v-if="!editMemorySize" class="detail-content">{{ virtualRouter && bytesToSize(virtualRouter.memorySize) }}</span>
            <span @click.stop="editMemorySize = true"
                  class="edit-icon"
                  v-if="!editMemorySize && virtualRouter">
                   <i class="el-icon-edit"></i>
               </span>
            <span v-if="virtualRouter && virtualRouter.hypervisorType !== 'ESX'" v-show="!editMemorySize && !inStates('Destroyed') && !inStates('Paused')" v-permission="'VM.UPDATE'" class="edit-icon" @click.stop="editMemorySize = true; newMemorySize = virtualRouter.memorySize; $nextTick(() => { $refs.memoryInput.focus() })" ref="memoryInput" />
             <detail-size-editor v-if="virtualRouter && editMemorySize" style="margin-right: 70px;" class="editor" :value="virtualRouter.memorySize" :size-list="['M', 'G', 'T']" unit="B" :finish="memorySizeEditEnd" />
            </div>
          </div>

          <div class="detail-row editable">
            <div class="detail-title">
              {{$t('common.platform')}}{{$t('common.colon')}}
            </div>
            <div class="detail-container">
              <span class="detail-content" v-if="!editPlatform">{{virtualRouter && virtualRouter.platform}}</span>
              <span @click.stop="editPlatform = true"
                    class="edit-icon"
                    v-if="!editPlatform && virtualRouter">
                   <i class="el-icon-edit"></i>
               </span>
              <detail-dropdown2 ref="dropdown" v-show="editPlatform" :param="{
                getOptionList: () => {
                  return platformList;
               },
                getIndex: () => {
                 return platformList.findIndex((item) => {
                   if(virtualRouter){
                      return item.name === virtualRouter.platform
                    }
                 })
               },
                setIndex: (index) => {
                   return updateVmInstance('name', platformList[index].name)
                 },
                style: {width: '100px', margin: '0px', height: '40px'}
              }"></detail-dropdown2>
            </div>
          </div>

          <detail-row
            :param="{
              title: 'common.defaultIp',
              content: virtualRouter && virtualRouter.defaultRouteL3NetworkUuid && getDefaultL3NetworkIp(virtualRouter.uuid),
              copy: true
            }"
          />

        <detail-row
          :param="{
              title: 'mac',
              content: getMac,
              copy: true
            }"
        />

        <detail-row
          :param="{
              title: 'common.haLevel',
              content: virtualRouter && virtualRouter.haLevel && getHaLevel(windowData.dataUuid),
              copy: true
            }"
        />

        <detail-row v-if="!dbData.common.isOpensource && dbData.common.isAdmin && virtualRouter && virtualRouter.hypervisorType !== 'ESX'"
          :param="{
              title: 'common.owner',
              content: virtualRouter && dbData.account[virtualRouter.accountUuid] && dbData.account[virtualRouter.accountUuid].name,
            }"
        />

        <detail-row
          :param="{
              title: 'common.createDate',
              content: virtualRouter && virtualRouter.createDate && formatDatetime(new Date(virtualRouter.createDate)),
            }"
        />

        <detail-row
          :param="{
              title: 'common.lastOpDate',
              content: virtualRouter && virtualRouter.lastOpDate && formatDatetime(new Date(virtualRouter.lastOpDate)),
            }"
        />

        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>

        <detail-row
          :param="{
              title: 'common.uuid',
              content: windowData.dataUuid,
              copy: true
            }"
        />

        <detail-row
          :param="{
             title: 'common.image',
             content: virtualRouter && virtualRouter.imageUuid && getVirtualrouterImageName(windowData.dataUuid),
             handler: () => {
               $router.push({name: 'detailImage', params: {uuid: virtualRouter.imageUuid}})
             }
          }"
        />

        <detail-row
          :param="{
             title: 'common.virtualRouterOffering',
             content: virtualRouter && virtualRouter.instanceOfferingUuid && getInstanceOfferingName(windowData.dataUuid),
             handler: () => {
               $router.push({name: 'detailInstanceOffering', params: {uuid: virtualRouter.instanceOfferingUuid}})
             }
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType === 'KVM'"
          :param="{
             title: 'common.host',
             content: virtualRouter && virtualRouter.hostUuid && getHostName(windowData.dataUuid),
             handler: () => {
               $router.push({name: 'detailHost', params: {uuid: virtualRouter.hostUuid}})
             }
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType === 'ESX'"
                    :param="{
             title: 'common.host',
             content: virtualRouter && virtualRouter.hostUuid && getHostName(windowData.dataUuid),
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType === 'KVM'"
          :param="{
             title: 'common.lastHost',
             content: virtualRouter && virtualRouter.lasthostUuid && getHostName(windowData.dataUuid),
             handler: () => {
               $router.push({name: 'detailHost', params: {uuid: virtualRouter.lasthostUuid}})
             }
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType === 'ESX'"
                    :param="{
             title: 'common.lastHost',
             content: virtualRouter && virtualRouter.lasthostUuid && getHostName(windowData.dataUuid),
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType === 'KVM'"
          :param="{
             title: 'common.cluster',
             content: virtualRouter && virtualRouter.clusterUuid && getClusterName(windowData.dataUuid),
             handler: () => {
               $router.push({name: 'detailCluster', params: {uuid: virtualRouter.clusterUuid}})
             }
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType === 'ESX'"
                    :param="{
             title: 'common.cluster',
             content: virtualRouter && virtualRouter.clusterUuid && getClusterName(windowData.dataUuid),
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType !== 'ESX' && dbData.common.isAdmin"
          :param="{
             title: 'vm.remoteConnectionAddress',
             content: virtualRouter && virtualRouter.vmConsoleAddress,
          }"
        />

        <detail-row v-if="virtualRouter && virtualRouter.hypervisorType !== 'ESX'"
          :param="{
             title: 'vrouterroutetable.Table',
             content: virtualRouter && virtualRouter.routeTableUuid && dbData.vRouterRouteTable[virtualRouter.routeTableUuid].name,
             handler: () => {
               $router.push({name: 'detailvrouterroutetable', params: {uuid: virtualRouter.routeTableUuid}})
             }
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'config'">
      <virtual-router-config-tab-list :param="{conditions: {vmUuid: windowData.dataUuid}, uuid: windowData.dataUuid}"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'monitor'">
      <vm-monitor :param="windowData.dataUuid"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'zwatchAlarm'">
      <zwatch-alaram-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'vRouter' }"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>

    <div slot="footer">
      <host-single-dlg :model="showHostSingleDlg"
                       :message="hostSingleMessage"
                       v-if="showHostSingleDlg"
                       @close="closeHostSingleDlg"/>
    </div>
  </detail-template>
</template>

<script>
  import ZwatchAlaramForResource from "../../../om/zwatchalarm/ZwatchAlaramForResource";
  import VirtualRouterConfigTabList from "../components/VirtualRouterConfgurationTabList";
  import VmMonitor from "../../../ecs/ecsInstance/component/VmMonitor";
  import DetailDropdown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import DetailInfoState from "../../../component/DetailInfoState";
  import HostSingleDlg from 'src/dialog/HostSingleSelectDlg';
  import DetailTemplate from "src/component/DetailTemplate";
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import List from '../List';

  export default {
    name: "DetailVirtualRouterPage",
    components: {
      LogList,
      HostSingleDlg,
      ZwatchAlaramForResource,
      VmMonitor, VirtualRouterConfigTabList, DetailInfoState, DetailTemplate, 'detail-dropdown2': DetailDropdown},

    mixins: [WindowBase, List],

    data() {
      return {
        currTab: 'info',
        virtualRouter: {},
        editMemorySize: false,
        platformList: [
          {name: 'Linux'},
          {name: 'Windows'},
          {name: 'WindowsVirtio'},
          {name: 'Other'},
          {name: 'Paravirtualization'}
        ],
        editPlatform: false,
        showHostSingleDlg: false,
        hostSingleMessage: {},
      }
    },

    computed: {
      getMac() {
        if(this.virtualRouter && this.virtualRouter.vmNics)
        for(let i in this.virtualRouter.vmNics) {
          return this.virtualRouter.defaultRouteL3NetworkUuid === this.virtualRouter.vmNics[i].l3NetworkUuid ? this.virtualRouter.vmNics[i].mac : '';
        }
      },
      selectedList() {
        return [this.windowData.dataUuid]
      },
      isSelected() {
        return true;
      },
      isSingleSelected() {
        return true;
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.query
        }
      }).then(() => {
        self.query();
      })
    },

    mounted() {
      let self = this;
      window.addEventListener('click', (event) => {
        if(event.target.className === 'dropdown' || event.target.className === 'text' || event.target.className === 'el-icon-arrow-up') {
          return;
        }
        self.editPlatform = false;
      })
    },

    methods: {
      ...Utils,
      //查询
      query () {
        let uuid = this.windowData.dataUuid
        let vmInventories = {}
        rpc.query(`vm-instances/appliances/virtual-routers`, {
          q: `uuid=${this.windowData.dataUuid}`
        }).then((resp) => {
          vmInventories = resp.inventories[0]
          return this.updateDbRow({
            tableName: 'vm',
            id: this.windowData.dataUuid,
            data: vmInventories
          }).then(() => {
            this.virtualRouter = _.get(this.dbData.vRouterRouteTable, this.windowData.dataUuid);
          })
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
                  // id: accountInventories.accountUuid,
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

            p = rpc.query(`vm-instances/${uuid}/capabilities`)
              .then((resp) => {
                vmInventories = _.assign(vmInventories, resp)
                return this.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: vmInventories
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
                // vmInventories.hasConsolePassword = !!resp.password
                // return this.updateDbRow({
                //   tableName: 'vm',
                //   id: uuid,
                //   list: vmInventories
                // })
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
                    return this.updateDbRow({
                      tableName: 'vm',
                      id: uuid,
                      data: vmInventories
                    })
                  })
                })
              tasks.push(p)
            }

            if (this.dbData.common.isAdmin && this.dbData.vm[uuid].state === 'Running') {
              p = rpc.query(`vm-instances/${uuid}/console-addresses`)
                .then((vnsResp) => {
                  if (!vnsResp.success) return
                  // let vnc = {}
                  // vnc.hostIp = vnsResp.hostIp
                  // vnc.port = vnsResp.port
                  // vnc.protocol = vnsResp.protocol
                  let data = _.cloneDeep(this.dbData.vm[uuid])
                  // data.vnc = vnc
                  data.vmConsoleAddress = vnsResp.protocol + '://' + vnsResp.hostIp + ':' + vnsResp.port
                  this.updateDbRow({
                    tableName: 'vm',
                    id: uuid,
                    data
                  })
                })
              tasks.push(p)
            }
            // let tasks = [ queryClusters(), queryHosts(), queryImages(), queryOwners(), queryInstanceOfferings(), getVmConsolePassword(), queryCapabilities(), queryVRouterRouteTable() ]
            Promise.all(tasks).then((resp) => {
              this.updateDbRow({
                tableName: 'vm',
                id: uuid,
                data: vmInventories
              }).then(() => {
                this.virtualRouter = _.get(this.dbData.vm, this.windowData.dataUuid);
              })
            })
          })
      },

      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.virtualRouter && this.virtualRouter[name];
          },
          setValue: (newVal) => {
            if(this.virtualRouter
              && this.virtualRouter[name]
              && this.virtualRouter[name] === newVal) return;
            this.updateVmInstance(name, newVal);
          },
          canEdit: () => {
            return true;
          }
        }
      },

      memorySizeEditEnd (newValue) {
        this.editMemorySize = false
        this.updateVmInstance('memorySize', newValue)
      },

      inStates () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        if (!this.dbData.vm[this.windowData.dataUuid]) return false
        return !stateList.every((item, index, array) => {
          return item !== this.dbData.vm[this.windowData.dataUuid].state
        })
      },

      updateVmInstance(key, newValue) {
        this.editPlatform = false;
        if (this.dbData.vm[this.windowData.dataUuid][key] === newValue) return
        let self = this
        let event = self.createEvent('common.updateInfo' + key, newValue)
        let param = {}
        param[key] = newValue
        rpc.update('vm-instances', self.windowData.dataUuid, {
          'updateVmInstance': param
        }, event)
          .then(resp => {
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'vm',
              id: self.windowData.dataUuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
      },
    },

    destroyed() {
      let self = this;
      window.removeEventListener('click', (event) => {
        if(event.target.className === 'dropdown' || event.target.className === 'text' || event.target.className === 'el-icon-arrow-up') {
          return;
        }
        self.editPlatform = false;
      })
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";

  .icon {
    .detail-icon('~assets/virtual_router.svg')
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
