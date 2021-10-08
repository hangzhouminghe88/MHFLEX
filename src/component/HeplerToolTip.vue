<template>
  <div id="help-tooltip"
       class="help-tooltip-wrapper"
       :style="{
      transform: `translateY(-${setTrianglePosition()}%)`,
      left: `${windowData.position.left + 20}px`,
      top: `${windowData.position.top + 10}px`
    }"
       @mouseleave="hideTooltip($event)"
       @mousemove="($event) => {$event.stopPropagation()}">

    <!--   <div class="help-icon-copy" :style="{ top: `${setTrianglePosition()}%` }" /> -->

    <div class="help-tooltip">
      <div class="triangle" :style="{ top: `${setTrianglePosition()}%` }" />
      <div class="help-content" v-if="!windowData.subList">
        <h3 v-html="windowData.name && $t(`help.${windowData.name}.head`)"></h3>
        <pre v-html="windowData.name && $t(`help.${windowData.name}.content`)"></pre>
      </div>
      <div class="help-content" v-if="windowData.subList">
        <div v-for="subDocName of windowData.subList" style="margin-bottom: 10px;">
          <h3 v-html="subDocName && $t(`help.${subDocName}.head`)"></h3>
          <pre v-html="subDocName && $t(`help.${subDocName}.content`)"></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import WindowBase from 'src/windows/Window'

  export default {
    name: 'HelpToolTip',
    props: {
    },
    mixins: [WindowBase],
    created: function () {
      this.updateWindow({
        name: '',
        position: {
          left: 0,
          top: 0
        },
        triangle: 'middle'
      })
      window.addEventListener('mousemove', this.hideTooltip)
    },
    destroyed: function () {
      window.addEventListener('mousemove', this.hideTooltip)
    },
    data () {
      return {
      }
    },
    methods: {
      setTrianglePosition: function () {
        let top = ''
        let triangle = this.windowData.triangle
        switch (triangle) {
          case 'top':
            top = '20'
            break
          case 'middle':
            top = '50'
            break
          case 'bottom':
            top = '80'
            break
          default:
            top = triangle
        }
        return top
      },
      hideTooltip: function ($event) {
        $event.stopPropagation()
        if (!this.$el) return
        this.$el.style.display = 'none';
        this.$el.style.transition = 'display 0.5s ease-out';
      }
    },
    watch: {
      'dbData.common.helpTooltipParam': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        let value = newValue
        this.updateWindow({
          name: value.name,
          position: value.position,
          triangle: value.triangle,
          subList: value.subList
        })
      }
    }
  }
</script>
<style scoped>

  .help-tooltip-wrapper {
    position: absolute;
    padding-left: 20px;
    display: none;
    z-index: 8000;
  }

  .help-tooltip {
    position: relative;
    left: 7.5px;
    top: 0;
    border: 0.7px solid #DAE0E6;
    background-color: #fff;
    box-shadow: 0 3px 20px 0 rgba(226,232,240,0.50);
    border-radius: 2px;
  }

  .help-icon-copy {
    position: absolute;
    content: '';
    width: 18px;
    height: 18px;
    background-color: #fff;
    background-image: url('~assets/help_highlight.svg');
    background-repeat: no-repeat;
    left: -20px;
    transform: translateY(-10px);
    cursor: pointer;
  }

  .help-tooltip .triangle {
    content: '';
    width: 15px;
    display: block;
    height: 15px;
    position: absolute;
    border: 0.7px solid #DAE0E6;
    left: -7.5px;
    transform: translateY(-7.5px) rotate(45deg);
    box-shadow: 0 3px 20px 0 rgba(226,232,240,0.50);
    background-color: #303133;
  }

  .help-content {
    position: relative;
    min-height: 120px;
    padding: 20px;
    height: 100%;
    width: 100%;
    box-shadow: 1px 0px 2px #ccc, 0px -1px 2px #ccc;
    transition: all 0.5s ease-in-out;
    background: #303133;
    color: #FFF;
    border-radius: 3px;
  }

  .help-content h3 {
    color: #FFF;
    font-size: 18px;
    line-height: 26px;
  }

  .help-content pre {
    margin-top: 10px;
    width: 360px;
    color: #FFF;
    font-size: 14px;
    line-height: 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

</style>
