<template>
  <div class="full-panel-input-with-unit" style="clear: both; margin-bottom: -12px;">
    <div class="full-panel-item-title" :class="titleClassList">
      {{ param.getTitle() }}:
      <span v-if="canShowStar()">*</span>
      <help-trigger style="top: 1px;" v-if="param.doc" :name="param.doc"></help-trigger>
    </div>
    <input type="number" :placeholder="placeholder" :title="eleTitle" :disabled="isDisabled" :class="classList" :value="param.getValue()" @blur="focused = false" @input="onInput($event)" @focus="focused = true"></input>
    <div class="units" v-if="param.unitList" @click="param.unitList.length > 1 && toggleSelect($event)">
      <div v-if="!show" class="text-container">
        <span class="text">{{ unit }}</span>
        <img v-if="param.unitList.length > 1" class="arrow" src="~assets/arrow_down.svg" />
      </div>
      <div class="unit" v-show="show">
        <a v-for="unit in param.unitList" @click="selectUnit($event, unit)">{{ unit }}</a>
      </div>
    </div>
    <span class="error-msg" v-if="!param.isValid">{{ param.errorMsg }}</span>
  </div>
</template>

<script>
  import Root from 'src/windows/Base/Root'

  export default {
    name: 'FullPanelInputWithUnit',
    mixins: [Root],
    props: ['param'],
    data () {
      return {
        focused: false,
        value: '',
        show: false,
        unit: this.param.unitList && this.param.unitList[0],
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
        this.value = $event.target.value
        this.param.setValue($event.target.value, this.unit)
        if (this.param.validator) {
          this.param.validator.fn()
        }
      },
      toggleSelect (e) {
        e.stopPropagation()
        this.show = !this.show
      },
      selectUnit (e, unit) {
        e.stopPropagation()
        this.unit = unit
        this.show = false
        this.param.setValue(this.value, this.unit)
      },
      onWindowClick: function (event) {
        var x = event.target
        if (this.$el.contains(event.target)) {
          this.focused = true
        } else {
          this.focused = false
        }
        if (x.tagName === 'HTML') {
          return
        }
        var result = []
        while (x.tagName !== 'BODY' && result.length === 0) {
          if (x.className === 'dropdown-content') {
            result.push(x)
          }
          x = x.parentNode
        }
        if (result.length > 0) {
          return
        }
        if (this.show) this.show = false
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
      // isValid () {
      //   if (this.param.validator && this.param.validator.result) {
      //     if (!this.param.validator.result.ignorDirty) {
      //       if (!this.isDirty) {
      //         return true
      //       }
      //     }
      //     return this.param.validator.result.isValid
      //   } else {
      //     if (!this.isDirty) return true
      //   }
      //   return true
      // },
      // errorMsg () {
      //   if (this.param.validator && this.param.validator.result) {
      //     return this.param.validator.result.msg
      //   }
      //   return ''
      // },
      classList () {
        let ret = ''
        if (this.isDisabled) {
          return 'disabled'
        } else if (!this.param.isValid) {
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
    float: left;
    font-size: 14px;
    color: #333;
    position: relative;
    /*  top: -15px;*/
    display: inline-block;
    width: calc(100% - 76px);
    border: 1px solid #dae0e6;
    padding: 5px 10px;
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
  .unit {
    float: right;
    /*  height: 40px;*/
    width: 75px;
    font-size: 14px;
    display: inline-block;
    position: absolute;
    border: 1px solid #DAE0E6;
    border-radius: 0 2px 2px 0;
    z-index: 3000;
    background: #FFFFFF;
  }
  .text-container {
    width: 75px;
    float: right;
    height: 40px;
    border: 1px solid #DAE0E6;
    border-radius: 0 2px 2px 0;
    cursor: pointer;
  }
  .unit:hover{
    cursor: pointer;
  }
  .units {
    /*  margin-left: -4px;*/
    display: inline-block;
    height: 100%;
    position: relative;
    float: left;
  }
  .text {
    display: inline-block;
    left: 20px;
    font-size: 14px;
    line-height: 40px;
    position: relative;
  }

  .arrow {
    top: 3px;
    position: relative;
    left: 20px;
  }

  .unit a {
    line-height: 40px;
    position: relative;
    text-decoration: none;
    display: block;
    color: #1A2736;
    letter-spacing: 0;
    text-align: center;
  }

  .unit a:hover {
    color: #3C73B9;
  }

  .full-panel-input-with-unit:after {
    content: " ";
    height: 0;
    visibility: hidden;
    clear: both;
    display: block;
  }
</style>
