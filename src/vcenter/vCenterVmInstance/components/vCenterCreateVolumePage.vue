<template>
   <create-template-no-route>
     <div slot="header">
       <span>{{$t('common.createVolume')}}</span>
       <span class="create-back" @click="$emit('close')">
         <i class="el-icon-back"></i>
         <span style="font-size: 12px;">返回</span>
       </span>
     </div>
     <div slot="body" class="create-body">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input v-model="name" @blur="validate('name')"
                 :class="{'is-error': emptyname}"/>
          <div class="error error-text" v-show="emptyname">
            {{$t('error.emptyInput') + $t('common.name')}}
          </div>
        </div>

       <div class="operation-row">
         <div class="title">{{$t('common.description')}}</div>
         <textarea rows="3" v-model="description"/>
       </div>

       <div class="operation-row">
         <div class="title required">创建方式</div>
         <el-radio-group v-model="createType" @change="toggleCreateMethod()">
           <el-radio :label="true">{{$t('common.volumeoffering')}}</el-radio>
           <el-radio :label="false">{{$t('image.volumeImage')}}</el-radio>
         </el-radio-group>
         <add-or-delete-input v-if="createType" @open="openVolumeOfferingSelect"
                              :value="dbData.volumeoffering[volumeUuid] && dbData.volumeoffering[volumeUuid].name"
                              :class="{'is-error': emptyvolumeUuid}" @remove="removeUuid('volumeUuid')"/>
         <div class="error error-text" v-show="emptyvolumeUuid">{{$t('error.emptyInput') + $t('common.volumeoffering')}}</div>

         <add-or-delete-input v-if="!createType" @open="openImageSelect"
                              :value="dbData.image[imageUuid] && dbData.image[imageUuid].name"
                              :class="{'is-error': emptyimageUuid}" @remove="removeUuid('imageUuid')"/>
         <div class="error error-text" v-show="emptyimageUuid">{{$t('error.emptyInput') + $t('image.volumeImage')}}</div>
       </div>

       <div class="operation-row" v-if="dbData.common.isAdmin && (['LocalStorage', 'NFS', 'SharedMountPoint'].indexOf(windowData.primaryStorageType) > -1)">
         <div class="title">
           {{$t("common.primaryStorage")}}
         </div>
         <add-or-delete-input @open="openPrimaryStorageDlg"
                              :value="dbData.primarystorage[primaryStorageUuid] && dbData.primarystorage[primaryStorageUuid].name"
                              :class="{'is-error': emptyprimaryStorageUuid}" @remove="removeUuid('primaryStorageUuid')"/>
         <div class="error error-text" v-if="emptyprimaryStorageUuid && dbData.common.isAdmin">
           {{$t('error.unselected')+$t('common.primaryStorage')}}
         </div>
       </div>

       <div class="operation-row" v-if="dbData.common.isAdmin && windowData.primaryStorageType==='Ceph'">
         <div class="title">
           {{$t("common.cephPool")}}
         </div>
         <add-or-delete-input  @open="openPrimaryStoragePoolDlg"
                              :value="dbData.pool[poolUuid] && dbData.pool[poolUuid].poolName"
                              @remove="removeUuid('poolUuid')"/>
       </div>
      </div>

     <div slot="footer" class="create-footer">
       <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
       <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
     </div>
   </create-template-no-route>
</template>

