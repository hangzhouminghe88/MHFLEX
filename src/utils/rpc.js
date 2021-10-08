import SockJS from 'sockjs-client'
import 'stompjs/lib/stomp.js'
import { isUndefined, isObject, isString, isFunction, has, trimStart } from 'lodash'
import { genUniqueId, getServerUrl, getEventDataFromWindow, setEventDataToWindow, isLongJobEvent, isLongJobCall, browserLocalStorageGetItem, browserLocalStorageSetItem, isAas, logoutAas } from './utils'
/* global localStorage:false */
/* global Stomp:false */

let client = null
let connecting = false
let waitingList = [] // function waiting list before connected
let cbList = window.cbList = {}
let mainSubscription = null
let zwatchSubscription = null
// function getFirstItem (obj) {
//   return obj[Object.keys(obj)[0]]
// }
window.loglevel = 'info'

let zwatchCbList = {}

let zwatch = {
  subscribe: function (fn) {
    let s = genUniqueId()
    zwatchCbList[s] = fn
    return s
  },
  unsubscribe: function (s) {
    delete zwatchCbList[s]
  }
}

function sliceLongString (msgStrParam) {
  let parsedObj = JSON.parse(msgStrParam)
  function slice (obj) {
    var keys = Object.keys(obj)
    keys.forEach(function (key) {
      if (isObject(obj[key])) {
        slice(obj[key])
      } else {
        if (isString(obj[key]) && obj[key].length > 5000) {
          obj[key] = obj[key].slice(0, 5000)
        }
      }
    })
  }
  slice(parsedObj)
  return JSON.stringify(parsedObj)
}

function encodePassword (msgStrParam) {
  let parsedObj = JSON.parse(msgStrParam)
  let iterateObj = (obj) => {
    for (let key in obj) {
      if (key === 'monUrls') {
        obj[key] = obj[key].map(item => {
          let splitedPart = item.split('@')
          let tempArr = []
          let firstPart = splitedPart[0].split(':')
          firstPart[1] = '******'
          tempArr.push(firstPart.join(':'))
          tempArr.push(splitedPart[1])
          return tempArr.join('@')
        })
      }
      if (key === 'systemTags') {
        for (let i = 0; i < obj[key].length; i++) {
          if (!isObject(obj[key])) {
            if (obj[key][i].toLowerCase().indexOf('password') === -1) continue
            else {
              let splitedPart = obj[key][i].split('::')
              splitedPart[1] = '******'
              obj[key][i] = splitedPart.join('::')
            }
          }
        }
      }
      if (key.toLowerCase().indexOf('password') > -1) {
        obj[key] = '******'
      }
      if (key.toLowerCase().indexOf('secret') > -1) {
        obj[key] = '******'
      }
      if (isObject(obj[key])) {
        iterateObj(obj[key])
      }
    }
  }
  iterateObj(parsedObj)
  return JSON.stringify(parsedObj)
}

