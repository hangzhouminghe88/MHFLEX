<template>
  <div class="detail-row editable">
    <div class="detail-title">
      <span v-permission="param.permission" v-if="param.title"></span>
      <span v-permission="param.permission" v-else>{{ param.getTitle() }}{{$t("common.colon")}}</span>
      <help-trigger v-if="param.doc"
                    :name="param.doc"
                    style="
          position: relative;
          top: 0;
          display: inline-block;
          vertical-align: middle;
          left: 0;"/>
    </div>
    <div class="detail-container" v-if="showSwitch">
      <el-switch v-model="param && param.getValue()"
                 :active-text="param && param.getRightText()"
                 :inactive-text="param && param.getLeftText()"
                 :disabled="disabled"
                 @change="handleSwitchChange"></el-switch>
    </div>
  </div>
</template>

<script>
  import Root from 'src/windows/Root';
  import _ from 'lodash'

  export default {
    name: "DetailSwitch",
    mixins: [Root],
    props: {
      param: {
        type: Object,
        default:{}
      }
    },
    methods: {
      //改变Switch的回调
      handleSwitchChange(){
        let self = this;
        let value = !self.param.getValue()
        if (self.disabled) return
        self.param.setValue(!value)
      }
    },
    computed:{
      //是否展是Switch如果showSwitch未定义则展示，否则按照showSwitch来判断是否展示
      showSwitch () {
        let self = this;
        if (!_.isUndefined(self.param.showSwitch)) return self.param.showSwitch
        return true
      },
      //判断Swtich是否可操作
      disabled(){
        let self = this;
        if(_.isUndefined(self.param.disabled)) return false;
        return self.param.disabled;
      }
    }
  }
</script>

<style scoped>

</style>
