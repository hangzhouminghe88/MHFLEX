<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2" class="page-header-title">{{$t('common.resourcestacktemplate')}}</el-col>
        <el-col :span="4">
          <el-tabs v-model="windowData.currTab" @change="changeTab">
            <el-tab-pane v-if="dbData.common.isAdmin"  :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
            <el-tab-pane v-if="!dbData.common.isAdmin" :label="`${$t('common.mine')}(${windowData.mineCount ? windowData.mineCount : '0'})`" name="mine"></el-tab-pane>
            <el-tab-pane v-if="!dbData.common.isAdmin" :label="`${$t('common.share')}(${windowData.shareCount ? windowData.shareCount : '0'})`" name="share"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span  class="btn-success" @click="goToCreate()">
          <i class="el-icon-plus icon"></i>
          <span class="text">{{$t('resourcestacktemplate.create')}}</span>
        </span>
          <span class="btn-primary" :class="{'disabled': instates(true)}" @click="!instates(true) && pageEnable('true')">
          <i class="el-icon-caret-right icon"></i>
          <span class="text">{{$t('common.enable')}}</span>
        </span>
          <span class="btn-primary" :class="{'disabled': instates(false)}" @click="!instates(false) && pageEnable('false')">
          <i class="el-icon-remove-outline icon"></i>
          <span class="text">{{$t('common.disable')}}</span>
        </span>
          <drop-down class="more dropdown btn-primary" :enabled="isSelected" :class="{'disabled': !isSelected}">
          <span  slot="title">
            <i class="el-icon-more"></i>
            <span class="text">{{$t('common.moreActions')}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content">
              <a :class="{'disabled-text': !isSingleSelected || !instates(true)}" @click="isSingleSelected && instates(true) && openGenerateResourceStack(selectedList[0])">{{$t('resourcestacktemplate.generateResourceStack')}}</a>
              <a :class="{'disabled-text': !isSingleSelected}" @click="isSingleSelected && openModifyResourceStack(selectedList[0])">{{$t("resourcestacktemplate.modify")}}</a>
              <a v-if="dbData.common.isAdmin" id="common-shareToAll" style="padding-top:12px;" v-permission="'LICENSE_BASIC_PAID'" v-show="isAdmin" @click="isSelected && hasNotSharedToAll() && pageShareToAll()" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}">{{$t("common.shareToAll")}}</a>
              <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'" v-show="isAdmin" @click="isSelected && hasSharedToAll() && pageRecallFromAll()" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
              <a @click="pageDelete()">{{$t('common.destroy')}}</a>
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
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort" v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.description')" prop="description"></el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="String(scope.row.state)"/>
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
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import ResourceTemplateList from  './List';
  export default {
    name: "ResourceTemplatePage",
    mixins: [ResourceTemplateList]
  }
</script>

<style scoped>

</style>
