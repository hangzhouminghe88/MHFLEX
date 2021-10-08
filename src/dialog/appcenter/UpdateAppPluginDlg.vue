<template>
 <dialog-template>
    <span slot="title">
       <span id="cluster-deleteCluster">{{ $t('common.appcenter') }}</span>
       <span class="el-icon-close dialog-close" @click="cancel"></span>
    </span>
   <div slot="body">
     <div style="margin: 60px 200px">
       <div class="operation-row">
         <div class="title" style="display: inline-block">{{$t('appcenter.category')}}{{$t('common.colon')}}</div>
         <span>{{$t(i18nCategory)}}</span>
       </div>
       <div class="operation-row" v-if="formData.recommendApp && formData.recommendApp != ''">
         <div class="title" style="display: inline-block">{{$t('appcenter.info.name')}}{{$t('common.colon')}}</div>
         <span>{{RECOMMEND_APP[formData.recommendApp].name}}</span>
       </div>
       <div class="operation-row">
         <div class="title">{{$t('common.name')}}{{$t('common.colon')}}</div>
         <input type="text" v-model="formData.name" @blur="validate('name')" @keydown.enter="validate('name')" :class="{'is-error': formValidator.emptyname}"/>
         <div class="error error-text" v-if="formValidator.emptyname">
           {{$t('error.emptyInput')+$t('common.name')}}
         </div>
       </div>
       <div class="operation-row">
         <div class="title">{{$t('common.description')}}{{$t('common.colon')}}</div>
         <textarea rows="3" v-model="formData.description"/>
       </div>
       <div class="operation-row">
         <div class="title">URL{{$t('common.colon')}}</div>
         <input type="text" v-model="formData.url" :class="{'is-error': formValidator.emptyurl || formValidator.invalidurl}" @blur="validate('url')" @keydown.enter="validate('url')"/>
         <div class="error error-text" v-if="formValidator.emptyurl">
           {{$t('error.emptyInput')+$t('common.url')}}
         </div>
         <div class="error error-text" v-if="!formValidator.emptyurl && formValidator.invalidurl">
           {{$t('error.invalid')+$t('common.url')}}
         </div>
       </div>
       <div class="operation-row">
         <div class="title">URL{{$t('common.colon')}}</div>
         <drop-down class="create-dropdown" :param="{
          getOptionList: () => {
            return optionsList;
          },
          getIndex: () => {
            return optionsList.findIndex((item) => {
            return formData.visibleAccess === item.value
          })
          },
          setIndex(index){
           return formData.visibleAccess = optionsList[index].value;
          }
         }"></drop-down>
       </div>
     </div>
   </div>
   <div slot="footer">
     <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
     <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
   </div>
 </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import { RECOMMEND_APP } from 'src/om/appcenter/Constant';
  import validator from 'src/utils/validator';
  import _ from 'lodash';
  export default {
    name: "UpdateAppPluginDlg",
    mixins: [WindowBase],
    components: {
      DropDown
    },
    data(){
      return {
        RECOMMEND_APP: RECOMMEND_APP,
        optionsList: [
          {name: "appcenter.info.ADMIN", value: 'ADMIN'},
          {name: "appcenter.info.ALL", value: 'ALL'}
        ],
        formData:{},
        formValidator: {
          emptyname: false,
          emptyurl: false,
          invalidurl: false
        }
      }
    },
    created () {
      if (this.dbData.plugin[this.dialogData.param.uuid]) {
        this.formData = _.cloneDeep(this.dbData.plugin[this.dialogData.param.uuid])
        this.formData.updatedBy = window.localStorage.getItem('accountUuid')
      }
    },
    computed: {
      i18nCategory: function () {
        return 'appcenter.info.' + this.formData.category
      },
      i18nAccess: function () {
        return 'appcenter.info.' + this.formData.visibleAccess
      }
    },
    methods: {
      ...validator,
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
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
          let invalid = this.validateAll()
          if (invalid) return
          this.dialogData.param.ok(this.formData)
          this.closeDialog(this.windowId)
      }
    }
  }
</script>

<style scoped>
 .operation-row{
   width: 100%;
 }
</style>
