<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('resourcestacktemplate.create')}}</span>
      <span class="create-back el-icon-back" @click="$router.push({name: 'resourcestacktemplate'})">
        回到资源栈模板列表
      </span>
    </div>
    <div slot="body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error-text error" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('')}}</div>
        <el-radio v-model="createMode" label="text">文本</el-radio>
        <el-radio v-model="createMode" label="uploadFile">上传文本</el-radio>
      </div>
      <div class="operation-row" v-show="createMode=== 'text'">
        <div class="title required">{{$t('resourcestack.resourcestacktemplate')}}<span class="zoom-in" @click="openResourcePanel"></span></div>
        <div id="resource-stack-template-editor" class="template-editor json-editor create-resource-stack-template"></div>
        <div class="error error-text" v-if="emptytemplateContent || emptytemplate">
          {{$t('error.emptyInput')+$t('resourcestacktemplate.resourcestacktemplate')}}
        </div>
      </div>
      <div class="operation-row" v-if="createMode === 'uploadFile'">
        <div class="title required">{{$t('resourcestack.resourcestacktemplate')}}</div>
        <div class="upload-content" :class="{'is-error': invalidfile}">
          <input type="file" @change.stop="changeFile"/>
          <i class="el-icon-upload icon-content" v-if="uploadFileName === '' || invalidfile"></i>
          <i class="el-icon-success icon-content" style="color: #409EFF" v-if="uploadFileName !== '' && !invalidfile"></i>
          <span style="font-size: 12px;">{{uploadFileName === '' || invalidfile ? $t("about.loadLicense") : uploadFileName }}</span>
        </div>
        <div class="error error-text" v-if="invalidfile">{{$t('error.invalid')}}{{$t('resourcestack.resourcestacktemplate')}}</div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'resourcestacktemplate'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateResourceTemplateService from './CreateResourceTemplateService';
  export default {
    name: "CreateResourceTemplatePage",
    mixins: [CreateResourceTemplateService]
  }
</script>

<style scoped lang="less">
  .zoom-in{
    position: absolute;
    right: 0;
    display: inline-block;
    width: 30px;
    height: 30px;
    background-image: url("~assets/sys_zoom_in.svg");
    background-repeat: no-repeat;
  }
  #resource-stack-template-editor {
    position: relative;
    border: 1px solid lightgray;
    margin: auto;
    height: 400px;
    width: 100%;
  }

  #resource-stack-template-editor * {
    font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  }
  .upload-content{
    display: inline-block;
    width: 100%;
    height: 85px;
    border: 1px dashed #adb0b8;
    position: relative;
    text-align: center;
  input[type='file']{
    opacity: 0;
    display: inline-block;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: 10;
  }
  .icon{
    display: inline-block;
    position: absolute;
    top: 0px;
  }
  .icon-content{
    margin-top: 15px;
    font-size: 50px;
    display: inline-block;
    width: 100%;
  }
  }
</style>
