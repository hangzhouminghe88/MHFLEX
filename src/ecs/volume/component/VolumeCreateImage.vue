<template>
  <div>
    <create-template-no-route>
      <div slot="header">
     <span>
          {{$t('volume.createImage')}}
        </span>
        <span @click="$emit('close')" class="create-back"><i class="el-icon-back"></i>返回</span>
      </div>
      <div slot="body">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input @blur="validate('name')" @keydown.enter="validate('name')" type="text" v-model="name"/>
          <div class="error error-text" v-if="validatename">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea rows="3" v-model="description"></textarea>
        </div>
        <div class="operation-row" v-if="param.volumeType === 'Root'">
          <el-radio label="systemImage" v-model="imageType">{{ $t("image.systemImage") }}</el-radio>
          <el-radio label="volumeImage" v-model="imageType">{{ $t("image.volumeImage") }}</el-radio>
        </div>
        <div class="operation-row" v-if="param.volumeType === 'Root'">
          <div class="title">{{$t('common.platform')}}</div>
          <drop-down class="dropdown create-dropdown">
            <span slot="title">
              <span class="text">{{platform}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a @click="(e) => {platform = e.target.text}" v-for="(plat, index) in platformList">{{plat.value}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.backupstorage')}}</div>
          <add-or-delete-input :value="dbData.backupstorage[bsUuid] && dbData.backupstorage[bsUuid].name"
                               @open="showCreateBs()" @remove="closeCreateBs()"/>
          <div class="error error-text" style="margin-top: -15px" v-if="validatebsUuid">
            {{$t('common.backupstorage')}}{{$t('error.noEmpty')}}
          </div>
        </div>
      </div>
      <div slot="footer">
        <span @click="confrimDlg()" class="btn-confirm">{{$t('common.ok')}}</span>
        <span @click="cancel()" class="btn-cancel">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
    <backup-storage-single-dlg :message="bsMessage" :model="showBsSingleDlg" @close="closeBsSingleDlg"
                               v-if="showBsSingleDlg"/>
  </div>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import BackupStorageSingleDlg from "../../../dialog/BackupStorageSingleListDlg";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VolumeCreateImage",
    mixins: [WindowBase],
    components: {BackupStorageSingleDlg, AddOrDeleteInput, CreateTemplateNoRoute},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        showBsSingleDlg: false,
        bsMessage: {},
        bsUuid: '',
        name: '',
        description: '',
        validatename: false,
        validatebsUuid: false,
        imageType: 'systemImage',
        platform: 'Linux',
        volumeUuid: '',
        backupStorageCondition: ['state=Enabled', 'status=Connected', `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`],
        platformList: [
          {'name': 'Linux', value: 'Linux'},
          {'name': 'Windows', value: 'Windows'},
          {'name': 'WindowsVirtio', value: 'WindowsVirtio'},
          {'name': 'Other', value: 'Other'},
          {'name': 'Paravirtualization', value: 'Paravirtualization'},
        ]
      }
    },
    mounted() {
      let self = this;
      self.volumeUuid = self.param.volumeUuid;
      self.initBackupStorageCondition();
      self.initBackupStorage();
    },
    methods: {
      //初始化镜像服务器条件
      initBackupStorageCondition() {
        let conditions = this.backupStorageCondition;
        let bsTypeIndex = -1;
        for (var i = 0; i < conditions.length; i++) {
          if (conditions[i].indexOf('type') > -1) {
            bsTypeIndex = i;
            break
          }
        }
        if (bsTypeIndex !== -1) {
          conditions.splice(bsTypeIndex, 1)
        }
        let psType = this.windowData.primaryStorageType;
        if (['LocalStorage', 'NFS', 'SharedMountPoint'].indexOf(psType) > -1) {
          conditions.push('type?=ImageStoreBackupStorage,SftpBackupStorage')
        }
        if (psType === 'Ceph') {
          conditions.push('type?=Ceph,ImageStoreBackupStorage')
        }
        if (psType === 'Fusionstor') {
          conditions.push('type=Fusionstor')
        }
        this.backupStorageCondition = conditions
      },
      //初始化镜像服务器
      initBackupStorage: function () {
        let backupstorageInventories;
        rpc.query('backup-storage', {q: this.backupStorageCondition}).then(resp => {
          backupstorageInventories = resp.inventories;
          return this.updateDbTable({
            tableName: 'backupstorage',
            list: resp.inventories
          })
        }).then(() => {
          if (backupstorageInventories.length === 1) this.bsUuid = backupstorageInventories[0].uuid
        })
      },
      cancel() {
        let self = this;
        self.$emit('close');
      },
      //展示创建bs的选择镜像服务器页面
      showCreateBs() {
        let self = this;
        self.bsMessage = {
          conditions: this.backupStorageCondition,
          volumeUuid: self.param.volumeUuid,
        };
        self.showBsSingleDlg = true;
      },
      //关闭镜像服务器
      closeBsSingleDlg(param) {
        let self = this;
        if (param) {
          self.bsUuid = param;
          self.validate('bsUuid');
        }
        self.showBsSingleDlg = false;
      },
      //创建云盘镜像参数
      createParam: function () {
        let obj = {
          name: this.name,
          description: this.description,
          volumeUuid: this.volumeUuid,
          volumeType: this.param.volumeType
        };
        if (this.bsUuid !== '') obj.backupStorageUuids = [this.bsUuid];
        if (this.param.volumeType === 'Root') {
          obj.isSystem = this.imageType === 'systemImage' ? true : false;
          obj.platform = this.platform
        }
        return obj
      },
      closeCreateBs() {
        let self = this;
        self.bsUuid = '';
      },
      validate(param) {
        let self = this;
        if (!param) return;
        let input = param === 'name' ? String(this[param]).trim() : this[param];
        if (!input) {
          self[`validate${param}`] = true
        } else {
          self[`validate${param}`] = false
        }
      },
      confrimDlg() {
        let self = this, props = ['name', 'bsUuid'];
        props.forEach((item) => {
          return self.validate(item);
        });
        if (self.validateBsUuid || self.validatename) {
          return;
        }
        self.$emit('close', self.createParam());
      }
    }
  }
</script>

<style scoped>
  .create-dropdown {
    width: 100%;
    border: 1px solid #dae0e6;
    display: inline-block;
    height: 40px;
  }
</style>
