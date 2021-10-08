<template>
  <div>
    <div v-if="!isDisabled" class="operation-row">
      <div class="title">
        <span class="text" :class="{'required': param.canShowStar()}" v-text="param.getTitle()"></span>
        <help-trigger v-if="param.help" :name="param.help"></help-trigger>
      </div>
      <div class="content" :class="classList" @click="onClickItem()">
        {{ param.getValue() }}
        <div class="add" v-if="canAdd"></div>
        <div class="delete" v-if="canDelete" @click="deleteResource($event)"></div>
      </div>
      <span class="link network-config" v-if="showNetworkConfig()" @click.stop="param.onClickNicConfig">{{ $t("vm.vmNicConfig") }}</span>
      <span class="error error-text" v-if="!isValid">{{ errorMsg }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "L3NetWorkSinglePicker",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
      }
    },
    methods: {
      showNetworkConfig() {
        let self = this;
        //如果属性中有showNetworkConfig可配置直接判断
        if (this.param.showNetworkConfig) {
          return this.param.showNetworkConfig()
        }
        //默认为可配置
        return true
      },
      onClickItem() {
        //如果是禁用状态的话讲不能打开如果是链接将可以操作
        if (this.isDisabled) {
          if (this.param.getIsLink && this.param.getIsLink()) {
            return this.param.onClickLink()
          }
        }
        this.param.open()
      },
      deleteResource($event) {
        let self = this;
        if (self.isDisabled) {
          return;
        }
        self.param.delete();
      },
    },
    computed: {
      classList() {

      },
      isDisabled() {
        let self = this;
        //如果缺少getDisabled属性证明可以操作
        if (!self.param.getDisabled) return false;
        return self.param.getDisabled;
      },
      canAdd() {
        let self = this;
        //如果isDisabled为false的话证明可以添加
        if (self.isDisabled) return false;
        //当输入框中的值为空的时候可以添加
        return !this.param.getValue()
      },
      canDelete() {
        let self = this;
        if (self.isDisabled) return false;
        //当输入框中有值的话可以删除
        return !!this.param.getValue();
      },
      //校验三层网络
      isValid () {
        try {
          return this.param.validator.result.isValid
        } catch (e) {
          return true
        }
      },
      //错误提示
      errorMsg () {
        if (this.param.validator && this.param.validator.result) {
          return this.param.validator.result.msg
        }
        return ''
      },
    }
  }
</script>

<style scoped>
  .network-config {
    text-align: right;
    display: inline-block;
    width: 100%;
  }
</style>
