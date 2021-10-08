<template>
  <el-dialog :visible='visiabled' @close="close()">
    <div slot="title">{{$t('vm.sshKey.add')}}</div>
    <div class="dialog-content">
      <div class="form-item">
        <label>SSH KEY:</label>
        <input type="text" placeholder="请输入SSH KEY" v-model="sshKey"/>
      </div>
    </div>
    <div class="confirm-dialog-warning">
      {{$t("vm.sshKey.warning")}}
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "SetVmSshKeyDlg",
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
      return {
        visiabled: false,
        sshKey: ''
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
    },
    methods: {
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.visiabled = false;
        self.$emit('close', {msg:this.sshKey, uuidList: this.message.uuidList});
      }
    },
    watch:{
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
