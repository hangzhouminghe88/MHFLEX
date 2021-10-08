<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('resourcestack.editor')}}</span>
      <span class="zoom-in" @click="close()"></span>
    </div>
      <div slot="body">
        <div style="height: 400px; width: 100%; overflow: hidden">
          <div id="json-editor-full" class="template-editor json-editor json-editor-full"></div>
        </div>
      </div>
    <div slot="footer" class="dialog-footer" :style="_styles">
      <div v-if="dialogData.param.mode === 'modify'" class="btn-cancel cancel" @click="close">
        {{$t("common.cancel")}}
      </div>
      <div class="btn-confirm primary" @click="ok">
        {{$t("common.ok")}}
      </div>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import 'ace-builds/src-min-noconflict/ace.js'
  import 'ace-builds/src-min-noconflict/mode-json.js'
  import 'ace-builds/src-min-noconflict/theme-chrome.js'
  export default {
    name: "TemplateEditorDlg",
    mixins: [WindowBase],
    data(){
      return {
        editor: ''
      }
    },
    computed: {
      _styles(){
        let self = this;
        return {
          'padding': self.dialogData.param.mode !== 'modify' ? '10px 20px' : '0'
        }
      }
    },
    mounted(){
      let editorEle = document.querySelector('.template-editor.json-editor.json-editor-full')
      this.editor = ace.edit(editorEle)
      this.editor.session.setMode('ace/mode/json')
      this.editor.setTheme('ace/theme/chrome')
      this.editor.setShowPrintMargin(false)
      this.editor.setValue(this.dialogData.param.templateContent)
      if (this.dialogData.param.mode === 'preview') {
        this.editor.setOptions({
          readOnly: true
        })
      }
    },
    methods: {
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      ok: function () {
        let value = this.editor.getValue()
        this.dialogData.param.ok(value)
        this.close()
      }
    }
  }
</script>

<style scoped>
  #json-editor-full {
    position: relative;
    border: 1px solid lightgray;
    margin: auto;
    height: 100%;
    width: 100%;
  }

  #json-editor-full * {
    font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  }
  .zoom-in{
    position: absolute;
    right: 20px;
    display: inline-block;
    width: 30px;
    height: 30px;
    background-image: url("~assets/sys_zoom_out.svg");
    background-repeat: no-repeat;
  }
</style>
