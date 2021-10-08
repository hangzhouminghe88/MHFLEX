<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.volumeOffering')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs active-name="available">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : 0})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row style="flex-wrap: nowrap;" type="flex">
        <div style="flex-shrink: 0;">
          <span @click="$router.push({name:'createVolumeOffering'})" class="btn-success"><i
            class="el-icon-plus icon"></i>{{$t('common.createVolumeOffering')}}</span>
          <span class="btn-primary" :class="{'disabled': !isSelected || inStates('Enabled')}" @click="isSelected && !inStates('Enabled') && pageOperate('start')"><i
            class="el-icon-caret-right icon"></i>{{$t('common.enable')}}</span>
          <span class="btn-primary" :class="{'disabled': !isSelected || inStates('Disabled')}" @click="isSelected && !inStates('Disabled') && pageOperate('stop')"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.disable')}}
          </span>
          <drop-down class="btn-primary more dropdown" :class="{'disabled': !isSelected}" :enabled="isSelected">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a style="margin-top: 12px"  v-show="isAdmin" @click="isSelected && canShareToAll() && pageShareOperate('share')" :class="{ 'disabled-text': !isSelected || !canShareToAll()}">{{$t('common.shareToAll')}}</a>
                  <a  v-show="isAdmin" :class="{'disabled-text': !isSelected || canShareToAll()}" @click="isSelected && !canShareToAll() && pageShareOperate('notShare')">{{$t('common.recallFromAll')}}</a>
                  <a style="margin-bottom: 12px" @click="pageDelete()">{{$t('common.destroyed')}}</a>
                </div>
              </transition>
            </span>
          </drop-down>
        </div>
        <div style="flex-shrink: 1; flex-grow: 1; min-width: 0px;"></div>
        <div :span="10" style="text-align: right; flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
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
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @sort-change="handleSort"
        @selection-change="handleSelection"
        v-loading="windowData.loading"
        >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.memorySize')" prop="diskSize" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{scope.row.diskSize | bytesToSize}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{new Date(scope.row.createDate) | formatDatetime}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import VolumeOfferingList from 'src/ecs/volumeOffering/List';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "VolumeOfferingPage",
    mixins: [VolumeOfferingList, WindowBase],
    components: {TableBodyItemState, PageTemplate},
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        isAdmin: false,
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed: {
      selectedList() {
        let self =  this;
        return self.windowData && self.windowData.selectUuidList ;
      },
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >=1;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length === 1;
      }
    },
    created(){
      let self = this;
      self.isAdmin = localStorage.getItem('isAdmin') === 'true' ? true : false;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          return self.queryList();
        })
    },
    methods: {
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
      },
      refresh(){
        this.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            this.queryList();
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
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
            .then(() => {
              this.queryList();
            })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
            .then(() => {
              this.queryList();
            })
        }
      },
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      goToDetail(uuid){
        let self  = this;
        self.$router.push({
          name: 'detailVolumeOffering',
          params: {
            uuid
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
