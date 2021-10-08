<template>
   <dialog-template>
     <div slot="title" class="modal-plain-header">
       <span class="modal-title">{{$t('identity.VM.CONSOLE-PASSWORD.SET')}}</span>
       <span class="dialog-close el-icon-close" @click="close"></span>
     </div>

     <div slot="body">
       <div style="padding: 50px 200px">
         <el-form :rules="formItem.rules" :model="formItem.model" ref="ruleForm">
           <el-form-item :label="$t('account.newPassword') + $t('common.colon')" prop="password">
             <el-input v-model="formItem.model.password"></el-input>
           </el-form-item>
           <el-form-item :label="$t('account.confirmPassword') + $t('common.colon')" prop="confirmPassword">
             <el-input v-model="formItem.model.confirmPassword"></el-input>
           </el-form-item>
         </el-form>
         <div v-if="state!=='Stopped'">
           <el-checkbox v-model="isReboot">{{$t("common.rebootInstance")}}</el-checkbox>
         </div>
         <div class="warning">
           <div id="account-accountWarning">
             {{$t("account.accountWarning")}}
           </div>
         </div>
       </div>
     </div>

     <div slot="footer" class="dialog-footer">
       <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
       <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
     </div>
   </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';

  export default {
    name: "ModifyVmConsolePasswordConfirmDlg",
    mixins: [WindowBase],
    data(){
      let self = this;
      let validatePassword = (rule, value, callback) => {
        if(!/^[0-9a-zA-z_@#$%^&*!~|`+=)(]{6,8}$/.test(value)){
          callback(new Error('请输入6到8个字符'));
        }
        callback();
      }
      let validateConfirmPassword = (rule, value, callback) => {
        if(!/^[0-9a-zA-z_@#$%^&*!~|`+=)(]{6,8}$/.test(value)){
          callback(new Error('请输入6到8个字符'));
        }
        if(value !== self.formItem.model.password){
          callback(new Error('两次输入密码不一致'));
        }else{
          callback();
        }
      }
      return {
        formItem: {
          model: {
            password: '',
            confirmPassword: ''
          },
          rules: {
            password: [
              {trigger: 'blur', message: '请输入密码', required: true},
              {trigger: 'blur', validator: validatePassword}
            ],
            confirmPassword: [
              {trigger: 'blur', message: '请输入密码', required: true},
              {trigger: 'blur', validator: validateConfirmPassword}
            ]
          }
        },
        state: '',
        isReboot: false
      }
    },

    created(){
      let self = this;
      if(self.dialogData.param.state)
      self.state = self.dialogData.param.state;
    },

    methods: {
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        self.$refs.ruleForm.validate((valid) => {
          if(valid){
            this.dialogData.param.ok(this.password, this.isReboot)
            this.closeDialog(this.windowId)
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
