<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{$t('common.monitoralarm')}}{{$t('common.colon')}}
            <!--<help-trigger name="scheduler" :style="{ position: 'absolute', top: 0, right: '2px' }"/>-->
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a v-permission="'ALARM.CREATE'" style="padding-top: 12px;" @click="!isSelected && pageCreate()">{{$t("common.create")}}</a>
                <a v-permission="'ALARM.CHANGE_STATE'" @click="isSelected && canEnable(selectedList) && pageEnable()" :class="{ 'disabled-text': !isSelected || !canEnable(selectedList) }">{{$t("common.enable")}}</a>
                <a v-permission="'ALARM.CHANGE_STATE'" @click="isSelected && canDisable(selectedList) && pageDisable()" :class="{ 'disabled-text': !isSelected || !canDisable(selectedList) }">{{$t("common.disable")}}</a>
                <a v-permission="'ALARM.DELETE'" style="padding-bottom: 12px;" :class="{ 'disabled-text': !isSelected}" @click="isSelected && pageDestroy()">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
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
        :data="alaramItemList"
        @selection-change="handleSelectChange">
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('common.name')" show-overflow-tooltip>
          <template slot-scope="scope">
             <span class="link" @click="$router.push({name: 'detailZwatchAlarm', params: {
               uuid: scope.row.uuid,
               currTab: 'zwatchResourceAlarm'
             }})">{{getAlarmName(scope.row.uuid)}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.type')">
          <template slot-scope="scope">
            {{getZWatchAlarmResourceType(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.item')">
          <template slot-scope="scope">
            {{getZWatchAlarmItemWithCondition(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData[windowData.currTab][scope.row.uuid] && dbData[windowData.currTab][scope.row.uuid].state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.alarmStatus')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData[windowData.currTab][scope.row.uuid] && `alarm.${dbData[windowData.currTab][scope.row.uuid].status}`"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchTopic.endpointNum')">
          <template slot-scope="scope">
            {{getTopicNum(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{dbData[windowData.currTab][scope.row.uuid] && (new Date(dbData[windowData.currTab][scope.row.uuid].createDate)) | formatDatetime}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0 "
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
  import rpc from 'src/utils/rpc';
  import ZwatchAlaramMethods from 'src/om/zwatchalarm/Methods';
  import TableBodyItemState from "../../component/TableBodyItemState";
  export default {
    name: "ZwatchAlaramForResource",
    components: {TableBodyItemState},
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mixins: [WindowBase, ZwatchAlaramMethods],
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    computed:{
      alaramItemList(){
        if (!_.isArray(this.windowData.uuidList)) return []
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.zwatchResourceAlarm[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.zwatchResourceAlarm[uuid]
          }
        )
      },
      isSelected(){
        let self = this;
        if(self.windowData.selectUuidList){
          return self.windowData.selectUuidList.length >= 1;
        }
      },
      selectedList(){
        let self = this;
        if(self.windowData.selectUuidList){
          return self.windowData.selectUuidList;
        }
      },
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        currTab: 'zwatchResourceAlarm',
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          return self.queryList();
        })
    },
    methods: {
      pageCreate () {
      let dlg = 'createZwatchalarm'
      if (this.windowData.currTab === 'zwatchEventAlarm') {
        dlg = 'createZwatchalarmdetail'
      }
      this.$router.push({name: dlg, params: {resourceUuid: this.param.resourceUuid, type: this.param.type}})
    },
      getCondition: function () {
        let conditionList = []
        if (this.param.conditions) {
          conditionList = conditionList.concat(this.param.conditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        let conditions = this.getCondition()
        conditions.push(`labels.value=${this.param.resourceUuid}`)
        let resp = await rpc.query('zwatch/alarms', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: conditions,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        await this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map(uuid => {
          table[uuid] = {
            selected: false
          }
        })
        await rpc.query('user-tags', {
          q: `resourceUuid?=${uuidList}`
        }).then((resp) => {
          let tasks = []
          resp.inventories.forEach(item => {
            let p = this.updateDbRow({
              tableName: 'zwatchResourceAlarmA',
              id: item.resourceUuid,
              data: item
            })
            tasks.push(p)
          })
          return Promise.all(tasks)
        })
        await this.updateDbTable({
          tableName: 'zwatchResourceAlarm',
          list: resp.inventories
        })
        await this.updateWindow({ uuidList, table })
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
      handleSelectChange(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      canEnable: function (uuidList) {
        return uuidList.some(uuid => this.dbData.zwatchResourceAlarm[uuid].state === 'Disabled')
      },
      canDisable: function (uuidList) {
        return uuidList.some(uuid => this.dbData.zwatchResourceAlarm[uuid].state === 'Enabled')
      },
      getTopicNum: function (uuid, dbName = this.windowData.currTab) {
        if (this.dbData[dbName] && !this.dbData[dbName][uuid]) return ''
        let actions = this.dbData[dbName][uuid].actions
        let num = actions.length
        return num
      },
      pageEnable: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.Enabled(selectedUuidList)
      },
      pageDisable: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.Disabled(selectedUuidList)
      },
      pageDestroy: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let tableName = this.windowData.currTab
        let key = 'name'
        let destroy = null
        let getName
        let self = this;
        this.openDialog('ConfirmDlg',{
          title: 'zwatchAlarm.delete',
          description: 'zwatchAlarm.deleteConfirm',
          icon: 'zwatch_alarm_n',
          uuidList: selectedUuidList,
          ok: () => {
            self.destroy(selectedUuidList).then(() => this.queryList())
          },
          getName: (uuid) => {
            return self.dbData.zwatchResourceAlarm[uuid].name
          },
          resourceName: key,
          tableName
        })
      }
    },
    watch: {
      'windowData.pageIndex': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
