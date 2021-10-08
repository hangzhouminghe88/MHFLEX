<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{ $t(`common.virtualrouteroffering`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
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
          <span class="btn-success"
                @click="updateWindow({ currItemUuid: '' }); openCreateVirtualRouterInstanceOfferingDlg()"><i
            class="el-icon-plus icon"></i>{{$t('common.createVirtualRouterOffering')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected && windowData.currItemUuid === '' && pageStart()"><i
            class="el-icon-caret-right icon"></i>{{$t('common.enable')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected && windowData.currItemUuid === '' && pageStop()"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.disable')}}
            </span>
          <drop-down class="btn-primary more dropdown"
                     :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}"
                     :enabled="isSelected && windowData.currItemUuid === ''">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-shareToAll" style="padding-top:12px;" v-permission="'LICENSE_BASIC_PAID'"
                     @click="canShareToAll() && pageShareInstanceOfferingToAll()"
                     :class="{ 'disabled-text': !canShareToAll()}">{{$t("common.shareToAll")}}</a>
                  <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'"
                     @click="hasSharedToAll() && pageRecallInstanceOfferingFromAll()"
                     :class="{ 'disabled-text': !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
                  <a id="common-destroy" @click="isSelected && pageDelete()" :class="{ 'disabled-text': !isSelected}"
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
            <a class="link"
               @click="$router.push(`detailvirtualrouteroffering/${scope.row.uuid}`);">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          label="CPU"
          prop="cpuNum"
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.memory')"
          prop="memorySize"
        >
          <template slot-scope="scope">
            {{bytesToSize(scope.row.memorySize)}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.state')"
          prop="state"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.instanceOffering[scope.row.uuid].state"/>
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
        <add-router-entry-dlg v-if="showRouterEntryDlg" :param="routerEntryMessage"
                              @close="closeRouterEntry"></add-router-entry-dlg>
      </div>
    </div>
  </page-template>
</template>

<script>
  import List from 'src/network/virtualRouterOffering/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import AddRouterEntryDlg from 'src/network/virtualRouterTable/component/AddRouterEntry'
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "VirtualRouterOfferingPage",
    mixins: [Root, WindowBase, List, PageBase],
    components: {PageTemplate, TableBodyItemState, AddRouterEntryDlg},
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        selectUuidList: [],
        sortDirection: '-',
        loading: true,
        methods: {
          queryList: this.queryList
        }
      })
        .then(() => {
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
        showRouterEntryDlg: false,
        routerEntryMessage: {},
        currTab: 'available',
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
      closeRouterEntry() {
        this.showRouterEntryDlg = false;
      },
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
      getSharedToAllList: function () {
        let uuidList = this.selectedList

        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => this.dbData.instanceOffering[uuid].toPublic)
          return list
        }
        return []
      },
      getNotSharedToAllList: function () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !this.dbData.instanceOffering[uuid].toPublic)
          return list
        }
        return []
      },
      hasSharedToAll: function () {
        if (!this.isSelected) return false
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      hasNotSharedToAll: function () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      pageDelete: function () {
        let uuidList = this.selectedList
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'virtualRouterOffering.delete',
            description: this.$t("virtualRouterOffering.info.deleteConfirm", {length: uuidList.length}),
            uuidList: uuidList,
            icon: 'instance_offering_popupico',
            warning: 'virtualRouterOffering.deleteWarning',
            ok: () => {
              self.delete(uuidList, self.queryList);
            },
            getName: (uuid) => {
              return self.dbData.instanceOffering[uuid].name;
            }
          })
        }

      },
      pageStart: function () {
        let uuidList = this.selectedList

        if (uuidList.length > 0) this.start(uuidList)
      },
      pageStop: function () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) this.stop(uuidList)
      },
      openCreateVirtualRouterInstanceOfferingDlg: function () {
        this.$router.push("createvirtualrouteroffering")
      },
      pageRecallInstanceOfferingFromAll: function () {
        let self = this
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'common.recallFromAll',
            description: 'account.recall',
            uuidList: uuidList,
            icon: 'vm_plain',
            ok: () => {
              this.recallFromAll(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.instanceOffering[uuid].name;
            }
          })
        }
      },
      pageShareInstanceOfferingToAll: function () {
        let self = this
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'common.shareToAll',
            uuidList: uuidList,
            description: 'instanceOffering.shareToAllText',
            icon: 'vm_plain',
            ok: () => {
              this.shareInstanceOfferingToAll(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.instanceOffering[uuid].name;
            }
          })

        }
      },
    },
    watch: {},
    filters: {}
  }
</script>

<style scoped>

</style>
