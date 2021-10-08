<template>
  <div style="width: 100%;height: 100%;background: #fff;">
    <create-template>
      <div slot="header" class="create-header">
        <span>
          {{$t('vm.create')}}
        </span>
        <span class="create-back" @click="$router.push({name: 'vm'})"><i class="el-icon-back"></i>回到云主机列表</span>
      </div>
      <div slot="body" class="create-body">

        <div v-show="step === 1">
          <el-tabs v-model="selectmultiple">
            <el-tab-pane :label="$t('common.single')" :name="$t('common.single')"></el-tab-pane>
            <el-tab-pane :label="$t('common.multiple')" :name="$t('common.multiple')"></el-tab-pane>
          </el-tabs>
          <el-form label-position="left" style="border-bottom:1px solid #ccc;" ref="basicConfig" :model="basicConfig"
                   :rules="rules">
            <el-form-item v-if="selectmultiple === $t('common.multiple')" :label="$t('vm.createCount')"
                          label-width="100px" prop="createCount">
              <el-input type="number" placeholder="请输入创建数量" style="width:300px;"
                        v-model="basicConfig.createCount"></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.name')" label-width="100px" prop="name">
              <el-input placeholder="请输入名称" style="width:300px;" v-model="basicConfig.name"/>
            </el-form-item>
            <el-form-item :label="$t('common.description')" label-width="100px" prop="description">
              <el-input type="textarea" style="width:300px;" :autosize="{ minRows: 3, maxRows: 4}"
                        v-model="basicConfig.description"/>
            </el-form-item>
          </el-form>
          <instance-offering-single-select
            @selectInstanceOffering="selectInstanceOffering" :param="windowData.instanceOfferingUuid"></instance-offering-single-select>
          <image-single-select :param="{conditions: imageConditions, withTab: true}"
                               @selectImage="selectImage"></image-single-select>
          <div
            v-if="dbData.image[windowData.imageUuid] && dbData.image[windowData.imageUuid].mediaType !== 'RootVolumeTemplate'"
            class="operation-row" style="padding-top: 0px;">
            <div class="title required">
              {{ $t("common.rootvolumeOffering") }}
            </div>
            <add-or-delete-input
              :value="dbData.volumeoffering && dbData.volumeoffering[windowData.rootDiskOfferingUuid] && dbData.volumeoffering[windowData.rootDiskOfferingUuid].name"
              @open="openRootVolumeDlg" @remove="clearRow('rootDiskOfferingUuid')"></add-or-delete-input>
            <root-volume-single-dlg v-if="showRootVolumeDlg" :model="showRootVolumeDlg" :message="rootVolumeMessage"
                                    @close="closeRootVolumeDlg"></root-volume-single-dlg>
          </div>
        </div>

        <div v-show="step === 2">
          <div class="operation-row">
            <div class="single-select-title">网络</div>
            <help-trigger name="selectNetwork"></help-trigger>
          </div>
          <div class="single-select-search">
            <el-radio-group v-model="networkType" @change="handleL3NetWorkTab">
              <el-radio-button label="IPV4"></el-radio-button>
              <el-radio-button label="IPV6"></el-radio-button>
              <el-radio-button :label="$t('common.doubleIPv4AndIPv6')"></el-radio-button>
            </el-radio-group>
            <net-work-select-list-confirm-dlg v-if="showNetWorkSelectDlg" :message="message" :model="showNetWorkSelectDlg"
                                              :ipType="networkType"
                                              @setShowFlase="setShowOrFalse">
            </net-work-select-list-confirm-dlg>
          </div>
          <div v-if="networkType === 'IPV4'">
            <div class="title"><i class="is-required">*</i>{{$t('zwatchAlarm.l3network')}}</div>
            <div class="network wrapper" v-for="uuid in windowData.networkUuidList">
              <div class="content" style="position: relative; cursor: initial;" :class="{'is-error': windowData.networkUuidList.length<=0}">
                <span style="position: relative; top: -2px;padding-left:5px;" @click="selectDefaultNetwork($event, uuid)">
                  <img class="radio" v-if="windowData.table[uuid].selected" src="~assets/radio_selected.svg"/>
                  <img class="radio" v-if="!windowData.table[uuid].selected" src="~assets/radio_normal.svg"/>
                </span>
                {{ dbData.l3network[uuid] && dbData.l3network[uuid].name }}
                <div class="delete" @click="removeNetwork($event, uuid)"></div>
              </div>
              <div class="network-config">
                <span id="vm-defaultNetwork" class="text" v-if="windowData.table[uuid].selected">{{ $t("vm.defaultNetwork") }}</span>
                <a id="vm-setVmNic" class="link" @click="openNicDlg('IPV4', uuid)">{{ $t("vm.vmNicConfig") }}</a>
              </div>
            </div>
            <div class="content" @click="openAddNetWork" :class="{'is-error': windowData.networkUuidList.length <=0 && ipv4IsValid}">
              <div class="add"></div>
            </div>
            <div v-if="windowData.networkUuidList.length <=0 && ipv4IsValid" class="error-text error">{{$t('zwatchAlarm.l3network')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div v-if="networkType === 'IPV6'">
            <div class="title"><i class="is-required">*</i>{{$t('zwatchAlarm.l3network')}}</div>
            <div class="network wrapper" v-for="uuid in windowData.ipv6NetworkUuidList">
              <div class="content" style="position: relative; cursor: initial;" :class="{'is-error': windowData.networkUuidList.length <=0 && ipv6IsValid}">
                <span style="position: relative; top: -2px;" @click="selectDefaultNetwork($event, uuid)">
                  <img class="radio" v-if="windowData.ipv6Table[uuid].selected" src="~assets/radio_selected.svg"/>
                  <img class="radio" v-if="!windowData.ipv6Table[uuid].selected" src="~assets/radio_normal.svg"/>
                </span>
                {{ dbData.l3network[uuid] && dbData.l3network[uuid].name }}
                <div class="delete" @click="removeIpv6Network($event, uuid)"></div>
              </div>
              <div class="network-config">
                <span class="text" v-if="windowData.ipv6Table[uuid].selected">{{ $t("vm.defaultNetwork") }}</span>
                <a class="link" @click="openNicDlg('IPV6', uuid)">{{ $t("vm.vmNicConfig") }}</a>
              </div>
              <div v-if="windowData.networkUuidList.length <=0 && ipv6IsValid" class="error-text error">{{$t('zwatchAlarm.l3network')}}{{$t('error.noEmpty')}}</div>
            </div>
            <div class="content" @click="openAddNetWork" :class="{'is-error': (windowData.ipv6NetworkUuidList.length <=0 ||
          windowData.networkUuidList.length <=0 )&& ipv6IsValid}">
              <div class="add"></div>
            </div>
            <div v-if="windowData.ipv6NetworkUuidList.length <=0 && ipv6IsValid" class="error-text">{{$t('zwatchAlarm.l3network')}}{{$t('error.noEmpty')}}</div>
          </div>
          <component v-if="networkType === $t('common.doubleIPv4AndIPv6')" class="item-container"
                     style="margin-top: 20px;" :param="vmNicItem.param" :is="vmNicItem.ctrl"></component>
          <add-nic-dlg v-if="showNicDlg" :model="showNicDlg" :message="addNicMessage" @close="closeNicDlg"></add-nic-dlg>
        </div>

        <div v-show="step === 3" style="width: 300px">
          <div class="operation-row">
            <div class="title">{{$t('common.dataVolumeOffering')}}</div>
            <add-or-delete-input
              :value="dbData.volumeoffering && dbData.volumeoffering[windowData.volumeOfferingUuid] && dbData.volumeoffering[windowData.volumeOfferingUuid].name"
              @open="openDataVolumeSingleSelect" @remove="clearRow('volumeOfferingUuid')"></add-or-delete-input>
            <data-volume-instance-offer-single-dlg v-if="showDataVolumeSingleDlg" :message="dataVolumeMessage"
                                                   :model="showDataVolumeSingleDlg"
                                                   @close="closeShowDataVolume"></data-volume-instance-offer-single-dlg>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.affinitygroup')}}</div>
            <add-or-delete-input
              :value="dbData.affinitygroup[windowData.affinityGroupUuid] && dbData.affinitygroup[windowData.affinityGroupUuid].name"
              @open="enableAdvanced && openAffinityGroupDlg();"
              @remove="clearRow('affinityGroupUuid')"
              :disabled="!enableAdvanced"></add-or-delete-input>
            <affinity-group-single-dlg v-if="showAffinitySingleDlg" :message="affinityMessage"
                                       :model="showAffinitySingleDlg"
                                       @close="closeShowAffinitySingleDlg"></affinity-group-single-dlg>
          </div>
          <div class="operation-row" v-show="isAdmin">
            <div id="vm-VtoPCPUBind" class="operation-row" v-show="isAdmin">
              <div class="PtoVWrap">
                <div class="title">
                  <span>{{ $t("vm.VtoPCPUBind") }}</span>
                </div>
                <help-trigger name="VtoPCPUBind"></help-trigger>
                <div class="PtoVItem" v-for="(item, index) in VtoPCPUBindItems" :key="item.id">
                  <input
                    type="text"
                    placeholder="vCPU"
                    :disabled="!canInput"
                    :class="[VtoPCPUBindItems.length === 1 ? 'PtoVleft-1' : 'PtoVleft', {'error-input': item.showErrorEmpty || item.showErrorTypeError || item.showErrorVCPUOverSize}]"
                    @blur="validateVtoPCPUBind()"
                    @input="e => {item.VCPU = e.target.value; validateVtoPCPUBind()}"
                  >
                  <span class="colon">:</span>
                  <input
                    type="text"
                    placeholder="pCPU"
                    :disabled="!canInput"
                    :class="[VtoPCPUBindItems.length === 1 ? 'PtoVright-1' : 'PtoVright', {'error-input': item.showErrorEmpty || item.showErrorTypeError || item.showErrorPCPUOverSize}]"
                    @blur="validateVtoPCPUBind()"
                    @input="e => {item.PCPU = e.target.value; validateVtoPCPUBind()}"

                  >
                  <div class="PtoVDelete">
                    <div
                      class="delete"
                      v-on:click="removePtoVCPUItem(index)"
                      v-if="VtoPCPUBindItems.length!==1"
                      style="transform: translateY(-85%)"
                    ></div>
                  </div>
                  <div id="PtoVItem-name-Empty" class="error" v-show="item.showErrorEmpty">
                    {{$t('error.showErrorEmpty')}}
                  </div>
                  <div id="PtoVItem-name-TypeError" class="error" v-show="item.showErrorTypeError">
                    {{$t('error.PtoVDataTypeError')}}
                  </div>
                  <div id="PtoVItem-name-POverSize" class="error" v-show="item.showErrorPCPUOverSize">
                    {{ $t('error.PtoVDataPCPUOverSize', {pCPUNum: maxPCpuNum-1})}}
                  </div>
                  <div id="PtoVItem-name-VOverSize" class="error" v-show="item.showErrorVCPUOverSize">
                    {{$t('error.PtoVDataVCPUOverSize', {vCPUNum: maxVCpuNum-1})}}
                  </div>
                </div>
              </div>
              <div class="addItem">
                <span v-on:click="addVtoPCPUBind" :class="{'disable': canAddMore, 'addMore': !canAddMore}">{{ $t("vm.addMoreCpuPinning") }}</span>
              </div>
            </div>
          </div>
          <div v-if="dbData.common.isAdmin">
            <div class="title">{{$t('globalConfig.cluster_name')}}</div>
            <add-or-delete-input
              :value="dbData.cluster[windowData.clusterUuid] && dbData.cluster[windowData.clusterUuid].name"
              @open="openClusterSingleSelect()" @remove="clearRow('clusterUuid')"></add-or-delete-input>
            <cluster-single-dlg v-if="showClusterSingleDlg" :message="clusterMessage" :model="showClusterSingleDlg"
                                @close="closeShowClusterSingleDlg"></cluster-single-dlg>
          </div>
          <div class="operation-row" v-if="dbData.common.isAdmin && windowData.volumeOfferingUuid">
            <div class="title">{{$t('common.dataVolumePrimaryStorage')}}</div>
            <add-or-delete-input
              :value="dbData.primarystorage[windowData.dataPrimaryStorageUuid] && dbData.primarystorage[windowData.dataPrimaryStorageUuid].name"
              :disabled="!enableAdvanced" @open="openDataVolumePrimaryStorageDlg"
              @remove="clearRow('dataPrimaryStorageUuid')"></add-or-delete-input>
            <primary-storage-single-dlg v-if="showPrimarySingleDlg && primaryType=='data'" :message="primaryMessage"
                                        :model="showPrimarySingleDlg"
                                        @close="closeShowDataPrimaryDlg"></primary-storage-single-dlg>
          </div>
          <component style="margin-top: 20px;" :is="thinProvisionItemList[2].ctrl" :param="thinProvisionItemList[2].param"
                     v-if="showThinProvisionForDataPrimaryStorage"/>
          <component v-if="showDataPoolName" style="margin-top: 20px;" :param="dataPoolNameItem.param"
                     :is="dataPoolNameItem.ctrl"/>
          <ceph-pool-single-dlg v-if="showCephPool" :model="showCephPool" :message="cephPoolMessage" @close="closeCephPoolDlg"></ceph-pool-single-dlg>
          <div class="operation-row" v-if="dbData.common.isAdmin">
            <div class="title" v-if="!windowData.volumeOfferingUuid">
              {{ $t("common.primaryStorage") }}
            </div>
            <div class="title" v-if="windowData.volumeOfferingUuid">
              {{ $t("common.rootVolumePrimaryStorage") }}
            </div>
            <add-or-delete-input
              :value="dbData.primarystorage[windowData.primaryStorageUuid] && dbData.primarystorage[windowData.primaryStorageUuid].name"
              :disabled="!enableAdvanced" @open="openPrimarySingleDlg"
              @remove="clearRow('primaryStorageUuid')"></add-or-delete-input>
            <primary-storage-single-dlg v-if="showPrimarySingleDlg &&  primaryType!=='data'" :message="primaryMessage"
                                        :model="showPrimarySingleDlg"
                                        @close="closeShowPrimaryDlg"></primary-storage-single-dlg>
          </div>
          <div class="operation-row">
            <component style="margin-top: 10px;" :is="thinProvisionItemList[0].ctrl" :param="thinProvisionItemList[0].param" v-if="showThinProvisionForPrimaryStorage" />
            <component style="margin-top: 10px;" :is="thinProvisionItemList[1].ctrl" :param="thinProvisionItemList[1].param" v-if="showThinProvisionForRootPrimaryStorage" />
            <component style="margin-top: 10px;" :is="rootPoolNameItem.ctrl" :param="rootPoolNameItem.param" v-if="showRootPoolName" />
          </div>
          <div>
            <div class="title">{{$t('zwatchAlarm.host')}}</div>
            <add-or-delete-input :value="dbData.host[windowData.hostUuid] && dbData.host[windowData.hostUuid].name"
                                 :disabled="!enableAdvanced"  @open="openHostSingleDlg" @remove="clearRow('hostUuid')"></add-or-delete-input>
            <host-single-dlg v-if="showHostSingleDlg" :message="hostMessage" :model="showHostSingleDlg"
                             @close="closeHostSingleDlg"></host-single-dlg>
          </div>
          <component :is="CDRomItem.ctrl" :param="CDRomItem.param"/>
          <div class="operation-row">
            <div class="title">{{$t('gpuDevice.gpuDevice')}}</div>
            <help-trigger name="selectNetwork"></help-trigger>
            <add-or-delete-input value="" @open="openGpuDeviceSingleDlg"></add-or-delete-input>
            <gpu-device-single-dlg v-if="showGpuSingleDlg" :model="showGpuSingleDlg"
                                   :message="gpuMessage" @close="closeGpuDeviceSingleDlg"></gpu-device-single-dlg>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.haLevel')}}</div>
            <help-trigger name="haLevel"></help-trigger>
            <el-select v-model="haLevel" style="width: 300px;">
              <el-option label="None" value="None"></el-option>
              <el-option v-if="dbData.common.haEnabled" label="NeverStop" value="NeverStop"></el-option>
            </el-select>
          </div>
          <el-form :model="windowData">
            <el-form-item :label="$t('vm.consolePassword')" style="margin-bottom:0">
              <el-input type="password" v-model="windowData.consolePassword" placeholder="长度为6~18位"/>
              <help-trigger name="consolePassword"></help-trigger>
            </el-form-item>
            <el-form-item :label="$t('vm.sshPublicKey')" style="margin-bottom:0">
              <el-input type="text" v-model="windowData.sshKey"/>
              <help-trigger name="sshKey"></help-trigger>
            </el-form-item>
            <el-form-item label="User Data" style="margin-bottom:0">
              <el-input type="textarea" v-model="windowData.userData"/>
              <help-trigger name="userData"></help-trigger>
            </el-form-item>
          </el-form>
          <div class="operation-row">
            <el-checkbox v-model="windowData.VirtioSCSI">VirtioSCSI</el-checkbox>
          </div>
          <div class="operation-row">
            <el-checkbox v-model="windowData.usbRedirect">{{$t('common.usbRedirect')}}</el-checkbox>
          </div>
          <div class="operation-row">
            <el-checkbox v-model="windowData.antiSpoofing">{{$t('common.antiSpoofing')}}</el-checkbox>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('vm.consoleMode')}}</div>
            <div>
              <el-radio v-if="!dbData.common.isOpensource" v-model="windowData.consoleMode" label="vnc">vnc</el-radio>
              <el-radio v-if="!dbData.common.isOpensource" v-model="windowData.consoleMode" label="spice">spice</el-radio>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="create-footer">
        <span v-if="step === 1" class="step-item" @click="changeStep('next')">下一步：配置网络</span>
        <span v-if="step !==1 && step !== 3" class="step-item-container">
        <span class="step-item" @click="changeStep('prev')">上一步</span>
        <span class="step-item" @click="changeStep('next')">下一步：高级设置</span>
        <span class="step-item btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && createVm()">{{$t('common.ok')}}</span>
        <span class="step-item" @click="$router.push({name: 'vm'})">{{$t('common.cancel')}}</span>
      </span>
        <span v-if="step == 3" class="step-item-container">
        <span class="step-item" @click="changeStep('prev')">上一步</span>
        <span class="step-item btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && createVm()">{{$t('common.ok')}}</span>
        <span class="step-item" @click="$router.push({name: 'vm'})">{{$t('common.cancel')}}</span>
      </span>
      </div>
    </create-template>
    <double-network-select v-if="isAddDouble" @close="closeAddDouble"
                           :param="selectedL3NetworkUuid"></double-network-select>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import uuidv4 from 'uuid/v4';
  import CreateTemplate from 'src/component/CreateTemplate';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import ImageMethods from 'src/ecs/image/List';
  import InstanceOfferingSingleSelect from "../../component/singleSelect/InstanceOfferingSingleSelect";
  import ImageSingleSelect from "../../component/singleSelect/ImageSingleSelect";
  import NetWorkSelectListConfirmDlg from "../../dialog/NetWorkSelectListConfirmDlg";
  import CreatevmAssitant from './Assistant/CreateInstanceAssistant';
  import FullPanelAddIPv6AndIPv4NetworkPicker from 'src/component/FullPanel/AddIPv6AndIPv4NetworkPicker';
  import FullPanelHelper from 'src/component/FullPanel/heplers';
  import DoubleNetworkSelect from 'src/ecs/ecsInstance/component/DoubleNetWorkSelect';
  import rpc from 'src/utils/rpc';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import DataVolumeInstanceOfferSingleDlg from "../../dialog/DataVolumeInstanceOfferSingleDlg";
  import AffinityGroupSingleDlg from "../../dialog/AffinityGroupSingleDlg";
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import PrimaryStorageSingleDlg from "../../dialog/PrimaryStorageSingleDlg";
  import HostSingleDlg from "../../dialog/HostSingleSelectDlg";
  import CDRomForCreateVmInstance from 'src/component/FullPanel/CDRomForCreateVmInstance'
  import GpuDeviceSingleDlg from "../../dialog/GpuDeviceSingleDlg";
  import RootVolumeSingleDlg from "../../dialog/RootVolumeSingleDlg";
  import vmList from 'src/ecs/ecsInstance/List';
  import Utf8Base64 from 'src/utils/utf8Base64';
  import SinglePicker from 'src/component/FullPanel/SinglePicker';
  import RadioButtonGroup from 'src/component/FullPanel/RadioButtonGroup';
  import CephPoolSingleDlg from "../../dialog/CephPoolSingleDlg";
  import AddNicDlg from "../../dialog/AddNicDlg";
  //创建ecsInstance页面
  export default {
    name: "CreateInstancePage",
    mixins: [WindowBase, Root, CreatevmAssitant, vmList],
    components: {
      AddNicDlg,
      CephPoolSingleDlg,
      RootVolumeSingleDlg,
      GpuDeviceSingleDlg,
      HostSingleDlg,
      PrimaryStorageSingleDlg,
      ClusterSingleDlg,
      AffinityGroupSingleDlg,
      DataVolumeInstanceOfferSingleDlg,
      AddOrDeleteInput,
      NetWorkSelectListConfirmDlg,
      ImageSingleSelect,
      InstanceOfferingSingleSelect,
      CreateTemplate,
      DoubleNetworkSelect
    },
    data() {
      return {
        show: true,
        isAdmin: window.localStorage.getItem('isAdmin') === 'true',
        step: 1,
        templateRadio: "",
        selectIOffing: {},
        selectmultiple: this.$t('common.single'),
        //查询image条件
        imageConditions: ['state=Enabled', 'type=zstack', 'mediaType!=DataVolumeTemplate', 'status=Ready', 'system=false', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, '__systemTag__!=remote'],
        basicConfig: {
          createCount: 1,
          name: '',
          description: '',
        },
        showAffinitySingleDlg: false,
        //创建规则
        rules: {
          createCount: [
            {required: true, message: '数量至少为1', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ]
        },
        currentImageTab: 'Legacy',
        networkType: 'IPV4',
        showNetWorkSelectDlg: false,
        networkUuidList: [],
        maxPCpuNum: 0,
        vmNicConfigList: [],
        message: {},
        isAddDouble: false,
        selectedL3NetworkUuid: [],
        dataVolumeMessage: {},
        showDataVolumeSingleDlg: false,
        affinityMessage: {},
        showClusterSingleDlg: false,
        clusterMessage: {},
        showPrimarySingleDlg: false,
        primaryMessage: {},
        showHostSingleDlg: false,
        hostMessage: {},
        showGpuSingleDlg: false,
        showRootVolumeDlg: false,
        rootVolumeMessage: {},
        showCephPool: false,
        cephPoolMessage: {},
        ipv4IsValid: false,
        ipv6IsValid:false,
        primaryType: '',
        gpuMessage: {},
        showNicDlg: false,
        addNicMessage: {},
        gpuDeviceList: [],
        maxVCpuNum: 0,
        tempConfiguredCDRom: [],
        configuredCDRom: [],
        haLevel: 'None',
        vmNicItem:
          {
            id: 'addIPv6AndIPv4',
            param: {
              getTitle: FullPanelHelper.genGetText('loadbalancer.vmNic', this),
              open: this.selectVMNicConfig,
              canShowStar: () => true,
              getValue: this.getVMNicConfigList,
              delete: this.deleteIPv6AndIPv4Config,
              getDefaultItemIndex: this.getDefaultVMNicIndex,
              setDefaultItemIndex: this.setDefaultVMNicIndex,
              validator: this.genVMNicValidator(),
              getDisabled: this.genGetDisabled('l3network'),
              doc: 'selectNetwork'
            },
            ctrl: FullPanelAddIPv6AndIPv4NetworkPicker
          },
        CDRomItem: {
          param: {
            getList: temp => temp ? this.tempConfiguredCDRom : this.configuredCDRom,
            getEnableAdvanced: () => this.enableAdvanced,
            add: (item, temp) => {
              if (temp) {
                this.tempConfiguredCDRom.push(item)
              } else {
                this.configuredCDRom.push(item)
              }
            },
            getLimit: () => this.cdromLimit,
            remove: (index, temp) => {
              if (temp) {
                this.tempConfiguredCDRom.splice(index, 1)
              } else {
                this.configuredCDRom.splice(index, 1)
              }
            },
            update: (it, index, temp) => {
              if (temp) {
                this.tempConfiguredCDRom[index] = it
              } else {
                this.configuredCDRom[index] = it
              }
            }
          },
          ctrl: CDRomForCreateVmInstance
        },
        VtoPCPUBindItems: [{
          id: uuidv4(),
          showErrorEmpty: false,
          showErrorTypeError: false,
          showErrorVCPUOverSize: false,
          showErrorPCPUOverSize: false,
          VCPU: '',
          PCPU: ''
        }],
        dataPoolName: '',
        dataPoolNameItem: {
          param: {
            getTitle: () => this.$t(`vm.dataPool`),
            getValue: () => this.dataPoolName,
            open: () => this.openCephPoolList('Data'),
            delete: () => {
              this.dataPoolName = ''
            }
          },
          ctrl: SinglePicker
        },
        rootPoolName: '',
        rootPoolNameItem: {
          param: {
            getTitle: () => this.$t(`vm.${this.windowData.volumeOfferingUuid ? 'rootPool' : 'cephPool'}`),
            getValue: () => this.rootPoolName,
            open: this.openCephPoolList,
            delete: () => {
              this.rootPoolName = ''
            }
          },
          ctrl: SinglePicker
        },
        thinProvisionItemList: [
          {
            id: 'thinProvisionForPrimaryStorage',
            param: {
              getTitle: () => {
              },
              optionList: [
                {
                  getDisplayName: () => this.$t('common.thinProvision'),
                  value: true
                },
                {
                  getDisplayName: () => this.$t('common.thickProvision'),
                  value: false
                }
              ],
              getValue: () => this.thinProvisionForPrimaryStorage,
              setValue: value => {
                this.thinProvisionForPrimaryStorage = value
              }
            },
            ctrl: RadioButtonGroup
          }, {
            id: 'thinProvisionForRootPrimaryStorage',
            param: {
              getTitle: () => {
              },
              optionList: [
                {
                  getDisplayName: () => this.$t('common.thinProvision'),
                  value: true
                },
                {
                  getDisplayName: () => this.$t('common.thickProvision'),
                  value: false
                }
              ],
              getValue: () => this.thinProvisionForRootPrimaryStorage,
              setValue: value => {
                this.thinProvisionForRootPrimaryStorage = value
              }
            },
            ctrl: RadioButtonGroup
          }, {
            id: 'thinProvisionForDataPrimaryStorage',
            param: {
              getTitle: () => {
              },
              optionList: [
                {
                  getDisplayName: () => this.$t('common.thinProvision'),
                  value: true
                },
                {
                  getDisplayName: () => this.$t('common.thickProvision'),
                  value: false
                }
              ],
              getValue: () => this.thinProvisionForDataPrimaryStorage,
              setValue: value => {
                this.thinProvisionForDataPrimaryStorage = value
              }
            },
            ctrl: RadioButtonGroup
          }
        ],
        emptyImage: false,
        emtpyinstanceOfferingUuid: false,
        canCreate: true
      }
    },
    computed: {
      //计算方法是否展示跟云盘存储
      showThinProvisionForRootPrimaryStorage () {
        let setVolumeOffering = this.windowData.volumeOfferingUuid
        if (!setVolumeOffering) return false
        let rootPrimaryStorage = _.get(this.dbData, `primarystorage[${this.windowData.primaryStorageUuid}]`)
        if (!rootPrimaryStorage) return false
        return rootPrimaryStorage.type === 'SharedBlock'
      },
      //是否展示数据池
      showDataPoolName () {
        let setVolumeOffering = this.windowData.volumeOfferingUuid
        if (!setVolumeOffering) return false
        let dataPrimaryStorageUuid = this.windowData.dataPrimaryStorageUuid
        if (!dataPrimaryStorageUuid) return false
        let dataPrimaryStorage = this.dbData.primarystorage[dataPrimaryStorageUuid]
        if (!dataPrimaryStorage) return false
        return dataPrimaryStorage.type === 'Ceph'
      },
      //是否展示根云盘规格
      showRootPoolName () {
        let rootPrimaryStorage = _.get(this.dbData, `primarystorage[${this.windowData.primaryStorageUuid}]`)
        if (!rootPrimaryStorage) return false
        return rootPrimaryStorage.type === 'Ceph'
      },
      //是否展示主存储
      showThinProvisionForPrimaryStorage () {
        let setVolumeOffering = this.windowData.volumeOfferingUuid
        if (setVolumeOffering) return false
        let primaryStorage = _.get(this.dbData, `primarystorage[${this.windowData.primaryStorageUuid}]`)
        if (!primaryStorage) return false
        return primaryStorage.type === 'SharedBlock'
      },
      //是否可以输入
      canInput: function () {
        return !(this.maxVCpuNum === 0 || this.maxPCpuNum === 0)
      },
      //选择网络
      selectedNetworkUuidList() {
        if (this.networkType === this.$t('common.doubleIPv4AndIPv6')) {
          return this.vmNicConfigList.map((item) => item.ipv4NetworkUuid).concat(this.vmNicConfigList.map((item) => item.ipv6NetworkUuid))
        } else if (this.networkType === 'IPV6') return this.windowData.ipv6NetworkUuidList
        else if (this.networkType === 'IPV4') return this.windowData.networkUuidList
      },
      //可用网络列表
      availabelNetworkList() {
        let networkUuidList = []
        let self = this
        if (self.networkType === 'IPV4') networkUuidList = self.windowData.networkUuidList
        else if (self.networkType === 'IPV6') networkUuidList = self.windowData.ipv6NetworkUuidList
        else if (self.networkType === this.$t('common.doubleIPv4AndIPv6')) networkUuidList = self.vmNicConfigList.map((item) => item.ipv4NetworkUuid).concat(self.vmNicConfigList.map((item) => item.ipv6NetworkUuid))
        return networkUuidList
      },
      //高级
      enableAdvanced: function () {
        if (this.windowData.imageUuid) {
          if (this.dbData.image[this.windowData.imageUuid].mediaType !== 'RootVolumeTemplate') {
            return !!this.windowData.instanceOfferingUuid &&
              !!this.windowData.imageUuid &&
              !!this.windowData.rootDiskOfferingUuid &&
              this.selectedNetworkUuidList.length > 0
          } else {
            return !!this.windowData.instanceOfferingUuid &&
              !!this.windowData.imageUuid &&
              this.selectedNetworkUuidList.length > 0
          }
        } else return false
      },
      showThinProvisionForDataPrimaryStorage () {
        let setVolumeOffering = this.windowData.volumeOfferingUuid
        if (!setVolumeOffering) return false
        let dataPrimaryStorageUuid = this.windowData.dataPrimaryStorageUuid
        if (!dataPrimaryStorageUuid) return false
        let dataPrimaryStorage = this.dbData.primarystorage[dataPrimaryStorageUuid]
        if (!dataPrimaryStorage) return false
        return dataPrimaryStorage.type === 'SharedBlock'
      },
      //是否可以添加多个
      canAddMore: function () {
        return this.VtoPCPUBindItems.some(item => {
          return (item.PCPU === '' || item.VCPU === '')
        })
      },
    },
    created() {
      let self = this;
      self.updateWindow({
        networkUuidList: [],
        clusterUuid: '',
        primaryStorageUuid: '',
        hostUuid: '',
        ipv6NetworkUuidList: [],
        rootDiskOfferingUuid: '',
        instanceOfferingUuid: '',
        imageUuid: '',
        primaryStorageUuidList: [],
        antiSpoofing: false,
        usbRedirect: false,
        consoleMode: 'vnc',
        vmNicMAC: {},
        sshKey: '',
        userData: '',
        volumeOfferingUuid: '',
        consolePassword: '',
        VirtioSCSI: true,
        staticIp:{}
      }).then(() => {
        self.ParamConfig();
        self.getCdromConfig();
        self.getGlobalConfigAntiSpoofingStatus();
      })
    },
    methods: {
      ...Utils,
      ...{
        ImageQueryList: ImageMethods.methods.queryList
      },
      getCdromConfig() {
        let conditions = ['category=vm', 'name?=maximumCdRomNum,vmDefaultCdRomNum']
        return rpc.query('global-configurations', {q: conditions}).then(resp => {
          resp.inventories.forEach(item => {
            if (item.name === 'maximumCdRomNum') this.cdromLimit = item.value
            if (item.name === 'vmDefaultCdRomNum') {
              let defaultLen = item.value
              let tempLen = this.tempConfiguredCDRom.length
              let lenDifference = defaultLen - tempLen
              while (lenDifference-- > 0) {
                this.tempConfiguredCDRom.push({cdRom: `CDROM-${++tempLen}`})
              }
            }
          })
        })
      },
      queryConsoleMode: function () {
        return rpc.query('global-configurations', {
          q: ['name=vm.consoleMode', 'category=mevoco'],
          replyWithCount: true
        }).then(resp => {
          if (resp.total === 0) return
          let consoleMode = resp.inventories[0].value
          this.updateWindow({consoleMode})
        })
      },
      getGlobalConfigAntiSpoofingStatus: function () {
        return rpc.query('global-configurations', {
          q: ['category=vm', 'name=cleanTraffic']
        }).then((resp) => {
          let result = resp.inventories[0]
          let value = result.value === 'true'
          this.updateWindow({
            antiSpoofing: value
          })
        })
      },
      closeShowClusterSingleDlg(val) {
        let self = this;
        if (val) {
          this.selectCluster(val);
        }
        self.showClusterSingleDlg = false;
      },
      closeShowAffinitySingleDlg(val) {
        let self = this;
        if (val) {
          self.selectAffinityGroup(val);
        }
        self.showAffinitySingleDlg = false;
      },
      closeShowPrimaryDlg(val) {
        let self = this;
        if (val) {
          self.selectPrimaryStorage(val)
          let psType = self.windowData.volumeOfferingUuid ? 'RootPrimaryStorage' : 'PrimaryStorage'
          self.initThinProvisionByPrimaryStorage(val, psType)
        }
        self.showPrimarySingleDlg = false;
      },
      closeNicDlg(vmNicConfig){
        if(vmNicConfig){
          let self = this;
          let obj = {}
          obj.staticIp = _.cloneDeep(self.windowData.staticIp)
          obj.staticIp[vmNicConfig.uuid] = vmNicConfig.staticIp
          obj.vmNicMAC = _.cloneDeep(self.windowData.vmNicMAC)
          obj.vmNicMAC[vmNicConfig.uuid] = vmNicConfig.mac
          self.updateWindow(obj)
          self.showNicDlg = false;
        }
        this.showNicDlg = false;
      },
      closeShowDataPrimaryDlg(val) {
        let self = this;
        if (val) {
          self.selectDataPrimaryStorage(val)
          self.initThinProvisionByPrimaryStorage(val, 'DataPrimaryStorage')
        }
        self.showPrimarySingleDlg = false;
      },
      openGpuDeviceSingleDlg() {
        let self = this;
        let conditions = {}
        if (this.gpuDeviceList.length > 0) {
          let hostUuid = this.dbData.pcidevice[this.gpuDeviceList[0].uuid].hostUuid
          conditions.hostUuid = hostUuid
        } else if (this.windowData.hostUuid) {
          conditions.hostUuid = this.windowData.hostUuid
        } else if (this.windowData.clusterUuid) {
          conditions.clusterUuids = this.windowData.clusterUuid
        } else if (this.windowData.clusterUuidList.length > 0) {
          conditions.clusterUuids = this.windowData.clusterUuidList
        }
        let selectedUuids = []
        this.gpuDeviceList.forEach(gpu => {
          selectedUuids.push(gpu.uuid)
          if (gpu.audioUuid) {
            selectedUuids.push(gpu.audioUuid)
          }
        })
        self.gpuMessage.conditions = conditions;
        self.gpuMessage.selectedUuids = selectedUuids;
        // this.openSidePanel('windows/VmInstance/dialogs/GpuDeviceSingleSelectList', {
        //   conditions,
        //   selectedUuids,
        //   select: this.selectGpuDevice
        // })
        self.showGpuSingleDlg = true;
      },
      openRootVolumeDlg() {
        let self = this;
        self.rootVolumeMessage = {
          conditions: ['state=Enabled'],
          isRootVolumeOfferingSelect: 'isRootVolumeOfferingSelect'
        }
        self.showRootVolumeDlg = true;
      },
      closeGpuDeviceSingleDlg(val) {
        let self = this;
        if (val) {
          self.selectGpuDevice(val);
        }
        self.showGpuSingleDlg = false;
      },
      closeRootVolumeDlg(val) {
        let self = this;
        if (val) {
          self.selectrootVolumeOffering(val);
        }
        self.showRootVolumeDlg = false;
      },

      selectrootVolumeOffering: function (uuid) {
        this.updateWindow({rootDiskOfferingUuid: uuid})
      },
      openPrimarySingleDlg() {
        let self = this;
        let primaryStorageUuidList = []
        let clusterPrimaryStorageUuidList = []
        let tasks = []
        let p = null
        if (!self.windowData.imageUuid || self.selectedNetworkUuidList.length <= 0) return
        let candidatePrimaryStorageParams = {}
        candidatePrimaryStorageParams.imageUuid = self.windowData.imageUuid
        candidatePrimaryStorageParams.l3NetworkUuids = self.selectedNetworkUuidList
        if (self.dbData.image[self.windowData.imageUuid].mediaType === 'ISO') {
          candidatePrimaryStorageParams.rootDiskOfferingUuid = self.windowData.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-storages', candidatePrimaryStorageParams)
          .then((resp) => {
            primaryStorageUuidList = primaryStorageUuidList.concat(resp.rootVolumePrimaryStorages.map((item) => item.uuid))
            primaryStorageUuidList = _.uniq(primaryStorageUuidList)
          })
        tasks.push(p)
        if (self.windowData.clusterUuid) {
          p = rpc.query('primary-storage', {
            q: `cluster.uuid=${self.windowData.clusterUuid}`
          }).then((resp) => {
            clusterPrimaryStorageUuidList = clusterPrimaryStorageUuidList.concat(resp.inventories.map((item) => item.uuid))
          })
          tasks.push(p)
        }
        Promise.all(tasks)
          .then(() => {
            // intersection
            if (clusterPrimaryStorageUuidList.length > 0) {
              primaryStorageUuidList = primaryStorageUuidList.filter(uuid => {
                if (clusterPrimaryStorageUuidList.indexOf(uuid) > -1) {
                  return uuid
                }
              })
            }
            self.primaryType = 'normal';
            self.primaryMessage.conditions = ['type!=VCenter', `uuid?=${primaryStorageUuidList}`]
            self.showPrimarySingleDlg = true;
          })
      },
      openHostSingleDlg() {
        const self = this
        let hostUuidList = []
        let clusterHostUuidList = []
        let PrimaryStorageHostUuidList = []
        let tasks = []
        let p = null
        if (!self.windowData.instanceOfferingUuid || !self.windowData.imageUuid || self.selectedNetworkUuidList.length <= 0) return
        let candidateHostParams = {}
        if (self.windowData.affinityGroupUuid) candidateHostParams.systemTags = [`affinityGroupUuid::${self.windowData.affinityGroupUuid}`]
        candidateHostParams.instanceOfferingUuid = self.windowData.instanceOfferingUuid
        candidateHostParams.l3NetworkUuids = self.selectedNetworkUuidList
        candidateHostParams.imageUuid = self.windowData.imageUuid
        if (self.dbData.image[self.windowData.imageUuid].mediaType === 'ISO') {
          candidateHostParams.rootDiskOfferingUuid = self.windowData.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-destinations', candidateHostParams)
          .then((resp) => {
            hostUuidList = hostUuidList.concat(resp.hosts.map((item) => item.uuid))
          })
        tasks.push(p)
        if (self.windowData.clusterUuid) {
          p = rpc.query('hosts', {
            q: `clusterUuid=${self.windowData.clusterUuid}`
          }).then((resp) => {
            clusterHostUuidList = clusterHostUuidList.concat(resp.inventories.map((item) => item.uuid))
          })
          tasks.push(p)
        }
        if (self.windowData.primaryStorageUuid) { // root volume ps
          p = rpc.query('hosts', {
            q: `cluster.primaryStorage.uuid=${self.windowData.primaryStorageUuid}`
          }).then((resp) => {
            PrimaryStorageHostUuidList = PrimaryStorageHostUuidList.concat(resp.inventories.map((item) => item.uuid))
          })
          tasks.push(p)
        }
        Promise.all(tasks)
          .then(() => {
            // intersection
            if (clusterHostUuidList.length > 0) {
              hostUuidList = hostUuidList.filter(uuid => {
                if (clusterHostUuidList.indexOf(uuid) > -1) {
                  return uuid
                }
              })
            }
            // intersection
            if (PrimaryStorageHostUuidList.length > 0) {
              hostUuidList = hostUuidList.filter(uuid => {
                if (PrimaryStorageHostUuidList.indexOf(uuid) > -1) {
                  return uuid
                }
              })
            }
            self.hostMessage.conditions = ['hypervisorType!=ESX', `uuid?=${hostUuidList}`];
            self.showHostSingleDlg = true;
            // self.openSideWindowForCreate('HostListSingleSelectList', {
            //   conditions: ['hypervisorType!=ESX', `uuid?=${hostUuidList}`],
            //   select: (uuid) => self.selectHost(uuid)
            // })
          })
      },
      openCephPoolList(type) {
        let self = this
        let isData = type === 'Data'
        let primaryStorageUuid = isData ? self.windowData.dataPrimaryStorageUuid : self.windowData.primaryStorageUuid
        if (!primaryStorageUuid) return;
        self.cephPoolMessage.conditions = [`primaryStorageUuid=${primaryStorageUuid}`, `type=${isData ? 'Data' : 'Root'}`];
        self.cephPoolMessage.type= type;
        self.showCephPool = true;
        // self.openSideWindowForCreate('CephPoolsListSingleSelectDlg', {
        //   conditions: [`primaryStorageUuid=${primaryStorageUuid}`, `type=${isData ? 'Data' : 'Root'}`],
        //   select: uuid => {
        //     let pool = self.dbData.pool[uuid]
        //     self[isData ? 'dataPoolName' : 'rootPoolName'] = pool.poolName
        //   }
        // })
      },
      openNicDlg(param, uuid){
        let self = this;
        if(param === 'IPV4'){
          self.addNicMessage = {
            uuid: uuid,
            staticIp: self.windowData.staticIp[uuid],
            mac: self.windowData.vmNicMAC[uuid],
            isSingle: self.isSingle,
            isIPV6: false,
            isUserVm: true,
          }
        }else if(param === 'IPV6'){
          self.addNicMessage ={
            uuid: uuid,
            staticIp: self.windowData.staticIp[uuid],
            mac: self.windowData.vmNicMAC[uuid],
            isSingle: self.isSingle,
            isIPV6: true,
            isUserVm: true,
          }
        }
        self.showNicDlg = true;
      },
      closeCephPoolDlg(val){
        let self = this;
        if(val){
          let pool = self.dbData.pool[val.uuid]
          self[val.type==='Data' ? 'dataPoolName' : 'rootPoolName'] = pool.poolName
        }
        self.showCephPool = false;
      },
      closeHostSingleDlg(val) {
        let self = this;
        if (val) {
          self.selectHost(val);
        }
        this.showHostSingleDlg = false;
      },
      selectGpuDevice(uuid) {
        let pcideviceA = this.dbData.pcideviceA[uuid]
        let obj = {uuid}
        if (pcideviceA && pcideviceA.audioUuid) {
          obj.audioUuid = pcideviceA.audioUuid
        }
        this.gpuDeviceList.push(obj)
      },
      selectHost: function (uuid) {
        let self = this;
        self.updateWindow({hostUuid: uuid}).then(() => {
          self.maxPCpuNum = self.dbData.host[self.windowData.hostUuid].cpuNum
          self.validateVtoPCPUBind()
          self.gpuDeviceList = []
        })
      },
      validateVtoPCPUBind: function () {
        let self = this
        let reg = /^\d{1,9}-\d{1,9}$|^\^\d{1,9}$|^\d{1,9}$/
        if (self.VtoPCPUBindItems.length > 0 && self.VtoPCPUBindItems instanceof Array) {
          self.VtoPCPUBindItems.forEach(item => {
            if (item.PCPU === '' && item.VCPU === '') {
              item.showErrorTypeError = false
              item.showErrorEmpty = false
              return true
            } else if (item.VCPU === '' || item.PCPU === '') {
              item.showErrorEmpty = true
              return false
            } else {
              item.showErrorEmpty = false
              let PCPUArr = item.PCPU.split(',')
              let VCPUArr = item.VCPU.split(',')
              let VandPArr = [...VCPUArr, ...PCPUArr]
              for (let i = 0; i < VandPArr.length; i++) {
                if (!(reg.test(VandPArr[i]))) {
                  item.showErrorTypeError = true
                  return false
                } else {
                  item.showErrorTypeError = false
                }
              }
              let arrVNum = []
              let arrPNum = []
              VCPUArr.map(i => {
                arrVNum.push(i.split('-'))
              })
              _.flattenDeep(arrVNum).map(e => {
                if (e.replace(/[^0-9]/ig, '') > self.maxVCpuNum - 1) {
                  item.showErrorVCPUOverSize = true
                  return false
                } else {
                  item.showErrorVCPUOverSize = false
                }
              })
              PCPUArr.map(j => {
                arrPNum.push(j.split('-'))
              })
              _.flattenDeep(arrPNum).map(v => {
                if (v.replace(/[^0-9]/ig, '') > self.maxPCpuNum - 1) {
                  item.showErrorPCPUOverSize = true
                  return false
                } else {
                  item.showErrorPCPUOverSize = false
                  return true
                }
              })
            }
          })
        }
      },
      initThinProvisionByPrimaryStorage(psUuid, psType) {
        return rpc.query('system-tags', {q: `resourceUuid=${psUuid}`}).then(tagsResp => {
          this[`thinProvisionFor${psType}`] = tagsResp.inventories.some(tag => tag.tag.indexOf('ThinProvisioning') > -1)
        })
      },
      selectPrimaryStorage: function (uuid) {
        this.updateWindow({
          primaryStorageUuid: uuid,
          hostUuid: ''
        }).then(() => {
          return this.initHostByPrimaryStorage(uuid)
        })
      },
      initHostByPrimaryStorage: function (primaryStorageUuid) {
        rpc.query('hosts', {
          q: `cluster.primaryStorage.uuid=${primaryStorageUuid}`
        })
          .then((resp) => {
            let newHostList = resp.inventories.map((item) => item.uuid)
            let hostUuidList = _.cloneDeep(this.windowData.hostUuidList)
            this.updateWindow({hostUuidList: _.union(newHostList, hostUuidList)})
          })
      },
      selectCluster: function (uuid) {
        this.updateWindow({
          clusterUuid: uuid,
          primaryStorageUuid: '',
          dataPrimaryStorageUuid: '',
          hostUuid: ''
        })
          .then(() => {
            this.gpuDeviceList = []
            this.initPsByCluster(uuid)
            this.initHostsByCluster(uuid, this.windowData.instanceOfferingUuid, this.windowData.imageUuid, this.selectedNetworkUuidList, this.windowData.rootDiskOfferingUuid)
          })
      },
      initHostsByCluster: function (clusterUuid, instanceOfferingUuid, imageUuid, l3NetworkUuidList, rootDiskOfferingUuid) {
        let params = {}
        if (instanceOfferingUuid) params.instanceOfferingUuid = instanceOfferingUuid
        if (l3NetworkUuidList) params.l3NetworkUuids = l3NetworkUuidList
        if (imageUuid) {
          params.imageUuid = imageUuid
          if (this.dbData.image[imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = rootDiskOfferingUuid
        }
        if (clusterUuid) params.clusterUuid = clusterUuid
        rpc.query('vm-instances/candidate-destinations', params)
          .then((resp) => {
            let hostUuidList = resp.hosts.map((item) => item.uuid)
            this.updateWindow({
              hostUuidList: hostUuidList
            })
          })
      },
      initPsByCluster: function (clusterUuid) {
        rpc.query('primary-storage', {
          q: `cluster.uuid=${clusterUuid}`
        })
          .then((resp) => {
            let psUuidList = resp.inventories.map((item) => item.uuid)
            this.updateWindow({primaryStorageUuidList: psUuidList})
          })
      },
      openClusterSingleSelect() {
        let self = this;
        let clusterUuidList = []
        let hostUuidList = []
        let tasks = []
        let p = null
        if (!self.windowData.instanceOfferingUuid || !self.windowData.imageUuid || self.selectedNetworkUuidList.length <= 0) return
        if (self.dbData.image[self.windowData.imageUuid] && self.dbData.image[self.windowData.imageUuid].mediaType === 'ISO' && !self.windowData.rootDiskOfferingUuid) return
        let params = {}
        if (self.windowData.instanceOfferingUuid) params.instanceOfferingUuid = self.windowData.instanceOfferingUuid
        if (self.selectedNetworkUuidList.length > 0) params.l3NetworkUuids = self.selectedNetworkUuidList
        if (self.windowData.affinityGroupUuid) params.systemTags = [`affinityGroupUuid::${self.windowData.affinityGroupUuid}`]
        if (self.windowData.imageUuid) {
          params.imageUuid = self.windowData.imageUuid
          if (self.dbData.image[self.windowData.imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = self.windowData.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-destinations', params)
          .then((resp) => {
            clusterUuidList = resp.clusters.map((item) => item.uuid)
            hostUuidList = resp.hosts.map((item) => item.uuid)
            return self.updateWindow({
              hostUuidList: hostUuidList,
              clusterUuidList: clusterUuidList
            })
          })
        tasks.push(p)
        Promise.all(tasks)
          .then(() => {
            self.showClusterSingleDlg = true;
            self.clusterMessage.conditions = ['type=zstack', `uuid?=${self.windowData.clusterUuidList}`]
            // self.openSideWindowForCreate('ClusterListSingleSelectList', {
            //
            //   select: (uuid) => self.selectCluster(uuid)
            // })
          })
      },
      selectAffinityGroup: async function (uuid) {
        this.updateWindow({affinityGroupUuid: uuid})
        await this.getResouceCandidateByAffinityGroup(uuid)
        this.clearRow('clusterUuid')
        this.clearRow('hostUuid')
      },
      selectInstanceOffering: function (uuid) {
        if (uuid) {
          this.updateWindow({instanceOfferingUuid: uuid})
            .then(() => {
              this.gpuDeviceList = []
              this.reSetCpuPinning()
              this.maxVCpuNum = this.$store.state.instanceOffering[uuid].cpuNum
              // this.validate('instanceOfferingUuid')
              this.initClusterAndHosts(this.windowData.instanceOfferingUuid, this.windowData.imageUuid, this.availabelNetworkList, this.windowData.rootDiskOfferingUuid)
            })
        }
      },
      selectImage(uuid) {
        // let bootMode = this.dbData.imageA[uuid].bootMode.value
        if (!uuid) return;
        let bootMode = _.get(this.dbData.imageA, [`${uuid}`, 'bootMode', 'value'])
        if (uuid !== this.windowData.imageUuid) {
          this.updateWindow({
            networkUuidList: [],
            currL3NetworkList: [],
            table: {}
          })
        }
        this.updateWindow({
          clusterUuid: '',
          primaryStorageUuid: '',
          hostUuid: '',
          imageUuid: uuid,
          bootMode: bootMode
        })
          .then(() => {
            this.gpuDeviceList = []
            this.initL3Network(uuid)
            this.initClusterAndHosts(this.windowData.instanceOfferingUuid, this.windowData.imageUuid, this.availabelNetworkList, this.windowData.rootDiskOfferingUuid)
            // this.validate('imageUuid')
          })
      },
      initL3Network: function (imageUuid) {
        let self = this
        return rpc.query(`images-l3networks/dependencies`, {
          zoneUuid: localStorage.getItem('currZoneUuid'),
          imageUuid: imageUuid
        })
          .then((resp) => {
            let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid)
            let categories = ['Private', 'Public']
            let conditions = [`category?=${categories}`, 'l2Network.cluster.type=zstack', `uuid!?=${self.selectedNetworkUuidList}`]
            if (self.networkType === 'IPV4') conditions.push('ipVersion=4')
            else if (self.networkType === 'IPV6') conditions.push('ipVersion=6')
            conditions.push(`uuid?=${uuidList}`)
            return rpc.query('l3-networks', {
              q: conditions
            })
          })
          .then((resp) => {
            let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid)
            this.updateWindow({
              currL3NetworkList: uuidList
            })
            this.deleteAllAssistant()
            if (uuidList.length === 1) {
              self.updateDbRow({
                tableName: 'l3network',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
                .then(() => {
                  let table = {}
                  table[resp.inventories[0].uuid] = {}
                  table[resp.inventories[0].uuid].selected = true
                  let obj = {}
                  if (resp.inventories[0].ipVersion === 4) {
                    obj.networkUuidList = uuidList
                    obj.table = table
                  } else if (resp.inventories[0].ipVersion === 6) {
                    obj.ipv6NetworkUuidList = uuidList
                    obj.ipv6Table = table
                  }
                  self.updateWindow({
                    ...obj
                  }).then(() => {
                     this.queryForAssistant()
                  })
                })
            } else {
               self.queryForAssistant()
            }
          })
      },
      getResouceCandidateByAffinityGroup: async function (affinityGroupUuid) {
        let data = this.windowData
        if (!data.instanceOfferingUuid || !data.imageUuid || data.networkUuidList.length <= 0) return
        if (this.dbData.image[data.imageUuid].mediaType === 'ISO' && !data.rootDiskOfferingUuid) return
        let params = {}
        params.instanceOfferingUuid = data.instanceOfferingUuid
        params.l3NetworkUuids = data.networkUuidList
        params.imageUuid = data.imageUuid
        if (this.dbData.image[data.imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = data.rootDiskOfferingUuid
        params.systemTags = [`affinityGroupUuid::${affinityGroupUuid}`]
        let resp = await rpc.query('vm-instances/candidate-destinations', params)
        let hostUuidList = resp.hosts.map((item) => item.uuid)
        let clusterUuidList = resp.clusters.map((item) => item.uuid)
        await this.updateWindow({
          hostUuidList: hostUuidList,
          clusterUuidList: clusterUuidList
        })
        this.updateDbTable({
          tableName: 'host',
          list: resp.hosts
        })
        this.updateDbTable({
          tableName: 'cluster',
          list: resp.clusters
        })
      },
      closeShowDataVolume(val) {
        let self = this;
        if (val) {
          this.selectVolumeOffering(val);
        }
        self.showDataVolumeSingleDlg = false;
      },
      selectVolumeOffering(uuid) {
        return this.updateWindow({volumeOfferingUuid: uuid}).then(() => {
          return this.initDataPrimaryStorage()
        })
      },
      initDataPrimaryStorage: async function () {
        const self = this
        let primaryStorageUuidList = await self.getCandidateDataPrimaryStorage()
        await self.updateWindow({dataPrimaryStorageUuid: ''})
        if (primaryStorageUuidList && primaryStorageUuidList.length === 1) {
          return self.selectDataPrimaryStorage(primaryStorageUuidList[0])
        }
      },
      selectDataPrimaryStorage: function (uuid) {
        this.updateWindow({dataPrimaryStorageUuid: uuid})
      },
      getCandidateDataPrimaryStorage() {
        const self = this
        let primaryStorageUuidList = []
        let clusterPrimaryStorageUuidList = []
        let tasks = []
        let p = null
        if (!self.windowData.imageUuid || !self.windowData.volumeOfferingUuid || self.availabelNetworkList.length <= 0) return
        let candidatePrimaryStorageParams = {}
        candidatePrimaryStorageParams.imageUuid = self.windowData.imageUuid
        candidatePrimaryStorageParams.l3NetworkUuids = self.availabelNetworkList
        candidatePrimaryStorageParams.dataDiskOfferingUuids = [self.windowData.volumeOfferingUuid]
        if (self.dbData.image[self.windowData.imageUuid].mediaType === 'ISO') {
          candidatePrimaryStorageParams.rootDiskOfferingUuid = self.windowData.rootDiskOfferingUuid
        }
        p = rpc.query('vm-instances/candidate-storages', candidatePrimaryStorageParams).then(resp => {
          candidatePrimaryStorageParams.dataDiskOfferingUuids.forEach(dataDiskOfferingUuid => {
            if (resp.dataVolumePrimaryStorages[dataDiskOfferingUuid] && resp.dataVolumePrimaryStorages[dataDiskOfferingUuid].length > 0) {
              primaryStorageUuidList = primaryStorageUuidList.concat(resp.dataVolumePrimaryStorages[dataDiskOfferingUuid].map(item => item.uuid))
            }
          })
          // primaryStorageUuidList = primaryStorageUuidList.concat(resp.dataVolumePrimaryStorages[].map((item) => item.uuid))
          primaryStorageUuidList = _.uniq(primaryStorageUuidList)
        })
        tasks.push(p)
        if (self.windowData.clusterUuid) {
          p = rpc.query('primary-storage', {
            q: `cluster.uuid=${self.windowData.clusterUuid}`
          }).then(resp => {
            clusterPrimaryStorageUuidList = clusterPrimaryStorageUuidList.concat(resp.inventories.map(item => item.uuid))
          })
          tasks.push(p)
        }
        return Promise.all(tasks).then(() => {
          if (clusterPrimaryStorageUuidList.length > 0) {
            primaryStorageUuidList = primaryStorageUuidList.filter(uuid => {
              return _.includes(clusterPrimaryStorageUuidList, uuid)
            })
          }
          return primaryStorageUuidList
        })
      },
      closeAddDouble(param) {
        let self = this;
        if (param) {
          self.vmNicConfigList.push(param);
          self.genVMNicValidator();
        }
        self.isAddDouble = false;
      },
      genVMNicValidator() {
        let result = {
          isValid: true
        }
        let fn = () => {
          result.isValid = this.vmNicConfigList.length > 0
          if (!result.isValid) {
            result.msg = this.$t('vm.error.novmNic')
          }
        }
        return {
          result,
          fn
        }
      },
      genGetDisabled(id) {
        return false
      },
      getDefaultVMNicIndex() {
        return this.defaultVmNicIndex
      },
      setDefaultVMNicIndex(index) {
        this.defaultVmNicIndex = index
      },
      selectVMNicConfig(index) {
        let selectedL3NetworkUuid = this.vmNicConfigList.map((item) => item.ipv4NetworkUuid).concat(this.vmNicConfigList.map((item) => item.ipv6NetworkUuid))
        let self = this;
        this.selectedL3NetworkUuid = selectedL3NetworkUuid;
        this.isAddDouble = true;
        return false
      },
      getVMNicConfigList() {
        return this.vmNicConfigList
      },
      deleteIPv6AndIPv4Config(index) {
        let vmNicConfigList = _.cloneDeep(this.vmNicConfigList)
        _.remove(vmNicConfigList, (item, _index) => _index === index)
        this.vmNicConfigList = vmNicConfigList
      },
      getImageCondition: function () {
        let conditionList = []
        conditionList = this.imageConditions;
        conditionList.push('__systemTag__!=remote')
        return conditionList
      },
      changeStep(evt) {
        let self = this;
        if (this.step == 1) {
          if(!self.windowData.instanceOfferingUuid) {
            self.$message({type: 'error', message: '计算规格不能为空！'})
            self.emtpyinstanceOfferingUuid = true;
          }else{
            self.emtpyinstanceOfferingUuid = false;
          }
          if(self.windowData.instanceOfferingUuid && !self.windowData.imageUuid) {
            self.$message({type: 'error', message: '镜像不能为空！'})
            self.emptyImage = true;
          }else{
            self.emptyImage = false;
          }
          if(self.windowData.instanceOfferingUuid && self.windowData.imageUuid && self.dbData.image[self.windowData.imageUuid].format === 'iso' && !self.windowData.rootDiskOfferingUuid) {
            self.$message({type: 'error', message: '根云盘规格不能为空！'})
            self.emptyrootDiskOfferingUuid = true;
          }else {
            self.emptyrootDiskOfferingUuid = false;
          }
          this.$refs.basicConfig.validate((valid) => {
            if (self.windowData.imageUuid && self.dbData.image[self.windowData.imageUuid].format !== 'iso' && valid && !self.emtpyinstanceOfferingUuid && !self.emptyImage ) {
              evt === 'next' ? this.step++ : this.step--
            } else if(self.windowData.imageUuid && self.dbData.image[self.windowData.imageUuid].format === 'iso' && valid && !self.emtpyinstanceOfferingUuid && !self.emptyImage && !self.emptyrootDiskOfferingUuid){

              evt === 'next' ? this.step++ : this.step--
            }else {
              return ;
            }
          })
        } else if (this.step == 2) {
          if (evt === 'next') {
            if (this.windowData.ipv6NetworkUuidList.length <= 0 &&
              this.windowData.networkUuidList.length <= 0) {
              this.ipv4IsValid = true;
              this.ipv6IsValid = true;
              return;
            }
            this.ipv4IsValid = false;
            this.ipv6IsValid = false;
            evt === 'next' ? this.step++ : this.step--
          } else {
            evt === 'next' ? this.step++ : this.step--
          }
        } else {
          evt === 'next' ? this.step++ : this.step--
        }
      },
      openAddNetWork() {
        this.showNetWorkSelectDlg = true;
        this.message.selectType = 'selection';
        if (this.networkType === 'IPV4')
          this.message.networkUuidList = this.windowData.networkUuidList;
        if (this.networkType === 'IPV6')
          this.message.ipv6NetworkUuidList = this.windowData.ipv6NetworkUuidList;
      },
      add(uuidList) {
        let self = this;
        if (self.windowData.networkUuidList.length > 0) {
          let newUuidList = _.cloneDeep(self.windowData.networkUuidList)
          self.updateWindow({
            networkUuidList: newUuidList.concat(uuidList),
            clusterUuid: '',
            primaryStorageUuid: '',
            hostUuid: ''
          }).then(() => {
            this.gpuDeviceList = []
            self.queryIfNetworkMultiSelected()
          })
          uuidList.forEach((uuid) => {
            let row = {}
            row[uuid] = {}
            row[uuid].selected = false
            let table = Object.assign({}, {...self.windowData.table}, row)
            self.updateWindow({table})
          })
          let l2networkUuid = []
          this.windowData.networkUuidList.map(uuid => {
            l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
          })
          this.queryMaxPCpuNum(l2networkUuid)
          this.initClusterAndHosts(this.windowData.instanceOfferingUuid, this.windowData.imageUuid, this.windowData.networkUuidList, this.windowData.rootDiskOfferingUuid)
        } else {
          self.updateWindow({
            networkUuidList: uuidList,
            clusterUuid: '',
            primaryStorageUuid: '',
            hostUuid: ''
          }).then(() => {
            self.queryIfNetworkMultiSelected()
          })
          uuidList.forEach((uuid, item) => {
            let row = {}
            row[uuid] = {}
            if (item === 0) {
              row[uuid].selected = true
              this.updateWindow({
                defaultNetworkUuid: uuid
              })
            } else row[uuid].selected = false
            let table = Object.assign({}, {...self.windowData.table}, row)
            self.updateWindow({table})
          })
          let l2networkUuid = []
          this.windowData.networkUuidList.map(uuid => {
            l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
          })
          this.queryMaxPCpuNum(l2networkUuid)
        }
      },
      queryMaxPCpuNum: function (l2networkUuid) {
        const self = this
        if (l2networkUuid.length > 0) {
          let zql = "query hostcapacity.cpuNum restrict by (l2network.uuid in ('" + `${l2networkUuid.join("','")}` + "')) order by cpuNum desc limit 1"
          rpc.query('/zql', {
            zql: encodeURIComponent(zql)
          }).then(resp => {
            if (resp.results && resp.results.length > 0) {
              self.maxPCpuNum = resp.results[0].inventories[0].cpuNum
            } else {
              self.maxPCpuNum = 0
            }
          })
        }
      },
      queryHostCpuNum: function (currZoneUuid) {
        const self = this
        let zql = "query hostcapacity.cpuNum where uuid in (query host.uuid where zoneUuid='" + `${currZoneUuid}` + "') order by cpuNum desc limit 1"
        rpc.query('/zql', {
          zql: encodeURIComponent(zql)
        }).then(resp => {
          if (resp.results && resp.results.length > 0) {
            self.maxPCpuNum = resp.results[0].inventories[0].cpuNum
          } else {
            self.maxPCpuNum = 0
          }
        })
      },
      initClusterAndHosts: async function (instanceOfferingUuid, imageUuid, l3NetworkUuidList, rootDiskOfferingUuid) {
        if (!instanceOfferingUuid || !imageUuid || l3NetworkUuidList.length <= 0) return
        if (this.dbData.image[imageUuid].mediaType === 'ISO' && !this.windowData.rootDiskOfferingUuid) return
        let params = {}
        if (instanceOfferingUuid) params.instanceOfferingUuid = instanceOfferingUuid
        if (l3NetworkUuidList.length > 0) params.l3NetworkUuids = l3NetworkUuidList
        if (imageUuid) {
          params.imageUuid = imageUuid
          if (this.dbData.image[imageUuid].mediaType === 'ISO') params.rootDiskOfferingUuid = rootDiskOfferingUuid
        }
        let resp = await rpc.query('vm-instances/candidate-destinations', params)
        let hostUuidList = resp.hosts.map((item) => item.uuid)
        let clusterUuidList = resp.clusters.map((item) => item.uuid)
        if (this.dbData.common.isAdmin) {
          this.$data.attachedTwoTypesPs = await this.isAttachedTwoTypesPs(clusterUuidList)
        }
        this.updateWindow({
          hostUuidList: hostUuidList,
          clusterUuidList: clusterUuidList
        })
        this.updateDbTable({
          tableName: 'host',
          list: resp.hosts
        })
        this.updateDbTable({
          tableName: 'cluster',
          list: resp.clusters
        })
      },
      setShowOrFalse(uuidList) {
        this.showNetWorkSelectDlg = false;
        if (!uuidList || uuidList.length <= 0) return;
        if (this.networkType === 'IPV4')
          this.add(uuidList)
        if (this.networkType === 'IPV6')
          this.addIPV6(uuidList);
      },
      addIPV6(uuidList) {
        let self = this;
        if (self.windowData.ipv6NetworkUuidList.length > 0) {
          let newUuidList = _.cloneDeep(self.windowData.ipv6NetworkUuidList)
          self.updateWindow({
            ipv6NetworkUuidList: newUuidList.concat(uuidList),
            clusterUuid: '',
            primaryStorageUuid: '',
            hostUuid: ''
          }).then(() => {
            this.gpuDeviceList = []
            self.queryIfNetworkMultiSelected()
          })
          uuidList.forEach((uuid) => {
            let row = {}
            row[uuid] = {}
            row[uuid].selected = false
            let ipv6Table = Object.assign({}, {...self.windowData.ipv6Table}, row)
            self.updateWindow({ipv6Table})
          })
          let l2networkUuid = []
          this.windowData.ipv6NetworkUuidList.map(uuid => {
            l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
          })
          this.queryMaxPCpuNum(l2networkUuid)
          this.initClusterAndHosts(this.windowData.instanceOfferingUuid, this.windowData.imageUuid, this.windowData.ipv6NetworkUuidList, this.windowData.rootDiskOfferingUuid)
        } else {
          self.updateWindow({
            ipv6NetworkUuidList: uuidList,
            clusterUuid: '',
            primaryStorageUuid: '',
            hostUuid: ''
          }).then(() => {
            self.queryIfNetworkMultiSelected()
          })
          uuidList.forEach((uuid, item) => {
            let row = {}
            row[uuid] = {}
            if (item === 0) {
              row[uuid].selected = true
              this.updateWindow({
                defaultIpv6NetworkUuid: uuid
              })
            } else row[uuid].selected = false
            let ipv6Table = Object.assign({}, {...self.windowData.ipv6Table}, row)
            self.updateWindow({ipv6Table})
          })
          let l2networkUuid = []
          this.windowData.ipv6NetworkUuidList.map(uuid => {
            l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
          })
          this.queryMaxPCpuNum(l2networkUuid)
        }
      },
      removeNetwork: function ($event, uuid) {
        $event.stopPropagation()
        const self = this
        let obj = {
          volumeOfferingUuid: '',
          clusterUuid: '',
          primaryStorageUuid: '',
          hostUuid: '',
          showMoreSetting: false
        }
        let list = _.cloneDeep(self.selectedNetworkUuidList)
        this.reSetCpuPinning()
        let l2networkUuid = []
        list.map(uuid => {
          l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
        })
        this.queryMaxPCpuNum(l2networkUuid)
        let uuidList = list.filter((i) => i !== uuid)
        obj.networkUuidList = uuidList
        if (self.windowData.defaultNetworkUuid === uuid) {
          if (uuidList.length > 0) {
            obj.defaultNetworkUuid = uuidList[0]
            let table = {}
            uuidList.forEach((uuid, index) => {
              table[uuid] = {}
              if (index === 0) {
                table[uuid].selected = true
              } else {
                table[uuid].selected = false
              }
            })
            obj.table = table
          } else {
            obj.defaultNetworkUuid = ''
          }
        }
        return self.updateWindow(obj).then(() => {
          self.queryIfNetworkMultiSelected()
        })
      },
      reSetCpuPinning: function () {
        this.VtoPCPUBindItems = [{
          id: uuidv4(),
          showErrorEmpty: false,
          showErrorTypeError: false,
          showErrorVCPUOverSize: false,
          showErrorPCPUOverSize: false,
          VCPU: '',
          PCPU: ''
        }]
      },
      removeIpv6Network($event, uuid) {
        $event.stopPropagation()
        const self = this
        let obj = {
          volumeOfferingUuid: '',
          clusterUuid: '',
          primaryStorageUuid: '',
          hostUuid: '',
          showMoreSetting: false
        }
        let list = _.cloneDeep(self.windowData.ipv6NetworkUuidList)
        this.reSetCpuPinning()
        let l2networkUuid = []
        list.map(uuid => {
          l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
        })
        this.queryMaxPCpuNum(l2networkUuid)
        let uuidList = list.filter((i) => i !== uuid)
        obj.ipv6NetworkUuidList = uuidList
        if (self.windowData.defaultIpv6NetworkUuid === uuid) {
          if (uuidList.length > 0) {
            obj.defaultIpv6NetworkUuid = uuidList[0]
            let table = {}
            uuidList.forEach((uuid, index) => {
              table[uuid] = {}
              if (index === 0) {
                table[uuid].selected = true
              } else {
                table[uuid].selected = false
              }
            })
            obj.ipv6Table = table
          } else {
            obj.defaultIpv6NetworkUuid = ''
          }
        }
        return self.updateWindow(obj).then(() => {
          self.queryIfNetworkMultiSelected()
        })
      },
      openDataVolumeSingleSelect() {
        let self = this;
        self.dataVolumeMessage.conditions = ['state=Enabled'];
        self.showDataVolumeSingleDlg = true;
      },
      clearRow: function (resourceName) {
        let obj = {}
        obj[resourceName] = ''
        if (resourceName === 'instanceOfferingUuid' ||
          resourceName === 'rootDiskOfferingUuid') {
          obj.volumeOfferingUuid = ''
          obj.clusterUuid = ''
          obj.primaryStorageUuid = ''
          obj.hostUuid = ''
          obj.showMoreSetting = false
          this.maxVCpuNum = 0
        }
        if (resourceName === 'hostUuid') {
          let l2networkUuid = []
          this.availabelNetworkList.map(uuid => {
            l2networkUuid.push(this.dbData.l3network[uuid].l2NetworkUuid)
          })
          this.queryMaxPCpuNum(l2networkUuid)
        }
        if (resourceName === 'clusterUuid') {
          obj.hostUuidList = ''
          obj.clusterUuid = ''
          obj.dataPrimaryStorageUuid = ''
          obj.primaryStorageUuid = ''
          obj.primaryStorageUuidList = ''
        }
        this.updateWindow(obj)
      },
      async openAffinityGroupDlg() {
        let self = this;
        let affinityGroupUuids = await self.getCandidateAffinityGroupForVmAttaching()
        let conditions = [`uuid?=${affinityGroupUuids}`]
        this.affinityMessage.conditions = conditions;
        this.showAffinitySingleDlg = true;
      },
      getCandidateAffinityGroupForVmAttaching: async function () {
        let affinityGroupResp = await rpc.query(`affinity-groups`, {q: 'state=Enabled'})
        let affinityGroupUuids = affinityGroupResp.inventories.map(affinityGroup => affinityGroup.uuid)
        if (affinityGroupUuids.length === 0) return []
        if (!this.dbData.common.isAdmin) return affinityGroupUuids

        function getAccountRelatedAffinityGroup(affinityGroupUuids, accountUuid) {
          let result = []
          let tasks = []
          let p = null
          affinityGroupUuids.forEach(affinityGroupUuid => {
            p = rpc.query(`accounts/resources/refs`, {
              q: [`resourceUuid=${affinityGroupUuid}`, `accountUuid=${accountUuid}`]
            }).then(resp => {
              if (resp.inventories.length !== 0) result.push(affinityGroupUuid)
            })
            tasks.push(p)
          })
          return Promise.all(tasks).then(() => {
            return result
          })
        }

        let accountUuid = window.localStorage.getItem('accountUuid')
        let result = await getAccountRelatedAffinityGroup(affinityGroupUuids, accountUuid)
        return result
      },
      addMoreParam: function () {
        let system = []
        // if (this.windowData.ip !== '') system.push(`staticIp::${this.windowData.ip}`)
        if (this.windowData.consolePassword) system.push(`consolePassword::${this.windowData.consolePassword}`)
        if (this.windowData.sshKey !== '') system.push(`sshkey::${this.windowData.sshKey}`)
        if (this.windowData.haLevel !== 'None') system.push('ha::NeverStop')
        if (this.windowData.affinityGroupUuid) system.push(`affinityGroupUuid::${this.windowData.affinityGroupUuid}`)
        if (this.windowData.userData !== '') system.push(`userdata::${Utf8Base64.encode(this.windowData.userData)}`)
        if (this.windowData.primaryStorageUuid !== '') system.push(`primaryStorageUuidForDataVolume::${this.windowData.primaryStorageUuid}`)
        if (this.selectmultiple === this.$t('common.multiple') && this.gpuDeviceList.length > 0) {
          let selectedUuids = []
          this.gpuDeviceList.forEach(gpu => {
            selectedUuids.push(gpu.uuid)
            if (gpu.audioUuid) {
              selectedUuids.push(gpu.audioUuid)
            }
          })
          selectedUuids.forEach(uuid => {
            system.push(`pciDevice::${uuid}`)
          })
        }
        let cdRoms = this.configuredCDRom.concat(this.tempConfiguredCDRom)
        if (cdRoms.length > 0) {
          let str = cdRoms.reduce((total, cur) => {
            total += `::${cur.isoUuid || 'Empty'}`
            return total
          }, 'cdroms')
          let lenDifference = this.cdromLimit - cdRoms.length
          if (lenDifference > 0) {
            str += '::None'.repeat(lenDifference)
          }
          system.push(str)
        } else {
          system.push('createWithoutCdRom::true')
        }
        if (this.windowData.usbRedirect !== 'false') system.push(`usbRedirect::${this.windowData.usbRedirect}`)
        if (this.windowData.volumeOfferingUuid !== '' && this.windowData.VirtioSCSI === true) system.push(`virtio::diskOffering::${this.windowData.volumeOfferingUuid}::num::1`)
        if (!this.validateVtoPCPUBind()) {
          let PtoV = ''
          this.VtoPCPUBindItems.map(item => {
            if (item.VCPU !== '' && item.PCPU !== '') {
              PtoV += `${item.VCPU}:${item.PCPU};`
            }
          })
          if (PtoV === '') {
            PtoV = false
          } else {
            system.push(`vmCpuPinning::${PtoV}`)
          }
        }
        // let imageUuid = this.windowData.imageUuid
        // let bootMode = _.get(this.dbData.imageA[imageUuid].bootMode, 'value') || 'Legacy'
        // system.push(`bootMode::${bootMode}`)
        let vmNicConfig = {}
        if (this.networkType === this.$t('common.doubleIPv4AndIPv6')) {
          this.vmNicConfigList.forEach((item) => {
            vmNicConfig[item.ipv4NetworkUuid] = item
          })
        }
        let defaultL3NetworkUuid
        if (this.networkType === 'IPV4') defaultL3NetworkUuid = this.windowData.defaultNetworkUuid
        else if (this.networkType === 'IPV6') defaultL3NetworkUuid = this.windowData.defaultIpv6NetworkUuid
        else if (this.networkType === this.$t('common.doubleIPv4AndIPv6') && this.vmNicConfigList[this.defaultVmNicIndex]) defaultL3NetworkUuid = this.vmNicConfigList[this.defaultVmNicIndex].ipv4NetworkUuid
        let moreParam = {
          defaultL3NetworkUuid: defaultL3NetworkUuid,
          rootDiskOfferingUuid: this.windowData.rootDiskOfferingUuid,
          dataDiskOfferingUuids: this.windowData.volumeOfferingUuid === '' ? [] : [this.windowData.volumeOfferingUuid],
          clusterUuid: this.windowData.clusterUuid,
          primaryStorageUuidForRootVolume: this.windowData.primaryStorageUuid,
          hostUuid: this.windowData.hostUuid,
          // strategy: this.windowData.createAndStart ? 'InstantStart' : 'JustCreate',
          systemTags: system,
          vmNicConfig: vmNicConfig,
          antiSpoofing: this.windowData.antiSpoofing
        }
        for (let i in moreParam) {
          moreParam[i] === '' ? delete moreParam[i] : void 0
        }
        return moreParam
      },
      reSetCpuPinning: function () {
        this.VtoPCPUBindItems = [{
          id: uuidv4(),
          showErrorEmpty: false,
          showErrorTypeError: false,
          showErrorVCPUOverSize: false,
          showErrorPCPUOverSize: false,
          VCPU: '',
          PCPU: ''
        }]
      },
      removePtoVCPUItem: function (item) {
        this.VtoPCPUBindItems.splice(item, 1)
      },
      addVtoPCPUBind: function () {
        if (!this.canAddMore) {
          this.VtoPCPUBindItems.push({
            id: uuidv4(),
            showErrorEmpty: false,
            showErrorTypeError: false,
            showErrorVCPUOverSize: false,
            showErrorPCPUOverSize: false,
            VCPU: '',
            PCPU: ''
          })
        }
      },
      ParamConfig: function () {
        const self = this
        rpc.query('instance-offerings', {
          q: ['state=Enabled', 'type=UserVm'],
          fields: 'uuid',
          replyWithCount: true
        }).then((resp) => {
          if (resp.total === 1) {
            this.updateWindow({instanceOfferingUuid: resp.inventories[0].uuid})
            this.dispatchAction('instanceOffering/query', resp.inventories[0].uuid)
          }
        })
        rpc.query('images', {
          q: self.windowData.imageConditions
        }).then((resp) => {
          if (resp.inventories.length === 1) {
            this.updateDbTable({
              tableName: 'image',
              list: resp.inventories
            })
            this.updateWindow({imageUuid: resp.inventories[0].uuid}).then(() => {
              this.initL3Network(this.windowData.imageUuid)
            })
            rpc.query('system-tags', {
              q: [`resourceUuid=${resp.inventories[0].uuid}`, 'resourceType=ImageVO', 'tag~=bootMode::%25'],
              fields: 'tag'
            }).then((res) => {
              if (res.inventories.length > 0) {
                this.updateWindow({
                  bootMode: res.inventories[0].tag.split('::')[1]
                })
              }
            })
          } else {
            if (this.windowData.imageUuid) {
              this.initL3Network(this.windowData.imageUuid)
            } else {
              // this.queryForAssistant()
            }
          }
        })
        this.queryConsoleMode()
      },
      openDataVolumePrimaryStorageDlg: async function () {
        const self = this
        let primaryStorageUuidList = await self.getCandidateDataPrimaryStorage();
        self.primaryMessage.conditions = ['type!=VCenter', `uuid?=${primaryStorageUuidList}`];
        this.primaryType = 'data';
        self.showPrimarySingleDlg = true;
      },
      createParam() {
        let self = this;
        let obj = {
          name: this.basicConfig.name,
          description: this.basicConfig.description,
          instanceOfferingUuid: self.windowData.instanceOfferingUuid,
          imageUuid: self.windowData.imageUuid,
          l3NetworkUuids: self.windowData.networkUuidList,
          staticIp: self.windowData.staticIp,
          customMac: self.windowData.vmNicMAC
        }
        if (!self.dbData.common.isOpensource) {
          obj.consoleMode = self.windowData.consoleMode
        }
        return obj
      },
      createVm() {
        let param = Object.assign(this.createParam(), this.addMoreParam());
        if(this.windowData.networkUuidList.length<=0) return;
        this.canCreate = false;
        this.create(param, parseInt(this.basicConfig.createCount))
          .then( () => {
            this.$router.push({name: 'vm'});
          }).catch(() => {
            this.canCreate = true;
        })
      },
      selectDefaultNetwork($event, uuid){
        this.singleSelect(uuid)
        this.updateWindow({ defaultNetworkUuid: uuid })
      },

      singleSelect: function (uuid) {
        let table = _.cloneDeep(this.windowData.table)
        Object.keys(table).forEach((id) => {
          table[id].selected = false
        })
        table[uuid].selected = true
        this.updateWindow({
          table
        })
      },

      handleL3NetWorkTab(){
        let self = this;
        self.queryIfNetworkMultiSelected();
      }
    }
  }
</script>

<style scoped lang="less">
  .createvmWrapper {
    width: 100%;
    height: 100%;
    background: #fff;
  }

  .network {
    margin-bottom: 10px;
  }

  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    width: 300px;
    border: 1px solid #adb0b8;
    margin-top: 10px;
    border-radius: 2px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: initial;
    display: inline-block;
    line-height: 40px;

    img {
      vertical-align: middle;
    }
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .network-config {
    overflow: hidden;
    width: 300px;
    line-height: 2.4;
    padding: 0;
    font-size: 12px;
  }

  .network-config .text {
    color: #5e6978;
  }

  .network-config .link {
    position: relative;
    float: right;
    color: #007fdf;
    text-decoration: none;
    cursor: pointer;
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .double-link {
    color: #409EFF;
    margin-top: 10px;
    display: inline-block;
  }

  .item-container {
    display: inline-block;
    width: 15%;
  }

  .PtoVItem {
    overflow: hidden;
    position: relative;
    margin-top: 5px;
    width: 100%;
    height: 62px;
  }

  .PtoVleft-1 {
    float: left;
    width: 45%;
  }

  .operation-row input.error-input {
    border-color: #ec5960;
  }

  .operation-row input {
    height: 40px;
    font-size: 14px;
    color: #333;
    width: 42%;
    border: 1px solid #dae0e6;
    padding: 5px 10px;
    border-radius: 2px;
  }

  .error {
    font-size: 12px;
    float: right;
    color: #ec5960;
    padding-top: 5px;
    position: relative;
  }

  .addMore{
    color: #409EFF ;
  }

  .disable{
    color: #dae0e6;
    border: none;
  }
</style>
