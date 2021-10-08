<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('certificate.create')}}</span>
      <span class="create-back" @click="$router.push({name: 'certificate'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到证书列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="certificate"/>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"></textarea>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('certificate.content')}}</div>
        <help-trigger name="certificateText"/>
        <textarea rows="3" v-model="content" :class="{'is-error': emptycontent || invalidcontent}" @blur="validate('content')"/>
        <div class="error error-text" v-if="emptycontent && !invalidcontent">{{$t('certificate.content')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="!emptycontent && invalidcontent">{{$t('certificate.content')}}{{$t('error.invalid')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('certificate.privateKey')}}</div>
        <help-trigger name="certificatePrivateKey"/>
        <textarea rows="3" v-model="privateKey" :class="{'is-error': emptyprivateKey || invalidprivateKey}" @blur="validate('privateKey')"/>
        <div class="error error-text" v-if="emptyprivateKey && !invalidprivateKey">{{$t('certificate.privateKey')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="!emptyprivateKey && invalidprivateKey">{{$t('certificate.privateKey')}}{{$t('error.invalid')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('certificate.chain')}}</div>
        <help-trigger name="certificateChain"/>
        <textarea rows="3" v-model="chain"/>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'certificate'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import CertificateMethods from './Methods';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "CreateCertificatePage",
    mixins: [WindowBase],
    components: {CreateTemplate},
    data(){
      return {
        name: '',
        emptyname: false,
        description: '',
        content: '',
        emptycontent: false,
        invalidcontent: false,
        privateKey: '',
        emptyprivateKey: false,
        invalidprivateKey: false,
        chain: ''
      }
    },
    methods: {
      ...{
        create: CertificateMethods.methods.create
      },
      validate(name){
        let self = this;
        self[`empty${name}`] = false;
        let input = name === 'name' ? String(self[name]).trim() : self[name];
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        self[`invalid${name}`] = false;
        if(name === 'content'){
          if(!/^(----BEGIN CERTIFICATE----)([\s\S]*)(----END CERTIFICATE----)$/.test(self[name].trim())){
            self[`invalid${name}`] = true;
            return;
          }
        }
        if(name === 'privateKey'){
          if(!/^(----BEGIN PRIVATE KEY----)([\s\S]*)(----END PRIVATE KEY----)$/.test(self[name].trim())){
            self[`invalid${name}`] = true;
            return;
          }
        }
      },
      validateAll(){
        let self = this, prop =['name', 'content', 'privateKey'];
        prop.forEach((name) => {
          self.validate(name);
        })
        let inValid = prop.some((name) => {
          return self[`empty${name}`] === true || self[`invalid${name}`] === true;
        })
        return inValid;
      },
      createParam(){
        let self = this;
        let certificates = [self.privateKey, self.content, self.chain]
        return {
          name: self.name,
          description: self.description,
          certificate: certificates.join('\n')
        }
      },
      confirm() {
        let self = this;
        let invalid = self.validateAll()
        if (invalid) return;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'certificate'})
          })
      }
    }
  }
</script>

<style scoped>

</style>
