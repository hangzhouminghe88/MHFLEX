<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{ $t("identity.VM.BOOT-ORDER.SET") }}</div>
    <div class="dialog-content">
      <label>{{ $t("identity.VM.BOOT-ORDER.SET") }}{{$t("common.colon")}}</label>
      <drop-down class="button dropdown" style="padding-left: 12px; padding-right: 8px;">
               <span slot="title">
                <span class="text">{{windowData.bootOrder[0] === 'HardDisk' ? $t('vm.HardDisk_CdRom') : $t('vm.CdRom_HardDisk')}}</span>
              </span>
        <span slot="content">
                <div class="dropdown-content">
                  <a @click="(e) => { updateWindow({ 'bootOrder': ['HardDisk', 'CdRom'], 'cdromBootOnce': false }) }" style="padding-top: 12px;">{{$t('vm.HardDisk_CdRom')}}</a>
                  <a @click="(e) => { updateWindow({ 'bootOrder': ['CdRom', 'HardDisk'] }) }">{{$t('vm.CdRom_HardDisk')}}</a>
                </div>
              </span>
      </drop-down>
    </div>
    <div class="confirm-dialog-warning">
      {{$t("account.accountWarning")}}
    </div>
    <div style="margin: 20px 100px 0px 100px" v-if="windowData.bootOrder[0] !== 'HardDisk'">
     <el-checkbox v-model="windowData.cdromBootOnce">{{$t("vm.cdRomOnce")}}</el-checkbox>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: "SetModelDlg",
    mixins: [WindowBase],
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
    created(){
      let self = this;
      self.visiabled = self.model;
      self.createdCallback();
    },
    methods: {
      createdCallback () {
        let obj = {
          cdromBootOnce: false,
          bootOrder: ['HardDisk', 'CdRom']
        }
        if (this.message.bootOrder === 'CdRom,HardDisk') {
          obj.bootOrder = ['CdRom', 'HardDisk']
        }
        if (this.message.cdromBootOnce) {
          obj.cdromBootOnce = true
        }
        return this.updateWindow(obj)
      },
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        let param = this.message;
        if (param.bootOrder !== this.windowData.bootOrder.join(',') || param.cdromBootOnce !== this.windowData.cdromBootOnce) {
          self.$emit('close', {bootOrder: this.windowData.bootOrder, cdromBootOnce: this.windowData.cdromBootOnce});
        }
        self.$emit('close');
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
