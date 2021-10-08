import Vue from 'vue'
import _ from 'lodash'
import GlobalUtils from 'src/utils/utils'

export function normalizeParamList (param) {
  // if (!_.isArray(param) && !_.isString(param)) return
  let uuidList
  if (_.isArray(param)) {
    uuidList = param
  } else { // isString
    uuidList = [param]
  }
  return uuidList
}
export function arrayToDict (list) {
  let obj = {}
  list.forEach(it => {
    obj[it.uuid] = it
  })
  return obj
}

export function mergeObj (targetObj, updateObj) {
  return {...targetObj, ...updateObj}
}

export function mergeMap (targetMap, updateMap) {
  let uuidList = _.keys(targetMap).concat(_.keys(updateMap))
  let newMap = {}
  uuidList.forEach((uuid) => {
    let targetObj = targetMap[uuid]
    if (!targetObj) targetObj = {}
    let updateObj = updateMap[uuid]
    if (!updateObj) updateObj = {}
    newMap[uuid] = _.assign(targetObj, updateObj)
  })
  return newMap
}

export function emptyPromise (value) {
  return new Promise((resolve, reject) => { resolve(value) })
}

export function set (state, item) {
  Vue.set(state, item.uuid, item)
}

export function batchSet (state, objMap) {
  Object.keys(objMap).forEach(uuid => {
    Vue.set(state, uuid, objMap[uuid])
  })
}

export function batchMerge (state, objMap) {
  Object.keys(objMap).forEach(uuid => {
    Vue.set(state, uuid, {...state[uuid], ...objMap[uuid]})
  })
}

export function remove (state, uuid) {
  Vue.delete(state, uuid)
}

export function queryTemplate (cb, tableName) {
  return (ctx, arg) => {
    return cb(ctx, arg)
      .then((result) => {
        ctx.state = {};
        _.values(result).forEach(it => {
          if (ctx.state[it.uuid]) {
            ctx.commit('delete', it.uuid)
          }
        })
        ctx.commit('merge', result)
        let list = _.values(result)
        ctx.commit('mergeDbTable', {tableName, list}, { root: true })
        return emptyPromise({
          total: list.length,
          uuidList: list.map(it => it.uuid)
        })
      })
  }
}

export function createQueryTemplate (tableName) {
  return (cb) => {
    return queryTemplate(cb, tableName)
  }
}

export function batchQueryTemplate (cb, tableName) {
  return (ctx, arg) => {
    return cb(ctx, arg)
      .then((result) => {
        _.values(result.inventories).forEach(it => {
          //如果存在it.uuid的这条数据应该清理
          if (ctx.state[it.uuid]) {
            ctx.commit('delete', it.uuid)
          }
        })
        ctx.commit('merge', result.inventories)
        let list = _.values(result.inventories)
        ctx.commit('mergeDbTable', {tableName, list}, { root: true });
        return emptyPromise({
          total: result.total,
          uuidList: list.map(it => it.uuid)
        })
      })
  }
}

export function createBatchQueryTemplate (tableName) {
  return (cb) => {
    return batchQueryTemplate(cb, tableName)
  }
}

export function actionTempalte (cb, tableName) {
  return (ctx, arg) => {
    arg.uuidList = normalizeParamList(arg.param)
    return cb(ctx, arg)
      .then((result) => {
        ctx.commit('merge', result)
        let list = _.values(result)
        ctx.commit('mergeDbTable', {tableName, list}, { root: true })
        arg.forceSetEventSuccess()
        return emptyPromise(result)
      }, (e) => {
        arg.forceSetEventFail()
      })
  }
}

export function createActionTemplate (tableName) {
  return (cb) => {
    return actionTempalte(cb, tableName)
  }
}

export function batchActionTempalte (cb, tableName) {
  return (ctx, arg) => {
    let paramList = normalizeParamList(arg.param)
    let resultMap = {}
    let tasks = paramList.map(param => {
      let newArg = {
        param,
        progressCb: arg.progressCb,
        isDeleteRemote: arg.isDeleteRemote ? arg.isDeleteRemote :  undefined
      }
      return cb(ctx, newArg)
        .then(result => {
          ctx.state = {};
          if (result) {
            resultMap[result.uuid] = result
            let singleResult = {
              [result.uuid]: result
            }
            ctx.commit('merge', singleResult)
            let list = _.values(singleResult)
            ctx.commit('mergeDbTable', {tableName, list}, { root: true })
          }
          return emptyPromise()
        })
    })
    return Promise.all(tasks).then(() => {
      return emptyPromise(resultMap)
    })
    // return Promise.all(tasks).then(() => {
    //   ctx.commit('merge', resultMap)
    //   let list = _.values(resultMap)
    //   ctx.commit('mergeDbTable', {tableName, list}, { root: true })
    //   return emptyPromise(resultMap)
    // })
  }
}

