<template>
  <page-template>
    <div slot="page-header">
      <el-row :getter="10">
        <el-col :span="2">
          <div class="page-header-title">{{$t('common.messageCenter')}}</div>
        </el-col>
        <el-col :span="10">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.messageCenter')}(${windowData.allCount ? windowData.allCount : '0'})`" name="messageCenter"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <span class="btn-success" @click="openDialogForMarkingAllAsRead()">
          <span>{{$t('zwatchAlarm.markAllMessageAsRead')}}</span>
        </span>
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
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right"></div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table :data="windowData.currMessageList" @row-click="clickRow" v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column>
          <template slot="header" slot-scope="scope">
           <el-dropdown  @command="handleSelectContent" style="height: 30px;">
             <span>{{getContentTitle}}<i class="el-icon-caret-bottom"></i></span>
             <el-dropdown-menu slot="dropdown">
               <el-dropdown-item v-for="(option, index) in optionList" :command="option.value"
                :key="index">{{option.text}}</el-dropdown-item>
             </el-dropdown-menu>
           </el-dropdown>
          </template>
          <template slot-scope="scope">
            <div class="light" :class="scope.row.status === 'Unread' ? 'unread' : 'read'"></div>
            <span class="link" @click="goToDetail(scope.row, scope.row.getContent())">{{scope.row.getContent()}}</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot="header" slot-scope="scope">
            <el-dropdown @command="handleSelectMessageType" style="height: 30px;">
              <span>{{getAlarmTitle}}<i class="el-icon-caret-bottom"></i></span>
              <el-dropdown-menu slot="dropdown" >
                <el-dropdown-item v-for="(option, index) in optionAlarmList" :command="option.value"
                                  :key="index">{{option.text}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template slot-scope="scope">
            {{getMessageAlarmType(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('zwatchAlarm.messageDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.time))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.allCount > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.allCount"
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
  import MessageCenterList from './List';
  export default {
    name: "MessageCenterPage",
    mixins: [MessageCenterList]
  }
</script>

<style scoped>
  .unread{
    width: 5px;
    height: 5px;
    border-radius: 100%;
    background: #F56C6C;
  }
  .light{
    display: inline-block;
    margin: 0px 10px;
  }
  .read{
    width: 5px;
    height: 5px;
    border-radius: 100%;
    background: #ddd;
  }
</style>
