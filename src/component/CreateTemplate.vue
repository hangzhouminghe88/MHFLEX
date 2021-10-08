<template>
  <div class="create-template-container">
    <div class="create-template-content">
      <div class="create-template-header">
        <slot name="header"></slot>
      </div>
      <div class="create-template-body">
        <slot name="body"></slot>
      </div>
    </div>
    <div class="create-template-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
    import ScrollBar from "./vue-scroller-bars/scroll-bar";
    export default {
        name: "CreateTemplate",
      components: {ScrollBar}
    }
</script>

<style scoped lang="less">
  .create-template-header{
    box-shadow: 1px 0px 1px #ccc;
    border-bottom: 1px solid #ccc;
  }
  .create-template-container{
    background: #fff;
    min-height: 100%;
  }
  .create-template-body{
    padding: 0px 30px;
  }
  .create-template-content{
    height: calc( 100% -  100px);
    overflow-y: auto;
    margin-bottom: 20px;
    position: absolute;
    width: 100%;
  }
  .create-template-footer{
    position:fixed;
    height: 80px;
    line-height: 80px;
    box-shadow: 0 -1px 1px #adb0b8;
    width: 100%;
    bottom: 0px;
    background: #fff;
  }
</style>
