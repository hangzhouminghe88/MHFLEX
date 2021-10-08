<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.setConsolePassword')}}</div>
    <div class="dialog-content">
      <el-form :model="consolePasswordConf" :rules="rules" style="width: 300px;" ref="consolePasswordForm">
        <el-form-item :label="$t('account.newPassword')" prop="newPassword">
          <el-input type="password" v-model="consolePasswordConf.newPassword" :placeholder="$t('common.passwordLengthLimit')"/>
        </el-form-item>
        <el-form-item :label="$t('account.confirmPassword')" prop="confirmPassword">
          <el-input type="password" v-model="consolePasswordConf.confirmPassword" :placeholder="$t('common.passwordLengthLimit')"/>
        </el-form-item>
      </el-form>
      <el-checkbox v-model="reStartVm" v-if="state!=='Stopped'">{{$t('common.rebootInstance')}}</el-checkbox>
    </div>
    <div class="confirm-dialog-warning">
      {{$t('vm.effectAfterReboot')}}
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "setConsolePasswordDlg",
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: {}
      }
    },
    data(){
      let self = this;
      let checkIsEqual = (rule, value ,cb) => {
         if(value !== self.consolePasswordConf.newPassword){
           return cb(new Error(self.$t('account.notEqualPassword')));
         }else if(value.length< 6 && value.length > 18){
           return cb(new Error(self.$t('common.passwordLengthLimit')));
         }else{
           return cb();
         }
      };
      let checkLimitPassword = (rule, value ,cb) => {
         if(value.length< 6 || value.length > 18){
          return cb(new Error(self.$t('common.passwordLengthLimit')));
        }else{
          return cb();
        }
      };
      return {
        visiabled: false,
        consolePasswordConf: {
          newPassword: '',
          confirmPassword: ''
        },
        rules: {
          newPassword: [
            {required: true, message: '新密码不能为空', trigger: 'blur'},
            {validator: checkLimitPassword, trigger: 'blur'}
          ],
          confirmPassword: [
            {required: true, message: '请确认密码', trigger: 'blur'},
            {validator: checkIsEqual, trigger: 'blur'}
          ]
        },
        reStartVm: false,
        state: false
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      self.message.state ? self.state = self.message.state : '';
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$refs.consolePasswordForm.validate((valid) => {
          if(valid){
            self.$emit('close', {newPassword: this.consolePasswordConf.newPassword, isReboot: this.reStartVm});
          }
        })
      }
    },
    watch:{
      model(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>
  .el-form-item{
    margin-bottom:5px;
  }
  .el-form-item:last-child{
    margin-bottom: 22px;
  }
</style>