export function createBatchActionTemplate (tableName) {
  return (cb) => {
    return batchActionTempalte(cb, tableName)
  }
}

export function getterTempalte (cb) {
  return (param) => {
    let isArray = false
    let uuidList
    if (_.isString(param)) {
      isArray = false
      uuidList = [param]
    } else if (_.isArray(param)) {
      isArray = true
      uuidList = param
    } else {
      return []
    }
    let retArray = cb(uuidList)
    if (!isArray) {
      return retArray[0]
    }
    return retArray
  }
}

export function getList (state, uuidList) {
  if (!_.isArray(uuidList)) return []
  uuidList = _.filter(uuidList, uuid => {
    if (state[uuid]) {
      return true
    }
    return false
  })
  return uuidList.map(uuid => {
    return state[uuid]
  })
}

function getLicensePermission (name, rootState) {
  if (rootState.db.common.license && rootState.db.common.license.licenseType === 'Trial') return true
  if (!rootState.db.common.addonLicenses) return false
  if (rootState.db.common.isOpensource) return false

  let modules = rootState.db.common.addonLicenses
  let moduleLicenses = modules.map(item => module2license(item.modules[0]))
  if (moduleLicenses.every(item => item !== name)) {
    return false
  }
  return true

  function module2license (_module) {
    let obj = {
      'project-management': 'LICENSE_EXTRA_COMPANY',
      'disaster-recovery': 'LICENSE_EXTRA_BACKUP',
      'baremetal': 'LICENSE_EXTRA_BAREMETAL',
      'v2v': 'LICENSE_EXTRA_V2V'
    }
    return obj[_module]
  }
}

export async function getResourceOwner (resourceList, commit, rpc, rootState) {
  if (!Array.isArray(resourceList)) {
    resourceList = [resourceList]
  } else if (resourceList.length <= 0) {
    return
  }
  let uuidsString = resourceList.map((it, index) => { return `${index === 0 ? '' : '&'}resourceUuids=${it}` }).join('')
  let resourceAccountResp = await rpc.query(`resources/accounts?${uuidsString}`)
  let resourceAccountInventories = resourceAccountResp.inventories
  let accountUuidList = []
  Object.keys(resourceAccountInventories).forEach(function (resourceUuid) {
    if (accountUuidList.indexOf(resourceAccountInventories[resourceUuid].uuid) === -1) {
      accountUuidList.push(resourceAccountInventories[resourceUuid].uuid)
    }
  })
  let accountResp = await rpc.query('accounts', {
    q: `uuid?=${accountUuidList}`
  })
  let accountInventories = accountResp.inventories
  commit('mergeDbTable', {
    tableName: 'account',
    list: accountInventories
  }, { root: true })

  let resourceOwnerMap = {}
  Object.keys(resourceAccountInventories).forEach(resourceUuid => {
    let accountObj = _.find(accountInventories, {uuid: resourceAccountInventories[resourceUuid].uuid})
    if (accountObj) {
      resourceOwnerMap[resourceUuid] = {
        uuid: resourceUuid,
        ownerUuid: accountObj.uuid,
        ownerType: 'account'
      }
    }
  })

  if (!getLicensePermission('LICENSE_EXTRA_COMPANY', rootState)) {
    return resourceOwnerMap
  }

  // for project
  // if (accountUuidList.length <= 0) return {}
  let projectResp = await rpc.query('iam2/projects', {
    q: `linkedAccountUuid?=${accountUuidList}`,
    limit: 100000000
  })
  let projectInventories = projectResp.inventories
  // for legacy code
  commit('mergeDbTable', {
    tableName: 'iam2project',
    list: projectInventories
  }, { root: true })

  Object.keys(resourceAccountInventories).forEach(resourceUuid => {
    let projectObj = _.find(projectInventories, {linkedAccountUuid: resourceAccountInventories[resourceUuid].uuid})
    if (projectObj) {
      resourceOwnerMap[resourceUuid] = {
        uuid: resourceUuid,
        ownerUuid: projectObj.uuid,
        ownerType: 'project'
      }
    }
  })
  return resourceOwnerMap
}

export function genUniqueId () {
  GlobalUtils.genUniqueId.apply(this, arguments)
}

export default {
  normalizeParamList,
  arrayToDict,
  mergeObj,
  mergeMap,
  emptyPromise,
  set,
  batchSet,
  remove,
  batchMerge,
  queryTemplate,
  actionTempalte,
  createQueryTemplate,
  createActionTemplate,
  getList,
  getLicensePermission,
  getResourceOwner,
  createBatchQueryTemplate,
  createBatchActionTemplate,
  genUniqueId: GlobalUtils.genUniqueId,
  getterTempalte
}
