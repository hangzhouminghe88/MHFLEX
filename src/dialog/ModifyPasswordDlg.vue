<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.changePassword')}}</div>
    <div :class="`${prefixCls}-content`">
      <el-form  :model="passwordConf" ref="modifyPsw" :rules="rules" label-width="80px">
        <el-form-item :label="$t('account.originalPassword')" prop="oldPsw">
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
    <div slot="footer" class="dialog-footer">
      <div class="btn-confirm" @click="confirmModifyPsw()">{{$t('common.ok')}}</div>
      <div class="btn-cancel" @click="close">{{$t('common.cancel')}}</div>
    </div>
  </el-dialog>
</template>

<script>
  const prefixCls = "modifyPwd";
  import sha512 from 'crypto-js/sha512';
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';

  export default {
    name: "ModifyPasswordDlg",
    mixins: [Root],
    props: {
      model: {
        type: Boolean,
        default: false
      }
    },
    data() {
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
        visiabled: false,
        prefixCls: prefixCls,
        passwordConf: {
          oldPsw: '',
          newPsw: '',
          confirmPsw: ''
        },
        rules: {
          oldPsw: [
            {required: true, message: '旧密码不能为空', trigger: 'blur'},
          ],
          newPsw: [
             {required: true, message: '新密码不能为空', trigger: 'blur'},
             { validator: checkNewPsw, trigger: 'blur' }
          ],
          confirmPsw: [
            {required: true, message: '确认密码不能为空', trigger: 'blur'},
            {validator: checkConfirmPsw, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      close() {
        let self = this;
        this.visiabled = false;
        this.$emit('setDisVisiable');
      },
      confirmModifyPsw() {
        let self = this;
        self.$refs.modifyPsw.validate((valid) => {
          this.callback(valid);
        })
      },
      callback(valid){
        if(valid){
          let uuid = localStorage.getItem('accountUuid')
          let event
          let p = Promise.resolve()
          if (localStorage.getItem('isUser') === 'true') {
            let userName = localStorage.getItem('userName')
             event = this.createEvent('user.action.changeUserPassword', userName)
            let userId = localStorage.getItem('userUuid')
            p = rpc.put(`accounts/users/actions`, {
              updateUser: {
                password: sha512(this.passwordConf.newPsw).toString(),
                uuid: userId
              }
            }, event)
          } else {
             event = this.createEvent('account.action.changePassword', this.dbData.identity.name)
            p = rpc.put(`accounts/${uuid}`, {
              updateAccount: {
                password: sha512(this.passwordConf.newPsw).toString()
              }
            }, event)
          }
          p.then((resp) => {
             this.incEventSuccess(event)
            if (resp.success === false) return
          }, () => {
             this.incEventFail(event)
          })
        }
        this.visiabled = false;
        this.$emit('setDisVisiable');
      }
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
    },
    watch: {
      model(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.visiabled = newVal;
        }
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
