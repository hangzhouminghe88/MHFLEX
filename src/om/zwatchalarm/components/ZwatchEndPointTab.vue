<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="text">{{$t('common.zwatchendpoint')}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
               <a style="margin-top:12px"  @click="tabAddEndPoint()">{{$t('zwatchTopic.addEndpoint')}}</a>
               <a style="margin-bottom: 12px;" :class="{'disabled-text': !isSelected || !canRemove([selectedList], param.type) }" @click="isSelected  && canRemove([selectedList], param.type) && tabRemoveEndPoint()">{{$t('zwatchTopic.removeEndpoint')}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
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
    <div >
      <el-table
        :data="itemList"
        @selection-change="handleSelect"
        @sort-change="handleSort">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchEndpoint.type')" prop="type" sortable>
          <template slot-scope="scope">
            {{getZWatchEndpointType(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchEndpoint.address')">
          <template slot-scope="scope">
            {{getZWatchEndpointAddress(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable>
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
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
  import ZWatchAlarmMethod from 'src/windows/ZWatchAlarm/Methods'
  import ZwatchEndPointList from 'src/om/zwatchEndPoint/List';
  export default {
    name: "ZwatchEndPointTab",
    mixins: [ZwatchEndPointList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    methods: {
      ...{
        addEndpointToAlarm:ZWatchAlarmMethod.methods.addEndpointToAlarm,
        removeTopicFromAlarm : ZWatchAlarmMethod.methods.removeTopicFromAlarm,
        removeEndpointFromAlarm: ZWatchAlarmMethod.methods.removeEndpointFromAlarm,
        addTopicToAlarm: ZWatchAlarmMethod.methods.addTopicToAlarm
      },
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
      canRemove (uuidList) {
        let alarmUuid = this.param.uuid
        let systemAlarmUuidList = this.getZWatchSystemAlarmUuidList()
        let isSystemAlarm = systemAlarmUuidList.some(item => alarmUuid === item)
        if (isSystemAlarm && this.isSystemEndpointUuid(uuidList)) {
          return false
        }
        return true
      },
      async tabAddEndPoint () {
        let self = this
        let alarmUuid = this.param.uuid
        let name = this.dbData[this.param.type][alarmUuid].name
        let subscribedTopicUuidList = this.dbData[this.param.type][alarmUuid].actions.map(item => item.actionUuid)
        self.openDialog('ZwatchEndPointerMultiSelectListDlg', {
          conditions: ['state=Enabled', `topics.uuid!?=${subscribedTopicUuidList}`, 'name!=created-by-SystemHTTPTopicAndEndpointCreator'],
          select: (endpointUuidList) => self.addEndpointToAlarm(alarmUuid, endpointUuidList, this.param.type)
            .then(() => {
              self.param.refresh()
                .then(() => {
                  self.queryList()
                })
            })
        })
      },
      tabRemoveEndPoint(){
        let self = this
        let alarmUuid = this.param.uuid
        let name = this.dbData[this.param.type][alarmUuid].name
        let endpointUuidList = this.selectedList
        if (endpointUuidList.length === 0) return
        let getName = (uuid) => {
          let name = this.getEndpointName(uuid)
          return name
        }
        this.openDialog('ConfirmDlg',{
          title: 'zwatchEndpoint.remove',
          description: 'zwatchEndpoint.removeConfirm',
          icon: 'zwatch_endpoint_n',
          uuidList: endpointUuidList,
          ok: () => {
            self.removeEndpointFromAlarm(alarmUuid, endpointUuidList, self.param.type)
              .then(() => {
                self.param.refresh()
                  .then(() => {
                    self.queryList()
                  })
              })
          },
          getName: getName,
          tableName: 'zwatchEndpoint'
        })
      }
    }
  }
</script>

<style scoped>

</style>
