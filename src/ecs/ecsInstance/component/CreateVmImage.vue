<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>{{$t('vm.image.create')}}</span>
        <span class="create-back"  @click="$emit('close')"><i class="el-icon-back"></i>回到云主机列表</span>
      </div>
      <div slot="body">
        <el-form :model="vmImageConfig" :rules="rules" ref="vmImage">
          <el-form-item :label="$t('common.name')" prop="name" class="operation-row">
            <el-input v-model="vmImageConfig.name"/>
          </el-form-item>
          <el-form-item :label="$t('common.description')" prop="description" class="operation-row">
            <el-input type="textarea" rows="3" v-model="vmImageConfig.description"/>
          </el-form-item>
        </el-form>
        <div class="operation-row">
          <div class="title required">{{$t('image.imageType')}}</div>
          <el-radio v-model="iamgeType" label="system">{{$t('image.systemImage')}}</el-radio>
          <el-radio v-model="iamgeType" label="volume">{{$t('image.volumeImage')}}</el-radio>
        </div>
        <div class="operation-row" v-if="iamgeType === 'system'">
            <drop-down class="button dropdown" style="padding-left: 12px; padding-right: 8px;">
                <span slot="title">
                  <span class="text">{{platform}}</span>
                </span>
            <span slot="content">
                  <div class="dropdown-content">
                    <a @click="(e) => { platform =  e.target.text}" style="padding-top: 12px;">Linux</a>
                    <a @click="(e) => {platform = e.target.text }">Windows</a>
                    <a @click="(e) => { platform =  e.target.text}" style="padding-top: 12px;">WindowsVirtio</a>
                    <a @click="(e) => {platform = e.target.text }">Other</a>
                    <a @click="(e) => { platform =  e.target.text}" style="padding-top: 12px;">Paravirtualization</a>
                  </div>
                </span>
          </drop-down>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.backupstorage')}}</div>
          <add-or-delete-input :value="dbData.backupstorage[backupStorageUuid] && dbData.backupstorage[backupStorageUuid].name"
                               @open="openBackupStorage" @remove="clearRow('backupStorageUuid')":class="{'is-error': validateBackupStorageUuid}"></add-or-delete-input>
          <div class="error" v-if="validateBackupStorageUuid" :class="{'error-text': validateBackupStorageUuid}">{{$t('error.noEmpty')}}</div>
        </div>
      </div>
      <div slot="footer">
        <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
    <backup-storage-single-dlg v-if="showBSDlg" :model="showBSDlg"
                               :message="BSMessage" @close="closeBSDlg"></backup-storage-single-dlg>
  </div>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import PrimaryStorageSingleDlg from "../../../dialog/PrimaryStorageSingleDlg";
  import BackupStorageSingleDlg from "../../../dialog/BackupStorageSingleListDlg";

  export default {
    name: "CreateVmImage",
    components: {BackupStorageSingleDlg, PrimaryStorageSingleDlg, AddOrDeleteInput, CreateTemplateNoRoute},
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        iamgeType: 'system',
        basicBackupStorageCondition: ['state=Enabled', 'status=Connected', `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`],
        platform: 'Linux',
        url: '',
        mediaType: '',
        backupStorageUuid: '',
        vmUuid: '',
        primaryStorageType: '',
        showBSDlg: false,
        BSMessage: {},
        validateBackupStorageUuid: false,
        vmImageConfig: {
          name: '',
          description: ''
        },
        rules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    mounted(){
      let primaryStorageType = ''
      let vmUuid = ''
      if (this.param) {
        if (this.param.vmUuid) vmUuid = this.param.vmUuid
        if (this.param.primaryStorageType) primaryStorageType = this.param.primaryStorageType
      }
      this.initBackupStorage()
      // this.queryForAssistant()
    },
    methods: {
      async openBackupStorage(){
        let self = this
        let conditions = await this.getBackupStorageCondition();
        self.BSMessage = {
          conditions,
          volumeUuid: self.param.volumeUuid,
        };
        self.showBSDlg = true;
      },
      closeBSDlg(param){
        let self = this;
        if(param){
          self.backupStorageUuid = param;
        }
        self.validate();
        self.showBSDlg = false;
      },
      clearRow(param){
        let self = this;
        self[param] = ''
      },
      async initBackupStorage() {
        let backupstorageInventories
        let conditions = await this.getBackupStorageCondition()
        return rpc.query('backup-storage', { q: conditions }).then(resp => {
          backupstorageInventories = resp.inventories
          return this.updateDbTable({
            tableName: 'backupstorage',
            list: resp.inventories
          })
        }).then(() => {
          if (backupstorageInventories.length === 1) {
            return this.backupStorageUuid = backupstorageInventories[0].uuid
          }
        })
      },
      async getBackupStorageCondition() {
        let self = this;
        let conditions = self.basicBackupStorageCondition
        let psType = self.primaryStorageType
        if (['LocalStorage', 'NFS', 'SharedMountPoint'].indexOf(psType) > -1) {
          conditions.push('type?=ImageStoreBackupStorage,SftpBackupStorage')
        } else if (psType === 'Ceph') {
          let primaryStorageUuid = await self.getPrimaryStorageUuid()
          if (primaryStorageUuid === '') return conditions
          let backupStorageUuidList = await self.initCephCondition(primaryStorageUuid)
          conditions.push('type?=Ceph,ImageStoreBackupStorage')
          if (backupStorageUuidList.length > 0) {
            conditions.push(`uuid?=${backupStorageUuidList}`)
          }
        } else if (psType === 'Fusionstor') {
          conditions.push('type=Fusionstor')
        }
        return conditions
      },
      async getPrimaryStorageUuid() {
        if (!this.dbData.volume[this.dbData.vm[this.windowData.vmUuid].rootVolumeUuid]) {
          let volume = await rpc.query('volumes', {
            q: [`uuid=${this.windowData.vmUuid}`]
          })
          await this.updateDbRow({
            tableName: 'volume',
            id: volume.uuid,
            data: volume
          })
        }
        return this.dbData.volume[this.dbData.vm[this.windowData.vmUuid].rootVolumeUuid].primaryStorageUuid
      },
      async initCephCondition  (primaryStorageUuid) {
        let self = this;
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
      createParam() {
        let obj = {
          name: this.vmImageConfig.name,
          description: this.vmImageConfig.description,
          platform: this.platform
        }
        obj.isSystem = this.iamgeType === 'system' ? true : false;
        if (this.backupStorageUuid !== '') obj.backupStorageUuids = [this.backupStorageUuid];
        obj.vmUuid = this.param.vmUuid;
        return obj
      },
      validate(param){
        this.validateBackupStorageUuid = false;
        if(this.backupStorageUuid === '') return this.validateBackupStorageUuid = true;
      },
      confirm(){
        let self = this;
        let input = this.validate();
        if(input){
          return ;
        }
        self.$refs.vmImage.validate((valid) => {
          if(valid){
            this.$emit('close', this.createParam());
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
 .el-form-item{
   margin-bottom: 0;
 }
 .dropdown{
   width: calc(100%  - 20px);
   border: 1px solid #dae0e6;
   display: inline-block;
   height: 40px;
   border-radius: 2px;
   .dropdown-content{
     width: 100%;
   }
 }
</style>
