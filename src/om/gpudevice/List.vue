<script>
  // import rpc from 'src/utils/rpc'
  import GpuDeviceMethods from './Methods'
  import _ from 'lodash'
  import { checkBounce } from 'src/utils/utils'
  // import Vue from 'vue'
  import rpc from 'src/utils/rpc'
  // global localStorage:false

  export default {
    mixins: [GpuDeviceMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      }
    },
    methods: {
      //或得就绪状态的GPULSIT
      getAvaiableStatusList: function () {
        let statusList = []
        for (let i = 0; i < arguments.length; i++) {
          statusList.push(arguments[i])
        }
        const self = this
        return this.selectedList.filter(uuid => statusList.some(status => status === self.dbData.pcidevice[uuid].status))
      },
      //或得可用的GPULSIT
      getAvaiableStateList: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        const self = this
        return this.selectedList.filter(uuid => stateList.some(state => state === self.dbData.pcidevice[uuid].state))
      },
      //判断是否就绪
      hasOnStatus: function () {
        let statusList = []
        for (let i = 0; i < arguments.length; i++) {
          statusList.push(arguments[i])
        }
        const self = this
        return this.selectedList.some(uuid => statusList.some(status => status === self.dbData.pcidevice[uuid].status))
      },
      //判断是否在某个状态
      hasOnState: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        const self = this
        return this.selectedList.some(uuid => stateList.some(state => state === self.dbData.pcidevice[uuid].state))
      },
      //获得查询条件
      getCondition: function () {
        let conditionList = []
        let type = ['GPU_Video_Controller', 'GPU_Audio_Controller', 'GPU_3D_Controller']
        conditionList.push(`type?=${type.join()}`)
        if (this.param.uuidList && this.param.uuidList.length > 0) {
          conditionList.push(`hostUuid?=${this.param.uuidList.join()}`)
        }
        if (this.windowData.conditions) conditionList = conditionList.concat(this.windowData.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },
      //查询列表
      queryList: function () {
        if (this.dbData.common.isOpensource) {
          this.updateWindow({ uuidList: [], table: {} })
          return
        }
        let self = this
        let start = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let condition = self.getCondition().join(' ')

        let script = `
def tmp = query("QueryPciDevice limit=${limit} start=${start} ${condition} sortBy=${self.windowData.sortBy} sortDirection=${self.windowData.sortDirection === '-' ? 'desc' : 'asc'} replyWithCount=true")
put("total", tmp.total)
def VmInstanceList = query("QueryVmInstance").result
put('vm', VmInstanceList)
def PciDeviceList = tmp.result
put("pcidevice", PciDeviceList)
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
          let videoGpus = result.pcidevice.filter(pcidevice => pcidevice.type === 'GPU_Video_Controller')
          let audioGpus = result.pcidevice.filter(pcidevice => pcidevice.type === 'GPU_Audio_Controller')
          let pcideviceA = result.pcideviceA ? result.pcideviceA : []
          videoGpus.forEach(video => {
            let videoAddress = video.pciDeviceAddress.split('.')[0]
            audioGpus.forEach(audio => {
              let audioAddress = audio.pciDeviceAddress.split('.')[0]
              if (videoAddress === audioAddress && video.hostUuid === audio.hostUuid) {
                let index = pcideviceA.findIndex(pcidevice => pcidevice.uuid === video.uuid)
                if (index === -1) {
                  pcideviceA.push({
                    uuid: video.uuid,
                    audioUuid: audio.uuid
                  })
                } else {
                  pcideviceA[index]['audioUuid'] = audio.uuid
                }
              }
            })
          })
          result.pcideviceA = pcideviceA
          return self.applyRespToDb(result, self).then(() => {
            let uuidList = result.pcidevice.filter(pcidevice => pcidevice.type !== 'GPU_Audio_Controller').map(pcidevice => pcidevice.uuid)
            let table = {}
            uuidList.forEach(uuid => {
              table[uuid] = {
                selected: false
              }
            })
            return self.updateWindow({
              availableCount: result.total,
              pageCount: result.total === 0 ? 1 : Math.ceil(result.total / self.windowData.pageSize),
              uuidList,
              table
            }).then(() => {
              self.itemList = self.getItemList();
            })
          })
        })
      },
      //获得列表
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.pcidevice[uuid];
        })
      },
      //获得host名称
      getHostName: function (uuid) {
        let value
        try {
          value = this.dbData.host[this.dbData.pcidevice[uuid].hostUuid].name
        } catch (e) {
          if (checkBounce(`getHostName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'host', this.dbData.pcidevice[uuid].hostUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      //是否可以共享
      hasSharedToAll: function () {
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      //是否可以召回
      hasNotSharedToAll: function () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      //是否可以全局共享
      getSharedToAllList: function () {
        let uuidList = this.selectedList
        let list = uuidList.filter(uuid => this.dbData.pcideviceA[uuid].toPublic)
        return list
      },
      //是否可以全局召回
      getNotSharedToAllList: function () {
        let uuidList = this.selectedList
        let list = uuidList.filter(uuid => !this.dbData.pcideviceA[uuid].toPublic)
        return list
      },
      //全局共享
      pageShareToAll: function () {
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              this.shareToAll(uuidList).then(() => {
                this.queryList()
              })
            }
          })
        }
      },
      //全局召回
      pageRecallFromAll: function () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning: 'account.recall',
            ok: () => {
              this.recallFromAll(uuidList).then(() => {
                this.queryList()
              })
            }
          })
        }
      },
      //或得云主机名称
      getVmName: function (uuid) {
        let value
        try {
          value = this.dbData.vm[this.dbData.pcidevice[uuid].vmInstanceUuid].name
        } catch (e) {
          if (checkBounce(`getVmName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'vm', this.dbData.pcidevice[uuid].vmInstanceUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      //启用
      pageEnable: function () {
        let uuidList = this.getAvaiableStateList('Disabled')
        const self = this
        if (uuidList.length > 0) self.enable(uuidList)
      },
      //停用
      pageDisable: function () {
        let uuidList = this.getAvaiableStateList('Enabled')
        let attachedpci = this.selectedList.filter(pci => !!this.dbData.pcidevice[pci].vmInstanceUuid)
        uuidList = _.uniq(_.difference(uuidList, attachedpci))
        const self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            uuidList,
            title: 'gpuDevice.disable',
            description: 'gpuDevice.disableGpuDevice',
            icon: '',
            getName(uuid){
              return self.dbData.pcidevice[uuid].description
            },
            ok: () => {
              self.disable(uuidList)
            }
          })
        }
      },
      //删除
      pageDelete: function () {
        let uuidList = this.getAvaiableStatusList('Inactive')
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            uuidList,
            title: 'gpuDevice.delete',
            description: 'gpuDevice.deleteGpuDevice',
            getName(uuid){
              return self.dbData.pcidevice[uuid].description
            },
            icon: '',
            ok: () => {
              self.delete(uuidList)
            }
          })
        }
      },
      //绑定云主机
      pageAttach: function () {
        let self = this
        let vmInstanceUuid = this.windowData.vmUuid
        self.openSideWindow('GpuDeviceMultiSelectListDlg', {
          vmInstanceUuid,
          select: (uuidList) => self.attach(vmInstanceUuid, uuidList).then(() => self.queryList())
        })
      },
      //是否可以停用
      canDisable () {
        if (!this.isSelected) return false
        let uuidList = this.selectedList
        let canDis = this.hasOnState('Enabled')
        let hasNotAttachedVm = false
        uuidList.forEach(uuid => {
          let pci = this.dbData.pcidevice[uuid]
          let pciVmInstance = pci && pci.vmInstanceUuid
          if (!pciVmInstance) hasNotAttachedVm = true
        })
        return canDis && hasNotAttachedVm
      },
      //解绑云主机
      pageDetach: function () {
        let self = this
        let uuidList = []
        let vmInstanceUuid = this.windowData.vmUuid
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) {
            uuidList.push(uuid)
          }
        })
        if (uuidList.length > 0) {
          this.openDialog('DetachGpuDeviceFromVmConfirmDlg', {
            uuidList,
            ok: () => {
              self.detach(vmInstanceUuid, uuidList).then(() => self.queryList())
            }
          })
        }
      }
    }
  }
</script>

