import rpc from 'src/utils/rpc'
import eventCtrl from 'src/windows/Base/EventController'
import _ from 'lodash'

/*
  查询aliyun nas权限组列表[list]
  QueryAliyunNasAccessGroup
*/
let queryList = function (param) {
  return rpc.query('nas/aliyun/access', param)
}

/*
  查询aliyun nas权限组列表[one]
  QueryAliyunNasAccessGroup
*/
let queryDetail = function (uuid) {
  return rpc.query(`nas/aliyun/nas/access/${uuid}`)
}

/*
  创建一个阿里云NAS权限组
  CreateAliyunNasAccessGroup
*/
let create = function (param, self) {
  let event = eventCtrl.createEvent('nasAccessGroup.action.create', param.name, 1, null, null, null, self)
  return rpc.create('nas/aliyun/access', param, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
        return Promise.resolve(resp)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
        return Promise.reject(e)
      })
}

/*
  添加一个服务端己存在的阿里云NAS权限组
  AddAliyunNasAccessGroup
*/
let add = function (param, self) {
  let event = eventCtrl.createEvent('nasAccessGroup.action.add', param.name, 1, null, null, null, self)
  return rpc.put('nas/aliyun/access', param, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
        return Promise.resolve(resp)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
        return Promise.reject(e)
      })
}

/*
  删除NAS文件系统
  DeleteAliyunNasAccessGroup
*/
let remove = function (uuidList, name, self) {
  let event = eventCtrl.createEvent('nasAccessGroup.action.delete', name, uuidList.length, null, null, null, self)
  let tasks = []
  uuidList.forEach(function (uuid) {
    ((uuid) => {
      let p = rpc._delete(`nas/access/${uuid}`, null, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
      })
      tasks.push(p)
    })(uuid)
  })
  return Promise.all(tasks)
}

/*
  创建一个阿里云NAS权限组的规则
  CreateAliyunNasAccessGroupRule
*/
let createAccessGroupRule = function (param, self) {
  let event = eventCtrl.createEvent('nasAccessGroupRule.action.create', param.sourceCidrIp, 1, null, null, null, self)
  return rpc.create('nas/aliyun/rule', param, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
        return Promise.resolve(resp)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
        return Promise.reject(e)
      })
}

/*
  删除阿里云NAS权限组的规则
  DeleteAliyunNasAccessGroupRule
*/
let removeAccessGroupRules = function (uuidList, name, self) {
  let event = eventCtrl.createEvent('nasAccessGroupRule.action.delete', name, uuidList.length, null, null, null, self)
  let tasks = []
  uuidList.forEach(function (uuid) {
    ((uuid) => {
      let p = rpc._delete(`nas/access/rule//${uuid}`, null, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
      })
      tasks.push(p)
    })(uuid)
  })
  return Promise.all(tasks)
}

/*
  更新一个阿里云NAS权限组
  UpdateAliyunNasAccessGroup
*/
let update = function (uuid, propName, value, eventName, self) {
  let event = eventCtrl.createEvent(`${eventName}`, value, 1, null, null, null, self)
  let param = {
    uuid: uuid
  }
  param[propName] = value
  return rpc.put('nas/aliyun/access', {
    'updateAliyunNasAccessGroup': param
  }, event)
    .then((resp) => {
      eventCtrl.incEventSuccess(event, self)
      return Promise.resolve(resp)
    }, (e) => {
      eventCtrl.incEventFail(event, self)
      return Promise.reject(e)
    })
}

/*
  获取服务端的权限组列表
  GetAliyunNasAccessGroupRemote
*/
let queryListRemote = function (param) {
  return rpc.query('nas/aliyun/access/remote', param)
}

export default {
  queryList,
  queryDetail,
  create,
  add,
  remove,
  createAccessGroupRule,
  removeAccessGroupRules,
  update,
  queryListRemote
}



// WEBPACK FOOTER //
// ./src/api/nas.accessgroup.js
