<template>
   <page-template>
     <div slot="page-header">
       <el-row :gutter="20">
         <el-col :span="2">
           <span class="page-header-title">{{$t('common.usergroup')}}</span>
         </el-col>
         <el-col :span="2.2">
           <el-tabs v-model="currTab">
             <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : 0})`" name="available"></el-tab-pane>
           </el-tabs>
         </el-col>
         <el-col :span="12">
           <i class="el-icon-warning"></i>
           <span class="user-warning">{{$t('common.noLongerMaintainUser')}}</span>
         </el-col>
       </el-row>
     </div>
     <div slot="page-toolbar" class="page-toolbar-container">
       <el-row  type="flex" justify="space-between">
         <el-row class="page-toolbar-left">
           <span class="btn-success" @click="goToCreatePage();"><i class="el-icon-plus icon"></i>{{$t('usergroup.create')}}</span>
           <drop-down class="dropdown btn-primary more" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
             <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px" @click="isSingleSelected && attachUser()">{{$t('common.addUser')}}</a>
                <a style="margin-bottom:12px" @click="isSelected && pageDelete()" :class="{'disabled-text': !isSelected}" >{{$t('common.destroy')}}</a>
              </div>
            </span>
           </drop-down>
         </el-row>
         <el-row class="page-toolbar-center"></el-row>
         <el-row class="page-toolbar-right">
          <span style="padding: 0 15px;display: inline-block;">
            <help-trigger name="userGroup" :style="{left: '-10px', top: '12px'}"/>
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
           <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
         </el-row>
       </el-row>
     </div>
     <div slot="page-table-content">
       <el-table
         :data="itemList"
         @selection-change="handleSelect"
         @sort-change="handleSort"
        v-loading = "windowData.loading"
         >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
         <el-table-column type="selection"></el-table-column>
         <el-table-column :label="$t('common.name')" sortable>
           <template slot-scope="scope">
             <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
           </template>
         </el-table-column>
         <el-table-column :label="$t('common.account')" prop="accountName"></el-table-column>
         <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
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
  import UserGroupList from  'src/om/userGroup/List';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "UserGroupPage",
    components: {PageTemplate},
    mixins: [UserGroupList, WindowBase],
    data(){
      return {
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
        conditionNameList:[
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length >=1;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length === 1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList;
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList()
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
            self.queryList()
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      handleSort(e) {
        if(!e.prop) return;
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
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailGroupUser', params:{uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