function connect (cb) {
  function callCb () {
    if (!cb) return
    if (typeof cb === 'function') {
      cb()
    } else {
      while (cb.length > 0) {
        cb.shift()()
      }
    }
  }

  if (connecting) {
    return
  }
  if (client && client.connected) {
    callCb()
    return
  }

  connecting = true
  const sessionUuid = localStorage.getItem('sessionUuid')
  var socket = new SockJS(`${getServerUrl()}/stomp`)
  socket.onopen = () => {
    connecting = false
  }
  client = Stomp.over(socket)
  if (window.localStorage.getItem('debug') !== 'true') {
    client.debug = null
  }
  client.connect({}, () => {
    mainSubscription = client.subscribe(`/topic/call/${sessionUuid}`, (reply) => {
      if (!window.apwiwqwnv) window.apwiwqwnv = true
      let resp = JSON.parse(reply.body)
      if (isLongJobCall(resp.jobUuid)) {
        let apiCall = JSON.parse(browserLocalStorageGetItem(resp.jobUuid))
        if (apiCall) {
          let formatedResp = sliceLongString(encodePassword(JSON.stringify(resp)))
          apiCall.resp = JSON.stringify(JSON.parse(formatedResp))
          if (apiCall.resp.length < 100000) {
            browserLocalStorageSetItem(resp.jobUuid, JSON.stringify(apiCall))
          }
        }
      } else {
        let apiCall = JSON.parse(getEventDataFromWindow(resp.jobUuid))
        if (apiCall) {
          let formatedResp = sliceLongString(encodePassword(JSON.stringify(resp)))
          apiCall.resp = JSON.stringify(JSON.parse(formatedResp))
          if (apiCall.resp.length < 100000) {
            setEventDataToWindow(resp.jobUuid, JSON.stringify(apiCall))
          }
        }
      }
      // if (typeof cbList[resp.jobUuid] !== 'function') {
      //   console.log(JSON.stringify(cbList[resp.jobUuid]))
      //   __printCallStack()
      // }
      if (typeof cbList[resp.jobUuid] === 'function') {
        if (window.loglevel === 'debug') {
          console.log(`call cb[${resp.jobUuid}]:` + cbList[resp.jobUuid])
        }
        cbList[resp.jobUuid](resp)
      }
      if (window.loglevel === 'debug') {
        console.log(`call cb[${resp.jobUuid}]:` + cbList[resp.jobUuid])
      }
      delete cbList[resp.jobUuid]
      if (window.loglevel === 'debug') {
        console.log('cblist:' + JSON.stringify(cbList))
      }
    })
    zwatchSubscription = client.subscribe(`/topic/zwatch/system_alarm/${sessionUuid}`, (reply) => {
      let resp = JSON.parse(reply.body)
      let list = Object.values(zwatchCbList)
      if (list.length === 0) return
      list.forEach((fn) => fn(resp))
    })
    connecting = false
    callCb()
  })
}

window.addEventListener('storage', function (event) {
  if (event.key === 'sessionUuid') {
    disconnect()
    connect()
  }
})

function disconnect () {
  if (mainSubscription) mainSubscription.unsubscribe()
  mainSubscription = null
  if (zwatchSubscription) zwatchSubscription.unsubscribe()
  zwatchSubscription = null
  client = null
  connecting = false
}

function _call (msg, cb, event, jobUuidParam) {;
  let _ = function () {
    let jobUuid
    if (isUndefined(jobUuidParam)) {
      jobUuid = genUniqueId()
    } else {
      jobUuid = jobUuidParam
    }
    msg.sessionUuid = localStorage.getItem('sessionUuid')
    msg.jobUuid = jobUuid
    cbList[jobUuid] = cb
    if (window.loglevel === 'debug') {
      console.log('cblist:' + JSON.stringify(cbList))
    }
    let msgStr = JSON.stringify(msg)
    client.send('/app/call', {}, msgStr)
    if (event && !isFunction(event)) {
      let apiCall = {
        req: sliceLongString(encodePassword(msgStr))
      }
      if (isLongJobEvent(event.id)) {
        browserLocalStorageSetItem(jobUuid, JSON.stringify(apiCall))
        let _event = JSON.parse(browserLocalStorageGetItem(event.id))
        _event.apiList.push(jobUuid)
        browserLocalStorageSetItem(event.id, JSON.stringify(_event))
      } else {
        setEventDataToWindow(jobUuid, JSON.stringify(apiCall))
        let _event = JSON.parse(getEventDataFromWindow(event.id))
        _event.apiList.push(jobUuid)
        setEventDataToWindow(event.id, JSON.stringify(_event))
      }
    }
  }
  if (!client || !client.connected) {
    waitingList.push(_)
    if (!connecting) {
      connect(waitingList)
    }
  } else {
    _()
  }
}

// let justJumpToLoginPage = false

