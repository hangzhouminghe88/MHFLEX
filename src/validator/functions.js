import _ from 'lodash'

function isRequired (value, errMsg) {
  let isValid = !notInput(value)
  let obj = { isValid }
  if (!isValid) {
    obj.errMsg = errMsg || this.$t('error.noEmpty')
  }
  return obj
}

function notInput (value) {
  if (_.isArray(value)) {
    return value.length === 0
  }
  if (_.isString(value)) {
    return value === ''
  }
  if (_.isPlainObject(value)) {
    return false
  }
  if (_.isUndefined(value) || _.isNull(value)) {
    return true
  }
  return false
}

function isInt (value, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let reg = /^\-?[0-9][0-9]*$/
  if (!reg.test(value)) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.intOnly')
  }
  return obj
}

function isGt (value, num, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let isValid = Number(value) > Number(num)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.greatThanNum', {num})
  }
  return obj
}

function isIn (value, min, max, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let isValid = Number(value) <= Number(max) && Number(value) >= Number(min)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.inRange', {min, max})
  }
  return obj
}

function isLimitedLength (value, min, max, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let isValid = value.length <= Number(max) && value.length >= Number(min)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.limitedLength', {min, max})
  }
  return obj
}

function isNumber (value, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let isValid = !isNaN(value)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.numberOnly')
  }
  return obj
}

function isCIDR (value, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let reg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/
  let isValid = reg.test(value)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.notCidr')
  }
  return obj
}

function isIP (value, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/
  let isValid = reg.test(value)
  let parts = value.split('.').sort((a, b) => a - b)
  isValid = isValid && (parts[3] <= 255)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.ipOnly')
  }
  return obj
}

function isURL (value, type, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let reg = /^((https|http|ftp)(:\/\/))|(file:\/\/\/)[^\s\u4e00-\u9fa5\u3000-\u303f]*$/
  let isValid
  if (type && type === 'image') {
    isValid = value.indexOf(' ') === -1
    reg = /^((https|http|ftp|sftp)(:\/\/))|(file:\/\/\/)[^\s\u3000-\u9fa5\u3000-\u303f]+\w*$/
  }
  isValid = isValid && reg.test(value)
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.notUrl')
  }
  return obj
}

function isPath (value, type, errMsg) {
  let obj = { isValid: true }
  if (notInput(value)) return obj
  let reg = /^(\/[.-\w]*)+$/
   // change regexp if the resource is a nfs PS
  if (type === 'nfs') {
    reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\/[-\w]*)+\/?$/
  }
  let isValid = reg.test(value)
  let systemPath = [
    '/',
    '/dev',
    '/dev/',
    '/proc',
    '/proc/',
    '/sys',
    '/sys/',
    '/usr/bin',
    '/bin'
  ]
  isValid = isValid && systemPath.indexOf(value) === -1
  isValid = isValid && value.indexOf('.') !== 1 && !value.endsWith('.')
  if (!isValid) {
    obj.isValid = false
    obj.errMsg = errMsg || this.$t('error.notUrl')
  }
  return obj
}

export default {
  isRequired,
  isIn,
  isNumber,
  isGt,
  isCIDR,
  isIP,
  isURL,
  isPath,
  isInt,
  isLimitedLength
}



// WEBPACK FOOTER //
// ./src/validator/functions.js