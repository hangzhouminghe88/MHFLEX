<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.setConsolePassword')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding: 20px 150px;">
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item prop="newPassword"
                        :label="$t('virtualRouter.newPassword')+$t('common.colon')">
            <el-input type="password" v-model="form.newPassword" :placeholder="$t('common.passwordLengthLimit')"/>
          </el-form-item>
          <el-form-item prop="confirmPassword"
                        :label="$t('virtualRouter.confirmPassword')+$t('common.colon')">
            <el-input type="password" v-model="form.confirmPassword" :placeholder="$t('common.passwordLengthLimit')"/>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="form.isReboot">{{$t("common.rebootRouter")}}</el-checkbox>
          </el-form-item>
          <el-form-item class="error-text">
            {{$t("account.accountWarning")}}
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';

  export default {
    name: "ModifyVpcVRouterDlg",

    mixins: [WindowBase],

    data() {
      let validatePassword = (rule, value, cb) => {
        if(value){
          if(this.form.confirmPassword !== this.form.newPassword) {
            cb('两次输入密码不一致!')
          }else{
            cb();
          }
        }else {
          cb('不能为空!')
        }
      }
      return {
        rules: {
          newPassword: [
            {required: true, message: '不能为空!', trigger: 'blur'},
            {min: 6, max: 18, message: '请输入6~18位字符', trigger: 'blur'}
          ],
          confirmPassword: [
            {required: true, message: '不能为空!', trigger: 'blur'},
            {trigger: 'blur', validator: validatePassword},
            {min: 6, max: 18, message: '请输入6~18位字符', trigger: 'blur'}
          ]
        },
        form: {
          newPassword: '',
          confirmPassword: '',
          isReboot: false,
        }
      }
    },

    methods: {
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },

      confirm() {
        let self = this;
        self.$refs.form.validate((valid) => {
          if(valid) {
            self.dialogData.param.ok(self.form.newPassword, self.form.isReboot);
            self.close();
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
