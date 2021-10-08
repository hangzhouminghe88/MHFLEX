<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('appcenter.create')}}</span>
      <span @click="$router.push({name: 'appcenter'})" class="create-back">
        <i class="el-icon-back"></i>
        回到应用中心
      </span>
    </div>
    <div slot="body">
      <div class="operation-row">
        <div class="title required">{{$t('appcenter.category')}}</div>
        <help-trigger name="appCenter"/>
        <drop-down class="dropdown create-dropdown"
          :param="{
             getIndex: () => {
               return optionsList.findIndex((item) => {
                 return formData.category === item.value;
               })
             },
             setIndex: (index) => {
               return formData.category = optionsList[index].value;
             },
             getOptionList: () => {
               return optionsList
             }
          }"
        ></drop-down>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('appcenter.info.name')}}</div>
        <el-radio v-model="formData.isRecommend" label="recommend">{{$t(`appcenter.info.recommend`)}}</el-radio>
        <el-radio v-model="formData.isRecommend" label="other">{{$t(`appcenter.info.other`)}}</el-radio>
      </div>
      <div class="operation-row" v-if="formData.isRecommend === 'recommend'">
        <drop-down class="dropdown create-dropdown"
                   :param="{
             getIndex: () => {
               return recommendAppList.findIndex((item) => {
                 return formData.recommendApp === item.value;
               })
             },
             setIndex: (index) => {
               return formData.recommendApp = recommendAppList[index].value;
             },
             getOptionList: () => {
               return getRecommendList()
             }
          }"></drop-down>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="formData.name" :class="{'is-error': formValidator.emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="formValidator.emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="formData.description"></textarea>
      </div>
      <div class="operation-row">
        <div class="title required">URL:</div>
        <input type="text" v-model="formData.url" :class="{'is-error': formValidator.emptyurl || formValidator.invalidurl}" @blur="validate('url')"/>
        <div class="error error-text" v-if="formValidator.emptyurl && !formValidator.invalidurl">URL{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="!formValidator.emptyurl && formValidator.invalidurl">URL{{$t('error.invalid')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('appcenter.info.access')}}</div>
        <drop-down class="dropdown create-dropdown"
                   :param="{
             getIndex: () => {
               return visibleAccessList.findIndex((item) => {
                 return formData.visibleAccess === item.value;
               })
             },
             setIndex: (index) => {
               return formData.visibleAccess = visibleAccessList[index].value;
             },
             getOptionList: () => {
               return visibleAccessList
             }
          }"></drop-down>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'appcenter'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import {RECOMMEND_APP, ACCESS, APP_CATEGORY} from './Constant';
  import AppCenterMethods from 'src/om/appcenter/Methods';
  import {genUniqueId} from 'src/utils/utils';
  import validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "CreateAppCenterPage",
    components: {CreateTemplate, DropDown},
    mixins: [WindowBase],
    data(){
      return {
        APP_CATEGORY: APP_CATEGORY,
        name: '',
        formData: {
          name: '',
          category: `${APP_CATEGORY.STORAGE.value}`,
          isRecommend: 'recommend',
          recommendApp: '',
          visibleAccess: 'ADMIN',
          description: ''
        },
        formValidator:{
          emptyname: false,
          emptyurl: false,
          invalidurl: false
        },
        optionsList: [
          {name:`appcenter.info.${APP_CATEGORY.STORAGE.value}`, value: `${APP_CATEGORY.STORAGE.value}`},
          {name: `appcenter.info.${APP_CATEGORY.DB.value}`, value: `${APP_CATEGORY.DB.value}`},
          {name: `appcenter.info.${APP_CATEGORY.SECURITY.value}`, value: `${APP_CATEGORY.SECURITY.value}`},
          {name: `appcenter.info.${APP_CATEGORY.IaaS.value}`, value: `${APP_CATEGORY.IaaS.value}`},
          {name: `appcenter.info.${APP_CATEGORY.PaaS.value}`, value: `${APP_CATEGORY.PaaS.value}`},
          {name: `appcenter.info.${APP_CATEGORY.SaaS.value}`, value: `${APP_CATEGORY.SaaS.value}`}
        ],
        recommendAppList: [],
        visibleAccessList: [
          {name: "appcenter.info.ADMIN", value: 'ADMIN'},
          {name: "appcenter.info.ALL", value: 'ALL'}
        ]
      }
    },
    methods: {
      ...{
        create: AppCenterMethods.methods.create
      },
      getRecommendList () {
        let self = this;
        switch (self.formData.category) {
          case self.APP_CATEGORY.STORAGE.value:
            self.formData.recommendApp = 'XSKY'
            self.recommendAppList = [{name: `appcenter.info.MHFLEX_SOTRE`, value: 'XSKY'}]
            self.formData.isRecommend = 'recommend'
            break
          case self.APP_CATEGORY.PaaS.value:
            self.recommendAppList = [RECOMMEND_APP.RANCHER]
            self.formData.recommendApp = RECOMMEND_APP.RANCHER.value
            self.formData.isRecommend = 'recommend'
            break
          default:
            self.recommendAppList = []
            self.formData.recommendApp = ''
            self.formData.isRecommend = 'other'
        }
        return self.recommendAppList;
      },
      validate (name) {
        if (name === 'name') {
          this.formValidator.emptyname = false
          if (this.formData[`${name}`] === '') {
            this.formValidator[`empty${name}`] = true
            return false
          }
        }
        if (name === 'url') {
          this.formValidator.emptyurl = false
          this.formValidator.invalidurl = false
          if (this.formData[`${name}`] === '') {
            this.formValidator[`empty${name}`] = true
            return false
          }
          if (!validator.isUrl(this.formData[`${name}`])) {
            this.formValidator[`invalid${name}`] = true
            return false
          }
        }
        return true
      },
      validateAll () {
        let props = ['name', 'url']
        let invalid = props.some((name) => {
          return !this.validate(name)
        })
        return invalid
      },
      createParam () {
        return {
          uuid: genUniqueId(),
          createdBy: window.localStorage.getItem('accountUuid'),
          name: this.formData.name,
          category: this.formData.category,
          recommendApp: this.isRecommend ? this.formData.recommendApp.value : '',
          url: this.formData.url,
          description: this.formData.description,
          visibleAccess: this.formData.visibleAccess
        }
      },
      confirm(){
        let self = this;
        let invalid = self.validateAll();
        if(invalid) return;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'appcenter'})
          })
      }
    }
  }
</script>

<style scoped>

</style>
