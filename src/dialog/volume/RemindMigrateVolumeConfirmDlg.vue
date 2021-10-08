<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span>{{ $t("common.migration") }}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div class="dialog-body-content">
        <div class="dialog-content" style="padding: 50px 100px;">
          <i class="el-icon-warning" style="color: #e6a23c;font-size:20px;"></i>
          <span class="text">{{$t('volume.remindMigrate')}}</span>
        </div>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <span @click="confirm()" class="btn-confirm" style="margin: 13px 12px;">{{$t('common.ok')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DialogTemplate from "../DialogTemplate";
  import WindowBase from '../../windows/Window';

  export default {
    name: "RemindMigrateVolumeConfirmDlg",
    mixins: [WindowBase],
    components: {DialogTemplate},
    methods: {
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
