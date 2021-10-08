import rpc from 'src/utils/rpc'
import eventCtrl from 'src/windows/Base/EventController'

/*
  添加阿里云nas类型主存储
  AddAliyunNasPrimaryStorage
*/
let create = function (param, self) {
  let event = eventCtrl.createEvent('primaryStorage.action.add', param.name, 1, null, null, null, self)
  return rpc.create('primary-storage/aliyun/nas', param, event)
      .then((resp) => {
        eventCtrl.incEventSuccess(event, self)
        return Promise.resolve(resp)
      }, (e) => {
        eventCtrl.incEventFail(event, self)
        return Promise.reject(e)
      })
}

export default {
  create
}



// WEBPACK FOOTER //
// ./src/api/primarystorage.js