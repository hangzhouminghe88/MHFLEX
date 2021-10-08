<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="3">
          <span class="page-header-title">{{$t('common.sysresourcestacktemplate')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs>
            <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : '0'})`"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-primary" :class="{'disabled': instates(true)}" @click="!instates(true) && pageEnable(true)">
            <i class="el-icon-caret-right icon"></i>
            <span class="text">{{$t('common.enable')}}</span>
          </span>
          <span class="btn-primary" :class="{'disabled': instates(false)}" @click="!instates(false) && pageEnable(false)">
            <i class="el-icon-remove-outline icon"></i>
            <span class="text">{{$t('common.disable')}}</span>
          </span>
          <drop-down class="more dropdown btn-primary" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more icon"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a  @click="isSingleSelected && instates(true) && openGenerateResourceStack(selectedList[0])" :class="{ 'disabled-text': !isSingleSelected || !instates(true) }">{{$t('resourcestacktemplate.generateResourceStack')}}</a>
              </div>
            </span>
          </drop-down>
          <help-trigger name="resourceStackTemplate" :style="{'position': 'relative', 'display': 'inline-block', 'top': '5px'}"/>
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
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort" v-loading="windowData.loading" tooltip-effect="light">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name.replace(/ZStack\./g, '')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.description')" prop="description" sortable  show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="String(scope.row.state)"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="ownerName"></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
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
  </page-template>
</template>

<script>
  import SysResourceStackTemplateList from './List';
  export default {
    name: "SysResourceStackTemplatePage",
    mixins: [SysResourceStackTemplateList]
  }
</script>

<style scoped>

</style>
