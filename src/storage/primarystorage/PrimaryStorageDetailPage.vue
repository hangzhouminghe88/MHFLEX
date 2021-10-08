<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">主存储详情</span>
      <span @click="$router.push({name:'primarystorage'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到主存储列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('common.primaryStorageActions')}}</span>
                    </span>
                    <span slot="content">
                        <div class="dropdown-content">
                          <a id="common-start" style="padding-top: 12px;"
                             @click="canEnable() && detailStart(windowData.dataUuid)"
                             :class="{ 'disabled-text': !canEnable()}">{{$t("common.enable")}}</a>
                          <a id="common-stop" @click="canDisable() && detailStop(windowData.dataUuid)"
                             :class="{'disabled-text': !canDisable()}">{{$t("common.disable")}}</a>
                          <a id="common-reconnect" @click="detailReconnect(windowData.dataUuid)">{{$t("common.reconnect")}}</a>
                          <a id="common-createVolume"
                             @click="canCreateVolume() && detailCreateVolume(windowData.dataUuid)"
                             :class="{ 'disabled-text': !canCreateVolume() }">{{$t("common.createVolume")}}</a>
                          <a id="common-attachCluster" @click="detailAttach(windowData.dataUuid)">{{$t("common.attachCluster")}}</a>
                          <a id="common-detachCluster" @click="canDetachCluster() && detailDetach(windowData.dataUuid)"
                             :class="{'disabled-text':!canDetachCluster()}">{{$t("common.detachCluster")}}</a>
                          <a id="common-intoMaintain" @click="canMaintenance() && detailMaintain(windowData.dataUuid)"
                             :class="{'disabled-text': !canMaintenance()}">{{$t("common.intoMaintain")}}</a>
                          <a id="common-destroy" style="padding-bottom:12px;"
                             @click="detailDelete(windowData.dataUuid)">{{$t("common.destroy")}}</a>
                        </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.monitoringNode')" name="mon"
                     v-if="primaryStorage && (primaryStorage.type === 'Ceph' || primaryStorage.type === 'Fusionstor')"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.vm')" name="vm"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.volume')" name="volume"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.cluster')" name="cluster"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.host')" name="host"
                     v-if="primaryStorage && primaryStorage.type === 'LocalStorage' "
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.pools')" name="pools" v-if="primaryStorage && primaryStorage.type === 'Ceph'"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.SharedBlock')" name="sharedBlock"
                     v-if="primaryStorage && primaryStorage.type === 'SharedBlock'"
        ></el-tab-pane>
        <el-tab-pane :label="$t('vm.monitor')" name="monitor" v-permission="'LICENSE_BASIC_PAID'" v-if="primaryStorage"
        ></el-tab-pane>
        <el-tab-pane :label="$t('vm.monitoralarm')" name="monitoralarm" v-permission="'LICENSE_BASIC_PAID'"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.clear')" name="clear" v-permission="'LICENSE_BASIC_PAID'" v-if="showTrashTab"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log" v-permission="'LICENSE_BASIC_PAID'"
        ></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="primary_storage_large"/>
          <div class="after-icon">
            <detail-info-state v-if="primaryStorage" outer-class-name="detail-page-state"
                               :state="primaryStorage.state"/>
            <detail-info-state v-if="primaryStorage" outer-class-name="detail-page-state"
                               :state="primaryStorage.status"/>
          </div>

          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row :param="{
                  title: 'common.type',
                  content:primaryStorage && primaryStorage.type
                }"/>
          <div id="common-url" class="detail-row editable"
               v-if="primaryStorage && (primaryStorage.type ==='LocalStorage' || primaryStorage.type ==='NFS' || primaryStorage.type === 'SharedMountPoint' || primaryStorage.type === 'SharedBlock' || primaryStorage.type === 'AliyunNAS' || primaryStorage.type === 'AliyunEBS')">
            <div class="detail-title">
              {{$t("common.url")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container" v-show="!editUrl">
              <detail-long-content style="max-width: 180px;float: left;" :value="primaryStorage.url"/>
              <span v-show="!editUrl && primaryStorage && primaryStorage.type ==='NFS'" class="edit-icon"
                    style="float: left;"
                    @click="editUrl = true; newUrl = rimaryStorage && primaryStorage.url; $nextTick(() => { $refs.urlInput.focus() })"/>
            </div>
            <input class="editor" v-show="editUrl" type="text" v-model="newUrl" ref="urlInput"
                   @keydown.enter="updateResource('primary-storage', 'updatePrimaryStorage', 'url', 'primarystorage', newUrl, detailReconnect); editUrl = false"
                   @blur="updateResource('primary-storage', 'updatePrimaryStorage', 'url', 'primarystorage', newUrl); editUrl = false"
                   @keydown.esc="editUrl = false"/>
          </div>
          <div id="common-storageNetworkCidr" class="detail-row editable" v-if="canDisplayPrimaryStorageGatewayCidr()"
               v-permission="'LICENSE_BASIC_PAID'">
            <div class="detail-title">
              {{$t("common.storageNetworkCidr")}}{{$t("common.colon")}}
            </div>
            <span class="detail-container" v-show="!editstorageNetworkCidr && !dbData.common.isOpensource">{{ getPrimaryStorageGatewayCidr(windowData.dataUuid) }}</span>
            <span v-show="!editstorageNetworkCidr && !dbData.common.isOpensource" class="edit-icon"
                  @click="editstorageNetworkCidr = true; newstorageNetworkCidr = dbData.primarystorage[windowData.dataUuid].primaryStorageGatewayCidr; $nextTick(() => { $refs.storageNetworkCidrInput.focus() })"/>
            <input class="editor" v-show="editstorageNetworkCidr && !dbData.common.isOpensource" type="text"
                   v-model="newstorageNetworkCidr" ref="storageNetworkCidrInput"
                   @keydown.enter="updateStorageNetworkCidr([windowData.dataUuid], newstorageNetworkCidr); editstorageNetworkCidr = false"
                   @blur="updateStorageNetworkCidr([windowData.dataUuid], newstorageNetworkCidr); editstorageNetworkCidr = false"
                   @keydown.esc="editstorageNetworkCidr = false"/>
          </div>
          <dropdown-detail :param="thinProvisionParam" v-if="primaryStorage && primaryStorage.type === 'SharedBlock'"/>
          <div id="common-totalCapacity" class="detail-row">
            <div class="detail-title">
              {{$t("common.totalCapacity")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ primaryStorage && bytesToSize(primaryStorage.totalCapacity) }}
            </div>
          </div>
          <div id="common-availableCapacity" class="detail-row">
            <div class="detail-title">
              {{$t("common.availableCapacity")}}{{$t("common.colon")}}
            </div>
            <div id="common-noAvailableCapacity" class="detail-container">
              {{primaryStorage && primaryStorage.availableCapacity > 0 ? bytesToSize(primaryStorage.availableCapacity) :
              $t('common.noAvailableCapacity') }}
            </div>
          </div>
          <div id="common-totalPhysicalCapacity" class="detail-row">
            <div class="detail-title">
              {{$t("common.totalPhysicalCapacity")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ primaryStorage && bytesToSize(primaryStorage.totalPhysicalCapacity) }}
            </div>
          </div>
          <div id="common-availablePhysicalCapacity" class="detail-row">
            <div class="detail-title">
              {{$t("common.availablePhysicalCapacity")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ primaryStorage && bytesToSize(primaryStorage.availablePhysicalCapacity) }}
            </div>
          </div>
          <div id="globalConfig-primaryStorage_reservedCapacity" class="detail-row">
            <div class="detail-title">
              {{$t("globalConfig.primaryStorage_reservedCapacity")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ reservedCapacity }}
            </div>
          </div>

          <div class="detail-row permission" v-if="primaryStorage && primaryStorage.type ==='Ceph'">
            <div id="primaryStorage-nocephx" class="row">
              <div class="detail-title">
                {{$t("primaryStorage.cephx")}}{{$t("common.colon")}}
                <help-trigger name="nocephx"
                              :style="{ position: 'relative', top: '-2px', left: '5px', display:'inline-block', verticalAlign:'middle' }"/>
              </div>
              <div class="detail-container">
                <div class="value" style="width: 200px; position: relative;">
                  <div id="common-yes" class="text" :style="{ color: windowData.nocephx ? '#1A2736' : '#95A4B6' }">
                    {{$t('common.off')}}
                  </div>
                  <div class="switch" :style="{ cursor: 'pointer' }" @click="detailSetCephx()">
                    <div class="off" v-if="windowData.nocephx"></div>
                    <div class="on" v-else></div>
                  </div>
                  <div id="common-no" class="text" :style="{ color: windowData.nocephx ? '#1A2736' : '#95A4B6' }">
                    {{$t('common.on')}}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="common-createDate" class="detail-row">
            <div class="detail-title">
              {{$t("common.createDate")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ primaryStorage && formatDatetime(new Date(primaryStorage.createDate)) }}
            </div>
          </div>
          <div id="common-lastOpDate" class="detail-row">
            <div class="detail-title">
              {{$t("common.lastOpDate")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ primaryStorage && formatDatetime(new Date(primaryStorage.lastOpDate)) }}
            </div>
          </div>
          <div class="detail-splitter"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <div id="common-uuid" class="detail-row">
          <div class="detail-title">
            {{$t("common.uuid")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            <detail-long-content :value="windowData.dataUuid"/>
          </div>
        </div>
        <div id="common-zone" class="detail-row">
          <div class="detail-title">
            {{$t("common.zone")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            <span class="link" @click="$router.push({name: 'detailZone', params: { uuid: primaryStorage.zoneUuid }})">{{ primaryStorage && dbData.zone[primaryStorage.zoneUuid] && dbData.zone[primaryStorage.zoneUuid].name }}</span>
          </div>
        </div>
        <div id="common-rootVolumePoolName" class="detail-row"
             v-if="primaryStorage && (primaryStorage.type === 'Ceph' || primaryStorage.type === 'Fusionstor')">
          <div class="detail-title">
            {{$t("common.rootVolumePoolName")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            {{getRootVolumePoolName(windowData.dataUuid)}}
          </div>
        </div>
        <div id="common-dataVolumePoolName" class="detail-row"
             v-if="primaryStorage && (primaryStorage.type === 'Ceph' || primaryStorage.type === 'Fusionstor')">
          <div class="detail-title">
            {{$t("common.dataVolumePoolName")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            {{ getDataVolumePoolName(windowData.dataUuid) }}
          </div>
        </div>
        <div id="common-imagePoolName" class="detail-row"
             v-if="primaryStorage && (primaryStorage.type === 'Ceph' || primaryStorage.type === 'Fusionstor')">
          <div class="detail-title">
            {{$t("common.imagePoolName")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            {{ getImageCachePoolName(windowData.dataUuid) }}
          </div>
        </div>
      </div>
    </div>
    <div slot="body" class="detail-body"
         v-if="primaryStorage && (primaryStorage.type === 'Ceph' || primaryStorage.type === 'Fusionstor') && activeName === 'mon'">
      <mon-tab-list
        :param="{conditions: `primary-storage.uuid=${windowData.dataUuid}`, primaryStorageUuid: windowData.dataUuid, resourceType: 'PS', addMons: addMons}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName ==='vm'">
      <vm-tab-list :param="{primaryStorageUuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'volume'">
      <volume-tab-list :param="{primaryStorageUuid: windowData.dataUuid,conditions: ['status!=Deleted', 'type=Data']}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'cluster'">
      <cluster-tab-list
        :param="{conditions: `primaryStorage.uuid=${windowData.dataUuid}`, primaryStorageUuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'host'">
      <host-memory-tab-list :param="{curPrimaryStorageUuid: `${windowData.dataUuid}`, refresh: refresh }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'pools'">
      <pool-tab-list
        :param="{conditions: [`primaryStorageUuid=${windowData.dataUuid}`], curPrimaryStorageUuid: windowData.dataUuid, createPool: createPool}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'sharedBlock'">

    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <primarystorage-monitor :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitoralarm'">
      <zwatch-alarm-tab-list-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'primaryStorage' }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'clear'">
      <trash-on-primary-storage :param="{ uuid: windowData.dataUuid, refresh: refresh }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <add-mons v-if="showAddMons" :param="addMonsParam" @close="showAddMons = false;"></add-mons>
      <create-pool v-if="showCreatePool" :param="createPoolParam" @close="showCreatePool = false;"></create-pool>
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
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';
  import strategy from 'src/strategies/primaryStorage/strategy';
  import VmTabList from "./component/VmTabList";
  import HostMemoryTabList from "./component/HostMemoryTabList";
  import PrimarystorageMonitor from "./component/Monitor";
  import TrashOnPrimaryStorage from "./component/TrashOnPrimaryStorage";
  import VolumeTabList from "src/ecs/volume/component/VolumeTabList";
  import ClusterTabList from "src/om/cluster/components/ClusterTabList";
  import PoolTabList from "src/storage/pools/PoolTabList";
  import MonTabList from "src/ecs/mons/MonTabList";
  import ZwatchAlarmTabListForResource from "src/om/zwatchalarm/TabListForResource";
  import AddMons from "./component/AddMons";
  import CreatePool from "./component/CreatePool";

  export default {
    name: "PrimaryStorageDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      CreatePool,
      AddMons,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      VmTabList,
      VolumeTabList,
      ClusterTabList,
      PoolTabList,
      MonTabList,
      ZwatchAlarmTabListForResource,
      HostMemoryTabList,
      PrimarystorageMonitor,
      TrashOnPrimaryStorage
    },
    created() {
      this.updateWindow({currTab: 'info'})
      let dataUuid;
      dataUuid = this.$route.params ? this.$route.params.uuid : '';

      this.queryPrimaryStorageByUuid(dataUuid)
      this.updateWindow({
        dataUuid,
        nocephx: false,
        methods: {query: this.query}
      })
        .then(() => {
          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
        })
    },
    computed: {
      primaryStorage: {
        get() {
          return this.model;
        },
        set(val) {
          this.model = val;
        }
      },
      showTrashTab() {
        let type = _.get(this.dbData.primarystorage, [this.windowData.dataUuid, 'type'])
        return _.includes(['Ceph', 'SharedBlock', 'NFS'], type)
      },
    },
    watch: {},
    data() {
      let self = this;
      return {
        activeName: 'info',
        thinProvisionOption: [
          {
            displayName: 'common.thinProvision',
            value: 'ThinProvisioning'
          },
          {
            displayName: 'common.thickProvision',
            value: 'ThickProvisioning'
          }
        ],
        thinProvisionParam: {
          getTitle: () => this.$t('primaryStorage.provision'),
          getIndex: () => this.thinProvisionIndex,
          getOptionList: this.getThinProvisionList,
          setIndex: index => {
            this.updateThinProvision(this.thinProvisionOption[index].value)
            this.thinProvisionIndex = index
          }
        },
        reservedCapacity: '',
        editUrl: false,
        thinProvisionIndex: 1,
        newUrl: '',
        provisionId: '',
        migrateCidr: '',
        justUpdateResource: false,
        newstorageNetworkCidr: '',
        editstorageNetworkCidr: false,
        model: null,
        addMonsParam: {},
        showAddMons: false,
        showCreatePool: false
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.primarystorage[this.windowData.dataUuid]) {
              return this.dbData.primarystorage[self.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('primary-storage', 'updatePrimaryStorage', 'name', 'primarystorage', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.primarystorage[self.windowData.dataUuid]) {
              return this.dbData.primarystorage[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('primary-storage', 'updatePrimaryStorage', 'description', 'primarystorage', value)
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      queryPrimaryStorageByUuid(uuid) {
        rpc.query('primary-storage', {
          q: `uuid=${uuid}`
        }).then((resp) => {
          this.updateDbRow({
            tableName: 'primarystorage',
            id: uuid,
            data: resp.inventories
          })

        })
      },
      getThinProvisionList() {
        return this.thinProvisionOption.map(it => this.$t(it.displayName))
      },
      canEnable() {
        return strategy.canEnable(this.dbData.primarystorage[this.windowData.dataUuid])
      },
      canDisable() {
        return strategy.canDisable(this.dbData.primarystorage[this.windowData.dataUuid])
      },
      canCreateVolume() {
        let ps = this.dbData.primarystorage[this.windowData.dataUuid]

        if (ps == undefined)
          return false
        return strategy.canCreateVolume(ps)
      },
      canMaintenance() {
        return strategy.canMaintenance(this.dbData.primarystorage[this.windowData.dataUuid])
      },
      canDisplayPrimaryStorageGatewayCidr() {
        const self = this
        return _.includes(['NFS', 'SharedMountPoint', 'Ceph', 'SharedBlock'], _.get(self.dbData.primarystorage, [self.windowData.dataUuid, 'type']))
      },
      refresh: function () {
        return this.query()
      },
      updateThinProvision(tag) {
        if (!this.thinProvisionIndex && tag === 'ThinProvisioning') return
        if ((this.thinProvisionIndex || !this.provisionId) && tag === 'ThickProvisioning') return
        this.setThinProvision(tag)
      },
      setThinProvision(value) {
        let self = this
        let event = self.createEvent('primaryStorage.action.updateProvision')
        let p = Promise.resolve()
        if (!self.provisionId) {
          p = rpc.create('system-tags', {
            resourceType: 'PrimaryStorageVO',
            resourceUuid: self.windowData.dataUuid,
            tag: `primaryStorageVolumeProvisioningStrategy::${value}`
          }, event)
        } else {
          p = rpc._delete(`tags/${self.provisionId}`, null, event)
        }
        return p.then(resp => {
          self.incEventSuccess(event)
          return self.query()
        }, () => {
          self.incEventFail(event)
        })
      },
      query: function () {
        const self = this
        self.provisionId = ''
        return rpc.query('primary-storage', {
          q: `uuid=${self.windowData.dataUuid}`
        }).then(resp => {
          let primarystorage = resp.inventories[0]
          let tasks = []
          let p = null
          p = rpc.query('zones', {
            q: `primaryStorage.uuid=${self.windowData.dataUuid}`
          }).then((zoneResp) => {
            self.updateDbRow({
              tableName: 'zone',
              id: zoneResp.inventories[0].uuid,
              data: zoneResp.inventories[0]
            })
          })
          tasks.push(p)
          p = rpc.query('system-tags', {
            q: ['resourceType=PrimaryStorageVO', `resourceUuid=${self.windowData.dataUuid}`]
          }).then(systemTagResp => {
            let obj = {nocephx: false}
            systemTagResp.inventories.forEach(it => {
              if (it.tag.indexOf('ceph::nocephx') > -1) {
                obj.nocephx = true
              }
              if (it.tag.indexOf('primaryStorageVolumeProvisioningStrategy::ThinProvisioning') > -1) {
                self.provisionId = it.uuid
                self.thinProvisionIndex = 0
              }
              if (it.tag.indexOf('primaryStorage::gateway::cidr::') > -1) {
                self.migrateCidr = it.tag.split('::')[3]
              }
            })
            return self.updateWindow(obj)
          })
          tasks.push(p)
          p = rpc.query('global-configurations', {q: ['category=primaryStorage', 'name=reservedCapacity']}).then(resp => {
            this.reservedCapacity = resp.inventories[0].value
          })
          tasks.push(p)
          return Promise.all(tasks).then(() => {
            return self.updateDbRow({
              tableName: 'primarystorage',
              id: self.windowData.dataUuid,
              data: primarystorage
            }).then(() => {
              self.primaryStorage = _.get(self.dbData.primarystorage, [self.windowData.dataUuid])
            })
          })
        })
      },
      detailReconnect: function (uuid) {
        const self = this
        let uuidList = [uuid]
        return self.openDialog('ConfirmDlg', {
          title: 'primaryStorage.reconnect',
          warning: 'primaryStorage.reconnectWarning',
          uuidList: uuidList,
          icon: 'storage_popupico',
          ok: () => {
            return self.reconnect(uuidList).then(() => {
              return self.query()
            })
          },
          getName: (uuid) => {
            return self.dbData.primarystorage[uuid].name;
          }
        })
      },
      canDetachCluster() {
        if (!this.dbData.primarystorage[this.windowData.dataUuid]) return;
        let ps = this.dbData.primarystorage[this.windowData.dataUuid]
        if (!ps) return false
        return strategy.canDetachCluster(ps)
      },
      updateStorageNetworkCidr: function (uuidList, cidr) {
        if (this.$data.justUpdateResource) return
        this.$data.justUpdateResource = true
        setTimeout(() => {
          this.$data.justUpdateResource = false
        }, 100)
        const self = this
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          if (self.dbData.primarystorage[uuid].primaryStorageGatewayCidr === cidr) return
          p = rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=primaryStorage::gateway::cidr::%25'],
            fields: 'uuid'
          }).then(resp => {
            let event = self.createEvent('common.updateStorageNetworkCidr', uuidList.length)
            let task = null
            if (resp.inventories.length === 0) {
              task = rpc.create('system-tags', {
                resourceType: 'PrimaryStorageVO',
                resourceUuid: uuid,
                tag: `primaryStorage::gateway::cidr::${cidr}`
              }, event)
            } else {
              if (cidr === '') {
                task = rpc._delete(`tags/${resp.inventories[0].uuid}`, null, event)
              } else {
                task = rpc.update('system-tags', `${resp.inventories[0].uuid}`, {
                  updateSystemTag: {
                    tag: `primaryStorage::gateway::cidr::${cidr}`
                  }
                }, event)
              }
            }
            return task.then(() => {
              self.incEventSuccess(event)
              let primarystorage = _.cloneDeep(self.dbData.primarystorage[uuid])
              primarystorage.primaryStorageGatewayCidr = cidr
              return self.updateDbRow({
                tableName: 'primarystorage',
                id: uuid,
                data: primarystorage
              })
            }, () => {
              self.incEventFail(event)
            })
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      detailSetCephx() {
        const self = this
        self.openDialog('NocephxReconnectConfirmDlg', {
          uuidList: [self.windowData.dataUuid],
          ok: (nocephxReconnect) => {
            return self.setnocephx(self.windowData.dataUuid).then(() => {
              if (nocephxReconnect) {
                return self.reconnect([self.windowData.dataUuid]).then(() => {
                  return self.query()
                })
              }
            })
          }
        })
      },
      setnocephx: function (uuid) {
        const self = this
        let nocephx = !self.windowData.nocephx
        let event = self.createEvent('primaryStorage.action.changeNocephx', self.dbData.primarystorage[uuid].name)
        let tasks = []
        let p = null
        if (nocephx) {
          p = rpc.create('system-tags', {
            resourceType: 'PrimaryStorageVO',
            resourceUuid: uuid,
            tag: 'ceph::nocephx'
          }, event).then((resp) => {
            self.updateWindow({nocephx})
            self.incEventSuccess(event)
          }, () => {
            self.updateWindow({nocephx: !nocephx})
            self.incEventFail(event)
          })
          tasks.push(p)
        } else {
          p = rpc.query('system-tags', {
            q: ['resourceType=PrimaryStorageVO', `resourceUuid=${self.windowData.dataUuid}`, 'tag=ceph::nocephx'],
            fields: 'uuid'
          }).then((resp) => {
            rpc._delete(`tags/${resp.inventories[0].uuid}`, null, event)
              .then(() => {
                self.updateWindow({nocephx})
                self.incEventSuccess(event)
              }, () => {
                self.updateWindow({nocephx: !nocephx})
                self.incEventFail(event)
              })
          })
          tasks.push(p)
        }
        return Promise.all(tasks)
      },
      detailAttach: async function (uuid) {
        const self = this
        let uuidList = await primaryStorageConditon.getPrimaryStorageAttachableCluster(self.dbData.primarystorage[uuid], self.dbData.common.isOpensource)
        await this.openDialog('ClusterSelectListDlg', {
          primaryStorageUuid: uuid,
          conditions: [`uuid?=${uuidList}`],
          type: 'selection',
          select: (clusterList) => {
            this.attach(uuid, clusterList).then(() => {
              self.query()
            })
          }
        })
      },
      detailDetach: function (uuid) {
        const self = this
        this.openDialog('ClusterSelectListDlg', {
          conditions: [`primaryStorage.uuid=${uuid}`],
          type: 'selection',
          select: (clusterList) => {
            this.openDialog('ConfirmDlg', {
              uuidList: clusterList,
              title: 'common.detachCluster',
              description: 'cluster.detachCluser',
              icon: 'cluster_popupico',
              warning: 'primaryStorage.detachClusterWarning',
              ok: () => {
                this.detach(uuid, clusterList).then(() => {
                  self.query()
                })
              },
              getName: (uuid) => {
                return self.dbData.cluster[uuid].name;
              }
            })
          }
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      delete: function (uuid) {
        const self = this
        let event = self.createEvent('primaryStorage.action.delete', self.dbData.primarystorage[uuid].name)
        console.log(rpc)
        rpc._delete(`primary-storage/${uuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
            if (self.param.refresh) self.param.refresh(uuid)
          }, () => self.incEventFail(event))
      },

      inStates: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        return !stateList.every((item, index, array) => {
          return item !== this.dbData.primarystorage[this.windowData.dataUuid].state
        })
      },

      addMons(param) {
        let self = this;
        self.addMonsParam = param;
        self.showAddMons = true;
      },

      createPool(param) {
        let self = this;
        self.createPoolParam = param;
        self.showCreatePool = true;
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
