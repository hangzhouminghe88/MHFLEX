<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("zwatchAlarm.select") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="radio-group">
          <span class="tab-container">
            <span class="tab-item" :class="{'active': windowData.currTab === 'zwatchResourceAlarm'}" @click="handleChangeTab('zwatchResourceAlarm')">{{$t('zwatchAlarm.zwatchResourceAlarm')}}</span>
            <span class="tab-item" :class="{'active': windowData.currTab === 'zwatchEventAlarm'}" @click="handleChangeTab('zwatchEventAlarm')">{{$t('zwatchAlarm.zwatchEventAlarm')}}</span>
          </span>
          <span style="padding: 0 15px;display: inline-block;float: right;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort">
           <span slot="empty" class="table-nodata">
              <p class="empty-text" v-text="$t('common.noData')"></p>
            </span>
          <el-table-column type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name" sortable>
            <template slot-scope="scope">
              <span class="link" @click="goToDetail(scope.row.uuid); cancel()">{{getAlarmName(scope.row.uuid)  || (dbData[windowData.currTab][scope.row.uuid] && dbData[windowData.currTab][scope.row.uuid].name)}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.type')" prop="metricName" sortable>
            <template slot-scope="scope">
              {{getZWatchAlarmResourceType(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('zwatchAlarm.item')" v-if="windowData.currTab === 'zwatchResourceAlarm'" prop="threshold" sortable>
            <template slot-scope="scope">
              {{getZWatchAlarmItemWithCondition(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')" prop="state" sortable>
            <template slot-scope="scope">
              <table-body-item-state :state="dbData[windowData.currTab][scope.row.uuid] && dbData[windowData.currTab][scope.row.uuid].state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('zwatchAlarm.alarmStatus')"  v-if="windowData.currTab === 'zwatchResourceAlarm'"  prop="status" sortable>
            <template slot-scope="scope">
              <table-body-item-state :state="dbData[windowData.currTab][scope.row.uuid] && `alarm.${dbData[windowData.currTab][scope.row.uuid].status}`"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('zwatchTopic.endpointNum')">
            <template slot-scope="scope">
              {{getTopicNum(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
            <template slot-scope="scope">
              {{dbData[windowData.currTab][scope.row.uuid] && formatDatetime(new Date(dbData[windowData.currTab][scope.row.uuid].createDate))}}
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
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import ZwatchAlarmList from 'src/om/zwatchalarm/List';
  import rpc from 'src/utils/rpc';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import _ from 'lodash'

  export default {
    components: {TableBodyItemState},
    mixins: [MultiSelectList, ZwatchAlarmList],
    name: "ZwatchAlaramMultiSelectDlg",
    created: function () {
      let selectedItems = {
        zwatchResourceAlarm: [],
        zwatchEventAlarm: []
      }
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: 'zwatchResourceAlarm',
        selectedItems,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
      this.deleteAllAssistant()
      this.queryForAssistant()
    },
    destroyed(){
      this.deleteAllAssistant()
    },
    methods: {
      getCondition(){
        let conditionList = []
        conditionList = conditionList.concat(this.dialogData.param.conditions);
        return conditionList;
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      async handleChangeTab(e) {
        let self = this;
        if(e === self.windowData['currTab']) return;
        let selectedItems = _.cloneDeep(this.windowData.selectedItems)
        selectedItems[this.windowData.currTab] = this.selectedList
        await this.updateWindow({
          currItemUuid: '',
          pageIndex: 1,
          currTab: e,
          uuidList: [],
          table: {},
          selectedUuidList: []
        })
        this.queryList()
          .then(() => {
            let table = _.cloneDeep(this.windowData.table)
            this.updateWindow({ table })
            this.queryForAssistant()
          })
      },
      queryForAssistant () {
        if (this.dialogData.param.removeMode) return
        let self = this
        self.deleteAllAssistant()
        let obj = {
          'zwatchResourceAlarm': {
            create:'createZwatchalarm',
            query: 'zwatch/alarms'
          },
          'zwatchEventAlarm': {
            create: 'createZwatchalarmdetail',
            query: 'zwatch/events/subscriptions'
          }
        }
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          self.createAssistant({
            id,
            operation,
            title: 'zwatchAlarmTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
              self.$router.push({name:  obj[this.windowData.currTab].create,params:{currTab: obj[this.windowData.currTab]}});
              self.closeDialog(self.windowId);
            }
          })
        }
        rpc.query(obj[this.windowData.currTab].query, {
          q: this.getCondition(),
          count: true
        }).then((resp) => {
          if (resp.total === 0) newAssistant('zwatchAlarm', 'create')
        })
      },
      confirm() {
        let selectedItems = _.cloneDeep(this.windowData.selectedItems)
        selectedItems[this.windowData.currTab] = this.selectedList

        let selectedObj = {}
        Object.keys(selectedItems).forEach(key => {
          selectedItems[key].forEach(item => {
            selectedObj[item] = this.getAlarmName(item, key)
          })
        })

        let selectedUuidList = []
        _.values(selectedItems).forEach(it => {
          selectedUuidList = selectedUuidList.concat(it)
        })
        if (selectedUuidList.length > 0) this.dialogData.param.select(selectedUuidList, selectedObj, selectedItems)
        this.cancel()
      },
    }
  }
</script>

<style scoped>
  .tab-container{
    display: inline-block;
    width: 200px;
    border: 1px solid #39f;
    border-radius: 2px;
  }
  .tab-item{
    border-radius: 2px;
    display: inline-block;
    width: 50%;
    text-align: center;
    cursor: pointer;
    padding: 8px 0px;
  }
  .active{
    background: #39f;
    color: #fff;
  }
</style>
