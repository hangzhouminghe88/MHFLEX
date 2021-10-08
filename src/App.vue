<style scoped lang="less">
  .hideTopMenu {
    display: none;
  }

  .showTopMenu {
    display: block;
  }
</style>
<template>
  <div style="width: 100%;height: 100%;overflow: hidden">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: "App",
    data() {
      return {}
    }
  }
</script>
