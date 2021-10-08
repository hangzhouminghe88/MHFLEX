<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">
           {{$t('common.emailserversetting')}}
          </span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab" :active-name="currTab" @tab-click="handleTabChange">
            <el-tab-pane  v-if="dbData.common.isAdmin" :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0' })`" name="available"></el-tab-pane>
            <el-tab-pane  v-if="!dbData.common.isAdmin" :label="`${$t('common.mine')}(${windowData.mineCount ? windowData.mineCount : '0' })`" name="mine"></el-tab-pane>
            <el-tab-pane  v-if="!dbData.common.isAdmin" :label="`${$t('common.share')}(${windowData.shareCount ? windowData.shareCount : '0' })`" name="share"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="">{{$t('monitoralarm.addMedia')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': inStates('Enabled')}" @click="!inStates('Enabled') && pageEnable('Enabled', queryList)">
            <i class="el-icon-caret-right icon"></i>
            <span>{{$t('common.enable')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': inStates('Disabled')}" @click="!inStates('Disabled')&& pageEnable('Disabled', queryList)">
            <i class="el-icon-remove-outline icon"></i>
            <span>{{$t('common.disable')}}</span>
          </span>
          <drop-down  class="dropdown btn-primary more"
                      :enabled="isSelected"
                      :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top: 12px;" v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin" @click="isSelected && hasNotSharedToAll() && pageShareToAll('share',queryList)" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}">{{$t("common.shareToAll")}}</a>
                <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin" @click="isSelected && hasSharedToAll() && pageShareToAll('recall', queryList)" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
                <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin" @click="pageChangeResourceOwner(queryList)">{{$t("common.changeResourceOwner")}}</a>
                <a v-permission="'SNS.VALIDATE_EMAIL_PLATFORM'" @click=" isSelected && pageValidate()" :class="{'disabled-text': !isSelected}">{{ $t("common.validate") }}</a>
                <a v-permission="'SNS.DELETE_PLATFORM'" @click=" isSelected && pageDelete(queryList)" :class="{'disabled-text': !isSelected}" style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
           <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
              <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="(item, index ) in conditionNameList"
                  :label="$t(`${item.name}`)"
                  :key="index"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
            </el-input>
          </span>
          <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @sort-change="handleSort"
        @selection-change="handleSelect"
        v-loading="windowData.loading"
        >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('monitoralarm.smtpPort')" prop="smtpPort"></el-table-column>
        <el-table-column :label="$t('monitoralarm.smtpServer')" prop="smtpServer"></el-table-column>
        <el-table-column :label="$t('monitoralarm.userName')" prop="username"></el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable>
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
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
  </page-template>
</template>

<script>
  import EmailServerSettingList from 'src/om/email/List';
  import PageTemplate from "../../component/PageTemplate";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  export default {
    name: "EmailServerSettingPage",
    mixins: [WindowBase, EmailServerSettingList, MultiSelectList],
    components: {TableBodyItemState, PageTemplate},
    data(){
      let self = this;
      return {
        isAdmin: false,
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          { name: "common.name", value: "name" },
          { name: "common.uuid", value: "uuid" }
        ],
        itemList: []
      }
    },
    created(){
     let self = this;
     self.isAdmin = self.dbData.common.isAdmin;
     self.isAdmin === true ? self.currTab = 'available' : self.currTab = 'mine';
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
      handleTabChange(e){
        this.queryList();
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map(row => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createEmailServerSetting'})
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailEmailServerSetting', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
