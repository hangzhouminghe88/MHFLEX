<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('user.create')}}</span>
      <span class="create-back" @click="$router.push({name: 'user'})"><i class="el-icon-back"></i>回到用户列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea type="text" v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.password')}}</div>
        <input type="password" v-model="password" :class="{'is-error': emptypassword || passwordLimit}"  @blur="validate('password')"/>
        <div class="error error-text" v-if="emptypassword && !passwordLimit">{{$t('common.password')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-else-if="!emptypassword && passwordLimit">{{$t('common.password')}}{{$t('common.passwordLengthLimit')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('account.confirmPassword')}}
        </div>
        <input type="password" v-model="newPassword" :class="{'is-error': emptynewPassword || newPasswordLimit || noEqual}" @blur="validate('newPassword')"/>
        <div class="error error-text" v-if="emptynewPassword && (!newPasswordLimit || !noEqual)">{{$t('account.confirmPassword')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-else-if="newPasswordLimit && (!emptynewPassword || !noEqual)">{{$t('account.confirmPassword')}}{{$t('common.passwordLengthLimit')}}</div>
        <div class="error error-text" v-else-if="noEqual && (!newPasswordLimit || !newPasswordLimit)">{{$t('account.notEqualPassword')}}</div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm"  :class="{'disabled': !canCreate}" 
                                 @click="canCreate && confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'user'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
    import CreateTemplate from "../../component/CreateTemplate";
    import WindowBase from 'src/windows/Window';
    import sha512 from 'crypto-js/sha512';
    export default {
      name: "CreateUserPage",
      components: {CreateTemplate},
      mixins: [WindowBase],
      data(){
        return {
          name: '',
          emptyname: false,
          emptypassword: false,
          emptynewPassword: false,
          newPasswordLimit: false,
          passwordLimit: false,
          noEqual: false,
          description: '',
          password: '',
          newPassword: '',
          invalid: false,
          canCreate: true
        }
      },
      computed:{
        validateName(){
          let self = this;
          if(!self.name) return self.emptyname=true;
          else return  self.emptyname = false;
        },
        validatePassword(){
          let self = this;
          if(!self.password) {
            self.emptypassword = true;
          }else if(self.password.trim().length <6 || self.password.trim().length > 18){
            self.emptypassword = false;
            self.passwordLimit = true;
          }else {
            self.emptypassword = false;
            self.passwordLimit = false;
          }
        },
        validateNewPassword(){
          let self = this;
          if(!self.newPassword) {
            self.emptynewPassword = true;
          }else if(self.newPassword.trim().length <6 || self.newPassword.trim().length > 18) {
            self.emptynewPassword = false;
            self.newPasswordLimit = true;
          }else if(self.newPassword !== self.password){
            self.emptynewPassword = false;
            self.newPasswordLimit = false;
            self.noEqual = true;
          }else {
            self.emptynewPassword = false;
            self.newPasswordLimit = false;
            self.noEqual = false;
          }
        }
      },
      methods: {
        validate(name){
          let self = this;
          if(name === 'name'){
            self.validateName;
          }
          if(name === 'password'){
            self.validatePassword;
          }
          if(name === 'newPassword'){
           self.validateNewPassword;
          }
        },
        validateAll(){
          let prop = ['name', 'password', 'newPassword'], self = this;
          prop.forEach((name) => {
            self.validate(name);
          })
          let isEmpty = prop.some((name) => self[`empty${name}`] === true);
          if(isEmpty || self.passwordLimit || self.newPasswordLimit || self.noEqual){
            self.invalid = true;
          }else{
            self.invalid = false;
          }
        },
        createParam() {
          let self = this;
          return {
            name: self.name,
            password: sha512(self.newPassword).toString(),
            description: self.description,
          }
        },
        confirm(){
          let self = this;
          self.validateAll();
          if(self.invalid) return;
          self.canCreate = false;
          self.dispatchActionWithEvent('user/create', self.createParam())
          .then(() => {
            self.$router.push({name: 'user'});
          }).catch(() => {
             self.canCreate = true;
          });
        },
      }
    }
</script>

<style scoped>

</style>
