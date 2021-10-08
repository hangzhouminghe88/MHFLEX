import rpc from 'src/utils/rpc'
import eventCtrl from 'src/windows/Base/EventController'
import _ from 'lodash'

/*
  查询阿里云NAS文件系统列表[list]
  QueryAliyunNasFileSystem
*/
let queryList = function (param) {
  return rpc.query('primary-storage/nas', param)
}

/*
  查询阿里云NAS文件系统[one]
  QueryAliyunNasFileSystem
*/
let queryDetail = function (uuid) {
  return rpc.query(`primary-storage/nas/${uuid}`)
}

/*
  创建阿里云NAS文件系统
  CreateAliyunNasFileSystem
*/
let create = function (param, self) {
  let event = eventCtrl.createEvent('nasFileSystem.action.create', param.name, 1, null, null, null, self)
  return rpc.create('nas/aliyun', param, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
        return Promise.resolve(resp)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
        return Promise.reject(e)
      })
}

/*
  添加一个服务端己存在的阿里云NAS文件系统
  AddAliyunNasFileSystem
*/
let add = function (param, self) {
  let event = eventCtrl.createEvent('nasFileSystem.action.add', param.name, 1, null, null, null, self)
  return rpc.put('nas/aliyun', param, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
        return Promise.resolve(resp)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
        return Promise.reject(e)
      })
}

/*
  删除一个NAS文件系统
  DeleteNasFileSystem
*/
let remove = function (uuidList, name, self) {
  let event = eventCtrl.createEvent('nasFileSystem.action.delete', name, uuidList.length, null, null, null, self)
  let tasks = []
  uuidList.forEach(function (uuid) {
    ((uuid) => {
      let p = rpc._delete(`primary-storage/nas/${uuid}`, null, event)
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
  更新一个NAS文件系统
  UpdateNasFileSystem
*/
let update = function (uuid, propName, value, eventName, self) {
  let event = eventCtrl.createEvent(`${eventName}`, value, 1, null, null, null, self)
  let param = {}
  param[propName] = value
  return rpc.update(`primary-storage/nas`, uuid, {
    'updateNasFileSystem': param
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
  获取服务端阿里云NAS文件系统列表
  GetAliyunNasFileSystemRemote
*/
let queryListRemote = function (param) {
  return rpc.query('nas/aliyun/remote', param)
}

export default {
  queryList,
  queryDetail,
  create,
  add,
  remove,
  update,
  queryListRemote
}



// WEBPACK FOOTER //
// ./src/api/nas.filesystem.js
