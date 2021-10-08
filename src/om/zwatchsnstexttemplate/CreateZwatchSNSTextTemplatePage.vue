<template>
 <create-template>
   <div slot="header" class="create-header">
     <span>{{$t('zwatchSNSTextTemplate.create')}}</span>
     <span class="create-back" @click="$router.push({name: 'zwatchsnstexttemplate'})">
       <i class="el-icon-back"></i>
       <span class="text" style="font-size: 12px;">回到告警模板列表</span>
     </span>
   </div>
   <div slot="body" class="create-body">
     <div class="operation-row">
       <div class="title required">{{$t('common.name')}}</div>
       <help-trigger name="zwatchsnstexttemplate"/>
       <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
       <div class="error-text error" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
     </div>
     <div class="operation-row">
       <div class="title">{{$t('common.description')}}</div>
       <textarea rows="3" v-model="description"/>
     </div>
     <div class="operation-row">
       <div class="title required">{{$t('common.platform')}}</div>
       <help-trigger name="zwatchSnsTemplatePlatform"/>
       <el-select v-model="getPlatform" style="width: 100%;">
         <el-option v-for="(item, index) in platformList"
                    :key="index" :value="item.value"
                    @click.native="() => {
                      isFirstEdit.template = true;
                      isFirstEdit.recoverdTemplate = true;
                      templateText= '';
                      recoverdTemplateText = '';
                      platform = platformList[index].value;
                    }"></el-option>
       </el-select>
     </div>
     <div class="operation-row">
       <div class="title required">{{$t('zwatchSNSTextTemplate.templateText')}}</div>
       <p v-if="platform === 'DingTalk'">
         {{$t("zwatchSNSTextTemplate.dingTalkTemplateIntroduction1")}}<a target="_blank" href="https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.eYuVxi&treeId=257&articleId=105735&docType=1">{{$t("zwatchSNSTextTemplate.dingTalkWeb")}}</a>{{$t("zwatchSNSTextTemplate.dingTalkTemplateIntroduction2")}}
       </p>
       <textarea rows="20" v-model="templateText" :placeholder="placeholder" @click="editTemplate('template')" :class="{'is-error': emptytemplateText}" @blur="validate('templateText')"/>
       <div class="error error-text" v-if="emptytemplateText">{{$t('zwatchSNSTextTemplate.templateText')}}{{$t('error.noEmpty')}}</div>
     </div>
     <div class="operation-row">
       <div class="title required">{{$t('zwatchSNSTextTemplate.recoverTemplateText')}}</div>
       <textarea rows="20" :placeholder="recoveredPlaceholder" v-model="recoverdTemplateText" @click="editTemplate('recoverdTemplate')"
       :class="{'is-error': emptyrecoverdTemplateText}" @blur="validate('recoverdTemplateText')"/>
       <div class="error error-text" v-if="emptyrecoverdTemplateText">{{$t('zwatchSNSTextTemplate.recoverTemplateText')}}{{$t('error.noEmpty')}}</div>
     </div>
     <div class="operation-row">
       <div class="title"></div>
       <el-checkbox v-model="isDefault">{{$t('zwatchSNSTextTemplate.defaultTemplate')}}</el-checkbox>
     </div>
   </div>
   <div slot="footer" class="create-footer">
     <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="$router.push({name: 'zwatchsnstexttemplate'})">{{$t('common.cancel')}}</span>
   </div>
 </create-template>
</template>

<script>
  import DropDown from  'src/ecs/autoScalingGroup/component/Dropdown';
  import CreateTemplate from "../../component/CreateTemplate";
  import Methods from './Methods';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "CreateZwatchSNSTextTemplatePage",
    mixins: [WindowBase],
    components: {CreateTemplate, DropDown},
    data(){
      return {
        name: '',
        description: '',
        platformList: [
          {name: 'common.email', value: 'Email'},
          {name: 'common.dingTalk', value: 'DingTalk'}
        ],
        platform:'Email',
        templateText: '',
        recoverdTemplateText: '',
        isFirstEdit:{
          template: true,
          recoverdTemplate: true
        },
        isDefault: false,
        emptyname: false,
        emptytemplateText: false,
        emptyrecoverdTemplateText: false
      }
    },
    computed: {
      placeholder () {
        if (_.get(this.$data, 'platform') === 'DingTalk') return this.$t('zwatchSNSTextTemplate.text.templatePlaceholderForDingTalk')
        else return this.$t('zwatchSNSTextTemplate.text.templatePlaceholder')
      },
      recoveredPlaceholder () {
        if (_.get(this.$data, 'platform') === 'DingTalk') return this.$t('zwatchSNSTextTemplate.text.recoverytemplatePlaceholderForDingTalk')
        else return this.$t('zwatchSNSTextTemplate.text.recoverytemplatePlaceholder')
      },
      getPlatform:{
        get(){
          let self = this;
          let index = _.findIndex(this.platformList, (item) => {
            return self.platform === item.value;
          })
          return self.$t(self.platformList[index].name);
        },
        set(){

        }
      }
    },
    methods: {
      ...{
        create: Methods.methods.create
      },
      editTemplate(param){
        let self = this;
        if(param === 'template' && self.isFirstEdit.template === true){
          self.templateText = self.placeholder;
          this.isFirstEdit.template = false
        }
        if(param=== 'recoverdTemplate' && self.isFirstEdit.recoverdTemplate === true){
          self.recoverdTemplateText = self.recoveredPlaceholder;
          this.isFirstEdit.recoverdTemplate = false
        }
      },
      validate(name){
        let self = this;
        let input = name === 'name' ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },
      validateAll(){
        let self  = this, props = ['name', 'templateText', 'recoverdTemplateText'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true);
        return invalid;
      },
      createParam(){
        let self = this;
        return {
          name: self.name,
          description: self.description,
          template: self.templateText,
          recoveryTemplate: self.recoverdTemplateText,
          defaultTemplate: self.isDefault,
          applicationPlatformType: self.platform
        }
      },
      confirm(){
        let self = this;
        if(self.validateAll()) return;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'zwatchsnstexttemplate'})
          });
      }
    }
  }
</script>

<style scoped>

</style>
