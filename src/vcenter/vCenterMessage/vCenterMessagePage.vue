<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.vCenterMessage')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="$t('vCenterMessage.eventAlarm') + `(${windowData.eventAlarmCount ? windowData.eventAlarmCount : '0'})`" name="eventAlarm"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <el-date-picker
            v-model="start_time"
            type="datetime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions0"
            @change="handleChangeDate">
          </el-date-picker>
          -
          <el-date-picker
            v-model="end_time"
            type="datetime"
            start-placeholder="开始日期"
            :picker-options="pickerOptions1"
            @change="handleChangeDate">
          </el-date-picker>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.eventAlarmCount > 0"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="windowData.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="windowData.eventAlarmCount"
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
  import vCenterMessageList from './List';
  export default {
    name: "vCenterMessagePage",
    mixins: [vCenterMessageList]
  }
</script>

<style scoped>

</style>
