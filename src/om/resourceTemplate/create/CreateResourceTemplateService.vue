<script>
  import CreateTemplate from "../../../component/CreateTemplate";
  import 'ace-builds/src-min-noconflict/ace.js'
  import 'ace-builds/src-min-noconflict/mode-json.js'
  import 'ace-builds/src-min-noconflict/theme-chrome.js'
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';

  export default {
    name: "CreateResourceTemplateService",
    components: {CreateTemplate},
    mixins: [Methods, WindowBase],
    data(){
      return {
        name: '',
        description: '',
        emptytemplateContent: false,
        emptyname: false,
        createMode: 'text',
        type: 'zstack',
        editor: {},
        uploadFileName:'',
        invalidfile: false,
        templateContent: '',
        uploadFileSize: '',
        emptytemplate: false
      }
    },
    mounted(){
      let self = this;
      let editEle = document.querySelector('.template-editor.json-editor.create-resource-stack-template');
      self.editor = ace.edit(editEle)
      self.editor.session.setMode('ace/mode/json')
      self.editor.setTheme('ace/theme/chrome')
      self.editor.setShowPrintMargin(false)
    },
    methods: {
      changeFile($event){
        let file = $event.target.files[0];
        if (!file) return;
        let reader = new window.FileReader();
        reader.readAsText(file);
        let self  = this;
        reader.onload  = () => {
          self.templateContent = reader.result;
          self.uploadFileName = file.name;
          self.uploadFileSize = file.size;
          self.$forceUpdate();
          this.validate('file')
          this.validateTemplate()
        }
      },
      //校验表单
      validate(name){
        let self = this, input = null;
        input = self.name === 'name' ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },
      //校验编辑模板
      validateTemplate() {
        const self = this
        let templateContent = null
        let isTemplateContentEmpty = false
        if (self.createMode === 'text' && self.editor) {
          templateContent = self.editor.getValue()
          if (!templateContent) isTemplateContentEmpty = true
        } else if (self.createMode === 'uploadFile') {
          templateContent = self.templateContent
          if (!templateContent) isTemplateContentEmpty = true
        }
        self.emptytemplate = isTemplateContentEmpty;
      },
      //整体校验
      validateAll () {
        let props = ['name']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) return true
        return false;
      },
      createParam(){
        let self = this
        let templateContent = null
        if (self.createMode === 'text' && self.editor) {
          templateContent = self.editor.getValue()
        } else if (self.createMode === 'uploadFile') {
          templateContent = self.templateContent
        }
        return {
          name: this.name,
          description: this.description === '' ? undefined : this.description,
          type: this.type,
          templateContent: templateContent
        }
      },
      confirm(){
        let self = this;
        self.validateTemplate();
        let isInvalid = self.validateAll();
        if(isInvalid) return;
        self.create(this.createParam())
          .then(() => {
            self.$router.push({name: 'resourcestacktemplate'})
          })
      },
      //打开资源文本详情
      openResourcePanel(){
        let self = this;
        self.openDialog('TemplateEditorDlg', {
          templateContent: self.editor.getValue(),
          ok: (templateContent) => {
            self.editor.setValue(templateContent)
          }
        })
      },
    }
  }
</script>

<style scoped>

</style>
