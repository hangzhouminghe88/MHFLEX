<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.schedulerjob')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab" @tab-click="changeCurrTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : '0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span class="btn-success" @click="getToCreate()">
          <i class="el-icon-plus icon"></i>
          <span>{{$t('scheduler.create')}}</span>
        </span>
          <span class="btn-primary" :class="{'disabled': !isSelected || instates('Enabled')}"
                @click="isSelected && !instates('Enabled') && pageUpdateState('Enabled')">
          <i class="el-icon-caret-right icon"></i>
          <span>{{$t('common.enable')}}</span>
        </span>
          <span class="btn-primary" :class="{'disabled': !isSelected || instates('Disabled')}"
                @click="isSelected && !instates('Disabled') && pageUpdateState('Disabled')">
          <i class="el-icon-remove-outline icon"></i>
          <span>{{$t('common.stop')}}</span>
        </span>
          <drop-down class="more btn-primary dropdown" :class="{'disabled': !isSelected}" :enabled="isSelected">
          <span slot="title">
            <i class="el-icon-more icon"></i>
            <span class="text">{{$t('common.moreActions')}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content">
               <a v-permission="'SCHEDULER.ADD_SCHEDULER_JOB_2_SCHEDULER_TRIGGER'"
                  :class="{'disabled-text': !isSelected || !canAttach()}"
                  @click="isSelected && canAttach() && pageAttach()">{{ $t("common.attach") }}</a>
               <a v-permission="'SCHEDULER.REMOVE_SCHEDULER_JOB_FROM_SCHEDULER_TRIGGER'"
                  :class="{'disabled-text': !isSelected || !canDetach()}"
                  @click="isSelected && canDetach() && pageDetach()">{{ $t("common.detach") }}</a>
               <a v-permission="'SCHEDULER.DELETE_SCHEDULER_JOB'" style="padding-bottom: 12px;"
                  @click="isSelected && deleteSechduler()" :class="{ 'disabled-text': !isSelected}">{{ $t("common.destroy") }}</a>
            </div>
          </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
         <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
              <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="(item, index ) in conditionNameList"
                  :label="$t(`${item.name}`)"
                  :key="index"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
            </el-input>
          </span>
          <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @selection-change="handleSelectChange"
        @sort-change="handleSortChange"
        v-loading="windowData.loading"
        >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('scheduler.schedulerName')"
                         prop="name"
                         sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
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
            {{dbData.schedulerA[scope.row.uuid] && formatDatetime(new
            Date(dbData.schedulerA[scope.row.uuid].startTime))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('scheduler.taskImplementation')">
          <template slot-scope="scope">
            <span
              v-if="scope.row.triggersUuid[0] && !!dbData.timer[scope.row.triggersUuid[0]] && dbData.timer[scope.row.triggersUuid[0]].repeatCount ===0">
               {{`${$t('timer.repeatExecute')}, ${$t('timer.cycle')}${$t('common.colon')}${showInterval(dbData.timer[dbData.scheduler[scope.row.uuid].triggersUuid[0]].schedulerInterval)}`}}
            </span>
            <span
              v-if="scope.row.triggersUuid[0] && !!dbData.timer[scope.row.triggersUuid[0]] && dbData.timer[scope.row.triggersUuid[0]].repeatCount !== 0">
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
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import SchedulerJobList from 'src/om/schedulerjob/List';
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "SchedulerJobPage",
    components: {TableBodyItemState, PageTemplate},
    mixins: [SchedulerJobList, WindowBase, MultiSelectList],
    data() {
      return {
        currTab: 'available',
        itemList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          query: self.queryList
        }
      }).then(() => {
        self.getBackupTask()
          .then(() => {
            self.queryList();
          });
      })
    },
    methods: {
      changeCurrTab() {

      },
      handleSelectChange(rows) {
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectedUuidList: uuidList
        })
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
      getToCreate() {
        let self = this;
        self.$router.push({path: 'createSchedulerJob'});
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailSchedulerJob', params:{uuid}});
      }
    }
  }
</script>

<style scoped>

</style>
