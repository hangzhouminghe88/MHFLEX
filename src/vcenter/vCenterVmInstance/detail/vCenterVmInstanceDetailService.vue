<script>
  import vCenterVmConfigureTab from 'src/vcenter/vCenterVmInstance/components/configure/vCenterVmConfigureTab';
  import vCenterMonitor from 'src/vcenter/vCenterVmInstance/components/monitor/vCenterMonitor';
  import VCenterCreateVolumePage from "../components/vCenterCreateVolumePage";
  import VmClone from 'src/vcenter/vCenterVmInstance/components/VmClone';
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner';
  import DetailInfoState from 'src/component/DetailInfoState';
  import DetailTemplate from 'src/component/DetailTemplate';
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';

  export default {
    name: "vCenterVmInstanceDetailService",
    components: {
      VCenterCreateVolumePage,
      LogList, DetailTemplate, DetailInfoState, vCenterVmConfigureTab, VmClone, vCenterMonitor},
    mixins: [DetailTemplate, WindowBase, Methods],
    data(){
      return {
        currTab: 'info',
        vCenter: {},
        platformList: [
          'Linux',
          'Windows',
          'Other'
        ],
        haLevelList: ['None', 'NeverStop'],
        showEdit: false,
        showBtn: true,
        tagList: [],
        newTag: '',
        showVmClone: false,
        vmCloneParam: {},
        showCreateVolume: false,
        createVolumeParam: {}
      }
    },

    computed:{
      model: {
        get(){
          let self = this;
          return self.vCenter;
        },
        set(val){
          let self = this;
          if(val) self.vCenter = val;
        }
      },
      nicVal(){
        let self = this;
       if(self.model.vmNics && self.model.vmNics.length > 0)
        return self.model.vmNics.map((item) => {
          if(self.model.defaultL3NetworkUuid === item.l3NetworkUuid){
            return item.ip;
          }
        })
      },
      macVal(){
        let self = this;
        if(self.model.vmNics && self.model.vmNics.length > 0)
        return self.model.vmNics.map((item) => {
          if(self.model.defaultL3NetworkUuid === item.l3NetworkUuid){
            return item.mac;
          }
        })
      },
      eipVal(){
        let self = this;
        return self.windowData.eipList.map((eipUuid) => {
          return {
            eipUuid,
            value: self.dbData.eip[eipUuid] && self.dbData.eip[eipUuid].vipIp
          }
        })
      },
      loadBalancerVal(){
        let self  = this;
        return self.windowData.loadBalancerList.map((lbUuid) => {
          return {
            lbUuid,
            value: self.dbData.loadBalancer[lbUuid] && self.dbData.loadBalancer[lbUuid].name
          }
        })
      },
      portForwardingVal(){
        let self  = this;
        return self.windowData.portForwardingList.map((pfUuid) => {
          return {
            pfUuid,
            value: self.dbData.portforwarding[pfUuid] && self.dbData.portforwarding[pfUuid].name
          }
        })
      }
    },

    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(self)
      self.updateWindow({
        dataUuid,
        portForwardingList:[],
        loadBalancerList: [],
        eipList: []
      }).then(() => {
        self.query();
      })
    },

    methods: {
      ...Utils,

      query() {
        const self = this
        let uuid = this.windowData.dataUuid
        let vmInventories = {}
        rpc.query(`vm-instances`, {
          q: `uuid=${this.windowData.dataUuid}`
        }).then((resp) => {
          vmInventories = resp.inventories[0]
          return this.updateDbRow({
            tableName: 'vm',
            id: this.windowData.dataUuid,
            data: vmInventories
          })
        })
          .then(() => {
            let tasks = []
            let p
            if (this.dbData.common.isAdmin && vmInventories.clusterUuid) {
              p = rpc.queryResourceNames(this, 'host', [vmInventories.clusterUuid])
              tasks.push(p)
            }

            if (vmInventories.hostUuid) {
              p = rpc.queryResourceNames(this, 'host', [vmInventories.hostUuid])
              tasks.push(p)
            }

            if (vmInventories.lastHostUuid) {
              p = rpc.queryResourceNames(this, 'host', [vmInventories.lastHostUuid])
              tasks.push(p)
            }

            if (this.dbData.common.isAdmin) {
              let accountUuid = uuid
              p = rpc.query('accounts/resources/refs', {
                q: `resourceUuid=${accountUuid}`
              }).then((resp) => {
                vmInventories.accountUuid = resp.inventories[0].accountUuid
                return rpc.queryResourceNames(this, 'account', [vmInventories.accountUuid])
              })
              tasks.push(p)
            }

            p = rpc.queryResourceNames(this, 'image', [vmInventories.imageUuid])
            tasks.push(p)

            p = rpc.getResourceAccount([this.windowData.dataUuid], this)
            tasks.push(p)

            let getVcenterUuids = (vm) => {
              return rpc.query('clusters', {q: `uuid=${vm.clusterUuid}`}).then(resp => {
                return this.updateDbRow({
                  tableName: 'vmA',
                  id: vm.uuid,
                  data: {
                    vCenterUuid: resp.inventories[0].vCenterUuid
                  }
                })
              })
            }

            if (this.dbData.common.isAdmin) {
              p = getVcenterUuids(vmInventories)
              tasks.push(p)
            }

            if (this.dbData.common.isAdmin) {
              p = rpc.query('vcenters').then(resp => {
                return this.updateDbTable({
                  tableName: 'vCenters',
                  list: resp.inventories
                })
              })
              tasks.push(p)
            }

            p = rpc.queryResourceNames(this, 'instanceOffering', [vmInventories.instanceOfferingUuid])
            tasks.push(p)
            let vmNics = _.cloneDeep(this.dbData.vm[this.windowData.dataUuid].vmNics)
            let l3NetworkUuidList = _.uniq(vmNics.map((item) => item.l3NetworkUuid))
            p = rpc.query('l3-networks', {
              q: `uuid?=${l3NetworkUuidList}`
            }).then((resp) => {
              if (resp.inventories.length === 0) return
              let dnsList = []
              resp.inventories.forEach((item) => {
                dnsList = dnsList.concat(item.dns)
              })
              this.updateWindow({ dnsList: dnsList })
              return this.updateDbTable({
                tableName: 'l3network',
                list: resp.inventories
              })
            })
            tasks.push(p)

            p = rpc.query('user-tags', {
              q: `resourceUuid=${this.windowData.dataUuid}`
            }).then((resp) => {
              this.tagList = resp.inventories
            })
            tasks.push(p)

            if (vmInventories.vmNics.length !== 0) {
              let eipList = []
              let vmNicUuidList = vmInventories.vmNics.map((item) => item.uuid)
              p = rpc.query('eips', {
                q: `vmNicUuid?=${vmNicUuidList}`
              })
                .then((eipResp) => {
                  eipList = eipResp.inventories.map(it => it.uuid)
                  return this.updateWindow({ eipList }).then(() => {
                    self.updateDbTable({
                      tableName: 'eip',
                      list: eipResp.inventories
                    })
                  })
                })
              tasks.push(p)
            }

            if (vmInventories.vmNics.length !== 0) {
              let loadBalancerList = []
              let vmNicUuidList = vmInventories.vmNics.map((item) => item.uuid)
              p = rpc.query('load-balancers', {
                q: `listeners.vmNic.uuid?=${vmNicUuidList}`
              })
                .then((lbResp) => {
                  loadBalancerList = lbResp.inventories.map(it => it.uuid)
                  return this.updateWindow({ loadBalancerList }).then(() => {
                    self.updateDbTable({
                      tableName: 'loadBalancer',
                      list: lbResp.inventories
                    })
                  })
                })
              tasks.push(p)
            }

            if (vmInventories.vmNics.length !== 0) {
              let vmNicUuidList = vmInventories.vmNics.map((item) => item.uuid)
              p = rpc.query('security-groups', {
                q: `vmNic.uuid?=${vmNicUuidList}`
              })
                .then((resp) => {
                  return this.updateWindow({ securityGroupList: resp.inventories })
                })
              tasks.push(p)
            }

            if (vmInventories.vmNics.length !== 0) {
              let portForwardingList = []
              let vmNicUuidList = vmInventories.vmNics.map((item) => item.uuid)
              p = rpc.query('port-forwarding', {
                q: `vmNicUuid?=${vmNicUuidList}`
              })
                .then((pfResp) => {
                  portForwardingList = pfResp.inventories.map((item) => item.uuid)
                  return this.updateWindow({ portForwardingList }).then(() => {
                    self.updateDbTable({
                      tableName: 'portforwarding',
                      list: pfResp.inventories
                    })
                  })
                })
              tasks.push(p)
            }

            p = rpc.query(`vm-instances/${this.windowData.dataUuid}/ssh-keys`)
              .then((resp) => {
                if (resp.sshKey) this.updateWindow({ sshKey: resp.sshKey })
                else this.updateWindow({ sshKey: '' })
              })
            tasks.push(p)

            p = rpc.query(`vm-instances/${this.windowData.dataUuid}/qga`)
              .then((resp) => {
                this.updateWindow({ QGA: resp.enable })
              })
            tasks.push(p)

            if (this.dbData.common.isAdmin) {
              let uuid
              vmInventories.allVolumes.forEach((item) => {
                if (item.type === 'Root') uuid = item.primaryStorageUuid
              })
              p = this.updateWindow({primarystorageUuid: uuid})
                .then(() => {
                  return rpc.query('primary-storage', {
                    q: `uuid=${uuid}`
                  })
                })
                .then((resp) => {
                  return this.updateDbRow({
                    tableName: 'primarystorage',
                    id: uuid,
                    data: resp.inventories[0]
                  })
                })
              tasks.push(p)
            }
            p = rpc.query('system-tags', {
              q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=VmInstanceVO']
            })
              .then((resp) => {
                vmInventories = _.assign(vmInventories, { 'systemTag': resp.inventories })
                let isoUuid = ''
                resp.inventories.forEach(it => {
                  if (it.tag.indexOf('iso') > -1) {
                    isoUuid = it.tag.split('::')[1]
                  }
                })
                return rpc.queryResourceNames(this, 'image', [isoUuid])
                  .then(() => {
                    return this.updateWindow({ isoUuid })
                  })
              })
            tasks.push(p)

            p = rpc.query(`vm-instances/${this.windowData.dataUuid}/capabilities`)
              .then((resp) => {
                vmInventories = _.assign(vmInventories, resp)
              })
            tasks.push(p)

            p = rpc.query(`vm-instances/${this.windowData.dataUuid}/ha-levels`).then(resp => {
              let level = resp.level === 'NeverStop' ? 'NeverStop' : 'None'
              let obj = {haLevel: level}
              vmInventories = _.assign(vmInventories, obj)
            })
            tasks.push(p)

            p = rpc.query('volumes/vm-instances/refs', {
              q: `vmInstanceUuid=${this.windowData.dataUuid}`,
              fields: 'volumeUuid'
            })
              .then((resp) => {
                if (resp.inventories.length > 0) vmInventories.hasShareVolume = true
                else vmInventories.hasShareVolume = false
              })
            tasks.push(p)
            Promise.all(tasks)
              .then((resp) => {
                if (_.has(this.dbData.vm[uuid], 'haLevel')) vmInventories.haLevel = this.dbData.vm[uuid].haLevel
                if (_.has(this.dbData.vm[uuid], 'vnc')) vmInventories.vnc = this.dbData.vm[uuid].vnc
                return this.updateDbRow({
                  tableName: 'vm',
                  id: vmInventories.uuid,
                  data: vmInventories
                }).then(() => {
                  this.model = _.get(self.dbData.vm, this.windowData.dataUuid);
                })
              })
          })
      },

      inState(){
        let states = [], self = this, inState = false;
        if(arguments){
          for(let arg in arguments){
            states.push(arguments[arg]);
          }
        }
        inState =  states.some(state => self.model.state === state);
        return inState;
      },

      updateResourceParam(name){
        let self = this;
        return {
          getValue(){
            return self.model[name];
          },
          setValue(newVal){
            if(newVal === self.model[name]) return;
            self.updateReource(name, newVal);
          },
          canEdit(){
            return true;
          }
        }
      },

      updateReource(key, newValue){
        if (key === 'name' && !String(newValue).trim()) return
        if (this.dbData.vm[this.windowData.dataUuid][key] === newValue) return
        let self = this
        let event = self.createEvent('common.updateInfo' + key, newValue)
        let param = {}
        param[key] = newValue
        rpc.update('vm-instances', self.windowData.dataUuid, {
          'updateVmInstance': param
        }, event)
          .then(resp => {
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'vm',
              id: self.windowData.dataUuid,
              data: resp.inventory
            }).then(() => {
              self.$forceUpdate()
            })
          }, () => {
            self.incEventFail(event)
          }).then(() => {
            self.query();
        })
      },

      updateHaLevel: function (uuid, haLevel) {
        let ha = this.dbData.vm[uuid] && this.dbData.vm[uuid].haLevel
        if (ha === haLevel) return
        if (haLevel === 'NeverStop') {
          this.setVmInstanceHaLevel(uuid)
        } else {
          this.deleteVmInstanceHaLevel(uuid)
        }
      },

      setVmInstanceHaLevel: function (uuid) {
        const self = this
        let event = self.createEvent('vm.action.updateInfo', self.$t('vm.haLevel'))
        rpc.create(`vm-instances/${uuid}/ha-levels`, {
          level: 'NeverStop'
        }, event).then((resp) => {
          self.incEventSuccess(event)
          let data = _.cloneDeep(self.dbData.vm[uuid])
          data.haLevel = 'NeverStop'
          self.updateDbRow({
            tableName: 'vm',
            id: uuid,
            data: data
          })
        }, () => {
          self.incEventFail(event)
        }).then(() => this.query())
      },
      deleteVmInstanceHaLevel: function (uuid) {
        const self = this
        let event = self.createEvent('vm.action.updateInfo', self.$t('vm.haLevel'))
        rpc._delete(`vm-instances/${uuid}/ha-levels`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
            if (_.has(self.dbData.vm[uuid], 'haLevel')) {
              delete self.dbData.vm[uuid].haLevel
              let data = _.cloneDeep(self.dbData.vm[uuid])
              self.updateDbRow({
                tableName: 'vm',
                id: uuid,
                data: data
              })
            }
          }, () => {
            self.incEventFail(event)
          }).then(() => this.query())
      },

      showCreateTag(){
        let self = this;
        self.newTag = '';
        self.showEdit = true;
        self.showBtn= false;
        self.$nextTick(() => {
          self.$refs.tagInput.focus()
        })
      },

      deleteTag: function (tag) {
        let self = this
        this.openDialog('SimpleConfirmDlg', {
          text:self.$t('vm.confirmDeleteTag') + tag.tag + '?',
          title: self.$t('vm.action.deleteUserTag'),
          getOkText:() => {},
          getCancelText: () => {},
          ok: () => {
            let event = this.createEvent('vm.action.deleteUserTag')
            rpc._delete(`tags/${tag.uuid}`)
              .then((resp) => {
                self.tagList = self.tagList.filter((it) => { return it.uuid !== tag.uuid })
                this.incEventSuccess(event)
              }, () => {
                this.incEventFail(event)
              })
          }
        })
      },

      createTag: function (tag) {
        let self = this;
        self.showEdit = false; self.showBtn= true;
        if(!tag) return;
        let event = this.createEvent('vm.action.addUserTag')
        rpc.create('user-tags', {
          resourceType: 'VmInstanceVO',
          resourceUuid: this.windowData.dataUuid,
          tag
        }, event).then((resp) => {
          this.tagList.push(resp.inventory)
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
      },

      inStates(){
        let self = this, states = [];
        for(let arg in arguments){
          states.push(arguments[arg]);
        }
        let inState = states.some((state) => self.model.state === state);
        return inState;
      },

      enableDetachVolume() {
        let self = this;
        return self.inStates('Stopped', 'Running') && self.isAttachVolume([self.windowData.dataUuid])
      },

      detailStart(){
        let self = this;
        self.start([self.windowData.dataUuid]);
      },

      detailNormalOperation(param){
        let confirmDlgType = param.replace(/\b(\w)/, (m)=> {return m.toUpperCase()}), self = this;
        self.openDialog('NormalVmInstanceConfirmDlg', {
          'confirmDlgType': confirmDlgType,
          uuidList: [self.windowData.dataUuid],
          ok: (stopHa) => {
            self[param]([self.windowData.dataUuid], stopHa)
          }
        })
      },

      detailMigrate: async function () {
        let self = this
        let vmUuid = [self.windowData.dataUuid];
        return rpc.query(`vm-instances/${vmUuid}/migration-target-hosts`)
          .then((resp) => {
            let hostUuidList = resp.inventories.map((item) => item.uuid)
            self.openDialog('HostListMultiSelectDlg', {
              hostUuidList: hostUuidList,
              select: (hostUuid) => {
                self.migrate(vmUuid, hostUuid)
              }
            })
          })
      },

      detailChangeInstanceOffering () {
        const self = this
        let uuidList = _.filter([self.windowData.dataUuid], (uuid) => {
          return _.includes(['Stopped'], self.dbData.vm[uuid].state)
        })
        if (uuidList.length > 0) {
          let instanceOfferingUuid = _.get(self.dbData.vm, [uuidList[0], 'instanceOfferingUuid'])
          instanceOfferingUuid = _.every(uuidList, (uuid) => _.get(self.dbData.vm, [`${uuid}`, 'instanceOfferingUuid']) === instanceOfferingUuid) ? instanceOfferingUuid : ''
          let conditions = ['state!=Disabled', 'type=UserVm']
          if (instanceOfferingUuid) conditions.push(`uuid!=${instanceOfferingUuid}`)
          self.openDialog('InstanceOfferingListSingleSelectDlg', {
            conditions: conditions,
            select: (uuid) => {
              // filter vm
              let list = _.filter(uuidList, (vmUuid) => {
                return _.get(self.dbData.vm, [`${vmUuid}`, 'instanceOfferingUuid']) !== uuid
              })
              if (list.length === 0) return
              self.changeInstanceOffering(list, uuid)
            }
          })
        }
      },

      detailChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
      },

      detailSetHaLevel: function () {
        let self = this
        let uuidList = [self.windowData.dataUuid];
        if (uuidList.length === 1) {
          self.openDialog('SetHaLevelDlg', {
            uuidList: uuidList,
            haLevel: self.dbData.vm[self.windowData.dataUuid].haLevel ? self.dbData.vm[self.windowData.dataUuid].haLevel : 'None',
            ok: (msg) => {
              self.updateHaLevel(uuidList, msg)
            }
          })
        } else {
          self.openDialog('SetHaLevelDlg', {
            uuidList: uuidList,
            haLevel: 'None',
            ok: (msg) => {
              self.updateHaLevel(uuidList, msg)
            }
          })
        }
      },

      detailOpenConsole() {
        let self = this;
        self.openConsole(self.windowData.dataUuid);
      },

      detailSetVmConsolePassword() {
        let self = this
        let state = this.dbData.vm[self.windowData.dataUuid] ? this.dbData.vm[self.windowData.dataUuid].state : ''
        self.openDialog('ModifyVmConsolePasswordConfirmDlg', {
          state: state,
          ok: (msg, isReboot) => {
            self.setVmConsolePassword(selectedUuidList, msg, isReboot)
          }
        })
      },

      detailLoadVolume() {
        let self = this
        let selectedUuidList = [self.windowData.dataUuid];
        self.openDialog('VolumeMultiSelectListDlg', {
          uuid: selectedUuidList,
          select: (volumeUuidList) => self.attachDataVolumeToVm(volumeUuidList, selectedUuidList[0]).then(() => self.query())
        })
      },

      detailUnloadVolume() {
        let uuid = [this.windowData.dataUuid];
        let self = this
        let volumeList = []
        let taskList = []
        let p = rpc.query('volumes', {
          q: `vmInstanceUuid=${uuid}`,
          fields: 'uuid'
        }).then(resp => {
          volumeList = volumeList.concat(resp.inventories.map(item => item.uuid))
        })
        taskList.push(p)
        p = rpc.query('volumes/vm-instances/refs', {
          q: `vmInstanceUuid=${uuid}`,
          fields: 'volumeUuid'
        }).then(resp => {
          volumeList = volumeList.concat(resp.inventories.map(item => item.volumeUuid))
        })
        taskList.push(p)
        return Promise.all(taskList).then(() => {
          volumeList = _.uniq(volumeList)
          const openConfirm = (uuidList, callback) => self.openDialog('ConfirmDlg', {
            title: 'volume.detach',
            description: 'vm.detachVolume',
            uuidList: uuidList,
            icon: 'volume_n',
            warning: 'vm.detachVolumeWarning',
            getName: uuid => self.dbData.volume[uuid].name,
            ok: () => {
              self.detachDataVolumeFromVm(uuidList, self.windowData.dataUuid)
                .then(() => {
                  self.query()
                })
            }
          })
          return self.openDialog('VolumeMultiSelectListDlg', {
            conditions: [`uuid?=${volumeList}`, 'type=Data'],
            ok: openConfirm
          })
        })
      },

      detailClone(){
        this.openClonePanel(this.windowData.dataUuid, (resp) => {
          if (resp.numberOfClonedVm > 0) {
            this.query()
          }
        })
      },

      //是否展示创建云盘页
      createVolume(param) {
        let self = this;
        self.createVolumeParam = param;
        self.showCreateVolume = true;
      }
    }
  }
</script>
