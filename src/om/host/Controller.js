import rpc from 'src/utils/rpc'
import _ from 'lodash'

export default {
  getDefaultL3NetworkIp: function (uuid, self) {
    let value = ''
    if (self.dbData.vm[uuid].applianceVmType && self.dbData.vm[uuid].applianceVmType === 'vpcvrouter') {
      for (let i = 0; i < self.dbData.vm[uuid].vmNics.length; i++) {
        if (self.dbData.vm[uuid].defaultRouteL3NetworkUuid === self.dbData.vm[uuid].vmNics[i].l3NetworkUuid) {
          value = self.dbData.vm[uuid].vmNics[i].ip
          break
        }
      }
    } else {
      for (let i = 0; i < self.dbData.vm[uuid].vmNics.length; i++) {
        if (self.dbData.vm[uuid].defaultL3NetworkUuid === self.dbData.vm[uuid].vmNics[i].l3NetworkUuid) {
          value = self.dbData.vm[uuid].vmNics[i].ip
          break
        }
      }
    }
    return value
  },
  reconnect: function (uuidList, self) {
    let event = self.createEvent('host.action.reconnect', uuidList.length === 1 ? self.dbData.host[uuidList[0]].name : '', uuidList.length)
    let tasks = []
    let p = null
    uuidList.forEach(function (uuid) {
      ((uuid) => {
        let hostInventory = _.cloneDeep(self.dbData.host[uuid])
        hostInventory.status = 'Connecting'
        self.updateDbRow({
          tableName: 'host',
          id: uuid,
          data: hostInventory
        })
        p = rpc.update('hosts', uuid, {
          'reconnectHost': {}
        }, event)
        .then((resp) => {
          self.updateDbRow({
            tableName: 'host',
            id: uuid,
            data: resp.inventory
          })
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
      })(uuid)
    })
    return Promise.all(tasks)
  }
}



// WEBPACK FOOTER //
// ./src/windows/Host/Controller.js