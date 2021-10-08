<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.network')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs>
            <el-tab-pane :label="$t('common.available')+'('+`${windowData.availableCount ? windowData.availableCount : 0}` +')'"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span class="btn-success" @click="goToCreate()">
          <i class="el-icon-plus icon"></i>
          <span class="text">{{$t('common.createNetwork')}}</span>
        </span>
          <drop-down class="dropdown btn-primary more" :enabled="isSelected" :class="{'disabled': !isSelected}">
          <span slot="title">
            <i class="el-icon-more"></i>
            <span class="text">{{$t('common.moreActions')}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="isSingleSelected && openAddIpRange()" :class="{'disabled-text': !isSingleSelected}">{{$t('common.addIpRange')}}</a>
              <a @click="isSingleSelected && openAddDns()" :class="{'disabled-text': !isSingleSelected}">{{$t('common.addDns')}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasNotSharedToAll() && pageShareVCenterNetworkToAll()" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}">{{$t("common.shareToAll")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasSharedToAll() && pageRecallVCenterNetworkFromAll()" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
              <a style="padding-bottom: 12px;" @click="pageDelete">{{$t('common.destroy')}}</a>
            </div>
          </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
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
        </div>
      </el-row>
    </div>

    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
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

    <div slot="page-footer">
      <add-ip-range v-if="showAddIpRange" :param="addIpRangeMessage" @close="showAddIpRange = false;"/>
    </div>
  </page-template>
</template>

<script>
  import vCenterNetWorkPage from 'src/vcenter/vCenterNetWork/List';
  export default vCenterNetWorkPage;

</script>

<style scoped>

</style>
