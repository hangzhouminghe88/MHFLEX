<script>
  import 'ace-builds/src-min-noconflict/ace.js';
  import 'ace-builds/src-min-noconflict/mode-json.js';
  import 'ace-builds/src-min-noconflict/theme-chrome.js';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "ResourceStackContentService",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        dataUuid: '',
        content: '',
        currSelectTab: 'template',
        parametesPair: []
      }
    },
    created(){
      let self = this;
      self.dataUuid = self.param.uuid ? self.param.uuid : '';
      self.content = self.param.content ? self.param.content :  '';
      self.init();
    },
    mounted(){
      let ele = document.querySelector('.template-editor.json-editor.detail-resource-stack');
      this.editor = ace.edit(ele)
      this.editor.session.setMode('ace/mode/json')
      this.editor.setTheme('ace/theme/chrome')
      this.editor.setShowPrintMargin(false)
      this.editor.setValue(this.content);
      this.editor.setOptions({
        readOnly: true
      })
      this.editor.session.selection.clearSelection()
      this.editor.renderer.$cursorLayer.element.style.display = 'none'
    },
    methods: {
      changeTab(name){
        let self = this;
        if (self.currSelectTab !== name) {
            self.currSelectTab = name;
        }
      },
      init(){
        let self = this
        let uuid = self.dataUuid;
        if(!self.param.showTab) return;
        // let templateContent = self.dbData.resourceStack[uuid].templateContent
        let paramContent = self.dbData.resourceStack[uuid].paramContent
        // self.editor.setValue(templateContent)
        let parametes = JSON.parse(paramContent)
        for (let key in parametes) {
          self.parametesPair.push({
            key: key,
            value: parametes[key]
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
