<template>
  <div class="detail-row">
    <div class="detail-title">
      <span>{{ $t(param.title)}}{{$t("common.colon")}}</span>
    </div>
    <div class="detail-container">
      <detail-name :param="param"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Input",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    }
  }
</script>

<style scoped>

</style>
