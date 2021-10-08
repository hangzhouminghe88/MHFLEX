<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{ $t(`common.vrouterroutetable`) }}</span>
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
          <span class="btn-success" @click="updateWindow({ currItemUuid: '' }); openCreateVRouterRouteTable()"><i
            class="el-icon-plus icon"></i>{{$t('vrouterroutetable.create')}}</span>

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
                  <a id="vRouterRouteEntry-add" style="padding-top: 12px;"
                     @click="isSingleSelected && pageAddVRouterRouteEntry()"
                     :class="{'disabled-text': !isSingleSelected}">{{$t("vRouterRouteEntry.add")}}</a>
                  <a id="vrouterroutetable-attach" @click="isSingleSelected && pageAttach()"
                     :class="{'disabled-text': !isSingleSelected}">{{$t("vrouterroutetable.attach")}}</a>
                  <a id="vrouterroutetable-detach"
                     @click="isSingleSelected && hasAttachedRouter(selectedList[0]) && pageDetach()"
                     :class="{'disabled-text': !(isSingleSelected && hasAttachedRouter(selectedList[0]))}">{{$t("vrouterroutetable.detach")}}</a>
                  <a id="common-destroy" style="padding-bottom: 12px;"
                     @click="pageDelete()">{{ $t("common.destroy")}}</a>
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
            <a class="link" @click="$router.push(`detailvrouterroutetable/${scope.row.uuid}`);">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('vrouterroutetable.entryNum')"
          prop="routeEntries.length"
        >
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
  import List from 'src/network/virtualRouterTable/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import AddRouterEntryDlg from 'src/network/virtualRouterTable/component/AddRouterEntry'

  export default {
    name: "VirtualRouterTablePage",
    mixins: [Root, WindowBase, List, PageBase],
    components: {PageTemplate, AddRouterEntryDlg},
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        selectUuidList: [],
        sortDirection: '-',
        loading: false,
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
      }
    },
    watch: {},
    filters: {}
  }
</script>

<style scoped>

</style>
