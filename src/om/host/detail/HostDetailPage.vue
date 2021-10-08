<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">物理机详情</span>
       <span @click="$router.push({name: 'host'})" class="create-back detail-header-item"><i
         class="el-icon-back"></i>
        回到物理机列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.hostActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" :class="{'disabled-text': inStates('Enabled')}" @click="!inStates('Enabled') && detailEnable()">{{$t('common.enable')}}</a>
              <a :class="{'disabled-text': inStates('Disabled')}" @click="!inStates('Disabled') && detailDisable()">{{$t('common.disable')}}</a>
              <a @click="!inStates('Maintenance') && detailReconnect()"  :class="{'disabled-text':inStates('Maintenance')}">{{$t('common.reconnect')}}</a>
              <a @click="!inStates('Maintenance') && !inStatus('Disconnected', 'Connecting') && detailIntoMaintain()"  :class="{'disabled-text':inStates('Maintenance') || inStatus('Disconnected', 'Connecting')}">{{$t('common.intoMaintain')}}</a>
              <a style="margin-bottom: 12px;" @click="detailDelete(windowData.dataUuid)">{{$t('common.destroyed')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
         <el-tabs @tab-click="handleTabChange" tabPosition="bottom"
                  v-model="activeName">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
          <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
           <el-tab-pane :label="$t('common.peripheral')" name="peripheral"></el-tab-pane>
           <el-tab-pane :label="$t('common.blockDevice')" name="lun"></el-tab-pane>
           <el-tab-pane :label="$t('common.monitorData')" name="monitorData"></el-tab-pane>
           <el-tab-pane :label="$t('vm.monitoralarm')" name="monitoralarm"></el-tab-pane>
           <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="host_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="model.host.state"/>
            <detail-info-state outer-class-name="detail-page-state" :state="model.host.status"/>
          </div>
          <detail-name class="name" :param="getParamName()"/>
          <detail-description class="description" :param="getDescription()"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-input :param="updateManagementIp()"/>
          <detail-row :param="{
            title: 'common.hypervisorType',
            content: model.host.hypervisorType
          }"/>
          <detail-row :param="{
            title: 'common.cpuModel',
            content: model.host.cpuModel
          }"/>
          <detail-switch  v-if="dbData.common.isAdmin"
            :param="{
                  showSwitch: dbData && dbData.common && !dbData.common.isOpensource,
                  getTitle: () => $t('host.hostIommuState'),
                  getLeftText: () => $t('common.disable'),
                  getRightText: () => $t('common.enable'),
                  getValue: () => {
                    return windowData.hostIommuState === 'Enabled' ? true : false
                  },
                  setValue: val => {sethostIommuState(windowData.dataUuid) },

                  permission: ['VM.LICENSE_BASIC_PAID'],
                  doc: 'iommuState'
          }"/>
          <detail-row  v-if="dbData.common.isAdmin"
            :param="{
              title: 'host.hostIommuStatus',
              content:  windowData.hostIommuStatus ? $t('state.' + windowData.hostIommuStatus) : ''
            }"
          />
          <detail-switch  v-if="dbData.common.isAdmin"
                          :param="{
                  showSwitch: !dbData.common.isOpensource,
                  getTitle: () => $t('host.EPT'),
                  getLeftText: () => $t('common.close'),
                  getRightText: () => $t('common.open'),
                  disabled: !inStates('Maintenance'),
                  getValue: () => !model.host.ept,
                  setValue: val => { setEPTSupport() },
                  permission: 'LICENSE_BASIC_PAID',
                  doc: 'ept'
          }"/>
          <detail-row
            :param="{
              title: 'host.hostOS',
              content: !model.host.updateOS ? model.host.hostOS : $t(`host.updateOS`)
            }"
          />
          <detail-input :param="updateUserName()"/>
          <detail-input :param="updatePassword()"/>
          <detail-input :param="updatePort()"/>
          <detail-row
            :param="{
             title: 'common.createDate',
             content: model.host.createDate && formatDatetime(new Date(model.host.createDate))
            }"
          />
          <detail-row
            :param="{
             title: 'common.lastOpDate',
             content: model.host.lastOpDate && formatDatetime(new Date(model.host.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.configure')}}
        </div>
        <detail-row
          :param="{
            title: 'common.totalCpu',
            content: model.host.totalCpuCapacity
          }"
        />
        <detail-row
          :param="{
            title: 'common.availableCpu',
            content: model.host.availableCpuCapacity
          }"
        />
        <detail-row
          :param="{
            title: 'common.totalSize',
            content: bytesToSize(model.host.totalMemoryCapacity)
          }"
        />
        <detail-row
          :param="{
            title: 'common.reserveSize',
            content: model.host.reservedMemory
          }"
        />
        <detail-row
          :param="{
            title: 'common.availableSize',
            content: model.host.availableMemory > 0 ? bytesToSize(model.host.availableMemory) : $t('common.noAvailableMemory')
          }"
        />
        <detail-row
          :param="{
            title: 'common.totalCapacity',
            content: bytesToSize(model.host.totalCapacity)
          }"
        />
        <detail-row
          :param="{
            title: 'common.availableCapacity',
            content: model.host.availableCapacity > 0 ? bytesToSize(model.host.availableCapacity) : $t('common.noAvailableCapacity')
          }"
        />
        <detail-row
          :param="{
            title: 'common.totalPhysicalCapacity',
            content: bytesToSize(model.host.totalPhysicalCapacity)
          }"
        />
        <detail-row
          :param="{
            title: 'common.availablePhysicalCapacity',
            content: model.host.availablePhysicalCapacity > 0 ? bytesToSize(model.host.availablePhysicalCapacity) : $t('host.unAvailablePhysicalCapacity')
          }"
        />
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model.host.uuid,
            copy(){
              return true;
            }
          }"
        />
        <detail-row
          :param="{
            title: 'common.cluster',
            handler(){
              $router.push({name: 'detailCluster', params: {uuid: model.cluster.uuid}})
            },
            content: model.cluster.name
          }"
        />
        <detail-row
          :param="{
            title: 'common.zone',
            handler(){
               $router.push({name: 'detailZone', params: {uuid: model.host.zoneUuid}})
            },
            content:  dbData.zone[model.host.zoneUuid] && dbData.zone[model.host.zoneUuid].name
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vm'">
       <vm-tab-list :param="{conditions: `hostUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'peripheral'">
      <peripheral-tab-list :param="{conditions: `hostUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'lun'">
      <lun-tab-list :param="{conditions: `scsiLunHostRef.hostUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitoralarm'">
      <zwatch-alaram-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'host' }" />
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitorData'">
      <host-monitor :param="windowData.dataUuid"/>
    </div>
    <div slot="footer">
      <clone-vm v-if="showCloneVm" @close="closeCloneVm" :param="cloneVmMessage"></clone-vm>
      <create-vm-image v-if="showCreateVmImage" :param="createVmImageMessage"
                       @close="closeCreateVmImage"></create-vm-image>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import DetailInfoState from "../../../component/DetailInfoState";
  import HostList from 'src/om/host/List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import VmTabList from "src/om/host/component/HostVmTabList";
  import CloneVm from "../../../ecs/ecsInstance/component/CloneVm";
  import VmMethods from 'src/ecs/ecsInstance/Methods';
  import CreateVmImage from "../../../ecs/ecsInstance/component/CreateVmImage";
  import PeripheralTabList from "../../cluster/components/PeripheralTabList";
  import LunTabList from "src/om/host/component/LunTabList";
  import LogList from "../../../component/LogList";
  import ZwatchAlaramForResource from "../../zwatchalarm/ZwatchAlaramForResource";
  import HostMonitor from "src/om/host/component/HostMonitorTab";

  export default {
    name: "HostDetailPage",
    mixins: [HostList, VmMethods],
    components: {
      HostMonitor,
      ZwatchAlaramForResource,
      LogList,
      LunTabList, PeripheralTabList, CreateVmImage, CloneVm, VmTabList, DetailInfoState, DetailTemplate},
    data(){
      return {
        activeName: 'info',
        showCapacity: false,
        cpuModelIsIntel: false,
        showCloneVm: false,
        cloneVmMessage: {},
        showCreateVmImage: false,
        createVmImageMessage: {},
      }
    },
    computed: {
      model(){
        let self = this, host = {}, hostA={}, cluster = {}, uuid = this.windowData.dataUuid;
        host = _.get(self, `dbData.host[${uuid}]`) || {};
        hostA  = _.get(self, `dbData.hostA[${uuid}]`) || {};
        host = _.assign({}, host,hostA);
        if(host && host.clusterUuid){
          cluster = _.get(self, `dbData.cluster[${host.clusterUuid}]`) || {}
        }
        return _.assign({}, {cluster: cluster}, {host: host})
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params ? self.$route.params.uuid : '';
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        dataUuid,
        methods: {
          queryList: self.detailQuery
        }
      })
        .then(() => {
          self.detailQuery();
        })
    },
    methods: {
      ...Utils,
      closeCloneVm(param) {
        let self = this;
        if (param) {
          let names = [];
          if (param.numbers > 1) {
            for (let i = 0; i < param.numbers; i++) {
              names.push(`${param.name}-${i + 1}`)
            }
          } else {
            names.push(`${param.name}`)
          }
          param.names = names;
          let uuid = param.uuid;
          delete param.name;
          delete param.numbers;
          delete param.uuid;
          self.clone(uuid, param);
        }
        self.showCloneVm = false;
      },
      vmClone(uuid){
        this.openClonePanel(uuid);
      },
      vmCreateImage(uuid) {
        let self = this;
        self.createVmImageMessage = {
          primaryStorageType: self.getPrimaryStorageType(uuid),
          vmUuid: uuid,
        };
        self.showCreateVmImage = true;
      },
      closeCreateVmImage(param) {
        let self = this;
        if (param) {
          param.vmUuid = self.createVmImageMessage.vmUuid;
          param.volumeUuid = this.dbData.vm[self.createVmImageMessage.vmUuid].rootVolumeUuid;
          this.createImage(param)
        }
        self.showCreateVmImage = false;
      },
      handleTabChange(){

      },
      detailQuery () {
        let self = this;
        return this.query(this.windowData.dataUuid).then(() => {
          return self.getHostIOMMUInfos()
        }).then(() => {
          return self.getLocalCapacity()
        }).then(() => {
          return self.queryForAssistant()
        }).then(() => {
          return self.isUpdatingOS()
        }).then(() => {
          return self.getCpuMemoryCapacity()
        })
          .then(() => {
            return self.getCPUModel();
          })
      },
      getCpuMemoryCapacity () {
        return rpc.query('hosts/capacities/cpu-memory', {
          hostUuids: [this.windowData.dataUuid]
        }).then(respCpuMemory => {
          return this.updateDbRow({
            tableName: 'hostA',
            id: this.windowData.dataUuid,
            data: respCpuMemory
          })
        })
      },
      isUpdatingOS () {
        const self = this
        const uuid = self.windowData.dataUuid
        let host = self.dbData.host[uuid]
        return rpc.query('longjobs', {
          q: ['state!=Succeeded', 'name=APIUpdateClusterOSMsg', `jobData~=%25${host.clusterUuid}%25`]
        }).then((resp) => {
          let updateOS = {
            updateOS: false
          }
          if (resp.inventories.length > 0) {
            updateOS.updateOS = true
          }
          return self.updateDbRow({
            tableName: 'hostA',
            id: uuid,
            data: updateOS
          })
        })
      },
      getHostIOMMUInfos () {
        let uuid = this.windowData.dataUuid
        let tasks = []
        let p = null
        let hostIOMMU = {}
        p = rpc.query(`pci-device/hosts/${uuid}/state`).then(resp => {
          hostIOMMU.hostIommuState = resp.state
        })
        tasks.push(p)
        p = rpc.query(`pci-device/hosts/${uuid}/status`).then(resp => {
          hostIOMMU.hostIommuStatus = resp.status
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return this.updateWindow(hostIOMMU)
        })
      },
      getLocalCapacity () {
        return rpc.query('primary-storage', {q: `cluster.host.uuid=${this.windowData.dataUuid}`}).then(resp => {
          let ps = resp.inventories[0]
          if (ps && ps.type === 'LocalStorage') {
            this.showCapacity = true
            return rpc.query(`primary-storage/local-storage/${ps.uuid}/capacities?hostUuid=${this.windowData.dataUuid}`).then(resp => {
              return this.updateDbRow({
                tableName: 'hostA',
                id: this.windowData.dataUuid,
                data: resp.inventories[0]
              })
            })
          } else {
            this.showCapacity = false
          }
        })
      },
      queryForAssistant () {
        if (this.windowData.hostIommuState !== 'Enabled' || this.windowData.hostIommuStatus !== 'Inactive') {
          this.deleteAllAssistant()
          return
        }
        let id = `assistant-${this.genUniqueId()}`
        this.createAssistant({
          id,
          title: 'iommuTitle',
          hide: false,
          content: 'rebootHost',
          ownerId: this.windowData.id,
          operation: 'noResource',
          handler: null
        })
      },
      getParamName(){
        let self = this;
        return {
          getValue(){
           return self.model.host.name;
          },
          setValue(value){
            self.updateResource('hosts', 'updateHost', 'name', 'host', value);
          },
          canEdit(){
            return true;
          }
        }
      },
      getDescription(){
        let self = this;
        return {
          getValue(){
            return self.model.host.description;
          },
          setValue(value){
            self.updateResource('hosts', 'updateHost', 'description', 'host', value);
          },
          canEdit(){
            return true;
          }
        }
      },
      updateManagementIp(){
        let self = this;
        return{
          title: 'common.managementIp',
          getValue() {
            return self.model.host.managementIp;
          },
          setValue(value){
            self.updateResource('hosts/kvm', 'updateKVMHost', 'managementIp', 'host', value);
          },
          canEdit(){
            return true;
          },
          fontSize: '14px'
        }
      },
      sethostIommuState: function (uuid) {
        const self = this
        let hostIommuState = self.windowData.hostIommuState
        let state = 'Enabled'
        if (self.windowData.hostIommuState === 'Enabled') {
          state = 'Disabled'
        } else if (self.windowData.hostIommuState === 'Disabled') {
          state = 'Enabled'
        }
        let event = self.createEvent(`host.iommuState.${state}`, self.model.host.name)
        rpc.update('pci-device/hosts', uuid, {
          updateHostIommuState: {
            state: state
          }
        }, event).then((resp) => {
          self.updateWindow({ hostIommuState: `${state}` }).then(() => {
            self.queryForAssistant()
          })
          self.incEventSuccess(event)
        }, () => {
          self.updateWindow({ hostIommuState }).then(() => {
            self.queryForAssistant()
          })
          self.incEventFail(event)
        })
      },
      inStates (...stateList) {
        return !stateList.every(item => item !== this.model.host.state)
      },
      inStatus (...statusList) {
        return !statusList.every(item => item !== this.model.host.status)
      },
      setEPTSupport () {
        let ept = this.model.host.ept
        let event = this.createEvent('host.action.updateEptSupport', this.model.host.name)
        let p = null
        if (!ept) {
          p = rpc.create(`system-tags`, {
            resourceUuid: this.windowData.dataUuid,
            tag: `pageTableExtensionDisabled`,
            resourceType: 'HostVO'
          }, event)
        } else {
          p = rpc._delete(`tags/${this.model.host.eptUuid}`, null, event)
        }
        return p.then(() => {
          this.incEventSuccess(event)
          this.detailQuery()
        }, () => {
          this.incEventFail(event)
        })
      },
      getCPUModel () {
        let uuid = this.windowData.dataUuid
        return rpc.query('system-tags', {q: [`resourceUuid=${uuid}`, `tag~=hostCpuModelName%25`]}).then(resp => {
          if (resp.inventories.length === 0) return
          let tag = resp.inventories[0].tag
          this.cpuModelIsIntel = _.includes(tag.toLowerCase(), 'intel')
        })
      },
      updateUserName(){
        let self = this;
        return {
          title: 'user.name',
          getValue() {
            return self.model.host.username;
          },
          setValue(value){
            self.updateResource('hosts/kvm', 'updateKVMHost', 'username', 'host', value);
          },
          canEdit(){
            return true;
          },
          fontSize: '14px'
        }
      },
      updatePassword(){
        let self = this;
        return {
          type: 'password',
          title: 'common.password',
          getValue() {
            return self.model.host.password;
          },
          setValue(value){
            self.updateResource('hosts/kvm', 'updateKVMHost', 'password', 'host', value);
          },
          canEdit(){
            return true;
          },
          fontSize: '14px'
        }
      },
      updatePort(){
        let self = this;
        return {
          title: 'common.sshPort',
          getValue() {
            return self.model.host.sshPort;
          },
          setValue(value){
            self.updateResource('hosts/kvm', 'updateKVMHost', 'sshPort', 'host', value);
          },
          canEdit(){
            return true;
          },
          fontSize: '14px'
        }
      },
      detailEnable(){
        let self = this;
        self.enable([self.windowData.dataUuid])
      },
      detailDisable(){
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'host.disable',
          description: 'host.disableHost',
          warning: 'host.disableWaring',
          icon: 'host_popupico',
          getName(uuid){
            return self.dbData.host[uuid].name
          },
          uuidList:[self.windowData.dataUuid],
          ok: () => {
            self.disable([self.windowData.dataUuid]);
          }
        })
      },
      detailReconnect(){
        let self = this;
        let uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg',{
          title: 'host.reconnect',
          warning: 'host.reconnectWarning',
          uuidList: uuidList,
          icon: 'host_popupico',
          ok: () => {
            return self.reconnect(uuidList).then(() => {
              return self.detailQuery()
            })
          },
          getName(uuid){
            return self.dbData.host[uuid].name
          }
        })
      },
      detailIntoMaintain(){
        let self = this, uuidList = [self.windowData.dataUuid];
        this.openDialog('ConfirmDlg', {
          uuidList,
          title: 'common.intoMaintain',
          description: 'host.maintainHost',
          icon: 'host_popupico',
          getName(uuid){
            return self.dbData.host[uuid].name;
          },
          ok: () => {
            self.maintain(uuidList).then(() => self.detailQuery())
          }
        })
      },
      detailDelete(){
        let self = this, uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'common.destroyHost',
          description: 'host.deleteHost',
          warning: 'host.deleteWarning',
          icon: 'host_popupico',
          getName(uuid){
            return self.dbData.host[uuid].name
          },
          uuidList,
          ok: () => {
            return self.delete(uuidList).then(() => {
                self.detailQuery()
            })
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
 @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/host_large.svg');
  }
</style>
