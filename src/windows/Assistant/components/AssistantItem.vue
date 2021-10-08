<template>
  <div class="assistant">
    <assistant-content class="newLine" :item="item" />
    <assistant-button v-if="!item.data.hideButton" class="controller" :controller="item.controller" />
  </div>
</template>
<script>
import AssistantButton from './AssistantButton'
import AssistantContent from './AssistantContent'

export default {
  name: 'AssistantItem',
  props: ['item'],
  components: {
    'assistant-button': AssistantButton,
    'assistant-content': AssistantContent
  }
}
</script>
<style scoped>
.assistant {
  width: 90%;
  position: relative;
  margin-top: 10px;
  font-family: MicrosoftYaHei;
  font-size: 14px;
  color: #1A2736;
  letter-spacing: 0;
  display: inline-block;
  line-height: 14px;
  margin-bottom: 10px;
}

.controller {
  position: absolute;
  right: -14px;
  margin-left: 5px;
}

.newLine {
  float: left;
  word-break: break-all;
}

</style>



// WEBPACK FOOTER //
// AssistantItem.vue?15ba2950