<template>
  <dialog-template style="font-size: 16px;">
    <div slot="header" class="modal-plain-header">
      <span id="vm-setVolumeQos">{{ $t("zwatchAlarm.resetStrategy") }}</span>
      <div class="modal-close" @click="cancel"></div>
    </div>
    <div slot="body">
      <div class="ip-wrapper">
        <div class="input-ip">
          <radio-button-group
            class="operation-row"
            :param="getRadioButtonGroupParam()"
          />
          <div class="operation-row" :style="{ marginTop: !dbData.common.isAdmin ? '60px' : 'auto' }" v-if="windowData.strategy === 'repeat'">
            <div class="title" v-if="!dbData.common.isAdmin">
              {{$t("common.volumeTotalBandwidth")}}
            </div>
            <div class="content-unit">
              <input :value="windowData.volumeTotalBandwidth" :class="{'error-input': windowData.emptyvolumeTotalBandwidth || windowData.invalidvolumeTotalBandwidth}" @input="(e) => { updateWindow({ 'volumeTotalBandwidth': e.target.value }) }" @blur="validate('volumeTotalBandwidth')" @keydown.enter="validate('volumeTotalBandwidth')" placeholder="1MB/s ~ 100GB/s" />
              <div class="unit">
                <dropdown class="button dropdown" style="height: 38px; width: 90px;" @click="toggleMoreDropdownDlg($event, `showMoreSize`)">
                  <span slot="title" style="display: flex; align-items: center;">
                    <span class="text">
                      {{ windowData.volumeTotalBandwidthUnit }}
                    </span>
                  </span>
                  <div slot="content">
                    <div class="dropdown-content" :class="{ 'show': windowData.showMoreSize }" style="min-width: 60px; width: 100px; text-align: center;">
                      <a v-for="item in ['KB/s', 'MB/s', 'GB/s']" @click="(e) => { updateWindow({ 'volumeTotalBandwidthUnit': item }) }" style="padding-top: 12px;">
                        {{ item }}
                      </a>
                    </div>
                  </div>
                </dropdown>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="modal-plain-footer">
      <div id="common-cancel" class="modal-button-right cancel" @click="cancel">
        {{ $t("common.cancel") }}
      </div>
      <div id="common-ok" class="modal-button-right primary" @click="ok">
        {{ $t("common.ok") }}
      </div>
    </div>
  </dialog-template>
</template>


<script>
import Vue from 'vue'
import WindowBase from 'src/windows/Window'
import Utils from 'src/utils/utils'
import Validator from 'src/utils/validator'
import FullPanelRadioButtonGroup from 'src/component/FullPanel/RadioButtonGroup'
import FullPanelInputWithUnit from 'src/component/FullPanel/InputWithUnit'

