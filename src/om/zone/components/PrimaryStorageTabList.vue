<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="tablist-title">{{ $t('common.primaryStorage') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
                        <span slot="title">
                            <span id="common-actions" class="text">{{$t('common.actions')}}</span>
                        </span>
            <span slot="content">
                            <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                                <a id="primaryStorage-add" style="padding-top: 12px;"
                                   @click="openCreatePrimaryStorage(windowData.uuid)">{{ $t("primaryStorage.add") }}</a>
                                <a id="common-start" @click="isSelected && !inStates('Enabled') && pageEnable()"
                                   :class="{ 'disabled-text':!isSelected || inStates('Enabled') }">{{ $t("common.start") }}</a>
                                <a id="common-stop" @click="isSelected && !inStates('Disabled') && pageDisable()"
                                   :class="{ 'disabled-text': !isSelected ||inStates('Disabled')}">{{ $t("common.stop") }}</a>
                                <a id="common-reconnect" @click="pageReconnect()"
                                   :class="{ 'disabled-text': !isSelected }">{{ $t("common.reconnect") }}</a>
                                <a id="common-createVolume" @click="isSingleSelected && pageCreateVolume()"
                                   :class="{ 'disabled-text': !isSingleSelected }">{{ $t("common.createVolume") }}</a>
                                <a id="common-attachCluster" @click="isSingleSelected && pageAttachCluster()"
                                   :class="{ 'disabled-text': !isSingleSelected }">{{ $t("common.attachCluster") }}</a>
                                <a id="common-detachCluster" @click="canDetachCluster() && pageDetachCluster()"
                                   :class="{ 'disabled-text': !canDetachCluster() }">{{ $t("common.detachCluster") }}</a>
                                <a id="common-intoMaintain" @click="isSelected && pageMaintain()"
                                   :class="{ 'disabled-text': !isSelected }">{{ $t("common.intoMaintain") }}</a>
                                <a id="common-destroy" @click="isSelected && pageDelete()" style="padding-bottom: 12px;"
                                   :class="{ 'disabled-text': !isSelected }">{{ $t("common.destroy") }}</a>
                            </div>
                        </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <cluster-single-dlg v-if="showClusterSingleDlg" :model="showClusterSingleDlg" :message="clusterMessage" @close="closeClusterSingleDlg()"/>
    <el-table :data="itemList"
              @selection-change="handleSelection">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
      <el-table-column
        :label="$t('common.name')"
        prop="name"
      >
        <template slot-scope="scope">
          <span class="link" @click="goToPrimaryStorage(scope.row.uuid)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.type')"
        prop="type"
      >
      </el-table-column>
      <el-table-column
        :label="$t('common.url')"
        prop="url"
      >
      </el-table-column>
      <el-table-column
        :label="$t('common.psCapacity')"
        prop="psCapacity"
      >
        <template slot-scope="scope">
          <div class="text">
            <span class="available">{{availableContent(scope.row.availableCapacity)}} {{$t( 'common.enabled')}}</span>
            <span class="total">({{$t('common.total')}} {{totalContent(scope.row.totalCapacity) }})</span>
          </div>
          <el-progress :percentage="percentNum(scope.row.availableCapacity,scope.row.totalCapacity)"></el-progress>
        </template>
      </el-table-column>
      <el-table-column
        prop="state"
        :label="$t('common.state')"
        sortable>
        <template slot-scope="scope">
          <table-body-item-state :state="scope.row.state"></table-body-item-state>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.status')"
        prop="status"
      >
        <template slot-scope="scope">
          <table-body-item-state :state="scope.row.status"/>
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
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="windowData.availableCount"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Root from 'src/windows/Root';
  import PrimaryStorageList from 'src/storage/primarystorage/List';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import ClusterSingleDlg from "../../../dialog/ClusterSingleDlg";
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';

  export default {
    name: "PrimaryStorageTabList",
    mixins: [Root, WindowBase, PrimaryStorageList],
    components: {
      ClusterSingleDlg,
      TableBodyItemState,
    },
    props: ['param'],
    computed: {
      availableContent() {
        return function (availableSize) {
          let size = Number(availableSize);
          return size >= 0 ? this.bytesToSize(size) : `-${this.bytesToSize(-size)}`
        }
      },
      totalContent() {
        return function (totalSize) {
          return this.bytesToSize(Number(totalSize))
        }

      },
      percentNum() {
        return function (availableSize, totalSize) {
          let availablePercent = Number(availableSize) / Number(totalSize);
          if (Number(availableSize) <= 0) return 0;
          return parseInt((1 - availablePercent.toFixed(2)) * 100)
        }
      },
      isSelected(){
        let self  = this;
        return self.windowData.selectList.length >=1;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData.selectList.length ===1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectUuidList;
      }
    },
    created() {
      this.init();
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data() {
      return {
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
        selectVal: 'name',
        searchStr: '',
        showClusterSingleDlg: false,
        clusterMessage: {},
        itemList: []
      }
    },
    methods: {
      init: function () {
        let self = this;
        this.updateWindow({
          sortBy: 'createDate',
          sortDirection: '-',
          conditions: self.param.conditions,
          pageIndex: 1,
          pageCount: 1,
          pageSize: 10,
          uuid: self.param.uuid,
          selectList: [],
          selectUuidList: [],
          methods: {
            queryList: self.queryList
          },
        }).then(() => self.queryList())
      },
      getCondition: function () {
        let conditionList = [], self = this;
        conditionList.push(self.windowData.conditions)
        conditionList.push('type!=VCenter')
        if (self.selectVal !=='' && self.searchStr !=='') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      handleSelection(val) {
        this.selectList = val;
        let uuidList = val.map((item)=> {return item.uuid});
        this.updateWindow({
          selectList: this.selectList,
          selectUuidList: uuidList
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      search(){
        this.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            this.queryList();
          })
      },
      inStates(){
        if (!this.isSelected) return
        let statesList = []
        if (arguments) {
          for (var i = 0; i < arguments.length; i++) {
            statesList.push(arguments[i])
          }
        }
        let selectedStatesList = []
        this.windowData.selectUuidList.forEach((uuid) => {
          selectedStatesList.push(this.dbData.primarystorage[uuid].state)
        })
        let isInStates = selectedStatesList.every((item) => {
          return statesList.some((state) => { return state === item })
        })
        return isInStates
      },
      pageEnable(){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        self.windowData.selectUuidList.forEach(uuid =>{
          if(self.dbData.primarystorage[uuid].state !== 'Enabled') uuidList.push(uuid);
        });
        self.enable(uuidList)
      },
      pageDisable(){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        self.windowData.selectUuidList.forEach(uuid =>{
          if(self.dbData.primarystorage[uuid].state !== 'Disabled') uuidList.push(uuid);
        });
        self.openDialog('ConfirmDlg', {
          title: 'primaryStorage.disable',
          description: 'primaryStorage.disablePS',
          icon: 'storage_popupico',
          getName(uuid){
            return self.dbData.primarystorage[uuid].name;
          },
          uuidList,
          ok(){
            self.disable(uuidList)
          }
        })
      },
      pageReconnect(){
        let self = this, uuidList;
        uuidList = self.windowData.selectUuidList;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          title: 'primaryStorage.reconnect',
          waring: 'primaryStorage.reconnectWarning',
          description: 'primaryStorage.disablePS',
          icon: 'storage_popupico',
          getName(uuid){
            return self.dbData.primarystorage[uuid].name;
          },
          uuidList,
          ok(){
            self.reconnect(uuidList)
          }
        })
      },
      pageDelete(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectUuidList;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          title: 'common.destroyPrimaryStorage',
          description: 'primaryStorage.deletePS',
          icon: 'storage_popupico',
          getName(uuid){
            return self.dbData.primarystorage[uuid].name;
          },
          uuidList,
          ok(){
            self.delete(uuidList);
          }
        })
      },
      pageMaintain(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectUuidList;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          title: 'common.intoMaintain',
          description: 'primaryStorage.maintainPs',
          waring: 'primaryStorage.maintainPsWarning',
          icon: 'storage_popupico',
          getName(uuid){
            return self.dbData.primarystorage[uuid].name;
          },
          uuidList,
          ok(){
            self.maintain(uuidList)
          }
        })
      },
      pageAttachCluster: async function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        let uuidList = await primaryStorageConditon.getPrimaryStorageAttachableCluster(this.dbData.primarystorage[selectedUuidList[0]], this.dbData.common.isOpensource)
        this.openDialog('PrimaryStorageAttachClusterDlg', {
          primaryStorageUid: selectedUuidList[0],
          conditions: [`uuid?=${uuidList}`],
          zoneUuid: `${this.windowData.uuid}`,
          select: (clusterUuidList) => {
            this.attachDataClustertoPrimaryStorage(clusterUuidList, selectedUuidList[0]).then(() => {
              this.init()
            })
          }
        })
      },
      pageDetachCluster(){
        let selectedUuidList = this.selectedList, self = this;
        self.openDialog('ClusterSelectListDlg', {
          conditions: [`primaryStorage.uuid=${selectedUuidList[0]}`],
          zoneUuid: `zoneUuid=${this.windowData.uuid}`,
          type: 'selection',
          select: (clusterList) => {
            self.openDialog('ConfirmDlg', {
              title: 'common.detachCluster',
              description: 'cluster.detachCluser',
              icon: 'cluster_popupico',
              warning: 'primaryStorage.detachClusterWarning',
              getName(uuid){
                return self.dbData.cluster[uuid].name;
              },
              uuidList: clusterList,
              ok: () => {
                self.detachDataClustertoPrimaryStorage(clusterList, selectedUuidList[0]).then(() => {
                  self.init()
                })
              }
            })
          }
        })
      },
      goToPrimaryStorage(uuid){
        let self = this;
        self.$router.push({name: 'detailprimarystorage', params: {uuid}})
      }
    },
  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>
