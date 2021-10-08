<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span class="title">{{$t('common.changeResourceOwner')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div style="padding:30px;">
        <div class="radio-group" style="text-align: right">
       <span style="padding: 0 15px;display: inline-block;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="accountItemList"
          @selection-change="handleSelect"
          @row-click="handSingSelect"
          :highlight-current-row="(dialogData.param.type && dialogData.param.type) === 'radio' ? true : false">
          <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column v-if="dialogData.param.type && dialogData.param.type === 'radio'" width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column v-else type="selection" width="50px"></el-table-column>
          <el-table-column
            :label="$t('common.name')"
            prop="name"></el-table-column>
          <el-table-column
            :label="$t('common.type')"
            prop="type"></el-table-column>
          <el-table-column
            :label="$t('common.vm')"
            prop="url">
            <template slot-scope="scope">
              {{scope.row.vmNum ? scope.row.vmNum: 0}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.volume')">
            <template slot-scope="scope">
              {{scope.row.volumeNum ?scope.row.volumeNum : 0}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.total > 0"
          :current-page="windowData.pageIndex"
          :page-size="5"
          :page-sizes="[5, 10]"
          :total="windowData.total"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DialogTemplate from "../DialogTemplate";
  import WindowBase from 'src/windows/Window';
  import {mapGetters} from 'vuex';
  import Utils from 'src/utils/utils';

  export default {
    name: "AccountListDlg",
    components: {DialogTemplate},
    mixins: [WindowBase],
    computed: {
      ...mapGetters({
        get: 'account/getList'
      }),
      accountItemList(){
        let self = this;
        return self.get(self.windowData.uuidList);
      }
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        selectUuidList: [],
        templateRadio: ''
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList()
      })
    },
    methods: {
      confirm() {
        let self = this;
        if(self.selectUuidList <=0) return;
        if(self.dialogData.param.type && self.dialogData.param.type === 'radio'){
          self.dialogData.param.select(self.templateRadio);
          self.closeDialog(self.windowId);
        }else{
          self.dialogData.param.select(self.selectUuidList);
          self.closeDialog(self.windowId);
        }
      },
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){
       let self = this;
       self.updateWindow({
         pageIndex: 1,
       }).then(() =>{
         self.queryList()
       })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        }).then(() => {
          this.queryList();
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        }).then(() => {
          this.queryList();
        })
      },
      queryList(){
        let self = this;
        self.dispatchAction('account/query',{
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition(),
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        })
          .then((resp) => {
            return this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              total: resp.total
            })
          })
      },
      getCondition() {
        let conditionList = []
        if (this.selectVal !=='' && this.searchStr!=='' ) {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handSingSelect(row){
        let self = this;
        self.selectUuidList = [row.uuid];
        self.templateRadio = row.uuid;
      },
      handleSelect(val){
        let self = this, uuidList = [];
        uuidList = val.map((it) => {
          return it.uuid;
        })
        self.selectUuidList = uuidList;
      }
    }
  }
</script>

<style scoped>

</style>
