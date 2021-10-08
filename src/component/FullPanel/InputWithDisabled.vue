<template>
  <div style="clear: both;">
    <div class="title" v-permission="param.permission" :class="titleClassList">
      {{ $t(param.getTitle()) }}
      <span v-if="canShowStar()">*</span>
      <help-trigger
        style="top: 1px;"
        v-if="helpDoc"
        :name="helpDoc"
      />
    </div>
    <input
      v-show="!isDisabled"
      :type="param.isPassword ? 'password' : 'text'"
      :placeholder="placeholder"
      :title="eleTitle"
      :class="classList"
      :value="param.getValue()"
      v-permission="param.permission"
      @input="onInput($event)"
      @focus="onFocused($event)"
      @blur="updateValue"
    />
    <input
      ref="input"
      v-show="isDisabled"
      disabled="true"
      class="disabled-input"
    />
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
        value: this.param.getValue() === null ? '' : this.param.getValue(),
        isDirty: false
      }
    },
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
      if (this.param.validator) {
        this.param.validator.fn()
      }
    },
    destroyed () {
      window.removeEventListener('click', this.onWindowClick, true)
    },
    methods: {
      canShowStar () {
        if (this.param.canShowStar) {
          return this.param.canShowStar()
        }
        return false
      },
      onFocused (event) {
        if (this.isDisabled) {
          event.stopPropagation()
          event.preventDefault()
          return
        }
        this.focused = true
      },
      onInput ($event) {
        this.isDirty = true
        this.value = $event.target.value
        if (this.param.validator) {
          this.param.setValue(this.value)
          this.param.validator.fn()
        }
      },
      updateValue () {
        this.focused = false
        this.isDirty = true
        this.param.setValue(this.value)
        if (this.param.validator) {
          this.param.validator.fn()
        }
      },
      onWindowClick: function (event) {
        if (this.$el.contains(event.target)) {
          if (this.isDisabled) {
            event.stopPropagation()
            event.preventDefault()
            return
          }
          this.focused = true
        } else {
          this.focused = false
        }
      }
    },
    computed: {
      titleClassList () {
        if (this.param.getTitle() === undefined) {
          return 'hide'
        }
      },
      helpDoc () {
        if (this.param.doc) return this.param.doc
        if (this.param.getDoc) return this.param.getDoc()
        return false
      },
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
      },
      isValid () {
        if (this.param.getValidationResult !== undefined) {
          let msgInfo = this.param.getValidationResult()
          return msgInfo.isSuccess
        }
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
        if (this.param.getValidationResult !== undefined) {
          let msgInfo = this.param.getValidationResult()
          if (!msgInfo.isSuccess) return msgInfo.msg
        }
        if (this.param.validator && this.param.validator.result) {
          return this.param.validator.result.msg
        }
        return ''
      },
      classList () {
        if (this.focused) {
          return 'focused'
        }
        if (!this.isValid) {
          return 'error-border'
        }
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
  input {
    height: 40px;
    font-size: 14px;
    color: #333;
    width: calc(100% - 20px);
    border: 1px solid #dae0e6;
    padding: 0px 10px;
    border-radius: 2px;
  }

  .disabled-input {
    background: #F4F7F9;
    cursor: not-allowed;
    border: 1px solid #E2E7EB;
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
    margin-bottom: -25px;
  }

  .hide {
    display: none;
  }
</style>
