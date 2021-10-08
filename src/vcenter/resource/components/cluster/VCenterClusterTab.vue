<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left" style="height:40px;line-height: 40px;">
        <span>{{$t('common.cluster')+$t('common.colon')}}</span>
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

    <div class="page-body">
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
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import VCenterClusterTabService from 'src/vcenter/resource/components/cluster/VCenterClusterTabService';

  export default {
    name: "VCenterClusterTab",
    mixins: [VCenterClusterTabService]
  }
</script>

<style scoped>

</style>
