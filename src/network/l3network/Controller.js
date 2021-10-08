import {browserLocalStorageGetItem} from 'src/utils/utils'
import rpc from 'src/utils/rpc'

export default {
  hasPermission: function (self) {
    let currentAccountUuid = browserLocalStorageGetItem('accountUuid')
    let hasPermission = self.dbData.common.isAdmin || self.dbData.l3network[self.windowData.dataUuid] && (self.dbData.l3network[self.windowData.dataUuid].accountUuid === currentAccountUuid)
    return self.updateWindow({ hasPermission })
  },
  delete: function (uuidList, self) {
    let event = self.createEvent('l3network.action.delete', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name : '', uuidList.length)
    let tasks = []
    let p = null
    uuidList.forEach(function (uuid) {
      ((uuid) => {
        p = rpc._delete(`l3-networks/${uuid}`, {}, event)
        .then(() => {
          self.incEventSuccess(event)
        }, () => self.incEventFail(event))
        tasks.push(p)
      })(uuid)
    })
    return Promise.all(tasks)
  }
}
