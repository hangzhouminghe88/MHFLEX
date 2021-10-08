<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="create-title">
        {{$t('hybriddatacenter.Adddatacenter')}}
      </span>
      <!--返回列表-->
      <span class="create-back el-icon-back" @click="close()">
        回到华为云地域列表
      </span>
    </div>
    <div slot="body" class="create-body">
      <!--地域名称-->
       <mh-input label="common.name"
                 :required="true"
                 :select-group="regionList"
                 @changeOption="changeRegion"
                 :show-error="emptyregionName"
                 :error-message="rules.regionName.message"
                 type="select"
                 prop="regionName"
                 v-model="regionName"/>
      <!--地域描述-->
      <mh-input label="common.description"
                v-model="description"
                :required="true"
                prop="description"
                :show-error="emptydescription"
                :error-message="rules.description.message"
                @validate="validate"
                type="textarea"/>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  //创建页面模板组件
  import { huaweiAsync } from 'src/windows/asyncData/asyncData';
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';
  export default {
    name: "CreateHuaweiDataCenterPage",
    mixins: [WindowBase],
    components: {
      CreateTemplate
    },
    //初始化数据
    data() {
      return {
        canCreate: true,
        regionList: [],
        emptyregionName: false,
        rules: {
          regionName: {message: ''},
          description: {message: ''}
        },
        regionName:  '',
        description: '',
        emptydescription: false,
        ossBucketUuid:  ''
      }
    },
    mounted() {
      let _this = this;
      huaweiAsync(_this)
      _this.init();
    },
    methods: {
      ...{
        create: Methods.methods.create
      },
      //初始化regionName
      init() {
        rpc.query('/brid/huawei/key', {
          q: 'current=true'
        }).then(resp => {
          if (resp.inventories.length === 0) return
          rpc.query('brid/data-center/remote', {
            type: 'huawei'
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                this.regionId = resp.inventories[0].regionId
                this.regionName = resp.inventories[0].regionName;
                this.description = ''
              }
              this.regionList = resp.inventories.map((it) => {
                return {
                  label: it.regionName,
                  value: it.regionName,
                  regionId: it.regionId
                }
              })
              this.updateDescription();
            })
        })
      },
      //更新描述
      updateDescription() {
        rpc.query(`/brid/huawei/key`, {
          q: 'current=true'
        })
          .then((resp) => {
            this.description = `Account:${resp.inventories[0].name},${this.regionName}`;
            this.validate('description')
          })
      },
      //关闭创建页回到列表页
      close() {
        let self = this;
        self.$router.push({name: 'hybridhuaweidatacenter'})
      },
      //确定并添加
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.confirmParam())
          .then(() => {
            self.close();
          })
          .catch(() => {
            self.canCreate = true;
          })
      },
      //请求参数
      confirmParam() {
        return {
          regionName: this.regionName,
          description: this.description,
          regionId: this.regionId,
          ossBucketUuid: this.ossBucketUuid,
          type: 'huawei'
        }
      },
      //切换选择框
      changeRegion(item) {
        let self = this;
        self.regionName = item.value;
        self.regionId = item.regionId;
        self.updateDescription();
      },
      //校验
      validate(name) {
        let self = this, input = '';
        input = name === 'description' ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        if(!input) {
          self[`empty${name}`] = true;
          self.rules[name].message = self.$t('error.noEmpty') + self.$t(`common.${name}`);
          return;
        }
      },
      //整体校验
      validateAll() {
        let self = this, props= ['regionName', 'description'];
        props.forEach((name) => {
          self.validate(name);
        });
        let invalid = props.some((name) => self[`empty${name}`] === true);
        return invalid;
      }
    }
  }
</script>

<style scoped>

</style>
