<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2" class="page-header-title">{{$t('common.vcenterimage')}}</el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab" @tab-click="handleChangeTab">
            <el-tab-pane  v-if="dbData.common.isAdmin":label="$t('common.available')+ `(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
            <el-tab-pane  v-if="!dbData.common.isAdmin" :label="$t('common.mine') + `(${windowData.mineCount ? windowData.mineCount : '0'})`" name="mine"></el-tab-pane>
            <el-tab-pane  v-if="!dbData.common.isAdmin" :label="$t('common.share') + `(${windowData.shareCount ? windowData.shareCount : '0'})`" name="share"></el-tab-pane>
            <el-tab-pane :label="$t('common.destroyed') + `(${windowData.destroyedCount ? windowData.destroyedCount : '0'})`" name="destroyed"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span class="btn-success" v-if="['available', 'mine'].includes(windowData.currTab)"
              @click="goToCreate()">
          <i class="el-icon-plus icon"></i>
          <span class="text">{{$t('common.createImage')}}</span>
        </span>
          <span class="btn-primary"  v-if="['available', 'mine'].includes(windowData.currTab)"
                :class="{'disabled': !isSelected || inStates('Enabled')}" @click="isSelected && !inStates('Enabled') && pageStartOrStop('Enabled')">
          <i class="el-icon-caret-right icon"></i>
          <span class="text">{{$t('common.start')}}</span>
        </span>
          <span class="btn-primary"  v-if="['available', 'mine'].includes(windowData.currTab)"
                :class="{'disabled': !isSelected || inStates('Disabled')}" @click="isSelected && !inStates('Disabled') && pageStartOrStop('Disabled')">
          <i class="el-icon-remove-outline icon"></i>
          <span class="text">{{$t('common.stop')}}</span>
        </span>
          <drop-down class="more dropdown btn-primary"  v-if="['available', 'mine'].includes(windowData.currTab)"
                     :class="{'disabled': !isSelected}" :enabled="isSelected">
          <span slot="title">
            <i class="el-icon-more"></i>
            <span class="text">{{$t('common.moreActions')}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content">
              <a v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" @click="isSelected && hasNotSharedToAll() && pageShareImageToAll()" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}">{{$t("common.shareToAll")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" @click="isSelected && hasSharedToAll() && pageRecallImageFromAll()" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" @click="pageChangeResourceOwner()">{{$t("common.changeResourceOwner")}}</a>
              <a v-permission="'IMAGE.DELETE'" :class="{'disabled-text': !pageCanDelete()}" @click="pageCanDelete() && pageDelete()" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
            </div>
          </span>
          </drop-down>
          <span class="btn-primary"  v-if="['destroyed'].includes(windowData.currTab)"
                :class="{'disabled': !isSelected}" @click="isSelected && pageRecover()">
          <i class="el-icon-d-arrow-left icon"></i>
          <span class="text">{{$t('common.recover')}}</span>
        </span>
          <span class="btn-primary" v-if="['destroyed'].includes(windowData.currTab)"
                :class="{'disabled': !isSelected}" @click="isSelected && pageExpunge()">
          <i class="el-icon-remove-outline icon"></i>
          <span class="text">{{$t('common.expunge')}}</span>
        </span>
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
  import vCenterImageList from 'src/vcenter/vCenterImage/List';
  export default {
    name: 'vCenterImagePage',
    mixins: [vCenterImageList]
  };
</script>

<style scoped>

</style>
