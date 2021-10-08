import _ from 'lodash'
import { genUniqueId, getEventDataFromWindow, setEventDataToWindow, removeEventDataInWindow, isLongJobEvent, getIdentityUuid, browserLocalStorageGetItem, browserLocalStorageSetItem, browserLocalStorageRemoveItem } from 'src/utils/utils'
import { addEvent, addCall } from 'src/utils/message'

// const eventListLengthLimit = 50
const toastTimeout = 3 * 1000
let eventListName = ''
let longJobListName = ''
// let longJobListNameForToast = ''
// let resourceInLongJobListName = ''
let longJobActions = [
  'vm.action.storageMigrateRootVolume',
  'vm.action.createImage',
  'volume.action.storageMigrateDataVolume',
  'image.action.storageMigrateImage',
  'volume.action.createRootImage',
  'volume.action.createDataImage',
  'image.action.add',
  'virtualRouterImage.action.add',
  'snapshot.action.delete',
  'snapshot.action.revert',
  'action.volume.storageMigrate',
  'action.volume.createImage'
]

export default {

  addProgressBar: function (event, self) {
    // const self = this
    let data = {}
    let count = event.count || 1
    let startProgress = 1
    let intervalTaskid = event.id
    self.$store.commit('timerService/merge', {
      [intervalTaskid]: {
        uuid: intervalTaskid,
        count: count,
        interval: 4000, // 4s
        fn: () => {
          if (!self.$store.state.toastManager.toasts[intervalTaskid]) {
            self.$store.commit('timerService/delete', intervalTaskid, {root: true})
          }
          if (count > 1) {
            data.progress = Math.floor(((event.successCount + event.failCount) / count) * 100)
          } else {
            data.progress = Math.floor(startProgress / (startProgress + 1) * 100)
          }
          // console.error('count: ' + count)
          // console.error(data.progress)
          startProgress++
          self.$store.commit('mergeDbRow', {
            tableName: 'messageProgress',
            id: intervalTaskid,
            data: data
          }, { root: true })
        }
      }
    }, {root: true})
  },

  createEvent: function (action, name, count, content, subType, resourceInfos, self) {
    let isLongJob = _.isObject(resourceInfos)
    if (count === undefined) count = 1
    let event = {
      id: `${genUniqueId()}`,
      action,
      name,
      count,
      subType,
      content,
      resourceInfos,
      successCount: 0,
      failCount: 0,
      apiList: [],
      isLongJob,
      time: Date.now() + window.___currServerTimeMillionDvalue,
      endTime: '',
      status: 'UNDONE'
    }
    if (self.dbData.common.currProject) event.projectUuid = self.dbData.common.currProject.uuid
    event.title = self.$t(event.action, event)
    eventListName = `eventList-${getIdentityUuid()}`
    longJobListName = `longJobList-${getIdentityUuid()}`

    let longJobList = JSON.parse(browserLocalStorageGetItem(longJobListName))
    if (!longJobList) longJobList = []
    if (isLongJob) {
      let longJob = {
        id: event.id,
        hasToast: true,
        resourceUuid: resourceInfos.resourceUuid
      }
      longJobList.unshift(longJob)
      browserLocalStorageSetItem(longJobListName, JSON.stringify(longJobList))
      browserLocalStorageSetItem(event.id, JSON.stringify(event))
    } else {
      let eventList = JSON.parse(getEventDataFromWindow(eventListName))
      if (!eventList) eventList = []
      eventList.unshift(event.id)
      setEventDataToWindow(eventListName, JSON.stringify(eventList))
      setEventDataToWindow(event.id, JSON.stringify(event))
    }
    self.createToast(event)
    let job = _.cloneDeep(self.dbData.job)
    let updateData = {}
    updateData.runningJobs = job.runningJobs + 1
    if (isLongJob) {
      job.longJobUuidList.push(event.resourceInfos.jobUuid)
      updateData.longJobUuidList = job.longJobUuidList
    } else {
      this.addProgressBar(event, self)
    }
    self.updateDbObject({
      name: 'job',
      data: updateData
    })
    return event
  },

  _eventFinished: function (_event, self) {
    if (!self.$store.state.toastManager.toasts[_event.id]) {
      self.createToast(_event)
    }
    setTimeout(() => {
      if (self.$store.state.toastManager.toasts[_event.id]) {
        self.destroyToast(_event.id)
      }
    }, toastTimeout)
    let eventToBeUpdated
    if (isLongJobEvent(_event.id)) {
      eventToBeUpdated = JSON.parse(browserLocalStorageGetItem(_event.id))
    } else {
      eventToBeUpdated = JSON.parse(getEventDataFromWindow(_event.id))
    }
    let updatedEvent = Object.assign(eventToBeUpdated, {successCount: _event.successCount, failCount: _event.failCount})
    updatedEvent.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // setEventDataToWindow(_event.id, JSON.stringify(updatedEvent))
    if (updatedEvent.count === updatedEvent.successCount) {
      updatedEvent.status = 'OK'
    } else if (updatedEvent.successCount === 0) {
      updatedEvent.status = 'ERR'
    } else {
      updatedEvent.status = 'MIX'
    }
    let loginType = browserLocalStorageGetItem('loginType').toUpperCase()
    if (loginType === 'USER') {
      if (browserLocalStorageGetItem('isProjectLogin') === 'true' || browserLocalStorageGetItem('isPlatformAdmin') === 'true') {
        loginType = 'VIRTUALID'
      }
    }
    addEvent(updatedEvent.id, JSON.stringify(updatedEvent), getIdentityUuid(), loginType).then(() => {
      if (isLongJobEvent(_event.id)) {
        updatedEvent.apiList.forEach((apiUuid) => {
          let apiCall = JSON.parse(browserLocalStorageGetItem(apiUuid))
          addCall(apiUuid, JSON.stringify(apiCall)).then(() => {
            browserLocalStorageRemoveItem(apiUuid)
          })
        })
        browserLocalStorageRemoveItem(updatedEvent.id)
        longJobListName = `longJobList-${getIdentityUuid()}`
        let longJobList = JSON.parse(browserLocalStorageGetItem(longJobListName))
        if (!longJobList) longJobList = []
        _.remove(longJobList, event => updatedEvent.id === event.id)
        browserLocalStorageSetItem(longJobListName, JSON.stringify(longJobList))
      } else {
        removeEventDataInWindow(updatedEvent.id)
        eventListName = `eventList-${getIdentityUuid()}`
        let eventList = JSON.parse(getEventDataFromWindow(eventListName))
        if (!eventList) eventList = []
        _.remove(eventList, event => updatedEvent.id === event)
        setEventDataToWindow(eventListName, JSON.stringify(eventList))
        updatedEvent.apiList.forEach((apiUuid) => {
          let apiCall = JSON.parse(getEventDataFromWindow(apiUuid))
          addCall(apiUuid, JSON.stringify(apiCall)).then(() => {
            removeEventDataInWindow(apiUuid)
          })
        })
      }
    })
    // --------------------------------------------
    let isLongJob = _.includes(longJobActions, _event.action)
    let job = _.cloneDeep(self.dbData.job)
    let updateData = {}
    updateData.runningJobs = Math.max(job.runningJobs - 1, 0)
    if (isLongJob) {
      let longJobIndex = job.longJobUuidList.indexOf(_event.resourceInfos.jobUuid)
      job.longJobUuidList.splice(longJobIndex, 1)
      updateData.longJobUuidList = job.longJobUuidList
    }
    self.updateDbObject({
      name: 'job',
      data: updateData
    })
  },
  incEventSuccess: function (event, self) {
    let _event
    if (isLongJobEvent(event.id)) {
      _event = JSON.parse(browserLocalStorageGetItem(event.id))
    } else {
      _event = JSON.parse(getEventDataFromWindow(event.id))
    }
    // don't set success twice
    if (_event.successCount === _event.count) return
    if (_event.successCount < _event.count) _event.successCount++
    // ---------------------
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    if (isLongJobEvent(event.id)) {
      browserLocalStorageSetItem(event.id, JSON.stringify(_event))
    } else {
      setEventDataToWindow(event.id, JSON.stringify(_event))
    }
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    // Object.assign(event, _event)
    if (_event.successCount + _event.failCount >= _event.count) {
      self._eventFinished(_event)
    }
  },
  setEventSuccess: function (event, content, self) {
    let _event
    if (isLongJobEvent(event.id)) {
      _event = JSON.parse(browserLocalStorageGetItem(event.id))
    } else {
      _event = JSON.parse(getEventDataFromWindow(event.id))
    }
    // don't set success twice
    if (_event.successCount === _event.count) return
    _event.successCount = _event.count
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    if (content) _event.content = content
    if (isLongJobEvent(event.id)) {
      browserLocalStorageSetItem(event.id, JSON.stringify(_event))
    } else {
      setEventDataToWindow(event.id, JSON.stringify(_event))
    }
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    self._eventFinished(_event)
  },
  incEventFail: function (event, self) {
    let _event
    if (isLongJobEvent(event.id)) {
      _event = JSON.parse(browserLocalStorageGetItem(event.id))
    } else {
      _event = JSON.parse(getEventDataFromWindow(event.id))
    }
    // don't set fail twice
    if (_event.failCount === _event.count) return
    if (_event.failCount < _event.count) _event.failCount++
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    if (isLongJobEvent(event.id)) {
      browserLocalStorageSetItem(event.id, JSON.stringify(_event))
    } else {
      setEventDataToWindow(event.id, JSON.stringify(_event))
    }
    if (self.$store.state.toastManager.toasts[_event.id]) {
      self.updateToast(_event)
    }
    // console.log(`_event.successCount ${_event.successCount} _event.failCount ${_event.failCount} _event.count ${_event.count}`)
    if (_event.successCount + _event.failCount >= _event.count) {
      self._eventFinished(_event)
    }
  },
  setEventFail: function (event, content, self) {
    let _event
    if (isLongJobEvent(event.id)) {
      _event = JSON.parse(browserLocalStorageGetItem(event.id))
    } else {
      _event = JSON.parse(getEventDataFromWindow(event.id))
    }
    // don't set fail twice
    if (_event.failCount === _event.count) return
    _event.failCount = _event.count
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    if (content) _event.content = content
    if (isLongJobEvent(event.id)) {
      browserLocalStorageSetItem(event.id, JSON.stringify(_event))
    } else {
      setEventDataToWindow(event.id, JSON.stringify(_event))
    }
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    self._eventFinished(_event)
  },
  setEventFinished: function (event, self) {
    let _event
    if (isLongJobEvent(event.id)) {
      _event = JSON.parse(browserLocalStorageGetItem(event.id))
    } else {
      _event = JSON.parse(getEventDataFromWindow(event.id))
    }
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    _event.failCount = event.failCount
    _event.successCount = event.successCount
    if (isLongJobEvent(event.id)) {
      browserLocalStorageSetItem(event.id, JSON.stringify(_event))
    } else {
      setEventDataToWindow(event.id, JSON.stringify(_event))
    }
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    if (_event.successCount + _event.failCount >= _event.count) {
      self._eventFinished(_event)
    }
  }
}
