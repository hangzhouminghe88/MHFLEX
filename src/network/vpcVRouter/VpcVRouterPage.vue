<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{ $t(`common.vpcvrouter`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"
              name="available" v-if="dbData.common.isAdmin"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-success" v-permission="['VPC.CREATE', 'VPC.ADD_DNS']"
                @click="openCreateVpc()"><i class="el-icon-plus icon"></i>{{$t('vpcVRouter.create')}}</span>

          <span class="btn-primary" v-permission="'VM.START'"
                :class="{ 'disabled': !isSelected || inStatuses('Connecting') || !canStart() }"
                @click="isSelected && !inStatuses('Connecting') && canStart() && pageStart()"><i
            class="el-icon-caret-right icon"></i>{{$t('vm.start')}}</span>
          <span class="btn-primary" v-permission="'VM.REBOOT'"
                :class="{ 'disabled': !isSelected || inStatuses('Connecting') || !canReboot()}"
                @click="isSelected && !inStatuses('Connecting') && canReboot() && pageReboot()"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.reboot')}}
            </span>

          <drop-down class="btn-primary more dropdown"
                     :class="{'disabled': !isSelected}"
                     :enabled="isSelected">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-reconnect" style="padding-top: 12px;"
                     v-permission="'VR.RECONNECT'"
                     :class="{'disabled-text':inStatuses('Connecting') }"
                     @click="pageReconnect()">{{ $t("common.reconnect") }}</a>
                  <a id="vm-migrate" v-permission="'VM.MIGRATE'" @click="canMigrate() && pageMigrate()"
                     :class="{ 'disabled-text': !canMigrate() }">{{ $t("vm.migrate") }}</a>
                  <a id="vm-console" v-permission="'CONSOLE-ACCESS.REQUEST'"
                     @click="canOpenConsole() && pageOpenConsole()" :class="{ 'disabled-text': !canOpenConsole() }">{{ $t("vm.console") }}</a>
                  <a id="common-setConsolePassword" v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']"
                     @click="canSetVmConsolePassword() && pageSetVmConsolePassword()"
                     :class="{ 'disabled-text': !canSetVmConsolePassword()}">{{ $t("common.setConsolePassword") }}</a>
                  <a id="vm-deleteConsolePassword" v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']"
                     :class="{ 'disabled-text': !canDeleteConsolepassword()}"
                     @click="canDeleteVmConsolePassword() && pageDeleteVmConsolePassword()">{{ $t("vm.deleteConsolePassword") }}</a>
                  <a id="common-destroy" v-permission="'VM.DESTROY'" @click="pageDelete()"
                     style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
                </div>
              </transition>
            </span>
          </drop-down>
        </div>
        <div style="text-align: right;flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
      <host-single-dlg :model="showHostSingleDlg"
                       :message="hostSingleMessage"
                       v-if="showHostSingleDlg"
                       @close="closeHostSingleDlg"/>
    </div>

    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        ref="multipleTable"
        :data="itemList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelect"
        v-loading="windowData.loading"
        @sort-change="handleSort"
      >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          :label="$t('common.name')"
          prop="name"
        >
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.cpuNum')"
          prop="cpuNum"
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.memorySize')"
          prop="memorySize"
        >
          <template slot-scope="scope">
            {{bytesToSize(scope.row.memorySize)}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.defaultIp')"
          prop="defaultIp"
        >
          <template slot-scope="scope">
            {{getDefaultL3NetworkIp(scope.row.uuid)}}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.cluster')"
          prop="cluster" v-if="dbData.common.isAdmin"
        >
          <template slot-scope="scope">
            {{getClusterName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.state')"
          prop="state"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.status')"
          prop="status"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"/>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.owner')"
          prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource"
        >
          <template slot-scope="scope">
            {{getAccountName(scope.row.uuid)}}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.createDate')"
          prop="createDate">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.availableCount"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>

      </div>
    </div>
  </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import List from 'src/network/vpcVRouter/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import HostSingleDlg from "../../dialog/HostSingleSelectDlg";

  export default {
    name: "VpcVRouterPage",
    mixins: [Root, WindowBase, List, PageBase],
    components: {HostSingleDlg, TableBodyItemState, PageTemplate},
    created: function () {
      this.self = this
      const initTab = 'available'
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        currItemUuid: '',
        currTab: initTab,
        condition: this.conditions[initTab],
        selectUuidList: [],
        loading: false,
        methods: {
          queryList: this.queryList
        },
        showMoreDropdown: false
      }).then(() => {
        this.queryList()
      })

    },
    computed: {
      isSelected() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >= 1;
      },
      selectedList() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
      isSingleSelected() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length === 1;
      }
    },
    destroyed: function () {

    },
    data() {
      return {
        showHostSingleDlg: false,
        hostSingleMessage: {},
        conditions: {
          'available': 'state!=Destroyed',
          'destroyed': 'state=Destroyed'
        },
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        searchStr: "",
        selectVal: 'name',
        itemList: []
      }

    },
    methods: {
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      refresh() {
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          currItemUuid: ''
        }).then(() => {

          self.queryList();
        })
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      handleSelect(rows) {
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val,
          pageIndex: 1,
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      openCreateVpc: function () {
        const self = this
        let create = function (param) {
          self.create(param)
            .then(() => {
              self.queryList()
            })
        }
        self.$router.push({name: 'createvpcvrouter'})
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({
            currItemUuid: '',
            currTab: tabName,
            conditions: this.conditions[tabName]
          })
          this.queryList()
        }
      },
      pageDelete: function () {
        let uuidList = this.selectedList

        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'vpcVRouter.delete',
            description: this.$t("vpcVRouter.info.deleteConfirm", {length: uuidList.length}),
            warning: 'vpcVRouter.info.deleteWarning',
            uuidList: uuidList,
            icon: 'virtual_router_popupico',
            isChecked: true,
            checkBoxText: '我已知晓上述风险',
            ok: (isOrigin) => {
              if(isOrigin)
              self.delete(uuidList).then(() => self.queryList())
            },
            getName: (uuid) => {
              return self.dbData.vm[uuid].name;
            }
          })

        }
      },
      pageExpunge: function () {
        let uuidList = this.selectedList

        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'identity.VM.EXPUNGE',
            description: this.$t("vm.expungeVm", {length: uuidList.length}),
            uuidList: uuidList,
            icon: 'vm_popupico',
            ok: () => {
              self.expunge(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.vm[uuid].name;
            }
          })
        }
      },
      pageRecover: function () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) this.recover(uuidList)
      },
      pageStart: function () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) {
          this.start(uuidList, this.queryList)
        }
      },
      pageStop: function () {
        let uuidList = this.selectedList

        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: self.$t(`vm.${self.$data.type}`) + ' ' + self.$t("common.vm") + ' ' + (self.$data.text ? self.$t(`vm.${self.$data.text}`) : void 0),
            description: self.$t("vm.singleVmActionTitle", {
              type: self.$t(`vm.${self.$data.type}`),
              text: self.$data.text ? self.$t(`vm.${self.$data.text}`) : ''
            }),
            uuidList: uuidList,
            icon: 'vm_plain',
            ok: () => {
              self.stop(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.vm[uuid].name;
            }
          })
        }
      },
      pageReboot: function () {
        let uuidList = this.selectedList

        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'vpcVRouter.reboot',
            desc: 'vpcVRouter.rebootConfirm',
            icon: 'virtual_router_popupico',
            uuidList,
            ok: () => {
              self.reboot(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.vm[uuid].name;
            }
          })
        }
      },
      pagePowerOff: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected && this.dbData.vm[uuid].hypervisorType !== 'ESX') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVirtualRouterVmInstanceConfirm', {
            'confirmDlgType': 'PowerOff',
            'applianceVmType': 'vpcvrouter',
            uuidList,
            ok: () => {
              self.powerOff(uuidList)
            }
          })
            .then(() => {
            })
        }
      },
      pageMigrate: function () {
        if (!this.isSingleSelected) return
        let self = this
        let vmUuid = self.selectedList[0]
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

      pageSetVmConsolePassword: function () {
        let self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openDialog('ModifyVpcVRouterDlg', {
          ok: (msg, isReboot) => {
            self.setVmConsolePassword(selectedUuidList, msg, isReboot).then(() => {
              self.$forceUpdate()
            })
          }
        })
      },
      pageDeleteVmConsolePassword: function () {
        let self = this
        if (self.selectedList.length === 0) return
        let uuidList = []
        self.selectedList.forEach((uuid) => {
          if (self.dbData.vmInstancesConsolePassword[uuid].hasPassword) uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            uuidList,
            title: `vpcVRouter.cancelConsolePassword`,
            description: `vpcVRouter.cancelConsolePassword_Confirm`,
            ok: (isReboot) => {
              self.deleteVmConsolePassword(uuidList, isReboot);
            },
            icon: 'virtual_router_popupico',
            getName: (uuid) => {
              return this.dbData.vm[uuid].name;
            }
          })
        }
      },
      canDeleteConsolepassword: function () {
        if (this.selectedList.length === 0) return
        return !this.selectedList.every((uuid) => {
          return !this.dbData.vmInstancesConsolePassword[uuid].hasPassword
        })
      },
      //Vpc路由器详情
      goToDetail(uuid) {
        let self = this;
        self.$router.push({name: 'detailVpcVRouter', params: {uuid}})
      }
    },
    watch: {},
    filters: {}
  }
</script>

<style scoped>

</style>
