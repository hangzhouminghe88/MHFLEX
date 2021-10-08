<template>
  <div>
    <div class="full-panel-item-title" :class="titleClassList">
      {{ $t(param.getTitle()) }}:
      <span v-if="canShowStar()">*</span>
      <help-trigger style="top: 1px;" v-if="param.doc" :name="param.doc"></help-trigger>
    </div>
    <input :type="param.isPassword ? 'password' : 'text'" :placeholder="placeholder" :title="eleTitle" :disabled="isDisabled" :class="classList" :value="param.getValue()" @input="onInput($event)" @focus="focused = true" @blur="focused = false"></input>
    <span class="error-msg" v-if="!isValid">{{ errorMsg }}</span>
  </div>
</template>

<script>
  import Root from 'src/windows/Root'

  export default {
    name: 'FullPanelInput',
    mixins: [Root],
    props: ['param'],
    data () {
      return {
        focused: false,
        isDirty: false
      }
    },
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
      if (this.param.validator) {
        this.param.validator.fn()
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick, true)
    },
    methods: {
      canShowStar () {
        if (this.param.canShowStar) {
          return this.param.canShowStar()
        }
        return false
      },
      onInput ($event) {
        this.isDirty = true
        this.param.setValue($event.target.value)
        if (this.param.validator) {
          this.param.validator.fn()
        }
      },
      onWindowClick: function (event) {
        if (this.$el.contains(event.target)) {
          this.focused = true
        } else {
          this.focused = false
        }
      }
    },
    computed: {
      titleClassList () {
        if (this.isDisabled) {
          return 'disabled-title'
        }
      },
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
      },
      isValid () {
        if (this.param.validator && this.param.validator.result) {
          if (!this.param.validator.result.ignorDirty) {
            if (!this.isDirty) {
              return true
            }
          }
          return this.param.validator.result.isValid
        } else {
          if (!this.isDirty) return true
        }
        return true
      },
      errorMsg () {
        if (this.param.validator && this.param.validator.result) {
          return this.param.validator.result.msg
        }
        return ''
      },
      classList () {
        let ret = ''
        if (this.isDisabled) {
          return 'disabled'
        } else if (!this.isValid) {
          ret = 'error-border'
        } else if (this.focused) {
          ret = 'focused'
        }
        return ret
      },
      placeholder () {
        if (this.param.getPlaceholder) {
          return this.param.getPlaceholder()
        }
        return ''
      },
      eleTitle () {
        if (this.param.getEleTitle) {
          return this.param.getEleTitle()
        }
        return ''
      }
    },
    watch: {
    }
  }
</script>
<style scoped>
  .full-panel-item-title {
    position: relative;
    font-size: 14px;
    color: #5e6978;
    margin-bottom: 10px;
  }
  .disabled-title {
    display: inline-block;
  }
  input {
    height: 40px;
    font-size: 14px;
    color: #333;
    width: calc(100% - 20px);
    border: 1px solid #dae0e6;
    padding: 0px 10px;
    border-radius: 2px;
  }

  .disabled {
    width: auto;
    background-color: #fff;
    border: none;
  }

  .focused {
    border-color: #0088EF;
  }
  .error-border {
    border-color: #ec5960;
  }
  .error-msg {
    font-size: 12px;
    float: right;
    color: #EC5960;
    padding-top: 5px;
  }
</style>
