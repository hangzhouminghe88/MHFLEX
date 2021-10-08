<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.zwatchsnstexttemplate')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ?  windowData.availableCount : '0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">{{$t('zwatchSNSTextTemplate.create')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': !isSingleSelected || !canSetDefault(selectedList[0])}" @click="canSetDefault(selectedList[0])
          && setDefault(selectedList[0], true)">
            <i class="el-icon-setting icon"></i>
            <span class="text">{{$t('zwatchSNSTextTemplate.setDefault')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': !isSingleSelected || canSetDefault(selectedList[0])}"
           @click="!canSetDefault(selectedList[0]) && setDefault(selectedList[0], false)">
            <i class="el-icon-remove-outline icon"></i>
            <span class="text">{{$t('zwatchSNSTextTemplate.unsetDefault')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
            <i class="el-icon-remove icon"></i>
            <span class="text">{{$t('common.destroy')}}</span>
          </span>
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
            <span class="link" @click="goToDetail(scope.row.uuid)">{{getTemplateName(scope.row.uuid)}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" sortable>
          <template slot-scope="scope">
            {{getApplicationPlatformType(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{(new Date(scope.row.createDate)) | formatDatetime}}
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
    name: "ZwatchSNSTextTemplatePage",
    mixins: [List]
  }
</script>

<style scoped>

</style>
