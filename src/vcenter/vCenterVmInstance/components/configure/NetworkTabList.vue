<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div class="page-toolbar-left">
        <span>{{$t('l2network.nicName') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a v-permission="'VM_L3.ATTACH'" style="padding-top: 12px;" @click="canAttach() && attach()" :class="{ 'disabled-text': !canAttach()}">{{$t("common.attach")}}</a>
              <a style="padding-bottom: 12px;" v-permission="'VM_L3.DETACH'" @click="isSelected && inStates(['Stopped', 'Running']) && detach()" :class="{ 'disabled-text': !(isSelected && inStates(['Stopped', 'Running']))}">{{$t("common.detach")}}</a>
            </div>
          </span>
        </drop-down>
      </div>
    </div>
    <div class="page-table-content">
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort">
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            <span class="link">{{scope.row.internalName}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.default')">
          <template slot-scope="scope">
            <el-radio v-model="scope.row.l3NetworkUuid" @change="changeDefault(scope.row.uuid)" :label="scope.row.l3NetworkUuid">&nbsp</el-radio>
          </template>
        </el-table-column>
        <el-table-column :label="$t('perf.networkData')">
          <template slot-scope="scope">
            <span class="link">{{dbData.l3network[scope.row.l3NetworkUuid] && dbData.l3network[scope.row.l3NetworkUuid].name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'MAC'" prop="mac"></el-table-column>
        <el-table-column :label="'ip'">
          <template slot-scope="scope">
            <div v-if="scope.row.isStatic === true">
              {{scope.row.ip ? `${scope.row.ip}(${$t('common.static')})` : $t('common.empty')}}
            </div>
            <div v-if="scope.row.isStatic === false ||scope.row.isStatic === undefined">
              {{scope.row.ip ? `${scope.row.ip}(${$t('common.dynamic')})` : $t('common.empty')}}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
    import NetworkTabList from './NetworkTabListService';
    export default NetworkTabList;
</script>

<style scoped>

</style>
