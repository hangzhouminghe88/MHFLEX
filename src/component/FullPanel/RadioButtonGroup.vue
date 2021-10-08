<template>
  <div>
    <div class="full-panel-item-title">
      {{ $t(param.getTitle()) }}:
      <span v-if="canShowStar()">*</span>
    </div>
    <div class="options">
      <div v-for="option in param.optionList" class="option" :style="{cursor: !canNotClick(option) ? 'pointer' : 'not-allowed'}" @click="!canNotClick(option) && onClick(option.value)">
        <span class="icon-container">
          <img class="radio" v-if="option.value === param.getValue() && !canNotClick(option) " src="~assets/radio_selected.svg" />
          <img class="radio" v-if="option.value !== param.getValue() && !canNotClick(option)" src="~assets/radio_normal.svg" />
          <img class="radio" v-if="canNotClick(option)" src="~assets/sys_radio_button_d.svg" />
        </span>
        <span class="radio-button-text">{{ $t(option.getDisplayName()) }}</span>
        <span v-if="canNotClick(option) && option.getWarning" class="radio-button-text-warning">{{ $t(option.getWarning()) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import Root from 'src/windows/Root'

  export default {
    name: 'FullPanelRadioButtonGroup',
    mixins: [Root],
    props: ['param'],
    data () {
      return {
      }
    },
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
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
      onClick (value) {
        if (this.isDisabled) return
        this.param.setValue(value)
      },
      canNotClick (option) {
        if (option.isDisabled) return option.isDisabled()
        else return false
      },
      onWindowClick: function (event) {
      }
    },
    computed: {
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
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

  .options {
    overflow: hidden;
    width: 420px;
    height: 30px;
  }

  .option {
    float: left;
    cursor: pointer;
    margin-right: 82px;
    display: flex;
  }

  .icon-container {
    width: 30px;
  }

  .radio-button-text {
    line-height: 28px;
    font-size: 14px;
  }
  .radio-button-text-warning {
    position: absolute;
    top: 80px;
    font-size: 10px;
    color: #EC5960;
  }
</style>
