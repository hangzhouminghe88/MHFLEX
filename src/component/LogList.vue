<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col  :span="14">
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
          <span style="display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 105px">
                   <el-option v-for="(item, index ) in auditConditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div class="page-body">
      <el-table
       :data="windowData.auditPageList" @row-click="goToDetail">
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column :label="$t('operationLog.api')"
          prop="apiName">
          <template slot-scope="scope">
            <span class="link">{{scope.row.apiName}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.duration')">
          <template slot-scope="scope">
            {{durationConvert(scope.row.duration)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.result')" :render-header="handleOperator">
          <template slot-scope="scope">
            <img v-if="isError(scope.row)" src="~assets/notification_error.svg" />
            <img v-if="!isError(scope.row)" src="~assets/notification_success.svg" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.operator')">
          <template slot-scope="scope">
            {{getAccountName(scope.row.operatorAccountUuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.createTime')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.time - scope.row.duration))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.finishTime')">
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
  import _ from 'lodash'

  export default {
    name: "LogList",
    mixins: [WindowBase],
    props: {
      param:{
        type: Object,
        default: {}
      }
    },
    data(){
      return {
        value9: '',
        searchStr: '',
        selectVal: 'apiName',
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
        auditDropdownList: [
          {
            name: 'operationLog.all',
            value: 'all'
          },
          {
            name: 'common.success',
            value: 'success'
          },
          {
            name: 'common.failed',
            value: 'error'
          }
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
      }
    },
    mounted(){
      let self = this;
      self.updateWindow({
        auditLimit: 300,//每页最多显示300条
        pageIndex: 1,
        pageSize: 20,
        pageCount:0,
        selectStatus: 'all',//默认查询全部
        selectName: 'opreationLog.all',//默认选择查询名称
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: self.queryList
        }
      }).then(()=>{
        self.getCurrentTime().then(() => {
          self.queryList();
        })
      })
    },
    methods: {
      ...Utils,
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        if(self.windowData.pageIndex ===1 ) self.queryList();
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val,
          isPageChange: true
        }).then(() => {
          let auditList = _.chunk(this.windowData.auditList, this.windowData.pageSize)
          this.updateWindow({
            auditPageList: auditList[this.windowData.pageIndex - 1],
            pageCount:  this.windowData.auditList.length,
          })
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        }).then(() => {
          let auditList = _.chunk(this.windowData.auditList, this.windowData.pageSize)
          this.updateWindow({
            auditPageList: auditList[this.windowData.pageIndex - 1],
            pageCount:this.windowData.auditList.length,
          })
        })
      },
      getCurrentTime() {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = new Date(resp.currentTime.MillionSeconds)
            self.start_at = new Date(self.end_at - 604800000);
          })
      },
      queryList(){
        let self = this;
        self.queryAudit();
      },
      //获得操作员
      getAccountName: function (uuid) {
        if (this.dbData.account[uuid]) {
          return this.dbData.account[uuid].name
        } else if (this.dbData.iam2virtualid[uuid]) {
          return this.dbData.iam2virtualid[uuid].name
        } else if (this.dbData.accountA[uuid]) {
          return this.dbData.accountA[uuid].name
        } else {
          return false
        }
      },
      //判断任务结果是否成功如果状态是Rollbacked&&response.inventory.reason 或者audit.error表明任务失败
      isError(audit) {
        if (audit.apiName === 'CreateResourceStack') {
          let response = JSON.parse(audit.responseDump)
          if (response.inventory.status === 'Rollbacked' && response.inventory.reason) {
            return true
          }
        }
        if (audit.error) {
          return true
        }
        return false
      },
      //查找审计日志
      queryAudit(){
        let operatorAccountUuidList = []
        if (!this.windowData.isPageChange) {
          this.updateWindow({
            pageCount: _.chunk(this.windowData.auditList, this.windowData.pageSize).length === 0 ? 1 : _.chunk(this.windowData.auditList, this.windowData.pageSize).length
          })
          let condition = this.getAuditCondition()
          rpc.query('zwatch/audits', condition)
            .then((resp) => {
              resp.audits.forEach((item) => {
                item.apiName = this.apiNameHandler(item.apiName)
              })
              let auditList = _.chunk(resp.audits, this.windowData.pageSize)
              this.updateWindow({
                isPageChange: false,
                auditList: resp.audits,
                auditPageList: auditList[this.windowData.pageIndex - 1],
                pageCount: resp.audits.length,
              }).then(() => {
                let operatorAccountUuidList = []
                if (this.windowData.auditPageList instanceof Array) {
                  this.windowData.auditPageList.map(item => {
                    operatorAccountUuidList.push(item.operatorAccountUuid)
                  })
                }
                operatorAccountUuidList = _.uniq(operatorAccountUuidList)
                if (operatorAccountUuidList.length > 0) {
                  rpc.query('accounts', {q: `uuid?=${operatorAccountUuidList}`}).then(resp => {
                    let currAccountUuidList = []
                    let account = resp.inventories
                    currAccountUuidList = account.map(item => item.uuid)
                    // account.map(item => currAccountUuidList.push(item.uuid))
                    let diffUuidList = _.difference(operatorAccountUuidList, currAccountUuidList)
                    diffUuidList.forEach(uuid => {
                      this.deleteDbRow({
                        tableName: 'account',
                        id: uuid
                      })
                    })
                    this.updateDbTable({
                      tableName: 'account',
                      list: account
                    }).then(() => this.$nextTick(this.$forceUpdate))
                  })
                  rpc.query('iam2/virtual-ids', {q: `uuid?=${operatorAccountUuidList}`}).then(resp => {
                    let currAccountUuidList = []
                    let iam2virtualid = resp.inventories
                    currAccountUuidList = iam2virtualid.map(item => item.uuid)
                    // iam2virtualid.map(item => currAccountUuidList.push(item.uuid))
                    let diffUuidList = _.difference(operatorAccountUuidList, currAccountUuidList)
                    diffUuidList.forEach(uuid => {
                      this.deleteDbRow({
                        tableName: 'iam2virtualid',
                        id: uuid
                      })
                    })
                    this.updateDbTable({
                      tableName: 'iam2virtualid',
                      list: iam2virtualid
                    }).then(() => this.$nextTick(this.$forceUpdate))
                  })
                  rpc.query('iam2/projects', {q: `linkedAccountUuid?=${operatorAccountUuidList}`}).then(resp => {
                    let currAccountUuidList = []
                    let iam2project = resp.inventories
                    if (iam2project.length > 0) {
                      iam2project.forEach((item) => {
                        item.uuid = item.linkedAccountUuid
                        currAccountUuidList.push(item.linkedAccountUuid)
                      })
                    }
                    let diffUuidList = _.difference(operatorAccountUuidList, currAccountUuidList)
                    diffUuidList.forEach(uuid => {
                      this.deleteDbRow({
                        tableName: 'accountA',
                        id: uuid
                      })
                    })
                    this.updateDbTable({
                      tableName: 'accountA',
                      list: iam2project
                    }).then(() => this.$nextTick(this.$forceUpdate))
                  })
                }
              })
            })
        } else {
          let auditList = _.chunk(this.windowData.auditList, this.windowData.pageSize)
          this.updateWindow({
            isPageChange: false,
            auditPageList: auditList[this.windowData.pageIndex - 1],
            pageCount: this.windowData.auditList.length,
          }).then(() => {
            if (this.windowData.auditPageList instanceof Array) {
              this.windowData.auditPageList.map(item => {
                operatorAccountUuidList.push(item.operatorAccountUuid)
              })
            }
            operatorAccountUuidList = _.uniq(operatorAccountUuidList)
            if (operatorAccountUuidList.length > 0) {
              rpc.query('accounts', {q: `uuid?=${operatorAccountUuidList}`}).then(resp => {
                let currAccountUuidList = []
                let account = resp.inventories
                account.map(item => currAccountUuidList.push(item.uuid))
                let diffUuidList = _.difference(operatorAccountUuidList, currAccountUuidList)
                diffUuidList.forEach(uuid => {
                  this.deleteDbRow({
                    tableName: 'account',
                    id: uuid
                  })
                })
                this.updateDbTable({
                  tableName: 'account',
                  list: account
                }).then(() => this.$nextTick(this.$forceUpdate))
              })
              rpc.query('iam2/virtual-ids', {q: `uuid?=${operatorAccountUuidList}`}).then(resp => {
                let currAccountUuidList = []
                let iam2virtualid = resp.inventories
                iam2virtualid.map(item => currAccountUuidList.push(item.uuid))
                let diffUuidList = _.difference(operatorAccountUuidList, currAccountUuidList)
                diffUuidList.forEach(uuid => {
                  this.deleteDbRow({
                    tableName: 'iam2virtualid',
                    id: uuid
                  })
                })
                this.updateDbTable({
                  tableName: 'iam2virtualid',
                  list: iam2virtualid
                }).then(() => this.$nextTick(this.$forceUpdate))
              })
              rpc.query('iam2/projects', {q: `linkedAccountUuid?=${operatorAccountUuidList}`}).then(resp => {
                let currAccountUuidList = []
                let iam2project = resp.inventories
                if (iam2project.length > 0) {
                  iam2project.forEach((item) => {
                    item.uuid = item.linkedAccountUuid
                    currAccountUuidList.push(item.uuid)
                  })
                }
                let diffUuidList = _.difference(operatorAccountUuidList, currAccountUuidList)
                diffUuidList.forEach(uuid => {
                  this.deleteDbRow({
                    tableName: 'accountA',
                    id: uuid
                  })
                })
                this.updateDbTable({
                  tableName: 'accountA',
                  list: iam2project
                }).then(() => this.$nextTick(this.$forceUpdate))
              })
            }
          })
        }
      },
      apiNameHandler: function (apiName) {
        return apiName.slice(apiName.indexOf('API') + 3, -3)
      },
      //审计日志查询条件
      getAuditCondition() {
        let condition = {
          startTime: Date.parse(this.start_at),
          endTime: Date.parse(this.end_at),
          limit: this.windowData.auditLimit,
          conditions: []
        }
        if (this.windowData.selectStatus !== 'all') {
          if (this.windowData.selectStatus === 'success') {
            condition.conditions.push('error=')
          }
          if (this.windowData.selectStatus === 'error') {
            condition.conditions.push('error=~.+')
          }
        }
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          if (this.windowData.searchConditionList[0] !== 'operatorAccountUuid~=%25%25') {
            condition.conditions.push(this.auditConditionHandler(this.windowData.searchConditionList[0]))
          } else {
            condition.conditions.push('operatorAccountUuid=')
          }
        }
        if (this.selectVal !== '' && this.searchStr !== '') {
          condition.conditions.push(`${this.selectVal}=~${encodeURIComponent(this.searchStr)}`)
        }
        condition.conditions.push('resourceUuid=' + this.param.uuid)
        return condition
      },
      auditConditionHandler: function (condition) {
        let value = condition.substr(0, condition.indexOf('~')) + '=~' + condition.substring((condition.indexOf('%25') + 3))
        value = value.slice(0, -3)
        return value
      },
      handleOperator(h, { column, $index }){
        let self = this;
        return h("div",{
          style: 'margin-left: -15px;height:33px;line-height: 33px;'
        }, [
          h("el-dropdown",{
            on: {
              'command': self.handleOperatorChange
            }
          },[
             h("span",[
               [self.$t('operationLog.result')],
                h('i', {
                  staticClass: 'el-icon-caret-bottom'
                })
               ],
             ),
            h("el-dropdown-menu",{
              attrs: {
                trigger: "click",
                placement:'bottom',
                slot:"dropdown"
              },
            },[
              h("el-dropdown-item",{
                attrs: {
                  "command": 'all',
                },
              },[self.$t('operationLog.all')]),
              h("el-dropdown-item",{
                attrs: {
                  "command": 'success',
                },
              },[self.$t('common.success')]),
              h("el-dropdown-item",{
                attrs: {
                  "command": 'error'
                },
              },[self.$t('common.failed')])
            ])
          ])
        ])
      },
      //切换下拉列表的回调
      handleOperatorChange(name){
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          selectStatus: name,
          pageCount: 0,
        }).then(()=>{
          self.queryList();
        })
      },
      //设置时间
      durationConvert(ms) {
        if (ms < 60000) {
          let s = (ms / 1000).toFixed(2)
          if (s === '0.00') s = 0.01
          return s + this.$t('common.secondShort')
        } else {
          let s = Math.round(ms / 1000)
          let time = this.secToTime(s)
          let str = ''
          if (time.hour > 0) {
            str += time.hour + this.$t('common.hourShort')
          }
          if (time.min > 0) {
            str += time.min + this.$t('common.minuteShort')
          }
          if (time.sec > 0) {
            str += time.sec + this.$t('common.secondShort')
          }
          return str
        }
      },
      //处理时间选择框
      handleChangeDate(value){
        let self = this;
        if(Date.parse(self.start_at) > Date.parse(self.end_at)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },
      //回到审计日志详情
      goToDetail(row){
        let self = this;
        window.localStorage.setItem('operationItem', JSON.stringify(row));
        self.$router.push({name: 'detailOperationLog', params: {uuid: row.resourceUuid, currTab: 'audit'}})
      }
    },
    watch: {

    }
  }
</script>

<style scoped>

</style>
