<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('volume.createImage')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">返回</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row" v-if="param.volumeType === 'Root'">
        <div class="title required">
          {{ $t("image.imageType") }}
        </div>
        <el-radio v-model="isSystem" label="system">{{$t("image.systemImage")}}</el-radio>
        <el-radio v-model="isSystem" label="volume">{{$t("image.volumeImage")}}</el-radio>
      </div>
      <div class="operation-row" v-if="param.volumeType === 'Root' && isSystem === 'system'">
        <div class="title required">{{$t('common.platform')}}</div>
        <drop-down :param="{
          getIndex() {
            return platformList.findIndex((item) => {
              return platform === item.value;
            })
          },
          setIndex(index){
            platform = platformList[index].value;
          },
          getOptionList: () => {
            return platformList;
          }
        }"></drop-down>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.backupStorage')}}</div>
        <add-or-delete-input @open="openBs()" :value="dbData.backupstorage[backupStorageUuid] && dbData.backupstorage[backupStorageUuid].name" @remove="removeUuid('backupStorageUuid')"
         :class="{'is-error': emptybackupStorageUuid}"/>
        <div class="error error-text" v-if="emptybackupStorageUuid">{{$t('error.emptyInput') + $t('common.backupStorage')}}</div>
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
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreateVolumeImage",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    components: {AddOrDeleteInput, CreateTemplateNoRoute, 'drop-down': DropDown},
    data(){
      return {
        name: '',
        description: '',
        url: '',
        platform: 'Linux',
        mediaType: '',
        backupStorageUuid: '',
        backupStorageCondition: ['state=Enabled', 'status=Connected', `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`],
        emptyname: false,
        emptybackupStorageUuid: false,
        isSystem: 'system',
        platformList: [
         {name: 'Linux', value: 'Linux'},
         {name: 'Windows', value: 'Windows'},
         {name: 'WindowsVirtio', value: 'WindowsVirtio'},
         {name: 'Other', value: 'Other'},
         {name: 'Paravirtualization', value: 'Paravirtualization'}
       ]
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        primaryStorageType: self.param.primaryStorageType,
        volumeUuid: self.param.volumeUuid,
      }).then(() => {
        self.initBackupStorageCondition()
        self.queryForAssistant()
        self.initBackupStorage()
      })
    },
    methods: {
      openBs(){
        let self = this;
        self.openDialog('BackupStorageSingleSelectListDlg', {
          conditions: self.backupStorageCondition,
          volumeUuid: self.param.volumeUuid,
          select(uuid){
            self.backupStorageUuid = uuid;
            self.validate('backupStorageUuid')
          },
        })
      },
      //初始化镜像查询条件
      initBackupStorageCondition () {
        let conditions = this.backupStorageCondition
        let bsTypeIndex = -1
        for (var i = 0; i < conditions.length; i++) {
          if (conditions[i].indexOf('type') > -1) {
            bsTypeIndex = i
            break
          }
        }
        if (bsTypeIndex !== -1) {
          conditions.splice(bsTypeIndex, 1)
        }
        let psType = this.windowData.primaryStorageType
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
      //帮助提示
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${self.genUniqueId()}`
          let content, hide
          let handler = () => {
            self.$router.push({name: 'createbackupstorage'})
          }
          if (!self.dbData.common.isAdmin) {
            content = 'lackOfHardWare'
            if (operation === 'check') {
              content = 'disabledHardWare'
            }
            hide = true
          } else {
            content = `lackOf${resourceName}`
            hide = false
            if (operation === 'check') {
              content = `disabled${resourceName}`
              handler = () => {
                self.$router.push({name:'backupstorage'})
              }
            }
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'imageTitle',
            ownerId: self.windowData.id,
            content,
            handler
          })
        }
        rpc.query('backup-storage', {count: true, q: `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`}).then(resp => {
          if (resp.total === 0) {
            newAssistant('BackupStorage', 'add')
            return
          }
          rpc.query('backup-storage', {count: true, q: self.backupStorageCondition}).then(resp => {
            if (resp.total === 0) newAssistant('BackupStorage', 'check')
          })
        })
      },
      //初始化镜像服务器
      initBackupStorage () {
        let backupstorageInventories, self = this;
        rpc.query('backup-storage', { q: self.backupStorageCondition }).then(resp => {
          backupstorageInventories = resp.inventories
          return this.updateDbTable({
            tableName: 'backupstorage',
            list: resp.inventories
          })
        }).then(() => {
          if (backupstorageInventories.length === 1)  self.backupStorageUuid = backupstorageInventories[0].uuid
        })
      },
      //校验数据
      validate(name){
        let self = this;
        self[`empty${name}`] = false;
        let input = name === 'name' ? String(self[name]).trim() : self[name];
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },
      //清除backupStroageUuid
      removeUuid(uuid){
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      },
      //创建参数
      createParam(){
        let self = this;
        let obj = {
          name: self.name,
          description: self.description,
          volumeUuid: self.param.volumeUuid,
          volumeType: self.param.volumeType
        }
        if (this.backupStorageUuid !== '') obj.backupStorageUuids = [this.backupStorageUuid]
        if (this.param.volumeType === 'Root') {
          obj.isSystem = this.isSystem === 'system'
          obj.platform = this.platform
        }
        return obj
      },
      validateAll(){
        let props = ['name', 'backupStorageUuid'], self = this, invalid;
        props.forEach((name) => {
          self.validate(name)
        });
        invalid =  props.some((name)=> {
          return self[`empty${name}`] === true
        });
        return invalid;
      },
      //确定添加
      confirm(){
        let self = this, invalid = false;
        invalid = self.validateAll();
        if(invalid) return;
        self.$emit('close',self.createParam());
      }
    }
  }
</script>

<style scoped>

</style>
