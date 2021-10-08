<script>
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown'
  import CreateTemplate from "../../../component/CreateTemplate";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import Resource2SingleSelectList from 'src/Constants/Resource2SingleSelectList'
  import Resource2MultiSelectList from 'src/Constants/Resource2MultiSelectList'
  import FullPanelInput from 'src/component/FullPanel/PanelInput';
  import FullPanelSinglePicker from  'src/component/FullPanel/SinglePicker';
  import FullPanelMultiPicker from 'src/component/FullPanel/MultiPicker';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import 'ace-builds/src-min-noconflict/ace.js'
  import 'ace-builds/src-min-noconflict/mode-json.js'
  import 'ace-builds/src-min-noconflict/theme-chrome.js'
  import validator from 'src/utils/validator';
  import ResourceStackMethods from '../Methods';

  export default {
    name: "CreateResourceStackService",
    mixins: [WindowBase, ResourceStackMethods],
    components: {
      CreateTemplate,
      AddOrDeleteInput,
      FullPanelInput,
      FullPanelSinglePicker,
      FullPanelMultiPicker,
      'drop-down': DropDown
    },
    data() {
      return {
        step: 1,
        name: '',
        emptyname: false,
        description: '',
        timeOut: 60,
        emptytimeOut: false,
        invalidtimeOut: false,
        rollback: true,
        createMode: 'resourcestacktemplate',
        uploadFileName: '',
        uploadFileSize: '',
        templateContent: '',
        templateUuid: '',
        emptytemplateUuid: false,
        emptytemplate: false,
        emptytemplateContent : false,
        invalidfile: false,
        createTypeList: [
          {name: 'resourcestack.resourcestacktemplate', value: 'resourcestacktemplate'},
          {name: 'resourcestack.uploadFile', value: 'uploadFile'},
          {name: 'resourcestack.text', value: 'text'}
        ],
        editor: '',
        parametesValue: {},
        parametes: [],
        type: 'zstack',
        zoneUuid:'',
        emptyzoneUuid: ''
      }
    },
    //创建编辑器
    mounted() {
      let editorEle = document.querySelector('.template-editor.json-editor.create-resource-stack')
      this.editor = ace.edit(editorEle)
      this.editor.session.setMode('ace/mode/json')
      this.editor.setTheme('ace/theme/chrome')
      if (this.$route.params.isFromVisualizationeditor && this.$route.params.templateContent) {
        this.editor.setValue(this.$route.params.templateContent)
      }
      if (this.$route.params.resourceStackUuid) this.editor.setValue(this.dbData.resourceStack[this.$route.params.resourceStackUuid].templateContent)
      this.editor.setShowPrintMargin(false)
    },
    created() {
      let self = this, currZoneUuid = window.localStorage.getItem('currZoneUuid');
      self.zoneUuid  = currZoneUuid;
      if (this.$route.params.templateUuid) {
        this.templateUuid = this.$route.params.templateUuid
      }
      this.queryZone()
      let templateContent = ''
      if (this.$route.params.resourceStackUuid) {
        self.createMode = 'text'
      }
      self.updateWindow({
        zoneUuid: currZoneUuid
      })
    },
    computed: {
      getCreateMode: {
        get(){
          let self = this;
          let index =  self.createTypeList.findIndex((item) => {
            return self.createMode === item.value;
          })
          return self.$t(self.createTypeList[index].name);
        },
        set(){

        }
      }
    },
    methods: {
      ...validator,
      //查询区域
      queryZone() {
        rpc.query('zones', {
          count: true
        })
          .then((resp) => {
            if (resp.total > 1) this.isHideZone = true
            else this.isHideZone = false
          })
      },
      //上传文件
      changeFile($event) {
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
        self[`invalid${name}`] = false;
        if (name === 'timeOut') {
          if (self.isNumber(input) && Number(input) > 0) self[`invalid${name}`] = false
          else self[`invalid${name}`] = true
        }
      },
      //校验编辑模板
      validateTemplate() {
        const self = this
        let templateContent = null
        let templateUuid = null
        let isTemplateContentEmpty = false
        let isTemplateUuidEmpty = false
        if (self.createMode === 'text' && self.editor) {
          templateContent = self.editor.getValue()
          if (!templateContent) isTemplateContentEmpty = true
        } else if (self.createMode === 'uploadFile') {
          templateContent = self.templateContent
          if (!templateContent) isTemplateContentEmpty = true
        } else if (self.createMode === 'resourcestacktemplate') {
          templateUuid = self.templateUuid
          if (!templateUuid) isTemplateUuidEmpty = true
        }
          emptytemplateContent = isTemplateContentEmpty,
          emptytemplateUuid = isTemplateUuidEmpty,
          emptytemplate = self.createMode === 'resourcestacktemplate' ? isTemplateUuidEmpty : isTemplateContentEmpty
      },
      //检验
      validateStep1() {
        const self = this
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'timeOut', 'zoneUuid']
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => {
          return self[`empty${item}`] || self[`invalid${item}`];
        })
        return isInvalid;
      },
      //检验第二步
      validateStep2: function () {
        let isValid = false
        this.parametes.forEach(item => {
          item.validator.fn()
        })
        isValid = this.parametes.every(item => {
          return item.validator.result.isValid
        })
        return isValid;
      },
      //回到上一步
      prev(){
        let self = this;
        self.step = 1;
        self['parametesValue'] = null;
      },
      preview(){
        let self = this;
        let templateContent = null
        let templateUuid = null
        if (self.createMode === 'text' && self.editor) {
          templateContent = self.editor.getValue()
        } else if (self.createMode === 'uploadFile') {
          templateContent = self.templateContent
        } else if (self.createMode === 'resourcestacktemplate') {
          templateUuid = self.templateUuid
        }
        self.openDialog('PreviewResourceStackDlg', {
          templateContent: templateContent,
          templateUuid: templateUuid,
          parametes: self.parametesValue,
          ok: (resp) => {
            console.log(resp)
          }
        })
      },
      //回到第二步
      next(){
        let self = this;
        let invalid = self.validateStep1()
        if (invalid) return;
        let paramObj = ''
        let templateContent = ''
        if (self.createMode === 'text' && self.editor) {
          templateContent = self.editor.getValue()
        } else if (self.createMode === 'uploadFile') {
          templateContent = self.templateContent
        }
        if (templateContent) {
          paramObj = {
            templateContent: templateContent
          }
        } else if (this.templateUuid) {
          paramObj = {
            uuid: this.templateUuid
          }
        }
        self.checkTemplate(paramObj)
      },
      checkTemplate(paramObj){
        const self = this
        let event = self.createEvent('resourcestack.action.check', undefined, undefined, '', 'NotApiCall')
        return rpc.create(`cloudformation/stack/check`, paramObj, event).then((resp) => {
          self.parametes = self.formatParametes(resp.parameters)
          self.incEventSuccess(event);
          self.step = 2;
        }, (error) => {
          self.setEventFail(event, error.body, self)
        })
      },
      formatSinglePickerParam: function (item, listObj) {
        let self = this
        let obj = {}
        obj.validator = self.genValidator(item)
        obj.setValue = (value) => {
          self.parametesValue[item.paramName] = value
          obj.validator.fn()
        }
        let open = (listObj) => {
          let listParam = {
            ...listObj.param,
            conditions: listObj.conditions,
            select: (value) => obj.setValue(value)
          }
          let modeObj = {
            'panel': () => {
               self.openDialog(listObj.page, listParam)
            },
            'dialog': () => {
               self.openDialog(listObj.dialogName, listParam)
            }
          }
          return modeObj[listObj.mode]
        }
        let deleteResource = () => {
          self.parametesValue[item.paramName] = ''
          obj.validator.fn()
        }
        obj.open = open(listObj)
        obj.delete = deleteResource
        obj.getValue = () => {
          if (!_.isUndefined(self.parametesValue[item.paramName])) {
            let value = self.parametesValue[item.paramName]
            if (listObj.dbTable && self.dbData[listObj.dbTable][value]) {
              return self.dbData[listObj.dbTable][value].name
            }
            return value
          }
          if (item.defaultValue) {
            return item.defaultValue
          }
          return ''
        }
        return obj
      },
      formatMultiPickerParam: function (item, listObj) {
        let self = this
        let obj = {}
        obj.validator = self.genValidator(item)
        obj.setValue = (valueArr) => {
          let value = valueArr.join(',')
          if (!self.parametesValue[item.paramName]) {
            self.parametesValue[item.paramName] = value
          } else {
            self.parametesValue[item.paramName] += `,${value}`
          }
          obj.validator.fn()
        }
        let open = (listObj) => {
          let listParam = {
            ...listObj.param,
            conditions: listObj.conditions,
            select: (value) => obj.setValue(value)
          }
          let modeObj = {
            'panel': () => {
              self.openDialog(listObj.dialogName, listParam)
            },
            'dialog': () => {
              self.openDialog(listObj.dialogName, listParam)
            }
          }
          return modeObj[listObj.mode]
        }
        let deleteResource = (index) => {
          let value = self.parametesValue[item.paramName]
          let valueArr = value.split(',')
          valueArr.splice(index, 1)
          self.parametesValue[item.paramName] = valueArr.join(',')
          obj.validator.fn()
        }
        obj.open = open(listObj)
        obj.delete = deleteResource
        obj.getValue = () => {
          if (!_.isUndefined(self.parametesValue[item.paramName])) {
            if (self.parametesValue[item.paramName] === '') return []
            let values = self.parametesValue[item.paramName].split(',')
            let names = values.map(it => {
              if (listObj.dbTable && self.dbData[listObj.dbTable][it]) {
                return self.dbData[listObj.dbTable][it].name
              }
              return it
            })
            return names
          }
          if (item.defaultValue) {
            return item.defaultValue.split(',')
          }
          return []
        }
        return obj
      },
      formatParametes: function (parametes) {
        let self = this
        let list = []
        self.parametesValue = {}
        parametes.forEach(function (item) {
          ((item) => {
            if (item.defaultValue) {
              let value = self.formatValue(item.defaultValue, item.type)
              self.$set(self.parametesValue, item.paramName, value)
            } else {
              self.$set(self.parametesValue, item.paramName, '')
            }

            let obj = {}
            let type = item.type
            let resourceType = item.resourceType
            let listObj = null
            if (type === 'CommaDelimitedList') {
              listObj = Resource2MultiSelectList[resourceType]
            } else {
              listObj = Resource2SingleSelectList[resourceType]
            }

            if (!listObj || !listObj.mode || listObj.mode === 'none') {
              obj = self.formatInputParam(item)
            } else if (type === 'CommaDelimitedList') {
              obj = self.formatMultiPickerParam(item, listObj)
            } else {
              obj = self.formatSinglePickerParam(item, listObj)
            }

            obj.getCtrl = () => {
              if (!listObj || !listObj.mode || listObj.mode === 'none') {
                return FullPanelInput
              } else if (type === 'CommaDelimitedList') {
                return FullPanelMultiPicker
              } else {
                return FullPanelSinglePicker
              }
            }
            obj.getTitle = () => {
              if (item.label) {
                return item.label
              }
              if (item.paramName) {
                return item.paramName
              }
              return ''
            }
            obj.getPlaceholder = () => {
              if (item.description) {
                return item.description
              }
              return ''
            }
            obj.getEleTitle = () => {
              if (item.description) {
                return item.description
              }
              return ''
            }
            obj.canShowStar = () => {
              if (item.defaultValue) {
                return false
              }
              return true
            }
            list.push(obj)
          })(item)
        })
        return list
      },
      genValidator: function (item) {
        let self = this
        let result = {
          ignorDirty: false,
          isValid: true
        }
        let fn = () => {
          let value = self['parametesValue'][item.paramName]

          let isValidObj = {
            isValid: true,
            msg: self.$t('error.noEmpty')
          }
          if (!item.defaultValue) {
            isValidObj = {
              isValid: !(_.isUndefined(value) || _.isNull(value) || value === ''),
              msg: self.$t('error.noEmpty')
            }
          }
          if (value !== '') {
            switch (item.type) {
              case 'Number':
                isValidObj = {
                  isValid: self.isNumber(value),
                  msg: self.$t('error.errorType')
                }
                break
              case 'Boolean':
                isValidObj = {
                  isValid: _.isBoolean(value),
                  msg: self.$t('error.errorType')
                }
                break
              // case 'CommaDelimitedList':
              //   isValidObj = {
              //     isValid: value && value.indexOf(',') > -1,
              //     msg: self.$t('error.errorType')
              //   }
              //   break
            }
          }

          result.isValid = isValidObj.isValid
          if (!result.isValid) {
            result.msg = isValidObj.msg
          }
        }
        return {
          result,
          fn
        }
      },
      formatValue: function (value, type) {
        let _value = value
        if (type === 'Number') {
          _value = _.isNaN(Number(value)) ? value : Number(value)
        }
        if (type === 'Boolean') {
          _value = value
          if (value === 'true')_value = true
          if (value === 'false') _value = false
        }
        if (type === 'CommaDelimitedList') {
          if (value[0] === '[' && value[value.length - 1] === ']') {
            _value = value.slice(1, -1)
          }
        }
        return _value
      },
      formatInputParam: function (item) {
        let self = this
        let obj = {}
        obj.getValue = () => {
          if (!_.isUndefined(self.parametesValue[item.paramName])) {
            return self.parametesValue[item.paramName]
          }
          if (item.defaultValue) {
            return item.defaultValue
          }
          return ''
        }
        obj.setValue = (value) => {
          let _value = self.formatValue(value, item.type)
          self.parametesValue[item.paramName] = _value
        }
        obj.validator = self.genValidator(item)
        return obj
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
      //创建模板参数
      createParam () {
        const self = this
        let templateContent = null
        let templateUuid = null
        if (self.createMode === 'text' && self.editor) {
          templateContent = self.editor.getValue()
        } else if (self.createMode === 'uploadFile') {
          templateContent = self.templateContent
        } else if (self.createMode === 'resourcestacktemplate') {
          templateUuid = self.templateUuid
        }
        return {
          name: self.name,
          description: self.description || undefined,
          zoneUuid: self.zoneUuid,
          type: self.type,
          rollback: self.rollback,
          templateContent: templateContent,
          templateUuid: templateUuid,
          parameters: JSON.stringify(self.parametesValue),
          timeout: Math.round(self.timeout * 60000)
        }
      },
      confirm(){
        let self = this;
        self.create(self.createParam())
          .then(() => self.$router.push({name: 'resourcestack'}));
      },
      openResourceStackTemplate(){
        let self = this;
        self.openDialog('ResourceStackTemplateSingleSelect',{
          conditions: [],
          select: (uuid) => self.selectResourceStackTemplate(uuid)
        })
      },
      selectResourceStackTemplate(uuid){
        let self = this;
        self.templateUuid = uuid;
        self.validate('templateUuid');
      },
      removeUuid(param){
        let self = this;
        self[param] = "";
        self.validate('templateUuid');
      }
    }
  }
</script>
