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
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.vipIp')" prop="vip"></el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.owner')" prop="ownerName"></el-table-column>
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
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import {mapGetters} from 'vuex';
  export default {
    name: "LoadBalancerSingleSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase],
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      })
        .then(() => {
          this.queryList();
        })
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        templateRadio: '',
        conditionNameList:[
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    computed:{
      ...mapGetters({
        getList: 'loadBalancer/getList'
      }),
      itemList(){
        let self = this;
        return this.getList(self.windowData.uuidList);
      }
    },
    methods: {
      getCondition () {
        let conditionList = []
        conditionList.push(`state=Enabled`)
        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      handleSingleSelect(rows){
        let self = this;
        self.templateRadio = rows.uuid;
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      confirm(){
        let self = this;
        if(!self.templateRadio) {
          self.$message('你还没有选择资源，请选择');
          return;
        }
        self.dialogData.param.ok(self.templateRadio);
        self.closeDialog(self.windowId);
      },
      queryList(){
        let self = this;
        return self.dispatchAction('loadBalancer/query',{
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then((resp) => {
          this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            availableCount: resp.total
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
