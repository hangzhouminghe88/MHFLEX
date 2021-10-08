<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.adldapserver')}}</span>
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
          <span class="btn-success" v-if="!windowData.total" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span>{{$t('adLdapServer.add')}}</span>
          </span>
          <drop-down class="dropdown btn-primary" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span>{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
               <a style="padding-top: 12px;" @click="isSingleSelected && pageTest()" :class="{ 'disabled-text': !isSingleSelected }">{{$t("adLdapServer.test")}}</a>
               <a @click="isSingleSelected && pageSync()" :class="{ 'disabled-text': !isSingleSelected}">{{$t("adLdapServer.sync")}}</a>
               <a @click="isSingleSelected && pageDelete()" :class="{ 'disabled-text': !isSingleSelected }" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
          <help-trigger name="ldapConfig" :style="{left: '270px', top: '10px'}"/>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                 <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                                       :key="index" :value="item.value"></el-option>
               </el-select>
               <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @selection-change="handleSelect"
        @sort-change="handleSort">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('adLdapServer.setting')" prop="setting">
          <template slot-scope="scope">
            {{getAdLdapServer(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('adLdapServer.port')" prop="port">
          <template slot-scope="scope">
            {{getAdLdapServerPort(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('adLdapServer.baseDn')" prop="baseDn">
          <template slot-scope="scope">
            {{scopr.rows.baseOn}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('ldapEntry.ldapUseAsLoginName')" prop="ldapUseAsLoginName">
          <template slot-scope="scope">
            {{getAdLdapServerUseAsLoginName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('adLdapServer.ldapUserDn')" prop="ldapUserDn">
          <template slot-scope="scope">
            {{scope.row.ldapUserDn}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('adLdapServer.ldapCleanBindingFilter')" prop="ldapCleanBindingFilter">
          <template slot-scope="scope">
            {{getAdLdapServerLdapCleanBindingFilter(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination  v-if="windowData.total > 0"
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
  import MultiSelectList from "src/windows/Base/MultiSelectList";
  import PageTemplate from "../../component/PageTemplate";
  import AdLdapServerList from 'src/om/adldapserver/List';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';

  export default {
    name: "AdldapServerPage",
    mixins: [WindowBase, MultiSelectList, AdLdapServerList, PageBase],
    components: {PageTemplate},
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    data() {
      return {
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
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
      ...Utils,
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
        self.$router.push({name: 'createAdldapServer'})
      }
    }
  }
</script>

<style scoped>

</style>
