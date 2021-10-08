<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <el-date-picker
            v-model="start_at"
            type="datetime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions0"
            @change="handleChangeDate"/>
          -
          <el-date-picker
            v-model="end_at"
            type="datetime"
            start-placeholder="开始日期"
            :picker-options="pickerOptions1"
            @change="handleChangeDate"/>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-table
      :data="itemList"
      @sort-change="handleSort">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column :label="$t('common.actions')" prop="activityAction" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row)">{{scope.row.activityAction}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actionStatus')" prop="status" sortable>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.finishTime')" prop="endDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.endDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
          :page-sizes="[10, 20, 50, 100]"
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
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import {mapGetters, mapState} from 'vuex';
  import TableBodyItemState from "../../../component/TableBodyItemState";
  export default {
    name: "AutoScalingRecordTabList",
    components: {TableBodyItemState},
    mixins: [WindowBase],
    props: {
      param:{
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        searchStr:'',
        selectVal: 'name',
        end_at: '',
        start_at: '',
        date: new Date(),
        pickerOptions0: {
          disabledDate: (time) => {

          }
        },
        pickerOptions1: {
          disabledDate: (time) => {
            let self = this;
            return time.getTime() < self.start_at;
          }
        },
        timeSearchConditionList: [],
      }
    },
    computed:{
      ...mapState({
        autoScalingGroupActivity: state => state.autoScalingGroupActivity
      }),
      ...mapGetters({
        getList: 'autoScalingGroupActivity/getList'
      }),
      itemList () {
        let self = this;
        return self.getList(self.windowData.uuidList)
      }
    },
    created(){
      let dataUuid = this.param.uuid
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        dataUuid: dataUuid,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.getCurrTime().then(() => {
          this.queryList()
        })
      })
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=${this.searchStr}`)
        }
        if (this.timeSearchConditionList && this.timeSearchConditionList.length > 0) {
          conditionList = conditionList.concat(this.timeSearchConditionList)
        }
        return conditionList
      },
      queryList () {
        return this.dispatchAction('autoScalingGroupActivity/batchQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
          .then(resp => {
            this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
              availableCount: resp.total
            })
          })
      },
      getCurrTime () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
            self.start_at = self.end_at - 604800000
            self.timeSearchConditionList = [];
            self.timeSearchConditionList.push(encodeURIComponent(`createDate>=${self.formatDatetime(new Date(self.start_at))}`))
            self.timeSearchConditionList.push(encodeURIComponent(`createDate<=${self.formatDatetime(new Date(self.end_at))}`))
          })
      },
      handleChangeDate(value){
        let self = this;
        if(Date.parse(self.start_at) > Date.parse(self.end_at)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.timeSearchConditionList = [];
        self.timeSearchConditionList.push(encodeURIComponent(`createDate>=${self.formatDatetime(new Date(self.start_at))}`))
        self.timeSearchConditionList.push(encodeURIComponent(`createDate<=${self.formatDatetime(new Date(self.end_at))}`))
        self.queryList();
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
            self.queryList()
          })
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      //回到详情页
      goToDetail(item) {
        let self = this;
        self.param.goToAutoScalingRecordDetail({
          item: item,
          uuid: item.uuid,
          autoScalingGroupUuid: this.windowData.dataUuid
        })
      }
    },
    watch: {
      'windowData.pageIndex': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal) {
          self.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal) {
          self.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
