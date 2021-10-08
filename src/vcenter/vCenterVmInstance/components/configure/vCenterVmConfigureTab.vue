<template>
  <div>
    <component :is="volumeItem.ctrl" :param="volumeItem.param"></component>
    <div class="split-line" style="width: 97%;"></div>
    <component :is="netWorkItem.ctrl" :param="netWorkItem.param"></component>
  </div>
</template>

<script>
  import vCenterVmConfigureTabService from './vCenterVmConfigureTabService';
  export default vCenterVmConfigureTabService;
</script>

<style scoped>

</style>
