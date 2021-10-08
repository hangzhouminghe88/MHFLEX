<template>
  <div class="detail-template-container">
    <div class="detail-template-header">
      <slot name="header"></slot>
    </div>
    <div class="detail-template-content">
      <div class="detail-template-body">
        <slot name="body"></slot>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script>
  import ScrollBar from "./vue-scroller-bars/scroll-bar";

  export default {
    name: "DetailTemplate",
    components: {ScrollBar},
    data(){
      return {
        scrollTop: 0,
        scrollHeight: 0
      }
    },
  }
</script>

<style scoped lang="less">
  .detail-template-header{
    box-shadow: 0px 2px 2px #ccc;
    height: 80px;
    width: 100%;
    .el-tabs__item{
      margin-top: 10px!important;
    }
  }
  .detail-template-container{
    background: #fff;
    min-height: 100%;
  }
  .detail-template-body{
    padding: 30px 30px 0;
    position: relative;
    width: 100%;
    height: calc(100% - 60px);
  }
  .detail-template-content{
    overflow-y: auto;
    height: 90%;
    position: absolute;
    overflow-x: hidden;
    width: 100%;
    background: #fff;
  }

  .scroll{
    display: inline-block;
    position: absolute;
    right: 10px;
    width: 10px;
    background: #ddd;
    border-radius: 8px;
  }
</style>
