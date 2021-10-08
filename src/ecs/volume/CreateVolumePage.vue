<template>
  <create-template>
    <div class="create-header" slot="header">
        <span>
          {{$t('common.createVolume')}}
        </span>
      <span @click="$router.push({name: 'volume'})" class="create-back"><i class="el-icon-back"></i>回到云主机列表</span>
    </div>
    <div class="create-body" slot="body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="volume"></help-trigger>
        <input @blur="validate('name')" type="text" v-model="name" :class="{'is-error': emptyname}"/>
        <div class="error-text error" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" type="text" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('volume.createMethod')}}</div>
        <el-radio label="createByVolumeOffering" v-model="createType">{{$t("common.volumeOffering")}}</el-radio>
        <el-radio label="createByVolumeImage" v-model="createType">{{$t("image.volumeImage")}}</el-radio>
        <add-or-delete-input
          :value="dbData.volumeoffering[diskOfferingUuid] && dbData.volumeoffering[diskOfferingUuid].name"
          @open="openVIOSingle" @remove="removeUuid('diskOfferingUuid')"
          v-if="createType === 'createByVolumeOffering'"/>
        <add-or-delete-input :value="dbData.image[volumeImageUuid] && dbData.image[volumeImageUuid].name"
                             @open="openVolumeImage" @remove="removeUuid('volumeImageUuid')"
                             v-if="createType === 'createByVolumeImage'"/>
        <div class="error error-text" v-if="createType === 'createByVolumeOffering' && emptydiskOfferingUuid">
          {{$t("common.volumeOffering")}}{{$t('error.noEmpty')}}
        </div>
        <div class="error error-text" v-if="createType === 'createByVolumeImage'"></div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeOffering'">
        <div class="title">{{$t('common.primarystorage')}}</div>
        <add-or-delete-input
          :value="dbData.primarystorage[primaryStorageUuid] && dbData.primarystorage[primaryStorageUuid].name"
          @open="openPrimaryStorage" @remove="removeUuid('primaryStorageUuid')"/>
        <div class="error error-text" v-if="emptyprimaryStorageUuid">
          {{$t('common.primarystorage')}}{{$t('error.noEmpty')}}
        </div>
      </div>
      <div class="operation-row" v-if="showHost()">
        <div class="title required">
          {{$t("common.host")}}
        </div>
        <add-or-delete-input :value="dbData.host[hostUuid] && dbData.host[hostUuid].name" @open="openHost"
                             @remove="removeUuid('hostUuid')"/>
        <div class="error error-text" v-if="showHost() && emptyhostUuid">
          {{$t('error.unselected')+$t('common.host')}}
        </div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeOffering' && primaryStorageUuid && dbData.primarystorage[primaryStorageUuid].type === 'Ceph'">
        <div class="title">{{$t('common.cephPool')}}</div>
        <add-or-delete-input :value="dbData.pool[poolUuid] && dbData.pool[poolUuid].poolName " @open="openCephPool"
                             @remove="removeUuid('poolUuid')"/>
        <div class="error error-text" v-if="emptypoolUuid">{{$t('common.cephPool')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeOffering'">
        <div class="title">{{$t('common.vm')}}</div>
        <add-or-delete-input :value="dbData.vm[vmInstanceUuid] && dbData.vm[vmInstanceUuid].name" @open="openVm"
                             @removeUuid="removeUuid('vmInstanceUuid')"/>
        <div class="error error-text" v-if="emptyvmInstanceUuid">{{$t('common.vm')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeOffering'">
        <div class="title"></div>
        <el-checkbox v-model="isVirtioSCSI">VirtioSCSI</el-checkbox>
        <help-trigger name="virtioScsi" style="top: 30px;"></help-trigger>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeOffering'">
        <el-checkbox :disabled="canShare" v-model="isShared">共享云盘</el-checkbox>
        <help-trigger name="sharedVolume"></help-trigger>
        <div class="error-text">
          {{$t('volume.shareableWarning')}}
        </div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeImage'">
        <div class="title required">{{$t('common.vm')}}</div>
        <add-or-delete-input :value="dbData.vm[vmInstanceUuid] && dbData.vm[vmInstanceUuid].name" @open="openVm"
                             @removeUuid="removeUuid('vmInstanceUuid')"/>
        <div class="error error-text" v-if="emptyvmInstanceUuid">{{$t('common.vm')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeImage'">
        <div class="title">{{$t('common.primarystorage')}}</div>
        <add-or-delete-input
          :value="dbData.primarystorage[primaryStorageForVolumeImage] && dbData.primarystorage[primaryStorageForVolumeImage].name"
          @open="openPrimaryStorageForImage" @remove="removeUuid('primaryStorageForVolumeImage')"/>
        <div class="error error-text" v-if="emptyprimaryStorageForVolumeImage">
          {{$t('common.primarystorage')}}{{$t('error.noEmpty')}}
        </div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeImage' && primaryStorageForVolumeImage">
        <div class="title">{{$t('common.cephPool')}}</div>
        <add-or-delete-input :value="dbData.pool[poolUuid] && dbData.pool[poolUuid].poolName " @open="openCephPool"
                             @remove="removeUuid('poolUuid')"/>
        <div class="error error-text" v-if="emptypoolUuid">{{$t('common.cephPool')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="createType === 'createByVolumeImage'">
        <div class="title"></div>
        <el-checkbox v-model="isVirtioSCSI">VirtioSCSI</el-checkbox>
        <help-trigger name="virtioScsi" style="top: 30px;"></help-trigger>
      </div>
      <data-volume-instance-offer-single-dlg :message="VIOSingleMessage" :model="showVIOSingleDlg"
                                             @close="closeVIOSingleDlg" v-if="showVIOSingleDlg"/>
      <primary-storage-single-dlg :message="primarySingleMessage" :model="showPrimarySingleDlg"
                                  @close="closePrimaryStorage" v-if="showPrimarySingleDlg"/>
      <ceph-pool-single-dlg :message="cephPoolMessage" :model="showCephPool" @close="closeCephPoolDlg"
                            v-if="showCephPool"/>
      <host-single-dlg :message="hostSingleMessage" :model="showHostSingleDlg" @close="closeHostDlg"
                       v-if="showHostSingleDlg"/>
      <iso-image-single-dlg :message="imageSingleMessage" :model="showImageSingleDlg" @close="closeImageSingleDlg"
                            v-if="showImageSingleDlg"/>
    </div>
    <div class="create-footer" slot="footer">
      <span :class="{'disabled': !canCreate}" @click="canCreate && confirm()" class="btn-confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'volume'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import DataVolumeInstanceOfferSingleDlg from "../../dialog/DataVolumeInstanceOfferSingleDlg";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import PrimaryStorageSingleDlg from "../../dialog/PrimaryStorageSingleDlg";
  import CephPoolSingleDlg from "../../dialog/CephPoolSingleDlg";
  import VmSingleSelectListDlg from "../../dialog/vm/VmSingleSelectListDlg";
  import HostSingleDlg from "../../dialog/VmChangeResourceOwnerToAccountProjSingleDlg";
  import IsoImageSingleDlg from "../../dialog/IsoImageSingleDlg";
  import VolumeMethods from 'src/ecs/volume/Methods';

  export default {
    name: "CreateVolumePage",
    mixins: [WindowBase, VolumeMethods],
    props: {
      param: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    components: {
      IsoImageSingleDlg,
      HostSingleDlg,
      VmSingleSelectListDlg,
      CephPoolSingleDlg,
      PrimaryStorageSingleDlg, DataVolumeInstanceOfferSingleDlg, AddOrDeleteInput, CreateTemplate
    },
    data() {
      return {
        name: '',
        description: "",
        createType: 'createByVolumeOffering',
        isVirtioSCSI: true,
        isShared: false,
        emptyname: false,
        emptydiskOfferingUuid: false,
        emptyprimaryStorageUuid: false,
        emptypoolUuid: false,
        emptyhostUuid: false,
        emptyvmInstanceUuid: false,
        emptyprimaryStorageForVolumeImage: false,
        showVIOSingleDlg: false,
        VIOSingleMessage: {},
        poolName: '',
        poolNameList: [],
        primaryStorageUuid: '',
        diskOfferingUuid: '',
        poolUuid: '',
        hostUuid: '',
        volumeImageUuid: '',
        primarySingleMessage: {},
        showPrimarySingleDlg: false,
        showCephPool: false,
        inputValidate: false,
        cephPoolMessage: {},
        vmInstanceUuid: '',
        psUuid: '',
        primaryStorageForVolumeImage: '',
        canShare: true,
        showHostSingleDlg: false,
        hostSingleMessage: {},
        showImageSingleDlg: false,
        imageSingleMessage: {},
        isVolumeImageAvailableConditions: ['state=Enabled', 'type=zstack', 'status=Ready', 'system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType=DataVolumeTemplate', 'format!=vmtx'],
        isVolumeImageExistedConditions: ['type=zstack', 'status!=Deleted', 'system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType=DataVolumeTemplate'],
        isVmInstanceAvailableConditions: ['state?=Running,Stopped', 'hypervisorType=KVM', 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`],
        isVmInstanceExistedConditions: ['hypervisorType=KVM', 'state!=Destroyed', 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`],
        canCreate: true
      }
    },
    created() {
      let primaryStorageUuid = '';
      let primaryStorageForVolumeImage = '';
      if (this.param && this.param.primaryStorageUuid) {
        primaryStorageUuid = this.param.primaryStorageUuid;
        primaryStorageForVolumeImage = this.param.primaryStorageUuid
      }
      this.initPrimariyStorage();
      this.initVolumeOffering();
    },
    methods: {
      openVIOSingle() {
        let self = this;
        self.showVIOSingleDlg = true;
      },
      closeVIOSingleDlg(param) {
        let self = this;
        if (param) {
          self.diskOfferingUuid = param;
          self.validate('diskOfferingUuid');
        }
        self.showVIOSingleDlg = false;
      },
      //关闭主存储回调
      closePrimaryStorage(param) {
        let self = this;
        if (param) {
          if (self.createType === 'createByVolumeOffering') {
            self.selectPrimaryStorage(param);
            self.validate('primaryStorageUuid');

          } else {
            self.selectPrimaryStorageForVolumeImage(param);
            self.validate('primaryStorageForVolumeImage');
          }
        }
        self.showPrimarySingleDlg = false;
      },
      selectPrimaryStorage: function (uuid) {
        let self = this;
        let primaryStorageType = self.dbData.primarystorage[uuid].type;
        self.primaryStorageUuid = uuid;
        self.hostUuid = '';
        self.vmInstanceUuid = '';
        if (primaryStorageType !== 'Ceph') {
          self.isShared = false;
          self.canShare = true
        } else {
          self.canShare = false
        }
        // let poolList = []
        if (primaryStorageType === 'Ceph') {
          rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=ceph::default::dataVolumePoolName::%25']
          }).then((resp) => {
            if (resp.inventories.length > 0) {
              self.poolName = resp.inventories[0].tag.split('::')[3]
            }
          })
          // })
        } else if (primaryStorageType === 'LocalStorage') {
          // this.deleteAllAssistant()
          // this.queryForAssistant()
        }
      },
      initPrimariyStorage() {
        let self = this;
        if (self.dbData.common.isAdmin) {
          let primaryStorageInventorise;
          rpc.query('primary-storage', {
            q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'state=Enabled', 'status=Connected', 'type!=VCenter', 'availableCapacity%3E=1']
          })
            .then((resp) => {
              primaryStorageInventorise = resp.inventories;
              return self.updateDbTable({
                tableName: 'primarystorage',
                list: resp.inventories
              })
            })
            .then(() => {
              if (self.primaryStorageUuid !== '' && self.dbData.primarystorage[self.primaryStorageUuid].type === 'Ceph') {
                self.poolName = self.dbData.primarystorage[self.primaryStorageUuid].dataVolumePoolName;
                let poolList = [];
                poolList.push(self.dbData.primarystorage[self.primaryStorageUuid].dataVolumePoolName);
                rpc.query(`primary-storage/ceph/pools`, {
                  q: `primaryStorageUuid=${self.primaryStorageUuid}`
                })
                  .then((resp) => {
                    resp.inventories.forEach((item) => {
                      poolList.push(item.poolName)
                    });
                    self.poolNameList = poolList
                  });
                return
              }
              if (primaryStorageInventorise.length === 1) {
                if (self.primaryStorageUuid) {
                  //self.queryForAssistant()
                } else {
                  self.primaryStorageUuid = primaryStorageInventorise[0].uuid
                }
                if (primaryStorageInventorise[0].type === 'Ceph') {
                  self.poolName = primaryStorageInventorise[0].dataVolumePoolName;
                  let poolList = [];
                  poolList.push(primaryStorageInventorise[0].dataVolumePoolName);
                  rpc.query(`primary-storage/ceph/pools`, {
                    q: `primaryStorageUuid=${primaryStorageInventorise[0].uuid}`
                  })
                    .then((resp) => {
                      resp.inventories.forEach((item) => {
                        poolList.push(item.poolName)
                      });
                      self.poolNameList = poolList
                    })
                }
              }
            })
        }
      },
      initVolumeOffering() {
        let volumeOfferingInventorise, self = this;
        rpc.query('disk-offerings', {q: 'state=Enabled'})
          .then((resp) => {
            volumeOfferingInventorise = resp.inventories;
            return this.updateDbTable({
              tableName: 'volumeoffering',
              list: resp.inventories
            })
          })
          .then(() => {
            if (volumeOfferingInventorise.length === 1) {
              self.diskOfferingUuid = volumeOfferingInventorise[0].uuid
            }
          })
      },
      //初始化vmuuid通过镜像创建时
      initVmUuidListWhenCreatingByVolumeImage: async function (volumeImageUuid) {
        const self = this;
        let volumeImage = self.dbData.image[volumeImageUuid];
        let backupStorage = self.dbData.backupstorage[volumeImage.backupStorageRefs[0].backupStorageUuid];
        if (!backupStorage) return;
        let backupStorageToPrimaryStorage = {
          'Ceph': 'Ceph',
          'Fusionstor': 'Fusionstor',
          'SftpBackupStorage': 'LocalStorage,NFS,SharedMountPoint',
          'ImageStoreBackupStorage': 'LocalStorage,NFS,SharedMountPoint,Ceph'
        };
        let psTypes = backupStorageToPrimaryStorage[backupStorage.type];
        let vmResp = await rpc.query(`vm-instances`, {q: [`rootVolume.primaryStorage.type?=${psTypes}`, 'type=UserVm', 'platform!=Other']});
        let vmUuids = vmResp.inventories.map(vm => vm.uuid);
        return vmUuids
      },
      //清空相应的资源
      removeUuid(name) {
        let self = this;
        self[name] = "";
        if (self[name] === '')
          self.validate(name);
      },
      //主存储选择
      openPrimaryStorage() {
        let self = this;
        self.primarySingleMessage = {
          conditions: ['type!=VCenter', 'state=Enabled', 'status=Connected', 'availableCapacity%3E=1'],
        };
        self.showPrimarySingleDlg = true;
      },
      //选择物理机
      async openHost() {
        const self = this;
        let conditions = [`cluster.primaryStorage.uuid=${self.primaryStorageUuid}`, `state=Enabled`];
        if (self.diskOfferingUuid) {
          let size = self.dbData.volumeoffering[self.diskOfferingUuid].diskSize;
          await self.getSelectableHost(size);
          conditions.push(`uuid?=${self.hostUuidList}`)
        }
        self.showHostSingleDlg = false;
        self.openDialog('HostListSingleSelectList', {
          conditions,
          select: (uuid) => {self.hostUuid = uuid}
        })
      },
      //打开存储池
      openCephPool() {
        let self = this;
        if (!self.primaryStorageUuid && self.createType === 'createByVolumeOffering') {
          self.emptyprimaryStorageUuid = true;
          return
        }
        if (!self.primaryStorageForVolumeImage && self.createType !== 'createByVolumeOffering') {
          self.emptyprimaryStorageForVolumeImage = true;
          return
        }
        self.cephPoolMessage = {
          conditions: [`primaryStorageUuid=${self.primaryStorageUuid}`, 'type=Data'],
        };
        self.validate('poolUuid');
        self.showCephPool = true;
      },
      openVolumeImage() {
        let self = this;
        self.openDialog('ImageSingleSelectListDlg', {
          conditions: this.isVolumeImageAvailableConditions,
          imageType: 'DataVolumeTemplate',
          ok: (uuid) => {
            self.selectVolumeImage(uuid)
          }
        })
      },
      //选择主存储
      async openPrimaryStorageForImage() {
        const self = this;
        let primaryStorageUuids = await self.initPrimariyStorageForVolumeImageUuidList();
        self.primarySingleMessage = {
          conditions: [`uuid?=${primaryStorageUuids}`, 'type!=VCenter'],
        };
        self.showPrimarySingleDlg = true;
      },
      selectPrimaryStorageForVolumeImage: function (uuid) {
        let self = this;
        let primaryStorageType = self.dbData.primarystorage[uuid].type;
        self.primaryStorageForVolumeImage = uuid;
        if (primaryStorageType !== 'Ceph') {
          this.isShared = false;
          this.canShare = false
        } else {
          this.canShare = true
        }
        if (primaryStorageType !== 'Ceph') {
          rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=ceph::default::dataVolumePoolName::%25']
          }).then((resp) => {
            if (resp.inventories.length > 0) {
              self.poolName = resp.inventories[0].tag.split('::')[3]
            }
          })
        } else if (primaryStorageType === 'LocalStorage') {
          // this.deleteAllAssistant()
          // this.queryForAssistant()
        }
      },
      //初始化
      initPrimariyStorageForVolumeImageUuidList: async function () {
        const self = this;
        let psUuids = [];
        debugger
        let queryConditions = ['state=Enabled', 'status=Connected', 'availableCapacity%3E=1'];
        if (self.windowData.vmInstanceUuid) {
          let vm = self.dbData.vm[self.vmInstanceUuid];
          if (!vm) return;
          let clusterUuid = vm.clusterUuid;
          queryConditions.push(`cluster.uuid=${clusterUuid}`);
          let psUuid = vm.allVolumes[0].primaryStorageUuid;
          psUuids.push(psUuid);
          let ps = self.dbData.primarystorage[psUuid];
          if (!ps) return;
          if (ps.type === 'LocalStorage') {
            self.hostUuid = vm.hostUuid;
          }
          let psTypes = ['NFS', 'SharedMountPoint', 'LocalStorage', 'Ceph'];
          if (psTypes.indexOf(ps.type) > -1) {
            queryConditions.push(`type?=${psTypes}`)
          }
        }
        if (this.dbData.common.isAdmin) {
          let psResp = await rpc.query(`primary-storage`, {q: queryConditions});
          psUuids = psUuids.concat(psResp.inventories.map(ps => ps.uuid))
        }
        return _.uniq(psUuids)
      },
      selectVolumeImage: function (uuid) {
        this.volumeImageUuid = uuid;
        this.vmInstanceUuid = '';
        this.initVmInstanceCondition();
        this.validate('volumeImageUuid')
      },
      //初始化云主机条件
      initVmInstanceCondition() {
        let isVmInstanceAvailableConditions = this.isVmInstanceAvailableConditions;
        let isVmInstanceExistedConditions = this.isVmInstanceExistedConditions;
        let psUuid = this.param && this.param.primaryStorageUuid;
        if (psUuid) {
          let ps = this.dbData.primarystorage[psUuid];
          let psType = ps && ps.type;
          isVmInstanceExistedConditions.push(`rootVolume.primaryStorage.type=${psType}`);
          isVmInstanceAvailableConditions.push(`rootVolume.primaryStorage.type=${psType}`);
          this.isVmInstanceAvailableConditions = isVmInstanceAvailableConditions;
          this.isVmInstanceExistedConditions = isVmInstanceExistedConditions;
          return
        }
        let image = this.dbData.image[this.volumeImageUuid];
        if (!image) return;
        let bsUuid = image.backupStorageRefs[0].backupStorageUuid;
        if (bsUuid) {
          let bs = this.dbData.backupstorage[bsUuid];
          let bsType = bs && bs.type;
          if (bsType === 'ImageStoreBackupStorage') {
            isVmInstanceAvailableConditions.push('rootVolume.primaryStorage.type?=LocalStorage,Ceph,NFS,SharedMountPoint');
            isVmInstanceExistedConditions.push('rootVolume.primaryStorage.type?=LocalStorage,Ceph,NFS,SharedMountPoint')
          }
          if (bsType === 'SftpBackupStorage') {
            isVmInstanceAvailableConditions.push('rootVolume.primaryStorage.type?=LocalStorage,NFS,SharedMountPoint');
            isVmInstanceExistedConditions.push('rootVolume.primaryStorage.type?=LocalStorage,NFS,SharedMountPoint')
          }
          if (bsType === 'Ceph') {
            isVmInstanceAvailableConditions.push('rootVolume.primaryStorage.type=Ceph');
            isVmInstanceExistedConditions.push('rootVolume.primaryStorage.type=Ceph')
          }
          if (bsType === 'Fusionstor') {
            isVmInstanceAvailableConditions.push('rootVolume.primaryStorage.type=Fusionstor');
            isVmInstanceExistedConditions.push('rootVolume.primaryStorage.type=Fusionstor')
          }
        }
        this.isVmInstanceAvailableConditions = isVmInstanceAvailableConditions;
        this.isVmInstanceExistedConditions = isVmInstanceExistedConditions
      },
      //打开云主机
      async openVm() {
        let self = this;
        // selecting vm when volume created by dataImageTemplate and not dlg ont opened throught ps detail page
        if (self.createType !== 'createByVolumeOffering' && !this.param.primaryStorageUuid) {
          let conditions = ['type=UserVm', 'platform!=Other'];
          if (self.volumeImageUuid) {
            let vmUuids = await self.initVmUuidListWhenCreatingByVolumeImage(self.volumeImageUuid);
            conditions.push(`uuid?=${vmUuids}`)
          }
          self.openDialog('VmSingleSelectListDlg', {
            conditions,
            ok: (uuid) => {
              self.vmInstanceUuid = uuid;
              self.validate('vmInstanceUuid')
            }
          });
          return
        }
        // selecting vm in other cases
        let psUuid = self.primaryStorageUuid;
        let type = psUuid && self.dbData.primarystorage[psUuid].type;
        let vmUuids;
        if (psUuid) vmUuids = await self.initVmUuidListWhenCreatingByVolumeOffering(psUuid);
        if (type === 'LocalStorage') {
          if (self.hostUuid === '') return;
          self.vmInstanceUuid = '';
          self.openDialog('VmSingleSelectListDlg', {
            conditions: [`uuid?=${vmUuids}`],
            ok: (uuid) => {
              self.vmInstanceUuid = uuid;
              self.validate('vmInstanceUuid')
            }
          })
        } else if (type === 'NFS' || type === 'SharedMountPoint') {
          self.vmInstanceUuid = '';
          self.openDialog('VmSingleSelectListDlg', {
            conditions: [`uuid?=${vmUuids}`],
            ok: (uuid) => {
              self.vmInstanceUuid = uuid;
              self.validate('vmInstanceUuid')
            }
          })
        } else {
          let conditions = ['type=UserVm', 'platform!=Other', 'hypervisorType=KVM'];
          if (psUuid) conditions.push(`allVolumes.primaryStorage.uuid=${psUuid}`);
          self.openDialog('VmSingleSelectListDlg', {
            conditions: conditions,
            ok: (uuid) => {
              self.vmInstanceUuid = uuid;
              self.validate('vmInstanceUuid')
            }
          })
        }
      },
      async initVmUuidListWhenCreatingByVolumeOffering(psUuid) {
        const self = this;
        let ps = self.dbData.primarystorage[psUuid];
        let clusters = ps.attachedClusterUuids;
        let type = ps.type;
        let sharedPs = ['NFS', 'SharedMountPoint'];
        let conditions = ['type=UserVm', 'platform!=Other'];
        let vmUuids = [];
        if (type === 'LocalStorage') {
          let hostUuid = self.hostUuid;
          let localVmCondition = conditions.concat(`rootVolume.localStorageHostRef.hostUuid=${hostUuid}`);
          let localVmResp = await rpc.query(`vm-instances`, {q: localVmCondition});
          let localVms = localVmResp.inventories.map(vm => vm.uuid);
          let psResp = await rpc.query(`primary-storage`, {q: [`cluster.uuid?=${clusters}`, `type?=${sharedPs}`]});
          if (psResp.inventories.length === 0) return localVms;
          let psUuids = psResp.inventories.map(ps => ps.uuid);
          let sharedVmCondition = conditions.concat(`rootVolume.primaryStorage.uuid?=${psUuids}`);
          let runningSharedVmCondition = sharedVmCondition.concat(['state=Running', `host.uuid=${hostUuid}`]);
          let runningSharedVmResp = await rpc.query(`vm-instances`, {q: runningSharedVmCondition});
          let runningSharedVms = runningSharedVmResp.inventories.map(vm => vm.uuid);
          let stoppedSharedVmCondition = sharedVmCondition.concat(['state=Stopped']);
          let stoppedSharedVmResp = await rpc.query(`vm-instances`, {q: stoppedSharedVmCondition});
          let stoppedSharedVms = stoppedSharedVmResp.inventories.map(vm => vm.uuid);
          let localDataVolumesOnOtherHostOfStoppedSharedVmsResp = await rpc.query(`volumes`, {q: [`vmInstanceUuid?=${stoppedSharedVms}`, `primaryStorage.type=LocalStorage`, `localStorageHostRef.hostUuid!=${hostUuid}`, 'type=Data']});
          let stoppedSharedVmsWithlocalDataVolumesOnOtherHost = localDataVolumesOnOtherHostOfStoppedSharedVmsResp.inventories.map(volume => volume.vmInstanceUuid);
          stoppedSharedVms = _.xor(stoppedSharedVms, stoppedSharedVmsWithlocalDataVolumesOnOtherHost);
          vmUuids = vmUuids.concat(_.union(localVms, stoppedSharedVms, runningSharedVms))
        } else if (sharedPs.indexOf(type) > -1) {
          let psTypes = ['NFS', 'SharedMountPoint', 'LocalStorage'];
          let psInSameCluster = await rpc.query(`primary-storage`, {q: [`type?=${psTypes}`, `cluster.uuid?=${clusters}`]});
          let psUuids = psInSameCluster.inventories.map(ps => ps.uuid);
          let sharedVmCondition = conditions.concat(`rootVolume.primaryStorage.uuid?=${psUuids}`);
          let sharedVmResp = await rpc.query(`vm-instances`, {q: sharedVmCondition});
          let sharedVms = sharedVmResp.inventories.map(vm => vm.uuid);
          vmUuids = vmUuids.concat(sharedVms)
        }
        return vmUuids
      },
      getSelectableHost(size) {
        const self = this;
        let tasks = [];
        let p;
        let primarystorage = self.primaryStorageUuid;
        this.hostUuidList = [];
        return rpc.query('hosts', {q: [`cluster.primaryStorage.uuid=${primarystorage}`]}).then(hostResp => {
          hostResp.inventories.forEach(host => {
            p = rpc.get(`primary-storage/local-storage/${primarystorage}/capacities?hostUuid=${host.uuid}`).then(resp => {
              if (Number(resp.inventories[0].availableCapacity) >= Number(size)) {
                self.hostUuidList.push(host.uuid)
              }
            });
            tasks.push(p)
          });
          return Promise.all(tasks)
        })
      },
      //vm回调
      closeVmSingleDlg(param) {
        let self = this;
      },
      //存储池回调
      closeCephPoolDlg(param) {
        let self = this;
        if (param) {
          let pool = _.cloneDeep(self.dbData.pool[param.uuid]);
          self.poolName = pool.poolName,
            self.poolUuid = param.uuid;
          self.validate('poolUuid')
        }
        self.showCephPool = false;
      },
      closeHostDlg(param) {
        let self = this;
        if (param) {

        }
        self.showHostSingleDlg = false;
      },
      validate(name) {
        let self = this;
        let input = name === 'name' ? String(self[name]).trim() : self[name];
        if (!input) {
          self[`empty${name}`] = true;
          return
        }
        self[`empty${name}`] = false;
      },
      //是否展示物理机
      showHost() {
        let psUuid = this.primaryStorageUuid;
        let ps = this.dbData.primarystorage[psUuid];
        let type = ps && ps.type;
        if (type !== 'LocalStorage') return false;
        if (!this.param.primaryStorageUuid && this.createType !== 'createByVolumeOffering') return false;
        return true
      },
      //创建参数
      createParam: function () {
        let obj = {
          name: this.name,
          description: this.description,
          vmInstanceUuid: this.vmInstanceUuid,
          hostUuid: this.hostUuid,
          VirtioSCSI: this.isVirtioSCSI
        }, self = this;
        if (self.createType === 'createByVolumeOffering') {
          obj.diskOfferingUuid = this.diskOfferingUuid;
          obj.primaryStorageUuid = this.primaryStorageUuid;
          obj.shareable = this.isShared;
          obj.poolName = this.poolName
        } else {
          obj.volumeImageUuid = this.volumeImageUuid;
          obj.poolName = this.poolName;
          let vm = this.dbData.vm[this.vmInstanceUuid];
          obj.primaryStorageUuid = vm && vm.allVolumes[0].primaryStorageUuid
        }
        if (this.param.primaryStorageUuid) {
          obj.primaryStorageUuid = this.param.primaryStorageUuid
        }
        if (!this.param.primaryStorageUuid && self.createType !== 'createByVolumeOffering') {
          if (this.primaryStorageForVolumeImage) {
            obj.primaryStorageUuid = this.primaryStorageForVolumeImage
          } else {
            let vm = this.dbData.vm[this.vmInstanceUuid];
            obj.primaryStorageUuid = vm && vm.allVolumes[0].primaryStorageUuid
          }
        }
        return obj
      },
      validateAll() {
        let self = this, props = [];
        if (self.createType === 'createByVolumeOffering') {
          props = ['name', 'diskOfferingUuid']
        } else {
          props = ['name', 'poolUuid', 'vmInstanceUuid', 'primaryStorageForVolumeImage'];
        }
        props.forEach((item) => {
          self.validate(item)
        });
        self.inputValidate = props.some((item) => {
          return self[`empty${item}`] === true;
        })
      },
      //确定创建
      confirm() {
        let self = this;
        self.validateAll();
        if (self.inputValidate) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'volume'})
          }).catch(() => {
            self.$router.push({name: 'volume'})
        })
      },
    }
  }
</script>

<style scoped>

</style>
