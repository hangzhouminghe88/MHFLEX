<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <el-date-picker
            v-model="start_time"
            type="datetime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions0"
            @change="handleChangeDate">
          </el-date-picker>
          -
          <el-date-picker
            v-model="end_time"
            type="datetime"
            start-placeholder="开始日期"
            :picker-options="pickerOptions1"
            @change="handleChangeDate">
          </el-date-picker>
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
    <el-table
    :data="windowData.currMessageList">
      <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column :label="$t('message.content')">
        <template slot-scope="scope">
          <span>{{scope.row.content}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('zwatchAlarm.messageDate')">
        <template slot-scope="scope">
          {{formatDatetime(new Date(scope.row.time))}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="total > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        :total="total"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"></el-pagination>
    </div>
  </div>
</template>

<script>
  import MessageCenterMethods from 'src/windows/MessageCenter/Methods';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import ZwatchAlarmMethods from '../Methods';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  export default {
    name: "AlarmLogList",
    mixins: [WindowBase, MultiSelectList, ZwatchAlarmMethods, MessageCenterMethods],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name:  'UUID', value: 'uuid'}
        ],
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
        total: 0,
      }
    },
    async created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        messageList: [],
        currMessageList: [],
        histories: [],
        events: [],
        methods: {
          queryList: this.init
        },
        conditions: this.param && this.param.conditions ? this.param.conditions : []
      })
        .then(() => {
          self.getCurrTime()
            .then(() =>{
              self.init();
            });
        })
    },
    computed: {
      start_time: {
        get() {
          let self = this;
          return new Date(self.start_at);
        },
        set(val) {
          let self = this;
          self.start_at = val;
        }
      },
      end_time: {
        get() {
          let self = this;
          return new Date(self.end_at);
        },
        set(val) {
          let self = this;
          self.end_at = val;
        }
      },
    },
    methods: {
      ...Utils,
      queryList(){
        this.init();
      },
      getCurrTime () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
            self.start_at = self.end_at - 259200000
          })
      },
      handleChangeDate(value){
        let self = this;
        if(Date.parse(self.start_time) > Date.parse(self.end_time)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.init();
      },
      init: async function () {
        await this.getAlarmUuidList()
        await this.getAlarmData()
        await this.getEventData()
        this.chunkList()
      },
      chunkList: function (size = this.windowData.pageSize) {
        let allMessageList = this.windowData.histories.concat(this.windowData.events)
        allMessageList.sort((item1, item2) => {
          return item2.time - item1.time
        })
        this.total = allMessageList.length;
        let messageList = _.chunk(allMessageList, size)
        let currMessageList = messageList[this.windowData.pageIndex - 1]
        let count = messageList.length
        if (count === 0) count = 1
        this.updateWindow({
          messageList,
          currMessageList,
          pageCount: count
        })
      },
      getAlarmUuidList: async function () {
        if (this.param.eventNames && this.param.eventNames.length > 0) {
          await this.updateWindow({
            eventNames: this.param.eventNames
          })
          return
        }
        if (this.param.alarmUuidList) {
          await this.updateWindow({
            alarmUuidList: this.param.alarmUuidList
          })
        }
        if (this.param.topicUuid) {
          await this.queryAlarmList([this.param.topicUuid])
        }
        if (this.param.endpointUuid) {
          await this.queryAllTopicAlarmList(this.param.endpointUuid)
        }
      },
      queryAllTopicAlarmList: async function (endpointUuid) {
        let resp = await rpc.query('sns/topics', {
          q: `endpoints.uuid=${endpointUuid}`,
          fields: 'uuid'
        })
        let topicUuidList = resp.inventories.map(item => item.uuid)
        if (topicUuidList.length === 0) return
        await this.queryAlarmList(topicUuidList)
      },
      queryAlarmList: async function (topicUuidList) {
        let paths = ['zwatch/alarms', 'zwatch/events/subscriptions']
        let alarmUuidList = []
        let alarmResp = await rpc.query(paths[0], {
          q: `actions.actionUuid?=${topicUuidList}`,
          fields: 'uuid'
        })
        alarmUuidList = alarmResp.inventories.map(item => item.uuid)

        let eventResp = await rpc.query(paths[1], {
          q: `actions.actionUuid?=${topicUuidList}`,
          fields: 'eventName'
        })
        let eventNames = eventResp.inventories.map(item => item.eventName)
        await this.updateWindow({
          alarmUuidList,
          eventNames
        })
      },
      getAlarmData: async function () {
        if (!this.windowData.alarmUuidList || this.windowData.alarmUuidList.length === 0) return
        let alarmUuidList = this.windowData.alarmUuidList.join('|')
        let resp = await rpc.query('zwatch/alarm-histories', {
          conditions: encodeURI(`alarmUuid=~${alarmUuidList}`),
          startTime: this.start_time.getTime(),
          endTime: this.end_time.getTime(),
          limit: 300
        })
        let histories = resp.histories
        histories.forEach(item => {
          item['content'] = this.getAlarmMessageContent(item)
        })
        this.updateWindow({ histories })
      },
      getAlarmContent: function (item) {
        let type = this.getResourceType(item.namespace)
        let metricName = this.$t(`zwatchAlarm.metricName.${type}.${item.metricName}`, {name: ''})
        let comparisonOperator = this.$t(`zwatchAlarm.${item.comparisonOperator}`)
        return `${metricName}${comparisonOperator}${item.threshold}`
      },
      getEventData: async function () {
        if (!this.windowData.eventNames || this.windowData.eventNames.length === 0) return
        let eventNames = this.windowData.eventNames.join('|')
        let resp = await rpc.query('zwatch/events', {
          conditions: [encodeURI(`name=~${eventNames}`), 'emergencyLevel=Emergent'],
          limit: 300,
          startTime: this.start_time.getTime(),
          endTime: this.end_time.getTime()
        })
        let events = resp.events
        events.forEach(item => {
          item['content'] = this.getEventMessageContent(item)
        })
        this.updateWindow({ events })
      },
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },

      pageCurrentChange(val){
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
      },

      pageSizeChange(val){
        let self = this;
        self.updateWindow({
          pageSize: val,
          pageIndex:1
        })
      },

      goToDetail(item) {
        debugger
        this.$router.push({name: 'detailMessageCenter', params: {uuid}})
      }
    },

    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.chunkList(val)
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal === undefined || val === oldVal) return
        let currMessageList = this.windowData.messageList[val - 1]
        this.updateWindow({ currMessageList })
      }
    }
  }
</script>

<style scoped>

</style>
