<template>
  <div class="help-wrapper normal" v-if="!windowData.disabled">
    <div :class="{'help-icon': !isShowToolTip, 'help-icon-h': isShowToolTip}" @mousemove="showTooltip($event)" @click.stop="() => false"/>
  </div>
</template>

<script>
  import _ from 'lodash'
  import WindowBase from 'src/windows/Window'
  import HelpCN from 'src/i18n/help-zh-CN'

  export default {
    name: 'HelpTrigger',
    props: {
      name: {
        type: String,
        required: true,
        validator: function (value) {
          let cnKeys = Object.keys(HelpCN.help)
          return cnKeys.some((item) => item === value)
        }
      },
      triangle: {
        type: [String, Number],
        default: 'middle',
        validator: function (value) {
          let position = ['top', 'middle', 'bottom']
          if (typeof value === 'string') {
            return position.some((item) => item === value)
          }
          return value > 0 && value < 100
        }
      },
      subList: {
        type: Array,
        required: false
      }
    },
    mixins: [WindowBase],
    created: function () {
      this.isDisabled()
      window.addEventListener('resize', this.updateTooltipPosition)
    },
    destroyed: function () {
      window.addEventListener('resize', this.updateTooltipPosition)
    },
    data () {
      return {
      }
    },
    methods: {
      isDisabled: function () {
        let disabled = false
        if (this.$lang === 'en') {
          disabled = true
        }
        this.updateWindow({
          disabled
        })
      },
      getPosition: function () {
        if (typeof (this.$el.getBoundingClientRect) === 'function') {
          return this.$el.getBoundingClientRect()
        } else {
          return { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 }
        }
      },
      init: function () {
        let tooltipParam = {
          name: this.name,
          triangle: this.triangle,
          subList: this.subList,
          position: this.getPosition()
        }
        let common = _.cloneDeep(this.dbData.common)
        common.helpTooltipParam = tooltipParam
        return this.updateDbObject({
          name: 'common',
          data: common
        })
      },
      showTooltip: function ($event) {
        $event.stopPropagation()
        this.init().then(() => {
          const helpTooltip = document.querySelector('#help-tooltip')
          helpTooltip.style.display = 'block'
          helpTooltip.style.transition = 'block 0.5s ease-in'
        })
      },
      updateTooltipPosition: function () {
        this.init()
      }
    },
    computed: {
      isShowToolTip () {
        const helpTooltip = document.querySelector('#help-tooltip')
        return helpTooltip ? helpTooltip.style.display === 'block' : '';
      }
    },
    watch: {
      $lang: function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        let disabled = false
        if (newValue === 'en') {
          disabled = true
        }
        this.updateWindow({
          disabled
        })
      }
    }
  }
</script>
<style scoped>

  .help-wrapper {
    width: 18px;
    height: 18px;
  }

  .help-wrapper.normal {
    position: absolute;
    top: 20px;
    right: 5px;
  }

  .help-icon {
    width: 18px;
    height: 18px;
    cursor: help;
    background-image: url('~assets/help.svg');
  }

  .help-icon-h {
    width: 18px;
    height: 18px;
    cursor: pointer;
    background-image: url('~assets/help_highlight.svg');
  }

  .help-icon:hover {
    background-image: url('~assets/help_highlight.svg');
  }

</style>
