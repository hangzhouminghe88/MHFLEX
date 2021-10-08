<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('monitoralarm.addMedia')}}</span>
      <span class="create-back">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px" @click="$router.push({name: 'emailserversetting'})">回到邮箱设置列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div ref="form">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input v-model="formData.name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
          <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea rows="3" v-model="formData.description"/>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.username')}}</div>
          <input type="text" v-model="formData.username" :class="{'is-error': emptyusername}" @blur="validate('username')"/>
          <div class="error error-text" v-if="emptyusername">{{$t('common.username')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.password')}}</div>
          <input type="password" v-model="formData.password" :class="{'is-error': emptypassword}" @blur="validate('password')"/>
          <div class="error error-text" v-if="emptypassword">{{$t('common.password')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.type')}}</div>
          smtp
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('monitoralarm.emailServer')}}</div>
          <input type="text" v-model="formData.smtpServer" :class="{'is-error': emptysmtpServer || invalidsmtpServer}" @blur="validate('smtpServer')"/>
          <div class="error error-text" v-if="emptysmtpServer && !invalidsmtpServer">{{$t('monitoralarm.emailServer')}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!emptysmtpServer && invalidsmtpServer">{{$t('monitoralarm.emailServer')}}{{$t('error.invalid')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('monitoralarm.emailPort')}}</div>
          <input type="text" v-model="formData.smtpPort" :class="{'is-error': emptysmtpPort}" @blur="validate('smtpPort')"/>
          <div class="error error-text" v-if="emptysmtpPort">{{$t('monitoralarm.emailPort')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('emailserversetting.encryptType')}}</div>
          <el-select v-model="formData.encryType" style="width: 100%;">
            <el-option v-for="(item, index) in encryptTypeList" :key="index" :value="item.value" :label="item.name"></el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div  slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'emailserversetting'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import EmailServerSettingMethods from './Methods';
  import validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "CreateEmailServerSettingPage",
    components: {CreateTemplate, DropDown},
    mixins: [WindowBase],
    data() {
      return {
        formData: {
          encryType: 'STARTTLS',
          name: '',
          username: '',
          password: '',
          smtpServer: '',
          smtpPort: ''
        },
        emptyname: false,
        emptyusername: false,
        emptypassword: false,
        emptysmtpServer: false,
        emptysmtpPort: false,
        invalidsmtpServer: false,
        encryptTypeList: [
          {name: 'STARTTLS', value: 'STARTTLS'},
          {name: 'SSL/TLS', value: 'SSL/TLS'},
          {name: 'NONE', value: 'NONE'}
        ]
      }
    },
    methods: {
      ...validator,
      ...{
        create: EmailServerSettingMethods.methods.create
      },
      validate(name){
          let self = this;
         self[`empty${name}`] = false
          let input = name === 'name' ? String(self.formData[name]).trim() : self.formData[name]
          if (!input) {
            self[`empty${name}`] = true
            return
          }
         self[`invalid${name}`] = false
          if (name === 'smtpServer') {
            if (!/([A-Za-z0-9])\.(\w+)\.([A-Za-z])/.test(input)) {
              self[`invalid${name}`] = true
            }
          }
          if (name === 'smtpPort' && !self.isUint(input)) {
            self[`invalid${name}`] = true
          }
      },
      validateAll(){
        let prop = ['name', 'password', 'smtpServer', 'smtpPort'], self = this;
        prop.forEach((name) => {
          self.validate(name);
        });
        let invalid = prop.some((name) => {return self[`empty${name}`] === true || self[`invalid${name}`] === true});
        return invalid;
      },
      createParam(){
        return {
          name: this.formData.name,
          description: this.formData.description,
          smtpServer:this.formData.smtpServer,
          smtpPort: this.formData.smtpPort,
          encryptType: this.formData.encryptType,
          username: this.formData.username,
          password: this.formData.password
        }
      },
      confirm(){
        let self = this;
        let isValid = self.validateAll();
        if(isValid) return;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'emailserversetting'})
          })
      }
    }
  }
</script>

<style scoped>

</style>