export default {
  name: 'SetAlarmStrategyDlg',
  mixins: [WindowBase, DialogBase],
  components: {
    'input-with-unit': FullPanelInputWithUnit,
    'radio-button-group': FullPanelRadioButtonGroup
  },
  data () {
    return {
      // className: 'ImageListDlg'
    }
  },
  created () {
    this.updateWindow({
      volumeTotalBandwidth: '',
      volumeTotalBandwidthUnit: 'MB/s',
      showMoreSize: false,
      showMoreReadBandWidth: false,
      showMoreWriteBandWidth: false,
      strategy: 'repeat',
      volumeReadBandwidth: '',
      volumeReadBandwidthUnit: 'MB/s',
      volumeWriteBandwidth: '',
      volumeWriteBandwidthUnit: 'MB/s'
    }).then(() => {
      if (!this.dbData.common.isAdmin) {
        this.initInNormalAccount()
      }
    })
    window.addEventListener('click', this.onWindowClick)
  },
  destroyed () {
    window.removeEventListener('click', this.onWindowClick)
  },
  methods: {
    cancel: function () {
      this.closeDialog(this.windowId)
    },
    initInNormalAccount () {
      let uuid = this.dialogData.param.uuidList[0]
      let volume = this.$store.state.volume[uuid]
      let obj = { qosMode: 'qosModeTotal' }
      if ((volume.volumeReadBandwidth > -1) || (volume.volumeWriteBandwidth > -1)) {
        obj.qosMode = 'qosModePart'
      }
      this.updateWindow(obj)
    },
    ...Validator,
    selectSize: function (size, unitName, dropName, $event) {
      let obj = {}
      let target = {}
      obj[unitName] = size
      target[dropName] = !this.windowData[dropName]
      this.updateWindow(obj)
      this.updateWindow(target)
    },
    getRadioButtonGroupParam () {
      return {
        getTitle: () => 'zwatchAlarm.strategy',
        optionList: [
          {
            value: 'repeat',
            getDisplayName: () => 'zwatchAlarm.repeat'
          },
          {
            value: 'once',
            getDisplayName: () => 'zwatchAlarm.once'
          }
        ],
        getValue: () => this.windowData.strategy,
        setValue: (value) => this.updateWindow({ strategy: value })
      }
    },
    validateQos (value, unit) {
      if (!this.isUint(value)) {
        return false
      }
      let parsedInput = this.parseNumber(value, unit)
      let range = {
        maxValue: 1024 * 1024 * 1024 * 100,
        minValue: 1024 * 1024
      }
      if (!this.isIn(parsedInput, range)) {
        return false
      }
      return true
    },
    validate (name) {
      let obj = {}
      obj[`empty${name}`] = false
      obj[`invalid${name}`] = false
      let input = String(this.windowData[name]).trim()
      if (!input) {
        obj[`empty${name}`] = true
        this.updateWindow(obj)
        return
      }
      let qos = ['volumeTotalBandwidth', 'volumeWriteBandwidth', 'volumeReadBandwidth']
      if (qos.some(item => item === name)) {
        let unit = this.windowData[`${name}Unit`]
        obj[`invalid${name}`] = !this.validateQos(input, unit)
      }
      this.updateWindow(obj)
    },
    validateAll () {
      let obj = {}
      obj.invalidInput = false
      let props = ['volumeTotalBandwidth', 'volumeWriteBandwidth', 'volumeReadBandwidth']
      props.forEach(item => this.validate(item))
      let isInvalid = props.some(item => this.windowData[`invalid${item}`] === true)
      if (isInvalid) obj.invalidInput = true
      this.updateWindow(obj)
    },
    createParam () {
      let params = []
      if (this.windowData.qosMode === 'qosModeTotal') {
        params = [{
          volumeBandwidth: this.parseNumber(this.windowData.volumeTotalBandwidth, this.windowData.volumeTotalBandwidthUnit),
          mode: 'total'
        }]
      }
      if (this.windowData.qosMode === 'qosModePart') {
        if (this.windowData.volumeWriteBandwidth !== '') {
          params.push({
            volumeBandwidth: this.parseNumber(this.windowData.volumeWriteBandwidth, this.windowData.volumeWriteBandwidthUnit),
            mode: 'write'
          })
        }
        if (this.windowData.volumeReadBandwidth !== '') {
          params.push({
            volumeBandwidth: this.parseNumber(this.windowData.volumeReadBandwidth, this.windowData.volumeReadBandwidthUnit),
            mode: 'read'
          })
        }
      }
      return params
    },
    closeAllSelect: function () {
      if (this.windowData.showMoreSize) this.updateWindow({ showMoreSize: false })
      if (this.windowData.showMoreReadBandWidth) this.updateWindow({ showMoreReadBandWidth: false })
      if (this.windowData.showMoreWriteBandWidth) this.updateWindow({ showMoreWriteBandWidth: false })
    },
    onWindowClick: function (event) {
      if (this.windowData.showMoreSize) this.updateWindow({ showMoreSize: false })
      if (this.windowData.showMoreReadBandWidth) this.updateWindow({ showMoreReadBandWidth: false })
      if (this.windowData.showMoreWriteBandWidth) this.updateWindow({ showMoreWriteBandWidth: false })
    },
    ok: function () {
      if (this.windowData.qosMode === 'qosModeTotal' && this.windowData.volumeTotalBandwidth === '') {
        this.closeDialog(this.windowId)
        return
      }
      if (this.windowData.qosMode === 'qosModePart' && this.windowData.volumeReadBandwidth === '' && this.windowData.volumeWriteBandwidth === '') {
        this.closeDialog(this.windowId)
        return
      }
      this.validateAll()
      if (this.windowData.invalidInput) return
      this.dialogData.param.ok(this.createParam())
      this.closeDialog(this.windowId)
    },
    ...Utils
  }
}
</script>

<style scoped>
.icon {
  display: inline-block;
  background-image: url('~assets/vm_plain.svg');
  height: 36px;
  width: 36px;
  margin-right: 10px;
}

.name {
  display: inline-block;
  position: relative;
  top: -12px;
  width: calc(100% - 52px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
}

.ip-wrapper {
  display: inline-block;
  width: 100%;
  height: 360px;
  vertical-align: middle;
  text-align: center;
}

.input-ip {
  width: 420px;
  height: 80px;
  margin: 30px auto;
  text-align: left;
}

.input-ip input {
  width: 420px;
  height: 40px;
  line-height: 40px;
}

.content-unit {
  height: 40px;
  font-size: 14px;
  width: 100%;
}

.content-unit input {
  height: 40px;
  font-size: 14px;
  color: #333333;
  width: calc(100% - 103px);
  padding: 12px;
  position: relative;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-right: none;
}

.content-unit .unit {
  float: right;
  height: 40px;
  width: 103px;
  position: relative;
  border: 1px solid #DAE0E6;
  border-radius: 0 2px 2px 0;
}

.content-unit .unit:hover{
  cursor: pointer;
}

.content-unit .text {
  display: inline-block;
  left: 18px;
  line-height: 40px;
  position: relative;
}

.content-unit .arrow {
  top: 3px;
  position: relative;
  left: 12px;
}

.content-unit .text-unit {
  color: #999999;
  font-size: 14px;
  display: inline-block;
  left: 20px;
  line-height: 40px;
  position: relative;
}

.content-unit .drop-size {
  position: relative;
  font-size: 0px;
  top: -41px;
  right: 1px;
  width: 60px;
  z-index: 3000;
  background: #FFFFFF;
  border-radius: 0 2px 2px 2px;
  border: 1px solid #DAE0E6;
  padding: 9px 0;
}

.content-unit .drop-size a {
  padding: 5px 20px;
  text-decoration: none;
  display: block;
  font-size: 14px;
  color: #1A2736;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
}

.content-unit .drop-size a:hover {
  color: #3C73B9;
}

</style>


// WEBPACK FOOTER //
// SetAlarmStrategyDlg.vue?6caabac5
