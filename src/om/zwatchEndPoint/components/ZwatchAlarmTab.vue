<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-right">
          <span>{{$t('common.zwatchalarm')}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px;" @click="addAlarm()">{{$t('zwatchTopic.addAlarm')}}</a>
                <a style="margin-bottom: 12px;" :class="{'disabled-text': !canRemove(selectedList)}" @click="canRemove(selectedList) && removeAlarm()">{{$t('zwatchTopic.removeAlarm')}}</a>
              </div>
            </span>
          </drop-down>
          <span class="tab-container">
            <span class="tab-item" :class="{'active': windowData.currTab === 'zwatchResourceAlarm'}" @click="windowData.currTab !== 'zwatchResourceAlarm' && handleChangeTab({name: 'zwatchResourceAlarm'})">{{$t('zwatchAlarm.zwatchResourceAlarm')}}</span>
            <span class="tab-item" :class="{'active': windowData.currTab === 'zwatchEventAlarm'}" @click="windowData.currTab !== 'zwatchEventAlarm' && handleChangeTab({name: 'zwatchEventAlarm'})">{{$t('zwatchAlarm.zwatchEventAlarm')}}</span>
          </span>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-left">
         <span style="padding: 0 15px;display: inline-block;">
          <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
            <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
              <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                         :value="item.value"></el-option>
            </el-select>
            <span slot="append"><i class="el-icon-search icon"></i></span>
          </el-input>
          </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{getAlarmName(scope.row.uuid)  || (dbData[windowData.currTab][scope.row.uuid] && dbData[windowData.currTab][scope.row.uuid].name)}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="namespace" sortable>
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
        <el-pagination v-if="windowData.currTab === 'zwatchResourceAlarm' ? windowData.zwatchResourceAlarmCount > 0: windowData.zwatchEventAlarmCount > 0"
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
  import ZwatchEndPointMethods from 'src/om/zwatchEndPoint/Methods';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import ZwatchAlarmList from 'src/om/zwatchalarm/List';

  export default {
    name: "ZwatchAlarmTab",
    mixins: [ZwatchAlarmList, ZwatchEndPointMethods, MultiSelectList],
    props: {
     param:{
       type: Object,
       default: () => {
         return {}
       }
     }
    },

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: 'zwatchResourceAlarm',
        selectedUuidList: [],
        methods: {
          query: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.param.conditions) {
          conditionList = conditionList.concat(this.param.conditions)
        }
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //添加报警器
      async addAlarm(){
        let self = this
        let endpointUuid = this.param.uuid
        let topicUuid = this.getTopicUuid()
        let uuidList = await this.getAssociatedAlarmUuidList(topicUuid)
        self.openDialog('ZwatchAlaramMultiSelectDlg', {
          type: this.windowData.currTab,
          conditions: [`uuid!?=${uuidList}`],
          select: (alarmUuidList) => {
            let alarmItems = {}
            alarmItems[this.windowData.currTab] = alarmUuidList
            self.addAlarmToEndpoint(endpointUuid, alarmItems).then(() => {
              this.refresh()
              this.param.refresh()
            })
          }
        })
      },
      //获得topicUuid
      getTopicUuid: function () {
        let endpointUuid = this.param.uuid
        if (!this.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = this.dbData.zwatchTopic[endpointUuid].uuid
        return topicUuid
      },
      //是否可以移除
      canRemove(uuidList) {
        let topicUuid = this.getTopicUuid()
        let isSystemAlarmTopic = this.isSystemAlarmTopic([topicUuid])
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        let hasSystemAlarms = uuidList.some(uuid => systemAlarmUuidList.some(item => uuid === item))
        return !(isSystemAlarmTopic && hasSystemAlarms)
      },
      //移除告警器
      removeAlarm(){
        let self = this
        let endpointUuid = this.param.uuid
        let alarmUuidList = this.selectedList
        if (alarmUuidList.length === 0) return
        let tableName = this.windowData.currTab
        let key = 'name'
        if (this.windowData.currTab === 'zwatchEventAlarm') {
          key = 'eventName'
        }
        this.openDialog('ConfirmDlg',{
          title: 'zwatchAlarm.remove',
          description: 'zwatchAlarm.removeConfirm',
          icon: 'zwatch_alarm_n',
          uuidList: alarmUuidList,
          ok: () => {
            let alarmItems = {}
            alarmItems[this.windowData.currTab] = alarmUuidList
            self.removeAlarmFromEndpoint(endpointUuid, alarmItems);
          },
          getName: (uuid) => {
            return this.dbData[this.windowData.currTab][uuid].name;
          }
        })
      }
    }
  }
</script>

<style scoped>
.tab-container{
   display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
}
  .tab-item{
     display: inline-block;
      padding: 10px 20px;
      border-radius: 2px;
      font-size: 12px;
  }
  .active{
    background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
  }
</style>
