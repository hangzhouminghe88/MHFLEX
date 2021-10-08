<template>
  <create-template>
    <div slot="header" class="create-header">
      <span style="position: relative;">
        {{$t('resourcestack.create')}}
        <help-trigger name="createResourceStack" :style="{top: '0px', right: '-17px'}"/>
      </span>
      <span class="create-back" @click="$router.push({name: 'resourcestack'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到资源栈列表</span>
      </span>
    </div>
    <div slot="body" class="create-body" v-show="step ===1 ">
      <div class="operation-row">
        <div class="sole-title">
          {{ $t("common.zone") }}{{$t("common.colon")}}
        </div>
        <div class="sole-content">
          {{ dbData.zone[windowData.zoneUuid] && dbData.zone[windowData.zoneUuid].name }}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <input v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('resourcestack.timeoutSet')}}</div>
        <input v-model="timeOut" style="width: 62%" :class="{'is-error': emptytimeOut || invalidtimeOut}" @blur="validate('timeOut')"/><span class="timeout-unit">分</span>
        <div class="error error-text" v-if="emptytimeOut && !invalidtimeOut">{{$t('resourcestack.timeoutSet')}}{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="invalidtimeOut && !emptytimeOut">{{$t('error.invalid')}}{{$t('resourcestack.timeoutSet')}}</div>
      </div>
      <div class="operation-row">
        <el-checkbox v-model="rollback">{{$t('resourcestack.rollback')}}</el-checkbox>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('resourcestack.createMode')}}</div>
        <el-select v-model="getCreateMode" style="width: 100%;">
          <el-option v-for="(item, index) in createTypeList"
                     :key="index"
                     :value="item.value"
                     :label="$t(createTypeList[index].name)"
                     @click.native="createMode = createTypeList[index].value"></el-option>
        </el-select>
      </div>
      <div class="operation-row" v-if="createMode === 'resourcestacktemplate'">
        <div class="title required">{{$t('resourcestack.resourcestacktemplate')}}</div>
        <add-or-delete-input :class="{'is-error': emptytemplateUuid}"
                             :value="dbData.resourceStackTemplate[templateUuid] && dbData.resourceStackTemplate[templateUuid].name"
                              @open="openResourceStackTemplate()" @remove="removeUuid('templateUuid')"/>
        <div class="error error-text" v-if="emptytemplateUuid">{{$t('resourcestack.resourcestacktemplate')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-show="createMode === 'uploadFile'">
        <div class="title required">{{$t('resourcestack.resourcestacktemplate')}}</div>
        <div class="upload-content" :class="{'is-error': invalidfile}">
          <input type="file" @change.stop="changeFile"/>
          <i class="el-icon-upload icon-content" v-if="uploadFileName === '' || invalidfile"></i>
          <i class="el-icon-success icon-content" style="color: #409EFF" v-if="uploadFileName !== '' && !invalidfile"></i>
          <span style="font-size: 12px;">{{uploadFileName === '' ||invalidfile ? $t("about.loadLicense") : uploadFileName }}</span>
        </div>
        <div class="error error-text" v-if="invalidfile">{{$t('error.invalid')}}{{$t('resourcestack.resourcestacktemplate')}}</div>
      </div>
      <div class="operation-row" v-show=" createMode === 'text'">
        <div class="title required">{{$t('resourcestack.resourcestacktemplate')}}<span class="zoom-in" @click="openResourcePanel();"></span></div>
        <div id="json-editor" class="template-editor json-editor create-resource-stack"></div>
        <div class="error error-text" v-if="emptytemplateContent">
          {{$t('error.emptyInput')+$t('resourcestacktemplate.resourcestacktemplate')}}
        </div>
      </div>
    </div>
    <div slot="body" class="create-body" v-show="step === 2">
      <component v-for="(item, index) in parametes" :key="index" :is="item.getCtrl()" style="margin-bottom: 20px;" :param="item"></component>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" v-if="step === 1" @click="next()">{{$t('common.nextStep')}}(1/2)</span>
      <span class="btn-confirm" v-if="step === 2" @click="prev()">{{$t('common.prevStep')}}</span>
      <span class="btn-confirm" v-if="step === 2" @click="preview()">{{$t('resourcestack.preview')}}</span>
      <span class="btn-confirm" v-if="step === 2" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'resourcestack'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateResourceStackService from './CreateResourceStackService';

  export default {
    name: "CreateResourceStackPage",
    mixins: [CreateResourceStackService]
  }
</script>

<style scoped lang="less">
  .sole-title{
    display: inline-block;
    font-size: 16px;
    margin-right: 10px;
  }
  .sole-content{
    display: inline-block;
    font-size: 16px;
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
  #json-editor {
    position: relative;
    border: 1px solid lightgray;
    margin: auto;
    height: 400px;
    width: 100%;
  }

  #json-editor * {
    font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  }

  .timeout-unit{
    display: inline-block;
    width: 30%;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    margin-left: -2px;
  }
  .create-body{
    width: 300px;
  }
  .zoom-in{
    position: absolute;
    right: 0;
    display: inline-block;
    width: 30px;
    height: 30px;
    background-image: url("~assets/sys_zoom_in.svg");
    background-repeat: no-repeat;
  }
</style>
