<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">路由表详情</span>
      <span @click="$router.push({name:'vrouterroutetable'})" class="create-back detail-header-item">
         <i class="el-icon-back"></i>
         回到路由表列表
      </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('common.vrouterroutetable')}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="vRouterRouteEntry-add" style="padding-top: 12px;" @click="pageAddVRouterRouteEntry()">{{$t("vRouterRouteEntry.add")}}</a>
                        <a id="vrouterroutetable-attach" @click="pageAttach()">{{$t("vrouterroutetable.attach")}}</a>
                        <a id="vrouterroutetable-detach" @click="hasAttachedRouter(windowData.dataUuid) && pageDetach()"
                           :class="{'disabled-text': !hasAttachedRouter(windowData.dataUuid)}">{{$t("vrouterroutetable.detach")}}</a>
                        <a id="common-destroy" style="padding-bottom: 12px;" @click="pageDelete(windowData.dataUuid)">{{ $t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('vRouterRouteEntry.entry')" name="vRouterRouteEntry"></el-tab-pane>
        <el-tab-pane :label="$t('common.virtualRouterDevice')" name="virtualRouterDevice"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.vpcVRouter')"
                     name="vpcVRouter"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="router_table_large"/>
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
                    title: $t('vrouterroutetable.entryNum'),
                    content: dbData.vRouterRouteTable[windowData.dataUuid] && dbData.vRouterRouteTable[windowData.dataUuid].routeEntries && dbData.vRouterRouteTable[windowData.dataUuid].routeEntries.length
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: dbData.vRouterRouteTable[windowData.dataUuid] && formatDatetime(new Date(dbData.vRouterRouteTable[windowData.dataUuid].createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: dbData.vRouterRouteTable[windowData.dataUuid] && formatDatetime(new Date(dbData.vRouterRouteTable[windowData.dataUuid].lastOpDate))
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
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'vRouterRouteEntry'">
      <vrouter-route-entry-tab-list
        :param="{ conditions: `vrouterRouteTable.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, addVRouterRouteEntry:pageAddVRouterRouteEntry }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'virtualRouterDevice'">
      <vr-for-vrouter-route-tab-list
        :param="{ conditions: `routeTableUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vpcVRouter'">
      <vpc-vrouter-tab-list
        :param="{ conditions: `routeTableUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <add-router-entry-dlg v-if="showAddVRouterRouteEntry" :param="pageAddVRouterRouteEntryParam"
                            @close="showAddVRouterRouteEntry = false"/>
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
  import VRouterRouteEntryTabList from './component/VRouterRouteEntryTabList'
  import VRForVRouterRouteTabList from './component/VRForVRouterRouteTabList'
  import VpcVRouterTabList from './component/VpcVRouterTabList'
  import AddRouterEntryDlg from "./component/AddRouterEntry";

  export default {
    name: "VirtualRouterTableDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddRouterEntryDlg,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      'vrouter-route-entry-tab-list': VRouterRouteEntryTabList,
      'vr-for-vrouter-route-tab-list': VRForVRouterRouteTabList,
      'vpc-vrouter-tab-list': VpcVRouterTabList
    },
    created() {

      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        methods: {
          refresh: this.query,
          query: this.query
        }
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
    computed: {},
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({dataUuid: this.param.uuid})
          .then(() => {
            this.query()
          })
      }
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        showAddVRouterRouteEntry: false,
        pageAddVRouterRouteEntryParam: {}
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.vRouterRouteTable[this.windowData.dataUuid]) {
              return this.dbData.vRouterRouteTable[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('vrouter-route-tables', 'updateVRouterRouteTable', 'name', 'vRouterRouteTable', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.vRouterRouteTable[self.windowData.dataUuid]) {
              return this.dbData.vRouterRouteTable[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('vrouter-route-tables', 'updateVRouterRouteTable', 'description', 'vRouterRouteTable', value)
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      query: function () {
        return rpc.query('vrouter-route-tables', {
          q: `uuid=${this.windowData.dataUuid}`
        })
          .then(resp => {
            return this.updateDbRow({
              tableName: 'vRouterRouteTable',
              id: this.windowData.dataUuid,
              data: resp.inventories[0]
            })
          })
      },
      hasAttachedRouter: function (uuid) {
        return this.dbData.vRouterRouteTable[uuid] && this.dbData.vRouterRouteTable[uuid].attachedRouterRefs
          && this.dbData.vRouterRouteTable[uuid].attachedRouterRefs.length > 0
      },
      getAttachableRouterList: function () {
        return rpc.query('vrouter-route-tables/virtual-router-refs').then((resp) => {
          if (resp.inventories.length === 0) return []
          let uuidList = resp.inventories.map(item => item.virtualRouterVmUuid)
          return uuidList
        })
      },
      pageAddVRouterRouteEntry: function (fn) {
        const self = this
        self.pageAddVRouterRouteEntryParam = {
          conditions: [this.windowData.dataUuid],
          ok: (param) => self.createVRouterRouteEntry(this.windowData.dataUuid, param, fn)
        }
        self.showAddVRouterRouteEntry = true;
      },
      pageDelete: function (uuid) {
        const self = this
        self.openDialog('ConfirmDlg', {
          title: 'vrouterroutetable.delete',
          description: 'vrouterroutetable.deleteTable',
          icon: 'router_table_small',
          uuidList: [uuid],
          ok: () => {
            self.delete([uuid]).then(() => {
              self.$router.push({name: 'vrouterroutetable'})
            })
          },
          getName: (uuid) => {
            return self.dbData.vRouterRouteTable[uuid].name;
          }
        })
      },
      pageAttach: function (uuid) {
        const self = this
        this.getAttachableRouterList().then((virtualRouterVmUuidList) => {
          this.openDialog('RouterMultiSelectList', {
            conditions: [`uuid!?=${virtualRouterVmUuidList.join()}`, 'vmNics.l3Network.networkServices.networkServiceType=VRouterRoute', 'hypervisorType!=ESX'],
            showTab: true,
            select: (uuidList) => {
              self.attach(self.windowData.dataUuid, uuidList, self.query)
            }
          })
        })
      },
      pageDetach: function (uuid) {
        const self = this
        if (self.dbData.vRouterRouteTable[self.windowData.dataUuid].attachedRouterRefs.length === 0) return
        let virtualRouterVmUuidList = self.dbData.vRouterRouteTable[self.windowData.dataUuid].attachedRouterRefs.map(item => item.virtualRouterVmUuid)
        self.openDialog('RouterMultiSelectList', {
          showTab: true,
          conditions: [`uuid?=${virtualRouterVmUuidList.join()}`],
          select: (uuidList) => {
            self.openDialog('ConfirmDlg', {
              uuidList,
              title: 'vrouterroutetable.detach',
              description: 'vrouterroutetable.detachRouter',
              icon: 'router_table_small',
              ok: () => {
                self.detach(self.windowData.dataUuid, uuidList, self.query)
              },
              getName: (uuid) => {
                return self.dbData.vRouterRouteTable[uuid].name;
              }
            })
          }
        })
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({currTab: tabName})
        }
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
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
