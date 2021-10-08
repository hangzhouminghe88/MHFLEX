<template>
  <div :class="`${wrapper}-wrapper`">
      <div class="container">
        <div class="create-header">
          <slot name="header"></slot>
        </div>
        <div class="create-body" :style="_style">
          <slot name="body"></slot>
        </div>
      </div>
      <div class="create-footer">
        <slot name="footer"></slot>
      </div>
  </div>
</template>

<script>
  const wrapper = "create-template-no-route";
  export default {
    name: "CreateTemplateNoRoute",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        wrapper: wrapper
      }
    },
    computed: {
      _style(){
        let self = this;
         if(self.param.style){
           return self.param.style;
         }
      }
    }
  }
</script>

<style scoped lang="less">
  .create-template-no-route-wrapper {
    animation: createfade ease-in 0.1s;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background: #fff;
    z-index: 2;

    .container {
      width: 100%;
      height: calc(100% - 100px);
      overflow-y: auto;
      margin-bottom: 20px;
      overflow-x: hidden;

      .create-header {
        border: 1px solid #ccc;
        box-shadow: 0 1px 1px #ccc;
      }

      .create-body {
        margin-top: 20px;
        padding: 0px 20px 0px 30px;
        width: 15%;
      }
    }
    .create-footer{
      position:fixed;
      height: 80px;
      line-height: 80px;
      box-shadow: 0 -1px 1px #ccc;
      width: 100%;
    }
  }

  @keyframes createfade {
    0%{
      position: absolute;
      top: -50%;
      bottom:  -50%;
      left:  -50%;
      right:  -50%;
      background: #fff;
      z-index: 2;
    }
    50%{
      position: absolute;
      top: -25%;
      bottom:  -25%;
      left:   -25%;
      right:   -25%;
      background: #fff;
      z-index: 2;
    }
    100%{
      position: absolute;
      top: -25%;
      bottom:  -25%;
      left:   -25%;
      right:   -25%;
      background: #fff;
      z-index: 2;
    }
  }
</style>
