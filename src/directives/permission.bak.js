// import _ from 'lodash'
import { getPolicyMap } from 'src/utils/policy'
// import { __printCallStack } from 'src/utils/utils'
/* global localStorage:false */

const capabilitiesList = {
  'INSTANCEOFFERING.ALLOCATTORSTRATEGY': true,
  'HOST.ADD': 'addHost',
  'VM.CLONE': 'clonevm',
  'STORAGE-NETWORK': true,
  'BS.IMAGESTOR': 'imagestore',
  'IPSEC': true,
  'LOG': 'log',
  'MONITORING': 'monitoring',
  'OVER.PROVISIONING': 'overProvisioning',
  'PERFORMANCE.MONITOR': 'performanceMonitor',
  // 'QOS': 'qos',
  'SET.VM.ROOT.PASSWORD': 'setVmRootPassword',
  'VMWARE': 'vmware',
  'ha.enable': true,
  'host.cpu.overProvisioning.ratio': true,
  'mevoco.overProvisioning.memory': true,
  'mevoco.overProvisioning.primaryStorage': true,
  'mevoco.vm.consoleMode': true,
  'mevoco.threshold.primaryStorage.physicalCapacity': true,
  'VM.SSH-KEY.SET': true,
  'VM.SSH-KEY.DELETE': true,
  'VM.CONSOLEMODE': true,
  'VM.CONSOLE-PASSWORD.SET': true,
  'VM.CONSOLE-PASSWORD.DELETE': true,
  'VM.HA-LEVEL': true,
  'VM.SPICE': true,
  'VM.EXPANSION': true,
  'VM.USERDATA': true,
  'VOLUME.RESIZE': true,
  'VOLUME.SET-VOLUME.QOS': true,
  'HOME.PERFORMANCE': true,
  'MONITOR-ALARM': true,
  'CREATE-INSTANCE-OFFERING.DISK-QOS': true,
  'CREATE-INSTANCE-OFFERING.NETWORK-OUTBOUND-QOS': true,
  'CREATE-INSTANCE-OFFERING.NETWORK-INBOUND-QOS': true,
  'CREATE-VOLUME-OFFERING.DISK-QOS': true,
  'CLUSTER.DISPLAYNETWORK': true,
  'VM.SET-NIC.QOS': true,
  'VM.DELETE-NIC.QOS': true,
  'VM.PASSWORD.SET': true,
  'VM.IMAGE.CHANGE': true,
  'CREATE-VOLUME.SHAREABLE': true,
  'QGA': true,
  'VM.SETMAC': true,
  'LOCALUPLOADIMAGE': true,
  'BILLING': true,
  'IDENTITY': true,
  'SHARE-RESOURCE': true,
  'SCHEDULER': true,
  'MAIN.LDAP': true,
  'HYBRID': true,
  'HYBRID.ACCESSKRY': true,
  'HYBRID.PRODUCT': true,
  'HYBRID.DATACENTER': true,
  'HYBRID.ECSWIZARD': true,
  'HYBRID.VPNWIZARD': true,
  'HYBRID.HIGHWAYWIZARD': true,
  'HYBRID.HYBRIDDAHOWIZARD': true,
  'USBREDIRECT': true,
  'PCI-DEVICE': true,
  'BAREMETAL': true,
  'BAREMETAL.INSTALL-SERVICE': true,
  'BAREMETAL.HOST-INSTALL': true,
  'IMAGE-STORE': true,
  'IMAGE.UPLOAD': true,
  'AFFINITYGROUP': true,
  'TIMER': true,
  'ROUTE-TABLE': true,
  'RDP-MODE': true,
  'STORAGE-MIGRATE': true,
  'HYBRID.BACKUP': true,
  'VPC': true,
  'VIP.QOS': true,
  'OVERVIEW': true,
  'NORMAL': true,
  'UISETTING': true,
  'VROUTERROUTEROUTTABLE': true,
  'ZWATCH': true,
  'NETWORK-TOPOLOGY': true
}

export function getLicenseCapabilities () {
  return capabilitiesList
}

function checkPermissionByName (name, context) {
  let policyMap = getPolicyMap()
  let apiList = policyMap[name]
  if (!apiList) return true
  let allow = true
  for (let i = 0; i < apiList.length; i++) {
    if (context.dbData.policy[apiList[i]] === 'Deny') {
      allow = false
      break
    }
  }
  return allow
}

