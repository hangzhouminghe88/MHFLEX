<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left">
        <span class="text">{{$t('common.netRange') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
        <span slot="title">
          <span class="text">{{$t('common.actions')}}</span>
        </span>
          <span slot="content">
          <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
            <a v-permission="'VM_L3.ATTACH'" style="padding-top: 12px;" @click="!isSelected && param.createIpRange()" :class="{'disabled-text': isSelected}">{{$t("common.addIpRange")}}</a>
            <a v-permission="'VM_L3.DETACH'" style="padding-bottom: 12px;" @click="isSelected && pageDelete()" :class="{'disabled-text': !isSelected}">{{$t("common.deleteIpRange")}}</a>
          </div>
        </span>
        </drop-down>
      </div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right">
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
      </div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource"></mh-table>
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
  </div>
</template>

<script>
  import IpRangesTab from './IpRangesTabService';
  export default IpRangesTab;
</script>

<style scoped>

</style>
