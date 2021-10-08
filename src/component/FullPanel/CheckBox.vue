<template>
  <div style="clear: both;">
    <div class="full-panel-item-title" v-if="canShowTitle">
      {{ param.getTitle() }}:
      <span v-if="canShowStar()">*</span>
      <help-trigger v-if="param.doc" :name="param.doc"></help-trigger>
    </div>
    <div class="full-panel-item-body">
      <span :style="{cursor: isDisabled ? 'not-allowed' : 'pointer'}" class="icon-container"
            v-permission="param.permission">
        <!--<img class="full-panel-checkbox-icon" v-if="!isDisabled && param.getValue()"-->
             <!--src="~assets/checkbox_selected.svg">-->
        <!--<img class="full-panel-checkbox-icon" v-if="!isDisabled && !param.getValue()" src="~assets/checkbox_normal.svg">-->
        <!--<img class="full-panel-checkbox-icon" v-if="isDisabled" src="~assets/checkbox_d.svg"/>-->
        <el-checkbox v-model="param.getValue()" @change="onClick()" :disabled="isDisabled">{{ param.getDescription() }}</el-checkbox>
      </span>
      <help-trigger style="top: 1px;" v-if="param.doc && !canShowTitle" :name="param.doc"></help-trigger>
    </div>
    <div class="full-panel-item-warning" v-if="param.getWarning">{{ param.getWarning() }}</div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: "CheckBox",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: ''
      }
    },
    methods: {
      canShowStar () {
        if (this.param.canShowStar) {
          return this.param.canShowStar()
        }
        return false
      },
      onClick () {
        if (this.isDisabled) return
        this.param.setValue(!this.param.getValue())
      },
      onWindowClick: function (event) {
      }
    },
    computed: {
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
      },
      canShowTitle () {
        if (this.param.getTitle && this.param.getTitle()) {
          return true
        }
        return false
      }
    }
  }
</script>

<style scoped>

</style>
