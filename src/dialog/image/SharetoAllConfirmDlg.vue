<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span>{{ $t(dialogData.param.title ? dialogData.param.title : '') }}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div class="dialog-body-content">
        <div class="dialog-content" style="padding: 50px 100px;">
          <i class="warning" style="color: #e6a23c;font-size:20px;"></i>
          <span class="text">{{$t(dialogData.param.warning ? dialogData.param.warning : '')}}</span>
        </div>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <span @click="confirm()" class="btn-confirm" style="margin: 13px 12px;">{{$t('common.ok')}}</span>
      <span @click="cancel()" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import DialogTemplate from "../DialogTemplate";

  export default {
    name: "SharetoAllConfirmDlg",
    components: {DialogTemplate},
    mixins: [WindowBase],
    methods: {
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        let self = this;
        self.dialogData.param.ok();
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>
  .warning{
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    padding-right: 10px;
    background-image: url('~assets/del_icon.svg');
    background-repeat: no-repeat;
  }
</style>
