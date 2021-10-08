<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">定时任务:
            <help-trigger name="scheduler" :style="{ position: 'absolute', top: 0, right: '2px' }"/>
          </span>
          <drop-down class="detail-dropdown" v-if="param.resourceType === 'trigger'">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
               <a v-permission="'SCHEDULER.CREATE_SCHEDULER_JOB'"
                  style="padding-top: 12px;"
                  @click="!timerDoneCtlTabAction(param.resourceUuid) && !isSelected && createScheduler(param)"
                  :class="{ 'disabled-text': timerDoneCtlTabAction(param.resourceUuid) || isSelected }">{{ $t("common.create") }}</a>
               <a v-permission="'SCHEDULER.CHANGE_SCHEDULER_STATE'"
                  @click="!timerDoneCtlTabAction(param.resourceUuid) && isSelected && inStates('Disabled') && enabled()"
                  :class="{ 'disabled-text': timerDoneCtlTabAction(param.resourceUuid) || !(isSelected && inStates('Disabled'))}">{{ $t("common.enable") }}</a>
               <a v-permission="'SCHEDULER.CHANGE_SCHEDULER_STATE'"
                  @click="!timerDoneCtlTabAction(param.resourceUuid) && isSelected && inStates('Enabled') && disableSechduler()"
                  :class="{ 'disabled-text': timerDoneCtlTabAction(param.resourceUuid) || !(isSelected && inStates('Enabled'))}">{{ $t("common.disable") }}</a>
               <a v-permission="'SCHEDULER.ADD_SCHEDULER_JOB_2_SCHEDULER_TRIGGER'"
                  @click="isSingleSelected && pageAttach()">{{ $t("common.attach") }}</a>
               <a v-permission="'SCHEDULER.REMOVE_SCHEDULER_JOB_FROM_SCHEDULER_TRIGGER'"
                  :class="{'disabled-text': !isSelected}"
                  @click="isSelected && pageDetach()">{{ $t("common.detach") }}</a>
               <a v-permission="'SCHEDULER.DELETE_SCHEDULER_JOB'" style="padding-bottom: 12px;"
                  @click="isSelected && deleteSechduler()" :class="{ 'disabled-text': !isSelected}">{{ $t("common.destroy") }}</a>
              </div>
            </span>
          </drop-down>
          <drop-down class="detail-dropdown" v-else>
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
               <a v-permission="'SCHEDULER.CREATE_SCHEDULER_JOB'" style="padding-top: 12px;"
                  @click="!isSelected && createScheduler()" :class="{ 'disabled-text': isSelected}">{{ $t("common.create") }}</a>
               <a v-permission="'SCHEDULER.CHANGE_SCHEDULER_STATE'"
                  @click="isSelected  && !inStates('Enabled') && enabled()"
                  :class="{ 'disabled-text': !(isSelected && inStates('Disabled'))}">{{ $t("common.enable") }}</a>
               <a v-permission="'SCHEDULER.CHANGE_SCHEDULER_STATE'"
                  @click="isSelected && !inStates('Disabled') && disableSechduler() "
                  :class="{ 'disabled-text': !(isSelected && inStates('Enabled'))}">{{ $t("common.disable") }}</a>
               <a v-permission="'SCHEDULER.DELETE_SCHEDULER_JOB'" style="padding-bottom: 12px;"
                  :class="{ 'disabled-text': windowData.selectedUuidList.length <=0 }"
                  @click="isSelected && deleteSechduler()">{{ $t("common.destroy") }}</a>
              </div>
            </span>
          </drop-down>
          <stop-or-start-sechduler-dlg v-if="showSechdulerNormal" :model="showSechdulerNormal"
                                       :message="sechdulerNormalMessage"
                                       @close="closeSechdulerNormal"></stop-or-start-sechduler-dlg>
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
        @selection-change="handleSelectChange"
        @sort-change="handleSortChange">
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('scheduler.schedulerName')"
                         prop="name"
                         sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToScheduler(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.taskType')">
          <template slot-scope="scope">
            {{$t(jobClassShow(scope.row.uuid))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.resourceName')" v-if="windowData.resourceType === 'trigger'"
                         prop="resourceName"></el-table-column>
        <el-table-column :label="$t('common.startTime')"
                         prop="timerStartTime">
          <template slot-scope="scope">
            {{scope.row.timerStartTime && formatDatetime(new Date(scope.row.timerStartTime))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('scheduler.taskImplementation')">
          <template slot-scope="scope">
            <span
              v-if="!!dbData.timer[scope.row.triggersUuid[0]] && dbData.timer[scope.row.triggersUuid[0]].repeatCount ===0">
               {{`${$t('timer.repeatExecute')}, ${$t('timer.cycle')}${$t('common.colon')}${showInterval(dbData.timer[dbData.scheduler[scope.row.uuid].triggersUuid[0]].schedulerInterval)}`}}
            </span>
            <span
              v-if="!!dbData.timer[scope.row.triggersUuid[0]] && dbData.timer[scope.row.triggersUuid[0]].repeatCount !== 0">
              {{`${$t('timer.execute', {length: dbData.timer[scope.row.triggersUuid[0]].repeatCount})}, ${$t('timer.cycle')}${$t('common.colon')}${showInterval(dbData.timer[scope.row.triggersUuid[0]].schedulerInterval)}`}}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item"
                                   :state="(new Date(dbData.scheduler[scope.row.uuid].triggersUuid[0] && dbData.timer[dbData.scheduler[scope.row.uuid].triggersUuid[0]] && dbData.timer[dbData.scheduler[scope.row.uuid].triggersUuid[0]].stopTime)).getTime() < windowData.nowTime ? 'Done' : dbData.scheduler[scope.row.uuid].state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('timer.timerState')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="timerIsDone(scope.row.uuid)"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.timer')">
          <template slot-scope="scope">
            {{getTimerName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
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
  import schedulerList from 'src/om/schedulerjob/List';
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import StopOrStartSechdulerDlg from "../../../dialog/StopOrStartSechdulerDlg"
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';
  import {mapState} from 'vuex';

  export default {
    name: "VmScheduler",
    mixins: [schedulerList, WindowBase, Root],
    components: {
      StopOrStartSechdulerDlg,
      TableBodyItemState
    },
    props: {
      param: {
        type: Object,
        default: '',
      }
    },
    data() {
      return {
        dataUuid: '',
        selectVal: 'name',
        searchStr: '',
        showSechdulerNormal: false,
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        resourceType: '',
        sechdulerNormalMessage: {},
        itemList: []
      }
    },
    created() {
      let self = this, resourceType = '', resourceUuid = '', dataUuid = '';
      if (self.param.resourceType) resourceType = self.param.resourceType;
      if (self.param.resourceUuid) resourceUuid = self.param.resourceUuid;
      if (self.param.resourceUuid) dataUuid = self.param.resourceUuid;
      (self.param && self.param.uuid) ? self.dataUuid = self.param.uuid : "";
      self.updateWindow({
        pageIndex: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        resourceType,
        dataUuid,
        resourceUuid,
        selectedUuidList: [],
        selectList: [],
        methods: {
          query: self.queryList
        }
      }).then(() => {
        self.getBackupTask();
      }).then(() => {
        self.queryList();
      })
    },
    computed: {
      isSelected() {
        let self = this;
        return self.windowData.selectedUuidList.length >= 1;
      },
      ...mapState({
        scheduler: state => state.scheduler
      }),
      isSingleSelected() {
        let self = this;
        return self.windowData.selectedUuidList.length === 1;
      },
      selectedList() {
        let self = this;
        return self.windowData.selectedUuidList;
      }
    },
    methods: {
      ...Utils,
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
      handleSelection(val) {
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      search() {
        let self = this;
        self.queryList();
      },
      getCondition: function () {
        let conditionList = []
        if (this.param.conditions !== undefined) conditionList.push(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        if (this.backupTaskUuidList.length > 0) {
          conditionList.push(`uuid!?=${this.backupTaskUuidList}`)
        }
        return conditionList
      },
      //设置时间状态
      timerIsDone(uuid) {
        let self = this
        if (!self.scheduler[uuid].triggersUuid[0]) return 'Unattached'
        if (!!self.dbData.timer[self.scheduler[uuid].triggersUuid[0]] && (new Date(self.dbData.timer[self.scheduler[uuid].triggersUuid[0]].stopTime)).getTime() < (Date.now() + window.___currServerTimeMillionDvalue)) {
          return 'Done'
        } else {
          return 'Running'
        }
      },
      handleSortChange(row) {
        let self = this;
        if (row) {
          let sortDirection = row.order === 'ascending' ? '+' : '-';
          self.updateWindow({
            sortDirection: sortDirection,
            sortBy: row.prop
          }).then(() => {
            self.queryList();
          })
        }
      },
      handleSelectChange(row) {
        let self = this, selectedUuidList = [];
        selectedUuidList = row.map((item) => {
          return item.uuid
        });
        self.updateWindow({
          selectList: row,
          selectedUuidList: selectedUuidList
        })
      },
      createScheduler() {
        let self = this;
        this.$router.push({
          name: `createSchedulerJob`,
          params: {resourceType: self.windowData.resourceType, resourceUuid: self.windowData.resourceUuid}
        })
      },
      //判断能否操作启用停用等操作；
      inStates() {
        if (this.windowData.selectedUuidList.length <= 0) return
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        //单选时
        if (this.windowData.selectedUuidList.length === 1) {
          return !stateList.every((item, index, array) => {
            return item !== this.scheduler[this.windowData.selectedUuidList[0]].state
          }) && !this.isDone(this.windowData.selectedUuidList[0]);
        }
        let resp = false
        this.windowData.selectedUuidList.forEach((uuid) => {
          if (!stateList.every((item, index, array) => {
            return item !== this.scheduler[uuid].state
          }) && !this.isDone(uuid)) resp = true
        })
        return resp
      },
      //判断是否已经停止 当停止时间小于当前时间的时候证明已停止，否则反之
      isDone: function (uuid) {
        let self = this
        return (new Date(self.scheduler[uuid].stopTime)).getTime() < new Date().getTime()
      },
      enabled() {
        let self = this;
        self.windowData.selectedUuidList.forEach((item) => {
          (uuid => {
            self.dispatchActionWithEvent('scheduler/enable', uuid)
              .then(() => {
                self.queryList();
              })
          })(item)
        })
      },
      disableSechduler() {
        let self = this;
        self.sechdulerNormalMessage = {
          uuidList: self.windowData.selectedUuidList,
          type: 'disabled'
        }
        self.showSechdulerNormal = true;
      },
      deleteSechduler() {
        let self = this;
        self.sechdulerNormalMessage = {
          uuidList: self.windowData.selectedUuidList,
          type: 'delete'
        }
        self.showSechdulerNormal = true;
      },
      closeSechdulerNormal(param) {
        let self = this;
        if (param) {
          switch (param.type) {
            case 'delete':
              self.deleteScheduler(param.uuidList);
              break;
            case 'disabled':
              param.uuidList.forEach((item) => {
                (uuid => {
                  self.dispatchActionWithEvent('scheduler/disable', uuid)
                    .then(() => {
                      self.queryList();
                    })
                })(item)
              })
              break;
          }
        }
        self.showSechdulerNormal = false;
      },
      deleteScheduler(uuidList) {
        let task = [], p = null, self = this;
        if (uuidList) {
          uuidList.forEach((uuid) => {
            if (this.dbData.scheduler[uuid].triggersUuid.length > 0) {
              this.dbData.scheduler[uuid].triggersUuid.forEach((triggerUuid) => {
                let p = rpc._delete(`scheduler/jobs/${uuid}/scheduler/triggers/${triggerUuid}`)
                task.push(p)
              })
            }
            Promise.all(task).then(() => {
              self.dispatchActionWithEvent('scheduler/delete', uuid)
                .then(() => {
                  self.queryList();
                  if (this.windowData.resourceType === 'trigger') {
                    self.queryTimer()
                  }
                })
            })
          })
        }
      },
      //查询定时器
      queryTimer() {
        return rpc.query(`scheduler/triggers/${this.windowData.dataUuid}`)
          .then((resp) => {
            this.updateDbTable({
              tableName: 'timer',
              list: resp.inventories
            })
          })
      },
      //是否可以创建定时器
      timerDoneCtlTabAction(triggerUuid) {
        let self = this
        return (new Date(self.dbData.timer[triggerUuid].stopTime)).getTime() < (Date.now() + window.___currServerTimeMillionDvalue)
      },
      //解绑定时任务
      pageDetach() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: "timer.detach",
          description: 'timer.detachConfirm',
          icon: 'timed_task_n',
          getName(uuid) {
            return self.scheduler[uuid].name
          },
          uuidList: self.selectedList,
          ok() {
            self.detachScheduler(self.param.resourceUuid, self.selectedList)
              .then(() => {
                self.queryList();
              });
          }
        })
      },
      //回到定时器详情
      goToScheduler(uuid){
        let self = this;
        self.$router.push({name: 'detailSchedulerJob', params: {uuid}})
      }
    },
    watch: {
      'param.uuid': function (newVal, oldVal) {
        let self = this;
        if (!_.isEqual(newVal, oldVal)) {
          self.dataUuid = newVal;
          self.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
