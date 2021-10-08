<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('assistant.tips')}}</span>
      <span class="el-icon-close dialog-close" @click="close"></span>
    </div>
    <div slot="body">
      <div style="padding: 20px 200px 100px">
        <div>{{$t('backupData.lackZone')}}{{$t('common.colon')}}</div>
        <div class="backup-item">
          <el-radio v-model="type" label="zone">进入初始化向导</el-radio>
        </div>
        <div  class="backup-item">
          <el-radio v-model="type" label="backup">通过备份数据库还原环境</el-radio>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
    import WindowBase from 'src/windows/Window';
    export default {
      name: "ChooseWizardDlg",
      mixins: [WindowBase],
      data(){
        return {
          type: 'zone'
        }
      },
      methods: {
        close(){
          let self = this;
          self.closeDialog(self.windowId);
        },
        confirm(){
          let self = this;
          self.dialogData.param.ok(self.type);
          self.close();
        }
      }
    }
</script>

<style scoped lang="less">
  .backup-item{
    display: block;
    &:nth-child(2){
      padding: 50px 0px 0px;
    }
    &:nth-child(3){
      padding: 20px 0px 0px;
    }
  }
</style>
