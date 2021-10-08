<template>
    <el-dialog :visible.async="visiabled" @close="close">
      <div slot="title">{{$t('primaryStorage.selectCephPool')}}</div>
      <div style="padding:30px;overflow-y: hidden;">
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
          highlight-current-row
        :data="itemCephList"
        @row-click="handleSingleSelect">
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column
          :label="$t('primaryStorage.aliasName')"
          prop="aliasName"></el-table-column>
          <el-table-column
          :label="$t('common.poolName')"
          prop="poolName"></el-table-column>
          <el-table-column
          :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
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
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
      </div>
    </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils'
  import _ from 'lodash';
  export default {
    name: "CephPoolSingleDlg",
    mixins: [WindowBase],
    props: {
      message: {
        type: Object,
        default: {}
      },
      model: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      itemCephList(){
        if(!_.isArray(this.windowData.uuidList)) return;
        this.windowData.uuidList = this.windowData.uuidList.filter((uuid) => this.dbData.pool[uuid]);
        return this.windowData.uuidList.map((uuid) =>{
          return this.dbData.pool[uuid];
        })
      }
    },
    data(){
      return{
        visiabled: false,
        selectVal: '',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'poolName'},
          {name: 'UUID', value: 'uuid'}
        ],
        templateRadio: ''
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    methods: {
      ...Utils,
      confirmDlg(){
        let self = this;
        if(!self.templateRadio) {
          self.$message('请选择ceph');
          return;
        }
        self.$emit('close',{uuid: self.templateRadio, type: self.message.type});
      },
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
      },
      getCondition: function () {
        let conditionList = []
        conditionList = conditionList.concat(this.message.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        let resp = await rpc.query('primary-storage/ceph/pools', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'pool',
          list: resp.inventories
        })
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      pageCurrentChange(val){
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val){
        this.updateWindow({
          pageSize:val
        })
      },
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
