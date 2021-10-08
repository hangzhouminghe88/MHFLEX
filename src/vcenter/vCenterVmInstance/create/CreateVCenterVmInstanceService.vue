<script>
  import Assistant from '../Assistant/CreateVCenterVmInstance';
  import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddNicDlg from 'src/dialog/AddNicDlg';
  import WindowBase from 'src/windows/Window';
  import vCenterList from '../List';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreateVCenterVmInstanceService",
    mixins: [WindowBase, Assistant, vCenterList],
    components: {
      CreateTemplate,
      AddOrDeleteInput,
      AddNicDlg
    },
    data() {
      return {
        step: 0,
        isSingle: true,
        emptyvmNumber: false,
        vmNumber: 1,
        name: '',
        emptyname: false,
        description: '',
        instanceOfferingUuid: '',
        emptyinstanceOfferingUuid: false,
        imageUuid: '',
        emptyimageUuid: false,
        emptyl3NetworkUuidList: false,
        imageCondition: [
          'format=vmtx',
          'system=false',
          'status=Ready',
          'state=Enabled',
          `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`,
          'backupStorage.type=VCenter'
        ],
        baseImageCondition: [
          'format=vmtx',
          'system=false',
          'status=Ready',
          'state=Enabled',
          `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`
        ],
        gpuDeviceList: [],
        nicList: [],
        l3NetworkUuidList: [],
        rootDiskOfferingUuid: '',
        cadidateHostUuidList: [],
        attachedTwoTypesPs: '',
        defaultL3NetworkUuidIndex: 0,
        showNicDlg: false,
        nicMessage: {},
        nicIndex: 0,
        isAdmin: false,
        dataVolumePrimaryStorageUuid: '',
        hostUuid: '',
        clusterUuid: '',
        dataVolumeOfferingUuid: '',
        candidateHostUuidList: [],
        primaryStorageUuid: ''
      }
    },

    created() {
      let self = this;
      self.isAdmin = self.dbData.common.isAdmin;
      self.queryForAssistant();
    },

    methods: {
      next() {
        let self = this;
        let prop = ['name', 'vmNumber', 'imageUuid', 'instanceOfferingUuid', 'l3NetworkUuidList'];
        prop.forEach(name => {
          self.validate(name);
        })
        let invalid = prop.some(name => {
          return self[`empty${name}`] === true
        })
        if (invalid) return;
        self.step++;
      },

      prev() {
        let self = this;
        self.step--;
      },

      validate(name) {
        let self = this, input = '';
        input = name === ('name' || 'vmNumber') ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        if (!input) {
          self[`empty${name}`] = true;
          return;
        }
        if (name === 'l3NetworkUuidList') {
          if (self.l3NetworkUuidList.length <= 0) {
            self[`empty${name}`] = true;
            return;
          } else {
            self[`empty${name}`] = false;
          }
        }
      },

      openInstanceOfferingSelect() {
        let self = this;
        self.validate('instanceOfferingUuid');
        self.openDialog('InstanceOfferingListSingleSelectDlg', {
          conditions: ['state!=Disabled', 'type=UserVm'],
          select: (uuid) => self.selectInstanceOffering(uuid)
        })
      },

      selectInstanceOffering(uuid) {
        let self = this;
        self.instanceOfferingUuid = uuid;
        self.validate('instanceOfferingUuid');
      },

      opeImageSelect() {
        let self = this;
        self.validate('imageUuid');
        self.openDialog('ImageSingleSelectListDlg', {
          conditions: self.imageCondition,
          select: (uuid) => {self.selectImage(uuid)}
        })
      },

      openL3NetWorkSelect() {
        let self = this
        self.validate('l3NetworkUuidList');
        let add = (uuidList) => {
          self.l3NetworkUuidList = self.l3NetworkUuidList.concat(uuidList)
          uuidList.forEach(() => {
            self.nicList.push({})
          })
          if (self.defaultL3NetworkUuidIndex === -1) {
            self.defaultL3NetworkUuidIndex = 0;
          }
          self.clusterUuid = ''
          self.primaryStorageUuid = ''
          self.hostUuid = ''
          this.gpuDeviceList = []
          self.queryIfNetworkMultiSelected()
          this.initClusterAndHosts(this.instanceOfferingUuid, this.imageUuid, this.l3NetworkUuidList, this.rootDiskOfferingUuid)
          self.validate('l3NetworkUuidList');
        }
        let conditions = ['l2Network.cluster.type=vmware', `uuid!?=${self.l3NetworkUuidList}`]
        if (self.imageUuid !== '') {
          rpc.query(`images-l3networks/dependencies`, {
            zoneUuid: localStorage.getItem('currZoneUuid'),
            imageUuid: self.imageUuid
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid)
                conditions.push(`uuid?=${uuidList}`)
              } else if (resp.inventories.length === 0) {
                conditions.push(`uuid?=${[]}`)
              }
              self.openDialog('vCenterPrivateAndPublicMultiSelectListConfirmDlg', {
                conditions,
                select: add
              })
            }, () => {
              conditions.push(`uuid?=${[]}`)
              self.openDialog('vCenterPrivateAndPublicMultiSelectListConfirmDlg', {
                conditions,
                select: add
              })
            })
        } else {
          self.openDialog('vCenterPrivateAndPublicMultiSelectListConfirmDlg', {
            conditions: conditions,
            select: (uuidList) => add(uuidList)
          })
        }
      },

      initClusterAndHosts: async function (instanceOfferingUuid, imageUuid, l3NetworkUuidList, rootDiskOfferingUuid) {
        if (!instanceOfferingUuid || !imageUuid || l3NetworkUuidList.length <= 0) return
        if (this.dbData.image[imageUuid].mediaType === 'ISO' && !this.rootDiskOfferingUuid) return
        let params = {}
        if (instanceOfferingUuid) params.instanceOfferingUuid = instanceOfferingUuid
        if (l3NetworkUuidList.length > 0) params.l3NetworkUuids = l3NetworkUuidList
        if (imageUuid) {
          params.imageUuid = imageUuid
          if (this.dbData.image[imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = rootDiskOfferingUuid
        }
        let resp = await rpc.query('vm-instances/candidate-destinations', params)
        this.cadidateHostUuidList = resp.hosts.map((item) => item.uuid)
        this.cadidateClusterUuidList = resp.clusters.map((item) => item.uuid)
        this.attachedTwoTypesPs = await this.isAttachedTwoTypesPs(this.cadidateClusterUuidList)
        this.updateDbTable({
          tableName: 'host',
          list: resp.hosts
        })
        this.updateDbTable({
          tableName: 'cluster',
          list: resp.clusters
        })
      },

      deleteL3Network(index) {
        if (index <= this.defaultL3NetworkUuidIndex) {
          this.defaultL3NetworkUuidIndex = this.defaultL3NetworkUuidIndex - 1
        }
        this.l3NetworkUuidList.splice(index, 1)
        this.nicList.splice(index, 1)
      },

      isAttachedTwoTypesPs(clusterUuids) {
        let isAttached = false
        let tasks = []
        let p
        clusterUuids.forEach(clusterUuid => {
          p = rpc.query(`primary-storage`, {q: `cluster.uuid=${clusterUuid}`, fields: 'type'}).then(psResp => {
            if (psResp.inventories.length === 2) {
              let psTypeSet = new Set(psResp.inventories.map(ps => ps.type))
              if (psTypeSet.size === 2) {
                let hasSharedPs = psTypeSet.has('NFS') || psTypeSet.has('SharedMountPoint')
                if (psTypeSet.has('LocalStorage') && hasSharedPs) isAttached = true
              }
            }
          })
          tasks.push(p)
        })
        Promise.all(tasks)
          .then(() => {
            return new Promise((resolve, reject) => {
              resolve(isAttached)
            })
          })
      },

      selectDefaultNetwork($event, index, uuid) {
        this.defaultL3NetworkUuidIndex = index;
        this.defaultNetworkUuid = uuid;
      },

      setNic(index) {
        let self = this;
        let obj = self.nicList[index];
        self.nicIndex = index;
        self.nicMessage = {
          uuid: self.l3NetworkUuidList[index],
          staticIp: obj.staticIp,
          mac: obj.customMac,
          isSingle: parseInt(self.vmNumber) === 1,
          isUserVm: true,
        }
        self.showNicDlg = true;
      },

      closeNicDlg(param) {
        let self = this;
        if (param) {
          this.nicList[self.nicIndex] = {
            staticIp: param.staticIp,
            customMac: param.mac
          }
        }
        self.showNicDlg = false;
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      },

      selectImage(uuid) {
        let self = this;
        debugger
        self.imageUuid = uuid;
        self.validate('imageUuid');
      },

      openDataVolumeInstanceOfferingSelect() {
        let self = this;
        self.openDialog('VolumeOfferingListSingleSelectList', {
          conditions: ['state=Enabled'],
          select: (uuid) => {
            return self.selectVolumeOffering(uuid)
          }
        })
      },

      openRootVolumeInstanceOfferingSelect() {
        let self = this;
        self.openDialog('VolumeOfferingListSingleSelectList', {
          conditions: ['state=Enabled'],
          isRootVolumeOfferingSelect: 'isRootVolumeOfferingSelect',
          select: (uuid) => {
            return self.selectrootVolumeOffering(uuid)
          }
        })
      },

      selectrootVolumeOffering: function (uuid) {
        this.rootDiskOfferingUuid = uuid
      },

      selectVolumeOffering(uuid) {
        let self = this;
        self.dataVolumeOfferingUuid = uuid;
        return this.initDataPrimaryStorage()
      },

      initDataPrimaryStorage: async function () {
        const self = this
        let primaryStorageUuidList = await self.getCandidateDataPrimaryStorage()
        this.dataVolumePrimaryStorageUuid = ''
        if (primaryStorageUuidList && primaryStorageUuidList.length === 1) {
          return self.selectDataPrimaryStorage(primaryStorageUuidList[0])
        }
      },

      selectDataPrimaryStorage: function (uuid) {
        this.dataVolumePrimaryStorageUuid = uuid
      },

      getCandidateDataPrimaryStorage() {
        const self = this
        let primaryStorageUuidList = []
        let clusterPrimaryStorageUuidList = []
        let tasks = []
        let p = null
        if (!self.imageUuid || !self.dataVolumeOfferingUuid || self.l3NetworkUuidList.length <= 0) return
        let candidatePrimaryStorageParams = {}
        candidatePrimaryStorageParams.imageUuid = self.imageUuid
        candidatePrimaryStorageParams.l3NetworkUuids = self.l3NetworkUuidList
        candidatePrimaryStorageParams.dataDiskOfferingUuids = [self.dataVolumeOfferingUuid]
        if (self.dbData.image[self.imageUuid].mediaType === 'ISO') {
          candidatePrimaryStorageParams.rootDiskOfferingUuid = self.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-storages', candidatePrimaryStorageParams).then(resp => {
          candidatePrimaryStorageParams.dataDiskOfferingUuids.forEach(dataDiskOfferingUuid => {
            if (resp.dataVolumePrimaryStorages[dataDiskOfferingUuid] && resp.dataVolumePrimaryStorages[dataDiskOfferingUuid].length > 0) {
              primaryStorageUuidList = primaryStorageUuidList.concat(resp.dataVolumePrimaryStorages[dataDiskOfferingUuid].map(item => item.uuid))
            }
          })
          // primaryStorageUuidList = primaryStorageUuidList.concat(resp.dataVolumePrimaryStorages[].map((item) => item.uuid))
          primaryStorageUuidList = _.uniq(primaryStorageUuidList)
        })
        tasks.push(p)
        if (self.clusterUuid) {
          p = rpc.query('primary-storage', {
            q: `cluster.uuid=${self.clusterUuid}`
          }).then(resp => {
            clusterPrimaryStorageUuidList = clusterPrimaryStorageUuidList.concat(resp.inventories.map(item => item.uuid))
          })
          tasks.push(p)
        }
        return Promise.all(tasks).then(() => {
          if (clusterPrimaryStorageUuidList.length > 0) {
            primaryStorageUuidList = primaryStorageUuidList.filter(uuid => {
              return _.includes(clusterPrimaryStorageUuidList, uuid)
            })
          }
          return new Promise((resolve, reject) => {
            resolve(primaryStorageUuidList)
          })
        })
      },

      openHostSelect() {
        const self = this
        let hostUuidList = []
        let clusterHostUuidList = []
        let PrimaryStorageHostUuidList = []
        let tasks = []
        let p = null
        if (!self.instanceOfferingUuid || !self.imageUuid || self.l3NetworkUuidList.length <= 0) return
        let candidateHostParams = {}
        if (self.affinityGroupUuid) candidateHostParams.systemTags = [`affinityGroupUuid::${self.affinityGroupUuid}`]
        candidateHostParams.instanceOfferingUuid = self.instanceOfferingUuid
        candidateHostParams.l3NetworkUuids = self.l3NetworkUuidList
        candidateHostParams.imageUuid = self.imageUuid
        if (self.dbData.image[self.imageUuid].mediaType === 'ISO') {
          candidateHostParams.rootDiskOfferingUuid = self.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-destinations', candidateHostParams)
          .then((resp) => {
            hostUuidList = hostUuidList.concat(resp.hosts.map((item) => item.uuid))
          })
        tasks.push(p)
        if (self.clusterUuid) {
          p = rpc.query('hosts', {
            q: `clusterUuid=${self.clusterUuid}`
          }).then((resp) => {
            clusterHostUuidList = clusterHostUuidList.concat(resp.inventories.map((item) => item.uuid))
          })
          tasks.push(p)
        }
        if (self.primaryStorageUuid) { // root volume ps
          p = rpc.query('hosts', {
            q: `cluster.primaryStorage.uuid=${self.primaryStorageUuid}`
          }).then((resp) => {
            PrimaryStorageHostUuidList = PrimaryStorageHostUuidList.concat(resp.inventories.map((item) => item.uuid))
          })
          tasks.push(p)
        }
        Promise.all(tasks)
          .then(() => {
            // intersection
            if (clusterHostUuidList.length > 0) {
              hostUuidList = hostUuidList.filter(uuid => {
                if (clusterHostUuidList.indexOf(uuid) > -1) {
                  return uuid
                }
              })
            }
            // intersection
            if (PrimaryStorageHostUuidList.length > 0) {
              hostUuidList = hostUuidList.filter(uuid => {
                if (PrimaryStorageHostUuidList.indexOf(uuid) > -1) {
                  return uuid
                }
              })
            }
            self.openDialog('HostListSingleSelectList', {
              conditions: ['hypervisorType=ESX', `uuid?=${hostUuidList}`],
              select: (uuid) => self.selectHost(uuid)
            })
          })
      },

      selectHost (uuid) {
        this.hostUuid = uuid
        this.gpuDeviceList = []
      },

      openClusterSelect () {
        const self = this
        let tasks = []
        let p = null
        if (!self.instanceOfferingUuid || !self.imageUuid || self.l3NetworkUuidList.length <= 0) return
        if (self.dbData.image[self.imageUuid] && self.dbData.image[self.imageUuid].mediaType === 'ISO' && !self.rootDiskOfferingUuid) return
        let params = {}
        if (self.instanceOfferingUuid) params.instanceOfferingUuid = self.instanceOfferingUuid
        if (self.l3NetworkUuidList.length > 0) params.l3NetworkUuids = self.l3NetworkUuidList
        if (self.affinityGroupUuid) params.systemTags = [`affinityGroupUuid::${self.affinityGroupUuid}`]
        if (self.imageUuid) {
          params.imageUuid = self.imageUuid
          if (self.dbData.image[self.imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = self.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-destinations', params)
          .then((resp) => {
            self.candidateClusterUuidList = resp.clusters.map((item) => item.uuid)
            self.candidateHostUuidList = resp.hosts.map((item) => item.uuid)
          })
        tasks.push(p)
        Promise.all(tasks)
          .then(() => {
            self.openDialog('ClusterSelectListDlg', {
              conditions: ['type=vmware', `uuid?=${self.candidateClusterUuidList}`],
              type: 'radio',
              select: (uuid) => self.selectCluster(uuid)
            })
          })
      },

      selectCluster (uuid) {
        let self = this;
        self.clusterUuid = uuid
        self.primaryStorageUuid = ''
        self.dataVolumePrimaryStorageUuid = ''
        self.gpuDeviceList = []
        self.hostUuid = ''
        self.initPsByCluster(uuid)
        self.initHostsByCluster(uuid, this.instanceOfferingUuid, this.imageUuid, this.l3NetworkUuidList, this.rootDiskOfferingUuid)
      },

      initPsByCluster (clusterUuid) {
        rpc.query('primary-storage', {
          q: `cluster.uuid=${clusterUuid}`
        })
          .then((resp) => {
            let psUuidList = resp.inventories.map((item) => item.uuid)
            this.primaryStorageUuidList = psUuidList;
          })
      },

      initHostsByCluster (clusterUuid, instanceOfferingUuid, imageUuid, l3NetworkUuidList, rootDiskOfferingUuid) {
        let params = {}
        if (instanceOfferingUuid) params.instanceOfferingUuid = instanceOfferingUuid
        if (l3NetworkUuidList) params.l3NetworkUuids = l3NetworkUuidList
        if (imageUuid) {
          params.imageUuid = imageUuid
          if (this.dbData.image[imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = rootDiskOfferingUuid
        }
        if (clusterUuid) params.clusterUuid = clusterUuid
        rpc.query('vm-instances/candidate-destinations', params)
          .then((resp) => {
            let hostUuidList = resp.hosts.map((item) => item.uuid)
            this.updateWindow({
              hostUuidList: hostUuidList
            })
          })
      },

      openPrimaryStorageDlg () {
        const self = this
        let primaryStorageUuidList = []
        let clusterPrimaryStorageUuidList = []
        let tasks = []
        let p = null
        if (!self.imageUuid || self.l3NetworkUuidList.length <= 0) return
        let candidatePrimaryStorageParams = {}
        candidatePrimaryStorageParams.imageUuid = self.imageUuid
        candidatePrimaryStorageParams.l3NetworkUuids = self.l3NetworkUuidList
        if (self.dbData.image[self.imageUuid].mediaType === 'ISO') {
          candidatePrimaryStorageParams.rootDiskOfferingUuid = self.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-storages', candidatePrimaryStorageParams)
          .then((resp) => {
            primaryStorageUuidList = primaryStorageUuidList.concat(resp.rootVolumePrimaryStorages.map((item) => item.uuid))
            primaryStorageUuidList = _.uniq(primaryStorageUuidList)
          })
        tasks.push(p)
        if (self.clusterUuid) {
          p = rpc.query('primary-storage', {
            q: `cluster.uuid=${self.clusterUuid}`
          }).then((resp) => {
            clusterPrimaryStorageUuidList = clusterPrimaryStorageUuidList.concat(resp.inventories.map((item) => item.uuid))
          })
          tasks.push(p)
        }
        return Promise.all(tasks)
          .then(() => {
            // intersection
            if (clusterPrimaryStorageUuidList.length > 0) {
              primaryStorageUuidList = primaryStorageUuidList.filter(uuid => {
                if (clusterPrimaryStorageUuidList.indexOf(uuid) > -1) {
                  return uuid
                }
              })
            }
            self.openDialog('PrimaryStorageListSingleSelectList', {
              conditions: ['type=VCenter', `uuid?=${primaryStorageUuidList}`],
              select: (uuid) => self.selectPrimaryStorage(uuid)
            })
          })
      },

      selectPrimaryStorage (uuid) {
        this.primaryStorageUuid = uuid
        this.hostUuid = ''
        this.initHostByPrimaryStorage(uuid)
      },

      initHostByPrimaryStorage (primaryStorageUuid) {
        if (!this.dbData.common.isAdmin) return
        rpc.query('hosts', {
          q: `cluster.primaryStorage.uuid=${primaryStorageUuid}`
        })
          .then((resp) => {
            let newHostList = resp.inventories.map((item) => item.uuid)
            let hostUuidList = _.cloneDeep(this.candidateHostUuidList)
            this.candidateHostUuidList = _.union(newHostList, hostUuidList)
            this.updateDbTable({
              tableName: 'host',
              list: resp.inventories
            })
          })
      },

      createParam: function () {
        let self = this
        return {
          name: self.name,
          description: self.description,
          instanceOfferingUuid: self.instanceOfferingUuid,
          imageUuid: self.imageUuid,
          l3NetworkUuids: self.l3NetworkUuidList,
          staticIp: self.staticIp
        }
      },

      addMoreParam: function () {
        let system = []
        if (this.consolePassword !== '') system.push(`consolePassword::${this.consolePassword}`)
        if (this.sshKey !== '') system.push(`sshkey::${this.sshKey}`)
        if (this.dataPrimaryStorageUuid !== '') system.push(`primaryStorageUuidForDataVolume::${this.dataPrimaryStorageUuid}`)
        let moreParam = {
          defaultL3NetworkUuid: this.defaultNetworkUuid,
          rootDiskOfferingUuid: this.rootDiskOfferingUuid,
          dataDiskOfferingUuids: this.volumeOfferingUuid === '' ? [] : [this.volumeOfferingUuid],
          clusterUuid: this.clusterUuid,
          primaryStorageUuidForRootVolume: this.primaryStorageUuid,
          hostUuid: this.hostUuid,
          systemTags: system
        }
        for (let i in moreParam) {
          moreParam[i] === '' ? delete moreParam[i] : void 0
        }
        return moreParam
      },

      validateAll(){
        let self = this;
        let prop = ['name', 'vmNumber', 'imageUuid', 'instanceOfferingUuid', 'l3NetworkUuidList'];
        prop.forEach(name => {
          self.validate(name);
        })
        let invalid = prop.some(name => {
          return self[`empty${name}`] === true
        })
        return invalid;
      },

      toParam () {
        let param = {
          l3NetworkUuids: this.l3NetworkUuidList,
          defaultL3NetworkUuid: this.l3NetworkUuidList[this.defaultL3NetworkUuidIndex]
        }

        let self = this
        let set = (name) => {
          if (self[name]) param[name] = self[name]
        }

        let nameList = [
          'name',
          'description',
          'instanceOfferingUuid',
          'imageUuid',
          'rootDiskOffering',
          'hostUuid'
        ]
        for (let i in nameList) {
          set(nameList[i])
        }

        if (this.dataVolumeOfferingUuid) param.dataDiskOfferingUuids = [this.dataVolumeOfferingUuid]
        if (this.clusterUuid) param.clusterUuid = this.clusterUuid
        if (this.primaryStorageUuid) param.primaryStorageUuidForRootVolume = this.primaryStorageUuid

        let systemTags = []
        this.nicList.forEach((nic, index) => {
          if (nic.staticIp) {
            systemTags.push(`staticIp::${this.l3NetworkUuidList[index]}::${nic.staticIp}`)
          }
          if (nic.customMac) {
            systemTags.push(`customMac::${this.l3NetworkUuidList[index]}::${nic.customMac}`)
          }
        })
        // if (this.windowData.ip !== '') system.push(`staticIp::${this.windowData.ip}`)
        if (this.consolePassword) systemTags.push(`consolePassword::${this.consolePassword}`)
        if (this.sshPublicKey) systemTags.push(`sshkey::${this.sshPublicKey}`)
        if (this.haLevel !== 'None') systemTags.push('ha::NeverStop')
        if (this.affinityGroupUuid) systemTags.push(`affinityGroupUuid::${this.affinityGroupUuid}`)
        if (this.userData) systemTags.push(`userdata::${Utf8Base64.encode(this.userData)}`)
        // if (this.dataVolumePrimaryStorageUuid) systemTags.push(`primaryStorageUuidForDataVolume::${this.dataVolumePrimaryStorageUuid}`)
        if (this.usbRedirect != null) systemTags.push(`usbRedirect::${this.usbRedirect}`)
        if (this.dataVolumeOfferingUuid && this.VirtioSCSI === true) systemTags.push(`virtio::diskOffering::${this.dataVolumeOfferingUuid}::num::1`)
        if (this.consoleMode !== null) systemTags.push(`vmConsoleMode::${this.consoleMode}`)
        if (this.addType !== 'multiple' && this.gpuDeviceList.length > 0) {
          let selectedUuids = []
          this.gpuDeviceList.forEach(gpu => {
            selectedUuids.push(gpu.uuid)
            if (gpu.audioUuid) {
              selectedUuids.push(gpu.audioUuid)
            }
          })
          selectedUuids.forEach(uuid => {
            systemTags.push(`pciDevice::${uuid}`)
          })
        }
        param.systemTags = systemTags
        return param
      },

      confirm(){
        if (this.validateAll()) return
        if (this.vmNumber < 1) return
        this.create(this.toParam(), parseInt(this.vmNumber))
        this.$router.push({name: 'vcentervminstance'})
      }
    }
  }
</script>

<style scoped>

</style>
