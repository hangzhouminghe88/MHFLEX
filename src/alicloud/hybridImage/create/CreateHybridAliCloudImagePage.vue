<template>
  <div style="background: #fff;width: 100%; height: 100%;">
    <create-template>
      <div slot="header" class="create-header">
        <span>{{$t('hybridimage.create')}}</span>
        <span class="create-back el-icon-back" @click="cancel()">
        <span class="text" style="font-size: 12px;">回到阿里云镜像列表</span>
      </span>
      </div>

      <div slot="body" class="create-body">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <help-trigger name="uploadImage" />
          <input type="text" v-model="name" :class="{'is-error': emptyname || invalidname}"
                 @blur="validate('name')"
                 maxlength="255"/>
          <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput')+$t('common.name')}}</div>
          <div class="error error-text" v-if="!emptyname && invalidname">{{$t('error.invalid') + $t('common.name')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea v-model="description" rows="3" maxlength="255"/>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.operatingSystem')}}</div>
          <el-select v-model="platform" style="width: 100%;">
            <el-option v-for="(item, index) in platformList"
                       :value="item" :key="index"
                       :label="item"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.guestOsType')}}</div>
          <el-select v-model="osType" style="width: 100%;">
            <el-option v-for="(item, index) in osTypeList"
                       :key="index"
                       :value="item"
                       :label="item"></el-option>
          </el-select>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.image')}}</div>
          <add-or-delete-input :value="dbData.image[imageUuid] && dbData.image[imageUuid].name"
                               @open="openImageSelect" @remove="removeUuid('imageUuid')"
                               :class="{'is-error': emptyimageUuid}"/>
          <div class="error error-text" v-if="emptyimageUuid">{{$t('error.unselected') + $t('common.image')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t("hybriddatacenter.region")}}</div>
          <add-or-delete-input :value="dbData.hybridDataCenter[dataCenterUuid] && dbData.hybridDataCenter[dataCenterUuid].regionName"
                               @open="openHybridDataCenterSelect" @remove="removeUuid('dataCenterUuid')"
                               :class="{'is-error': emptydataCenterUuid}"/>
          <div class="error error-text" v-if="emptydataCenterUuid">{{$t('error.unselected') + $t("hybriddatacenter.region")}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">
            {{ $t("common.hybridBucket") }}
          </div>
          <input disabled class="disable-input" :value="$data.bucketName" />
        </div>
      </div>

      <div slot="footer" class="create-footer">
        <div class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</div>
        <div class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</div>
      </div>
    </create-template>
    <create-hybrid-ali-cloud-bucket
      v-if="showAliCloudBucket"
      :param="aliCloudBucketParam" @close="showAliCloudBucket = false;"></create-hybrid-ali-cloud-bucket>
  </div>
</template>

<script>
  import CreateHybridAliCloudBucket from "src/alicloud/hybridImage/component/CreateHybridAliCloudBucket";
  import CreateHybridBucket from 'src/alicloud/hybridBucket/Methods';
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import { genUniqueId } from 'src/utils/utils';
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "CreateHybridAliCloudImagePage",

    mixins: [WindowBase, Methods],

    components: {CreateHybridAliCloudBucket, AddOrDeleteInput, CreateTemplate},

    data() {
      return {
        platformList: ['Linux', 'Windows'],
        platform: 'Linux',
        osType: 'CentOS',
        name: '',
        emptyname: false,
        invalidname: false,
        description: '',
        imageUuid: '',
        emptyimageUuid: false,
        imageConditions: ['type=zstack', 'state=Enabled', 'system=false'],
        bucketName: '',
        dataCenterUuid: '',
        emptydataCenterUuid: false,
        showAliCloudBucket: false,
        aliCloudBucketParam: {}
      }
    },

    computed: {
      osTypeList() {
        let self = this, osTypeGroup = [];
        self.osType = '';
        switch (self.platform) {
          case 'Linux':
            osTypeGroup =  [
              'CentOS',
              'Ubuntu',
              'SUSE',
              'OpenSUSE',
              'RedHat',
              'Debian',
              'CoreOS',
              'Aliyun Linux',
              'Other Linux',
              'Customized Linux'
            ];
            self.osType = 'CentOS';
             break;
          case 'Windows':
            osTypeGroup = [
              'Windows Server 2003',
              'Windows Server 2008',
              'Windows Server 2012',
              'Windows 7'
            ];
            self.osType = 'Windows Server 2003';
            break;
          default:
            self.osType = 'CentOS';
            osTypeGroup =  [
              'CentOS',
              'Ubuntu',
              'SUSE',
              'OpenSUSE',
              'RedHat',
              'Debian',
              'CoreOS',
              'Aliyun Linux',
              'Other Linux',
              'Customized Linux'
            ];
            break;
        }
        return osTypeGroup;
      }
    },

    created() {
      let self = this;
      self.initImageUuidList();
    },

    methods: {
      ...Validator,
      ...{
        create: Methods.methods.create,
        createHybridBucket: CreateHybridBucket.methods.dataCenterAddBucket,
      },
      //取消返回列表
      cancel() {
        let self = this;
        self.$router.push({name: 'hybridalicloudimage'})
      },

      //确定创建镜像
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.create(self.createParam());
        self.cancel();
      },
      //选择镜像
      openImageSelect() {
        let self = this;
        let windowsList = ['Windows', 'WindowsVirtio']
        let conditions = self.$data.imageConditions
        if (self.platform === 'Linux') conditions.push('platform=Linux')
        if (self.platform === 'Windows') conditions.push(`platform?=${windowsList}`)
        self.openDialog('ImageSingleSelectListDlg', {
          conditions,
          select: (uuid) => self.selectImage(uuid)
        })
      },
      //选择镜像
      selectImage(uuid) {
        let self = this;
        self.imageUuid = uuid;
        self.validate('imageUuid');
      },
      //制空uuid
      removeUuid(uuid){
        let self = this;
        self[uuid] = '';
        if(uuid === 'dataCenterUuid') {
          self.$data.bucketName = '';
        }
        self.validate(uuid);
      },
      //单行校验
      validate(name) {
        let self = this, input = '';
        input = name === 'name' ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        if(/^\s*$/.test(input)){
          self[`empty${name}`] = true;
          return;
        }
        self[`invalid${name}`] = false;
        if (name === 'name' && self.isNumber(input)) {
          self[`invalid${name}`] = true
          return;
        }
      },
      //打开地域选择弹框
      openHybridDataCenterSelect() {
        let self = this;
        self.openDialog('HybridAliCloudDataCenterSingleSelect', {
          conditions: [],
          select: (uuid) => {
            self.selectHybridDataCenter(uuid)
          }
        })
      },
      //选择地域
      selectHybridDataCenter(uuid) {
        let self = this;
        self.dataCenterUuid = uuid;
        self.validate('dataCenterUuid');
        self.initBucket()
        self.deleteCurrAssistant(self.windowData.id)
        self.queryForAssistant()
      },
      //整体校验
      validateAll() {
        let self = this, props = ['name', 'imageUuid', 'dataCenterUuid', 'bucketName'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },
      //初始化镜像列表
      initImageUuidList () {
        let imageConditions = this.$data.imageConditions
        return rpc.query('images', {q: imageConditions}).then(imageResp => {
          let imageUuids = imageResp.inventories.map(image => image.uuid)
          let tasks = []
          let p
          imageResp.inventories.forEach(image => {
            p = rpc.query(`backup-storage`, {q: [`uuid=${image.backupStorageRefs[0] && image.backupStorageRefs[0].backupStorageUuid}`, 'type=ImageStoreBackupStorage'], count: true}).then(bsResp => {
              if (bsResp.total !== 1) {
                imageUuids.splice(imageUuids.indexOf(image.uuid), 1)
              }
            })
            tasks.push(p)
          })
          return Promise.all(tasks).then(() => {
            imageConditions.push(`uuid?=${imageUuids}`)
            this.$data.imageConditions = imageConditions
          })
        })
      },
      //初始化桶
      initBucket () {
        let dataCenterUuid = this.dataCenterUuid
        return rpc.query('hybrid/aliyun/oss-bucket', {
          q: [`dataCenterUuid=${dataCenterUuid}`, 'current=true']
        }).then(resp => {
          if (resp.inventories.length !== 0) {
            this.$data.bucketName = resp.inventories[0].bucketName
          } else {
            this.$data.bucketName = ''
          }
        })
      },
      //帮助操作
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content, handler
          handler = () => {
            if(resourceName === 'HybridBucket'){
              self.aliCloudBucketParam = {
                ok: (param) => {
                  self[`create${resourceName}`](param).then(() => {
                    if (resourceName === 'HybridBucket') {
                      this.$data.bucketName = param.bucketName
                    }
                    self.queryForAssistant()
                  }, () => {
                    self.queryForAssistant()
                  })
                },
                cancel: () => {
                  self.queryForAssistant()
                }
              }
              self.showAliCloudBucket = true;
            }else {
              self.$router.push({name: 'createHybridAliCloudDataCenter'})
            }
          }
          if (operation === 'check') {
            handler = () => {
              this.$router.push({name:'hybriddatacenter'})
            }
          }
          content = `lackOf${resourceName}`
          self.createAssistant({
            id,
            hide: false,
            title: 'hybridImageTitle',
            ownerId: self.windowData.id,
            content,
            operation,
            handler
          })
        }
        rpc.query(`hybrid/data-center`, {count: true}).then(dataCenterResp => {
          if (dataCenterResp.total === 0) {
            newAssistant('HybridDataCenter', 'add')
            return
          }
          let dataCenterUuid = this.dataCenterUuid
          if (!dataCenterUuid) return
          rpc.query('hybrid/aliyun/oss-bucket', {
            q: [`dataCenterUuid=${dataCenterUuid}`],
            replyWithCount: true
          }).then(resp => {
            if (resp.total === 0) {
              newAssistant('HybridBucket', 'add')
              return
            }
            let count = 0
            for (let i = resp.inventories.length - 1; i >= 0; i--) {
              if (resp.inventories[i].current === 'false') {
                count++
              }
            }
            if (count === resp.inventories.length) {
              newAssistant('DefaultHybridBucket', 'check')
            }
          })
        })
      },
      //创建参数
      createParam: function () {
        let self = this;
        return {
          name: self.name,
          imageUuid: self.imageUuid,
          dataCenterUuid: self.dataCenterUuid,
          description: (self.description === '' || self.description === undefined) ? undefined : self.description,
          guestOsType: self.osType
        }
      },
    },

    destroyed() {
      let self = this;
      self.deleteAllAssistant();
    }
  }
</script>

<style scoped>
.disable-input{
  background: #eef3f7;
}
</style>
