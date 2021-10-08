<template>
  <div style="width: 94%;">
    {{ item.data.getContent(item) }}
  </div>
</template>
<script>
export default {
  name: 'AssistantContent',
  props: ['item']
}
</script>


// WEBPACK FOOTER //
// AssistantContent.vue?55de1c25