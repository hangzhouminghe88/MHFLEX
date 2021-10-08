<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2" class="page-header-title">{{$t('common.vcentervminstance')}}</el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab" @tab-click="changeCurrTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"
              name="available"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.destroyed')}(${windowData.destroyedCount ? windowData.destroyedCount : '0'})`"
              name="destroyed"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
     <el-row type="flex">
       <div class="page-toolbar-left">
         <span class="btn-success" v-if="windowData.currTab=== 'available'" @click="goToCreate()">
          <i class="el-icon-plus icon"></i>
          <span class="text">{{$t('vm.create')}}</span>
        </span>
         <span class="btn-primary" :class="{'disabled': !isSelected || inStates('Running','Paused', 'VolumeMigrating', 'Migrating')}"
               @click="isSelected && !inStates('Running','Paused', 'VolumeMigrating', 'Migrating') && pageStart()"
               v-if="windowData.currTab=== 'available'">
          <i class="el-icon-caret-right icon"></i>
          <span class="text">{{$t('common.start')}}</span>
        </span>
         <span class="btn-primary" :class="{'disabled': !isSelected || inStates('Stopped', 'Starting')}" @click="isSelected && !inStates('Stopped') && pageStop()"
               v-if="windowData.currTab=== 'available'">
          <i class="el-icon-remove-outline icon"></i>
          <span class="text">{{$t('common.stop')}}</span>
        </span>
         <drop-down class="btn-primary dropdown more" :enabled="isSelected" :class="{'disabled': !isSelected}"
                    v-if="windowData.currTab=== 'available'">
          <span slot="title">
            <i class="el-icon-more"></i>
            <span class="text">{{$t('common.moreActions')}}</span>
          </span>
           <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top:12px;" v-permission="'VM.REBOOT'" @click="!(!isSelected || !inStates('Running')) && pageReboot()" :class="{ 'disabled-text': !isSelected || !(inStates('Running'))}">{{ $t("common.reboot") }}</a>
              <a v-permission="'VM.PAUSE'" @click="!(!isSelected || !inStates('Running') && inStates('Stopped', 'Paused')) && pagePause()" :class="{ 'disabled-text': (!isSelected || !inStates('Running'))}">{{ $t("vm.pause") }}</a>
              <a v-permission="'VM.RESUME'" @click="isSelected && inStates('Paused') && pageResume()" :class="{ 'disabled-text': (!isSelected || !inStates('Paused'))}">{{ $t("vm.resume") }}</a>
              <a v-permission="'VM.MIGRATE'" @click="isSingleSelected && inStates('Running') && pageMigrate()" :class="{ 'disabled-text': !isSingleSelected || !inStates('Running')}">{{ $t("vm.migrate") }}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="isSingleSelected && canClone(selectedList[0]) && pageClone()" :class="{ 'disabled-text': !(isSingleSelected && canClone(selectedList[0]))}">{{ $t("vm.clone") }}</a>
              <a @click="isSelected && inStates('Running', 'Paused') && pagePowerOff()" :class="{ 'disabled-text': (!isSelected || !inStates('Running', 'Paused'))}">{{ $t("common.forcestop") }}</a>
              <a v-permission="'VM_INSTANCE-OFFERING.CHANGE'" @click="!(!isSelected || !inStates('Stopped')) && pageChangeInstanceOffering()" :class="{ 'disabled-text': (!isSelected || !inStates('Stopped'))}">{{ $t("common.changeConfig") }}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" v-show="dbData.common.isAdmin" @click="inStates('Running', 'Stopped') && pageChangeResourceOwner()" :class="{ 'disabled-text': !inStates('Running', 'Stopped')}">{{ $t("vm.changeOwner") }}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="inStates('Stopped', 'Running') && pageSetHaLevel()" :class="{ 'disabled-text': !inStates('Stopped', 'Running')}">{{ $t("identity.VM.HA-LEVEL") }}</a>
              <a v-permission="'CONSOLE-ACCESS.REQUEST'" @click="(isSingleSelected && inStates('Running')) && pageOpenConsole()" :class="{ 'disabled-text': !(isSingleSelected && inStates('Running'))}">{{ $t("vm.console") }}</a>
              <a v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']" @click="(isSingleSelected && inStates('Running', 'Stopped')) && !consolePasswordIsSet(selectedList[0]) && pageSetVmConsolePassword()" :class="{ 'disabled-text': !(isSingleSelected && inStates('Running', 'Stopped')) || consolePasswordIsSet(selectedList[0])}">{{ $t("common.setConsolePassword") }}</a>
              <a  v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']" @click="(isSingleSelected && inStates('Running', 'Stopped')) && consolePasswordIsSet(selectedList[0]) && pageDeleteVmConsolePassword()" :class="{ 'disabled-text': !(isSingleSelected && inStates('Running', 'Stopped') && consolePasswordIsSet(selectedList[0]))}">{{ $t("common.deleteConsolePassword") }}</a>
              <a v-permission="'VOLUME_VM.ATTACH'" @click="(isSingleSelected && inStates('Running', 'Stopped')) && loadVolume()" :class="{ 'disabled-text': !(isSingleSelected && inStates('Running', 'Stopped'))}">{{ $t("vm.volume.attach") }}</a>
              <a v-permission="'VOLUME_VM.DETACH'" @click="enableDetachVolume() && unloadVolume()" :class="{ 'disabled-text': !enableDetachVolume()}">{{ $t("vm.volume.detach") }}</a>
              <a @click="pageDelete()" style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
            </div>
          </span>
         </drop-down>
         <span class="btn-primary" v-if="windowData.currTab=== 'destroyed'"
               :class="{'disabled': !isSelected}" @click="isSelected && pageRecover()">
           <i class="el-icon-d-arrow-left icon"></i>
           <span class="text">{{$t('common.recover')}}</span>
         </span>
         <span class="btn-primary" v-if="windowData.currTab=== 'destroyed'"
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
      <mh-table :data-source="dataSource" v-if="windowData.currTab === 'available'" :loading="windowData.loading"></mh-table>
      <mh-table :data-source="dataDestroyedSource" v-if="windowData.currTab === 'destroyed'" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>

    <div slot="page-footer">
      <vm-clone v-if="showVmClone" :param="vmCloneParam" @close="showVmClone = false;"></vm-clone>
    </div>
  </page-template>
</template>

<script>
  import List from 'src/vcenter/vCenterVmInstance/List';
  export default {
    name: "VCenterVmInstancePage",
    mixins: [List],
  }
</script>

<style scoped>

</style>
