<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('common.createImage')}}</span>
      <span class="create-back" @click="$router.push({name: 'vcenterimage'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到vCenter镜像列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required" v-text="$t('common.name')"></div>
        <help-trigger name="image"/>
        <input v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required" v-text="$t('common.imageType')"></div>
        <el-radio-group v-model="isSystem">
          <el-radio :label="true">{{$t('image.systemImage')}}</el-radio>
          <el-radio :label="false">{{$t('image.volumeImage')}}</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row" v-if="isSystem">
        <div class="title">{{$t('common.platform')}}</div>
        <help-trigger name="platform"/>
        <el-select v-model="platform" style="width: 100%">
          <el-option value="Linux" :label="'Linux'"></el-option>
          <el-option value="Windows" :label="'Windows'"></el-option>
          <el-option value="Other" :label="'Other'"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required" v-text="$t('common.backupstorage')"></div>
        <add-or-delete-input @open="openBSDlg" :value="dbData.backupstorage[backupStorageUuid]
                             && dbData.backupstorage[backupStorageUuid].name"
                             :class="{'is-error': emptybackupStorageUuid}"
        />
        <div class="error error-text" v-if="emptybackupStorageUuid">{{$t('error.unselected') + $t('common.backupstorage')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">URL</div>
        <input v-model="url" :class="{'is-error': emptyurl || invalidurl}" @blur="validate('url')"/>
        <help-trigger name="url_vCenterImage"/>
        <div class="error error-text" v-if="emptyurl">{{$t('error.emptyInput') + 'URL'}}</div>
        <div class="error-text error" v-if="!emptyurl && invalidurl">{{$t('error.invalid') + 'URL'}}</div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'vcenterimage'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreatevCenterImageService from './CreatevCenterImageService';

  export default {
    name: "CreatevCenterImagePage",
    mixins: [CreatevCenterImageService]
  }
</script>

<style scoped>

</style>
