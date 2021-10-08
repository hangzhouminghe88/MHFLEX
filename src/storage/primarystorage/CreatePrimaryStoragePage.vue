<style scoped>
  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .el-select {
    width: 100%;
  }

  #json-editor {
    position: relative;
    border: 1px solid lightgray;
    margin: auto;
    height: 400px;
    width: 100%;
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

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("common.addPrimaryStorage")}}
        </span>
      <span class="create-back" @click="$router.push('primarystorage')"><i class="el-icon-back"></i>回到主存储列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title">
          {{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[windowData.zoneUuid] &&
          dbData.zone[windowData.zoneUuid].name}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="primaryStorageInfoNotHybrid" v-if="!isHybrid()"/>
        <help-trigger name="primaryStorageInfoHybrid" v-else/>
        <input type="text" v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keywown.enter="validate('name')"/>
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t("error.emptyInput")+$t("common.name")}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.introduction"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>
      <div class="operation-row">
        <div class="title">
          {{$t("common.type")}}
        </div>
        <help-trigger name="primaryStorageTypeNotHybrid" v-if="!isHybrid()"/>
        <help-trigger name="primaryStorageTypeHybrid" v-else/>
        <el-select v-model="windowData.type" placeholder="请选择" @change="switchType">
          <el-option
            v-for="item in psTypes"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </div>

      <component style="margin-top: 20px;" v-for="(item, index) in itemList" :key="index" :is="item.ctrl"
                 :param="item.param" v-if="canShow(item)"/>
      <div class="operation-row"
           v-if="windowData.createMore && (windowData.type === 'Ceph' || windowData.type === 'Fusionstor')">
        <div class="options">
          <div class="option">
              <span @click="updateWindow({ samePort: !windowData.samePort })">
                <img class="checkbox" v-if="windowData.samePort" src="~assets/checkbox_selected.svg"/>
                <img class="checkbox" v-else src="~assets/checkbox_normal.svg"/>
              </span>
            <span id="common-samePort">{{ $t("common.samePort") }}</span>
          </div>
          <div class="option">
              <span @click="updateWindow({ sameUsername: !windowData.sameUsername })">
                <img class="checkbox" v-if="windowData.sameUsername" src="~assets/checkbox_selected.svg"/>
                <img class="checkbox" v-else src="~assets/checkbox_normal.svg"/>
              </span>
            <span id="common-sameUsername">{{ $t("common.sameUsername") }}</span>
          </div>
          <div class="option">
              <span @click="updateWindow({ useSamePassword: !windowData.useSamePassword })">
                <img class="checkbox" v-if="windowData.useSamePassword" src="~assets/checkbox_selected.svg"/>
                <img class="checkbox" v-else src="~assets/checkbox_normal.svg"/>
              </span>
            <span id="common-useSamePassword">{{ $t("common.useSamePassword") }}</span>
          </div>
        </div>

      </div>

      <div v-if=" windowData.type === 'Ceph' || windowData.type === 'Fusionstor' ">
        <div class="operation-row">
          <div class="title required">
            {{$t("common.mgtIp")}}
          </div>
          <input maxlength="255" v-model="windowData.monIp"
                 :class="{'error-input': windowData.emptymonIp || windowData.invalidmonIp}" placeholder="192.168.0.1"
                 @input="(e) => { updateWindow({ 'monIp': e.target.value }) }" @blur="validate('monIp')"
                 @keywown.enter="validate('monIp')"/>
          <div class="error error-text" v-if="windowData.emptymonIp">
            {{$t("error.emptyInput")+$t("common.mgtIp")}}
          </div>
          <div class="error error-text" v-if="!windowData.emptymonIp && windowData.invalidmonIp">
            {{$t("error.invalid")+$t("common.mgtIp")}}
          </div>
        </div>

        <div class="operation-row">
          <div class="title required">
            {{$t("common.sshPort")}}
          </div>
          <input type="number" step="any" v-model="windowData.sshPort"
                 :class="{'error-input': windowData.emptysshPort || windowData.invalidsshPort}"
                 @input="(e) => { updateWindow({ 'sshPort': e.target.value }) }" @blur="validate('sshPort')"
                 @keywown.enter="validate('sshPort')"/>
          <div class="error error-text" v-if="windowData.emptysshPort">
            {{$t("error.emptyInput")+$t("common.sshPort")}}
          </div>
          <div class="error error-text" v-if="!windowData.emptysshPort && windowData.invalidsshPort">
            {{$t("error.invalid")+$t("common.sshPort")}}
          </div>
        </div>

        <div class="operation-row">
          <div class="title required">
            {{$t("user.name")}}
          </div>
          <input maxlength="255" v-model="windowData.username" :class="{'error-input': windowData.emptyusername}"
                 @input="(e) => { updateWindow({ 'username': e.target.value }) }" @blur="validate('username')"
                 @keywown.enter="validate('username')"/>
          <div class="error error-text" v-if="windowData.emptyusername">
            {{$t("error.emptyInput")+$t("user.name")}}
          </div>
        </div>

        <div class="operation-row">
          <div class="title required">
            {{$t("common.password")}}
          </div>
          <input maxlength="255" type="password" v-model="windowData.password"
                 :class="{'error-input': windowData.emptypassword}"
                 @input="(e) => { updateWindow({ 'password': e.target.value }) }" @blur="validate('password')"
                 @keywown.enter="validate('password')"/>
          <div class="error error-text" v-if="windowData.emptypassword">
            {{$t("error.emptyInput")+$t("common.password")}}
          </div>
        </div>

        <div class="more-host" v-if="windowData.createMore" v-for="(param, i) in windowData.moreMonParams">
          <div class="operation-row">
            <div class="title required">
              {{$t("common.mgtIp")}}
            </div>
            <div class="input-wrapper">
              <input v-model="windowData.moreMonParams[i].monIp" maxlength="255"
                     @input="(e) => { updateParam(i, 'monIp', e.target.value) }"
                     :class="{'error-input': windowData['emptymonIp_' + i] || windowData['invalidmonIp_' + i]}"
                     @blur="validate('monIp_' + i)" @keywown.enter="validate('monIp_' + i)"/>
              <div class="delete-param" @click="deleteMonParam(i, $event)"></div>
            </div>
            <div class="error error-text" v-if="windowData['emptymonIp_' + i]">
              {{$t("error.emptyInput")+$t("common.mgtIp")}}
            </div>
            <div class="error error-text" v-if="!windowData['emptymonIp_' + i] && windowData['invalidmonIp_' + i]">
              {{$t("error.invalid")+$t("common.mgtIp")}}
            </div>
          </div>

          <div class="operation-row" v-if="!windowData.samePort">
            <div class="title required">
              {{$t("common.sshPort")}}
            </div>
            <input v-model="windowData.moreMonParams[i].sshPort" type="number" step="any"
                   @input="(e) => { updateParam(i, 'sshPort', e.target.value) }"
                   :class="{'error-input': windowData['emptysshPort_' + i] || windowData['invalidsshPort_' + i]}"
                   @blur="validate('sshPort_' + i)" @keywown.enter="validate('sshPort_' + i)"/>
            <div class="error error-text" v-if="windowData['emptysshPort_' + i]">
              {{$t("error.emptyInput")+$t("common.sshPort")}}
            </div>
            <div class="error error-text" v-if="!windowData['emptysshPort_' + i] && windowData['invalidsshPort_' + i]">
              {{$t("error.invalid")+$t("common.sshPort")}}
            </div>
          </div>

          <div class="operation-row" v-if="!windowData.sameUsername">
            <div class="title required">
              {{$t("user.name")}}
            </div>
            <input v-model="windowData.moreMonParams[i].username" maxlength="255"
                   @input="(e) => { updateParam(i, 'username', e.target.value) }"
                   :class="{'error-input': windowData['emptyusername_' + i]}" @blur="validate('username_' + i)"
                   @keywown.enter="validate('username_' + i)"/>
            <div id="user-name" class="error error-text" v-if="windowData['emptyusername_' + i]">
              {{$t("error.emptyInput")+$t("user.name")}}
            </div>
          </div>

          <div class="operation-row" v-if="!windowData.useSamePassword">
            <div class="title required">
              {{$t("common.password")}}
            </div>
            <input type="password" maxlength="255" v-model="windowData.moreMonParams[i].password"
                   @input="(e) => { updateParam(i, 'password', e.target.value) }"
                   :class="{'error-input': windowData['emptypassword_' + i]}" @blur="validate('password_' + i)"
                   @keywown.enter="validate('password_' + i)"/>
            <div class="error error-text" v-if="windowData['emptypassword_' + i]">
              {{$t("error.emptyInput")+$t("common.password")}}
            </div>
          </div>

        </div>
        <div id="common-addMore" class="operation-row">
          <div class="title">
            {{$t("common.addMore")}}
          </div>
          <div class="content" :class="{'highlight': isFocus('row0')}" @click="addMoreMon()">
            <div class="add"></div>
          </div>
        </div>
      </div>

      <div class="operation-row zs-select" v-if="windowData.type === 'AliyunNAS'">
        <div class="title required">
          {{$t("common.nasFileSystem")}}
        </div>
        <el-select v-model="nasFileSystem" style="width: 100%;">
          <el-option v-for="(item, index) in nasFsList_filter"
                     :key="index"
                     :label="item.name" :value="item.name"
                     @click.native="selectNasFs(item)">
          </el-option>
        </el-select>
      </div>

      <div class="operation-row zs-select" v-if="windowData.type === 'AliyunNAS'">
        <div class="title required">
          {{$t("common.nasAccessGroup")}}
        </div>
         <el-select v-model="nasAccessGroup" style="width: 100%;">
          <el-option v-for="(item, index) in nasAccessGroupList_filter"
                     :key="index"
                     :label="item.name" :value="item.name"
                     @click.native="selectNasAccessGroup(item)">
          </el-option>
        </el-select>
      </div>

      <div id="common-url" class="operation-row"
           v-if=" windowData.type !== 'Ceph' && windowData.type !== 'Fusionstor' && windowData.type !== 'SharedBlock' ">
        <div class="title required">
          {{ windowData.type === 'AliyunNAS' ? $t("common.mountUrl") : $t("common.url") }}
        </div>
        <help-trigger name="LocalStorageUrl" v-if="windowData.type === 'LocalStorage'"/>
        <help-trigger name="NFSUrl" v-if="windowData.type === 'NFS'"/>
        <help-trigger name="SharedMountPointUrl" v-if="windowData.type === 'SharedMountPoint'"/>
        <help-trigger name="AliyunNASMount" v-if="windowData.type === 'AliyunNAS'"/>
        <help-trigger name="AliyunEBSUrl" v-if="windowData.type === 'AliyunEBS'"/>
        <input :class="{'error-input': windowData.emptyurl || windowData.invalidurl}"
               v-if="windowData.type === 'LocalStorage'" maxlength="255" v-model="windowData.url"
               @input="(e) => { updateWindow({ 'url': e.target.value }) }"
               :placeholder="`/${$t('common.productionNameForPlaceholderLowerCase')}_ps`" @blur="validate('url')"
               @keywown.enter="validate('url')"/>
        <input v-if="windowData.type === 'NFS'" :class="{'error-input': windowData.emptyurl || windowData.invalidurl}"
               maxlength="255" :value="windowData.url" @input="(e) => { updateWindow({ 'url': e.target.value }) }"
               placeholder="192.168.0.1:/nfs_root/" @blur="validate('url')" @keywown.enter="validate('url')"/>
        <input v-if="windowData.type === 'SharedMountPoint'"
               :class="{'error-input': windowData.emptyurl || windowData.invalidurl}" maxlength="255"
               :value="windowData.url" @input="(e) => { updateWindow({ 'url': e.target.value }) }"
               placeholder="/mnt/nfs" @blur="validate('url')" @keywown.enter="validate('url')"/>
        <input v-if="windowData.type === 'AliyunNAS'"
               :class="{'error-input': windowData.emptyurl || windowData.invalidurl}" maxlength="255"
               :value="windowData.url" @input="(e) => { updateWindow({ 'url': e.target.value }) }"
               placeholder="/nas_root" @blur="validate('url')" @keywown.enter="validate('url')"/>
        <input v-if="windowData.type === 'AliyunEBS'"
               :class="{'error-input': windowData.emptyurl || windowData.invalidurl}" maxlength="255"
               :value="windowData.url" @input="(e) => { updateWindow({ 'url': e.target.value }) }"
               placeholder="http://127.0.0.1:18080/ocean/api" @blur="validate('url')" @keywown.enter="validate('url')"/>
        <div class="error error-text"
             v-if="windowData.type !== 'Ceph' && windowData.type !== 'Fusionstor' && windowData.type !== 'SharedBlock' && windowData.emptyurl">
          {{$t("error.emptyInput")+$t("common.url")}}
        </div>
        <div class="error error-text"
             v-if="windowData.type !== 'Ceph' && windowData.type !== 'Fusionstor' && windowData.type !== 'SharedBlock' && !windowData.emptyurl && windowData.invalidurl">
          {{$t("error.invalid")+$t("common.url")}}
        </div>
      </div>


      <div id="common-attachParam" class="operation-row" v-if=" windowData.type === 'NFS' ">
        <div class="title ">
          {{$t("common.attachParam")}}
        </div>
        <help-trigger name="nfsMount"/>
        <input maxlength="255" v-model="windowData.mountOptions"
               @input="(e) => { updateWindow({ 'mountOptions': e.target.value }) }"/>
      </div>

      <div v-if=" windowData.type === 'Ceph' || windowData.type === 'Fusionstor'">
        <div id="common-imagePoolName" class="operation-row">
          <div class="title">
            {{$t("common.imagePoolName")}}
          </div>
          <help-trigger name="storagePoolName"/>
          <input maxlength="255" v-model="windowData.imageCachePoolName"
                 @input="(e) => { updateWindow({ 'imageCachePoolName': e.target.value }) }"
                 :class="{'error-input': windowData.invalidimageCachePoolName}" @blur="validate('imageCachePoolName')"
                 @keywown.enter="validate('imageCachePoolName')"/>
          <div class="error error-text" v-if="windowData.imageCachePoolName && windowData.invalidimageCachePoolName">
            {{$t("error.invalid")+$t("common.imagePoolName")}}
          </div>
        </div>
        <div id="common-dataVolumePoolName" class="operation-row">
          <div class="title">
            {{$t("common.dataVolumePoolName")}}
          </div>
          <input maxlength="255" v-model="windowData.dataVolumePoolName"
                 @input="(e) => { updateWindow({ 'dataVolumePoolName': e.target.value }) }"
                 :class="{'error-input': windowData.invaliddataVolumePoolName}" @blur="validate('dataVolumePoolName')"
                 @keywown.enter="validate('dataVolumePoolName')"/>
          <div class="error error-text" v-if="windowData.dataVolumePoolName && windowData.invaliddataVolumePoolName">
            {{$t("error.invalid")+$t("common.dataVolumePoolName")}}
          </div>
        </div>
        <div id="common-rootVolumePoolName" class="operation-row">
          <div class="title">
            {{$t("common.rootVolumePoolName")}}
          </div>
          <input maxlength="255" v-model="windowData.rootVolumePoolName"
                 @input="(e) => { updateWindow({ 'rootVolumePoolName': e.target.value }) }"
                 :class="{'error-input': windowData.invalidrootVolumePoolName}" @blur="validate('rootVolumePoolName')"
                 @keywown.enter="validate('rootVolumePoolName')"/>
          <div class="error error-text" v-if="windowData.rootVolumePoolName && windowData.invalidrootVolumePoolName">
            {{$t("error.invalid")+$t("common.rootVolumePoolName")}}
          </div>
        </div>
      </div>

      <div id="common-storageNetworkCidr" class="operation-row"
           v-if="windowData.type === 'Ceph' || windowData.type === 'NFS' || windowData.type === 'SharedMountPoint' || windowData.type ==='Fusionstor' || windowData.type === 'SharedBlock'"
           v-permission="'LICENSE_BASIC_PAID'">
        <div class="title">
          {{$t('common.storageNetworkCidr')}}
        </div>
        <help-trigger name="primaryStorage_storageNetworkCidr"/>
        <input v-model="windowData.cidr" :class="{'error-input': windowData.invalidcidr}" placeholder="192.168.1.0/24"
               maxlength="255" @input="(e) => { updateWindow({ 'cidr': e.target.value }) }" @blur="validate('cidr')"
               @keydown.enter="validate('cidr')" v-permission="'LICENSE_BASIC_PAID'"/>
        <div id="common-cidr" class="error"
             v-if="(windowData.type === 'Ceph' || windowData.type === 'NFS' || windowData.type === 'SharedMountPoint') && !windowData.emptycidr && windowData.invalidcidr">
          {{$t('error.invalid')+$t('common.cidr')}}
        </div>
      </div>


      <div id="hybrididentityzone-identityzone" class="operation-row" v-if="windowData.type === 'AliyunEBS'">
        <div class="title required">
          {{$t('hybrididentityzone.identityzone')}}
        </div>
        <div class="content" @click="openSelectHybridIdentityZoneDlg(); setFocus('row0');"
             :class="{'highlight': isFocus('row0')}">
          {{ dbData.hybridIdentityZone[windowData.identityZoneUuid] &&
          dbData.hybridIdentityZone[windowData.identityZoneUuid].zoneName }}
          <div class="add"
               v-if="!(windowData.identityZoneUuid && dbData.hybridIdentityZone[windowData.identityZoneUuid])"></div>
          <div class="delete" v-else @click="clearRow('identityZoneUuid'); $event.stopPropagation();"></div>
        </div>
        <div id="hybridKey-identityZoneUuid" class="error error-text"
             v-if="windowData.emptyidentityZoneUuid && windowData.type === 'AliyunEBS'">
          {{$t('error.emptyInput')+$t('hybrididentityzone.identityzone')}}
        </div>
      </div>


      <div id="primaryStorage-tdcConfigContent" class="operation-row" v-show="windowData.type === 'AliyunEBS'">
        <div class="title required" style="position: relative;">
          {{$t("primaryStorage.tdcConfigContent")}}
          <span class="zoom-in" @click="openFullEditor()"></span>
        </div>
        <help-trigger name="AliyunEBSTdcConfig" style="right: 30px;"/>
        <div id="json-editor" class="template-editor json-editor add-tdc-config-content"></div>
        <div id="common-tdcConfigContent" class="error error-text"
             v-show="windowData.emptytdcConfigContent && windowData.type === 'AliyunEBS'">
          {{$t('error.emptyInput')+$t('primaryStorage.tdcConfigContent')}}
        </div>
        <div id="common-tdcConfigContent" class="error error-text"
             v-show="!windowData.emptytdcConfigContent && windowData.invalidtdcConfigContent && windowData.type === 'AliyunEBS'">
          {{$t('error.invalid')+$t('primaryStorage.tdcConfigContent')}} {{jsonErrorMsg === '' ? '' :
          `(${jsonErrorMsg})`}}
        </div>
      </div>


      <div class="operation-row">
        <div class="title">
          {{ $t('common.cluster') }}
        </div>
        <div v-if="clusterUuid.length > 0">
          <add-or-delete-input :value="this.dbData.cluster[clusterUuid] && this.dbData.cluster[clusterUuid].name"
                               @remove="removeCluster()"></add-or-delete-input>
        </div>
        <cluster-single-dlg :message="message" :model="showClusterSelectDlg" @close="close">
        </cluster-single-dlg>
        <div class="content" @click="openSelectClusterDlg()" v-if="clusterUuid.length===0">
          <div class="add"></div>
        </div>
      </div>

      <div class="diskUuid operation-row" v-if="windowData.type === 'SharedBlock'">
        <div class="title required">
          {{$t("common.SharedBlock")}}
        </div>
        <help-trigger name="diskUuid"/>
        <div v-for="(diskUuid, i) of diskList" :key="diskUuid">
          <input :value="diskUuid" readonly/>
          <div class="delete-param" @click="deleteDisk(i)"></div>
        </div>
      </div>
      <div id="common-disk" class="operation-row" style="padding-top: 0;" v-if="windowData.type === 'SharedBlock'">
        <div class="content" @click="addDisk()">
          <div class="add"></div>
        </div>
      </div>
      <component style="margin-top: 20px;" :is="forceWipeItem.ctrl" :param="forceWipeItem.param"
                 v-if="canShow(forceWipeItem)"/>

    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('primarystorage')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  import Validator from 'src/utils/validator';
  import PrimaryStorageList from './List';
  import Assistant from './Assistant/CreatePrimaryStorage';
  import CreateTemplate from 'src/component/CreateTemplate';
  import RadioButtonGroup from 'src/component/FullPanel/RadioButtonGroup';
  import Checkbox from 'src/component/FullPanel/CheckBox';
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import FullPanel from 'src/windows/Base/FullPanel'
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon'
  import ApiNasAccessGroupService from 'src/api/nas.accessgroup.js'
  import ApiNasFilesystemService from 'src/api/nas.filesystem.js'
  import 'ace-builds/src-min-noconflict/ace.js'
  import 'ace-builds/src-min-noconflict/mode-json.js'
  import 'ace-builds/src-min-noconflict/theme-chrome.js'

  export default {
    name: "CreatePrimaryStoragePage",
    mixins: [WindowBase, Root, PrimaryStorageList, FullPanel, Assistant],
    components: {
      AddOrDeleteInput,
      CreateTemplate,
      ClusterSingleDlg
    },
    data() {
      return {
        jsonErrorMsg: '',
        clusterUuid: '',
        psTypes: [
          'LocalStorage',
          'NFS',
          'SharedMountPoint',
          'Ceph'
        ],
        showClusterSelectDlg: false,
        message: {},
        diskList: [],
        nasFsList_all: [],
        nasAccessGroupList_all: [],
        nasFsList_filter: [],
        nasAccessGroupList_filter: [],
        selectedNasFs: {},
        nasFileSystem: '',
        nasAccessGroup: '',
        selectedNasAccessGroup: {},
        thinProvision: false,
        forceWipe: false,
        nocephx: false,
        canCreate: true,
        itemList: [
          {
            id: 'thinProvision',
            param: {
              getTitle: () => this.$t('primaryStorage.storageSpaceAllocatorStrategy'),
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
              getValue: () => this.thinProvision,
              setValue: value => {
                this.thinProvision = value
              }
            },
            ctrl: RadioButtonGroup
          }, {
            id: 'nocephx',
            param: {
              getTitle: () => {
              },
              getDescription: () => this.$t('primaryStorage.nocephx'),
              getValue: () => this.nocephx,
              doc: 'nocephx',
              setValue: value => {
                this.nocephx = value
              }
            },
            ctrl: Checkbox
          }
        ],
        forceWipeItem: {
          id: 'forceWipe',
          param: {
            getTitle: () => {
            },
            getDescription: () => this.$t('primaryStorage.forceWipe'),
            getValue: () => this.forceWipe,
            getWarning: () => this.$t(`primaryStorage.cleanBlock${this.forceWipe ? 'Checked' : 'Unchecked'}`),
            setValue: value => {
              this.forceWipe = value
            }
          },
          ctrl: Checkbox
        }
      }
    },
    created() {

      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')

      if (this.dbData.common.license && this.dbData.common.license.licenseType !== 'Community') {
        this.psTypes.push('SharedBlock')
      }
      if (this.dbData.common.license && _.includes(['Hybrid', 'HybridTrialExt'], this.dbData.common.license.licenseType)) {
        this.psTypes.push('AliyunNAS')
        this.psTypes.push('AliyunEBS')
      }
      this.updateWindow({
        clusterUuidList: [],
        name: '',
        description: '',
        type: 'LocalStorage',
        url: '',
        monIp: '',
        password: '',
        cidr: '',
        zoneUuid: curSelectZoneUuid,
        sshPort: 22,
        clusterWindowId: `ClusterDlg-${this.genUniqueId()}`,
        showClusterDlg: false,
        username: 'root',
        moreMonParams: [],
        samePort: true,
        sameUsername: true,
        useSamePassword: true,
        nocephx: false,
        forceWipe: false,
        tdcConfigContent: {
          'tdcPort': '20120',
          'tdcRegion': 'region1',
          'riverMaster': 'nuwa://ECS-river/sys/houyi/river_master',
          'server': '192.168.0.1:10240,192.168.0.2:10240,192.168.0.3:10240',
          'proxy': '192.168.1.1:10240,192.168.1.2:10240,192.168.1.3:10240',
          'cluster': 'ECS-river'
        },
        psTypes: [
          'LocalStorage',
          'NFS',
          'SharedMountPoint'
        ]
      }).then(() => {
        this.queryCluster()
      })
      this.queryPsTypes()
      this.queryForAssistant()
      // this.queryAllSharedBlock()
      if (!this.dbData.common.isOpensource) {
        this.queryAllNasFs()
        this.queryAllNasAccessGroup()
      }
    },
    mounted() {
      this.addTDCConfigContentComponent()
    },
    methods: {
      ...Utils,
      removeCluster() {
        this.clusterUuid = '';
      },
      close(uuid) {
        this.showClusterSelectDlg = false;

        if (!uuid || uuid.length <= 0) return;
        this.clusterUuid = uuid;

      },
      openSelectClusterDlg() {
        this.showClusterSelectDlg = true;
        this.message.selectType = 'selection';
      },
      canShow(item) {
        if (this.windowData.type !== 'Ceph' && item.id === 'nocephx') return false
        if (this.windowData.type !== 'SharedBlock' && _.includes(['thinProvision', 'forceWipe'], item.id)) return false
        return true
      },
      isHybrid: function () {
        if (!this.dbData.common.license) return false;

        return _.includes(['Hybrid', 'HybridTrialExt'], this.dbData.common.license.licenseType)
      },
      addTDCConfigContentComponent: function () {
        let editorEle = document.querySelector('#json-editor')
        const self = this
        self.editor = ace.edit(editorEle)
        self.editor.session.setMode('ace/mode/json')
        self.editor.setTheme('ace/theme/chrome')
        this.editor.setShowPrintMargin(false)
        if (_.isString(self.windowData.tdcConfigContent)) {
          self.editor.setValue(self.windowData.tdcConfigContent)
        } else {
          self.editor.setValue(JSON.stringify(self.windowData.tdcConfigContent, null, 2))
        }
        self.editor.session.selection.clearSelection()
        self.editor.getSession().on('change', function () {
          update(self)
        })

        function update() {
          let val = self.editor.getSession().getValue()
          self.updateWindow({
            tdcConfigContent: val
          })
        }
      },
      isJSON(str) {
        try {
          var obj = JSON.parse(str)
          if (typeof obj === 'object' && obj) {
            return true
          } else {
            return false
          }
        } catch (e) {
          this.jsonErrorMsg = e.message
          return false
        }
      },
      openFullEditor: function () {
        let self = this
        self.openDialog('TemplateEditorDlg', {
          templateContent: self.editor.getValue(),
          ok: (templateContent) => {
            self.editor.setValue(templateContent)
            self.updateWindow({
              tdcConfigContent: self.editor.getValue()
            })
          }
        })
      },
      queryAllNasFs: async function () {
        let resp = await ApiNasFilesystemService.queryList()
        this.nasFsList_all = resp.inventories
        this.nasFsList_filter = resp.inventories
      },
      queryAllNasAccessGroup: async function () {
        let resp = await ApiNasAccessGroupService.queryList()
        this.nasAccessGroupList_all = resp.inventories
        this.nasAccessGroupList_filter = resp.inventories
      },
      selectNasFs: function (item) {
        this.selectedNasFs = item;
        this.nasFileSystem = item.name;
        this.nasFsList_filter = this.nasFsList_all.map((obj) => {
          if (item.dataCenterUuid === obj.dataCenterUuid) {
            return obj
          }
        })
        if (this.selectedNasFs.dataCenterUuid !== this.selectedNasAccessGroup.dataCenterUuid) {
          this.selectedNasAccessGroup = {}
          this.nasAccessGroup = '';
        }
      },
      selectNasAccessGroup: function (item) {
        this.selectedNasAccessGroup = item
        this.nasAccessGroup = item.name;
        this.nasAccessGroupList_filter = this.nasAccessGroupList_all.map((obj) => {
          if (item.dataCenterUuid === obj.dataCenterUuid) {
            return obj
          }
        })
        if (this.selectedNasAccessGroup.dataCenterUuid !== this.selectedNasFs.dataCenterUuid) {
          this.selectedNasFs = {}
          this.nasFileSystem = '';
        }
      },
      addDisk: function () {
        let self = this
        if (self.clusterUuid === '') {
          return
        }
        self.openSideWindowForCreate('SharedBlockSelectListDlg', {
          filterUuids: self.diskList,
          clusterUuid: self.clusterUuid,
          select: (diskUuids) => {
            let mergeUniqueArray = _.union(self.diskList, diskUuids)
            self.diskList = mergeUniqueArray
          }
        })
      },
      deleteDisk: function (i) {
        this.diskList.splice(i, 1)
      },
      switchType: async function (e) {
        debugger
        await this.updateWindow({'type': e})
        this.initWindowData()
        await this.queryCluster()
        this.queryForAssistant()
        if (this.windowData.type === 'AliyunEBS') {
          this.addTDCConfigContentComponent()
        }
      },
      queryCluster: async function () {
        const self = this
        if (self.dbData.common.isAdmin) {
          let uuidList = await primaryStorageConditon.getPrimaryStorageAttachableClusterByType(self.windowData.type, self.dbData.common.isOpensource) // Created by weiqi on 2017/8/22
          await rpc.query('clusters', {
            q: [`zoneUuid=${self.windowData.zoneUuid}`, 'hypervisorType=KVM', `uuid?=${uuidList}`, 'state=Enabled']
          }).then((resp) => {
            self.updateDbTable({
              tableName: 'cluster',
              list: resp.inventories
            })
            if (resp.inventories.length === 1) {
              self.clusterUuid = resp.inventories[0].uuid
            } else {
              self.clusterUuid = ''
            }
          })
        }
      },
      ...Validator,
      createParam() {
        const self = this
        let data = this.windowData
        let hash = {
          'LocalStorage': 'local-storage',
          'NFS': 'nfs',
          'Ceph': 'ceph',
          'Fusionstor': 'fusionstor',
          'SharedMountPoint': 'smp',
          'SharedBlock': 'SharedBlock',
          'AliyunNAS': 'AliyunNAS',
          'AliyunEBS': 'AliyunEBS'
        }
        let systemTags = []
        if (data.cidr !== '' && data.cidr !== undefined && (data.type === 'Ceph' || data.type === 'NFS' || data.type === 'SharedMountPoint' || data.type === 'Fusionstor' || data.type === 'SharedBlock')) {
          systemTags.push(`primaryStorage::gateway::cidr::${data.cidr}`)
        }
        if (data.type === 'LocalStorage' || data.type === 'NFS' || data.type === 'SharedMountPoint') {
          if (data.type === 'NFS') {
            if (data.mountOptions) {
              systemTags.push(`nfs::mount::options::${data.mountOptions}`)
            }
          }
          return {
            name: data.name,
            type: hash[data.type],
            url: data.url,
            systemTags: systemTags,
            zoneUuid: data.zoneUuid,
            description: data.description,
            clusterUuid: this.clusterUuid
          }
        } else if (data.type === 'AliyunNAS') {
          return {
            name: data.name,
            description: data.description,
            type: hash[data.type],
            url: data.url,
            nasUuid: this.selectedNasFs.uuid,
            accessGroupUuid: this.selectedNasAccessGroup.uuid,
            clusterUuid: this.clusterUuid,
            zoneUuid: data.zoneUuid,
            systemTags: systemTags
          }
        } else if (data.type === 'AliyunEBS') {
          self.editor.setValue(self.editor.getValue())
          self.updateWindow({
            tdcConfigContent: self.editor.getValue()
          })
          return {
            name: data.name,
            description: data.description,
            type: hash[data.type],
            url: data.url,
            identityZoneUuid: this.windowData.identityZoneUuid,
            clusterUuid: this.clusterUuid,
            zoneUuid: data.zoneUuid,
            tdcConfigContent: this.windowData.tdcConfigContent,
            systemTags: systemTags
          }
        } else if (data.type === 'SharedBlock') {
          if (this.forceWipe) {
            systemTags.push('forceWipe')
          }
          if (this.thinProvision) {
            systemTags.push('primaryStorageVolumeProvisioningStrategy::ThinProvisioning')
          }
          return {
            name: data.name,
            type: hash[data.type],
            diskUuids: this.diskList,
            description: data.description,
            zoneUuid: data.zoneUuid,
            clusterUuid: this.clusterUuid,
            systemTags: systemTags
          }
        } else {
          let monUrls = []
          let url = `${data.username}:${data.password}@${data.monIp}:${data.sshPort}`
          monUrls.push(url)
          if (data.createMore) {
            data.moreMonParams.forEach((item) => {
              let username = data.sameUsername ? data.username : item.username
              let password = data.useSamePassword ? data.password : item.password
              let sshPort = data.samePort ? data.sshPort : item.sshPort
              monUrls.push(`${username}:${password}@${item.monIp}:${sshPort}`)
            })
          }
          let p = {
            type: hash[data.type],
            monUrls: monUrls,
            name: data.name,
            zoneUuid: data.zoneUuid,
            description: data.description,
            systemTags: systemTags,
            imageCachePoolName: data.imageCachePoolName === '' ? undefined : data.imageCachePoolName,
            dataVolumePoolName: data.dataVolumePoolName === '' ? undefined : data.dataVolumePoolName,
            rootVolumePoolName: data.rootVolumePoolName === '' ? undefined : data.rootVolumePoolName,
            clusterUuid: this.clusterUuid
          }
          if (data.type === 'Ceph' && this.nocephx) {
            p.systemTags.push('ceph::nocephx')
          }
          return p
        }
      },
      queryPsTypes() {
        return rpc.query('backup-storage')
          .then(resp => {
            let BsTypes = _.uniq(resp.inventories.map(item => item.type))
            let psTypes = _.cloneDeep(this.windowData.psTypes)
            BsTypes.forEach(type => {
              if (
                type !== 'ImageStoreBackupStorage' && type !== 'VCenter' && type !== 'SftpBackupStorage') psTypes.push(type)
            })
            return this.updateWindow({psTypes: psTypes})
          })
      },
      psAttachCluster: async function (type) {
        let uuidList = []
        uuidList = await primaryStorageConditon.getPrimaryStorageAttachableClusterByType(type, this.dbData.common.isOpensource)
        await this.openSideWindowForCreate('PrimaryStorageAttachClusterSingleSelectListDlg', {
          conditions: [`uuid?=${uuidList}`],
          zoneUuid: this.windowData.zoneUuid,
          select: (uuid) => this.selectCluster(uuid)
        })
      },
      selectCluster: function (uuid) {
        this.clusterUuid = uuid
        this.queryForAssistant()
      },
      toggleMoreDropdownDlg($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      initWindowData: function () {
        if (this.windowData.type === 'Ceph' || this.windowData.type === 'Fusionstor') {
          this.updateWindow({
            createMore: false,
            monIp: '',
            sshPort: 22,
            username: 'root',
            password: ''
          })
        }
      },
      selectZone(uuid) {
        this.updateWindow({zoneUuid: uuid})
      },
      addMoreMon: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return
        let monIpArr = [this.windowData.monIp]
        for (let item of this.windowData.moreMonParams) {
          monIpArr.push(item.monIp)
        }
        let isEmpty = monIpArr.some((item) => {
          if (item.trim() === '') {
            return true
          }
        })
        if (isEmpty) {
          return
        }
        let param = {
          monIp: '',
          sshPort: 22,
          username: 'root',
          password: ''
        }
        let moreMonParams = _.cloneDeep(this.windowData.moreMonParams)
        moreMonParams.push(param)
        this.updateWindow({moreMonParams})
        this.updateWindow({createMore: true})
      },
      deleteMonParam: function (i) {
        let moreMonParams = _.cloneDeep(this.windowData.moreMonParams)
        moreMonParams.splice(i, 1)
        if (moreMonParams.length === 0) {
          this.updateWindow({
            createMore: false
          })
        }
        this.updateWindow({moreMonParams})
      },
      openSelectHybridIdentityZoneDlg: function () {
        let conditions = []
        conditions.push(`type=AliyunEBS`)
        this.openDialog('HybridAliCloudIdentityZoneSingleSelect', {
          conditions: conditions,
          select: (uuid) => this.selectHybridIdentityZone(uuid)
        })
      },
      selectHybridIdentityZone: function (uuid) {
        this.updateWindow({identityZoneUuid: uuid})
      },
      updateParam: function (index, prop, value) {
        let moreMonParams = _.cloneDeep(this.windowData.moreMonParams)
        moreMonParams[index][prop] = value
        this.updateWindow({moreMonParams})
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let propToBeTrimed = ['name', 'cidr', 'url']
        let input = (propToBeTrimed.indexOf(name) > -1 || name.indexOf('monIp') > -1) ? this.trimProp(name) : windowData[name]
        if (this.windowData.moreMonParams.length > 0 && name.indexOf('_') > -1) {
          let tempName = name.split('_')
          input = this.windowData.moreMonParams[tempName[1]][tempName[0]]
        }
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'url') {
          if (this.windowData.type === 'NFS') {
            if (!this.isPath(input, 'nfs')) {
              obj[`invalid${name}`] = true
            }
          } else {
            if (this.windowData.type !== 'AliyunEBS') {
              if (!this.isPath(input)) {
                obj[`invalid${name}`] = true
              }
            }
          }
        }
        if (name === 'cidr') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name.indexOf('sshPort') > -1) {
          if (!this.isUint(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name.indexOf('monIp') > -1) {
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'imageCachePoolName' || name === 'dataVolumePoolName' || name === 'rootVolumePoolName') {
          if (!this.isPoolName(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'tdcConfigContent') {
          this.jsonErrorMsg = ''
          if (!this.isJSON(this.windowData.tdcConfigContent)) obj[`invalid${name}`] = true
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let type = this.windowData.type
        let allValidations = []
        let isInvalid
        let props
        let poolProps = ['imageCachePoolName', 'dataVolumePoolName', 'rootVolumePoolName']
        if (type === 'LocalStorage' || type === 'NFS' || type === 'SharedMountPoint' || type === 'AliyunNAS' || type === 'AliyunEBS') {
          props = ['name', 'url']
          if (type === 'AliyunEBS') {
            props.push('identityZoneUuid')
            props.push('tdcConfigContent')
          }
        } else if (type === 'SharedBlock') {
          props = ['name']
        } else if (type === 'Ceph' || type === 'Fusionstor') {
          props = ['name', 'monIp', 'sshPort', 'username', 'password']
        }
        if (type === 'Ceph') {
          poolProps.forEach((item) => {
            if (this.windowData[item]) props.push(item)
          })
        }
        if (this.windowData.cidr && (type === 'Ceph' || type === 'NFS' || type === 'SharedMountPoint' || type === 'Fusionstor')) {
          props.push('cidr')
        }
        props.forEach(item => this.validate(item))
        isInvalid = props.some(item => {
          if (poolProps.indexOf(item) > -1) return this.windowData[`invalid${item}`]
          else return this.windowData[`empty${item}`] === true
        })
        allValidations.push(isInvalid)
        let paramsCount = ['Ceph', 'Fusionstor'].indexOf(type) > -1 && this.windowData.moreMonParams.length
        if (paramsCount > 0) {
          for (let i = 0; i < paramsCount; i++) {
            this.validate('monIp_' + i)
            isInvalid = this.windowData['emptymonIp_' + i] || this.windowData['invalidmonIp_' + i]
            allValidations.push(isInvalid)
            if (!this.windowData.samePort) {
              this.validate('sshPort_' + i)
              isInvalid = this.windowData['emptysshPort_' + i] || this.windowData['invalidsshPort_' + i]
              allValidations.push(isInvalid)
            }
            if (!this.windowData.sameUsername) {
              this.validate('username_' + i)
              isInvalid = this.windowData['emptyusername_' + i]
              allValidations.push(isInvalid)
            }
            if (!this.windowData.useSamePassword) {
              this.validate('password_' + i)
              isInvalid = this.windowData['emptypassword_' + i]
              allValidations.push(isInvalid)
            }
          }
        }
        if (allValidations.some(validation => validation)) obj.invalidInput = true
        if (this.isMonIpRepeat()) {
          obj.invalidInput = true
        }
        if (obj.invalidInput === false && type === 'SharedBlock') {
          if (this.diskList.length > 0) {
            obj.invalidInput = false
          } else {
            obj.invalidInput = true
          }
        }
        if (type === 'AliyunNAS') {
          if (!(this.selectedNasFs.dataCenterUuid || this.selectedNasAccessGroup.dataCenterUuid)) {
            obj.invalidInput = true
          }
        }
        this.updateWindow(obj)
      },
      isMonIpRepeat() {
        let monIpArr = [this.windowData.monIp]
        for (let item of this.windowData.moreMonParams) {
          monIpArr.push(item.monIp)
        }
        return Utils.isArrRepeat(monIpArr)
      },
      ...Utils,
      ok() {
        this.validateAll()
        if (this.windowData.invalidInput || !this.windowData.zoneUuid) return
        this.canCreate = false;
        this.create(this.createParam())
        .then(() => {
           this.$router.push({name: 'primarystorage'});
        }).catch(() => {
          this.canCreate = true;
        })
      }
    }
  }
</script>
