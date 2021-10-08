<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <div class="modal-title">{{title}}</div>
      <div class="dialog-close el-icon-close" @click="cancel()"></div>
    </div>
    <div slot="body">
      <div class="wrapper">
        {{text}}
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok()">{{getOkText}}</span>
      <span class="btn-cancel" @click="cancel()">{{getCancelText}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: "SimpleConfirmDlg",
    mixins: [WindowBase],
    computed: {
      title () {
        if (this.dialogData.param.title) {
          return this.dialogData.param.title
        }
        return this.$t('common.confirm')
      },
      getCancelText () {
        if (this.dialogData.param.cancelText) {
          return this.dialogData.param.cancelText
        }
        return this.$t('common.cancel')
      },
      getOkText () {
        if (this.dialogData.param.okText) {
          return this.dialogData.param.okText
        }
        return this.$t('common.ok')
      },
      text(){
        return this.dialogData.param.text;
      }
    },
    methods: {
      ok(){
        let self = this;
        self.dialogData.param.ok();
        self.cancel();
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>
 .wrapper{
   margin: 0 auto;
   padding: 50px 20px;
   text-align: center;
   font-size: 16px;
 }
</style>
