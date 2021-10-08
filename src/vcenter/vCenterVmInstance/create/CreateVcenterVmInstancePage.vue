<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('vm.create')}}</span>
      <span class="create-back" @click="$router.push({name:'vcentervminstance'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到vCenter云主机列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">

      <div class="" v-if="step ===0">
        <div class="operation-row">
          <div class="title required">{{$t('vm.addType')}}</div>
          <el-radio-group v-model="isSingle">
            <el-radio :label="true">{{$t('common.single')}}</el-radio>
            <el-radio :label="false">{{$t('common.multiple')}}</el-radio>
          </el-radio-group>
        </div>
        <div class="operation-row" v-if="!isSingle">
          <div class="title required" v-text="$t('vm.createCount')"></div>
          <input v-model="vmNumber" type="number" @blur="validate('vmNumber')" :class="{'is-error': emptyvmNumber}"/>
          <div class="error error-text" v-if="emptyvmNumber">{{$t('error.emptyInput') + $t('vm.createCount')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required" v-text="$t('common.vmName')"></div>
          <input v-model="name" type="text" @blur="validate('name')" v-bind:class="{'is-error': emptyname}"/>
          <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.vmName')}}</div>
        </div>
        <div class="operation-row">
          <div class="title" v-text="$t('ticket.vmDescription')"></div>
          <textarea rows="3" type="text" v-model="description"/>
        </div>
        <div class="operation-row">
          <div class="title required" v-text="$t('common.instanceOffering')"></div>
          <add-or-delete-input @open="openInstanceOfferingSelect()"
                               :value="dbData.instanceOffering[instanceOfferingUuid]
                               && dbData.instanceOffering[instanceOfferingUuid].name"
                               :class="{'is-error': emptyinstanceOfferingUuid}"
                               @remove="removeUuid('instanceOfferingUuid')"/>
          <div class="error error-text" v-if="emptyinstanceOfferingUuid">{{$t('error.emptyInput') + $t('common.instanceOffering')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required" v-text="$t('common.image')"></div>
          <add-or-delete-input @open="opeImageSelect()"
                               :value="dbData.image[imageUuid] && dbData.image[imageUuid].name"
                               :class="{'is-error': emptyimageUuid}"
                               @remove="removeUuid('instanceOfferingUuid')"/>
          <div class="error error-text" v-if="emptyimageUuid">{{$t('error.emptyInput') + $t('common.image')}}</div>
        </div>

        <div class="operation-row">
          <div class="title required" v-text="$t('common.network')"></div>
          <div v-for="(l3uuid, index) in l3NetworkUuidList">
             <span style="position: relative; top: -2px;" @click="selectDefaultNetwork($event, index, uuid)">
               <img class="radio" v-if="index === defaultL3NetworkUuidIndex" src="~assets/radio_selected.svg" />
               <img class="radio" v-if="index !== defaultL3NetworkUuidIndex" src="~assets/radio_normal.svg" />
            </span>
            <add-or-delete-input :value="dbData.l3network[l3uuid] && dbData.l3network[l3uuid].name"
                                 :key="index"
                                 @remove="deleteL3Network(index)"
                                 valueClass="value-class"
                                 />
            <div class="nic-select">
              <span v-show="index === defaultL3NetworkUuidIndex" class="item">默认网卡</span>
              <span class="item link" @click="setNic(index)">设置网卡</span>
              <add-nic-dlg v-if="showNicDlg" :model="showNicDlg" :message="nicMessage" @close="closeNicDlg"/>
            </div>
          </div>
          <add-or-delete-input @open="openL3NetWorkSelect()" :class="{'is-error': emptyl3NetworkUuidList}"/>
          <div class="error error-text" v-if="emptyl3NetworkUuidList">{{$t('error.emptyInput') + $t('common.network')}}</div>
        </div>

        <div class="operation-row" v-if="imageUuid && dbData.image[imageUuid] && dbData.image[imageUuid].mediaType === 'ISO'">
          <div class="title">{{$t('common.rootVolumeOffering')}}</div>
          <add-or-delete-input @open="openRootVolumeInstanceOfferingSelect"
                               :value="dbData.volumeoffering[rootDiskOfferingUuid]
                               && dbData.volumeoffering[rootDiskOfferingUuid].name"/>
        </div>
      </div>

      <div class="" v-if="step === 1">
        <div class="operation-row">
          <div class="title">{{$t('common.dataVolume')}}</div>
          <add-or-delete-input @open="openDataVolumeInstanceOfferingSelect"
                               :value="dbData.volumeoffering[dataVolumeOfferingUuid]
                               && dbData.volumeoffering[dataVolumeOfferingUuid].name"/>
        </div>
        <div class="operation-row" v-if="isAdmin">
          <div class="title">{{$t('common.cluster')}}</div>
          <add-or-delete-input  @open="openClusterSelect"
                                :value="dbData.cluster[clusterUuid]
                               && dbData.cluster[clusterUuid].name"/>
        </div>
        <div class="operation-row" v-if="isAdmin">
          <div class="title">{{$t('common.primaryStorage')}}</div>
          <add-or-delete-input @open="openPrimaryStorageDlg"
                               :value="dbData.primarystorage[primaryStorageUuid] &&
                               dbData.primarystorage[primaryStorageUuid].name"
          />
        </div>
        <div class="operation-row" v-if="isAdmin">
          <div class="title">{{$t('common.host')}}</div>
          <add-or-delete-input  @open="openHostSelect"
                                :value="dbData.host[hostUuid]
                               && dbData.host[hostUuid].name"/>
        </div>
      </div>
    </div>


    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-confirm" v-if="step === 0" @click="next()">{{$t('common.advancedSettings')}}</span>
      <span class="btn-confirm" v-if="step === 1" @click="prev()">{{$t('common.prevStep')}}</span>
      <span class="btn-cancel" @click="$router.push({name:'vcentervminstance'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateVCenterVmInstanceService from './CreateVCenterVmInstanceService';

  export default {
    name: "CreateVCenterVmInstancePage",
    mixins: [CreateVCenterVmInstanceService]
  }
</script>

<style scoped>
  .radio{
    position: absolute;
    top: -17px;
  }

  .item{
    display: inline-block;
    width: 49%;
  }
  .nic-select{
    display: inline-block;
    width: 100%;
    height: 16px;
  }
  .link{
    text-align: right;
  }
</style>
