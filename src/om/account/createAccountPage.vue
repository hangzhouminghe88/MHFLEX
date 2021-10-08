<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('account.create')}}</span>
      <span @click="$router.push({name: 'account'})" class="create-back"><i class="el-icon-back"></i> 回到账户列表 </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"></textarea>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.password')}}</div>
        <input type="password" v-model="password" :class="{'is-error': emptypassword || invalidPswLength}" @blur="validate('password')"/>
        <div class="error error-text" v-if="emptypassword && !invalidPswLength">{{$t('common.password')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="!emptypassword && invalidPswLength">{{$t('common.passwordLengthLimit')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('account.confirmPassword')}}</div>
        <input type="password" v-model="confirmPassword" :class="{'is-error': emptyconfirmPassword || invalidConLength || invalidPsw}"  @blur="validate('confirmPassword')"/>
        <div class="error error-text" v-if="emptyconfirmPassword && !invalidConLength">{{$t('account.confirmPassword')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="!emptyconfirmPassword && invalidConLength">{{$t('common.passwordLengthLimit')}}</div>
        <div class="error error-text" v-if="(!emptyconfirmPassword && !invalidConLength) && invalidPsw">{{$t('account.notEqualPassword')}}</div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && createAccount()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'account'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
    import CreateTemplate from "../../component/CreateTemplate";
    import sha512 from 'crypto-js/sha512';
    import Root from 'src/windows/Root';
    export default {
      name: "createAccountPage",
      components: {CreateTemplate},
      mixins: [Root],
      data(){
        return {
          name: '',
          emptyname: false,
          description: '',
          password: '',
          emptypassword: false,
          confirmPassword: '',
          emptyconfirmPassword: false,
          invalidPswLength: false,
          invalidConLength: false,
          invalidPsw: false,
          invalidInput: false,
          canCreate: true
        }
      },
      methods: {
        validate(name){
          let self = this;
          self[`empty${name}`] = false;
          let input = name === 'name' ? String(self[name]).trim() : self[name];
          if(!input){
            self[`empty${name}`] = true;
            return
          }
          if(name === 'password'){
            self.validatePassword();
          }
          if(name === 'confirmPassword'){
            self.validateConfPassword()
          }
        },
        validatePassword(){
          let self = this; self.invalidPswLength = false;
          if(self.password.trim().length > 18 || self.password.trim().length < 6){
            self.invalidPswLength = true;
            return;
          }
        },
        validateConfPassword(){
          let self = this; self.invalidPswLength = false, self.invalidPsw = false;
          if(self.password.trim().length > 18 || self.password.trim().length < 6){
            self.invalidConLength = true;
            return;
          }
          if(self.password.trim() !== self.confirmPassword.trim()){
            self.invalidPsw = true;
            return ;
          }
        },
        validateAll(){
          let prop =['name', 'password', 'confirmPassword'], self =  this;
          prop.forEach(name => {
            self.validate(name);
          })
          self.invalidInput =  prop.some((name) => {return self[`empty${name}`]=== true || self[`invalid${name}`] === true
          || self.invalidPsw === true || self.invalidConLength === true || self.invalidPswLength === true});
        },
        createParam(){
          let self = this;
          return {
            name: self.name,
            description: self.description,
            password: sha512(self.confirmPassword).toString()
          }
        },
        createAccount(){
          let self = this;
          self.validateAll();
          if(self.invalidInput) return;
          self.canCreate = false
          self.dispatchActionWithEvent('account/create', self.createParam())
            .then(() => {
              self.$router.push({name: 'account'})
            }).catch(() => {
            self.canCreate = false
          })
        }
      }
    }
</script>

<style scoped>

</style>
