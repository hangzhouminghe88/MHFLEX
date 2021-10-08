function isIP (str) {
  // let reg = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  let reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/
  if (!reg.test(str)) {
    return false
  }
  let parts = str.split('.').sort(function (a, b) {
    return a - b
  })
  return parts[3] <= 255
}

function trimProp (name) {
  let value = String(this.windowData[name]).trim()
  let obj = {}
  obj[name] = value
  this.updateWindow(obj)
  return value
}

function isMAC (str) {
  let reg = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/
  return reg.test(str)
}

function isIPV6IP (str) {
  let reg = /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*/
  return reg.test(str)
}

function isIPV6Cidr (str) {
  let reg = /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))$/
  return reg.test(str)
}

function isCidr (str) {
  // let parts = str.split('/')
  // if (!this.isIP(parts[0]) || parts.length !== 2) {
  //   return false
  // }
  // if (isNaN(parts[1]) || Number(parts[1]) < 0 || Number(parts[1]) > 32) {
  //   return false
  // }
  let reg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/
  return reg.test(str)
}

function isValidNetMask (ip) {
  let validNetMaskList = [
    '255.255.255.255',
    '255.255.255.254',
    '255.255.255.252',
    '255.255.255.248',
    '255.255.255.240',
    '255.255.255.224',
    '255.255.255.192',
    '255.255.255.128',
    '255.255.255.0',
    '255.255.254.0',
    '255.255.252.0',
    '255.255.248.0',
    '255.255.240.0',
    '255.255.224.0',
    '255.255.192.0',
    '255.255.128.0',
    '255.255.0.0',
    '255.254.0.0',
    '255.252.0.0',
    '255.248.0.0',
    '255.240.0.0',
    '255.224.0.0',
    '255.192.0.0',
    '255.128.0.0',
    '255.0.0.0',
    '254.0.0.0',
    '252.0.0.0',
    '248.0.0.0',
    '240.0.0.0',
    '224.0.0.0',
    '192.0.0.0',
    '128.0.0.0',
    '0.0.0.0']
  if (validNetMaskList.indexOf(ip) > -1) {
    return true
  } else {
    return false
  }
}

function isUrl (str, name) {
  let reg = /^((https|http|ftp)(:\/\/))|(file:\/\/\/)[^\s\u4e00-\u9fa5\u3000-\u303f]*$/
  // change regexp if the resource is a image
  if (name && name === 'image') {
    if (str.indexOf(' ') > -1) return false
    reg = /^((https|http|ftp|sftp)(:\/\/))|(file:\/\/\/)[^\s\u3000-\u9fa5\u3000-\u303f]+\w*$/
  }
  if (!reg.test(str)) {
    return false
  }
  return true
}

function isPhoneNumber (str) {
  let reg = /^\+((?:9[679]|8[035789]|6[789]|5[90]|42|3[578]|2[1-689])|9[0-58]|8[1246]|6[0-6]|5[1-8]|4[013-9]|3[0-469]|2[70]|7|1)(?:\W*\d){0,13}\d$/
  if (!reg.test(str)) {
    return false
  }
  return true
}

function isValidName (name) {
  if (name.length <= 128) return true
  return false
}

function isBucketName (name) {
  let reg = /^[a-z\-0-9]+$/
  if (name && reg.test(name)) {
    if ((name.length > 3) && (name.length < 63)) {
      if (name.indexOf('-') !== 0 && (name.indexOf('-') !== (name.length - 1))) {
        return true
      }
    }
  }
  return false
}

function isDNSDomainName (str) {
  let reg = /(?:http(?:s)?:\/\/)?(?:www\.)?(.*?)\./
  return reg.test(str)
}

function isEcsInstanceName (name) {
  let reg = /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5_a-zA-Z0-9.-]+$/
  if (name && reg.test(name)) {
    if ((name.length >= 2) && (name.length <= 128)) {
      return true
    }
  }
  return false
}

function isAliyunSnapshotName (name) {
  let reg = /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5_a-zA-Z0-9.-]+$/
  if (!reg.test(name)) {
    return false
  }
  return true
}

function isPath (str, name) {
  let reg = /^(\/[.-\w]*)+$/
  // change regexp if the resource is a nfs PS
  if (name && name === 'nfs') {
    reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\/[-\w]*)+\/?$/
  }
  if (!reg.test(str)) {
    return false
  }
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
  if (systemPath.indexOf(str) > -1) {
    return false
  }
  if ((str.indexOf('.') === 1) || str.endsWith('.')) {
    return false
  }
  return true
}

function isPort (port) {
  let reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
  return reg.test(port)
}

