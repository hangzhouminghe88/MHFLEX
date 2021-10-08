<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="text">
        {{$t('hybriddatacenter.Adddatacenter')}}
      </span>
      <span class="create-back" @click.stop="cancel()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到阿里云数据中心</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title"></div>
        <el-radio-group v-model="windowData.type" @change="toggleType">
          <el-radio label="aliyun">{{$t('hybriddatacenter.PublicKey')}}</el-radio>
          <el-radio label="privateAliyun">{{$t("hybriddatacenter.PrivateKey")}}</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('hybridbucket.region')}}</div>
        <help-trigger name="region" />
        <el-select style="width: 100%;" v-model="windowData.regionName">
          <el-option
            v-for="(item, index) in windowData.regionIdList"
            :key="index" :value ="item.regionName"
            :label="item.regionName"
            @click.native="handleChangeRegion(item)"
            ></el-option>
        </el-select>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="windowData.description" @blur="validate('description')"
          :class="{'is-error': windowData.emptydescription}"/>
        <div class="error error-text" v-if="windowData.emptydescription">
          {{$t('error.emptyInput')+$t('common.introduction')}}
        </div>
      </div>

      <div class="operation-row" v-if="windowData.type === 'privateAliyun'">
        <div class="title required">
          {{$t('common.type')}}
        </div>
        <el-select v-model="type" style="width: 100%">
          <el-option value="AliyunEBS" :label="'AliyunEBS'"></el-option>
          <el-option value="AliyunNAS" :label="'AliyunNAS'"></el-option>
        </el-select>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import { checkAccessKey } from 'src/alicloud/accesskey/Assistant/AccessKeyAssistant';
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "HybridAliCloudDataCenterCreatePage",

    mixins: [WindowBase],

    components: {
      CreateTemplate,
    },

    data() {
      return {
        canCreate: true,
        type: 'AliyunEBS'
      }
    },

    created () {
      let self = this;
      self.updateWindow({
        type: 'aliyun',
        description: '',
        regionName: '',
        regionId: '',
      }).then( () => {
        self.init();
        checkAccessKey('aliyun', self);
      })
    },

    methods: {
      ...{
        create: Methods.methods.create
      },

      init () {
        let regionIdList = [],
        regionName = '',
        regionId = '',
        self = this;
        rpc.query('hybrid/hybrid/key', {
          q: ['current=true', 'type=aliyun']
        }).then(resp => {
        if (resp.inventories.length === 0) return
         rpc.query('hybrid/data-center/remote', {
           type: self.windowData.type
         })
        .then((resp) => {
          if (resp.inventories.length > 0) {
            regionId = resp.inventories[0].regionId
            regionName = resp.inventories[0].regionName
          }
          regionIdList = resp.inventories;
          this.updateWindow({ regionIdList, regionName, regionId })
          this.updateDescription()
          })
        })
      },

      validate (name) {
        let obj = {}
        obj[`empty${name}`] = false
        let input = String(this.windowData[name]).trim()
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
         obj[`invalid${name}`] = false
         this.updateWindow(obj)
       },

       handleChangeRegion (item) {
         let self = this;
         self.updateWindow({
             'regionId': item.regionId,
             'regionName': item.regionName
         });
         self.updateDescription();
       },

      updateDescription () {
        let self = this;
         rpc.query(`hybrid/hybrid/key`, {
          q: ['current=true', 'type=aliyun']
        })
        .then((resp) => {
          self.updateWindow({ description: `AK:${resp.inventories[0].name},${self.windowData.regionName}` })
          self.validate('description')
        })
      },

      toggleType (e) {
        let self = this;
        self.updateWindow({ type: e })
         .then(() => {
          self.init()
        })
      },

      createParam () {
        return {
          regionName: this.windowData.regionName,
          description: this.windowData.description,
          regionId: this.windowData.regionId,
          type: this.windowData.type
        }
      },

      validateAll () {
         let obj = {}
         obj.invalidInput = false
         let props = ['description']
         props.forEach(item => this.validate(item))
         let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
         if (isInvalid) obj.invalidInput = true
         this.updateWindow(obj)
      },

      confirm () {
        let self = this;
        self.validateAll()
        if (self.windowData.invalidInput ||
        !self.windowData.regionId ||
        !self.windowData.regionName) return
        self.canCreate = false;
        self.create(self.createParam())
        .then( () => {
          self.cancel();
        }).catch(() => {
          self.canCreate = true;
        })
      },

      cancel () {
        let self = this;
        self.$router.push({name: 'hybridaliclouddatacenter'});
      },
    },

    destroyed () {
      let self = this;
      self.deleteGlobalAssistant('Hybrid')
    }
  }
</script>

<style scoped>

</style>
