<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">
            {{$t('common.zwatchalarm')}}
          </span>
        </el-col>
        <el-col :span="10">
          <el-tabs v-model="windowData.currTab" @tab-click="handleChangeTab">
            <el-tab-pane :label="`${$t('zwatchAlarm.zwatchResourceAlarm')}(${windowData.zwatchResourceAlarmCount ? windowData.zwatchResourceAlarmCount : '0'})`" name="zwatchResourceAlarm"></el-tab-pane>
            <el-tab-pane :label="`${$t('zwatchAlarm.zwatchEventAlarm')}(${windowData.zwatchEventAlarmCount ? windowData.zwatchEventAlarmCount : '0'})`" name="zwatchEventAlarm"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-right">
          <span class="btn-success" @click="goToCreate();">
            <i class="el-icon-plus"></i>
            <span>{{windowData.currTab === 'zwatchResourceAlarm' ? $t('zwatchAlarm.create.zwatchResourceAlarm') :  $t('zwatchAlarm.create.zwatchEventAlarm')}}</span>
          </span>
          <span class="btn-primary" v-if="['zwatchResourceAlarm'].includes(windowData.currTab)" :class="{'disabled': !isSelected || inState('Enabled')}" @click="isSelected && !inState('Enabled') && pageEnable('Enabled', queryList)">
            <i class="el-icon-caret-right icon"></i>
            <span>{{$t('common.enable')}}</span>
          </span>
          <span class="btn-primary" v-if="['zwatchResourceAlarm'].includes(windowData.currTab)" :class="{'disabled': !isSelected || inState('Disabled')}" @click="isSelected && !inState('Disabled') && pageEnable('Disabled', queryList)">
            <i class="el-icon-remove-outline icon"></i>
            <span>{{$t('common.disable')}}</span>
          </span>
          <drop-down class="dropdown more btn-primary" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
             <div class="dropdown-content">
               <a style="margin-top:12px" :class="{'disabled-text': !isSingleSelected}" @click="isSingleSelected && addEndPoint()">{{$t('zwatchTopic.addEndpoint')}}</a>
               <a :class="{'disabled-text': !isSingleSelected || !canRemoveEndpoint(selectedList[0], windowData.currTab) }" @click="isSingleSelected  && canRemoveEndpoint(selectedList[0], windowData.currTab) && pageRemoveEndpoint()">{{$t('zwatchTopic.removeEndpoint')}}</a>
               <a style="margin-bottom: 12px;":class="{'disabled-text': !canDestroy(selectedList)}" @click="canDestroy(selectedList) && pageDestroy()">{{$t('common.destroy')}}</a>
             </div>
            </span>
          </drop-down>
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
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort" v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{(dbData[windowData.currTab][scope.row.uuid] && (getAlarmName(scope.row.uuid, windowData.currTab) || dbData[windowData.currTab][scope.row.uuid].name))  || (dbData[windowData.currTab][scope.row.uuid] && dbData[windowData.currTab][scope.row.uuid].name)}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="metricName" sortable>
          <template slot-scope="scope">
            {{getZWatchAlarmResourceType(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.item')" v-if="windowData.currTab === 'zwatchResourceAlarm'" prop="threshold"
                         sortable
                         show-overflow-tooltip>
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
        <el-pagination v-if="windowData.currTab === 'zwatchResourceAlarm' ? windowData.zwatchResourceAlarmCount > 0 : windowData.zwatchEventAlarmCount >0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.currTab === 'zwatchResourceAlarm' ? windowData.zwatchResourceAlarmCount : windowData.zwatchEventAlarmCount"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import List from './List';
  export default{
    name: 'ZwatchAlarmPage',
    mixins: [List]
  }
</script>

<style scoped>

</style>
