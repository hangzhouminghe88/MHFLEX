<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{ $t(`common.sanstorage`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab" @tab-click="tabClick">
            <el-tab-pane :label="`${$t('iSCSI.name')}(${windowData.iSCSICount ? windowData.iSCSICount : '0'})`"
                         name="iSCSI"></el-tab-pane>
            <el-tab-pane :label="`${$t('fc.name')}(${windowData.fcCount ? windowData.fcCount : '0'})`"
                         name="fc"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container" v-if="currTab === 'iSCSI'">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span @click="updateWindow({ currItemUuid: '' }); pageCreate()" class="btn-success"><i
            class="el-icon-plus icon"></i>{{$t('iSCSI.create')}}</span>
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
                  <a :class="{ 'disabled-text': !canAttach() }" @click="canAttach() && pageAttachCluster()">{{ $t("common.attachCluster")}}</a>
                  <a :class="{ 'disabled-text': !isSingleSelected || !canDetach() }"
                     @click="isSingleSelected && canDetach() && pageDetachCluster()">{{ $t("common.detachCluster")}}</a>
                  <a @click="pageSyncServer()">{{ $t("common.update")}}</a>
                  <a @click="pageDelete()">{{$t("common.destroy")}}</a>
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

    <div slot="page-toolbar" class="page-toolbar-container" v-if="currTab === 'fc'">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-primary" @click="windowData.uuidList.length > 0 && pageSyncDevice()"
                :class="{'disabled': windowData.uuidList.length === 0}"><i class="el-icon-plus icon"></i>{{$t('action.fiberChannelLun.refresh')}}</span>

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
                  <a :class="{ 'disabled-text': !canAttach() }" @click="canAttach() && pageAttachVm()">{{ $t("fc.action.attachVm")}}</a>
                  <a :class="{ 'disabled-text': !canDetachVm() }" @click="canDetachVm() && pageDetachVm()">{{ $t("fc.action.detachVm")}}</a>
                  <a :class="{ 'disabled-text': !isSingleSelected }"
                     @click="isSingleSelected && pageCheckClusterStatus()">{{ $t("fc.action.checkClusterStatus")}}</a>
                </div>
              </transition>
            </span>
          </drop-down>
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
            <a class="link" @click="$router.push(`detailsanstorage/${scope.row.uuid}`);">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.ip')"
          prop="ip"
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.port')"
          prop="port"
        >
        </el-table-column>

        <el-table-column
          :label="$t('common.state')"
          prop="state"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.webStorage[scope.row.uuid].state"/>
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
        <el-pagination v-if="windowData.total > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.total"
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
  import SanStorageList from 'src/storage/sanstorage/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "SanStoragePage",
    mixins: [Root, WindowBase, SanStorageList, MultiSelectList, PageBase],
    components: {PageTemplate, TableBodyItemState},
    created: function () {
      //window.addEventListener('click', this.onWindowClick)
      //window.addEventListener('resize', this.resizeHeader)
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        selectedUuidList: [],
        sortBy: 'createDate',
        sortDirection: '-',
        uuidList: [],
        showSearchBox: false,
        loading: false,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
      })
    },
    computed: {},
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
      window.removeEventListener('resize', this.resizeHeader)
    },
    data() {
      return {
        searchStr: "",
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        currTab: 'iSCSI',
        itemList: []
      }
    },
    methods: {
      tabClick(tab, event) {
        this.changeCurrTab(tab.name);
      },
      changeCurrTab(tab) {
        this.updateWindow({
          currItemUuid: '',
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          sortBy: 'createDate',
          sortDirection: '-',
          uuidList: [],
          showSearchBox: false
        }).then(() => {
          return this.queryList()
        })
      },
      close: function (uuid) {
        this.showClusterSelectDlg = false;

        if (!uuid || uuid.length <= 0) return;

        let clusterUuidList = [];
        clusterUuidList.push(uuid);
        if (this.command == "attachCluster") {
          this.attachCluster(this.selectedList[0], clusterUuidList).then(() => {
            this.clearSelect(this.selectedList[0])
            this.queryList()
          })
        }
        if (this.command == "detachCluster") {

          this.detachCluster(this.selectedList[0], clusterUuidList).then(() => {
            this.clearSelect(this.selectedList[0])
            this.queryList()
          })
        }

        this.command = "";
      },
      clickRow: function (uuid, isIqn) {
        if (isIqn === true) {
          this.detailData = this.getChild(uuid, this.itemList)
          this.detailType = 'IQN'
        } else {
          this.detailData = null
          this.detailType = ''
        }
        this.updateWindow({
          currItemUuid: uuid
        })
      },
      pageCreate: function () {
        this.$router.push('createsanstorage');
      },
      pageDelete: function () {
        let self = this
        let uuidList = self.selectedList;

        let hasCluster = false
        for (let uuid of uuidList) {
          let existedList = this.webStorage[uuid].iscsiClusterRefs.map(item => item.clusterUuid)
          if (existedList.length > 0) {
            hasCluster = true
            break
          }
        }

        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'iSCSI.delete',
            description: 'iSCSI.info.deleteConfirm',
            uuidList: uuidList,
            icon: 'pop_iscsi_server_n',
            warning: hasCluster ? 'primaryStorage.deleteWarningThree' : 'iSCSI.info.deleteWarning',
            ok: () => {
              if (!hasCluster) {
                this.dispatchActionWithEvent('webStorage/delete', uuidList)
                  .then(() => {
                    this.queryList()
                  })
              }
            },
            getName: (uuid) => {
              return self.dbData.webStorage[uuid].name;
            }
          })
        }

      },
      pageStart: function () {
        let uuidList = this.selectedList
        uuidList.forEach((uuid) => {
          if (this.webStorage[uuid].state !== 'Enabled') {
            let param = {
              uuid: uuid,
              state: 'Enabled'
            }

            this.dispatchActionWithEvent('webStorage/start', param)
          }
        })
      },
      pageStop: function () {
        let uuidList = this.selectedList
        uuidList.forEach((uuid) => {
          if (this.webStorage[uuid].state !== 'Disabled') {
            let param = {
              uuid: uuid,
              state: 'Disabled'
            }

            this.dispatchActionWithEvent('webStorage/stop', param)
          }
        })
      },
      pageSyncServer: function () {
        this.selectedList.forEach((uuid) => {
          let param = {
            uuid: uuid
          }
          this.dispatchActionWithEvent('webStorage/refreshIscsiServer', param)
            .then(() => {
              this.queryList()
            })

        })
      },
      pageAttachCluster: async function () {
        let self = this
        let uuid = this.selectedList[0]
        let existedList = this.webStorage[uuid].iscsiClusterRefs.map(item => item.clusterUuid)
        let conditions = ['hypervisorType=KVM']
        if (existedList.length > 0) {
          conditions.push(`uuid!?=${existedList}`)
        }

        self.openDialog('ClusterSelectListDlg', {
          conditions,
          type: 'selection',
          select: (clusterList) => {
            return this.attachCluster(uuid, clusterList).then(() => {
              this.queryList()
            })
          }
        })


      },
      updateCount() {
        let conditions = this.getCondition()
        let obj = {}
        let tasks = []
        let p = null
        p = rpc.query(`storage-devices/iscsi/servers`, {q: conditions, count: true}).then(resp => {
          obj.iSCSICount = resp.total || 0
        })
        tasks.push(p)
        p = rpc.query(`storage-devices/fiber-channel/luns`, {q: conditions}).then(resp => {
          obj.fcCount = _.uniq(resp.inventories.map(v => v.fiberChannelStorageUuid)).length
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return this.updateWindow(obj)
        })
      },
      pageDetachCluster: function () {
        let self = this
        let uuid = this.selectedList[0]
        let existedList = this.webStorage[uuid].iscsiClusterRefs.map(item => item.clusterUuid)
        self.openDialog('ClusterSelectListDlg', {
          conditions: [`uuid?=${existedList}`],
          type: 'selection',
          select: (clusterList) => {
            return this.detachCluster(uuid, clusterList).then(() => {
              this.queryList()
            })
          }
        })

      },
      ...Utils
    },
    watch: {},
    filters: {}
  }
</script>

<style scoped>

</style>
