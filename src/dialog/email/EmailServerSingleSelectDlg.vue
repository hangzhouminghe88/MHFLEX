<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("loadbalancer.select") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
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
        <el-table
          :data="itemList"
          highlight-current-row
          @row-click="handleSingleSelect">
           <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
           </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name" sortable></el-table-column>
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
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.availableCount"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import EmailList from 'src/om/email/List';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    components: {TableBodyItemState},
    mixins: [MultiSelectList, WindowBase, EmailList],
    name: "EmailServerSingleSelectDlg",
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        templateRadio: '',
        conditionNameList:[
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
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
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param && this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        let self = this;
        self.dialogData.param.select(self.templateRadio)
        self.closeDialog(self.windowId);
      },
      handleSingleSelect(rows){
        let self = this;
        self.templateRadio = rows.uuid;
      },
    }
  }
</script>

<style scoped>

</style>
