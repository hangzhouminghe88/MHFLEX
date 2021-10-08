<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{ $t(`common.backupstorage`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-success" @click="updateWindow({ currItemUuid: '' }); openCreateBackupStorage()"><i class="el-icon-plus icon"></i>{{$t('common.addBackupStorage')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }" @click="isSelected && windowData.currItemUuid === '' && pageEnable()"><i
                      class="el-icon-caret-right icon"></i>{{$t('common.enable')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }" @click="isSelected && windowData.currItemUuid === '' && pageDisable()"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.disable')}}
          </span>

          <drop-down class="btn-primary more dropdown" :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}" :enabled="isSelected && windowData.currItemUuid === ''">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-reconnect" @click="pageReconnect()" style="padding-top: 12px;">{{$t('common.reconnect')}}</a>
                  <a id="common-clear" v-permission="'LICENSE_BASIC_PAID'" @click="canClear && reclaimSpaceFromImageStore()" :class="{'disabled-text': !canClear || !isDisconnectOrImageStore()}">{{$t('common.clear')}}
                    <help-trigger name="clearBackUpStorage" :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }" />
                  </a>
                  <a id="common-destroy" @click="pageDelete" style="padding-bottom: 12px;">{{$t('common.destroy')}}</a>
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
            <a class="link" @click="$router.push(`detailbackupstorage/${scope.row.uuid}`);">{{scope.row.name}}</a>
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
          :label="$t('common.bsCapacity')"
          prop="bsCapacity"
        >
          <template slot-scope="scope">
            <div class="text" :title="availableContent(scope.row.availableCapacity) + `(${$t('common.total') + totalContent(scope.row.totalCapacity)})` ">
              <span class="available">{{availableContent(scope.row.availableCapacity)}} {{$t( 'common.enabled')}}</span>
              <span class="total">({{$t('common.total')}} {{totalContent(scope.row.totalCapacity) }})</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-bar-item" :style="{width: `${percentNum(scope.row.availableCapacity,scope.row.totalCapacity)}%`}"></div>
              </div>
              <div class="progress-text">
                {{percentNum(scope.row.availableCapacity,scope.row.totalCapacity)}}%({{$t('common.enabled')}})
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.state')"
          prop="state"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.backupstorage[scope.row.uuid].state"/>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.status')"
          prop="status"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.backupstorage[scope.row.uuid].status"/>
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
  import BackupStorageList from 'src/storage/backupstorage/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import rpc from 'src/utils/rpc';

  import Utils from 'src/utils/utils';

    export default {
      name: "PrimaryStoragePage",
      mixins: [Root,WindowBase,BackupStorageList, PageBase],
      components: {PageTemplate,TableBodyItemState},
      created: function () {
        this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          currItemUuid: '',
          selectUuidList: [],
          sortBy: 'createDate',
          sortDirection: '-',
          methods: {
            queryList: this.queryList
          }
        })
          .then(() => {
            this.queryList()
          })
      },
      computed:{
        percentNum(){
          return function(availableSize,totalSize) {
            debugger
            let availablePercent = Number(availableSize) / Number(totalSize)
            if (Number(availableSize) <=0) return 0
            return parseInt((availablePercent.toFixed(2))*100)
          }
        },
        availableContent(){
          return function(availableSize){
            let size = Number(availableSize)
            return size >= 0 ? this.bytesToSize(size) : `-${this.bytesToSize(-size)}`
          }
        },
        totalContent(){
          return function (totalSize) {
            return this.bytesToSize(Number(totalSize))
          }
        },
        isSelected(){
          let self = this;
          return self.windowData && self.windowData.selectUuidList.length >=1;
        },
        selectedList(){
          let self = this;
          return self.windowData && self.windowData.selectUuidList;
        },
        isSingleSelected(){
          let self = this;
          return self.windowData && self.windowData.selectUuidList.length ===1;
        }
      },
      destroyed: function () {
        this.deleteCurrAssistant(this.windowData.id)
      },
      data () {
        return {
          currTab: 'available',
          searchStr: "",
          selectVal: 'name',
          conditionNameList: [
            {name: 'common.name', value: 'name'},
            {name: 'common.uuid', value: 'uuid'}
          ],
          message: {},
          itemList:[]
        }
      },
      methods: {
        ...Utils,
        getCondition: function () {
          let conditionList = []
          conditionList.push(`zone.uuid=${window.localStorage.getItem('currZoneUuid')}`)
          conditionList.push('type!=VCenter')
          let tags = ['remote', 'aliyun', 'onlybackup', 'remotebackup']
          conditionList.push(`__systemTag__!?=${tags}`)
          if (this.selectVal !== '' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
          }
          return conditionList
        },
        search(){
          let self = this;
          self.updateWindow({
            pageIndex: 1
          }).then(() => {
            self.queryList()
          })


        },
        refresh(){
          let self = this;
          self.updateWindow({
            pageIndex: 1
          }).then(() => {

            self.queryList();
          })
        },
        handleSort(e){
          if(e.order === 'ascending'){
            this.updateWindow({
              sortBy: e.prop,
              sortDirection: '+'
            })
          }else{
            this.updateWindow({
              sortBy: e.prop,
              sortDirection: '-'
            })
          }
          this.queryList();
        },
        handleSelect(rows){
          let self = this, uuidList = [];
          uuidList = rows.map((item) => {
            return item.uuid;
          });
          self.updateWindow({
            selectUuidList: uuidList
          })
        },
        isDisconnectOrImageStore: function () {
          if (!this.isSelected || this.selectedList.length < 0) return false
          return this.selectedList.some(uuid => {
            return _.get(this.dbData, ['backupstorage', `${uuid}`, 'status']) === 'Disconnected' || _.get(this.dbData, ['backupstorage', `${uuid}`, 'type']) === 'ImageStoreBackupStorage'
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
      watch: {

      },
      filters: {
      }
    }
</script>

<style scoped lang="less">
  .progress-container{
    width: 100%;
    position: relative;
  }
  .progress-bar{
    width: 50%;
    border-radius: 10px;
    height: 6px;
    background: #dae0e6;
    display: inline-block;
    vertical-align: top;
  }
  .progress-bar-item{
    border-radius: 10px;
    height: 6px;
    background: #409EFF;
    position: relative;
  &:after{
     content: '';
     height: 6px;
     position: absolute;
     background: linear-gradient(to right, #fff, #409EFF);
     background: -ms-linear-gradient(to right, #fff, #409EFF);
     opacity: 0.5;
     animation: progress-frame 1s infinite;
   }
  }

  .progress-text{
    line-height: 5px;
    padding-left: 3px;
    position: absolute;
    display: inline-block;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @keyframes progress-frame {
    0% {
      width: 0;
    }
    100% {
      width: 100%;
    }
  }

  .text{
    padding-bottom: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
