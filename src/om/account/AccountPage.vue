<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.account')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.total ? windowData.total:'0'})`"
              name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between" style="flex-wrap: nowrap;">
        <div style="flex-shrink: 0;">
          <span class="btn-success" @click="createAccount()"><i class="el-icon-plus icon"></i> {{ $t("account.create")}} </span>
          <drop-down class="dropdown more btn-primary" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t("common.moreActions")}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px;" @click="isSingleSelected && openModifyDlg(selectedList[0])" :class="{'disabled-text': !isSingleSelected}">{{$t('common.updateInfopassword')}}</a>
                <a @click="isSingleSelected && pageCreateLdapBinding()" :class="{'disabled-text': !isSingleSelected || !dbData.common.isAdmin }">{{$t('common.attachLDAP')}}</a>
                <a @click="canDetachLdap() && pageDeleteLdapBinding(selectedList[0])" :class="{'disabled-text': !canDetachLdap()}">{{$t('common.attachLDAP')}}</a>
                <a style="margin-bottom: 12px" @click="!isAdmin() && pageDelete()" :class="{'disabled-text': isAdmin()}">{{$t('common.destroyed')}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div style="flex-shrink: 1;flex-grow: 1;"></div>
        <div style="text-align: right;flex-shrink: 0;">
            <span style="padding: 0 15px;display: inline-block;">
              <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                 <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                      :key="index" :value="item.value">
                   </el-option>
                 </el-select>
                <span slot="append"><i class="el-icon-search icon"></i></span>
              </el-input>
            </span>
          <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
      <modify-password-dlg :model="showModifyPswDlg" v-if="showModifyPswDlg" :message="modifyPswMessage" @close="closeModifyPswDlg"/>
    </div>
    <div slot="page-table-content">
      <el-table
      :data="itemList"
      @selection-change="handleSelection"
      v-loading = "windowData.loading"
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
        <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
        <el-table-column :label="$t('common.vm')" prop="vmNum"></el-table-column>
        <el-table-column :label="$t('common.volume')" prop="volumeNum"></el-table-column>
        <el-table-column :label="'AD/LDAP'" >
          <template slot-scope="scope">
            {{scope.row.attachedLdap ? $t('ldapEntry.attachedLdap') : $t('ldapEntry.notAttachedLdap')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" porp="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
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
    <div slot="page-footer">
      <create-ldap-binding v-if="showCreateLdap" @close="showCreateLdap = false;"/>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import AccountList from 'src/om/account/List';
  import PageBase from 'src/windows/PageBase';
  import ModifyPasswordDlg from "../../dialog/ModifyPasswordDlg";
  import CreateLdapBinding from "./component/CreateLdapBinding";

  export default {
    name: "AccountPage",
    mixins: [AccountList, PageBase],
    components: {CreateLdapBinding, ModifyPasswordDlg, PageTemplate},
    data() {
      return {
        currTab: 'available',
        accountUuidList: [],
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        showModifyPswDlg: false,
        modifyPswMessage: {},
        showCreateLdap: false,
        itemList: []
      }
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData.selectedUuidList && self.windowData.selectedUuidList.length > 0;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData.selectedUuidList && self.windowData.selectedUuidList.length ===1 ;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList && self.windowData.selectedUuidList ;
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
        .then(()=>{
          self.queryList();
        })
    },
    methods: {
      getData(){
          let self = this;
          return self.get(self.windowData.uuidList);
      },
      getCondition: function () {
        let conditionList = []
        if (this.accountUuidList.length > 0) {
          conditionList.push(`uuid!?=${this.accountUuidList}`)
        }
        if (window.localStorage.getItem('isPlatformAdmin')) conditionList.push('name!=admin')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      isAdmin() {
        if (this.windowData.uuidList === undefined) return false
        let isAdmin = false
        this.windowData.selectedUuidList.forEach((uuid) => {
          if (this.dbData.account[uuid].type === 'SystemAdmin') isAdmin = true
        })
        return isAdmin
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
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
          })
      },
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
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
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailAccount', params: {uuid}})
      }
    }
  }
</script>

<style scoped lang="less">
  .dropdown-row {
    display: flex;
    border-bottom: 1px solid #ccc;
    width: 320px;

  .title {
    flex: 1 1 14%;
    font-size: 12px;
    text-align: left;
    line-height: 2.5;
  }

  .right {
    flex: 1 1 43%;
    text-align: left;
    width: 100%;
    padding-left: 30px;
    display: inline-block;
    position: relative;
    top: 0px;
  }

  .left {
    flex: 1 1 43%;
    text-align: left;
  }
  }
</style>
