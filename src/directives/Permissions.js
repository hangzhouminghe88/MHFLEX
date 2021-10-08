import _ from 'lodash'
import Name2Api from '../Constants/Name2Api.json'

function getApiPermission (name, ctx) {
  let api = Name2Api[name]
  if (api === undefined) {
    return true
  }
  if (_.keys(ctx.dbData.policy).length === 0) {
    return true
  }
  let policy = ctx.dbData.policy
  if (policy[api] === undefined) {
    return true
  }
  let permission = policy[api].allow
  return permission
}

function type2Constant (type) {
  let obj = {
    Community: 'LICENSE_BASIC_COMMUNITY',
    Paid: 'LICENSE_BASIC_PAID',
    Hybrid: 'LICENSE_BASIC_HYBRID',
    HybridTrialExt: 'LICENSE_BASIC_HYBRID',
    Backup: 'LICENSE_EXTRA_BACKUP',
    Prepaid: 'LICENSE_BASIC_PAID'
  }
  return obj[type]
}

function getLicenseCapability (name, currLicense) {
  let license = type2Constant(currLicense)
  const capabilities = {
    'LICENSE_BASIC_COMMUNITY': ['LICENSE_BASIC_COMMUNITY'],
    'LICENSE_BASIC_PAID': ['LICENSE_BASIC_PAID', 'LICENSE_BASIC_COMMUNITY'],
    'LICENSE_BASIC_HYBRID': ['LICENSE_BASIC_COMMUNITY', 'LICENSE_BASIC_PAID', 'LICENSE_BASIC_HYBRID']
  }
  if ((currLicense !== 'Hybrid' && currLicense !== 'HybridTrialExt') && name === 'LICENSE_BASIC_HYBRID') return false
  if (!license || !capabilities[license]) return true
  let capability = capabilities[license].some(item => item === name)
  return capability
}

function module2license (_module) {
  let obj = {
    'project-management': 'LICENSE_EXTRA_COMPANY',
    'disaster-recovery': 'LICENSE_EXTRA_BACKUP',
    'baremetal': 'LICENSE_EXTRA_BAREMETAL'
  }
  return obj[_module]
}

function getModuleCapability (license, moduleLicenses, moduleName) {
  if (moduleLicenses.every(item => item !== moduleName)) {
    return false
  }
  return true
}

function getBaremetalCapability (license, moduleLicenses) {
  if (moduleLicenses.every(item => item !== 'LICENSE_EXTRA_BAREMETAL')) {
    return false
  }
  return true
}

function isExtraLicenseExpired (extraLicense, ctx = this) {
  if (!ctx.dbData.common.addonLicenses) return false
  let modules = ctx.dbData.common.addonLicenses
  let moduleLicenses = modules.map(item => module2license(item.modules[0]))
  if (moduleLicenses.every(item => item !== extraLicense)) {
    return false
  }
  let expired
  modules.forEach(item => {
    if (module2license(item.modules[0]) === extraLicense) {
      expired = item.expired
    }
  })
  return expired
}

function getLicenseExtraCapability (name, currLicense, ctx) {
  if (currLicense === 'Trial') return true
  if (!ctx.dbData.common.addonLicenses) return false
  let modules = ctx.dbData.common.addonLicenses
  let moduleLicenses = modules.map(item => module2license(item.modules[0]))
  let license = type2Constant(currLicense)
  let capabilities = {
    'LICENSE_EXTRA_COMPANY': getModuleCapability(license, moduleLicenses, name),
    'LICENSE_EXTRA_BACKUP': getModuleCapability(license, moduleLicenses, name),
    'LICENSE_EXTRA_BAREMETAL': getBaremetalCapability(license, moduleLicenses)
  }
  if (capabilities[name] === undefined) return false
  let capability = capabilities[name]
  return capability
}

function hideModule (el) {
  el.classList.add('permission-hidden')
}

function showModule (el) {
  if (el.classList.contains('permission-hidden')) {
    el.classList.remove('permission-hidden')
  }
}

function disableModule (el, vnode) {
  el.classList.add('capability-disabled')
  if (vnode.data.on) {
    if (vnode.data.on.click) {
      vnode.data.on.click.fn = function () {}
    }
    if (vnode.data.on['!click']) {
      vnode.data.on['!click'].fn = function () {}
    }
  }
  if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
    el.setAttribute('disabled', '')
  }
}

function enableModule (el, vnode) {
  if (el.classList.contains('capability-disabled')) {
    el.classList.remove('capability-disabled')
  }
  if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
    el.removeAttribute('disabled', '')
  }
}

