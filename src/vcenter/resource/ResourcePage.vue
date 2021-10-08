<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.vcenter')}}</span>
        </el-col>
        <el-col :span="3">
          <el-tabs>
            <el-tab-pane :label="$t('common.available')+`(${windowData.total ? windowData.total : '0'})`"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">{{$t('vcenter.createvCenter')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageAsync()">
            <i class="el-icon-sort icon"></i>
            <span class="text">{{$t('common.update')}}</span>
          </span>
          <div class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
            <i class="el-icon-remove-outline icon"></i>
            <span class="text">{{$t('common.destroy')}}</span>
          </div>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
          <span style="padding: 0 15px;display: inline-block;">
             <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                 <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                            :key="index" :value="item.value">
                 </el-option>
               </el-select>
                <span slot="append"><i class="el-icon-search icon"></i></span>
             </el-input>
          </span>
          <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
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
  import ResourceService from './ResourceService';

  export default {
    name: "ResourcePage",
    mixins: [ResourceService]
  }
</script>

<style scoped>
  .el-icon-sort {
    transform: rotate(90deg);
  }
</style>
