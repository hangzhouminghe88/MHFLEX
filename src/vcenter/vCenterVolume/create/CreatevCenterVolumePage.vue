<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('common.createVolume')}}</span>
      <span class="create-back" @click="$router.push({name: 'vcentervolume'})">
        <i class="el-icon-back"></i>
        <span style="font-size:12px;">回到vCenter云盘列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="volume"/>
        <input v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('volume.createMethod')}}</div>
        <el-radio-group v-model="createMethods" @change="handleCreateMethodsChange">
          <el-radio :label="true">{{$t('common.volumeoffering')}}</el-radio>
          <el-radio :label="false">{{$t('image.volumeImage')}}</el-radio>
        </el-radio-group>
        <add-or-delete-input v-if="createMethods" @open="openVolumeOfferingSelect"
          :value="dbData.volumeoffering[volumeOfferingUuid] && dbData.volumeoffering[volumeOfferingUuid].name"
          @remove="removeUuid('volumeOfferingUuid')"
          :class="{'is-error': emptyvolumeOfferingUuid}"
        />
        <div class="error error-text" v-if="createMethods && emptyvolumeOfferingUuid">{{$t('error.unselected') + $t('common.volumeoffering')}}</div>
        <add-or-delete-input v-if="!createMethods" @open="openVolumeImageSelect"
          :value="dbData.image[imageUuid] && dbData.image[imageUuid].name"
          @remove="removeUuid('imageUuid')"
          :class="{'is-error': emptyimageUuid}"
        />
        <div class="error error-text" v-if="!createMethods && emptyimageUuid">{{$t('error.unselected') + $t('image.volumeImage')}}</div>
      </div>
      <div class="operation-row" v-if="createMethods && dbData.common.isAdmin && !$route.params.primaryStorageUuid">
        <div class="title">{{$t('common.primarystorage')}}</div>
        <add-or-delete-input @open="openPrimaryStorageSelect"
          :value="dbData.primarystorage[primaryStorageUuid] && dbData.primarystorage[primaryStorageUuid].name"
          @remove="removeUuid('primaryStorageUuid')"
          :class="{'is-error': emptyprimaryStorageUuid}"
        />
        <div class="error error-text" v-if="emptyprimaryStorageUuid">{{$t('error.unselected') + $t('common.primarystorage')}}</div>
      </div>
      <div class="operation-row" v-if="dbData.common.isAdmin && $route.params.primaryStorageUuid">
        <div class="title">
          {{$t("common.primaryStorage")}}{{$t("common.colon")}}
          {{ dbData.primarystorage[primaryStorageUuid] && dbData.primarystorage[primaryStorageUuid].name }}
        </div>
      </div>
      <div class="operation-row" v-if="primaryStorageUuid && dbData.primarystorage[primaryStorageUuid].type === 'Ceph'">
        <div class="title">{{$t("common.cephPool")}}</div>
        <add-or-delete-input @open="openPrimaryStoragePoolDlg()"
          :value="dbData.pool[poolUuid] && dbData.pool[poolUuid].poolName "
          @remove="removeUuid('poolUuid')"
        />
      </div>
      <div class="operation-row" v-if="showHost()">
        <div class="title required">
          {{$t("common.host")}}
        </div>
        <add-or-delete-input @open="openHostDlg()"
          :value="dbData.host[hostUuid] && dbData.host[hostUuid].name"
          @remove="removeUuid('hostUuid')"
          :class="{'is-error': emptyhostUuid}"
        />
        <div class="error error-text" v-if="emptyhostUuid">{{$t('error.unselected') + $t('common.host')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.vm')}}</div>
        <add-or-delete-input @open="openVmDlg()"
          :value="dbData.vm[vmInstanceUuid] && dbData.vm[vmInstanceUuid].name"
          @remove="removeUuid('vmInstanceUuid')"
          :class="{'is-error':  emptyvmInstanceUuid}"
        />
        <div class="error error-text" v-if="emptyvmInstanceUuid">{{$t('error.unselected') + $t('common.vm')}}</div>
      </div>
      <div class="operation-row" v-if="dbData.common.isAdmin && !createMethods && !$route.params.primaryStorageUuid">
        <el-checkbox v-model="showPrimaryStorageOption">{{$t('volume.specifyPs')}}</el-checkbox>
      </div>
      <div class="operation-row" v-if="dbData.common.isAdmin && !createMethods && !$route.params.primaryStorageUuid && showPrimaryStorageOption">
        <div class="title">
          {{$t("common.primaryStorage")}}
        </div>
        <add-or-delete-input @open="openPrimaryStorageForVolumeImageDlg()"  v-if="!$route.params.primaryStorageUuid"
           :value="dbData.primarystorage[primaryStorageForVolumeImageUuid] && dbData.primarystorage[primaryStorageForVolumeImageUuid].name"
           @remove="removeUuid('primaryStorageForVolumeImageUuid')"
           :class="{'is-error': emptyprimaryStorageForVolumeImageUuid}"
        />
        <div class="error error-text" v-if="emptyprimaryStorageForVolumeImageUuid">{{$t('error.unselected') + $t('common.primaryStorage')}}</div>
        <add-or-delete-input v-if="$route.params.primaryStorageUuid"
          :value="dbData.primarystorage[$route.params.primaryStorageUuid] && dbData.primarystorage[$route.params.primaryStorageUuid].name"
        />
      </div>
      <div class="operation-row" v-if="showCephPool()">
        <div class="title">
          {{$t("common.cephPool")}}
        </div>
        <add-or-delete-input @open="openPrimaryStorageForVolumeImagePoolDlg" :value="dbData.pool[poolUuidForVolumeImageUuid] && dbData.pool[poolUuidForVolumeImageUuid].poolName"/>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'vcentervolume'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreatevCenterVolumePageService from './CreatevCenterVolumePageService';
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  export default {
    name: "CreatevCenterVolumePage",
    components: {AddOrDeleteInput},
    mixins: [CreatevCenterVolumePageService]
  }
</script>

<style scoped>

</style>
