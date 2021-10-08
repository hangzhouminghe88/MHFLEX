<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{ $t(`common.virtualrouter`) }}</span>
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
            <span class="btn-primary" v-permission="'VM.START'"
                  :class="{ 'disabled': !isSelected }"
                  @click="isSelected && pageStart()"><i
              class="el-icon-caret-right icon"></i>{{$t('vm.start')}}</span>
          <span class="btn-primary" v-permission="'VM.REBOOT'"
                :class="{ 'disabled': !isSelected}"
                @click="isSelected && pageReboot()"><i
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
                  <a id="common-reconnect" style="padding-top: 12px;" v-permission="'VR.RECONNECT'"
                     @click="pageReconnect()">{{ $t("common.reconnect") }}</a>
                  <a id="vm-migrate" v-permission="'VM.MIGRATE'"
                     @click="canMigrate() && isSingleSelected && inStates('Stopped', 'Running') && pageMigrate()"
                     :class="{ 'disabled-text': !(canMigrate() && isSingleSelected && inStates('Stopped', 'Running'))}">{{ $t("vm.migrate") }}</a>
                  <a id="vm-console" v-permission="'CONSOLE-ACCESS.REQUEST'"
                     @click="(isSingleSelected && inStates('Running')) && pageOpenConsole()"
                     :class="{ 'disabled-text': !(isSingleSelected && inStates('Running'))}">{{ $t("vm.console") }}</a>
                  <a id="common-setConsolePassword" v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']"
                     @click="(isSingleSelected && inStates('Running', 'Stopped')) && !consolePasswordIsSet(selectedList[0]) && pageSetVmConsolePassword()"
                     :class="{ 'disabled-text': !(isSingleSelected && inStates('Running', 'Stopped')) || consolePasswordIsSet(selectedList[0])}">{{ $t("common.setConsolePassword") }}</a>
                  <a id="vm-deleteConsolePassword" v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']"
                     :class="{ 'disabled-text': !(isSingleSelected && inStates('Running', 'Stopped') && consolePasswordIsSet(selectedList[0]))}"
                     @click="(isSingleSelected && inStates('Running', 'Stopped')) && consolePasswordIsSet(selectedList[0]) && pageDeleteVmConsolePassword()">{{ $t("vm.deleteConsolePassword") }}</a>
                  <a id="common-destroy" v-permission="'VM.DESTROY'" @click="pageDelete()"
                     style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
                </div>
              </transition>
            </span>
          </drop-down>
          <help-trigger name="virtualRouter" style="position: absolute; left: 295px; top: 10px;"/>
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
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</div>
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
          :label="$t('common.privateNetworkCidr')"
          prop="networkCidr"
          v-if="dbData.common.isAdmin"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.hostIp')"
          prop="hostIp" v-if="dbData.common.isAdmin"
        >
          <template slot-scope="scope">
            {{getHostIp(scope.row.uuid)}}
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
          :label="$t('common.haLevel')"
          prop="haLevel"
        >
        </el-table-column>

        <el-table-column
          :label="$t('common.createDate')"
          prop="createDate"
          show-overflow-tooltip>
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
  import List from 'src/network/virtualRouter/List'
  import PageTemplate from "../../component/PageTemplate";
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import HostSingleDlg from 'src/dialog/HostSingleSelectDlg';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "VirtualRouterPage",
    mixins: [Root, WindowBase, List, PageBase],
    components: {TableBodyItemState, HostSingleDlg, PageTemplate},
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
      rpc.query('vm-instances/appliances/virtual-routers', {
        count: true,
        q: this.conditions.destroyed
      }).then((resp) => {
        this.updateWindow({destroyedCount: resp.total})
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
        itemList: [],
        showHostSingleDlg: false,
        hostSingleMessage: {},
      }

    },
    methods: {
      //搜索
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      //刷新
      refresh() {
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          currItemUuid: ''
        }).then(() => {

          self.queryList();
        })
      },
      //排序
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
      //多选
      handleSelect(rows) {
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      //翻页
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

      goToDetail(uuid) {
        let self = this;
        self.$router.push({name: 'detailVirtualRouter', params: {uuid}})
      }
    },
  }
</script>

<style scoped>

</style>