function isUint (str, unit) {
  if (isNaN(str)) {
    return false
  }
  let reg = /^\+?[1-9][0-9]*$/
  if (!reg.test(str)) {
    return false
  }
  return this.isOverInt(unit ? str + unit : str)
}

function isIn (str, range) {
  let number = Number(str)
  if (number <= range.maxValue && number >= range.minValue) {
    return true
  }
  return false
}

function isEmail (str) {
  let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  if (!reg.test(str)) return false
  return true
}

function isNumber (str) {
  if (isNaN(str)) {
    return false
  }
  return true
}

function isEcsPassword (str) {
  let reg = /^[a-zA-Z0-9]{6}$/
  return reg.test(str)
}

function isEcsRootPassword (password) {
  let passwdRegex = "()`~!@#$^&*-+=|{}[]:;'<>,.?/%%"
  let index = 0
  let types = 0
  if (password.length < 8 || password.length > 30) return false
  while (index < password.length) {
    let p = password.charAt(index)
    if (/[0-9]/.test(p)) { // isDigit
      types |= 1
    } else if (/[a-z]/.test(p)) { // isLowerCase
      types |= 2
    } else if (/[A-Z]/.test(p)) { // isUpperCase
      types |= 4
    } else if (passwdRegex.indexOf(p) !== -1) {
      types |= 8
    }
    index += 1
  }
  if (types !== 7 && types !== 11 && types !== 13 && types !== 14 && types !== 15) {
    return false
  }
  return true
}

function isPoolName (str) {
  let reg = /^[-#A-Za-z0-9_]+$/
  return reg.test(str)
}

function ValidateIPRange (subnet, netmask, startIP, endIP) {
  let subnetBin = _ipToBin(startIP)
  let netmaskBin = _ipToBin(netmask)
  let networkLength = _getNetworkLength()
  let startIPnum = ip2number(startIP)
  let endIPnum = ip2number(endIP)
  let subnetNetBit = ''
  let subnetHostBit = ''
  let broadcastHostBit = ''

  this.isInRange = function (startIP) {
    this.getNetwork()
    let targetIPNetworkBin = _ipToBin(startIP)
    let targetIPNetBit = targetIPNetworkBin.substr(0, networkLength)
    let targetIPHostBit = targetIPNetworkBin.substr(networkLength)
    // network address and subnet
    if (targetIPNetBit === subnetNetBit && targetIPHostBit !== subnetHostBit && targetIPHostBit !== broadcastHostBit) {
      return true
    } else {
      return false
    }
  }

  this.isInStartAndEndIP = function (subnet) {
    let targetIPNum = ip2number(subnet)
    if ((targetIPNum < startIPnum) || (targetIPNum > endIPnum)) {
      return false
    } else {
      return true
    }
  }

  this.getNetwork = function () {
    let networkBin = _andOpration(subnetBin, netmaskBin)
    subnetNetBit = networkBin.substr(0, networkLength)
    subnetHostBit = networkBin.substr(networkLength)
    broadcastHostBit = subnetHostBit.replace(/0/g, '1')
    return _binToIp(networkBin)
  }

  this.getBroadcast = function () {
    this.getNetwork()
    let broadcastBin = subnetNetBit + broadcastHostBit
    return _binToIp(broadcastBin)
  }

  function _getNetworkLength () {
    let length = 0
    for (let i = 0; i < 32; i++) {
      if (netmaskBin.charAt(i) === '1') {
        length++
      } else {
        break
      }
    }
    return length
  }

  function _andOpration (ipBin, netmaskBin) {
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += (parseInt(ipBin.charAt(i)) & parseInt(netmaskBin.charAt(i)))
    }
    return result
  }

  function _ipToBin (ip) {
    let subIpArray = ip.split('.')
    let ipBin = ''
    for (let i = 0; i < subIpArray.length; i++) {
      ipBin += _binCompletion(parseInt(subIpArray[i]).toString(2))
    }
    return ipBin
  }

  function _binToIp (bin) {
    let ip = ''
    for (let i = 0; i < bin.length; i += 8) {
      ip += ('.' + parseInt(bin.substr(i, 8), 2))
    }
    ip = ip.substr(1)
    return ip
  }

  function _binCompletion (subBin) {
    let complBin = subBin
    if (subBin.length < 8) {
      let length = subBin.length
      for (let i = 0; i < (8 - length); i++) {
        complBin = '0' + complBin
      }
    }
    return complBin
  }

  // function number2ip (number) {
  //   let byte1 = number & 0xff
  //   let byte2 = (number & 0xff00)
  //   byte2 >>>= 8
  //   let byte3 = (number & 0xff0000)
  //   byte3 >>>= 16
  //   let byte4 = (number & 0xff000000)
  //   byte4 >>>= 24
  //   let result = byte4 + '.' + byte3 + '.' + byte2 + '.' + byte1
  //   return result
  // }
  if (this.isInRange(subnet) && !this.isInStartAndEndIP(subnet)) {
    return false
  } else {
    return true
  }
}

