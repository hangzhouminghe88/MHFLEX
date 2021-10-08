<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t("vm.setVmPassword")}}</div>
    <div class="dialog-content">
      <el-form :model="vmPasswordConf" :rules="rules" ref="vmPasswordForm" style="width: 300px;">
        <el-form-item :label="$t('vm.username')" prop="account">
          <el-input type="text" v-model="vmPasswordConf.account"/>
        </el-form-item>
        <el-form-item :label="$t('common.password')" prop="password">
          <el-input type="password" v-model="vmPasswordConf.password"/>
        </el-form-item>
      </el-form>
    </div>
    <div class="confirm-dialog-warning">
      {{ $t("vm.modifyPasswordWarning") }}
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "setVmPasswordDlg",
    data(){
      return {
        visiabled: false,
        vmPasswordConf: {
          account: "",
          password:""
        },
        rules: {
          account: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ]
        }
      }
    },
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
    mounted(){
      let self = this;
      self.visiabled = self.model;
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$refs.vmPasswordForm.validate((valid) => {
          if(valid){
            self.$emit('close',{account: self.vmPasswordConf.account, password: self.vmPasswordConf.password});
          }
        })
      }
    },
    watch: {
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
    margin-bottom: 5px;
  }
  .el-form-item:last-child{
    margin-bottom: 22px;
  }
</style>
