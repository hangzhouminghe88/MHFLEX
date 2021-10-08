<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t(`identity.VM.${message.title}`)}}</div>
    <div class="dialog-content">
      <label>{{ $t(`common.${message.label}`) }}{{$t("common.colon")}}</label>
      <drop-down class="button dropdown" style="padding-left: 12px; padding-right: 8px;">
              <span slot="title">
                <span class="text">{{value}}</span>
              </span>
        <span slot="content">
                <div class="dropdown-content">
                  <a @click="(e) => { value =  e.target.text}" style="padding-top: 12px;" v-for="(item, index) in message.value"
                  :key="index">{{item}}</a>
                </div>
              </span>
      </drop-down>
    </div>
    <div class="confirm-dialog-warning">
      <!--useb 重启后生效提示-->
      <div v-if="this.message.title==='USB-REDIRECT'">{{$t('vm.effectAfterReboot')}}</div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "SetModelDlg",
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
        value: ''
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      self.value = self.message.defaultVal;
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close', {uuidList: self.message.uuidList, value: self.value, type: self.message.title});
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

<style scoped lang="less">
  .dropdown{
    width: 50%;
    border: 1px solid #dae0e6;
    display: inline-block;
    height: 40px;
    border-radius: 2px;
    .dropdown-content{
      width: 100%;
    }
  }
</style>
