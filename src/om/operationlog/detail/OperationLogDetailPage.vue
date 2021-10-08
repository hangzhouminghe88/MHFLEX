<template>
 <detail-template>
   <div slot="header" class="detail-header">
     <span class="detail-title">操作日志详情</span>
     <span class="detail-header-item create-back" @click="$router.push({name: 'operationlog', params: {currTab: $route.params.currTab}})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px;">回到操作日志列表</span>
     </span>
   </div>
   <div slot="body" class="detail-body">
     <operation-message-detail :param="{message: model}"/>
   </div>
 </detail-template>
</template>

<script>
    import OperationLogDetailService from './OperationLogDetailService';
    export default {
      name: "OperationLogDetailPage",
      mixins: [OperationLogDetailService],
    }
</script>

<style scoped lang="less">
 .detail-body{
   .message{
     width: 100%;
     height: 100%;
   }
 }
</style>
