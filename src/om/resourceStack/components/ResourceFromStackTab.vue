<template>
  <div class="container">
    <div class="page-toolbar-container" style="display:flex;">
      <span class="page-toolbar-left">{{$t('resourcestack.event')}}</span>
      <span class="page-toolbar-center"></span>
      <span class="page-toolbar-right"></span>
    </div>
    <ul class="header">
      <li v-for="(column, index) in columns" :class="`column${index}`">{{$t(`${column.name}`)}}</li>
    </ul>
    <div v-for="(items, i) in allTypeResources" :key="i">
      <ul class="body" v-for="(data, index) in items.resources" :class="`column${index}`">
        <li v-if="index === 0">{{getResourceType(data, items.type)}}</li>
        <li :class="{'link': getResourceDetailPath(item ,items.type) !== '' }">{{item.name}}</li>
        <li>{{formatDatetime(new Date(item.createDate))}}</li>
      </ul>
    </div>
    <div v-if="allTypeResources.length <=0" class="empty-content">暂无数据</div>
    <div class="page-table-pagination">
      <el-pagination v-if="allTypeResources.length >0"
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
</template>

<script>
  import ResourceFromStackTabService from './ResourceFromStackTabService';

  export default {
    name: "ResourceFromStackTab",
    mixins: [ResourceFromStackTabService]
  }
</script>

<style scoped lang="less">
  .header, .body {
    display: inline-flex;
    border-bottom: 1px solid #dae0e6;
    width: 97%;
    font-size: 16px;

    li {
      list-style: none;
      flex: 1 1 auto;
      vertical-align: top;
      padding: 20px 0px;
    }
  }

  .pre-content {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .empty-content {
    text-align: center;
    padding: 20px;
    width: 100%;
  }
</style>
