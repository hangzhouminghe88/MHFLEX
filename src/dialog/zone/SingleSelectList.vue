<template>
  <dialog-template>
    <span slot="title" class="modal-plain-header">
      <span class="text">{{$t('common.selectZone')}}</span>
      <div class="el-icon-close modal-close" style="float: right;" @click="close()"></div>
    </span>
    <div slot="body" class="dialog-body-container">
      <div style="padding: 30px;">
        <div class="dialog-toolbar" style="text-align: center;">
          <span class="search-content">
           <span style="padding: 0 15px;display: inline-block;position: relative;right: -150px;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          </span>
        </div>
        <el-table
          :data="itemList"
          highlight-current-row
          @row-click="handleSingleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px;">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.uuid">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.availableCount > 0"
          :page-sizes="[5, 10]"
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
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import ZoneList from 'src/om/zone/List';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils';
  export default {
    name: "SingleSelectList",
    components: {TableBodyItemState},
    mixins: [WindowBase, MultiSelectList, ZoneList],
    data() {
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        templateRadio: '',
        itemList: [],
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
      ...Utils,
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      getCondition(){
        let self = this, conditionList = [];
        if(self.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if(self.selectVal !== '' && self.searchStr !== ''){
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList;
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      confirm(){
        let self = this;
        if(!self.templateRadio) return;
        self.dialogData.param.select(self.templateRadio);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