<script>
    import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
    import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
    import WindowBase from 'src/windows/Window';
    import Utils from 'src/utils/utils';
    import rpc from 'src/utils/rpc';

    export default {
      name: "vCenterCreateVolumePage",

      mixins: [WindowBase],

      components: {AddOrDeleteInput, CreateTemplateNoRoute},

      props: {
        param: {
          type: Object,
          default: () => {

          }
        }
      },

      created() {
        let self = this, vmInstanceUuid = '', uuid;
        vmInstanceUuid = this.param.vmUuid ? self.param.vmUuid : '';
        this.dbData.vm[this.param.vmUuid].allVolumes.forEach((item) => {
          if (item.type === 'Root') uuid = item.primaryStorageUuid
        })
        if (self.dbData.common.isAdmin) {
          rpc.query('primary-storage', {
            q: [`uuid=${uuid}`, 'state=Enabled', 'status=Connected', 'availableCapacity%3E=1', 'type=VCenter']
          })
            .then((resp) => {
              if (resp.inventories.length === 1) {
                this.primaryStorageUuid = resp.inventories[0].uuid
                this.updateWindow({
                  primaryStorageType: resp.inventories[0].type,
                }).then(() => {
                  this.queryForAssistant()
                })
              }
              if (resp.inventories[0] && resp.inventories[0].type === 'Ceph') self.updateWindow({ canShare: true })
              else self.updateWindow({ canShare: false })
            })
        }
        let vm = this.dbData.vm[this.param.vmUuid];
        self.hostUuid = vm && vm.hostUuid ? vm.hostUuid : vm.lastHostUuid
        self.updateWindow({
          vmInstanceUuid
        }).then( () => {
          self.initVolumeOffering()
          if (this.dbData.common.isAdmin) {
            this.initSelectablePs()
          }
        })
      },

      data() {
        return {
          name: '',
          description: '',
          volumeUuid: '',
          imageUuid: '',
          createType: true,
          emptyname: false,
          invalidname: false,
          emptyvolumeUuid: false,
          emptyimageUuid: false,
          isVolumeImageAvailableConditions: ['state=Enabled', 'type=zstack', 'status=Ready', 'system=false',
            `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType=DataVolumeTemplate', 'format=vmtx'],
          primaryStorageUuid: '',
          emptyprimaryStorageUuid:'',
          poolUuid: '',
          hostUuid: '',
          poolUuidForVolumeImage: '',
          isVolumeImageExistedConditions: ['type=zstack', 'status!=Deleted', 'system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType=DataVolumeTemplate', 'format=vmtx']
        }
      },

      methods: {
        ...Utils,

        openVolumeOfferingSelect() {
          let self = this;
          self.openDialog('VolumeOfferingListSingleSelectList', {
            conditions: ['state=Enabled'],
            select: (uuid) => self.selectVolumeOffering(uuid)
          })
        },

        initVolumeOffering () {
          let volumeOfferingInventorise
          rpc.query('disk-offerings', {q: ['state=Enabled']})
            .then((resp) => {
              volumeOfferingInventorise = resp.inventories
              return this.updateDbTable({
                tableName: 'volumeoffering',
                list: resp.inventories
              })
            })
            .then(() => {
              if (volumeOfferingInventorise.length === 1) this.volumeUuid = volumeOfferingInventorise[0].uuid;
            })
        },

        openImageSelect() {
          let self = this;
          self.openDialog('ImageSingleSelectListDlg', {
            conditions: this.isVolumeImageAvailableConditions,
            select: (uuid) => self.selectVolumeImage(uuid)
          })
        },

        selectVolumeOffering(uuid) {
          let self = this;
          self.volumeUuid = uuid;
        },

        selectVolumeImage(uuid) {
          let self = this;
          self.imageUuid = uuid;
        },

        removeUuid(uuid) {
          this[uuid] = '';
          this.validate(uuid);
        },

        validate(name) {
          debugger
          let self = this, input = '';
          input = name === 'name' ? String(self[name]).trim() : self[name];
          self[`empty${name}`] = false;
          if(!input) {
            self[`empty${name}`] = true;
            return;
          }
        },

        validateAll() {
          let self  = this, props = ['name'];
          if(self.createType) {
            props.push('volumeUuid');
            if(props.includes('imageUuid')) props.splice(props.indexOf('imageUuid'), 1);
          }else{
            props.push('imageUuid');
            if(props.includes('volumeUuid')) props.splice(props.indexOf('volumeUuid'), 1);
          }
          props.forEach(name => self.validate(name));
          let invalid = props.some(name => self[`empty${name}`] === true);
          return invalid;
        },

        initSelectablePs () {
          let vm = this.dbData.vm[this.windowData.vmInstanceUuid]
          let clusterUuid = vm && vm.clusterUuid
          rpc.query(`primary-storage`, {q: `cluster.uuid=${clusterUuid}`}).then(psResp => {
            let psUuids = psResp.inventories.map(ps => ps.uuid)
            this.updateWindow({
              primaryStorageUuidList: psUuids
            })
          })
        },

        createParam() {
          let obj = {
            name: this.name,
            description: this.description
          }
          if (this.poolName) {
            obj.poolName = this.poolName
          }
          let ps = this.dbData.primarystorage[this.primaryStorageUuid]
          if (ps) {
            obj.primaryStorageUuid = this.primaryStorageUuid
            if (ps.type === 'LocalStorage') {
              obj.hostUuid = this.hostUuid
            }
          }
          if (this.createType) {
            obj.diskOfferingUuid = this.volumeUuid
            obj.VirtioSCSI = this.windowData.VirtioSCSI
            obj.shareable = this.windowData.shareable
          } else {
            obj.volumeImageUuid = this.imageUuid;
          }
          return obj
        },

        openPrimaryStorageDlg () {
          const self = this
          self.openDialog('PrimaryStorageListSingleSelectList', {
            conditions: ['state=Enabled', 'status=Connected', 'availableCapacity%3E=1', `uuid?=${self.primaryStorageUuidList}`],
            select: (uuid) => self.selectPrimaryStorage(uuid)
          })
        },

        selectPrimaryStorage(uuid) {
          let self = this
          self.primaryStorageUuid = uuid;
        },


        toggleCreateMethod: async function () {
          let obj = {
            VirtioSCSI: false,
            shareable: false
          }
          this.poolName = '';
          this.poolUuid = '';
          this.poolUuidForVolumeImage= '';
          this.volumeUuid= '';
          this.imageUuid= '';
          this.updateWindow(obj)
          if (!this.createType) {
            await this.initVolumeImageCondition()
          } else {
            let bsTypeIndex = -1
            let volumeImageConditions = this.isVolumeImageAvailableConditions
            for (var i = 0; i < volumeImageConditions.length; i++) {
              if (volumeImageConditions[i].indexOf('backupStorage.type') > -1) {
                bsTypeIndex = i
                break
              }
            }
            if (bsTypeIndex !== -1) {
              this.isVolumeImageAvailableConditions.splice(bsTypeIndex, 1)
            }
          }
          this.queryForAssistant()
        },
        initVolumeImageCondition: async function () {
          let conditions = this.isVolumeImageAvailableConditions
          let psType = this.windowData.primaryStorageType
          if (['LocalStorage', 'NFS', 'SharedMountPoint'].indexOf(psType) > -1) {
            conditions.push('backupStorage.type?=ImageStoreBackupStorage,SftpBackupStorage')
          }
          if (psType === 'Ceph') {
            await this.initCephCondition(this.primaryStorageUuid)
              .then((backupStorageUuidList) => {
                conditions.push('backupStorage.type?=ImageStoreBackupStorage,Ceph')
                if (backupStorageUuidList.length > 0) {
                  conditions.push(`backupStorage.uuid?=${backupStorageUuidList}`)
                }
              })
          }
          if (psType === 'Fusionstor') {
            conditions.push('backupStorage.type=Fusionstor')
          }
          this.isVolumeImageAvailableConditions = conditions
        },

        queryBsInZone: async function () {
          let resp = await rpc.query('backup-storage', {
            q: [`zone.uuid=${window.localStorage.getItem('currZoneUuid')}`, '__systemTag__!=remote', 'state=Enabled', 'status=Connected']
          })
          return resp
        },

        queryPsInZone: async function () {
          let resp = await rpc.query('primary-storage', {
            q: [`zone.uuid=${window.localStorage.getItem('currZoneUuid')}`, 'state=Enabled', 'status=Connected', 'type=Ceph']
          })
          return resp
        },

        initCephCondition: async function (primaryStorageUuid) {
          const self = this
          let bsResp = await self.queryBsInZone()
          let bsList = bsResp.inventories
          let psInZoneResp = await self.queryPsInZone()
          let cephPsList = psInZoneResp.inventories

          let cephBsList = bsList.filter(item => item.type === 'Ceph')
          let cephBsNumber = cephBsList.length
          let imageStoreBsUuidList = bsList.filter(item => item.type === 'ImageStoreBackupStorage').map(item => item.uuid)
          let cephPsNumber = cephPsList.length
          let backupStorageUuidList = []
          if (cephBsNumber >= 1 && cephPsNumber >= 1) {
            cephPsList.forEach(item => {
              if (item.uuid === primaryStorageUuid) {
                cephBsList.forEach(it => {
                  if (it.fsid === item.fsid) {
                    backupStorageUuidList.push(it.uuid)
                  }
                })
              }
            })
          }
          backupStorageUuidList = backupStorageUuidList.concat(imageStoreBsUuidList)
          return backupStorageUuidList
        },

        queryForAssistant () {
          let self = this
          let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
          self.deleteAllAssistant()
          let newAssistant = (resourceName, operation) => {
            let id = `assistant-${self.genUniqueId()}`
            let content, hide, handler
            handler = () => {
              let nameForDlg = resourceName === 'VolumeImage' ? 'vCenterImage' : resourceName;
              switch (resourceName) {
                case 'VolumeImage':
                  nameForDlg = 'vCenterImage';
                  break;
                case 'PrimaryStorage':
                  nameForDlg = 'primarystorage';
                  break;
                default:
                  nameForDlg =resourceName;
              }
              self.$router.push({name: `create${nameForDlg}`})
            }
            if (!self.dbData.common.isAdmin && resourceName === 'VolumeOffering') {
              content = 'lackOfVolumeOffering'
              if (operation === 'check') {
                content = 'disabledVolumeOffering'
                handler = () => {
                  self.$router.push({name:'volumeoffering'})
                }
              }
              hide = true
            }
            if (self.dbData.common.isAdmin) {
              content = `lackOf${resourceName}`
              hide = false
              if (operation === 'check') {
                content = `disabled${resourceName}`
                let table = {
                  PrimaryStorage: 'primarystorage',
                  VolumeOffering: 'volumeoffering',
                  Host: 'host'
                }
                handler = () => {
                  self.$router.push({name: table[resourceName]})
                }
              }
            }
            if (resourceName === 'VolumeImage') {
              hide = false
              if (operation === 'add') {
                content = `lackOf${resourceName}`
              }
              if (operation === 'check') {
                self.imageAssistantId = id
                content = `disabled${resourceName}`
                handler = () => {
                  self.$router.push('/main/image')
                }
              }
            }
            self.createAssistant({
              id,
              title: 'volumeTitle',
              ownerId: self.windowData.id,
              content,
              operation,
              hide,
              handler
            })
          }
          if (!self.createType) {
            rpc.query('images', {count: true, q: self.isVolumeImageExistedConditions}).then(resp => {
              if (resp.total === 0) {
                newAssistant('VolumeImage', 'add')
                return
              }
              rpc.query('images', {count: true, q: self.isVolumeImageAvailableConditions}).then(resp => {
                if (resp.total === 0) {
                  newAssistant('VolumeImage', 'check')
                  self.addTimerTask({
                    id: self.windowData.timerId,
                    interval: 2,
                    method: () => {
                      self.queryImageForAssistant()
                    }
                  })
                }
              })
            })
          } else {
            rpc.query('disk-offerings', {count: true}).then(resp => {
              if (resp.total === 0) {
                newAssistant('VolumeOffering', 'create')
                return
              }
              rpc.query('disk-offerings', {count: true, q: ['state=Enabled']}).then(resp => {
                if (resp.total === 0) {
                  newAssistant('VolumeOffering', 'check')
                }
              })
            })
          }
          if (self.dbData.common.isAdmin) {
            rpc.query('primary-storage', {count: true, q: zoneUuid}).then(resp => {
              if (resp.total === 0) {
                newAssistant('PrimaryStorage', 'add')
                return
              }
              rpc.query('primary-storage', {count: true, q: ['state=Enabled', 'status=Connected', zoneUuid, 'type!=VCenter', 'availableCapacity%3E=1']}).then(resp => {
                if (resp.total === 0) {
                  newAssistant('PrimaryStorage', 'check')
                }
              })
            })
            if (self.primaryStorageUuid !== '' && self.dbData.primarystorage[self.primaryStorageUuid].type === 'LocalStorage') {
              rpc.query('hosts', {count: true, q: zoneUuid}).then(resp => {
                if (resp.total === 0) {
                  newAssistant('Host', 'add')
                  return
                }
                rpc.query('hosts', {count: true, q: ['state=Enabled', 'status=Connected', zoneUuid]}).then(resp => {
                  if (resp.total === 0) {
                    newAssistant('Host', 'check')
                  }
                })
              })
            }
          }
        },


        queryImageForAssistant () {
          const self = this
          return rpc.query('images', {count: true, q: self.isVolumeImageAvailableConditions}).then(resp => {
            if (resp.total !== 0) {
              self.removeTimerTask(self.windowData.timerId)
              self.deleteAssistant(this.imageAssistantId)
            }
          })
        },

        confirm() {
          let self = this;
          if(self.validateAll()) return;
          self.param.ok(this.createParam())
          self.$emit('close');
        }

      },

      destroyed() {
        let self = this;
        self.deleteAllAssistant();
      }
    }
</script>

<style scoped>

</style>
