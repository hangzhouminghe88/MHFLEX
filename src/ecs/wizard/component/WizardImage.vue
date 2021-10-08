<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <input type="text" v-model="name" @blur="validate('name')" @keydown.enter="validate('name')"
             :class="{'is-error': emptyname}"/>
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
      <el-radio label="system" v-model="imageType" @change="toggleImageType('system')">{{$t('image.systemImage')}}
      </el-radio>
      <el-radio lable="volume" v-model="imageType" @change="toggleImageType('volume')">{{$t('image.volumeImage')}}
      </el-radio>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('image.mediaType')}}</div>
      <drop-down class="dropdown create-dropdown">
           <span slot="title">
             <span class="text">{{formatText}}</span>
           </span>
        <span slot="content">
             <div class="dropdown-content" style="padding: 4px 20px;">
                <a :key="index" @click="(e) => {formatText = e.target.text}" v-for="(item, index) in formatImage">{{item}}</a>
             </div>
           </span>
      </drop-down>
    </div>
    <div class="operation-row" v-if="imageType === 'system'">
      <div class="title required">{{$t('common.platform')}}</div>
      <drop-down class="dropdown create-dropdown">
           <span slot="title">
             <span class="text">{{platformText}}</span>
           </span>
        <span slot="content">
             <div class="dropdown-content" style="padding: 4px 20px;">
                <a :key="index" @click="(e) => {platformText = e.target.text}" v-for="(item, index) in platform">{{item}}</a>
             </div>
           </span>
      </drop-down>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.backupstorage')}}{{$t('common.colon')}}{{dbData.backupstorage[backupStorageUuid] && dbData.backupstorage[backupStorageUuid].name}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('image.imageUrl')}}</div>
      <el-radio label="url" v-model="imageUrl">URL</el-radio>
      <el-radio label="loaclFile" v-model="imageUrl">{{$t('image.localFile')}}</el-radio>
    </div>
    <div class="operation-row" v-if="imageUrl === 'url'">
      <input type="text" v-model="url" @blur="validate('url')" @keydown.enter="validate('url')"
             :class="{'is-error': emptyurl || invalidurl}"/>
      <div class="error error-text" v-if="invalidurl && !emptyurl">
        {{$t('error.invalid')+$t('image.imageUrl')}}
      </div>
      <div class="error error-text" v-if="!invalidurl && emptyurl">
        {{$t('error.emptyInput')+$t('image.imageUrl')}}
      </div>
    </div>
    <div class="operation-row" v-else>
      <div class="drop-file-body" style="height: 100px;" v-permission="'LICENSE_BASIC_PAID'">
        <input type="file" @change="canUpload() && filesChange($event)"/>
        <span class="icon" v-if="uploadFileName === '' || invalidfile">
             <i class="el-icon-upload" style="font-size:45px;"></i>
           </span>
        <span class="icon-success" v-if="uploadFileName !== '' && !invalidfile">
             <i class="el-icon-success" style="font-size:45px;"></i>
           </span>
        <span class="text">{{ uploadFileName === '' || invalidfile ? $t("about.loadLicense") : uploadFileName }}</span>
      </div>
    </div>
    <div class="operation-row" v-if="imageType === 'system'">
      <div class="title required">{{$t('vm.bootMode')}}</div>
      <drop-down class="dropdown create-dropdown">
           <span slot="title">
             <span class="text">{{bootModeText}}</span>
           </span>
        <span slot="content">
             <div class="dropdown-content" style="padding: 4px 20px;">
                <a :key="index" @click="(e) => {bootModeText = e.target.text}" v-for="(item, index) in bootModeList">{{item}}</a>
             </div>
           </span>
      </drop-down>
      <div style="color: #EC5960; font-size: 14px; margin-top: 10px" v-if="imageType === 'system'">
        {{$t("vm.bootModeWarning")}}
      </div>
    </div>
    <div class="operation-row" v-if="imageType === 'system'">
      <el-checkbox v-model="Qemu">{{$t("common.installed")}} Qemu guest agent</el-checkbox>
      <help-trigger name="qemu"/>
    </div>
  </div>
</template>

<script>
  //添加镜像导航
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "WizardImage",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        },
      },
      'parentWindowUuid': {
        type: String,
        default: ''
      }
    },
    data() {
      return {
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
        backupStorageUuid: '',
        emptyname: false,
        emptybackupStorageUuid: false,
        emptyurl: false,
        invalidurl: false,
        name: 'Image-1',
        description: '',
        url: 'file:///opt/zstack-dvd/zstack-image-1.4.qcow2',
        format: 'qcow2',
        wizard: {},
      }
    },
    created(){
      let self = this, wizard = {}
      wizard =  _.cloneDeep(this.$store.state.windowManager.windows[this.parentWindowUuid].wizard);
      self.wizard = wizard;
      self.backupStorageUuid = wizard.backupstorage.uuid;
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
    },
    methods: {
      ...Validator,
      //是否可以上传
      canUpload: function () {
        if (this.dbData.backupstorage[this.windowData.backupStorageUuid] &&
          (this.dbData.backupstorage[this.windowData.backupStorageUuid].type === 'ImageStoreBackupStorage' ||
            this.dbData.backupstorage[this.windowData.backupStorageUuid].type === 'Ceph')) {
          return true
        }
        return false
      },
      //改变文件
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
      //取消数据的左右空格
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
          localFile: this.localFile,
          format: this.formatText,
          backupStorageUuids: [`${this.backupStorageUuid}`],
          Qemu: this.Qemu,
          bootMode: this.bootMode
        }
        if (self.imageUrl === 'url') {
          obj.platform = this.platformText
          if (this.format === 'iso') {
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
      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        self.validateAll();
        if(self.windowData.invalidInput) return;
        self.param.update(self.createParam());
      }
    },
    destroyed(){
      let self = this;
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true);
    },
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
