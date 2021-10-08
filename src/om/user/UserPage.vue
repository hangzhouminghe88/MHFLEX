<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="20">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.user')}}</span>
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
          <span class="btn-success" @click="goToCreatePage();"><i class="el-icon-plus icon"></i>{{$t('user.create')}}</span>
          <drop-down class="dropdown btn-primary more" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px" @click="isSingleSelected && canChangePassword(selectedList[0]) && pageModifyPsw()" :class="{'disabled-text':!(isSingleSelected && canChangePassword(selectedList[0]))}">{{$t('common.updateInfopassword')}}</a>
                <a style="margin-bottom:12px" @click="pageDelete()">{{$t('common.destroyed')}}</a>
              </div>
            </span>
          </drop-down>
        </el-row>
        <el-row class="page-toolbar-center"></el-row>
        <el-row class="page-toolbar-right">
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
        </el-row>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
      :data="itemList"
      v-loading="windowData.loading"
      @sort-change="handleSort"
      @selection-change="handleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.account')" prop="name" sortable></el-table-column>
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
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
    import PageTemplate from "../../component/PageTemplate";
    import WindowBase from 'src/windows/Window';
    import PageBase from 'src/windows/PageBase';
    import UserList from 'src/om/user/List';
    export default {
      name: "UserPage",
      components: {PageTemplate},
      mixins: [UserList, WindowBase, PageBase, MultiSelectList],
      data(){
        return{
          currTab: 'available',
          searchStr: '',
          selectVal: 'name',
          conditionNameList: [
            {name: 'common.name', value: 'name'},
            {name: 'common.uuid', value: 'uuid'}
          ],
          itemList: [],
          showModifyPswDlg: false,
          modifyPswMessage: {}
        }
      },
      computed: {
      },
      created(){
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          loading: false,
          selectedUuidList: [],
          methods: {
            queryList: self.queryList
          }
        })
          .then(() => {
            return self.queryList();
          })
      },
      methods: {
        goToDetail(uuid){
          let self = this;
          self.$router.push({name: 'detailUser', params: {uuid}})
        }
      }
    }
</script>

<style scoped>
.user-warning{
  color: #5e6978;
}
</style>
