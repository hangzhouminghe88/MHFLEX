<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.zwatchAlarm') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-create" v-permission="'ALARM.CREATE'" style="padding-top: 12px;" @click="!isSelected && pageCreate()" :class="{ 'disabled-text': isSelected }">{{$t("common.create")}}</a>
                  <a id="common-enable" v-permission="'ALARM.CHANGE_STATE'" @click="isSelected && canEnable(selectedList) && pageEnable('Enabled', queryList)" :class="{ 'disabled-text': !isSelected || !canEnable(selectedList) }">{{$t("common.enable")}}</a>
                  <a id="common-disable" v-permission="'ALARM.CHANGE_STATE'" @click="isSelected && canDisable(selectedList) && pageEnable('Disabled', queryList)" :class="{ 'disabled-text': !isSelected || !canDisable(selectedList) }">{{$t("common.disable")}}</a>
                  <a id="common-destroy" v-permission="'ALARM.DELETE'" style="padding-bottom: 12px;" :class="{ 'disabled-text': !isSelected}" @click="isSelected && pageDestroy()">{{$t("common.destroy")}}</a>
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
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name:'cluster/clusterdetail/${scope.row.uuid}'})">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.type')" prop="type">
          <template slot-scope="scope">
            {{getZWatchAlarmResourceType(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.item')" prop="" v-if="windowData.currTab == 'zwatchResourceAlarm'">
          <template slot-scope="scope">
            {{getZWatchAlarmItemWithCondition(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.alarmStatus')" prop="status">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="`alarm.${scope.row.status}`"/>
          </template>
        </el-table-column>

        <el-table-column :label="$t('zwatchTopic.endpointNum')">
          <template slot-scope="scope">
            {{getTopicNum(scope.row.uuid)}}
          </template>
        </el-table-column>

        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
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
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import ZwatchAlaramList from 'src/om/zwatchalarm/List';

  export default {
    name: "ZwatchAlarmTabListForResource",
    mixins:[Root,WindowBase,MultiSelectList, ZwatchAlaramList],
    props:['param'],
    created() {
      window.addEventListener('click', this.onWindowClick)
      //this.conditionNameList = this.alarmConditionNameList
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        currTab: 'zwatchResourceAlarm',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        },
        conditions: this.param && this.param.conditions ? this.param.conditions : []
      }).then(() => this.queryList())
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: []
      }
    },
    methods:{
      ...Utils,
      //是否可以启用
      canEnable: function (uuidList) {
        return uuidList.some(uuid => this.dbData.zwatchResourceAlarm[uuid].state === 'Disabled')
      },
      //是否可以停用
      canDisable: function (uuidList) {
        return uuidList.some(uuid => this.dbData.zwatchResourceAlarm[uuid].state === 'Enabled')
      },
      //查询条件
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
      //查找列表数据
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
        this.itemList = this.getItemList();
      },
      //获得列表数据
      getItemList(){
        let self = this;
        return _.map(self.windowData.uuidList, (uuid) => {
          return self.dbData[self.windowData.currTab][uuid]
        })
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      //切换tab
      changeTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          if (tabName === 'zwatchEventAlarm') {
            this.conditionNameList = this.eventConditionNameList
          } else {
            this.conditionNameList = this.alarmConditionNameList
          }
          this.updateWindow({
            currItemUuid: '',
            currTab: tabName,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            sortBy: 'createDate',
            sortDirection: '-'
          }).then(() => {
            this.queryList()
          })
        }
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      pageCreate: function () {
        let dlg = 'createZwatchalarm'
        if (this.windowData.currTab === 'zwatchEventAlarm') {
          dlg = 'createZwatchalarmdetail'
        }
        this.$router.push({name: dlg, params: {
            type: this.param.type,
            resourceUuid: this.param.resourceUuid}
        });
      }
    },
    filters: {
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({
          conditions: this.param && this.param.conditions ? this.param.conditions : []
        }).then(() => this.queryList())
        this.destroyDialogs()
      }
    }

  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>

