<template>
  <div class="loading-container">
    <div class="el-loading-spinner"></div>
  </div>
</template>

<script>
  export default {
    name: "Loading",
    props: {
      color: String,
      default: ''
    }
  }
</script>

<style scoped>
  .loading{
    border: 5px dotted;
    border-radius: 50%;
    -webkit-animation: 2s loading linear infinite;
    animation: 2s loading linear infinite;
    width: 30px;
    height: 30px;
    display: inline-block;
    transform: translate(-50%, -50%);
    position: absolute;
    left: 50%;
    top: 50%;
  }
  @-webkit-keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  .loading-container{
    background: rgba(255,255,255,.9);
    z-index: 3;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
