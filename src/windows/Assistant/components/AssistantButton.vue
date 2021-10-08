<template>
  <div class="container">
    <a @click="controller.handler()" class="assistant-operation">{{$t(`common.${controller.name}`)}}</a>
  </div>
</template>
<script>
export default {
  name: 'AssistantButton',
  props: ['controller']
}
</script>
<style scoped>
.container {
  display: inline-block;
/*  width: 100%;*/
}
.assistant-operation {
  text-align: right;
  display: inline-block;
  color: #3C73B9;
  cursor: pointer;
/*  float: right;*/
}
</style>


// WEBPACK FOOTER //
// AssistantButton.vue?7a3b61d0