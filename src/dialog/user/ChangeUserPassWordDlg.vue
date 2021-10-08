<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="title">{{$t('common.changeResourceOwner')}}</span>
      <span @click="close()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body">
      <div :class="`${prefixCls}-content`">
        <el-form :model="passwordConf" ref="modifyPsw" :rules="rules" label-width="80px">
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
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  const prefixCls = "modifyPwd";
  import WindowBase from 'src/windows/Window';
  export default {
    name: "ChangeUserPassWordDlg",
    mixins: [WindowBase],
    data(){
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
        visiabled: false,
        prefixCls: prefixCls,
        passwordConf: {
          newPsw: '',
          confirmPsw: ''
        },
        rules: {
          newPsw: [
            {required: true, message: '新密码不能为空', trigger: 'blur'},
          ],
          confirmPsw: [
            {required: true, message: '确认密码不能为空', trigger: 'blur'},
            {validator: checkConfirmPsw, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      confirm(){
        let self = this;
        self.$refs.modifyPsw.validate((valid) => {
          if(valid){
            self.dialogData.param.ok(self.passwordConf.newPsw);
            self.closeDialog(self.windowId);
          }
        })
      },
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped lang="less">
  @prefixCls: ~'modifyPwd';
  .@{prefixCls} {
    &-content {
      padding: 20px 200px;
    }
  }
</style>