function attachToolTip (el, vnode, type, licenseName) {
  let ctx = vnode.context
  let setToolTipParam = () => {
    let pos = el.getBoundingClientRect()
    // set position of tooltip as DOMRect is readonly
    let position = {}
    position.top = pos.top
    position.bottom = pos.bottom
    position.left = pos.left
    position.right = pos.right
    position.x = pos.x
    position.y = pos.y
    position.height = pos.height
    position.width = pos.width
    let tooltipParam = {
      type,
      position
    }
    if (licenseName) {
      tooltipParam['extra'] = {
        name: licenseName
      }
    }
    // 270 is the width of tooltip
    let difference = 270 + position.right - document.documentElement.clientWidth
    if (difference > 0) {
      tooltipParam.position.left -= difference + 10
    }

    let common = _.cloneDeep(ctx.dbData.common)
    common.helpTooltipParam = tooltipParam
    return ctx.updateDbObject({
      name: 'common',
      data: common
    })
  }
  let showTooltip = ($event) => {
    $event.stopPropagation()
    setToolTipParam()
    .then(() => {
      const tooltip = document.querySelector('#capability-tip')
      tooltip.style.display = 'block'
    })
  }
  if (el.onmousemove === showTooltip) return
  el.onmousemove = showTooltip
}

function detachTooltip (el) {
  if (el.onmousemove !== null) {
    el.onmousemove = null
  }
}

function handleExtraPermission (el, binding, vnode, permissions) {
  let extraPermissions = permissions.filter(item => item.type === 'module')
  extraPermissions.forEach(item => {
    let isExpired = isExtraLicenseExpired(item.name, vnode.context)
    if (isExpired && isExpired !== undefined) {
      attachToolTip(el, vnode, 'extraLicense', item.name)
      disableModule(el, vnode)
      return
    }
    enableModule(el, vnode)
    detachTooltip(el)
    if (!item.permission) {
      hideModule(el)
    } else {
      showModule(el)
    }
  })
}

function handlePermission (el, binding, vnode, permissions) {
  let hasExtraPermissions = permissions.some(item => item.type === 'module')
  if (hasExtraPermissions) {
    handleExtraPermission(el, binding, vnode, permissions)
    return
  }
  let isOr = binding.modifiers.and
  let apiPermission = false
  if (isOr) {
    apiPermission = checkApiPermissionWithOrModifiers(binding.modifiers, permissions)
  } else {
    apiPermission = permissions.some(item => item.type === 'api' && !item.permission)
  }
  let licensePermission = permissions.some(item => item.type === 'license' && !item.permission)
  let type = 'license'
  if (apiPermission) type = 'api'
  if (apiPermission || licensePermission) {
    attachToolTip(el, vnode, type)
    disableModule(el, vnode)
  } else {
    enableModule(el, vnode)
    detachTooltip(el)
  }
}

function checkApiPermissionWithOrModifiers (modifiers, permissions) {
  let isOr = modifiers.or
  if (!isOr) return false
  let noPermissions = permissions
      .filter(item => item.type === 'api')
      .every(item => !item.permission)
  return noPermissions
}

function checkPermission (el, binding, vnode) {
  if (!vnode.context.dbData.common.license) return
  let permissionName = binding.value
  if (!permissionName) return
  let currLicenseType = vnode.context.dbData.common.license.licenseType
  let permissions = []
  let check = (name) => {
    let recordResult = (permission, type) => {
      let obj = {
        name,
        permission,
        type
      }
      permissions.push(obj)
    }
    if (name.indexOf('LICENSE_EXTRA') > -1) {
      let permission = getLicenseExtraCapability(name, currLicenseType, vnode.context)
      recordResult(permission, 'module')
    } else if (name.indexOf('LICENSE_BASIC') > -1) {
      let permission = getLicenseCapability(name, currLicenseType)
      recordResult(permission, 'license')
    } else {
      let permission = getApiPermission(name, vnode.context)
      recordResult(permission, 'api')
    }
  }
  if (Array.isArray(permissionName)) {
    permissionName.forEach((item) => check(item))
  } else {
    check(permissionName)
  }
  handlePermission(el, binding, vnode, permissions)
}

function updatePermission (el, binding, vnode, oldVNode) {
  // if (_.isEqual(vnode, oldVNode)) return
  checkPermission(el, binding, vnode)
}

export default {
  bind: checkPermission,
  update: updatePermission,
  unbind: function (el, binding, vnode) {
    // showModule(el)
    enableModule(el, vnode)
    detachTooltip(el)
  }
}
