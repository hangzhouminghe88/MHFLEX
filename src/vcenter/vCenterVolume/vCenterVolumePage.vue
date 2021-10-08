<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.vcentervolume')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab" @tab-click="handleChangeTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
            <el-tab-pane :label="$t('common.NotInstantiated') + `(${windowData.notInstantiatedCount ? windowData.notInstantiatedCount : '0'})`" name="notInstantiated"></el-tab-pane>
            <el-tab-pane :label="$t('common.destroyed') + `(${windowData.destroyedCount ? windowData.destroyedCount : '0'})`" name="destroyed"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
     <el-row type="flex">
       <div class="page-toolbar-left">
        <span class="btn-success" v-if="currTab === 'available'" @click="goToCreate()">
          <i class="el-icon-plus"></i>
          <span class="text">{{$t('common.createVolume')}}</span>
        </span>
         <span class="btn-primary" v-if="currTab !=='destroyed'" :class="{'disabled': !isSelected || inStates('Enabled')}" @click="isSelected && !inStates('Enabled') && pageStartOrStop('enabled')">
          <i class="el-icon-caret-right icon"></i>
          <span class="text">{{$t('common.start')}}</span>
        </span>
         <span class="btn-primary" v-if="currTab !=='destroyed'" :class="{'disabled': !isSelected || inStates('Disabled')}" @click="isSelected && !inStates('disabled') && pageStartOrStop('disabled')">
          <i class="el-icon-remove-outline icon"></i>
          <span class="text">{{$t('common.stop')}}</span>
        </span>
         <drop-down class="btn-primary more dropdown" v-if="currTab !=='destroyed'" :enabled="isSelected" :class="{'disabled': !isSelected}">
          <span slot="title">
            <i class="el-icon-more"></i>
            <span class="text">{{$t('common.moreActions')}}</span>
          </span>
           <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top:12px;" v-permission="'VOLUME_VM.ATTACH'" @click="canAttach() && pageAttachToVm()" :class="{'disabled-text': !(canAttach())}">{{$t("common.attach")}}</a>
              <a v-permission="'VOLUME_VM.DETACH'" @click="canDetach() && pageDetach()" :class="{'disabled-text': !canDetach()}">{{$t("common.detach")}}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" @click="pageChangeResourceOwner">{{$t("common.changeResourceOwner")}}</a>
              <a style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'" @click="pageDelete()">{{$t("common.destroy")}}</a>
            </div>
          </span>
         </drop-down>
         <span class="btn-primary" v-if="currTab ==='destroyed'" @click="isSelected && pageRecover()" :class="{'disabled': !isSelected}">
           <i class="el-icon-d-arrow-left icon"></i>
           <span class="text">{{$t('common.recover')}}</span>
         </span>
         <span class="btn-primary" v-if="currTab === 'destroyed'" @click="isSelected && pageExpunge()" :class="{'disabled': !isSelected}">
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
  import List from 'src/vcenter/vCenterVolume/List';
  export default {
    name: 'vCenterVolumePage',
    mixins: [List]
  };
</script>

<style scoped>

</style>
