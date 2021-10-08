<template>
   <dialog-template>
     <div slot="title" class="modal-plain-header">
       <span class="modal-title">{{$t('vm.cdRom.changeDefault')}}</span>
       <span class="dialog-close el-icon-close" @click="close"></span>
     </div>

     <div slot="body" class="dialog-body">
       <div style="margin: 50px 150px;">
         {{$t('vm.cdRom.confirmToSetDefault', {name: dialogData.param.data})}}
       </div>
       <div class="warning" v-if="dialogData.param.showWarning">
         {{$t("vm.reboot_effect")}}
       </div>
     </div>

     <div slot="footer" class="dialog-footer">
       <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
       <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
     </div>
   </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';

  export default {
    name: "SetDefaultCDRomDlg",
    mixins: [WindowBase],
    methods: {
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },

      confirm(){
        let self = this;
        self.dialogData.param.ok();
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
