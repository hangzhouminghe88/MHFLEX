<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{ $t("backupStorage.clear") }}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>

    <div slot="body">
      <div style="padding: 50px 150px">
        <img src="~assets/sys_about_add_success.svg" style="vertical-align: middle;">
        <span>{{ $t("backupStorage.finish", { releaseSize: getReleaseSize(), residualSize: getResidualSize() }) }}</span>
      </div>
    </div>

    <div slot="footer">
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import {bytesToSize} from "src/utils/utils";

  export default {
    name: "ClearBsMessageDlg",
    mixins: [WindowBase],
    methods: {
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      getReleaseSize: function () {
        let releaseSize = this.dialogData.param.releaseSize
        let flow = ''
        if (releaseSize / 1024 < 1024) {
          flow = (Math.round(releaseSize / 1024) > 0 ? Math.round(releaseSize / 1024) : 0) + 'KB'
        } else if (releaseSize / 1024 >= 1024 && releaseSize / 1024 / 1024 < 1024) {
          flow = (Math.round(releaseSize / 1024 / 1024) > 0 ? Math.round(releaseSize / 1024 / 1024) : 0) + 'MB'
        } else if (releaseSize / 1024 / 1024 >= 1024 && releaseSize / 1024 / 1024 / 1024 < 1024) {
          flow = (Math.round(releaseSize / 1024 / 1024 / 1024) > 0 ? Math.round(releaseSize / 1024 / 1024 / 1024) : 0) + 'GB'
        } else if (releaseSize / 1024 / 1024 / 1024 >= 1024) {
          let gbFlow = releaseSize / 1024 / 1024 / 1024 / 1024
          flow = gbFlow.toFixed(1) + 'TB'
        } else {
          flow = '0KB'
        }
        return flow
      },
      getResidualSize: function () {
        let residualSize = this.dialogData.param.residualSize
        residualSize = bytesToSize(Number(residualSize))
        return residualSize
      }
    }
  }
</script>

<style scoped>

</style>
