import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
import DetailInfoState from 'src/component/DetailInfoState';
import DetailTemplate from 'src/component/DetailTemplate';
import LogList from "../../../component/LogList";
import WindowBase from 'src/windows/Window';
import Utils from 'src/utils/utils';
import rpc  from 'src/utils/rpc';
import Methods from '../Methods';

export default {
  components: {LogList, DetailTemplate, DetailInfoState},
  mixins: [WindowBase, Methods],
  data() {
    return {
      currTab: 'info',
      volume: {}
    }
  },
  computed: {
    model: {
      get() {
        let self = this;
        return self.volume;
      },
      set(val) {
        let self = this;
        self.volume = val;
      }
    }
  },
  created(){
    let self = this, dataUuid = '';
    self.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(self);
    dataUuid = self.$route.params.uuid;
    self.updateWindow({
      dataUuid
    }).then(() => {
      self.query();
    })
  },
  methods: {
    ...Utils,

    query() {
      let volumeInventories
      return rpc.query(`volumes/${this.windowData.dataUuid}`)
        .then((resp) => {
          volumeInventories = resp.inventories[0]
          if (this.dbData.common.isAdmin) {
            return rpc.query('accounts/resources/refs', {
              q: `resourceUuid=${volumeInventories.uuid}`
            })
          } else {
            return new Promise((resolve, reject) => { resolve() })
          }
        })
        .then((resp) => {
          if (this.dbData.common.isAdmin && resp.inventories.length > 0) {
            volumeInventories.accountUuid = resp.inventories[0].accountUuid
            return rpc.query('accounts', {
              q: `uuid=${resp.inventories[0].accountUuid}`
            })
              .then((resp) => {
                if (resp.inventories.length > 0) {
                  return this.updateDbRow({
                    tableName: 'account',
                    id: resp.inventories[0].uuid,
                    data: resp.inventories[0]
                  })
                } else {
                  return new Promise((resolve, reject) => { resolve() })
                }
              })
          } else {
            return new Promise((resolve, reject) => { resolve() })
          }
        })
        .then(() => {
          if (this.dbData.common.isAdmin) {
            return rpc.query('vcenters').then(resp => {
              return this.updateDbTable({
                tableName: 'vCenters',
                list: resp.inventories
              })
            })
          } else return new Promise((resolve, reject) => { resolve() })
        })
        .then(() => {
          return rpc.query(`vm-instances/${volumeInventories.vmInstanceUuid}`)
        })
        .then((resp) => {
          if (resp.inventories.length === 0) return new Promise((resolve, reject) => { resolve() })
          return this.updateDbRow({
            tableName: 'vm',
            id: resp.inventories[0].uuid,
            data: resp.inventories[0]
          })
        })
        .then(() => {
          if (this.dbData.common.isAdmin) {
            return rpc.query('primary-storage', {
              q: `uuid=${volumeInventories.primaryStorageUuid}`
            })
          } else {
            return new Promise((resolve, reject) => { resolve() })
          }
        })
        .then((resp) => {
          if (this.dbData.common.isAdmin) {
            if (resp.inventories.length === 0) return new Promise((resolve, reject) => { resolve() })
            return this.updateDbRow({
              tableName: 'volumeA',
              id: volumeInventories.uuid,
              data: {
                vCenterUuid: resp.inventories[0].vCenterUuid
              }
            }).then(() => {
              return this.updateDbRow({
                tableName: 'primarystorage',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            })
          } else {
            return new Promise((resolve, reject) => { resolve() })
          }
        })
        .then(() => {
          if (volumeInventories.isShareable) {
            return rpc.query('volumes/vm-instances/refs', {
              q: `volumeUuid=${volumeInventories.uuid}`
            })
              .then((resp) => {
                if (resp.inventories.length > 0) {
                  volumeInventories.vmInstanceUuid = []
                  resp.inventories.forEach((volumeRefs) => {
                    volumeInventories.vmInstanceUuid.push(volumeRefs.vmInstanceUuid)
                  })
                } else volumeInventories.vmInstanceUuid = ''
              })
          } else return new Promise((resolve, reject) => { resolve() })
        })
        .then(() => {
          if (!this.dbData.common.isOpensource) {
            return rpc.query(`volumes/${this.windowData.dataUuid}/qos`)
              .then((resp) => {
                volumeInventories.volumeTotalBandwidth = resp.volumeBandwidth
                return this.updateDbRow({
                  tableName: 'volumesQos',
                  id: this.windowData.dataUuid,
                  data: {
                    volumeBandwidth: resp.volumeBandwidth
                  }
                })
              })
          } else {
            return new Promise((resolve, reject) => { resolve() })
          }
        })
        .then(() => {
          return rpc.query('system-tags', {
            q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=InstanceOfferingVO']
          })
        })
        .then((resp) => {
          this.updateDbTable({
            tableName: 'systemtags',
            list: resp.inventories
          })
          resp.inventories.forEach((item) => {
            let val = item.tag.split('::')
            let data = {}
            data[val[0]] = parseInt(val[1])
            // this.updateWindow(obj)
            return this.updateDbRow({
              tableName: 'volume',
              id: this.windowData.dataUuid,
              data
            })
          })
        })
        .then(() => {
          return rpc.query(`volumes/${this.windowData.dataUuid}/capabilities`)
        })
        .then((resp) => {
          this.updateDbRow({
            tableName: 'volumesCapabilities',
            id: this.windowData.dataUuid,
            data: resp.capabilities
          })
          let capabilitiesInventory = resp.capabilities
          capabilitiesInventory.uuid = this.windowData.dataUuid
          return this.updateDbTable({
            tableName: 'capabilities',
            list: [capabilitiesInventory]
          })
        })
        .then(() => {
          return rpc.query('system-tags', {
            q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=VolumeVO']
          })
        })
        .then((resp) => {
          resp.inventories.forEach((item) => {
            if (item.tag.indexOf('kvm::volume::') > -1) {
              volumeInventories.WWN = item.tag.split('::')[2]
            }
            if (item.tag.indexOf('capability::virtio-scsi') > -1) {
              volumeInventories.systemTagsVirtioSCSI = 'VirtioSCSI'
            }
          })
          return this.updateDbRow({
            tableName: 'volume',
            id: volumeInventories.uuid,
            data: volumeInventories
          })
        })
        .then(() => {
          rpc.getResourceAccount([volumeInventories.uuid], this)
          return this.updateDbRow({
            tableName: 'volume',
            id: volumeInventories.uuid,
            data: volumeInventories
          })
        }).then(() => {
          this.isImageStoreInZone()
        }).then(() => {
          this.model = _.assign({}, this.dbData.volume[this.windowData.dataUuid], this.dbData.volumeA[this.windowData.dataUuid]);
        })
    },

    updateResourceParam(param){
      let self = this;
      return {
        getValue: () => {
          return self.model[param];
        },
        setValue: (newVal) => {
          if(_.isEqual(newVal, self.model[param])) return;
          self.updateResource('volumes', 'updateVolume', param, 'volume', newVal, self.query)
        },
        canEdit: () =>{
          return true;
        }
      }
    },

    canAttach() {
      let self = this;
      if (!self.model.isShareable && self.model.vmInstanceUuid) return false
      if (self.model.state !== 'Enabled' || ['Ready', 'NotInstantiated'].indexOf(self.model.status) === -1) return false
      return true
    },

    canDetach() {
      let self = this;
      if (self.model && !self.model.vmInstanceUuid) return false
      return true
    },

    attachVolume () {
      let volumeUuid = this.windowData.dataUuid
      let self = this
      rpc.query(`volumes/${volumeUuid}/candidate-vm-instances`)
        .then((resp) => {
          let attachableVmUuidList = resp.inventories.map((item) => item.uuid)
          if (self.dbData.volume[volumeUuid].isShareable) {
            self.openDialog('VmInstanceMultiSelectListDlg', {
              conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX'],
              select: (uuidList) => {
                self.attachToVm(volumeUuid, uuidList).then(() => {
                  if (self.dbData.volume[volumeUuid].status === 'NotInstantiated') {
                    self.query()
                  }
                  self.query()
                })
              }
            })
          } else {
            self.openDialog('VmSingleSelectListDlg', {
              conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX'],
              ok: (uuid) => {
                self.attachToVm(volumeUuid, [uuid]).then(() => {
                  if (self.dbData.volume[volumeUuid].status === 'NotInstantiated') {
                    self.query()
                  }
                  self.query()
                })
              }
            })
          }
        })
    },

    isRoot () {
      let self = this;
      return self.model.type === 'Root'
    },

    detachVolume () {
      let self = this;
      if (this.dbData.volume[this.windowData.dataUuid].isShareable) {
        let vmInstanceUuidList = []
        rpc.query('volumes/vm-instances/refs', {
          q: `volumeUuid=${this.windowData.dataUuid}`
        })
          .then((resp) => {
            vmInstanceUuidList = resp.inventories.map(item => item.vmInstanceUuid)
            this.openDialog('VmInstanceMultiSelectListDlg', {
              conditions: [`uuid?=${vmInstanceUuidList}`],
              ok: (uuidList) => {
                this.detachSharebelVolume(this.windowData.dataUuid, uuidList).then(() => {
                  this.query()
                })
              }
            })
          })
      } else {
        this.openDialog('ConfirmDlg',{
          title: 'vm.volume.detach',
          description: 'volume.detachVolume',
          uuidList: [self.windowData.dataUuid],
          icon: 'volume_popupico',
          ok: () => {
            this.detach([self.windowData.dataUuid]).then(() => this.query())
          },
          getName: (uuid) =>{
            return this.dbData.volume[uuid].name;
          }
        })
      }
    },

    detailChangeResourceOwner: async function () {
      const self = this
      self.changeResourceOwnerDlg([self.windowData.dataUuid], self.changeResourceToAccountOrProject, self.query)
    },

    deleteVolume() {
      let self = this
      let uuidList = []
      uuidList.push(this.windowData.dataUuid)
      this.openDialog('ConfirmDlg', {
        title: 'volume.delete',
        description: 'volume.info.deleteConfirm',
        icon: 'volume_popupico',
        warning: 'volume.deleteWarning',
        uuidList,
        ok: () => {
          self.delete(uuidList)
            .then(() =>{
              self.$router.push({name: 'vcentervolume'})
            })
        },
        getName: (uuid) => {
          return self.dbData.volume[uuid].name;
        }
      })
    },

    recoverVolume () {
      let event = this.createEvent('volume.action.recover', this.dbData.volume[this.windowData.dataUuid].name)
      rpc.update('volumes', this.windowData.dataUuid, {
        'recoverDataVolume': {}
      }, event)
        .then((resp) => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        }).then(() => {
          this.query();
      })
    },

    expungeVolume () {
      let uuidList = [this.windowData.dataUuid], self = this;
      this.openDialog('ConfirmDlg', {
        title: 'volume.delete',
        description: 'volume.info.deleteConfirm',
        icon: 'volume_popupico',
        warning: 'volume.deleteWarning',
        uuidList,
        ok: () => {
          self.expunge(uuidList)
            .then(() =>{
              self.$router.push({name: 'vcentervolume'})
            })
        },
        getName: (uuid) => {
          return self.dbData.volume[uuid].name;
        }
      })
    },

    expunge (uuid) {
      let event = this.createEvent('volume.action.expunge', this.dbData.volume[uuid].name)
      return rpc.update('volumes', uuid, {
        'expungeDataVolume': {}
      }, event)
        .then((resp) => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
    },
  }
}
