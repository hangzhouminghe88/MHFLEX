<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">集群详情</span>
      <span @click="$router.push({name:'cluster'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到集群列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('common.clusterAction')}}</span>
                    </span>
                    <span slot="content">
                        <div class="dropdown-content">
                        <a id="common-start" @click="!inStates('Enabled') && detailStart(windowData.dataUuid)"
                           :class="{'disabled-text':inStates('Enabled')}" style="padding-top: 12px;">{{ $t("common.start") }}</a>
                        <a id="common-stop" @click="!inStates('Disabled') && detailStop(windowData.dataUuid)"
                           :class="{'disabled-text':inStates('Disabled')}">{{ $t("common.stop") }}</a>
                        <a id="common-attachl2"
                           @click="detailAttachl2(windowData.dataUuid)">{{ $t("common.attachl2") }}</a>
                        <a id="common-detachl2"
                           @click="GetisAttachL2network(windowData.dataUuid) && detailDetachl2(windowData.dataUuid)"
                           :class="{'disabled-text':!GetisAttachL2network(windowData.dataUuid)}">{{ $t("common.detachl2") }}</a>
                        <a id="common-attachprimarystorage"
                           @click="canAttachPrimaryStorage(windowData.dataUuid) && detailAttachPrimaryStorage(windowData.dataUuid)"
                           :class="{'disabled-text': !canAttachPrimaryStorage(windowData.dataUuid)}">{{ $t("common.attachprimarystorage") }}</a>
                        <a id="common-detachprimarystorage"
                           @click="canDetachPrimaryStorage(windowData.dataUuid) && detailDetachPrimaryStorage(windowData.dataUuid)"
                           :class="{'disabled-text': !canDetachPrimaryStorage(windowData.dataUuid)}">{{ $t("common.detachprimarystorage") }}</a>
                        <a id="common-destroy" style="padding-bottom: 12px;" @click="detailDelete(windowData.dataUuid)">{{ $t("common.destroy") }}</a>
                        </div>
                    </span>
                </drop-down>
            </span>
      <span class="detail-tab">
                <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
                    <el-tab-pane :label="$t('common.basicAttributes')" name="info"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.host')" name="host" v-if="isDestroyed()"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.primarystorage')" name="primarystorage" v-if="isDestroyed()"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.webstorage')" name="iscsi" @v-if="isDestroyed()"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.l2network')" name="l2network" v-if="isDestroyed()"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.peripheral')" name="peripheral" v-if="isDestroyed()"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.monitor')" name="monitor" v-if="isDestroyed()"
                    ></el-tab-pane>
                    <el-tab-pane :label="$t('common.log')" name="log" v-if="isDestroyed()"
                    ></el-tab-pane>
                </el-tabs>
            </span>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="cluster_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state"
                               :state="cluster.state"/>
            <div style="position: relative;color: #005596;">
              <img style="position: absolute; left: 30px; top: 8px;" src="~assets/kvm.svg"/>
              <span>{{cluster.hypervisorType}}</span>
            </div>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <div class="detail-row editable">
            <div class="detail-title">
              {{$t('cluster.vdiNetwork')}}{{$t('common.colon')}}
            </div>
            <div class="detail-container">
              <span class="detail-content" v-if="!editdisplayNetworkCidr">{{ dbData.clusterA[windowData.dataUuid] && dbData.clusterA[windowData.dataUuid].displayNetworkCidr }}</span>
              <span class="edit-icon" v-show="!editdisplayNetworkCidr && !dbData.common.isOpensource" @click.stop="editdisplayNetworkCidr=true;
                                newdisplayNetworkCidr=dbData.clusterA[windowData.dataUuid].displayNetworkCidr;$nextTick(() => { $refs.displayNetworkCidrInput.focus() })">
                                    <i class="el-icon-edit"></i>
                                </span>
              <input class="editor" v-show="editdisplayNetworkCidr && !dbData.common.isOpensource"
                     type="text" v-model="newdisplayNetworkCidr" ref="displayNetworkCidrInput"
                     @keydown.enter="updateVdiDisplayNetworkCidr([windowData.dataUuid], newdisplayNetworkCidr);
                       editdisplayNetworkCidr = false" @blur="updateVdiDisplayNetworkCidr([windowData.dataUuid], newdisplayNetworkCidr);
                       editdisplayNetworkCidr = false" @keydown.esc="editdisplayNetworkCidr = false"/>
            </div>
          </div>
          <div id="common-migrateNetworkCidr" class="detail-row editable" v-if="dbData.common.isAdmin">
            <div class="detail-title" v-permission="'CLUSTER.DISPLAYNETWORK'">
              {{$t("common.migrateNetworkCidr")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              <span class="detail-content" v-show="!editmigrateNetworkCidr && !dbData.common.isOpensource">{{ dbData.clusterA[windowData.dataUuid] && dbData.clusterA[windowData.dataUuid].migrateNetworkCidr }}</span>
              <span v-show="!editmigrateNetworkCidr && !dbData.common.isOpensource" class="edit-icon"
                    @click="editmigrateNetworkCidr = true; newmigrateNetworkCidr = dbData.clusterA[windowData.dataUuid].migrateNetworkCidr;
                      $nextTick(() => { $refs.migrateNetworkCidrInput.focus() })">
                      <i class="el-icon-edit"/>
                </span>
              <input class="editor" v-show="editmigrateNetworkCidr && !dbData.common.isOpensource"
                     type="text" v-model="newmigrateNetworkCidr" ref="migrateNetworkCidrInput"
                     @keydown.enter="updateMigrateNetworkCidr([windowData.dataUuid], newmigrateNetworkCidr); editmigrateNetworkCidr = false"
                     @blur="updateMigrateNetworkCidr([windowData.dataUuid], newmigrateNetworkCidr); editmigrateNetworkCidr = false"
                     @keydown.esc="editmigrateNetworkCidr = false"/>
            </div>
          </div>
          <detail-row class="editable"
                      :param="{
                title: 'cluster.vmCpuModel',
                content: dbData.clusterA[windowData.dataUuid] && dbData.clusterA[windowData.dataUuid].clusterKVMCpuModel,
                editable: true,
                handler: (e)=> {
                   updateCpuModel(e)
                }
              }"
          />
          <detail-dropdown :param="{
                getTitle: () => $t('cluster.checkHostCpu'),
                getOptionList: () => checkCpuModelList.map(it => $t(it.displayName)),
                getIndex: () => checkCpuModelList.findIndex(it => it.value === cluster.checkCpuModel),
                setIndex: index => { updateCheckCpuModel(checkCpuModelList[index].value) },
                showIcon: !dbData.common.isOpensource,
                permission: 'LICENSE_BASIC_PAID'
                }"/>
          <div id="common-availableCpu" class="detail-row">
            <div class="detail-title">
              {{$t('common.availableCpu')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ cluster.availableCpu }}
            </div>
          </div>
          <div id="common-totalSize" class="detail-row">
            <div class="detail-title">
              {{$t('common.totalSize')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ bytesToSize(cluster.totalMemory)
              }}
            </div>
          </div>
          <div id="cluster-vmRunningNum" class="detail-row">
            <div class="detail-title">
              {{$t('cluster.vmRunningNum')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ cluster.runningVm }}
            </div>
          </div>
          <div id="cluster-vmStoppedNum" class="detail-row">
            <div class="detail-title">
              {{$t('cluster.vmStoppedNum')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ cluster.stoppedVm }}
            </div>
          </div>
          <div id="cluster-vmDestroyedNum" class="detail-row">
            <div class="detail-title">
              {{$t('cluster.vmDestroyedNum')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ cluster.destroyedVm }}
            </div>
          </div>
          <div id="cluster-vmNum" class="detail-row">
            <div class="detail-title">
              {{$t('cluster.vmNum')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ cluster.totalVm }}
            </div>
          </div>
          <div id="common-createDate" class="detail-row">
            <div class="detail-title">
              {{$t('common.createDate')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ dbData.cluster[windowData.dataUuid] && formatDatetime(new
              Date(dbData.cluster[windowData.dataUuid].createDate)) }}
            </div>
          </div>
          <div id="common-lastOpDate" class="detail-row">
            <div class="detail-title">
              {{$t('common.lastOpDate')}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              {{ dbData.cluster[windowData.dataUuid] && formatDatetime(new
              Date(dbData.cluster[windowData.dataUuid].lastOpDate)) }}
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px;">
        </div>
        <div id="common-moreInfomation" class="detail-block-header">{{$t('common.moreInformation')}}</div>
        <div class="detail-row">
          <div class="detail-title">
            UUID:
          </div>
          <div class="detail-container">
            <detail-long-content :value="windowData.dataUuid"/>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-title">
            {{ $t('common.zone') }}:
          </div>
          <div class="detail-container">
              <span class="link"
                    @click="$router.push({name: 'detailZone', params: {uuid: cluster.zoneUuid}})">{{ dbData.zone[cluster.zoneUuid] && dbData.zone[cluster.zoneUuid].name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'primarystorage'">
      <primary-storage-tab-list :param="{clusterUuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName ==='iscsi'">
      <san-storage-tab-list
        :param="{condition: `iscsiCluster.clusterUuid=${windowData.dataUuid}`, clusterUuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'peripheral'">
      <peripheral-tab-list
        :param="{conditions: `hostUuid?=${hostUuidList}`, isCluster: true, uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <cluster-monitor :param="windowData.dataUuid"></cluster-monitor>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'host'">
      <host-tab-list
        :param="{conditions: `cluster.uuid=${windowData.dataUuid}`, clusterUuid: windowData.dataUuid, refresh: detailQuery}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'l2network'">
      <l2-net-work-tab-list
        :param="{conditions: `cluster.uuid=${windowData.dataUuid}`, clusterUuid: windowData.dataUuid, refresh: detailQuery}"/>
    </div>

  </detail-template>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import DetailTemplate from "../../../component/DetailTemplate";
  import Root from 'src/windows/Root';
  import ClusterMethods from '../Methods'
  import LogList from "../../../component/LogList";
  import DetailInfoState from "../../../component/DetailInfoState";
  import DetailLongContent from "../../../main-component/DetailLongContent";
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';
  import PrimaryStorageTabList from "../components/PrimaryStorageTabList";
  import SanStorageTabList from "../components/SanStorageTabList";
  import PeripheralTabList from "../components/PeripheralTabList";
  import ClusterMonitor from "../components/ClusterMonitor";
  import HostTabList from "../components/HostTabList";
  import L2NetWorkTabList from "../components/L2NetWorkTabList";

  export default {
    name: "ClusterDetailPage",
    mixins: [WindowBase, Root, ClusterMethods],
    components: {
      L2NetWorkTabList,
      HostTabList,
      ClusterMonitor,
      PeripheralTabList,
      SanStorageTabList,
      PrimaryStorageTabList,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList
    },
    created() {
      this.updateWindow({currTab: 'info'})
      let dataUuid;
      dataUuid = this.$route.params ? this.$route.params.uuid : '';

      this.updateWindow({
        dataUuid,
        methods: {
          query: this.detailQuery
        }
      }).then(() => {
        return this.detailQuery()
      }).then(() => {
        this.$forceUpdate()
      })
    },
    computed: {
      cluster() {
        let uuid = this.windowData.dataUuid
        let cluster = _.get(this, `dbData.cluster[${uuid}]`) || {}
        let clusterA = _.get(this, `dbData.clusterA[${uuid}]`) || {}
        return _.assign({}, cluster, clusterA)
      }
    },
    data() {
      let self = this;
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        newdisplayNetworkCidr: '',
        editdisplayNetworkCidr: false,
        newmigrateNetworkCidr: '',
        editmigrateNetworkCidr: false,
        hostUuidList: [],
        checkCpuModelList: [
          {
            displayName: 'common.check',
            value: 'true'
          },
          {
            displayName: 'common.noCheck',
            value: 'false'
          },
          {
            displayName: 'common.useGlobalConfig',
            value: 'default'
          }
        ]
      }
    },
    methods: {
      ...Utils,
      inStates: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        return !stateList.every((item, index, array) => {
          if (this.dbData.cluster[this.windowData.dataUuid]) {
            return item !== this.dbData.cluster[this.windowData.dataUuid].state
          }
        })
      },
      detailQuery() {
        return this.query(this.windowData.dataUuid).then(() => {
          return this.getHostUuidList()
        })
      },
      getHostUuidList() {
        return rpc.query(`hosts`, {q: `cluster.uuid=${this.windowData.dataUuid}`}).then(resp => {
          this.hostUuidList = resp.inventories.map(host => host.uuid)
        })
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      isDestroyed() {
        let self = this;
        if (self.dbData.vm[self.$route.params.uuid]) {
          return self.dbData.vm[self.$route.params.uuid].state !== 'Destroyed';
        }
        return true;
      },
      //获得名称参数
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.cluster[this.windowData.dataUuid]) {
              return this.dbData.cluster[self.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('clusters', 'updateCluster', 'name', 'cluster', value);
          }
        }
      },
      //获得描述参数
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.cluster[self.windowData.dataUuid]) {
              return this.dbData.cluster[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('clusters', 'updateCluster', 'description', 'cluster', value);
          }
        }
      },
      //更新cpu模式
      updateCpuModel(e) {
        e.stopPropagation()
        let cpuModel = this.dbData.clusterA[this.windowData.dataUuid].clusterKVMCpuModel
        this.openDialog('UpdateCpuModelDlg', {
          cpuModel,
          ok: (msg) => {
            return this.updateClusterCpuModel(this.windowData.dataUuid, msg).then(() => {
              this.detailQuery()
            })
          }
        })
      },
      //绑定主存储
      async detailAttachPrimaryStorage() {
        let self = this;
        let uuid = self.$route.params.uuid;
        let psUuidList = await primaryStorageConditon.getClusterAttachablePrimaryStorage(uuid)
        await this.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`uuid?=${psUuidList}`],
          type: 'radio',
          select: (primarystorageuuid) => this.attachPrimaryStorage(uuid, primarystorageuuid)
        })
      },
      //解绑主存储
      detailDetachPrimaryStorage() {
        let self = this;
        let uuid = self.$route.params.uuid;
        this.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`attachedClusterUuids=${uuid}`],
          type: 'selection',
          select: (primarystorageuuid) => {
            this.openDialog('ConfirmDlg', {
              title: 'common.detachprimarystorage',
              description: 'primaryStorage.detachPS',
              icon: 'storage_popupico',
              warning: 'primaryStorage.detachClusterWarning',
              getName(uuid) {
                return self.dbData.primarystorage[uuid].name;
              },
              uuidList: primarystorageuuid,
              ok: () => {
                this.detachPrimaryStorage(uuid, primarystorageuuid)
              }
            })
          }
        })
      },
      //更新物理机cpu模式
      updateCheckCpuModel(value) {
        let self = this;
        if (value === self.cluster.checkCpuModel) return
        let event = self.createEvent('cluster.action.updateCheckCpuModel')
        let p = Promise.resolve()
        let tagId = self.cluster.checkCpuModelId
        if (!tagId) {
          p = rpc.create('system-tags', {
            resourceType: 'ClusterVO',
            resourceUuid: self.windowData.dataUuid,
            tag: `check::cluster::cpu::model::${value}`
          }, event)
        } else {
          if (_.includes(['true', 'false'], value)) {
            p = rpc.update(`system-tags`, tagId, {
              updateSystemTag: {
                tag: `check::cluster::cpu::model::${value}`
              }
            }, event)
          }
          if (value === 'default') {
            p = rpc._delete(`tags/${tagId}`, null, event)
          }
        }
        return p.then(resp => {
          self.incEventSuccess(event)
          return self.detailQuery()
        }, () => {
          self.incEventFail(event)
        })
      },
      //绑定二层网络
      async detailAttachl2(uuid) {
        let l2networkList = await this.getClusterAttachableL2Network([uuid])
        await this.openDialog('L2NetworkSingleSelectListDlg', {
          conditions: [`uuid?=${l2networkList}`, `zone.uuid=${localStorage.getItem('currZoneUuid')}`],
          ok: (l2networkList) => {
            // l2networkList.length = 1
            let l2network = _.cloneDeep(this.dbData.l2network[l2networkList])
            if (l2network.type !== 'VxlanNetworkPool') {
              this.attachl2(uuid, [l2networkList])
            } else {
              this.openDialog('ClusterAttachVxlanPoolInputCidrPopupDlg', {
                ok: (cidr) => this.attachVxlanNetworkPoolToCluster(l2network.uuid, uuid, cidr)
              })
            }
          }
        })
      },
      //绑定vxlan
      attachVxlanNetworkPoolToCluster(uuid, clusterUuid, cidr) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${clusterUuid}::cidr::{${cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterUuid] && self.dbData.cluster[clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        rpc.post(`l2-networks/${uuid}/clusters/${clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.detailQuery()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      //绑定二层网络
      detailDetachl2(uuid) {
        this.openDialog('L2NetWorkMultiSelectListDlg', {
          conditions: [`cluster.uuid=${uuid}`, 'type!=VxlanNetwork'],
          select: (l2networkList) => this.detachl2(uuid, l2networkList)
        })
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
</style>
