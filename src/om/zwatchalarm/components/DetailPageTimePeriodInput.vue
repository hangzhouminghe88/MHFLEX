<template>
  <div class="time-period-input-container">
    <div class="time-period-input-item">
      <input :value="hour" @input="(e) => { this.hour = e.target.value; }" @keydown.enter="valueChangeHandler()" />
      <div class="content-unit">
        <span class="unit-text">{{$t('common.hourShort')}}</span>
      </div>
    </div>
    <div class="time-period-input-item">
      <input :value="min" @input="(e) => { this.min = e.target.value; }" @keydown.enter="valueChangeHandler()" />
      <div class="content-unit">
        <span class="unit-text">{{$t('common.minuteShort')}}</span>
      </div>
    </div>
    <div class="time-period-input-item">
      <input :value="sec" @input="(e) => { this.sec = e.target.value; }" @keydown.enter="valueChangeHandler()" />
      <div class="content-unit">
        <span class="unit-text">{{$t('common.secondShort')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Utils from 'src/utils/utils'
import Validator from 'src/utils/validator'
import WindowBase from 'src/windows/Window'
export default {
  mixins: [WindowBase],
  name: 'TimePeriodInput',
  props: ['param'],
  data () {
    return {
      hour: 0,
      min: 0,
      sec: 0,
      isInvalidHour: false,
      isInvalidMin: false,
      isInvalidSec: false,
      empty: false,
      invalid: false
    }
  },
  created () {
    this.hour = this.param.time ? this.secToTime(this.param.time).hour : 0
    this.min = this.param.time ? this.secToTime(this.param.time).min : 0
    this.sec = this.param.time ? this.secToTime(this.param.time).sec : 0

    window.addEventListener('click', this.onWindowClick)
  },
  destroyed () {
    window.removeEventListener('click', this.onWindowClick)
  },
  computed: {
  },
  methods: {
    ...Validator,
    getPeriodUpdateObj () {
      let periodValue = (parseInt(this.hour) * 3600) + (parseInt(this.min) * 60) + parseInt(this.sec)
      return periodValue
    },
    validate () {
      let periodValue = this.getPeriodUpdateObj()
      this.empty = false
      if (!String(this.hour).trim() && !String(this.min).trim() && !String(this.sec).trim()) {
        this.empty = true
        return
      }
      this.invalid = false
      if (!this.componentValidate('hour') || !this.componentValidate('min') || !this.componentValidate('sec') || periodValue === 0) {
        this.invalid = true
        return
      }
    },
    componentValidate (name) {
      if (name === 'hour') {
        if (this.isUint(this.hour) || parseInt(this.hour) === 0) return true
      }
      if (name === 'min') {
        if ((this.isUint(this.min) || parseInt(this.min) === 0) && this.min < 60) return true
      }
      if (name === 'sec') {
        if ((this.isUint(this.sec) || parseInt(this.sec) === 0) && this.sec < 60) return true
      }
      return false
    },
    onWindowClick (event) {
      let x = event.target
      if (x.tagName === 'HTML') {
        return
      }
      let result = []
      if (x.id === 'edit-icon-' + this.param.name) return
      while (x.tagName !== 'BODY' && result.length === 0) {
        let className = x.className.baseVal || x.className
        var index = String(className).indexOf('time-period-input-item')
        if (index !== -1) {
          result.push(x)
        }
        x = x.parentNode
        if (x === null) break
      }
      if (result.length > 0) {
        return
      }
      this.valueChangeHandler()
    },
    valueChangeHandler () {
      this.validate()
      if (this.param.name === 'repeatInterval' && this.param.parent.editRepeatInterval) {
        this.param.parent.editRepeatInterval = false
      }
      if (this.param.name === 'period' && this.param.parent.editPeriod) {
        this.param.parent.editPeriod = false
      }
      if (this.empty || this.invalid) {
        return
      }
      if (this.param.name === 'repeatInterval') {
        this.param.parent.newRepeatInterval = this.getPeriodUpdateObj()
        this.param.parent.updateAlarm('repeatInterval', this.param.parent.newRepeatInterval)
      }
      if (this.param.name === 'period') {
        this.param.parent.newPeriod = this.getPeriodUpdateObj()
        this.param.parent.updateAlarm('period', this.param.parent.newPeriod)
      }
    },
    ...Utils
  }
}
</script>

<style scoped>
.time-period-input-container {
  height: 24px;
  font-size: 14px;
  margin-left: 137px;
  margin-right: 60px;
  color: #333333;
  width: auto;
  border: 1px solid #DAE0E6;
  border-radius: 2px;
  padding: 0 0 0 0;
}
.time-period-input-item {
  position: relative;
  float: left;
  width: 33.33%;
  height: 100%;
  border: none;
}
.time-period-input-item input {
  border: none;
  width: 60%;
  height: 100%;
  float: left;
  text-align: center;
}
.content-unit {
  width: 40%;
  height: 100%;
  float: left;
  text-align: center;
  background-color: #F1F4F7;
  display: flex;
  justify-content: center;
  align-items: center;
}
.unit-text{
  font-size: 14px;
  display: inline-block;
  position: relative;
  color: #97A4B6;
}
</style>


// WEBPACK FOOTER //
// DetailPageTimePeriodInput.vue?22b08032
