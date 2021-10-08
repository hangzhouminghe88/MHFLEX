<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VmInstanceMethods from 'src/ecs/ecsInstance/Methods';
  import WindowBase from 'src/windows/Window'
  import rpc from 'src/utils/rpc';

  export default {
    name: "NetworkTabListService",
    mixins: [VmInstanceMethods, MultiSelectList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {

        }
      }
    },

    data() {
      let self = this;
      return {
        itemList: [],
        defaultVal: ''
      }
    },
    computed: {
      isDefault: {
        get() {
          let self = this;
          return self.defaultVal === self.dbData.vm[self.windowData.dataUuid].defaultL3NetworkUuid
        },
        set(val) {
          let self = this;
          self.defaultVal = val;
        }
      }
    },

    created() {
      let dataUuid = this.param.conditions.vmUuid
      this.updateWindow({
        dataUuid: dataUuid,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: this.init
        }
      })
        .then(() => {
          return this.init()
        })
    },

    methods: {
      init() {
        const self = this
        let vmUuid = self.windowData.dataUuid
        rpc.query(`vm-instances/nics`, {
          q: `vmInstanceUuid=${vmUuid}`
        })
          .then(resp => {
            let table = {}
            let uuidList = resp.inventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            return self.updateDbTable({
              tableName: 'vmNicRefs',
              list: resp.inventories
            }).then(() => {
              return self.updateWindow({uuidList, table})
            }).then(() => {
              return rpc.query(`vm-instances`, {
                q: `uuid=${vmUuid}`
              }).then(vmResp => {
                if (!_.has(vmResp.inventories[0], 'defaultL3NetworkUuid') && resp.inventories.length > 0) {
                  let length = resp.inventories.length
                  let index = Math.floor(Math.random() * length)
                  let l3Uuid = resp.inventories[index].l3NetworkUuid
                  return rpc.update('vm-instances', vmUuid, {
                    updateVmInstance: {
                      'defaultL3NetworkUuid': l3Uuid
                    }
                  }).then(() => {
                    return self.updateDbRow({
                      tableName: 'vm',
                      id: vmUuid,
                      data: {
                        'defaultL3NetworkUuid': l3Uuid
                      }
                    })
                  })
                } else {
                  return self.updateDbRow({
                    tableName: 'vm',
                    id: vmUuid,
                    data: vmResp.inventories[0]
                  })
                }
              })
            }).then(() => self.queryQos(uuidList))
              .then(() => self.queryStaticIp(uuidList))
              .then(() => self.queryL3Network(uuidList))
              .then(() => self.itemList = self.getItemList())
          })
      },

      getItemList() {
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.vmNicRefs[uuid];
        })
      },

      queryQos(uuidList) {
        if (!this.dbData.common.isOpensource) {
          uuidList.forEach((uuid) => {
            rpc.query(`vm-instances/${uuid}/nic-qos`)
              .then((resp) => {
                let vmNic = _.cloneDeep(this.dbData.vmNicRefs[uuid])
                vmNic.inboundBandwidth = resp.inboundBandwidth
                vmNic.outboundBandwidth = resp.outboundBandwidth
                this.updateDbRow({
                  tableName: 'vmNicRefs',
                  id: uuid,
                  data: vmNic
                })
              })
          })
        }
      },

      queryL3Network(uuidList) {
        rpc.query(`l3-networks`, {
          q: `vmNic.uuid?=${uuidList}`
        }).then((resp) => {
          let l3network = _.cloneDeep(this.dbData.l3network)
          let list = []
          resp.inventories.forEach(item => {
            let _item = item
            if (l3network[item.uuid]) {
              _item = {
                ...l3network[item.uuid],
                ...item
              }
            }
            list.push(_item)
          })
          this.updateDbTable({
            tableName: 'l3network',
            list: list
          })
        })
      },

      queryStaticIp(uuidList) {
        rpc.query(`system-tags`, {
          q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=VmInstanceVO']
        })
          .then((resp) => {
            resp.inventories.forEach((item) => {
              if (item.tag.indexOf('staticIp::') > -1) {
                let l3NetworkUuid = item.tag.split('::')[1]
                for (let i = 0; i < uuidList.length; ++i) {
                  let vmNic = _.cloneDeep(this.dbData.vmNicRefs[uuidList[i]])
                  if (vmNic.l3NetworkUuid === l3NetworkUuid) {
                    vmNic.isStatic = true
                    this.updateDbRow({
                      tableName: 'vmNicRefs',
                      id: vmNic.uuid,
                      data: vmNic
                    })
                  }
                }
              }
            })
          })
      },

      changeDefault(nicUuid) {
        let self = this
        let vmNicRefs = _.cloneDeep(this.dbData.vmNicRefs[nicUuid])
        this.openDialog('SetdefaultL3NetworkConfirmDlg', {
          data: vmNicRefs.internalName,
          ok: () => {
            let event = self.createEvent('vm.action.setDefaultNic', self.dbData.vm[this.windowData.dataUuid].name)
            let uuid = self.windowData.dataUuid
            rpc.update('vm-instances', `${uuid}`, {
              updateVmInstance: {
                'defaultL3NetworkUuid': vmNicRefs.l3NetworkUuid
              }
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                let data = _.cloneDeep(self.dbData.vm[uuid])
                data.defaultL3NetworkUuid = vmNicRefs.l3NetworkUuid
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: data
                })
              }, () => {
                self.incEventFail(event)
              })
          }
        })
      },

      canAttach () {
        return !this.isSelected && this.inStates(['Stopped', 'Running'])
      },

      attach: function () {
        const self = this
        let privateNetworkUuidList = []
        let taskList = []
        let p = rpc.query(`vm-instances/${this.windowData.dataUuid}/l3-networks-candidates`, {
        }).then((resp) => {
          privateNetworkUuidList = privateNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)
        Promise.all(taskList)
          .then(() => {
            self.openDialog('vCenterPrivateAndPublicMultiSelectListConfirmDlg', {
              vmInstanceUuid: self.windowData.dataUuid,
              conditions: [`uuid?=${privateNetworkUuidList}`],
              select: (l3NetworkUuidList) => self.attachL3NetworkToVm(l3NetworkUuidList, self.windowData.dataUuid).then(() => self.init())
            })
          })
      },

      inStates() {
        let stateList = [],self = this;
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        if(!self.dbData.vm[self.windowData.dataUuid]) return false;
        let instate = stateList.some((item) => {
          return item === self.dbData.vm[self.windowData.dataUuid].state;
        })
        return !instate;
      },

      detach() {
        if (!this.isSelected) return
        let uuidList = []
        this.selectedList.forEach((uuid) => {
           uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'common.detechVmNic',
            icon: 'physical_interface_popupico',
            description: 'vm.detechVmNic',
            warning: 'vm.info.detachVmNicWarning',
            getName(uuid){
              return self.dbData.vmNicRefs[uuid].internalName;
            },
            ok: () => {
              self.detachL3NetworkFromVm(self.selectedList).then(() => {
                self.init()
              })
            }
          })
        }
      },
    }
  }
</script>
