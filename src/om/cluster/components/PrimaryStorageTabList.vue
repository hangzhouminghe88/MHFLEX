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
                <a style="margin-top: 12px;" @click="!isSelected && canAttachPrimaryStorage(param.clusterUuid) && attachPs()" :class="{'disabled-text':  isSelected || !canAttachPrimaryStorage(param.clusterUuid)}">{{$t('common.attach')}}</a>
                <a style="margin-bottom: 12px" @click="isSelected && detachPs()" :class="{ 'disabled-text': !isSelected}">{{$t('common.detach')}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
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
          <span class="link" @click="goToPs(scope.row.uuid)">{{scope.row.name}}</span>
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
      <el-pagination v-if="windowData.availableContent > 0"
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
  import TableBodyItemState from 'src/component/TableBodyItemState';
  import ClusterMethods from 'src/om/cluster/Methods';
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';

  export default {
    name: "PrimaryStorageTabList",
    mixins: [Root, WindowBase, PrimaryStorageList, ClusterMethods],
    components: {
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
        let self = this;
        return self.windowData.selectedUuidList.length >=1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList;
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
        searchStr: '',
        selectVal: 'name',
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
        itemList: []
      }
    },
    methods: {
      init: function () {
        this.updateWindow({
          sortBy: 'createDate',
          sortDirection: '-',
          conditions: this.param.conditions,
          pageIndex: 1,
          pageCount: 1,
          pageSize: 10,
          selectedUuidList: [],
          methods: {
            queryList: this.queryList
          },
          uuid: this.param.uuid
        }).then(() => this.queryList())
      },
      getCondition: function () {
        let conditionList = [], self = this;
        conditionList.push(`zone.uuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`cluster.uuid=${this.param.clusterUuid}`)
        if (self.selectVal !=='' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=${encodeURIComponent(self.searchStr)}`)
        }
        return conditionList
      },
      handleSelection(val) {
        this.selectList = val;
        let uuidList = [];
        uuidList = val.map((v) => {
          return v.uuid;
        })
        this.updateWindow({
          selectList: this.selectList,
          selectedUuidList: uuidList
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
        let self = this;
        self.updateWindow({
          pageIndex: 1,
        }).then(() => {
          self.queryList();
        })
      },
      //卸载主存储
      detachPs(){
        let self = this;
        if (!self.selectedList || self.selectedList.length <= 0) return
        let uuidList = self.selectedList
        self.openDialog('ConfirmDlg', {
          title: 'common.detachprimarystorage',
          description: 'primaryStorage.detachPS',
          warning: 'primaryStorage.detachClusterWarning',
          icon: 'storage_popupico',
          uuidList,
          getName(uuid){
            return self.dbData.primarystorage[uuid].name;
          },
          ok(){
            self.detachPrimaryStorage(self.param.clusterUuid, self.selectedList)
              .then(() => {
                self.queryList();
              })
          }
        })
      },
      //加载主存储
      async attachPs(){
        let self = this;
        let uuid = self.param.clusterUuid;
        let psUuidList = await primaryStorageConditon.getClusterAttachablePrimaryStorage(uuid)
        await this.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`uuid?=${psUuidList}`],
          type:'radio',
          select: (primarystorageuuid) => this.attachPrimaryStorage(uuid, primarystorageuuid).then(() => {
            self.queryList();
          })
        })
      },
      //跳转到主存储详情
      goToPs(uuid){
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
