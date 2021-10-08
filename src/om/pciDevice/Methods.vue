<script>
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      updateCount: function () {
        rpc.query('pci-device/pci-devices', {
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      attach (vmInstanceUuid, pciDeviceUuidList) {
        const self = this
        let tasks = []
        let p
        let event = self.createEvent('pciDevice.action.attach', '', pciDeviceUuidList.length)
        let _attach = (uuid) => {
          p = rpc.create(`pci-device/pci-devices/${uuid}/attach`, {
            vmInstanceUuid: vmInstanceUuid
          }, event).then(resp => {
            self.incEventSuccess(event)
            return self.updateDbRow({
              tableName: 'pcidevice',
              id: uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        }
        pciDeviceUuidList.forEach(_attach)
        return Promise.all(tasks)
      },
      detach (vmInstanceUuid, pciDeviceUuidList) {
        const self = this
        let event = self.createEvent('pciDevice.action.detach', '', pciDeviceUuidList.length)
        let tasks = []
        let p
        let _detach = (uuid) => {
          p = rpc._delete(`pci-device/pci-devices/${uuid}/detach`, {
            vmInstanceUuid: vmInstanceUuid
          }, event).then(resp => {
            self.incEventSuccess(event)
            return self.forceUpdateDbRow({
              tableName: 'pcidevice',
              id: uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        }
        pciDeviceUuidList.forEach(_detach)
        return Promise.all(tasks)
      },
      enable (uuidList) {
        const self = this
        let tasks = []
        let p
        let event = self.createEvent('pciDevice.action.enable', '', uuidList.length)
        uuidList.forEach(uuid => {
          p = rpc.update(`pci-device/pci-devices`, uuid, {
            'updatePciDevice': {
              'state': 'Enabled'
            }
          }, event)
            .then(resp => {
              self.updateDbRow({
                tableName: 'pcidevice',
                id: uuid,
                data: resp.inventory
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      disable (uuidList) {
        const self = this
        let tasks = []
        let p
        let event = self.createEvent('pciDevice.action.disable', '', uuidList.length)
        uuidList.forEach(uuid => {
          p = rpc.update('pci-device/pci-devices', uuid, {
            'updatePciDevice': {
              'state': 'Disabled'
            }
          }, event)
            .then(resp => {
              self.updateDbRow({
                tableName: 'pcidevice',
                id: uuid,
                data: resp.inventory
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      ...Utils
    }
  }
</script>
