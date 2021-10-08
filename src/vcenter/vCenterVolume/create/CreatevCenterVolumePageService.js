import vCenterVolumeMethods from 'src/vcenter/vCenterVolume/Methods';
import CreateTemplate from 'src/component/CreateTemplate';
import WindowBase from 'src/windows/Window';
import rpc from 'src/utils/rpc';

export default {
  mixins: [WindowBase, vCenterVolumeMethods],
  components: {CreateTemplate},

  data(){
    return {
      name: '',
      emptyname: false,
      description: '',
      createMethods: true,
      primaryStorageUuid: '',
      emptyprimaryStorageUuid: false,
      vmInstanceUuid: '',
      emptyvmInstanceUuid: false,
      volumeOfferingUuid: '',
      imageUuid: '',
      isVolumeImageAvailableConditions: ['state=Enabled', 'type=zstack', 'status=Ready', 'system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType=DataVolumeTemplate', 'format=vmtx'],
      isVolumeImageExistedConditions: ['type=zstack', 'status!=Deleted', 'system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType=DataVolumeTemplate'],
      isVmInstanceAvailableConditions: ['state?=Running,Stopped', 'hypervisorType=ESX', 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`],
      isVmInstanceExistedConditions: ['hypervisorType=ESX', 'state!=Destroyed', 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`],
      showPrimaryStorageOption: false,
      primaryStorageForVolumeImageUuid: '',
      emptyprimaryStorageForVolumeImageUuid: false,
      poolUuidForVolumeImageUuid: '',
      emptyvolumeOfferingUuid: false,
      emptyimageUuid: false,
      poolUuid: '',
      VirtioSCSI: false,
      shareable: false,
    }
  },

  methods: {
    openVolumeOfferingSelect(){
      const self = this
      self.openDialog('VolumeOfferingListSingleSelectList', {
        conditions: ['state=Enabled'],
        select: (uuid) => self.selectVolumeOffering(uuid)
      })
    },

    removeUuid(uuid){
     let self = this;
     self[uuid] = '';
     self.validate(uuid);
    },

    selectVolumeOffering(uuid){
     let self = this;
     self.volumeOfferingUuid = uuid;
     self.validate('volumeOfferingUuid')
    },

    openVolumeImageSelect(){
      const self = this
      self.openDialog('ImageSingleSelectListDlg', {
        conditions: this.isVolumeImageAvailableConditions,
        imageType: 'DataVolumeTemplate',
        select: (uuid) => self.selectVolumeImage(uuid)
      })
    },

    selectVolumeImage(uuid){
      let self = this;
      self.imageUuid = uuid;
      self.validate('imageUuid');
    },

    openPrimaryStorageSelect(){
      const self = this
      self.openDialog('PrimaryStorageListSingleSelectList', {
        conditions: ['type=VCenter', 'state=Enabled', 'status=Connected'],
        select: (uuid) => self.selectPrimaryStorage(uuid)
      })
    },

    selectPrimaryStorage(uuid){
     let self = this;
     self.primaryStorageUuid = uuid;
     self.validate('primaryStorageUuid')
    },

    openPrimaryStoragePoolDlg(){
      const self = this
      self.validate('primaryStorageUuid');
      let primaryStorageUuid = self.primaryStorageUuid
      if (!primaryStorageUuid) {
        self.emptyprimaryStorageUuid = true
        return
      }
      self.openDialog('CephPoolSingleDlg', {
        conditions: [`primaryStorageUuid=${primaryStorageUuid}`, 'type=Data'],
        select: (uuid) => self.selectPrimaryStoragePool(uuid)
      })
    },

    selectPrimaryStoragePool(uuid){
      const self = this
      let pool = _.cloneDeep(self.dbData.pool[uuid])
      self.poolName = pool.poolName;
      self.poolUuid = uuid;
    },

    async openHostDlg(){
      const self = this
      let conditions = [`cluster.primaryStorage.uuid=${self.primaryStorageUuid}`, `state=Enabled`]
      if (self.volumeOfferingUuid) {
        let size = self.dbData.volumeoffering[self.volumeOfferingUuid].diskSize
        await self.getSelectableHost(size)
        conditions.push(`uuid?=${self.hostUuidList}`)
      }
      self.openDialog('HostListSingleSelectList', {
        conditions,
        select: self.selectHost
      })
    },

    selectHost(uuid){
      let self = this;
      self.hostUuid = uuid;
      self.validate('hostUuid');
    },

    getSelectableHost (size) {
      const self = this
      let tasks = []
      let p
      let primarystorage = self.windowData.primaryStorageUuid
      this.hostUuidList = []
      return rpc.query('hosts', {q: [`cluster.primaryStorage.uuid=${primarystorage}`]}).then(hostResp => {
        hostResp.inventories.forEach(host => {
          p = rpc.get(`primary-storage/local-storage/${primarystorage}/capacities?hostUuid=${host.uuid}`).then(resp => {
            if (Number(resp.inventories[0].availableCapacity) >= Number(size)) {
              self.hostUuidList.push(host.uuid)
            }
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      })
    },

    showHost () {
      let psUuid = this.primaryStorageUuid
      let ps = this.dbData.primarystorage[psUuid]
      let type = ps && ps.type
      if (type !== 'LocalStorage') return false
      if (!this.$route.params.primaryStorageUuid && !this.createMethods) return false
      return true
    },

    async openVmDlg(){
      let self = this
      if (!self.createMethods && !this.$route.params.primaryStorageUuid) {
        let conditions = ['type=UserVm', 'platform!=Other', 'hypervisorType=ESX']
        if (self.imageUuid) {
          let vmUuids = await self.initVmUuidListWhenCreatingByVolumeImage(self.imageUuid)
          conditions.push(`uuid?=${vmUuids}`)
        }
        self.openDialog('VmSingleSelectListDlg', {
          conditions: conditions,
          ok: self.selectVm
        })
        return
      }
      let psUuid = self.primaryStorageUuid
      let type = psUuid && self.dbData.primarystorage[psUuid].type
      let vmUuids
      if (psUuid) vmUuids = await self.initVmUuidListWhenCreatingByVolumeOffering(psUuid)
      if (type === 'LocalStorage') {
        if (self.hostUuid === '') return
        self.vmInstanceUuid   = '';
        self.openDialog('VmSingleSelectListDlg', {
          conditions: [`uuid?=${vmUuids}`],
          ok : self.selectVm
        })
      } else if (type === 'NFS' || type === 'SharedMountPoint') {
        self.vmInstanceUuid   = '';
        self.openDialog('VmSingleSelectListDlg', {
          conditions: [`uuid?=${vmUuids}`],
          ok : self.selectVm
        })
      } else {
        let conditions = ['type=UserVm', 'platform!=Other', 'hypervisorType=ESX']
        if (psUuid) conditions.push(`allVolumes.primaryStorage.uuid=${psUuid}`)
        self.openDialog('VmSingleSelectListDlg', {
          conditions: conditions,
          ok : self.selectVm
        })
      }
    },

    selectVm(uuid){
      let self = this;
      self.vmInstanceUuid = uuid;
      self.validate('vmInstanceUuid');
    },

    initVmUuidListWhenCreatingByVolumeOffering: async function (psUuid) {
      const self = this
      let ps = self.dbData.primarystorage[psUuid]
      let clusters = ps.attachedClusterUuids
      let type = ps.type
      let sharedPs = ['NFS', 'SharedMountPoint']
      let conditions = ['type=UserVm', 'platform!=Other']
      let vmUuids = []
      if (type === 'LocalStorage') {
        let hostUuid = self.windowData.hostUuid
        let localVmCondition = conditions.concat(`rootVolume.localStorageHostRef.hostUuid=${hostUuid}`)
        let localVmResp = await rpc.query(`vm-instances`, {q: localVmCondition})
        let localVms = localVmResp.inventories.map(vm => vm.uuid)
        let psResp = await rpc.query(`primary-storage`, {q: [`cluster.uuid?=${clusters}`, `type?=${sharedPs}`]})
        if (psResp.inventories.length === 0) return localVms
        let psUuids = psResp.inventories.map(ps => ps.uuid)
        let sharedVmCondition = conditions.concat(`rootVolume.primaryStorage.uuid?=${psUuids}`)
        let runningSharedVmCondition = sharedVmCondition.concat(['state=Running', `host.uuid=${hostUuid}`])
        let runningSharedVmResp = await rpc.query(`vm-instances`, {q: runningSharedVmCondition})
        let runningSharedVms = runningSharedVmResp.inventories.map(vm => vm.uuid)
        let stoppedSharedVmCondition = sharedVmCondition.concat(['state=Stopped'])
        let stoppedSharedVmResp = await rpc.query(`vm-instances`, {q: stoppedSharedVmCondition})
        let stoppedSharedVms = stoppedSharedVmResp.inventories.map(vm => vm.uuid)
        let localDataVolumesOnOtherHostOfStoppedSharedVmsResp = await rpc.query(`volumes`, {q: [`vmInstanceUuid?=${stoppedSharedVms}`, `primaryStorage.type=LocalStorage`, `localStorageHostRef.hostUuid!=${hostUuid}`, 'type=Data']})
        let stoppedSharedVmsWithlocalDataVolumesOnOtherHost = localDataVolumesOnOtherHostOfStoppedSharedVmsResp.inventories.map(volume => volume.vmInstanceUuid)
        stoppedSharedVms = _.xor(stoppedSharedVms, stoppedSharedVmsWithlocalDataVolumesOnOtherHost)
        vmUuids = vmUuids.concat(_.union(localVms, stoppedSharedVms, runningSharedVms))
      } else if (sharedPs.indexOf(type) > -1) {
        let psTypes = ['NFS', 'SharedMountPoint', 'LocalStorage', 'VCenter']
        let psInSameCluster = await rpc.query(`primary-storage`, {q: [`type?=${psTypes}`, `cluster.uuid?=${clusters}`]})
        let psUuids = psInSameCluster.inventories.map(ps => ps.uuid)
        let sharedVmCondition = conditions.concat(`rootVolume.primaryStorage.uuid?=${psUuids}`)
        let sharedVmResp = await rpc.query(`vm-instances`, {q: sharedVmCondition})
        let sharedVms = sharedVmResp.inventories.map(vm => vm.uuid)
        vmUuids = vmUuids.concat(sharedVms)
      }
      return vmUuids
    },

    openPrimaryStorageForVolumeImageDlg: async function () {
      const self = this
      let primaryStorageUuids = await self.initPrimariyStorageForVolumeImageUuidList()
      self.openDialog('PrimaryStorageListSingleSelectList', {
        conditions: [`uuid?=${primaryStorageUuids}`, 'type=VCenter'],
        select: (uuid) => self.selectPrimaryStorageForVolumeImage(uuid)
      })
    },

    selectPrimaryStorageForVolumeImage(uuid){
      let self = this
      let primaryStorageType = self.dbData.primarystorage[uuid].type
      self.primaryStorageForVolumeImageUuid = uuid;
      self.validate('primaryStorageForVolumeImageUuid')
          let obj = {}
          if (primaryStorageType !== 'Ceph') {
            self.shareable = false
            self.canShare = false
          } else {
            self.canShare = true
          }
      if (primaryStorageType !== 'Ceph') {
        rpc.query('system-tags', {
          q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=ceph::default::dataVolumePoolName::%25']
        }).then((resp) => {
          if (resp.inventories.length > 0) {
            self.poolName = resp.inventories[0].tag.split('::')[3];
          }
        })
      } else if (primaryStorageType === 'LocalStorage') {
      }
    },

    openPrimaryStorageForVolumeImagePoolDlg: function () {
      const self = this
      self.validate('primaryStorageForVolumeImageUuid')
      let primaryStorageUuid = self.primaryStorageForVolumeImageUuid
      if (!primaryStorageUuid) return
      self.openDialog('CephPoolSingleDlg', {
        conditions: [`primaryStorageUuid=${primaryStorageUuid}`, 'type=Data'],
        select: (uuid) => self.selectPrimaryStorageForVolumeImagePool(uuid)
      })
    },

    selectPrimaryStorageForVolumeImagePool(uuid){
      let self = this;
      self.poolUuidForVolumeImageUuid = uuid;
    },

    showCephPool () {
      let psUuid = this.primaryStorageForVolumeImageUuid
      if (!psUuid) return false
      return this.dbData.primarystorage[psUuid].type === 'Ceph' && !this.createMethods && !this.$route.params.primaryStorageUuid
    },

    async initPrimariyStorageForVolumeImageUuidList() {
      const self = this
      let psUuids = []
      let queryConditions = ['state=Enabled', 'status=Connected', encodeURIComponent('availableCapacity>=1')]
      if (self.vmInstanceUuid !== '') {
        let vm = self.dbData.vm[self.vmInstanceUuid]
        if (!vm) return
        let clusterUuid = vm.clusterUuid
        queryConditions.push(`cluster.uuid=${clusterUuid}`)
        let psUuid = vm.allVolumes[0].primaryStorageUuid
        psUuids.push(psUuid)
        let ps = self.dbData.primarystorage[psUuid]
        if (!ps) return
        if (ps.type === 'LocalStorage') {
          self.hostUuid = vm.hostUuid;
        }
        let psTypes = ['NFS', 'SharedMountPoint', 'LocalStorage', 'Ceph']
        if (psTypes.indexOf(ps.type) > -1) {
          queryConditions.push(`type?=${psTypes}`)
        }
      }
      if (self.dbData.common.isAdmin) {
         let resp = await rpc.query(`primary-storage`, {q: queryConditions})
         psUuids = psUuids.concat(resp.inventories.map(ps => ps.uuid))
      }
      return _.uniq(psUuids)
    },

    handleCreateMethodsChange(){
     let self = this, props= ['primaryStorageUuid', 'vmInstanceUuid', 'poolUuidForVolumeImageUuid',
       'volumeOfferingUuid', 'name', 'description', 'hostUuid'];
     props.forEach((item) => {
       self[item] = '';
     })
      self.showPrimaryStorageOption = false;
    },

    validate (name) {
      let self = this;
      self[`empty${name}`] = false
      let input = name === 'name' ? String(this[name]).trim() : this[name]
      if (!input) {
        self[`empty${name}`] = true
        return
      }
    },

    validateAll () {
      let self = this, invalidInput = false;
      let props = ['name']
      if (this.createMethods) {
        props.push('volumeOfferingUuid')
      } else {
        props.push('volumeImageUuid')
      }
      if ((!this.$route.params.primaryStorageUuid && !this.createMethods) || this.dbData.common.currProject || this.dbData.common.isPlatformAdmin) {
        props.push('vmInstanceUuid')
      }
      if (this.primaryStorageUuid) {
        props.push('primaryStorageUuid')
        if (this.dbData.primarystorage[this.primaryStorageUuid].type === 'LocalStorage') {
          props.push('hostUuid')
        }
      }
      props.forEach(item => this.validate(item))
      let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
      if (isInvalid) invalidInput = true
      return invalidInput;
    },

    confirm(){
      let self = this;
      let validateInput = self.validateAll();
      if(validateInput) return;
      self.create(self.createParam());
      self.$router.push({name: 'vcentervolume'})
    },

    createParam () {
      let obj = {
        name: this.name,
        description: this.description,
        vmInstanceUuid: this.vmInstanceUuid,
        hostUuid: this.hostUuid
      }
      if (this.createMethods) {
        obj.diskOfferingUuid = this.volumeOfferingUuid
        obj.primaryStorageUuid = this.primaryStorageUuid
        obj.VirtioSCSI = this.VirtioSCSI
        obj.shareable = this.shareable
        obj.poolName = this.poolName
      } else {
        obj.volumeImageUuid = this.volumeImageUuid
        obj.poolName = this.poolName
        let vm = this.dbData.vm[this.vmInstanceUuid]
        obj.primaryStorageUuid = vm && vm.allVolumes[0].primaryStorageUuid
      }
      if (this.$route.params.primaryStorageUuid) {
        obj.primaryStorageUuid = this.$route.params.primaryStorageUuid
      }
      if (!this.$route.params.primaryStorageUuid && !this.createMethods) {
        if (this.primaryStorageForVolumeImageUuid) {
          obj.primaryStorageUuid = this.primaryStorageForVolumeImageUuid
        } else {
          let vm = this.dbData.vm[this.vmInstanceUuid]
          obj.primaryStorageUuid = vm && vm.allVolumes[0].primaryStorageUuid
        }
      }
      return obj
    },
  }
}
