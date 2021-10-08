<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.instanceoffering')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs :active-name="activeName">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : 0})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" style="flex-flow: nowrap">
        <div style="flex-shrink: 0;">
          <span class="btn-success" @click="$router.push({name: 'createInstanceOffering'})">
            <i class="el-icon-plus icon"></i>
           {{$t('common.createInstanceOffering')}}
          </span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || inStates('Enabled')}" @click="isSelected && !inStates('Enabled') && pageStart()">
            <i class="el-icon-caret-right icon"></i>
            {{$t('common.enable')}}
          </span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || inStates('Disabled')}" @click="isSelected && !inStates('Disabled') && pageStop()">
            <i class="el-icon-remove-outline icon"></i>
            {{$t('common.disable')}}
          </span>
          <drop-down class="btn-primary more dropdown" :class="{'disabled': !isSelected}" :enabled="isSelected">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top:12px;" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasNotSharedAll() && pageShareInstanceOfferingToAll()" :class="{'disabled-text': !(isSelected && hasNotSharedAll())}">{{$t("common.shareToAll")}}</a>
                <a  v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && haSharedAll() && pageRecallInstanceOfferingFromAll()" :class="{'disabled-text': !(isSelected && haSharedAll())}">{{$t("common.recallFromAll")}}</a>
                <a style="padding-bottom: 12px;" @click="pageDelete()">{{$t('common.destroy')}}</a>
              </div>
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
        v-loading="windowData.loading"
       @selection-change="handSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="CPU" prop="cpuNum" show-tooltip-when-overflow></el-table-column>
        <el-table-column :label="$t('common.memorySize')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{scope.row.memorySize | bytesToSize}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('instanceOffering.allocatorStrategy')" show-tooltip-when-overflow>
           <template slot-scope="scope">
             <span v-if="!(scope.row.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy')" v-text="$t(`instanceOffering.${scope.row.allocatorStrategy}`)" />
             <span v-if="scope.row.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy'"  v-text="$t(`instanceOffering.${scope.row.allocatorStrategy}`) + ':' + scope.row.maxInstancePerHost " />
           </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" show-tooltip-when-overflow>
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
  import InstanceOfferList from 'src/ecs/intanceOffing/List';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "InstanceOfferingPage",
    mixins: [WindowBase, InstanceOfferList, PageBase],
    components: {TableBodyItemState, PageTemplate},
    data() {
      return {
        activeName: "available",
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >=1;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        loading: false,
        selectUuidList:[],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
          })
      },
      refresh(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
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
      handSelect(rows) {
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      hasNotSharedAll(){
        let self = this;
        let list = self.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      getNotSharedToAllList(){
        let self = this, list = [];
        if(!self.selectedList) return;
        self.selectedList.forEach((uuid) => {
          if(!this.dbData.instanceOffering[uuid].toPublic){
            list.push(uuid);
          }
        })
        return list;
      },
      haSharedAll(){
        let self = this;
        let list = self.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      getSharedToAllList(){
        let self = this, list = [];
        self.selectedList.forEach((uuid) => {
          if(this.dbData.instanceOffering[uuid].toPublic){
            list.push(uuid);
          }
        })
        return list;
      },
      pageShareInstanceOfferingToAll () {
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              // this.shareInstanceOfferingToAll(uuidList)
              this.dispatchActionWithEvent('instanceOffering/shareToPublic', uuidList)
            }
          })
        }
      },
      pageRecallInstanceOfferingFromAll () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning: 'account.recall',
            ok: () => {
              // this.shareInstanceOfferingToAll(uuidList)
              this.dispatchActionWithEvent('instanceOffering/revokeSharing', uuidList)
            }
          })
        }
      },
      //跳转到计算规格详情
      goToDetail(uuid){
        let self = this;
        self.$router.push({
          name: 'detailInstanceOffering',
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
