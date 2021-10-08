<template>
  <div :class="prefix">
    <div class="page-header">
     <slot name="page-header"></slot>
    </div>
    <div class="page-body">
      <div class="page-toolbar">
        <slot name="page-toolbar"></slot>
      </div>
      <div class="page-table-container">
        <slot name="page-table-content"></slot>
      </div>
    </div>
    <slot name="page-footer"></slot>
  </div>
</template>

<script>
  const prefix = "page-template";
  export default {
    name: "PageTemplate",
    data() {
      return {
        prefix: prefix
      }
    }
  }
</script>

<style scoped lang="less">
  @prefix: ~'page-template';
  .@{prefix}{
    width: 100%;
    height: 100%;
    background: #fff;
    overflow-y: auto;
    overflow-x: hidden;
    .page-header {
      height: 60px;
      line-height: 60px;
      border-bottom: 1px solid #ccc;
      padding: 10px 20px;
      background: #fff;
    }
    .page-toolbar{
      height: 60px;
      line-height: 35px;
      background: #fff;
    }
    .page-table-container{
      width: calc(100% - 40px);
      background: #fff;
      height: calc(100% - 120px);
      padding: 0px 20px 0px 20px;
    }
    .page-body{
      background: #fff;
      height: calc(100% - 120px);
    }
  }
</style>
