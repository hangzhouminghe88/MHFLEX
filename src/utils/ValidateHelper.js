// import Vue from 'vue'
import _ from 'lodash'
import validator from './validator'

let genValidator = (valueName, validatorList, self) => {
  let result = {
    ignorDirty: false,
    isValid: true,
    msg: ''
  }
  let fn = () => {
    result.isValid = true
    let value = self[valueName]
    for (let i in validatorList) {
      let ret
      if (_.isString(validatorList[i])) {
        ret = exportObj[validatorList[i]](value, self)
      } else if (_.isArray(validatorList[i])) {
        ret = exportObj[validatorList[i][0]](value, self)
        ret.msg = validatorList[i][1]
      } else if (_.isObject(validatorList[i])) {
        ret = validatorList[i].fn(value)
      }
      if (!ret.isValid) {
        result.isValid = ret.isValid
        result.msg = ret.msg
        break
      }
    }
  }

  return {
    result,
    fn
  }
}

let genValidatorForDeep = (valueList, validatorList, self) => {
  let result = {
    ignorDirty: false,
    isValid: true
  }
  let fn = () => {
    // if (valueName === 'instanceOfferingUuid')
    result.isValid = true
    let value = self
    valueList.forEach((item) => {
      value = value[item]
    })
    for (let i in validatorList) {
      let ret
      if (_.isString(validatorList[i])) {
        ret = exportObj[validatorList[i]](value, self)
      } else if (_.isArray(validatorList[i])) {
        ret = exportObj[validatorList[i][0]](value, self)
        ret.msg = validatorList[i][1]
      } else if (_.isObject(validatorList[i])) {
        ret = validatorList[i].fn()
      }
      if (!ret.isValid) {
        result.isValid = ret.isValid
        result.msg = ret.msg
        break
      }
    }
  }

  return {
    result,
    fn
  }
}

let noEmpty = (value, self) => {
  let isValid = false
  if (_.isUndefined(value) ||
    _.isNull(value) ||
    value === '') {
    isValid = false
  } else {
    isValid = true
  }

  let retObj = {
    isValid
  }
  if (!isValid) {
    retObj.msg = self.$t('error.noEmpty')
  }
  return retObj
}

let numberOnly = (value, self) => {
  if (!value) return { isValid: true }
  let ret = {
    isValid: true
  }
  if (!validator.isNumber(value)) {
    ret.isValid = false
    ret.msg = self.$t('error.numberOnly')
  }
  return ret
}

let isIp = (value, self) => {
  let ret = {
    isValid: true
  }
  if (!validator.isIP(value)) {
    ret.isValid = false
    ret.msg = self.$t('error.ipOnly')
  }
  return ret
}

let isMAC = (value, self) => {
  let ret = noEmpty(value, self)
  if (!ret.isValid) return { isValid: true }
  ret = {
    isValid: true
  }
  if (!validator.isMAC(value)) {
    ret.isValid = false
    ret.msg = self.$t('error.macOnly')
  }
  return ret
}

let lessThan24 = (value, self) => {
  let ret = intOnly(value, self)
  if (!ret.isValid) return ret
  ret = greaterThan0(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  if (parseInt(value) >= 24) {
    ret.isValid = false
    ret.msg = self.$t('error.lessThanNum', {num: 24})
  }
  return ret
}

let intOnly = (value, self) => {
  let ret = numberOnly(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  let reg = /^\-?[0-9][0-9]*$/
  if (!reg.test(value)) {
    ret.isValid = false
    ret.msg = self.$t('error.intOnly')
  }
  return ret
}

let greaterThan0 = (value, self) => {
  let ret = numberOnly(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  if (parseFloat(value) <= 0.0) {
    ret.isValid = false
    ret.msg = self.$t('error.greaterThan0')
  }
  return ret
}

let isIn1To1000 = (value, self) => {
  let ret = numberOnly(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  if (parseFloat(value) < 1 || parseFloat(value) > 1000) {
    ret.isValid = false
    ret.msg = self.$t('error.inRange', { min: '1', max: '1000' })
  }
  return ret
}

let greaterThan10 = (value, self) => {
  let ret = numberOnly(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  if (parseFloat(value) <= 10.0) {
    ret.isValid = false
    ret.msg = self.$t('error.greaterThan10')
  }
  return ret
}

let lessThanOrEqualTo100 = (value, self) => {
  let ret = numberOnly(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  if (parseFloat(value) > 100) {
    ret.isValid = false
    ret.msg = self.$t('error.lessThanOrEqualTo100')
  }
  return ret
}

let ipOnly = (value, self) => {
  if (!value) return { isValid: true }
  let isValid = false
  let reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/
  if (!reg.test(value)) {
    isValid = false
  }
  let parts = value.split('.').sort(function (a, b) {
    return a - b
  })
  isValid = parts[3] <= 255
  let ret = { isValid }
  if (!isValid) {
    ret.msg = self.$t('error.ipOnly')
  }
  return ret
}

let macOnly = (value, self) => {
  if (!value) return { isValid: true }
  let isValid = false
  let reg = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/
  isValid = reg.test(value)
  let ret = { isValid }
  if (!isValid) {
    ret.msg = self.$t('error.invalid') + self.$t('vm.vmNicMAC')
  }
  return ret
}

let validateQosInV2V = (value, self) => {
  if (!value) return { isValid: true }
  let ret = intOnly(value, self)
  if (!ret.isValid) return ret
  ret = greaterThan0(value, self)
  if (!ret.isValid) return ret
  ret = {
    isValid: true
  }
  if (parseInt(value) < 8 * 1024 || parseInt(value) > 32 * 1024 * 1024 * 1024) {
    ret.isValid = false
    ret.msg = self.$t('error.inRangeForV2VQos')
  }
  return ret
}

let exportObj = {
  genValidator,
  genValidatorForDeep,
  isMAC,
  'no-empty': noEmpty,
  isIp,
  lessThan24,
  'number-only': numberOnly,
  'int-only': intOnly,
  'greater-than-0': greaterThan0,
  'is-in-1-to-1000': isIn1To1000,
  'greater-than-10': greaterThan10,
  'less-than-or-equal-to-100': lessThanOrEqualTo100,
  'ip-only': ipOnly,
  'mac-only': macOnly,
  'validateQosInV2V': validateQosInV2V
}

export default exportObj