function checkCapabilitiesByName (name, context) {
  if (name === 'HOST.ADD') {
    if (!context.dbData.common.license) return false
    if (context.dbData.common.license.hostNum !== undefined) {
      if (context.dbData.common.license.availableHostNum === 0) {
        return false
      } else {
        return true
      }
    } else if (context.dbData.common.license.cpuNum !== undefined) {
      if (context.dbData.common.license.availableCpuNum === 0) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  } else if (name === 'MAIN.UISETTINGS') {
    if (context.dbData.common.license && context.dbData.common.license.licenseType !== 'Community') {
      return true
    } else {
      return false
    }
  } else if (name === 'NORMAL') return true
  else if (capabilitiesList[name]) {
    return false
  }
  return true
}

function checkHybridPermissions (name, context) {
  if (name && name.indexOf('HYBRID') > -1) {
    return false
  }
  return true
}

let showTips = false
let mouseState = 'free'
let capabilityTipElm
let stopGetCapabilityTipElmInterval = setInterval(function () {
  capabilityTipElm = document.getElementById('capability-tip')
  if (!capabilityTipElm) return
  clearInterval(stopGetCapabilityTipElmInterval)
  capabilityTipElm.onmouseenter = () => {
    mouseState = 'overCapabilityTip'
  }

  capabilityTipElm.addEventListener('mouseleave', () => {
    mouseState = 'free'
  })
}, 0)

let changeHandler = function (el, binding, vnode) {
  let tipElm = document.getElementById('capability-tip')

  if (window.localStorage.getItem('loginType') === 'user') {
    let stopInterval = setInterval(function () {
      if (!vnode.context.dbData.policy.isReady) return
      clearInterval(stopInterval)
      if (!checkPermissionByName(binding.value, vnode.context)) {
        el.classList.add('permission-disabled')
        if (vnode.data.on && vnode.data.on.click) vnode.data.on.click.fn = function () {}
      } else {
        el.classList.remove('permission-disabled')
      }
    }, 0)
  }

  // if (!checkCapabilitiesByName(binding.value, vnode.context)) {
    // el.style.setProperty('pointer-events', 'none')
    // if (!vnode.context.dbData.common.isCapabilitiesReady) {
    //   console.log("el.style.setProperty('pointer-events', 'none')")
    //   el.style.setProperty('pointer-events', 'none')
    // } else {
    //   if (!vnode.context.dbData.common.isOpensource) {
    //     console.log("el.style.removeProperty('pointer-events')")
    //     el.style.removeProperty('pointer-events')
    //   } else {
    //     console.log("el.style.setProperty('pointer-events', 'none')")
    //     el.style.setProperty('pointer-events', 'none')
    //   }
    // }
  // }

  let stopCapabilityInterval = setInterval(function () {
    if (!vnode.context.dbData.common.isCapabilitiesReady) return
    clearInterval(stopCapabilityInterval)
    // if (binding.value === 'VPC') {
    //   el.style.display = 'none'
    // }
    let hideHybrid = (vnode.context.dbData.common.license.licenseType !== 'Hybrid' || localStorage.getItem('isAdmin') !== 'true') && !checkHybridPermissions(binding.value, vnode.context)
    if ((vnode.context.dbData.common.isOpensource && !checkCapabilitiesByName(binding.value, vnode.context)) || hideHybrid) {
      el.classList.add('capability-disabled')
      if (vnode.data.on && vnode.data.on.click) vnode.data.on.click.fn = function () {}
      if (vnode.data.on && vnode.data.on['!click']) vnode.data.on['!click'].fn = function () {}
      if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
        el.setAttribute('disabled', '')
      }
      el.onmouseenter = (event) => {
        event.stopPropagation()
        if (vnode.context.dbData.common.capabilityTip && vnode.context.dbData.common.capabilityTip.show) return
        tipElm.style.setProperty('display', 'block')
        event.pageX + 333 > document.body.clientWidth ? tipElm.style.left = `${document.body.clientWidth - 333}px` : tipElm.style.left = `${event.pageX + 20}px`
        tipElm.style.top = `${event.pageY + 20}px`
      }
      el.onmouseleave = (event) => {
        event.stopPropagation()
        if (tipElm.style.display !== 'block') return
        setTimeout(() => {
          if (mouseState === 'overCapabilityTip') {
            if (!capabilityTipElm.onmouseleave) {
              capabilityTipElm.onmouseleave = () => {
                capabilityTipElm.onmouseleave = null
                mouseState = 'free'
                // _.debounce(() => tipElm.style.setProperty('display', 'none'), 500)()
                tipElm.style.setProperty('display', 'none')
              }
            }
            return
          }
          tipElm.style.setProperty('display', 'none')
          // _.debounce(() => tipElm.style.setProperty('display', 'none'), 500)()
        }, 200)
      }
    } else {
      el.onmouseenter = () => {}
      el.onmouseleave = () => {}
      el.classList.remove('capability-disabled')
    }
    // setTimeout(() => {
    //   el.style.removeProperty('pointer-events')
    // }, 100)
  })
}

export default {
  bind: changeHandler,
  update: changeHandler,
  unbind: function (el) {
    mouseState = 'free'
    if (!showTips) return
    showTips = false
  }
}
