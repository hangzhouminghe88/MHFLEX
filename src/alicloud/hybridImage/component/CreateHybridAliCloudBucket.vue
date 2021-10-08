<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('hybridEcsWizard.addHybridBucket')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        返回
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title"></div>
        <el-radio-group v-model="createType">
          <el-radio label="UseAlreadyAvailable">{{$t('hybridbucket.UseAlreadyAvailable')}}</el-radio>
          <el-radio label="createBucket">{{$t('hybridbucket.CreateBucket')}}</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.hybriddatacenter')}}</div>
        <add-or-delete-input :value="dbData.hybridDataCenter[dataCenterUuid] && dbData.hybridDataCenter[dataCenterUuid].regionName"
                             @open="openHybridDataCenterSelect" @remove="removeUuid('dataCenterUuid')"
                             :class="{'is-error': emptydataCenterUuid}"/>
        <div class="error error-text" v-if="emptydataCenterUuid">{{$t('error.unselected') + $t("hybriddatacenter.region")}}</div>
      </div>
      <div class="operation-row" v-show="createType === 'UseAlreadyAvailable'">
        <div class="title required">{{$t('hybridbucket.bucketName')}}</div>
        <help-trigger name="bucketName"/>
        <el-select style="width: 100%;" v-model="bucketName" :class="{'is-error': emptybucketName}">
          <el-option v-for="(item, index) in bucketNameList"
                     :value="item.bucketName"
                     :key="index">{{item.bucketName}}</el-option>
        </el-select>
        <div class="error error-text" v-if="emptybucketName">
          {{$t('error.unselected') + $t('hybridbucket.bucketName')}}
        </div>
      </div>
      <div class="operation-row" v-show="createType === 'createBucket'">
        <div class="title required">{{$t('hybridbucket.bucketName')}}</div>
        <help-trigger name="bucketName"/>
        <input type="text" v-model="inputBucketName"
               :class="{'is-error': emptyinputBucketName || invalidinputBucketName}"
               @blur="validate('inputBucketName')"
               placeholder="请输入以小写字母或数字开头内含小写字母数字中划线以小写字母或数字结尾的字符"/>
        <div class="error error-text" v-show="emptyinputBucketName">
          {{$t('error.emptyInput') + $t('hybridbucket.bucketName')}}
        </div>
        <div class="error error-text" v-show="!emptyinputBucketName && invalidinputBucketName">
          {{$t('error.invalid') + $t('hybridbucket.bucketName')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title"></div>
        <el-checkbox v-model="isDefault">{{$t('common.setDefault')}}</el-checkbox>
        <help-trigger name="setDefaultBucket"/>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <div class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</div>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreateHybridAliCloudBucket",

    components: {AddOrDeleteInput, CreateTemplateNoRoute},

    mixins: [WindowBase],

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
        createType: 'UseAlreadyAvailable',
        isDefault: true,
        dataCenterUuid: 'fdasfas',
        emptydataCenterUuid: false,
        emptybucketName: false,
        bucketNameList: [],
        bucketName: '',
        inputBucketName: '',
        emptyinputBucketName: false,
        invalidinputBucketName: false,
        description: ''
      }
    },

    created() {
      //初始化地域
      let self = this;
      self.dataCenterUuid = self.param.dataCenterUuid ? self.param.dataCenterUuid : '';
      if(self.dataCenterUuid) self.getOssBucketNameFromRemote(self.dataCenterUuid);
    },

    methods: {
      //打开地域选择弹框
      openHybridDataCenterSelect() {
        let self = this;
        self.validate('dataCenterUuid');
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
        self.getOssBucketNameFromRemote(uuid);
        self.isFirstBucket(uuid)
        self.validate('dataCenterUuid');
      },
      //单个校验
      validate(name) {
       let self = this, input = '';
       input = ['inputBucketName', 'bucketName'].includes(name) ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
       if(/^\s*$/.test(input)){
         self[`empty${name}`] = true;
         return;
       }
        self[`invalid${name}`] = false;
       if(self.createType === 'createBucket') {
         if(!(/^[a-z\d][a-z\d\-]*[a-z\d]$/.test(self.inputBucketName))
         || (self.inputBucketName.length <=3 || self.inputBucketName.length >= 63)) {
           self[`invalidinputBucketName`] = true;
           return;
         }
       }
      },
      //从远端获取bucketName
      getOssBucketNameFromRemote(uuid) {
        let bucketName = null,
          bucketNameList = [],
          self = this;
         rpc.query(`hybrid/oss/${uuid}/remote`)
           .then((resp) => {
            bucketNameList = resp.inventories
            if (bucketNameList.length > 0) bucketName = bucketNameList[0].bucketName
            self.bucketNameList = bucketNameList;
            self.bucketName = bucketName;
          })
      },
      //默认bucjet
      isFirstBucket(dataCenterUuid) {
        const self = this
        rpc.query('hybrid/aliyun/oss-bucket', {
          q: [`dataCenterUuid=${dataCenterUuid}`, 'current=true'],
          count: true
        })
          .then((resp) => {
            if (resp.total === 0) {
              self.isDefault = false;
            }
          })
      },
      //构造创建参数
      createParam () {
        let self = this;
        return {
          bucketName:  self.createType === 'createBucket' ? self.inputBucketName : self.bucketName,
          description: self.description,
          dataCenterUuid: self.dataCenterUuid,
          setDefault: self.isDefault,
          showBucketCreateMethod: self.createType === 'createBucket'
        }
      },
      //整体校验
      validateAll() {
        let self = this, normalProps = ['dataCenterUuid'];
        if(self.createType === 'createBucket' && !normalProps.includes('inputBucketName')) {
          normalProps.push('inputBucketName');
        }
        if(self.createType !== 'createBucket' && !normalProps.includes('bucketName')) {
          normalProps.push('bucketName');
        }
        normalProps.forEach((name) => {
          self.validate(name);
        })
        let invalid = normalProps.some((name) => {
          return self[`empty${name}`] === true || self[`invalid${name}`] === true;
        });
        return invalid;
      },
      //创建bucket
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.param.ok(self.createParam())
        self.$emit('close');
      },
      //移除选择kuang
      removeUuid(uuid) {
        this[uuid] = '';
        if(uuid=== 'dataCenterUuid') {
          this.bucketNameList = [];
          this.bucketName = '';
        }
        this.validate(uuid);
      }
    }
  }
</script>

<style scoped>

</style>
