<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left" style="position: relative">
        <span class="text">{{'DNS' + $t('common.colon')}}</span>
        <help-trigger name="flatNetworkDns" :style="{'position': 'absolute','left': '40px','top': '5px'}"/>
        <drop-down class="detail-dropdown" style="margin-left: 30px;">
        <span slot="title">
          <span class="text">{{$t('common.actions')}}</span>
        </span>
          <span slot="content">
          <div class="dropdown-content">
            <a style="padding-top: 12px;" @click="pageAddDns()">{{$t("common.addDns")}}</a>
            <a style="padding-bottom:12px;" @click="isSelected && pageDeleteDns(windowData.dataUuid)" :class="{'disabled-text': !isSelected}">{{$t("common.deleteDns")}}</a>
          </div>
        </span>
        </drop-down>
      </div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right"></div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource"></mh-table>
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
  </div>
</template>

<script>
  import DnsTab from './DnsTabService';
  export default DnsTab;
</script>

<style scoped>

</style>
