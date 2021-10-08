<template>
  <div class="container">
    <div class="page-toolbar-container" style="display:flex;">
      <span class="page-toolbar-left">{{$t('resourcestack.event')}}</span>
      <span class="page-toolbar-center"></span>
      <span class="page-toolbar-right">
         <span style="display: inline-block;">
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
      </span>
    </div>
    <el-table :data="itemList">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column :label="$t('eventFromResourceStack.action')" prop="action"></el-table-column>
      <el-table-column :label="$t('eventFromResourceStack.resourceName')" prop="resourceName"></el-table-column>
      <el-table-column :label="$t('eventFromResourceStack.actionStatus')">
        <template slot-scope="scope">
          <table-body-item-state :state="scope.row.actionStatus"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.createDate')">
        <template slot-scope="scope">
          {{formatDatetime(new Date(scope.row.createDate))}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.total > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="windowData.total"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  import EventTabService from './EventTabService';
  export default {
    name: "EventTab",
    mixins: [EventTabService]
  }
</script>

<style scoped>

</style>
