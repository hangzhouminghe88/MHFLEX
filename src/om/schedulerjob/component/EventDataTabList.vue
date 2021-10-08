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
            @change="handleChangeDate">
          </el-date-picker>
          -
          <el-date-picker
            v-model="end_at"
            type="datetime"
            start-placeholder="开始日期"
            :picker-options="pickerOptions1"
            @change="handleChangeDate">
          </el-date-picker>
        </el-col>
        <el-col :span="10" style="text-align: right">
        </el-col>
      </el-row>
    </div>
    <div class="page-body">
      <el-table
       :data="windowData.eventPageList">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column :label="$t('common.resourceName')" prop="resourceName">
          <template slot-scope="scope">
            {{scope.row.resourceName.replace(/\"/g, '')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.taskType')">
          <template slot-scope="scope">
            {{$t(jobClassShow(param.uuid))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.result')">
          <template slot-scope="scope">
            <span slot="item" style="position: relative; top: 5px; padding-left: 15px;">
            <img v-if="scope.row.labels.isSuccess === 'false'" src="~assets/notification_error.svg" />
            <img v-if="scope.row.labels.isSuccess === 'true'" src="~assets/notification_success.svg" />
          </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.time))}}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.pageCount > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="sizes, prev, pager, next, jumper"
        :total="windowData.pageCount"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import SchedulerJobMethods from 'src/om/schedulerjob/Methods';
  export default {
    name: "EventDataTabList",
    mixins: [MultiSelectList, WindowBase, SchedulerJobMethods],
    props: {
      param: {
        type: Object,
        default: () =>{
          return {}
        }
      }
    },
    data(){
      return {
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
        selectVal: 'apiName',
        searchStr: '',
        auditConditionNameList: [
          {
            name: 'operationLog.api',
            value: 'apiName'
          },
          {
            name: 'operationLog.operator',
            createCondition: this.createConditionForOwner
          }
        ],
        jobClassList: {
          StartVmInstanceJob: 'VMStartScheduler',
          StopVmInstanceJob: 'VMStopScheduler',
          RebootVmInstanceJob: 'VMRebootScheduler',
          CreateVolumeSnapshotJob: 'VolumeSnapshotScheduler',
          CreateVolumeBackupJob: 'VolumeBackupScheduler',
          CreateDatabaseBackupJob: 'DatabaseBackupScheduler',
          CreateVmBackupJob: 'VolumeBackupScheduler'
        }
      }
    },
    created(){
      this.updateWindow({
        auditLimit: 300,
        account: [],
        eventList: [],
        eventPageList: [],
        isPageChange: false,
        selectStatus: 'all',
        selectName: 'operationLog.all',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
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
      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
            self.start_at = self.end_at - 604800000
          })
      },
      queryList: function () {
        this.queryEvent()
      },
      queryEvent: function () {
        if (!this.windowData.isPageChange) {
          this.updateWindow({
            pageCount: _.chunk(this.windowData.eventList, this.windowData.pageSize).length === 0 ? 1 : _.chunk(this.windowData.eventList, this.windowData.pageSize).length
          })
          let condition = this.getAuditCondition()
          rpc.query('zwatch/events', condition)
            .then((resp) => {
              let eventList = _.chunk(resp.events, this.windowData.pageSize)
              this.updateWindow({
                isPageChange: false,
                eventList: resp.events,
                eventPageList: eventList[this.windowData.pageIndex - 1],
                pageCount:  eventList.length
              })
            })
        } else {
          let eventList = _.chunk(this.windowData.eventList, this.windowData.pageSize)
          this.updateWindow({
            isPageChange: false,
            eventPageList: eventList[this.windowData.pageIndex - 1],
            pageCount:  eventList.length
          })
        }
      },
      getAuditCondition () {
        let condition = {
          startTime: this.start_at,
          endTime: this.end_at,
          limit: this.windowData.auditLimit,
          conditions: []
        }
        condition.conditions.push('resourceId=' + this.param.uuid)
        return condition
      },
      handleChangeDate(value){
        let self = this;
        if(Date.parse(self.start_at) > Date.parse(self.end_at)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },
      ...Utils
    }
  }
</script>

<style scoped>

</style>
