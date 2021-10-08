<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('operationLog.operationLog')}}</span>
        </el-col>
        <el-col :span="10">
          <el-tabs v-model="windowData.currTab" @tab-click="changeCurrTab">
            <el-tab-pane :label="`${$t('operationLog.completed')}(${windowData.operationLogCount ? windowData.operationLogCount :  '0'})`" name="operationLog"></el-tab-pane>
            <el-tab-pane :label="`${$t('operationLog.processing')}(${windowData.processingCount ? windowData.processingCount : '0'})`" name="processing"></el-tab-pane>
            <el-tab-pane :label="`${$t('operationLog.audit')}(${windowData.auditCount ? windowData.auditCount : '0'})`" name="audit"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
     <el-row type="flex">
       <span class="page-toolbar-left">
         <el-date-picker
            v-model="start_time"
            value-format="yyyy-MM-dd HH:mm"
            type="datetime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions0"
            @change="handleChangeDate">
      </el-date-picker>
          -
         <el-date-picker
        v-model="end_time"
        value-format="yyyy-MM-dd HH:mm"
        type="datetime"
        start-placeholder="开始日期"
        :picker-options="pickerOptions1"
        @change="handleChangeDate">
      </el-date-picker>
       </span>
       <span class="page-toolbar-center"></span>
       <span class="page-toolbar-right">
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
         <span class="btn-refresh" style="position: relative;" @click="downloadCurrPage()">
           <i class="el-icon-download icon"></i>
           <span class="download-tip">{{$t('common.exportcsv')}}</span>
         </span>
       </span>
     </el-row>
    </div>
    <div slot="page-table-content" v-if="windowData.currTab === 'operationLog'">
        <el-table :data="windowData.operationLogList" @row-click="goToDetail" v-loading="windowData.loading">
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
          <el-table-column :label="$t('operationLog.description')" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="link">{{$t(scope.row.action, scope.row)}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('operationLog.result')" v-if="windowData.currTab === 'operationLog'">
            <template slot="header"  slot-scope="scope">
              <el-dropdown @command="handleSelectResult($event,'result')" style="height: 30px;">
                <span>{{getOperationTitle}}<i class="el-icon-caret-bottom"></i></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in operationLogDropdownList"
                                    :key="index"
                                    :command="item">{{$t(item.name)}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template slot-scope="operationLog">
              <span style="position: relative; top: 5px; padding-left: 15px;">
                <span v-if="operationLog.row.status === 'UNDONE'" class="undone"></span>
                <span v-if="operationLog.row.status === 'ERR'" class="err"></span>
                <span v-if="operationLog.row.status === 'MIX'" class="mix"></span>
                <span v-if="operationLog.row.status === 'OK'" class="ok"/>
              </span>
              <span v-if="operationLog.row.status === 'MIX'" class="text" style="color:#5E6978;">{{operationLog.row.successCount}}{{$t('common.success')}},{{operationLog.row.failCount}}{{$t('common.failed')}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('operationLog.result')"
                           v-if="dbData.common.isAdmin || isProjectOperator()">
            <template slot="header" slot-scope="scope">
              <el-dropdown @command="handleSelectResult($event,'operator')" style="height: 30px;">
                <span>{{getOperatorTitle}}<i class="el-icon-caret-bottom"></i></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in operatorDropdownList"
                                    :key="index"
                                    :command="item">{{$t(item.name)}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template slot-scope="scope">
              <span>{{(getOperator(scope.row.creator, scope.row.creatorType) !== '' || undefined) ? getOperator(scope.row.creator, scope.row.creatorType) : $t('operationLog.deletedAccount')}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('operationLog.ip')">
            <template slot-scope="scope">
              {{scope.row.ip}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.time))}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('operationLog.finishTime')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.endTime))}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <operation-pagination class="page-table-pagination" v-if="windowData.operationLogCount > 0"
                                :page-size="windowData.pageSize"
                                :page-sizes="[10, 20, 50, 100]"
                                :total="windowData.operationLogCount"
                                @current-change="pageCurrentChange"
                                @size-change="pageSizeChange"
                                :curr-page="windowData.pageIndex"></operation-pagination>
        </div>
    </div>
    <div slot="page-table-content" v-if="windowData.currTab === 'processing'">
        <el-table :data="windowData.processingPageList" v-loading="windowData.loading">
           <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
          <el-table-column :label="$t('operationLog.description')">
            <template slot-scope="scope">
              {{$t(scope.row.action, scope.row)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('operationLog.result')">
            <template slot-scope="operationLog">
              <span v-if="dbData.messageProgress[operationLog.row.id]">
                <el-progress :percentage="parseInt(dbData.messageProgress[operationLog.row.id].progress)"/>
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.time))}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <operation-pagination class="page-table-pagination" v-if="windowData.processingCount > 0"
                                :page-size="windowData.pageSize"
                                :page-sizes="[10, 20, 50, 100]"
                                :total="windowData.processingCount"
                                @current-change="pageCurrentChange"
                                @size-change="pageSizeChange"
                                :curr-page="windowData.pageIndex"></operation-pagination>
        </div>
    </div>
    <div slot="page-table-content" v-if="windowData.currTab === 'audit'">
      <el-table :data="windowData.auditPageList"  @row-click="goToDetail" v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column :label="$t('operationLog.api')">
          <template slot-scope="scope">
            <span class="link">{{scope.row.apiName}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.resourceType')">
          <template slot-scope="scope">
            {{scope.row.resourceType}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.duration')">
          <template slot-scope="scope">
            {{durationConvert(scope.row.duration)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.result')">
          <template slot="header"  slot-scope="scope">
            <el-dropdown @command="handleSelectResult($event,'result')">
              <span>{{getOperationTitle}}<i class="el-icon-caret-bottom"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in auditDropdownList"
                                  :key="index"
                                  :command="item">{{$t(item.name)}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template slot-scope="operationLog">
              <span style="position: relative; top: 5px; padding-left: 15px;">
                <span v-if="operationLog.row.error" class="err"></span>
                <span v-if="!operationLog.row.error" class="ok"/>
              </span>
            <span v-if="operationLog.row.status === 'MIX'" class="text" style="color:#5E6978;">{{operationLog.row.successCount}}{{$t('common.success')}},{{operationLog.row.failCount}}{{$t('common.failed')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.operator')">
          <template slot-scope="scope">
            {{getAccountName(scope.row.operatorAccountUuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.time - scope.row.duration))}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('operationLog.finishTime')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.time))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <operation-pagination class="page-table-pagination" v-if="windowData.auditCount > 0"
                              :page-size="windowData.pageSize"
                              :page-sizes="[10, 20, 50, 100]"
                              :total="windowData.auditCount"
                              @current-change="pageCurrentChange"
                              @size-change="pageSizeChange"
                              :curr-page="windowData.pageIndex"></operation-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import OperationList from './List';
  import OperationPagination from "./OperationPagination";

  export default {
    name: "OperationLogPage",
    components: {OperationPagination},
    mixins: [OperationList]
  }
</script>

<style scoped lang="less">
 .undone{
   width: 20px;
   height: 20px;
   display: inline-block;
   background-image: url('~assets/notification_running.svg');
   background-repeat: no-repeat;
 }
  .err{
    width: 25px;
    height: 25px;
    display: inline-block;
    background-image: url('~assets/notification_error.svg');
    background-repeat: no-repeat;
  }
  .mix{
    width: 20px;
    height: 20px;
    display: inline-block;
    background-image: url('~assets/notification_warning.svg');
    background-repeat: no-repeat;
  }
  .ok{
    width: 25px;
    height: 25px;
    display: inline-block;
    background-image: url('~assets/notification_success.svg');
    background-repeat: no-repeat;
  }
  .btn-refresh:hover{
    .download-tip{
      display: inline-block;
    }
  }
  .download-tip{
    display: none;
    position: absolute;
    z-index: 10;
    background: #0077d1;
    color: #fff;
    width: 100%;
    left: -9px;
    right: 0;
    padding: 0px 10px;
    font-size: 12px;
    top: 36px;
  }
</style>
