<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      updateCount: function () {
        rpc.query('pci-device/pci-devices', {
          replyWithCount: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      delete (uuidList) {
        const self = this
        let event = self.createEvent('pciDevice.action.delete', '', uuidList.length)
        uuidList.forEach((uuid) => {
          ((uuid) => {
            rpc._delete(`pci-device/pci-devices/${uuid}`, null, event)
              .then((resp) => {
                self.updateCount()
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      attach (vmInstanceUuid, gpuDeviceUuidList) {
        const self = this
        let audioList = []
        let videoList = []
        let _3DList = []
        gpuDeviceUuidList.forEach((uuid) => {
          if (self.dbData.pcidevice[uuid].type === 'GPU_Audio_Controller') {
            audioList.push(uuid)
          }
          if (self.dbData.pcidevice[uuid].type === 'GPU_Video_Controller') {
            videoList.push(uuid)
            let gpuA = self.dbData.pcideviceA[uuid]
            if (gpuA.audioUuid) {
              audioList.push(gpuA.audioUuid)
            }
          }
          if (self.dbData.pcidevice[uuid].type === 'GPU_3D_Controller') {
            _3DList.push(uuid)
          }
        })
        let _attach = (uuid) => {
          return rpc.create(`pci-device/pci-devices/${uuid}/attach`, {
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
        }
        let count = _3DList.length + videoList.length + audioList.length
        let event = self.createEvent('gpuDevice.action.attach', '', count)
        // let data = self.dbData.pcidevice
        let _3DTasks = () => _3DList.map(uuid => _attach(uuid))
        let videoTasks = () => videoList.map(uuid => _attach(uuid))
        let audioTasks = () => audioList.map(uuid => {
          // let isAvaiable = videoList.some(videoUuid => data[videoUuid].pciDeviceAddress.substring(0, 5) ===
          //   data[uuid].pciDeviceAddress.substring(0, 5))
          // if (!isAvaiable) {
          //   for (let id in data) {
          //     if (data[id].pciDeviceAddress.substring(0, 5) === data[uuid].pciDeviceAddress.substring(0, 5) && data[id].status === 'Attached') {
          //       isAvaiable = true
          //     }
          //   }
          // }
          return _attach(uuid)
        })
        return Promise.all([..._3DTasks(), ...videoTasks()]).then(() => Promise.all(audioTasks()))
      },
      detach (vmInstanceUuid, gpuDeviceUuidList) {
        const self = this
        let audioList = []
        let videoList = []
        let _3DList = []
        gpuDeviceUuidList.forEach((uuid) => {
          if (self.dbData.pcidevice[uuid].type === 'GPU_Audio_Controller') {
            audioList.push(uuid)
          }
          if (self.dbData.pcidevice[uuid].type === 'GPU_Video_Controller') {
            videoList.push(uuid)
            let gpuA = self.dbData.pcideviceA[uuid]
            if (gpuA.audioUuid) {
              audioList.push(gpuA.audioUuid)
            }
          }
          if (self.dbData.pcidevice[uuid].type === 'GPU_3D_Controller') {
            _3DList.push(uuid)
          }
        })
        let count = _3DList.length + videoList.length + audioList.length
        let event = self.createEvent('gpuDevice.action.detach', '', count)
        let _detach = (uuid) => {
          return rpc._delete(`pci-device/pci-devices/${uuid}/detach`, {
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
        }
        let _3DTasks = () => _3DList.map(uuid => _detach(uuid))
        let videoTasks = () => videoList.map(uuid => _detach(uuid))
        let audioTasks = () => audioList.map(uuid => _detach(uuid))
        return Promise.all([..._3DTasks(), ...audioTasks()]).then(() => Promise.all(videoTasks()))
      },
      recallFromAll: function (uuidList) {
        let self = this
        let tempUuidList = []
        uuidList.forEach(uuid => {
          tempUuidList.push(uuid)
          let gpuA = self.dbData.pcideviceA[uuid]
          if (gpuA && gpuA.audioUuid) {
            tempUuidList.push(gpuA.audioUuid)
          }
        })
        let event = this.createEvent('gpuDevice.action.recallFromAll', uuidList.length === 1 ? this.dbData.pcidevice[uuidList[0]].description : '')
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': tempUuidList,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      shareToAll: function (uuidList) {
        let self = this
        let tempUuidList = []
        uuidList.forEach(uuid => {
          tempUuidList.push(uuid)
          let gpuA = self.dbData.pcideviceA[uuid]
          if (gpuA && gpuA.audioUuid) {
            tempUuidList.push(gpuA.audioUuid)
          }
        })
        let event = this.createEvent('gpuDevice.action.shareToAll', uuidList.length === 1 ? this.dbData.pcidevice[uuidList[0]].description : '')
        return rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': tempUuidList,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      getGpuType (uuid) {
        let gpu = this.dbData.pcidevice[uuid]
        if (!gpu) return ''
        if (gpu.type === 'GPU_Video_Controller') {
          return this.$t('gpuDevice.desktopGpu')
        }
        return this.$t('gpuDevice.computeGpu')
      },
      enable (uuidList) {
        const self = this
        let event = self.createEvent('gpuDevice.action.enable', '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('pci-device/pci-devices', uuid, {
              'updatePciDevice': {
                'state': 'Enabled'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'pcidevice',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      query (uuidList) {
        const self = this
        let uuidListStr = ''
        if (_.isArray(uuidList)) {
          uuidListStr = uuidList.join(',')
        } else {
          uuidListStr = uuidList
        }
        let script = `

def tmp = query("QueryPciDevice uuid?=${uuidListStr}")

def PciDeviceList = tmp.result
put("pcidevice", PciDeviceList)
def VmInstanceList = query("QueryVmInstance").result
put('vm', VmInstanceList)

`
        if (this.dbData.common.isAdmin) {
          script += `
def hostUuidList = PciDeviceList.collect { it.hostUuid }
def HostList = query("QueryHost uuid?=" + hostUuidList.join(",")).result
put('host', HostList)
def pcideviceAList = []
def uuidList = PciDeviceList.collect{ it.uuid }
def sharedResourceRef = query("QuerySharedResource resourceUuid?=" + uuidList.join(",")).result
uuidList.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  tmp["toPublic"] = false
  def sharedRefList = sharedResourceRef.findAll { it.resourceUuid == uuid }
  sharedRefList.each{ sharedRef ->
    if (sharedRef && sharedRef.toPublic) {
      tmp["toPublic"] = true
    }
  }
  pcideviceAList.push(tmp)
}
put("pcideviceA", pcideviceAList)
`
        }
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let result = resp.result
          return self.applyRespToDb(result, self)
        }).then(() => {
          return self.$forceUpdate()
        })
      },
      disable (uuidList) {
        const self = this
        let event = self.createEvent('gpuDevice.action.disable', '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('pci-device/pci-devices', uuid, {
              'updatePciDevice': {
                'state': 'Disabled'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'pcidevice',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
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
