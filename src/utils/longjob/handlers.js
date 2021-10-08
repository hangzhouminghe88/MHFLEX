import _ from 'lodash'

function _getFnOnWindow (windowName, fnName, self) {
  let fn = () => {}
  let windowManager = self.$store.state.windowManager.windows
  _.keys(windowManager).forEach(id => {
    if (_.includes(id, windowName)) {
      const { methods } = windowManager[id]
      if (!methods) return
      fn = methods[fnName]
    }
  })
  return fn
}

function getQuery (windowName, self) {
  let queryInDetail = _getFnOnWindow(windowName, 'query', self)
  let queryInList = _getFnOnWindow(windowName, 'queryList', self)
  return queryInDetail || queryInList
}

function getClose (windowName, self) {
  let close = _getFnOnWindow(windowName, 'close', self)
  return close
}

const handlers = {
  'snapshot.action.revert': (event, longjob, self) => {
    let refreshDetailPage = getQuery('VmVolumeSnapshotDetail', self)
    let refreshListPage = getQuery('VmSnapshot', self)
    function startVMAfterRevert (resourceUuid, self) {
      const { volumeUuid } = self.dbData.snapshot[resourceUuid]
      const { vmInstanceUuid } = self.dbData.volume[volumeUuid]
      return self.dispatchActionWithEvent('vm/start', vmInstanceUuid)
    }
    const { isStartVM, resourceUuid } = event.resourceInfos
    if (longjob.state === 'Succeeded') {
      refreshDetailPage()
      refreshListPage()
      if (isStartVM) startVMAfterRevert(resourceUuid, self)
    } else if (longjob.state === 'Failed') {
      refreshDetailPage()
    }
  },
  'snapshot.action.delete': (event, longjob, self) => {
    if (longjob.state !== 'Succeeded') return
    let refreshListPage = getQuery('VmSnapshot', self)
    let closeDetailPage = getClose('VmVolumeSnapshotDetail', self)
    if (_.isFunction(closeDetailPage)) closeDetailPage()
    refreshListPage()
  },
  'action.vm.storageMigrate': (event, longjob, self) => {
    let refreshListPage = getQuery('EcsInstancePage', self)
    refreshListPage()
  },
  'baremetal.action.createChassis': (event, longjob, self) => {
    let refreshListPage = getQuery('BaremetalChassisListPage', self)
    refreshListPage()
  },
  'vm.action.createImage': (event, longjob, self) => {
    let refreshListPage = getQuery('ImagePage', self)
    refreshListPage()
  },
  'host.action.addByFile': (event, longjob, self) => {
    let refreshListPage = getQuery('HostPage', self)
    refreshListPage()
  }
}

export default handlers