function call (msg, event, jobUuidParam) {
  return new Promise(function (resolve, reject) {
    if (has(msg, 'path')) msg.path = trimStart(msg.path, '/')
    _call(msg, function (data) {
      if (isFunction(event)) {
        let progressCb = event
        progressCb({
          type: 'response',
          msg: data
        })
      }
      if (data.success) {
        resolve(data)
      } else {
        try {
          let body = JSON.parse(data.body)
          if (body.error) {
            // console.error(msg)
            // if (body.error.code === 'ID.1001' && !justJumpToLoginPage) {
            if (body.error.code === 'ID.1001') {
              if (isAas()) {
                // aliyun aas logout
                logoutAas()
              } else {
                localStorage.setItem('sessionUuid', '');
                window.router.push('/login')
                // justJumpToLoginPage = true
                // setTimeout(() => { justJumpToLoginPage = true }, 5000)
              }
            }
          }
        } catch (e) {
        }
        reject(data)
      }
    }, event, jobUuidParam)
  })
}

function query (resourceName, params, event) {
  let path = resourceName
  function concat (path, params, props) {
    if (Array.isArray(params[props])) {
      if (path[path.length - 1] !== '?') {
        path = path.concat('&')
      }
      for (let i in params[props]) {
        path = path.concat(props + '=' + params[props][i], '&')
      }
      if (path[path.length - 1] === '&') path = path.slice(0, -1)
      return path
    } else {
      //将params[props]转化为String类型以免在params[props]等于0时判断为空
      if (path[path.length - 1] !== '?' && String(params[props])) {
        path = path.concat('&')
      }
      if (!String(params[props])) return path
      return path.concat(props + '=' + params[props])
    }
  }

  if (params && Object.keys(params).length > 0) {
    path = path.concat('?')
    for (let props in params) {
      if (Array.isArray(params[props]) && params[props].length <= 0) continue
      path = concat(path, params, props)
    }
    if (path[path.length - 1] === '?') path = path.slice(0, -1)
  }

  return call({
    type: 'get',
    path
  }, event)
}

function create (resourceName, params, event, jobUuidParam) {
  let msg = {
    type: 'post',
    path: resourceName,
    body: {
      params
    }
  }
  let p
  if (isFunction(event)) {
    let progressCb = event
    p = call(msg, progressCb, jobUuidParam)
    progressCb({
      type: 'request',
      msg
    })
  } else {
    p = call(msg, event, jobUuidParam)
  }
  return p
}

function post (resourceName, params, event, jobUuid) {
  let msg = {
    type: 'post',
    path: resourceName,
    body: params
  }
  let p
  if (isFunction(event)) {
    let progressCb = event
    p = call(msg, progressCb, jobUuid)
    progressCb({
      type: 'request',
      msg
    })
  } else {
    p = call(msg, event, jobUuid)
  }
  return p
}

function _delete (resourceName, params, event) {
  let path = resourceName
  function concat (path, params, props) {
    if (Array.isArray(params[props])) {
      if (path[path.length - 1] !== '?') {
        path = path.concat('&')
      }
      for (let i in params[props]) {
        path = path.concat(props + '=' + params[props][i], '&')
      }
      if (path[path.length - 1] === '&') path = path.slice(0, -1)
      return path
    } else {
      if (path[path.length - 1] !== '?') {
        path = path.concat('&')
      }
      if (!params[props]) return path
      return path.concat(props + '=' + params[props])
    }
  }

  if (params && Object.keys(params).length > 0) {
    path = path.concat('?')
    for (let props in params) {
      path = concat(path, params, props)
    }
    if (path[path.length - 1] === '?') path = path.slice(0, -1)
  }

  let msg = {
    type: 'delete',
    path
  }
  let p
  if (isFunction(event)) {
    let progressCb = event
    p = call(msg, progressCb)
    progressCb({
      type: 'request',
      msg
    })
  } else {
    p = call(msg, event)
  }
  return p
}

function update (resourceName, uuid, body, event, jobUuidParam) {
  let msg = {
    type: 'put',
    path: `${resourceName}/${uuid}/actions`,
    body
  }
  let p
  if (isFunction(event)) {
    let progressCb = event
    p = call(msg, progressCb, jobUuidParam)
    progressCb({
      type: 'request',
      msg
    })
  } else {
    p = call(msg, event, jobUuidParam)
  }
  return p
}

