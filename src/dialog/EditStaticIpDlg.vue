<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{ $t('vm.setIp') }}</div>
    <div class="dialog-content">
      <div class="operation-row">
        <div class="title">{{$t('common.ip')}}</div>
        <input type="text" v-model="newValue" @input="(e)=>{ newValue = e.target.value}" @blur="validate()"/>
        <div class="error error-text" v-if="inValid">
          {{$t('l3network.warning.invalidIP')}}
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "EditStaticIpDlg",
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
    data() {
      return {
        visiabled: false,
        newValue: '',
        inValid: false
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      self.message.ip ?  self.newValue = self.message.ip : "";
    },
    methods: {
      confirmDlg(){
        let self = this;
        if(self.inValid) return;
        if(!self.inValid){
          self.$emit('close', {newValue: self.newValue, uuid: self.message.uuid});
        }
      },
      close(){
        let self = this;
        self.$emit('close');
      },
      validate(){
        let self = this;
       let regx= /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/;
       if(regx.test(self.newValue)){
         return self.inValid = false;
       }else{
         return self.inValid = true;
       }
      },
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

</style>