function ip2number (ip) {
  let tokens = ip.split('.')
  let numval = 0
  let num
  for (num in tokens) {
    numval = (numval << 8) + parseInt(tokens[num])
  }
  return numval
}

function isOverInt (sizeStr) {
  var K = 1024
  var M = K * K
  var G = M * K
  var T = G * K
  var P = T * K
  var quantity = String(sizeStr).substr(sizeStr.length - 1, 1)
  var size = parseFloat(sizeStr)
  if (quantity === 'K' || quantity === 'k') {
    return size * K < 9007199254740992
  } else if (quantity === 'M' || quantity === 'm') {
    return size * M < 9007199254740992
  } else if (quantity === 'G' || quantity === 'g') {
    return size * G < 9007199254740992
  } else if (quantity === 'T' || quantity === 't') {
    return size * T < 9007199254740992
  } else if (quantity === 'P' || quantity === 'p') {
    return size * P < 9007199254740992
  } else {
    return parseInt(sizeStr) < 9007199254740992
  }
}

function isOfferingSize (sizeStr) {
  var K = 1024
  var M = K * K
  var G = M * K
  var T = G * K
  var P = T * K
  var quantity = sizeStr.substr(sizeStr.length - 1, 1)
  var size = parseFloat(sizeStr)
  if (quantity === 'K' || quantity === 'k') {
    return size * K < 9223372036854775807
  } else if (quantity === 'M' || quantity === 'm') {
    return size * M < 9223372036854775807
  } else if (quantity === 'G' || quantity === 'g') {
    return size * G < 9223372036854775807
  } else if (quantity === 'T' || quantity === 't') {
    return size * T < 9223372036854775807
  } else if (quantity === 'P' || quantity === 'p') {
    return size * P < 9223372036854775807
  } else {
    return parseInt(sizeStr) < 9223372036854775807
  }
}

function validateGateway (gateway, startIP, endIP, isIPV6IP = false) {
  let isInvalid = false
  if (!isIPV6IP) {
    isInvalid = ip2number(gateway) >= ip2number(startIP) && ip2number(gateway) <= ip2number(endIP)
  } else {
    isInvalid = !(compareIPv6IP(startIP, gateway) || compareIPv6IP(gateway, endIP))
  }
  return isInvalid
}

function compareIPv6IP (ip1, ip2) { // if ip1 > ip2 return true else return false
  let ip1Parts = initIPv6IP(ip1)
  let ip2Parts = initIPv6IP(ip2)
  let result = false
  for (let i = 0; i < ip2Parts.length; i++) {
    if (parseInt(ip2Parts[i]) > parseInt(ip1Parts[i])) break
    if (parseInt(ip1Parts[i]) > parseInt(ip2Parts[i])) {
      result = true
      break
    }
  }
  return result
}

function ValidateIPv6IPRange (startIP, endIP) {
  let startIPParts = initIPv6IP(startIP)
  let endIPParts = initIPv6IP(endIP)
  let isInvalid = false
  for (let i = 0; i < endIPParts.length; i++) {
    if (parseInt(endIPParts[i]) > parseInt(startIPParts[i])) break
    if (parseInt(startIPParts[i]) > parseInt(endIPParts[i])) {
      isInvalid = true
      break
    }
  }
  return isInvalid
}

function initIPv6IP (ip) {
  let ipParts = ip.split(':')
  if (ipParts.length < 8) {
    let emptyIndex = findAll(ipParts, '')
    while (ipParts.length < 8) {
      emptyIndex.forEach((index) => {
        ipParts.splice(index, 0, '0000')
      })
    }
  }
  ipParts.forEach((item, index) => {
    if (item === '') ipParts[index] = '0000'
  })
  return ipParts
}

function findAll (array, value) {
  let list = []
  array.forEach((item, index) => {
    if (item === value) list.push(index)
  })
  return list
}

export default {
  isIP,
  isIPV6IP,
  isIPV6Cidr,
  isCidr,
  isBucketName,
  isEcsInstanceName,
  isUrl,
  isUint,
  isIn,
  isPath,
  isEmail,
  isNumber,
  isValidName,
  isValidNetMask,
  isEcsPassword,
  isEcsRootPassword,
  ValidateIPRange,
  isPoolName,
  trimProp,
  isOfferingSize,
  isOverInt,
  isAliyunSnapshotName,
  isPort,
  isMAC,
  isPhoneNumber,
  isDNSDomainName,
  ValidateIPv6IPRange,
  initIPv6IP,
  validateGateway,
  compareIPv6IP
}