function put (path, body, event, jobUuidParam) {
  let msg = {
    type: 'put',
    path,
    body
  }
  let p
  if (isFunction(event)) {
    let progressCb = event
    p = call(msg, progressCb, jobUuidParam)
    progressCb({
      type: 'request',
      msg
    })
  } else {
    p = call(msg, event, jobUuidParam)
  }
  return p
}

function get (path, body, event) {
  return call({
    type: 'get',
    path,
    body
  }, event)
}

function queryResourceNames (self, tableName, resourceList) {
  if (!Array.isArray(resourceList)) {
    resourceList = [resourceList]
  } else if (resourceList.length <= 0) {
    return
  }
  let uuidsString = resourceList.map((it, index) => { return `${index === 0 ? '' : '&'}uuids=${it}` }).join('')
  return query(`resources/names?${uuidsString}`)
    .then((resp) => {
      resp.inventories.map((it) => {
        if (it.uuid && self.dbData[tableName][it.uuid] === undefined) {
          it.name = it.resourceName
          return self.updateDbRow({
            tableName,
            id: it.uuid,
            data: it
          })
        }
      })
    })
}

function getResourceAccount (resourceList, self) {
  if (!Array.isArray(resourceList)) {
    resourceList = [resourceList]
  } else if (resourceList.length <= 0) {
    return
  }
  let uuidsString = resourceList.map((it, index) => { return `${index === 0 ? '' : '&'}resourceUuids=${it}` }).join('')
  return query(`resources/accounts?${uuidsString}`)
    .then((resp) => {
      return self.updateDbObject({
        name: 'resourceOwner',
        data: resp.inventories
      }).then(() => {
        let accountUuidList = []
        if (self.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          Object.keys(resp.inventories).forEach(function (resourceUuid) {
            ((resourceUuid) => {
              if (accountUuidList.indexOf(resp.inventories[resourceUuid].uuid) === -1) {
                accountUuidList.push(resp.inventories[resourceUuid].uuid)
              }
            })(resourceUuid)
          })
        }
        if (accountUuidList.length > 0) {
          return query('iam2/projects', {
            q: `linkedAccountUuid?=${accountUuidList}`,
            limit: 100000000
          }).then((project) => {
            self.updateDbTable({
              tableName: 'iam2project',
              list: project.inventories
            })
            project.inventories.forEach(function (projectitem) {
              ((projectitem) => {
                projectitem.projectUuid = projectitem.uuid
                projectitem.projectName = projectitem.name
                return self.updateDbRow({
                  tableName: 'accountA',
                  id: projectitem.linkedAccountUuid,
                  data: projectitem
                }).then(() => self.$nextTick(self.$forceUpdate))
              })(projectitem)
            })
          })
        }
      })
    })
}

function queryResourceByResourceType (resourceType, reresourceUuid, tableName, self) {
  let condition = [`uuid=${reresourceUuid}`]
  let currZoneUuid = window.localStorage.getItem('currZoneUuid')
  let apiPath = {
    'VmInstanceVO': 'vm-instances',
    'VolumeVO': 'volumes'
  }
  let conditions = {
    'VmInstanceVO': [`zoneUuid=${currZoneUuid}`],
    'VolumeVO': [`primaryStorage.zoneUuid=${currZoneUuid}`]
  }
  if (conditions[resourceType] && conditions[resourceType].length > 0) {
    condition = condition.concat(conditions[resourceType])
  }
  if (apiPath[resourceType]) {
    return query(`${apiPath[resourceType]}`, {
      q: condition
    }).then((resp) => {
      return self.updateDbTable({
        tableName,
        list: resp.inventories
      })
    })
  } else {
    return self.updateDbRow({
      tableName,
      id: reresourceUuid,
      data: {}
    })
  }
}

export default {
  connect,
  disconnect,
  call,
  query,
  create,
  _delete,
  update,
  post,
  put,
  queryResourceByResourceType,
  getResourceAccount,
  queryResourceNames,
  get,
  zwatch
}
