<template>
  <div
    class="capability-tip"
    id="capability-tip"
    :style="{
      left: `${windowData.position.left + 50}px`,
      top: `${windowData.position.top + 10}px`
    }"
    @click="($event) => {$event.stopPropagation()}"
    @mouseleave="hideTooltip($event)"
    @mousemove="moveOnTooltip($event)"
  >
    <div v-if="windowData.type === 'extraLicense'" class="license-tip">
      {{ $t("common.extraLicenseTip", {license: windowData.extra ? $t(`about.${windowData.extra.name}`) : ''}) }}<a :href="`mailto:${$t('common.salesEmail')}`">{{ $t('common.salesEmail') }}</a>
      <br />
      <a href="#/ecs/about" class="tip-more">{{ $t("common.learnMore") }}</a>
    </div>
    <div v-if="windowData.type === 'license'" class="license-tip">
      {{ $t("common.capabilityTipCurrent") }} {{ $store.state.db.common.license && $store.state.db.common.license.licenseType !== 'HybridTrialExt' ? $t("common.productionName") : '' }} {{ $store.state.db.common.license && $t(`about.${normalizeLicenceType($store.state.db.common.license.licenseType)}`) }}{{ $t("common.capabilityTipGetMore") }} <a :href="`mailto:${$t('common.salesEmail')}`">{{ $t('common.salesEmail') }}</a>
      <br />
      <a href="#/ecs/about" class="tip-more">{{ $t("common.learnMore") }}</a>
    </div>
    <p v-if="windowData.type === 'api'" class="api-tip">
      {{ $t("common.capabilityTipText") }}
    </p>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import WindowBase from 'src/windows/Window'

  export default {
    name: 'CapabilityToolTip',
    props: {
    },
    mixins: [WindowBase],
    created: function () {
      this.updateWindow({
        type: '',
        position: {
          left: 0,
          top: 0
        }
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
      hideTooltip: function ($event) {
        $event.stopPropagation()
        this.$el.style.display = 'none'
      },
      moveOnTooltip: function ($event) {
        $event.stopPropagation()
        const helpTooltip = document.querySelector('#help-tooltip')
        if (helpTooltip.style.display === 'block') helpTooltip.style.display = 'none'
      },
      ...Utils
    },
    watch: {
      'dbData.common.licenseTooltipParam': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        let value = newValue
        this.updateWindow({
          extra: value.extra,
          type: value.type,
          position: value.position
        })
      }
    }
  }
</script>
<style scoped>

  .capability-tip {
    position: absolute;
    display: none;
    left: 50px;
    top: 30px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #97A4B6;
    z-index: 9999;
    border-radius: 1px;
    padding: 14px;
    font-size: 12px;
    color: #1A2736;
    line-height: 18px;
    font-family: "MicrosoftYahei";
  }

  .license-tip {
    width: 240px;
  }

  .api-tip {
    font-size: 12px;
  }

  .capability-tip .tip-more {
    display: inline-block;
    text-decoration: initial;
    color: #3C73B9;
    margin-top: 10px;
  }

</style>
