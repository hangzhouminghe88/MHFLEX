<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span class="title">{{$t('common.changeResourceOwner')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div class="dialog-content">
        <el-form  :model="passwordConf" ref="modifyPsw" :rules="rules" label-width="80px">
          <el-form-item :label="$t('account.originalPassword')" prop="oldPsw" v-if="dialogData.param.accountName === 'admin' || this.dialogData.param.accountName === undefined">
            <el-input type="password" placeholder="请输入原密码" v-model="passwordConf.oldPsw"/>
          </el-form-item>
          <el-form-item :label="$t('account.newPassword')" prop="newPsw">
            <el-input type="password" placeholder="请输入新密码" v-model="passwordConf.newPsw"/>
          </el-form-item>
          <el-form-item :label="$t('account.confirmPassword')" prop="confirmPsw">
            <el-input type="password" placeholder="请确认新密码" v-model="passwordConf.confirmPsw"/>
          </el-form-item>
        </el-form>
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
  export default {
    name: "ModifyPasswordDlg",
    mixins: [WindowBase],
    data(){
      var checkNewPsw = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value === this.passwordConf.oldPsw) {
          callback(new Error('新密码不能与旧密码相同!'));
        } else {
          callback();
        }
      };
      var checkConfirmPsw = (rule, value, callback) => {
        if(value === ''){
          callback(new Error('请再次输入新密码'));
        }else if(value !== this.passwordConf.newPsw){
          callback(new Error('两次输入的密码不一致'));
        }else {
          callback();
        }
      };
      return {
        passwordConf: {
          oldPsw: '',
          newPsw: '',
          confirmPsw: ''
        },
        rules: {
          oldPsw: [
            {required: true, message: '旧密码不能为空', trigger: 'blur'},
            {min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
          ],
          newPsw: [
            {required: true, message: '新密码不能为空', trigger: 'blur'},
            { validator: checkNewPsw, trigger: 'blur' },
            {min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
          ],
          confirmPsw: [
            {required: true, message: '确认密码不能为空', trigger: 'blur'},
            {validator: checkConfirmPsw, trigger: 'blur'},
            {min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        self.$refs.modifyPsw.validate((valid) => {
          if(valid){
            let curChangeAccountName = localStorage.getItem('accountName')
            if (this.dialogData.param.accountName !== undefined && this.dialogData.param.accountName === 'admin') {
              curChangeAccountName = this.dialogData.param.accountName
              rpc.put('accounts/login', {
                logInByAccount: {
                  accountName: curChangeAccountName,
                  password: sha512(this.oldPsw).toString()
                }
              })
                .then((resp) => {
                  if (resp.success === false) return
                  this.dialogData.param.ok(this.newPsw)
                  this.closeDialog(this.windowId)
                })
            } else {
              this.dialogData.param.ok(this.newPsw)
              this.closeDialog(this.windowId)
            }
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
