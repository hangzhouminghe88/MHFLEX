<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title">{{$t("resourcestack.selectResourceStack")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left">
            <span class="tab-content">
              <span class="tab-pane" :class="{'active': currTab === 'self'}" @click="changeTab('self')">{{$t('common.diy')}}</span>
              <span class="tab-pane" :class="{'active': currTab === 'system'}" @click="changeTab('system')">{{$t('common.system')}}</span>
            </span>
          </div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
            <div class="radio-group" style="text-align: right">
             <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
             </el-input>
            </span>
            </div>
          </div>
        </div>
        <el-table
          highlight-current-row
          @row-click="handleSingleSelect"
          :data="itemList">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.uuid">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name" sortable>
            <template slot-scope="scope">
              <span>{{scope.row.name.replace(/ZStack./ig, '')}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.description')" prop="description" show-overflow-tooltip></el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state :state="String(scope.row.state)"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.availableCount > 0"
          :current-page="windowData.pageIndex"
          :page-size="5"
          :page-sizes="[5, 10]"
          :total="windowData.availableCount"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import ResourceStackTemplateList from 'src/om/resourceTemplate/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash';

  export default {
    name: "ResourceStackTemplateSingleSelect",
    mixins: [MultiSelectList, WindowBase, ResourceStackTemplateList],
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        templateRadio:"",
        currTab: 'self',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      getCondition(){
        let self = this, conditionList = [];
        if(self.currTab === 'self')  conditionList = ['__systemTag__!=systemtemplate'];
        if(self.currTab === 'system')  conditionList = ['__systemTag__=systemtemplate'];
        if(self.dialogData.param.conditions) conditionList = conditionList.concat(self.dialogData.param.conditions);
        if(self.selectVal !== '' && self.searchStr !=='') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList;
      },
      changeTab(tabname){
        let self = this;
        if(_.isEqual(self.currTab, tabname)) return;
        self.currTab = tabname;
        self.queryList();
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        if(!self.templateRadio) return;
        self.dialogData.param.select(self.templateRadio);
        this.cancel();
      }
    }
  }
</script>

<style scoped>
 .tab-content{
   position: relative;
   display: flex;
   border: 1px solid #39f;
   border-radius: 2px;
   cursor: pointer;
 }
  .tab-pane{
    padding: 8px 20px;
    border-radius: 2px;
  }
  .active{
    background: #39f;
    color: #fff;
  }
</style>
