<template>
  <div>
    <div class="content">{{ data.data.getContent() }}</div>
    <div v-if="data.data.restriction === 'License'" class="buttonList">
      <a class="grey" @click="ignoreIt">{{ $t('assistant.ignored') }}</a><a @click="goToAbout" class="blue">{{ $t('assistant.moreDetails') }}</a>
    </div>
    <div v-if="data.data.restriction === 'Project'" class="buttonList">
      <a class="blue" style="left: 220px;" @click="ignoreIt">{{ $t('assistant.gotIt') }}</a>
    </div>
  </div>
</template>
<script>
import Root from 'src/windows/Root'
export default {
  name: 'TempAssistantForLicense',
  props: ['data'],
  mixins: [Root],
  methods: {
    ignoreIt (e) {
      this.deleteGlobalAssistant(this.data.data.restriction)
      e.stopPropagation()
    },
    goToAbout (e) {
      this.$router.push('/main/about')
      e.stopPropagation()
    }
  }
}
</script>
<style scoped>
.content {
  position: relative;
  margin-top: 10px;
  font-family: MicrosoftYaHei;
  font-size: 14px;
  color: #1A2736;
  letter-spacing: 0;
  line-height: 20px;
  margin-bottom: 10px;
}
.grey {
  color: #97A4B6;
}
.blue {
  color: #007FDF;
}
.buttonList {
  margin-bottom: 5px;
}
.buttonList a {
  display: inline-block;
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  position: relative;
  left: 140px;
  margin-right: 20px;
  cursor: pointer;
}
</style>


// WEBPACK FOOTER //
// AssistantTempManager.vue?14de4b48
