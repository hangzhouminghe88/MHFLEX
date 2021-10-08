<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.zwatchendpoint')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus"></i>
            <span class="text">{{$t('zwatchEndpoint.create')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': instate('Enabled')}"
                @click="!instate('Enabled') && pageEnable('Enabled')">
            <i class="el-icon-caret-right icon"></i>
            <span class="text">{{$t('common.enable')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': instate('Disabled')}"
                @click="!instate('Disabled') && pageEnable('Disabled')">
            <i class="el-icon-remove-outline icon"></i>
            <span class="text">{{$t('common.disable')}}</span>
          </span>
          <drop-down class="dropdown more btn-primary" :class="{'disabled': !isSelected}" :enabled="isSelected">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px" @click="pageAddAlarm()">{{$t('zwatchTopic.addAlarm')}}</a>
                <a @click="pageRemoveAlarm()">{{$t('zwatchTopic.removeAlarm')}}</a>
                <a style="margin-bottom: 12px;" :class="{ 'disabled-text': !isSelected || isSystemEndpointUuid(selectedList) }" @click="isSelected && !isSystemEndpointUuid(selectedList) && pageDestroy()">{{$t('common.destroy')}}</a>
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
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @selection-change="handleSelect"
        @sort-change="handleSort"
        v-loading="windowData.loading"
        >
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
  </page-template>
</template>

<script>
  import List from './List';

  export default {
    name: "ZwatchEndPointPage",
    mixins: [List]
  }
</script>

<style scoped>

</style>
