<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">二层网络详情</span>
      <span @click="$router.push({name:'l2network'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到二层网络列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('common.l2networkActions')}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-attachCluster"
                           v-if="model.type !== 'VxlanNetworkPool' && dbData.common.isAdmin && model.type !== 'VxlanNetwork'"
                           :class="{'disabled-text': model.type === 'VxlanNetwork'}" style="padding-top: 12px;"
                           @click="(model.type !== 'VxlanNetwork') && detailAttach(windowData.dataUuid)">{{ $t("common.attachCluster") }}</a>
                        <a id="common-attachCluster" v-if="model.type === 'VxlanNetworkPool' && dbData.common.isAdmin"
                           :class="{'disabled-text':model.type === 'VxlanNetwork'}" style="padding-top: 12px;"
                           @click="(model.type !== 'VxlanNetwork') && detailVxlanNetworkPoolAttachCluster()">{{ $t("common.attachCluster") }}</a>
                        <a id="common-detachCluster" v-if="dbData.common.isAdmin && model.type !== 'VxlanNetwork'"
                           @click="(model.attachedClusterUuids && model.attachedClusterUuids.length !== 0) && (model.type !== 'VxlanNetwork') && detailDetach(windowData.dataUuid)"
                           :class="{'disabled-text': (model.attachedClusterUuids && model.attachedClusterUuids.length === 0) || model.type === 'VxlanNetwork'}">{{ $t("common.detachCluster") }}</a>
                        <a id="common-shareToAll" style="padding-top: 12px;" v-permission="'LICENSE_BASIC_PAID'"
                           @click="!model.toPublic && pageShareL2NetworkToAll()"
                           :class="{ 'disabled-text': model.toPublic}"
                           v-if="dbData.common.isAdmin && (model.type === 'L2NoVlanNetwork' || model.type === 'VxlanNetwork' || model.type === 'VxlanNetworkPool')">{{$t("common.shareToAll")}}</a>
                        <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'"
                           @click="model.toPublic && pageRecallL2NetworkFromAll()"
                           :class="{ 'disabled-text': !model.toPublic}"
                           v-if="dbData.common.isAdmin && (model.type === 'L2NoVlanNetwork' || model.type === 'VxlanNetwork' || model.type === 'VxlanNetworkPool')">{{$t("common.recallFromAll")}}</a>
                        <a id="common-destroy" v-permission="'L2.DELETE'" style="padding-bottom: 12px;"
                           @click="detailDelete(windowData.dataUuid)">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane v-if="model.type !== 'VxlanNetworkPool'" :label="$t('common.l3network')" name="l3network"
        ></el-tab-pane>
        <el-tab-pane v-if="model.type === 'VxlanNetworkPool'" :label="$t('l2network.vniRanges')" name="vxlanNetworkPool"
        ></el-tab-pane>
        <el-tab-pane v-if="model.type === 'VxlanNetworkPool'" :label="$t('l2network.vtep')" name="vxlanNetworkVtep"
        ></el-tab-pane>
        <el-tab-pane v-if="model.type === 'VxlanNetworkPool'" :label="$t('l2network.vxlanNetwork')" name="VxlanNetwork"
        ></el-tab-pane>
        <el-tab-pane v-if="dbData.common.isAdmin" :label="$t('common.cluster')" name="cluster"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'"
                     v-if="dbData.common.isAdmin && (model.type === 'L2NoVlanNetwork' || model.type === 'VxlanNetworkPool' || model.type === 'VxlanNetwork')"
                     :label="$t('common.share')" name="share"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
           <base-icon name="detail_vxlanpool"/>
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
                    title: $t('common.type'),
                    content: model.type
                  }"/>
          <detail-row :param="{
                    title: $t('common.physicalInterface'),
                    content: model.physicalInterface
                  }" v-if="model.type !== 'VxlanNetwork' && model !== 'VxlanNetworkPool'"/>

          <detail-row :param="{
                    title: 'VLAN',
                    content: model.vlan
                  }"
                      v-if="model.type !== 'VxlanNetwork' && model.type !== 'L2NoVlanNetwork' && model.type !== 'VxlanNetworkPool'"/>

          <detail-row :param="{
                    title: 'vni',
                    content: model.vni
                  }" v-if="model.vni"/>

          <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid)
                  }"
                      v-if="dbData.resourceOwner[windowData.dataUuid] && dbData.resourceOwner[windowData.dataUuid].uuid && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid] && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid)}" v-else/>

          <detail-row :param="{
                    title: $t('common.shareToAll'),
                    content: $t(`common.${model.toPublic}`)
                  }"
                      v-if="dbData.resourceOwner[windowData.dataUuid] && dbData.resourceOwner[windowData.dataUuid].uuid && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid] && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: model.createDate && formatDatetime(new Date(model.createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
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
                title: 'common.zone',
                content: dbData.zone[model.zoneUuid] && dbData.zone[model.zoneUuid].name,
                handler: () => {
                  $router.push({name: 'detailZone', params: {uuid: model.zoneUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'l2network.vxlanNetworkPools',
                content: getL2NetworkName(model.poolUuid),
                handler: () => {
                  $router.push({name: 'detailvxlanpool', params: {uuid: model.poolUuid}})
                }
              }" v-if="model.type === 'VxlanNetwork' && dbData.common.isAdmin"/>
      </div>
    </div>

    <div slot="body" class="detail-body"
         v-if="activeName === 'cluster' && !getLicensePermission('LICENSE_EXTRA_BAREMETAL')">
      <L2Network-cluster-tab-list
        :param="{conditions: [`l2Network.uuid=${windowData.dataUuid}`, 'hypervisorType=KVM'], uuid: `${windowData.dataUuid}`}"/>
    </div>
    <div slot="body" class="detail-body"
         v-if="activeName === 'cluster' && getLicensePermission('LICENSE_EXTRA_BAREMETAL')">
      <l2network-kvm-cluster-and-baremetal-cluster-tab-list
        :param="{conditions: `l2Network.uuid=${windowData.dataUuid}`, uuid: `${windowData.dataUuid}`}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vxlanNetworkPool'">
      <vni-range-tab-list
        :param="{conditions: `vxlanPool.uuid=${windowData.dataUuid}`, uuid: `${windowData.dataUuid}`}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vxlanNetworkVtep'">
      <vtep-tab-list :param="{conditions: `uuid=${windowData.dataUuid}`, uuid: `${windowData.dataUuid}`}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'VxlanNetwork'">
      <Vxlan-Network-Tab-List
        :param="{conditions: `vxlanPool.uuid=${windowData.dataUuid}`, uuid: `${windowData.dataUuid}`}"/>
    </div>
    <div slot="body" class="detail-body"
         v-if="activeName === 'share' && (model.type === 'L2NoVlanNetwork' || model.type === 'VxlanNetworkPool' || model.type === 'VxlanNetwork')">
      <account-tab-list
        :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'l2network'}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'l3network'">
      <l3network-tab-list :param="{conditions: `l2Network.uuid=${windowData.dataUuid}`, addIpRange: addIpRange}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <add-ip-range v-if="showAddIpRange" :param="addIpRangeParam" @close="showAddIpRange = false"/>
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
  import L2NetworkClusterTabList from "src/network/l2network/component/ClusterTabList";
  import VniRangeTabList from "src/network/l2network/component/VniRangeTabList"
  import L3networkTabList from "src/network/l3network/component/L3NetworkTabList";
  import AccountTabList from "src/om/account/component/ShareTabList";
  import VtepTabList from "src/network/l2network/component/VtepTabList";
  import VxlanNetworkTabList from "src/network/l2network/component/VxlanNetworkTabList";
  import AddIpRange from "./component/AddIpRangePage";
  import L2networkKvmClusterAndBaremetalClusterTabList
    from "../vxlanpool/components/L2networkKvmClusterAndBaremetalClusterTabList";

  export default {
    name: "L2NetworkDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      L2networkKvmClusterAndBaremetalClusterTabList,
      AddIpRange,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      VniRangeTabList,
      VtepTabList,
      VxlanNetworkTabList,
      AccountTabList,
      L3networkTabList,
      L2NetworkClusterTabList
    },
    created() {
      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        currentAccountUuid: window.localStorage.getItem('accountUuid'),
        methods: {query: this.query}
      })
        .then(() => {
          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
        })

    },
    mounted() {

    },
    computed: {
      model: {
        get() {
          let self = this;
          if (self.l2network)
            return self.l2network;
        },
        set(val) {
          let self = this;
          self.l2network = val;
        }
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({dataUuid: this.param.uuid})
        if ((this.windowData.currTab === 'vxlanNetworkPool' || this.windowData.currTab === 'vxlanNetworkVtep' || this.windowData.currTab === 'VxlanNetwork' || this.windowData.currTab === 'share') && this.dbData.l2network[this.windowData.dataUuid].type !== 'VxlanNetworkPool') {
          this.updateWindow({currTab: 'info'})
        }
        if (this.windowData.currTab === 'l3network' && this.dbData.l2network[this.windowData.dataUuid].type === 'VxlanNetworkPool') {
          this.updateWindow({currTab: 'info'})
        }
        this.query()
        this.destroyDialogs()
      }
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        l2network: {},
        showAddIpRange: false
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.l2network[this.windowData.dataUuid]) {
              return this.dbData.l2network[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('l2-networks', 'updateL2Network', 'name', 'l2network', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.l2network[self.windowData.dataUuid]) {
              return this.dbData.l2network[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('l2-networks', 'updateL2Network', 'description', 'l2network', value)
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      query: function () {
        const self = this
        let actionPath = 'l2-networks'
        if (!self.dbData.common.isAdmin) {
          actionPath = 'l2-networks/vxlan'
        }
        let tasks = []
        let p = null
        let l2network = {}
        p = rpc.query(actionPath, {
          q: `uuid=${self.windowData.dataUuid}`
        }).then((resp) => {
          rpc.getResourceAccount([self.windowData.dataUuid], this)
          l2network = resp.inventories[0]
          p = rpc.query('accounts/resources/refs', {
            q: `resourceUuid=${self.windowData.dataUuid}`
          }).then((resp) => {
            if (resp.inventories.length === 0) return
            l2network.accountUuid = resp.inventories[0].accountUuid
            if (self.dbData.common.isAdmin) {
              return rpc.queryResourceNames(self, 'account', [l2network.accountUuid])
                .then(() => {
                  self.updateDbRow({
                    tableName: 'l2network',
                    id: self.windowData.dataUuid,
                    data: l2network
                  })
                })
            }
          })
          tasks.push(p)
          p = rpc.query('zones', {
            q: `l2Network.uuid=${self.windowData.dataUuid}`
          }).then((zoneResp) => {
            if (zoneResp.inventories.length > 0) {
              self.updateDbRow({
                tableName: 'zone',
                id: zoneResp.inventories[0].uuid,
                data: zoneResp.inventories[0]
              })
            }
          })
          tasks.push(p)
          if (this.dbData.common.isAdmin) {
            p = self.isShareToAll(self.windowData.dataUuid)
              .then((toPublic) => {
                l2network.toPublic = toPublic
                return self.updateDbRow({
                  tableName: 'l2network',
                  id: self.windowData.dataUuid,
                  data: l2network
                })
              }).then(() => self.$nextTick(self.$forceUpdate))
            tasks.push(p)
          }
        })
        tasks.push(p)
        return Promise.all(tasks)
          .then(() => {
            self.updateDbRow({
              tableName: 'l2network',
              id: self.windowData.dataUuid,
              data: l2network
            }).then(() => {
              self.model = _.get(self.dbData.l2network, self.windowData.dataUuid);
            })
          })
      },
      hasPermission: function () {
        let hasPermission = this.dbData.common.isAdmin || this.dbData.l2network[this.windowData.dataUuid] && this.dbData.l2network[this.windowData.dataUuid].accountUuid === this.windowData.currentAccountUuid
        return hasPermission
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      detailVxlanNetworkPoolAttachCluster: function () {
        const self = this
        self.openFullMainWindow('VxlanNetworkPoolAttachClusterDlg', {
          uuid: self.windowData.dataUuid,
          ok: (params) => {
            self.attachVxlanNetworkPoolToCluster(self.windowData.dataUuid, params)
              .then(() => {
                self.refreshChild(self.tablistAssignedUuid.cluster)
              })
          }
        })
      },
      pageRecallL2NetworkFromAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.recallFromAll',
          warning: 'account.recall',
          ok: () => {
            this.recallFromAll([this.windowData.dataUuid])
              .then(() => {
                this.query();
              })
          }
        })
      },
      pageShareL2NetworkToAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.shareToAll',
          warning: 'instanceOffering.shareToAllText',
          ok: () => {
            this.shareL2NetworkToAll([this.windowData.dataUuid])
              .then(() => {
                this.query();
              })
          }
        })
      },
      attachVxlanNetworkPoolToCluster: function (uuid, params) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${params.clusterUuid}::cidr::{${params.cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[params.clusterUuid] && self.dbData.cluster[params.clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        return rpc.post(`l2-networks/${uuid}/clusters/${params.clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'l2network',
              id: uuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      detailDelete: function (uuid) {
        const self = this
        let uuidList = []
        uuidList.push(uuid)
        self.openDialog('ConfirmDlg', {
          title: 'l2network.deleteL2Network',
          description: 'l2network.info.deleteConfirm',
          icon: 'l2_popupico',
          uuidList,
          ok: () => {
            self.delete(uuidList)
              .then(() => {
                if (self.param.refresh) self.param.refresh(uuid)
              })
          },
          getName: (uuid) => {
            return self.dbData.l2network[uuid].name;
          }
        })
      },

      addIpRange(param) {
        let self = this;
        self.addIpRangeParam = param;
        self.showAddIpRange = true;
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
