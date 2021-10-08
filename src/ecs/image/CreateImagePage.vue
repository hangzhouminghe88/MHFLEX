<template>
  <create-template>
    <div class="create-header" slot="header">
         <span>
          {{$t('common.addImage')}}
        </span>
      <span @click="close()" class="create-back"><i class="el-icon-back"></i>回到镜像列表</span>
    </div>
    <div class="create-body" slot="body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" @blur="validate('name')" @keydown.enter="validate('name')" :class="{'is-error': emptyname}"/>
        <div class="error error-text" v-if="emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.imageType')}}</div>
        <el-radio label="system" v-model="imageType" @change="toggleImageType('system')">{{$t('image.systemImage')}}</el-radio>
        <el-radio lable="volume" v-model="imageType" @change="toggleImageType('volume')">{{$t('image.volumeImage')}}</el-radio>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('image.mediaType')}}</div>
        <el-select v-model="formatText" style="width: 100%;">
          <el-option v-for="(item, index) in formatImage" :key="index" :value="item"></el-option>
        </el-select>
      </div>
      <div class="operation-row" v-if="imageType === 'system'">
        <div class="title required">{{$t('common.platform')}}</div>
        <el-select v-model="platformText" style="width: 100%;">
          <el-option v-for="(item, index) in platform" :key="index" :value="item"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.backupstorage')}}</div>
        <add-or-delete-input @open="openBS()" @remove="removeUuid('backupStorageUuid')"
           :value="dbData.backupstorage[backupStorageUuid] && dbData.backupstorage[backupStorageUuid].name" :class="{'is-error': emptybackupStorageUuid}"/>
        <div class="error error-text" v-if="emptybackupStorageUuid">
          {{$t('error.unselected')+$t('common.backupStorage')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('image.imageUrl')}}</div>
        <el-radio label="url" v-model="imageUrl">URL</el-radio>
        <el-radio label="loaclFile" v-model="imageUrl">{{$t('image.localFile')}}</el-radio>
        <help-trigger  name="url"/>
      </div>
      <div class="operation-row" v-if="imageUrl === 'url'">
        <input type="text" v-model="url" @blur="validate('url')" @keydown.enter="validate('url')" :class="{'is-error': emptyurl || invalidurl}"/>
        <div class="error error-text" v-if="invalidurl && !emptyurl">
          {{$t('error.invalid')+$t('image.imageUrl')}}
        </div>
        <div class="error error-text" v-if="!invalidurl && emptyurl">
          {{$t('error.emptyInput')+$t('image.imageUrl')}}
        </div>
      </div>
      <div class="operation-row"  v-else>
        <div class="drop-file-body" style="height: 100px;" v-permission="'LICENSE_BASIC_PAID'">
          <input type="file" @change="filesChange($event)" />
          <span class="icon" v-if="uploadFileName === '' || invalidfile">
             <i class="el-icon-upload" style="font-size:45px;"></i>
           </span>
          <span class="icon-success" v-if="uploadFileName !== '' && !invalidfile">
             <i class="el-icon-success" style="font-size:45px;"></i>
           </span>
          <span class="text"
                style="overflow: hidden;
                       white-space: nowrap;
                       text-overflow: ellipsis;
                       width: 300px;
                       display: inline-block;">{{ uploadFileName === '' || invalidfile ? $t("about.loadLicense") : uploadFileName }}</span>
        </div>
      </div>
      <div class="operation-row" v-if="imageType === 'system'">
        <div class="title required">{{$t('vm.bootMode')}}</div>
        <el-select v-model="bootModeText" style="width: 100%;">
          <el-option v-for="(item, index) in bootModeList" :value="item" :key="index"></el-option>
        </el-select>
        <div style="color: #EC5960; font-size: 14px; margin-top: 10px" v-if="imageType === 'system'">
          {{$t("vm.bootModeWarning")}}
        </div>
      </div>
      <div class="operation-row" v-if="imageType === 'system'">
        <el-checkbox v-model="Qemu">{{$t("common.installed")}} Qemu guest agent</el-checkbox>
        <help-trigger name="qemu"/>
      </div>
      <backup-storage-single-dlg v-if="showBsSingleDlg" :model="showBsSingleDlg" :message="bsSingleMessage" @close="closeBsSingleDlg"/>
    </div>
    <div class="create-footer" slot="footer">
      <div class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.ok')}}</div>
      <div @click="close()" class="btn-cancel">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import BackupStorageSingleDlg from "../../dialog/BackupStorageSingleListDlg";
  import rpc from 'src/utils/rpc';
  import Validator from 'src/utils/validator';
  import ImageMethods from 'src/ecs/image/Methods';

  export default {
    name: "CreateImagePage",
    components: {BackupStorageSingleDlg, AddOrDeleteInput, CreateTemplate},
    mixins: [WindowBase, ImageMethods],
    props: {
      param: {
        type: Object,
        default: () =>{}
      }
    },
    data() {
      return {
        name: '',
        description: '',
        imageType: 'system',
        formatImage: [
          'qcow2',
          'iso',
          'raw'
        ],
        formatText: 'qcow2',
        platform: [
          'Linux',
          'Windows',
          'WindowsVirtio',
          'Other',
          'Paravirtualization'
        ],
        platformText: 'Linux',
        imageUrl: 'url',
        url: '',
        uploadFileName: '',
        invalidfile: false,
        localFile: null,
        uploadFileSize: '',
        bootModeText: 'Legacy',
        bootModeList: [
          'Legacy',
          'UEFI'
        ],
        Qemu: false,
        showBsSingleDlg: false,
        bsSingleMessage: {},
        backupStorageCondition: ['state=Enabled', 'status=Connected', `zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'type!=VCenter', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup'],
        backupStorageUuid: '',
        emptyname: false,
        emptybackupStorageUuid: false,
        emptyurl: false,
        invalidurl: false,
        canCreate: true
      }
    },
    created(){
      let self = this;
      self.initBackupStorage();
    },
    methods: {
      ...Validator,
      openBS() {
        let self = this;
        self.bsSingleMessage ={
          conditions: self.backupStorageCondition
        }
        self.validate('backupStorageUuid')
        self.showBsSingleDlg = true;
      },
      filesChange ($event) {
        this.localFile = null
        this.uploadFileName = ''
        this.uploadFileSize = -1
        this.localFile = $event.target.files[0]
        this.uploadFileName = this.localFile.name
        this.uploadFileSize = this.localFile.size
        this.validate('file')
        $event.stopPropagation();
      },
      closeBsSingleDlg(param){
        let self = this;
        if(param){
           self.backupStorageUuid = param;
          if (!['ImageStoreBackupStorage', 'Ceph'].some(it => it === this.dbData.backupstorage[param].type)) {
            self.imageUrl = 'url'
            // this.updateWindow({ showUploadImage: false })
          } else if (this.dbData.backupstorage[param].type === 'AliyunEBS') {
            this.format = 'raw';
            // this.updateWindow({ showUploadImage: true })
          }
          if ((['Fusionstor', 'Sftp'].indexOf(this.dbData.backupstorage[param].type) > -1) && this.url && ((this.url.indexOf('ftp') > -1) || (this.url.indexOf('sftp') > -1))) {
            this.url =  ''
          }
        }
        self.validate('backupStorageUuid')
        self.showBsSingleDlg = false;
      },
      removeUuid(uuid){
        let self = this;
        self[uuid] = '';
        self.validate('backupStorageUuid')
        self.localFile = null
        self.uploadFileName = ''
        self.uploadFileSize = -1
        self.imageUrl = 'url'
      },
      initBackupStorage() {
        let backupstorageInventories
        if (this.dialogData && this.dialogData.param.backupStorageUuid) {
          this.backupStorageUuid = this.dialogData.param.backupStorageUuid
          return
        }
        rpc.query('backup-storage', { q: this.backupStorageCondition }).then(resp => {
          backupstorageInventories = resp.inventories
          return this.updateDbTable({
            tableName: 'backupstorage',
            list: resp.inventories
          })
        }).then(() => {
          if (backupstorageInventories.length === 1) {
            this.backupStorageUuid = backupstorageInventories[0].uuid
            this.canAddqcow2Image()
          }
          if(backupstorageInventories.length === 0){
            let resource = {
              name: 'BackupStorage',
              route: '/main/backupstorage',
              path: 'createbackupstorage',
              generate: 'add',
              getCheckContent: () => {
                return this.$t('assistant.disabledBackupStorage')
              },
              getLackContent: () => {
                return this.$t('assistant.lackOfBackupStorage')
              },
              handler: () => {
                this.$router.push({name: resource.path});
              },
              getTitle: () => {
                return this.$t('assistant.imageTitle')
              }
            }
            this.newAssistant(resource, 'create', this)
          }
        })
      },

      newAssistant: function(resource, operation, self) {
        let handler
        if (operation === 'check') {
          handler = () => {
            return self.$router.push(resource.route)
          }
        } else if (_.includes(['add', 'create'], operation)) {
          handler = resource.handler
        }
        let obj = {
          data: {
            name: resource.name,
            id: `assistant-${self.genUniqueId()}`,
            getTitle: resource.getTitle,
            ownerId: self.windowData.id,
            getContent: resource.getCheckContent,
            hideButton: resource.hideButton
          },
          controller: {
            name: operation,
            handler
          }
        }
        self.addAssistantItem(obj)
      },

      //切换镜像类型
      toggleImageType(){
        if (this.dialogData && !this.dialogData.param.backupStorageUuid) {
          this.backupStorageUuid = '';
          this.initBackupStorage();
        }
        this.uploadFileName = ''
        this.localFile = null
        this.uploadFileSize = -1
      },
      //是否可加载qcow2格式的镜像
      canAddqcow2Image() {
        let self = this;
        if (self.dbData.backupstorage[self.backupStorageUuid] && self.dbData.backupstorage[self.backupStorageUuid].type === 'AliyunEBS') {
          if (self.format === 'qcow2') self.format =  'raw';
          return false
        }
        return true
      },
      //是否可以上传文件
      canUpload () {
        if (this.dbData.backupstorage[this.backupStorageUuid] &&
          (this.dbData.backupstorage[this.backupStorageUuid].type === 'ImageStoreBackupStorage' ||
            this.dbData.backupstorage[this.backupStorageUuid].type === 'Ceph')) {
          return true
        }
        return false
      },
      //校验格式
      validate (name) {
        let self = this;
        self[`empty${name}`] = false
        self[`invalid${name}`] = false
        if (name === 'file') {
          if (self.imageUrl === 'url' || _.isNull(this.localFile)) {
            self[`empty${name}`] = true
          } else if (self.imageUrl !== 'url' || !_.isNull(this.localFile)) {
            let list = this.localFile.name.split('.')
            if (['exe', 'jpeg', 'jpg', 'bmp', 'txt', 'cpp'].indexOf(list[list.length - 1].toLowerCase()) > -1) {
              self[`invalid${name}`] = true
            }
          }
          return
        } else {
          let propToBeTrimed = ['name', 'url']
          let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : this[name]
          if (!input) {
            self[`empty${name}`] = true
            return
          }
          self[`invalid${name}`] = false
          if (name === 'url') {
            if (!this.isUrl(input, 'image')) {
              self[`invalid${name}`] = true
              return
            }
            if (self.backupStorageUuid && self.dbData.backupstorage[self.backupStorageUuid] && (self.dbData.backupstorage[self.backupStorageUuid].type === 'Fusionstor' || self.dbData.backupstorage[self.backupStorageUuid].type === 'Sftp')) {
              if ((input.indexOf('ftp') > -1) || (input.indexOf('sftp') > -1)) {
                self[`invalid${name}`] = true
                return
              }
            }
          }
        }
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
      },
      trimProp(name){
        let self = this;
        return String(self[name]).trim() === ''  ?  '' : String(self[name]).trim();
      },
      //创建参数
      createParam () {
        let self = this;
        let obj = {
          name: this.name,
          description: this.description,
          url: self.imageUrl !== 'url'  ? `upload://${this.uploadFileName}` : this.url,
          localFile: self.localFile,
          format: self.formatText,
          backupStorageUuids: [`${this.backupStorageUuid}`],
          Qemu: self.Qemu,
          bootMode: self.bootModeText
        }
        if (self.imageType === 'system') {
          obj.platform = this.platformText
          if (self.formatText === 'iso') {
            obj.mediaType = 'ISO'
          } else {
            obj.mediaType = 'RootVolumeTemplate'
          }
        } else {
          obj.mediaType = 'DataVolumeTemplate'
        }
        return obj
      },
      //整体验证
      validateAll () {
        let obj = {}, self = this;
        obj.invalidInput = false
        let props = self.imageUrl !== 'url' ? ['name', 'file', 'backupStorageUuid'] : ['name', 'url', 'backupStorageUuid']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      confirm(){
        let self = this;
        self.validateAll();
        if(self.windowData.invalidInput) return;
        self.canCreate = false;
        if(self.param) {
          this.param.ok(self.createParam())
            .then(() => {
              self.$emit('close');
            }).catch(() => {
            self.canCreate = true;
          })
        }else {
          this.create(self.createParam())
            .then(() => {
              self.$router.push({name:'image'});
            }).catch(() => {
            self.canCreate = true;
          })
        }
      },
      //跳转到镜像列表页面
      close() {
        let self = this;
        if(self.param) {
          self.$emit('close')
        }else {
          self.$router.push({name: 'image'})
        }
      }
    },

    destroyed(){
      let self = this;
      self.deleteAllAssistant();
    }
  }
</script>

<style scoped lang="less">
  .drop-file-body {
    background: rgb(250, 253, 255);
    height: 100%;
    position: relative;
    text-align: center;
    border: 1px dashed #409EFF;

    .icon {
      margin-top: 15px;
      font-size: 50px;
      display: inline-block;
      width: 100%;
    }

    .icon-success {
      margin-top: 15px;
      font-size: 50px;
      color: #409EFF;
      display: inline-block;
      width: 100%;
    }
  }

  input[type='file'] {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }
</style>
