<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span>{{$t('billing.detail').replace(/计费/g, '')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div class="dialog-body-content">
        <ul class="left">
          <li>
            <span class="title">{{$t('common.name')}}{{$t('common.colon')}}</span>
            <span class="content">{{dialogData.param.row.resourceName}}</span>
          </li>
          <li>
            <span class="title">{{$t('common.createDate')}}{{$t('common.colon')}}</span>
            <span class="content">{{
              dialogData.param.itemList[dialogData.param.row.resourceUuid].createDate ?
              formatDatetime(new Date(dialogData.param.itemList[dialogData.param.row.resourceUuid].createDate))
              : ''
              }}</span>
          </li>
        </ul>
        <ul class="right">
          <li>
            <span class="title">{{$t('billing.detail').replace(/详情/g, '')}}{{$t('common.colon')}}</span>
            <span class="content">{{formatCurrency(dialogData.param.row.spending)}}</span>
          </li>
          <li>
            <span class="title">{{$t('common.lastOpDate')}}{{$t('common.colon')}}</span>
            <span class="content">{{
              dialogData.param.itemList[dialogData.param.row.resourceUuid].lastOpDate ?
              formatDatetime(new Date(dialogData.param.itemList[dialogData.param.row.resourceUuid].lastOpDate))
              : ''
              }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <span @click="cancel()" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils'
  export default {
    name: "VMBillingDetailDlg",
    mixins: [WindowBase],
    data(){
      return {

      }
    },
    methods: {
      ...Utils,
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>
  .left{
    display: inline-block;
    width: 40%;
  }
  .right{
    display: inline-block;
    width: 49%;
  }
  li{
    height: 40px;
  }
  .title{
    margin-right: 10px;
  }
  .dialog-body-content{
    padding: 50px 70px;
  }
</style>
