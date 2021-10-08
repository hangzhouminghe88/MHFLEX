<template>
   <dialog-template>
     <div slot="title" class="modal-plain-header">
       <span class="modal-title">{{$t(`common.change${title}`)}}</span>
       <span class="dialog-close el-icon-close" @click="cancel()"></span>
     </div>

     <div slot="body">
       <div style="padding: 20px 150px 50px;">
         <div class="operation-row" v-if="type === 'sshUserName'">
           <div class="title">{{$t('common.sshUserName')}}</div>
           <input type="text" v-model="sshUserName" :class="{'is-error': emptysshUserName}" @blur="validate('sshUserName')"/>
           <div class="error error-text" v-if="emptysshUserName">{{$t('error.emptyInput') + $t('common.sshUserName')}}</div>
         </div>

         <div class="operation-row" v-if="type === 'sshPassword'">
           <div class="title">{{$t('common.password')}}</div>
           <input type="password" v-model="password" :class="{'is-error': emptypassword || noEqual}" @blur="validate('password')"/>
           <div class="error error-text" v-if="emptypassword">{{$t('error.emptyInput') + $t('common.password') }}</div>
           <div class="error error-text" v-if="!emptypassword && noEqual">{{$t('account.notEqualPassword')}}</div>
         </div>

         <div class="operation-row" v-if="type === 'sshPassword'">
           <div class="title">{{$t('account.confirmPassword')}}</div>
           <input type="password" v-model="newPassword" :class="{'is-error': emptynewPassword || noEqual}" @blur="validate('newPassword')"/>
           <div class="error error-text" v-if="emptynewPassword">{{$t('error.emptyInput') + $t('account.confirmPassword') }}</div>
           <div class="error error-text" v-if="!emptynewPassword && noEqual">{{$t('account.notEqualPassword')}}</div>
         </div>

         <div class="operation-row" v-if="type === 'sshPort'">
           <div class="title">{{$t('common.changeSshPort')}}</div>
           <input type="number" placeholder="0 ~ 65535" v-model="sshPort"
                  :class="{'is-error': emptysshPort || invalidsshPort}"
                  @blur="validate('sshPort')"/>
           <div class="error error-text" v-if="emptysshPort">{{$t('error.emptyInput') + $t('common.changeSshPort')}}</div>
           <div class="error error-text" v-if="!emptysshPort && invalidsshPort">{{$t('error.invalid') + $t('common.changeSshPort')}}</div>
         </div>

         <div class="operation-row" v-if="type === 'monPort'">
           <div class="title">{{$t('common.changeMonPort')}}</div>
           <input type="number" placeholder="0 ~ 65535" v-model="monPort"
                  :class="{'is-error': emptymonPort || invalidmonPort}"
                  @blur="validate('monPort')"/>
           <div class="error error-text" v-if="emptymonPort">{{$t('error.emptyInput') + $t('common.changeMonPort')}}</div>
           <div class="error error-text" v-if="!emptymonPort && invalidmonPort">{{$t('error.invalid') + $t('common.changeMonPort')}}</div>
         </div>

       </div>
     </div>

     <div slot="footer" class="dialog-footer">
       <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
       <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
     </div>
   </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash'

  export default {
    name: "ModifyMonDlg",
    mixins: [WindowBase],
    data(){
      return {
        sshUserName: '',
        password: '',
        newPassword: '',
        emptypassword: false,
        emptynewPassword: false,
        sshPort: '',
        noEqual: false,
        emptysshPort: false,
        invalidsshPort: false,
        monPort: '',
        emptymonPort: false,
        invalidmonPort: false,
        emptysshUserName: false,
        type:  '',
        title: ''
      }
    },

    created(){
      let self = this;
      self.type = self.dialogData.param.curChangeInfo;
      self.title = self.type.replace(/\S/, (it) => {return it.toUpperCase()});
      this.updateWindow({
        curChangeInfo: this.dialogData.param.curChangeInfo,
        curMonUuid: this.dialogData.param.curMonUuid,
        type: this.dialogData.param.type,
        resourceType: this.dialogData.param.resourceType,
        primarystorage: this.dialogData.param.primarystorage,
        backupstorage: this.dialogData.param.backupstorage
      })
    },

    methods: {
      validate(name){
        let self = this;
        self[`empty${name}`] = false;
        self.noEqual = false;
        let input = name === 'sshUserName' ? String(self[name]).trim() : self[name];
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'password' && self.newPassword){
          if(!_.isEqual(self.password, self.newPassword)){
            self.noEqual = true;
          }
        }
        if(name === 'newPassword' && self.password){
          if(!_.isEqual(self.password, self.newPassword)){
            self.noEqual = true;
          }
        }
        if(name === 'sshPort'){
          if(typeof (Number(self.sshPort)) !== 'number') self.invalidsshPort = true;
        }
        if(name === 'monPort'){
          if(typeof (Number(self.monPort)) !== 'number') self.invalidmonPort = true;
        }
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },

      createParam() {
        let self = this, param = null;
        switch (self.type) {
          case 'sshUserName':
            param = {
              sshUserName: self.sshUserName
            }
            break;
          case 'sshPassword':
            param = {
              sshPassword: self.password
            }
            break;
          case 'sshPort':
            param = {
              sshPort: self.sshPort
            }
            break;
          case 'monPort':
            param = {
              monPort: self.monPort
            }
            break;
        }
        return param;
      },

      validateAll(){
        let self = this, invalid = false;
        let props = ['sshUserName', 'sshPort', 'monPort', 'password', 'newPassword'];
        props.forEach((name) =>  self.validate(name))
         if(self.type === 'sshUserName') invalid = self.emptysshUserName;
         if(self.type === 'sshPassword') invalid = self.emptypassword || self.emptynewPassword || self.noEqual;
         if(self.type === 'sshPort') invalid = self.emptysshPort || self.invalidsshPort;
         if(self.type === 'monPort') invalid = self.emptymonPort || self.invalidmonPort;
         return invalid;
      },

      confirm(){
        let self = this;
        debugger
        if(self.validateAll()) return;
        self.dialogData.param.ok(self.createParam());
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
