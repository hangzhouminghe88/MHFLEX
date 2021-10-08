<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('resourcestack.preview')}}</span>
      <span class="el-icon-close dialog-close" @click="close()"></span>
    </div>
    <div slot="body" class="dialog-body-container">
      <ul class="header">
        <li v-for="(key,index) in ['Step', 'Action', 'Parameter']" :class="`column${index}`">{{key}}</li>
      </ul>
      <ul class="body" v-for="(action, index) in actions" :key="index">
        <li class="column0">{{index + 1}}</li>
        <li class="column1">{{action.actionName}}</li>
        <li class="column2"><pre class="pre-content">{{JSON.stringify(action.actions, null, 4)}}</pre></li>
      </ul>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-cancel" style="margin-top: 10px;" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "PreviewResourceStackDlg",
    mixins: [WindowBase],
    created(){
      let self = this;
      self.preview()
    },
    data(){
      return {
        actions: []
      }
    },
    methods: {
      //解析预览
      preview () {
        let self = this
        let paramString = ''
        if (this.dialogData.param.templateContent) {
          paramString = `templateContent=${encodeURIComponent(this.dialogData.param.templateContent)}`
        } else if (this.dialogData.param.templateUuid) {
          paramString = `uuid=${this.dialogData.param.templateUuid}`
        }
        paramString += `&parameters=${encodeURIComponent(JSON.stringify(this.dialogData.param.parametes))}`
        rpc.query(`cloudformation/stack/preview?${paramString}`).then((resp) => {
          self.actions = resp.preview.actions
        }, (error) => {
          self.errorResp = error
        })
      },
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped lang="less">
  .header,.body {
    display: inline-block;
    border-bottom: 1px solid #dae0e6;
    width: 100%;
    font-size: 16px;
    li {
      list-style: none;
      display: inline-block;
      vertical-align: top;
      padding: 20px 0px;
    }
  }
  .body{
    &:last-child{
      border-bottom: none;
    }
  }
  .column0 {
    width: 10%;
  }

  .column1 {
    width: 44%;
  }

  .column2 {
    width: 44%;
  }
  .pre-content{
    word-break: break-word;
    white-space: pre-wrap;
  }
</style>
