<template>
  <div class="time-period-input-container">
    <div class="time-period-input-item">
      <input :value="hour" @input="(e) => { this.hour = e.target.value; _updateWindow(getPeriodUpdateObj()) }" @blur="validate(param.name)" @keydown.enter="validate('period')" />
      <div class="content-unit">
        <span class="unit-text">{{$t('common.hourShort')}}</span>
      </div>
    </div>
    <div class="time-period-input-item">
      <input :value="min" @input="(e) => { this.min = e.target.value; _updateWindow(getPeriodUpdateObj()) }" @blur="validate(param.name)" @keydown.enter="validate('period')" />
      <div class="content-unit">
        <span class="unit-text">{{$t('common.minuteShort')}}</span>
      </div>
    </div>
    <div class="time-period-input-item">
      <input :value="sec" @input="(e) => { this.sec = e.target.value; _updateWindow(getPeriodUpdateObj()) }" @blur="validate(param.name)" @keydown.enter="validate('period')" />
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
  props: ['param', 'parentWindowUuid'],
  data () {
    return {
      hour: 0,
      min: 0,
      sec: 0,
      isInvalidHour: false,
      isInvalidMin: false,
      isInvalidSec: false
    }
  },
  computed: {
  },
  methods: {
    ...Validator,
    getPeriodUpdateObj () {
      let periodValue = (parseInt(this.hour) * 3600) + (parseInt(this.min) * 60) + parseInt(this.sec)
      let updatePeriodObj = {id: this.parentWindowUuid}
      updatePeriodObj[this.param.name] = periodValue
      return updatePeriodObj
    },
    validate (name, nameInComponent) {
      let obj = {id: this.parentWindowUuid}
      let periodValue = (parseInt(this.hour) * 3600) + (parseInt(this.min) * 60) + parseInt(this.sec)
      obj[`empty${name}`] = false
      if (!String(this.hour).trim() && !String(this.min).trim() && !String(this.sec).trim()) {
        obj[`empty${name}`] = true
        this._updateWindow(obj)
        return
      }
      obj[`invalid${name}`] = false
      if (!this.componentValidate('hour') || !this.componentValidate('min') || !this.componentValidate('sec') || periodValue === 0) {
        obj[`invalid${name}`] = true
        this._updateWindow(obj)
        return
      }
      this._updateWindow(obj)
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
    ...Utils
  }
}
</script>

<style scoped>
.time-period-input-container {
  height: 40px;
  font-size: 14px;
  color: #333333;
  width: 100%;
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
// TimePeriodInput.vue?09f11a22
