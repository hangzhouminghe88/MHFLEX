<template>
  <dialog-template>
    <span slot="title" class="modal-plain-header">
       <span class="dialog-title">更换系统</span>
       <span class="el-icon-close dialog-close" @click="close()"></span>
    </span>
    <div class="dialog-body" slot="body" style="padding: 45px 170px;">
        <p class="el-message-box__status el-icon-warning notice-title">请注意，云主机更换系统后:</p>
        <p class="notice-item">1. 原系统盘会被彻底删除！请在确认更换前做好相关备份，以免丢失数据</p>
        <p class="notice-item">2. 在做跨平台的操作系统更换时，数据盘的分区格式可能会无法识别</p>
        <el-checkbox v-model="isChecked" class="notice-item">我已认真阅读并理解以上内容</el-checkbox>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm"
            :class="{'disabled': !isChecked}"
            @click="isChecked && confirm()">确定到下一步</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>
<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: 'VMChangeImageConfirmDlg',
    mixins: [WindowBase],
    data() {
      return {
        isChecked: false
      }
    },
    methods: {
      close() {
        let _this = this;
        _this.closeDialog(_this.windowId)
      },
      confirm() {
        let _this = this;
        if(_this.isChecked){
           _this.dialogData.param.ok();
           _this.close();
        }
      }
    }
  }
</script>

<style lang="less" scoped>
 .notice-item{
   line-height: 25px;
 }
 .notice-title{
   font-size: 16px!important;
   position: relative;
 }
</style>
