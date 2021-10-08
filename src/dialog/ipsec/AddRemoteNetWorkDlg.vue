<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title"></span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding: 50px 150px;">
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item :label="$t('common.peerCidr')" prop="cidr">
            <el-input v-model="form.cidr"/>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.name')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import validator from 'src/utils/validator';

  export default {
    name: "AddRemoteNetWorkDlg",

    mixins: [WindowBase],

    data() {
      let validateCidr = (rule, value, cb) => {
        if(value) {
          if(!this.isCidr(value)) {
            cb(this.$t('error.invalid') + this.$t('common.peerCidr'));
          }else{
            cb();
          }
        }
      }
      return {
        form: {
          cidr:''
        },
        rules: {
          cidr: [
            {required: true, message: this.$t('error.emptyInput') + this.$t('common.peerCidr'), trigger: 'blur'},
            {validator: validateCidr, trigger: 'blur'}
          ]
        }
      }
    },

    methods: {
      ...validator,

      close() {
        this.closeDialog(this.windowId);
      },

      confirm() {
        let self = this;
        self.$refs.form.validate((valid) => {
          if(valid) {
            self.dialogData.param.ok(self.cidr);
            self.close();
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
