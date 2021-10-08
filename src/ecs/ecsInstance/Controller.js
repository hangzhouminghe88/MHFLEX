import rpc from 'src/utils/rpc'
import _ from 'lodash'

export default {
  createParam (self) {
    let obj = {
      name: self.windowData.name,
      description: self.windowData.description,
      instanceOfferingUuid: self.windowData.instanceOfferingUuid,
      imageUuid: self.windowData.imageUuid,
      l3NetworkUuids: self.windowData.networkUuidList,
      staticIp: self.windowData.staticIp,
      customMac: self.windowData.vmNicMAC
    }
    if (!self.dbData.common.isOpensource) {
      obj.consoleMode = self.windowData.consoleMode
    }
    return obj
  },
  setVmNicMAC (self) {
    let vmNic = _.cloneDeep(self.dbData.vmNicRefs[self.selectedList[0]])
    self.openDialog('EditVmNicMACDlg', {
      mac: vmNic.mac,
      ok: (newMAC) => {
        let event = self.createEvent('vm.action.setMAC', self.dbData.vm[self.windowData.dataUuid].name)
        rpc.update(`vm-instances/nics`, vmNic.uuid, { 'updateVmNicMac': {
          'mac': newMAC
        } }, event).then(() => {
          self.incEventSuccess(event)
          self.init()
        }, () => {
          self.incEventFail(event)
        })
      }
    })
  },
  inStates: function (states, self) {
    let stateList = []
    for (let i = 0; i < states.length; i++) {
      stateList.push(states[i])
    }
    if(self.dbData.vm && self.dbData.vm[self.windowData.dataUuid]){
      return !stateList.every(item => {
        return item !== self.dbData.vm[self.windowData.dataUuid].state
      })
    }
  },
  canSetVmNicMAC (self) {
    return self.inStates(['Stopped']) && self.isSingleSelected
  },
  toggle (self) {
    if (self.isSingle === true && self.windowData.numbers !== 1) {
      self.updateWindow({ numbers: 1 })
    }
    if (!self.isSingle) {
      self.updateWindow({vmNicMAC: {}})
    }
  }
}



// WEBPACK FOOTER //
// ./src/windows/VmInstance/Controller.js
