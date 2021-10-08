<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.accesskey')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : '0'})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="button primary" :class="{ 'disabled': windowData.total === 2 }" v-if="!dbData.common.isPlatformAdmin && !dbData.common.isAdmin && windowData.total === 2" @click="generateAccessKey()">
            <i class="el-icon-plus icon"></i>
            <span>{{$t('accesskey.create')}}</span>
          </span>
          <span class="btn-success" v-else @click="generateAccessKey();">
            <i class="el-icon-plus icon"></i>
            <span>{{$t('accesskey.create')}}</span>
           </span>
          <span class="btn-primary" :class="{'disabled': inStates('Enabled')}" @click="!inStates('Enabled') && pageEnable('Enabled')">
            <i class="el-icon-caret-right icon"></i>
            <span>{{$t('common.enable')}}</span>
           </span>
          <span class="btn-primary" :class="{'disabled': inStates('Disabled')}" @click="!inStates('Disabled') && pageEnable('Disabled')">
            <i class="el-icon-remove-outline icon"></i>
            <span>{{$t('common.disable')}}</span>
           </span>
          <span class="btn-primary"  :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
            <i class="el-icon-remove-outline icon"></i>
            <span>{{$t('common.destroy')}}</span>
           </span>
         </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
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
        @selection-change="handleSelect"
        v-loading="windowData.loading"
        >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="'Access Key ID'" prop="AccessKeyID"></el-table-column>
        <el-table-column :label="'Access Key Secret'" prop="AccessKeySecret">
          <template slot-scope="scope">
            <table-body-item-list style="display: inline-flex;width: 80%" :content="scope.row.AccessKeySecret" v-show="scope.row.isShow" :copy="'true'"/>
            <span class="eye" :class="{'eye-overview': !scope.row.isShow, 'eye-overview-hidden': scope.row.isShow}" @click="scope.row.isShow = !scope.row.isShow"></span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="accountName" sortable></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
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
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import AccessKeyList from 'src/om/accessKey/List';
  import WindowBase from 'src/windows/Window';
  import PageTemplate from "../../component/PageTemplate";
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils';
  import TableBodyItemList from "../../component/TableBodyItemList";

  export default {
    name: "AccessKeyPage",
    components: {TableBodyItemList, TableBodyItemState, PageTemplate},
    mixins: [WindowBase, AccessKeyList, MultiSelectList],
    data() {
      return {
        itemList: [],
        selectVal: 'AccessKeyID',
        searchStr: '',
        currTab: 'available',
        conditionNameList: [
          {
            name: 'accessKey.accessKeyID',
            value: 'AccessKeyID'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        isShow: false
      }
    },
    created() {
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
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      handleSelect(rows){
        let self = this,uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      }
    }
  }
</script>

<style scoped>
  .eye-overview{
    background-image: url('~assets/eye.gif');
  }
  .eye{
    display: inline-block;
    width: 42px;
    height: 23px;
    background-size: 45px;
    vertical-align: middle;
  }
  .eye-overview-hidden{
    background-image: url('~assets/eye-overview-hidden.gif');
  }
</style>
