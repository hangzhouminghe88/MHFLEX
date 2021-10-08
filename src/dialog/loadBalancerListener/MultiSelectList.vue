<template>
  <dialog-template width="900px">
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
          @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px" type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.protocol')" prop="protocol"></el-table-column>
          <el-table-column :label="$t('loadbalancer.loadBalancerPort')" prop="loadBalancerPort"></el-table-column>
          <el-table-column :label="$t('loadbalancer.instancePort')" prop="instancePort"></el-table-column>
          <el-table-column :label="$t('common.loadbalancer')" prop="loadBalancer"></el-table-column>
          <el-table-column :label="$t('common.owner')" prop="ownerName"></el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{(new Date(scope.row.createDate)) | formatDatetime}}
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
  import TableBodyItemState from "../../component/TableBodyItemState";
  import {mapGetters, mapState} from 'vuex';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  export default {
    name: "MultiSelectList",
    mixins: [WindowBase],
    components: {TableBodyItemState},
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    computed: {
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
      ...mapState({
        loadBalancerListener: state =>  state.loadBalancerListener
      }),
      ...mapGetters({
        getList: 'loadBalancerListener/getList'
      }),
      itemList(){
        let self = this;
        return this.getList(self.windowData.uuidList);
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      pageCurrentChange(val){
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
      },
      confirm(){
        let self = this;
        self.dialogData.param.select(self.selectedList);
        self.closeDialog(self.windowId);
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
      },
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList(){
        let self = this;
        return self.dispatchAction('loadBalancerListener/query',{
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
