<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width:303px
  }
  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }
  .delete{
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }
  .rule-body{
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }
  .rule-content{
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }
  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 400px;
  }
  .el-radio-group{line-height: 40px;padding-top: 5px}

.content-size{width:300px;}
.content-size input {
  width: calc(100% - 70px);
  position: relative;
}
.content-size .text {
    display: inline-block;
    left: 18px;
    line-height: 40px;
    position: relative;
  }
.content-size .arrow {
    top: 3px;
    position: relative;
    left: 12px;
  }
.content-size .size {
    float: right;
    height: 40px;
    width: 60px;
    position: relative;
    border: 1px solid #adb0b8;
    border-radius: 0 2px 2px 0;
    box-sizing: border-box;
  }
  .content-size .drop-size {
    position: relative;
    font-size: 0;
    top: -41px;
    right: 1px;
    width: 60px;
    z-index: 3000;
    background: #fff;
    border-radius: 0 2px 2px 2px;
    border: 1px solid #adb0b8;
    padding: 9px 0;
  }
  .content-size .drop-size a {
    padding: 5px 20px;
    text-decoration: none;
    display: block;
    font-size: 14px;
    color: #1a2736;
    letter-spacing: 0;
    line-height: 20px;
    text-align: center;
  }
  .drop-file-body{
    width: 300px;
    height: 80px;
    background: #fafdff;
    border: 1px dashed #adb0b8;
    border-radius: 2px;
    position: relative;
    text-align: center;
  }
  .drop-file-body input{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }
  .drop-file-body img{
    width: 28px;
    height: 28px;
    margin: 14px 0 6px;
  }
  .drop-file-body .text{
    display: block;
    color: #97a4b6;
    font-size: 12px;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("virtualRouterImage.add")}}
        </span>
      <span class="create-back" @click="close()"><i class="el-icon-back"></i>回到云路由镜像列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{ $t("common.name") }}
        </div>
        <help-trigger name="virtualRouterImage" />
        <input v-model="windowData.name" @blur="validate('name')" :class="{'is-error': windowData.emptyname}" @keydown.enter="validate('name')" @input="(e) => { updateWindow({ 'name': e.target.value }) }" />
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>

      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description" @input="(e) => { updateWindow({ 'description': e.target.value }) }" />
      </div>

      <div id="common-backupStorage" class="operation-row">
        <div class="title required">
          {{$t("common.backupStorage")}}
        </div>
        <div v-if="windowData.backupStorageUuid.length > 0">
          <add-or-delete-input :value="dbData.backupstorage[windowData.backupStorageUuid] && dbData.backupstorage[windowData.backupStorageUuid].name" @remove="removeBackupStorage()"></add-or-delete-input>
        </div>
        <div class="content" @click="openBackupStorageSingleSelectDlg();" v-if="windowData.backupStorageUuid.length===0">
          <div class="add" ></div>
        </div>
        <div class="error error-text" v-if="windowData.emptybackupStorageUuid">
          {{$t('error.unselected')+$t('common.backupStorage')}}
        </div>
      </div>

      <div id="image-imageUrl" class="operation-row">
        <div class="title required">
          {{ $t("image.imageUrl") }}
          <help-trigger name="url" />
        </div>
        <el-radio-group v-model="uploadImageType">
          <el-radio :label="false">URL</el-radio>
          <el-radio :label="true">{{ $t("image.localFile") }}</el-radio>
        </el-radio-group>
      </div>

      <div>
        <div id="image-imageUrl" class="operation-row" v-if="!uploadImageType">
          <div class="title"></div>
          <input :value="windowData.url" :class="{'is-error': windowData.emptyurl || windowData.invalidurl}" @input="(e) => { updateWindow({ 'url': e.target.value }) }" @blur="validate('url')" @keydown.enter="validate('url')" />
          <div class="error error-text" v-if="!uploadImageType && windowData.emptyurl">
            {{$t('error.emptyInput')+$t('image.imageUrl')}}
          </div>
          <div class="error error-text" v-if="!uploadImageType && !windowData.emptyurl && windowData.invalidurl">
            {{$t('error.invalid')+$t('image.imageUrl')}}
          </div>
        </div>
        <div id="error-emptyDropFile" class="operation-row" v-else>
          <div v-permission="'LICENSE_BASIC_PAID'" class="drop-file-body" :class="{'drop-zone-error': windowData.emptyfile}">
            <input type="file" @change="filesChange($event)" />
            <img v-if="uploadFileName === ''" src="~assets/reload_license.svg" />
            <img v-if="uploadFileName !== ''" src="~assets/complete_reload_license.svg" />
            <span id="about-loadLicense" class="text">{{ uploadFileName === '' ? $t("about.loadLicense") : uploadFileName }}</span>
          </div>
          <div class="error error-text" v-if="uploadImageType && windowData.emptyfile">
            {{$t('error.emptyDropFile')}}
          </div>
        </div>
      </div>


    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled':!canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateVirtualRouterImagePage",
    mixins: [WindowBase, Root,Methods],
    props: {
      param: {
        type: Object,
        default: () => {}
      }
    },
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        uploadImageType: false,
        localFile: null,
        uploadFileName: '',
        uploadFileSize: -1,
        canCreate: true
      }
    },
    computed: {

    },
    created(){
      this.updateWindow({
        name: '',
        description: '',
        url: '',
        system: true,
        datacenterName: '',
        platform: 'Linux',
        format: 'qcow2',
        imageUuid:'',
        mediaType: 'RootVolumeTemplate',
        backupStorageUuid: ''
      })
      //this.queryForAssistant()
      this.initBackupStorage()
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      removeBackupStorage(){
        this.updateWindow({
          backupStorageUuid: ''
        })
      },
      canUpload: function () {
        if (this.dbData.backupstorage[this.windowData.backupStorageUuid] &&
          (this.dbData.backupstorage[this.windowData.backupStorageUuid].type === 'ImageStoreBackupStorage' ||
            this.dbData.backupstorage[this.windowData.backupStorageUuid].type === 'Ceph')) {
          return true
        }
        return false
      },
      filesChange: function ($event) {
        this.uploadFileName = $event.target.files[0].name
        this.uploadFileSize = $event.target.files[0].size
        this.localFile = $event.target.files[0]
        this.validate('file')
      },
      clearBackupStorageHandler ($event) {
        $event.stopPropagation()
        this.clearRow('backupStorageUuid')
        this.validate('backupStorageUuid')
        this.localFile = null
        this.uploadFileName = ''
        this.uploadFileSize = -1
        this.uploadImageType = false
      },
      openBackupStorageSingleSelectDlg: function () {
        const self = this

        self.openDialog('BackupStorageSingleSelectListDlg', {
          conditions: ['state=Enabled', 'status=Connected', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup'],
          select: (uuid) => self.selectBackupStorage(uuid)
        })
      },
      validate (name) {
        let obj = {}
        obj[`empty${name}`] = false
        if (name === 'file') {
          if (!this.uploadImageType || _.isNull(this.localFile)) {
            obj[`empty${name}`] = true
          }
          obj[`empty${name}`]
          this.updateWindow(obj)
          return
        } else {
          let propToBeTrimed = ['name', 'url']
          let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : this.windowData[name]
          if (!input) {
            obj[`empty${name}`] = true
            this.updateWindow(obj)
            return
          }
          obj[`invalid${name}`] = false
          if (name === 'url') {
            if (!this.isUrl(input, 'image')) {
              obj[`invalid${name}`] = true
            }
            if (this.windowData.backupStorageUuid && this.dbData.backupstorage[this.windowData.backupStorageUuid] && (this.dbData.backupstorage[this.windowData.backupStorageUuid].type === 'Fusionstor' || this.dbData.backupstorage[this.windowData.backupStorageUuid].type === 'Sftp')) {
              if ((input.indexOf('ftp') > -1) || (input.indexOf('sftp') > -1)) {
                obj[`invalid${name}`] = true
                this.updateWindow(obj)
                return
              }
            }
          }
          this.updateWindow(obj)
        }
      },
      validateAll () {
        let obj = {}
        obj.invalidInput = false
        let props = this.uploadImageType ? ['name', 'file', 'backupStorageUuid'] : ['name', 'url', 'backupStorageUuid']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] === true)
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      ok: function () {
        this.validateAll()
        this.canCreate = false;
        if (this.windowData.invalidInput) return
        if(this.param) {
          this.param.ok(this.createParam())
            .then(() => {
              this.$emit('close')
            }).catch(() => {
            this.canCreate = true;
          })
        }else {
          this.create(this.createParam())
            .then(() => {
              this.$router.push({name:'virtualrouterimage'})
            }).catch(() => {
              this.canCreate = true;
          })
        }
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          url: this.uploadImageType ? `upload://${this.uploadFileName}` : this.windowData.url,
          localFile: this.localFile,
          system: true,
          platform: 'Linux',
          mediaType: 'RootVolumeTemplate',
          format: 'qcow2',
          backupStorageUuids: [`${this.windowData.backupStorageUuid}`],
          systemTags: ''
        }
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdownPlatform) this.updateWindow({ showMoreDropdownPlatform: false })
        if (this.windowData.showMoreDropdownGuestOsType) this.updateWindow({ showMoreDropdownGuestOsType: false })
        if (this.windowData.showMoreDropdownMediaType) this.updateWindow({ showMoreDropdownMediaType: false })
        if (this.windowData.showMoreDropdownDataCenter) this.updateWindow({ showMoreDropdownDataCenter: false })
      },
      initBackupStorage: function () {
        let zoneUuid = localStorage.getItem('currZoneUuid')
        rpc.query('backup-storage', {
          q: [`zone.uuid=${zoneUuid}`, 'state=Enabled', 'status=Connected', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup']
        })
          .then(resp => {
            if (resp.inventories.length === 1) {
              this.updateDbTable({
                tableName: 'backupstorage',
                list: resp.inventories
              })
              this.updateWindow({ backupStorageUuid: resp.inventories[0].uuid }).then(() => {
                this.initDataVcenter()
              })
            }
          })
      },
      selectBackupStorage: function (uuid) {
        this.updateWindow({ backupStorageUuid: uuid }).then(() => {
          this.validate('backupStorageUuid')
          if (!['ImageStoreBackupStorage', 'Ceph'].some(it => it === this.dbData.backupstorage[uuid].type)) {
            this.uploadImageType = false
            // this.updateWindow({ showUploadImage: false })
          } else {
            // this.updateWindow({ showUploadImage: true })
          }
          if ((['Fusionstor', 'Sftp'].indexOf(this.dbData.backupstorage[uuid].type) > -1) && this.windowData.url && ((this.windowData.url.indexOf('ftp') > -1) || (this.windowData.url.indexOf('sftp') > -1))) {
            this.updateWindow({ url: '' })
          }
          this.initDataVcenter()
        })
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      openBackupStorageListSingleSelectListDlg: function () {
        this.openSideWindowForCreate('BackupStorageListSingleSelectList', {
          conditions: ['state=Enabled', 'status=Connected', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup'],
          select: (uuid) => this.selectBackupStorage(uuid)
        })
      },
      initDataVcenter: function () {
        let self = this
        if (!self.windowData.backupStorageUuid) return
        let vCenterUuid = self.dbData.backupstorage[self.windowData.backupStorageUuid].vCenterUuid
        rpc.query('vcenters/datacenters', {
          q: `vCenterUuid=${vCenterUuid}`
        })
          .then((resp) => {
            let nameList = resp.inventories.map((item) => item.name)
            self.updateWindow({ DataVcenterList: nameList })
            self.updateWindow({ datacenterName: nameList[0] })
          })
      },
      clickCheckbox: function (item, $event) {
        let obj = {}
        obj[item] = !this.windowData[item]
        this.updateWindow(obj)
        $event.stopPropagation()
      },

      close() {
        if(this.param)
        this.$emit('close')
        else this.$router.push({name:'virtualrouterimage'})
      }

    }
  }
</script>
