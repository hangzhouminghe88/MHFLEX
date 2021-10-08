<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #dae0e6;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width: 303px
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

  .el-select {
    width: 100%;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("common.addBackupStorage")}}
        </span>
      <span class="create-back" @click="$router.push('backupstorage')"><i class="el-icon-back"></i>回到镜像服务器列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title">
          {{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[windowData.zoneUuid] &&
          dbData.zone[windowData.zoneUuid].name}}
        </div>
      </div>

      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t('common.name')}}
        </div>
        <help-trigger name="backupStorageInfoNotHybrid" v-if="!isHybrid()"/>
        <help-trigger name="backupStorageInfoHybrid" v-else/>
        <input maxlength="255" v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keydown.enter="validate('name')"/>
        <div id="common-name" class="error error-text" v-if="windowData.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>

      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>

      <div id="common-type" class="operation-row zs-select">
        <div class="title">
          {{$t('common.type')}}
        </div>
        <!-- <help-trigger name="backupStorage" /> -->
        <help-trigger name="backupStorageTypeNotHybrid" v-if="!isHybrid()"/>
        <help-trigger name="backupStorageTypeHybrid" v-else/>
        <el-select v-model="windowData.type" placeholder="请选择">
          <el-option
            v-for="item in BsTypes"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </div>

      <div class="operation-row" v-if="windowData.createMore">
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

      <div v-if=" windowData.type === 'ImageStore' || windowData.type === 'Sftp' || windowData.type === 'AliyunEBS' ">
        <div id="common-backupStorageIp" class="operation-row" v-if="windowData.type !== 'AliyunEBS'">
          <div class="title required">
            {{$t('common.backupStorageIp')}}
          </div>
          <input maxlength="255" :class="{'is-error': windowData.emptyhostname || windowData.invalidhostname}"
                 v-model="windowData.hostname" @input="(e) => { updateWindow({ 'hostname': e.target.value }) }"
                 placeholder="192.168.0.1" @blur="validate('hostname')" @keydown.enter="validate('hostname')"/>
          <div id="common-backupStorageIp" class="error error-text"
               v-if="windowData.emptyhostname && windowData.type !== 'AliyunEBS'">
            {{$t('error.emptyInput')+$t('common.backupStorageIp')}}
          </div>
          <div id="common-backupStorageIp" class="error error-text"
               v-if="!windowData.emptyhostname && windowData.invalidhostname && windowData.type !== 'AliyunEBS'">
            {{$t('error.invalid')+$t('common.backupStorageIp')}}
          </div>
        </div>

        <div id="common-url" class="operation-row">
          <div class="title required">
            {{$t('common.url')}}
          </div>
          <help-trigger name="backupStorageUrl" v-if="windowData.type === 'ImageStore' || windowData.type === 'Sftp'"/>
          <help-trigger name="AliyunEBSBackupStorageUrl" v-if="windowData.type === 'AliyunEBS'"/>
          <input maxlength="255" v-model="windowData.url"
                 :class="{'is-error': windowData.emptyurl || windowData.invalidurl}"
                 @input="(e) => { updateWindow({ 'url': e.target.value }) }"
                 :placeholder="windowData.type === 'AliyunEBS' ? 'http:/127.0.0.1:18080/ocean/api' : `/${$t('common.productionNameForPlaceholderLowerCase')}_bs`"
                 @blur="validate('url')" @keydown.enter="validate('url')"/>
          <div id="common-url" class="error error-text"
               v-if="(windowData.type === 'ImageStore' || windowData.type === 'Sftp' || windowData.type === 'AliyunEBS') && windowData.emptyurl">
            {{$t('error.emptyInput')+$t('common.url')}}
          </div>
          <div id="common-url" class="error error-text"
               v-if="(windowData.type === 'ImageStore' || windowData.type === 'Sftp' || windowData.type === 'AliyunEBS') && !windowData.emptyurl && windowData.invalidurl">
            {{$t('error.invalid')+$t('common.url')}}
          </div>
        </div>

      </div>

      <div class="operation-row" v-if="windowData.type === 'AliyunEBS'">
        <div class="title required">{{ $t("hybridbucket.bucket") }}</div>
        <div class="content" @click="openBucketNameDlg()">
          {{ dbData.hybridBucket[windowData.ossBucketUuid] && dbData.hybridBucket[windowData.ossBucketUuid].bucketName
          }}
          <div class="add" v-show="!windowData.ossBucketUuid"></div>
          <div class="delete" v-show="windowData.ossBucketUuid"
               @click="clearRow('ossBucketUuid'); $event.stopPropagation();validate('ossBucketUuid')"></div>
        </div>
        <div id="common-cluster" class="error error-text"
             v-if="windowData.emptyossBucketUuid && windowData.type === 'AliyunEBS'">
          {{$t('error.unselected')+$t('hybridbucket.bucket')}}
        </div>
      </div>

      <div id="common-addImageStore" v-if=" windowData.type === 'ImageStore' || windowData.type === 'Sftp' "
           class="operation-row addImageStore-option">
        <el-checkbox v-model="windowData.importImages" v-permission="'LICENSE_BASIC_PAID'">
          {{$t("common.importImages")}}
        </el-checkbox>
        <help-trigger name="backupStorageImportImages"/>
      </div>

      <div id="common-monIp" class="operation-row"
           v-if="windowData.type === 'Ceph' || windowData.type === 'Fusionstor'">
        <div class="title required">
          {{$t('common.monIp')}}
        </div>
        <input maxlength="255" v-model="windowData.monIp"
               :class="{'is-error': windowData.emptymonIp || windowData.invalidmonIp || windowData.sameInvalidmonIp}"
               @input="(e) => { updateWindow({ 'monIp': e.target.value }) }" placeholder="192.168.0.1"
               @blur="validate('monIp')" @keydown.enter="validate('monIp')"/>
        <div id="common-monIp" class="error error-text"
             v-if="!(windowData.type === 'ImageStore' || windowData.type === 'Sftp') && windowData.emptymonIp">
          {{$t('error.emptyInput')+$t('common.monIp')}}
        </div>
        <div id="common-monIp" class="error error-text"
             v-if="!(windowData.type === 'ImageStore' || windowData.type === 'Sftp') && !windowData.emptymonIp && windowData.invalidmonIp">
          {{$t('error.invalid')+$t('common.monIp')}}
        </div>
        <div id="common-monIp" class="error error-text"
             v-if="!(windowData.type === 'ImageStore' || windowData.type === 'Sftp') && !windowData.emptymonIp && !windowData.invalidmonIp && windowData.sameInvalidmonIp">
          {{$t('error.same')+$t('common.monIp')}}
        </div>
      </div>

      <div id="common-sshPort" class="operation-row" v-if="windowData.type !== 'AliyunEBS'">
        <div class="title required">
          {{$t('common.sshPort')}}
        </div>
        <input maxlength="255" type="number" step="any" v-model="windowData.sshPort"
               :class="{'is-error': windowData.emptysshPort || windowData.invalidsshPort}"
               @input="(e) => { updateWindow({ 'sshPort': e.target.value }) }" @blur="validate('sshPort')"
               @keydown.enter="validate('sshPort')"/>
        <div id="common-sshPort" class="error error-text" v-if="windowData.emptysshPort">
          {{$t('error.emptyInput')+$t('common.sshPort')}}
        </div>
        <div id="common-sshPort" class="error error-text" v-if="!windowData.emptysshPort && windowData.invalidsshPort">
          {{$t('error.invalid')+$t('common.sshPort')}}
        </div>
      </div>

      <div id="common-username" class="operation-row" v-if="windowData.type !== 'AliyunEBS'">
        <div class="title required">
          {{$t('common.username')}}
        </div>
        <input maxlength="255" v-model="windowData.username" :class="{'is-error': windowData.emptyusername}"
               @input="(e) => { updateWindow({ 'username': e.target.value }) }" @blur="validate('username')"
               @keydown.enter="validate('username')"/>
        <div id="common-username" class="error error-text" v-if="windowData.emptyusername">
          {{$t('error.emptyInput')+$t('common.username')}}
        </div>
      </div>

      <div id="common-password" class="operation-row" v-if="windowData.type !== 'AliyunEBS'">
        <div class="title required">
          {{$t('common.password')}}
        </div>
        <input maxlength="255" type="password" v-model="windowData.password"
               :class="{'is-error': windowData.emptypassword}"
               @input="(e) => { updateWindow({ 'password': e.target.value }) }" @blur="validate('password')"
               @keydown.enter="validate('password')"/>
        <div id="common-password" class="error error-text" v-if="windowData.emptypassword">
          {{$t('error.emptyInput')+$t('common.password')}}
        </div>
      </div>

      <div v-if="windowData.createMore" v-for="(param, i) in windowData.moreMonParams">
        <div id="common-monIp" class="operation-row">
          <div class="title required">
            {{$t("common.monIp")}}
          </div>
          <div class="input-wrapper">
            <input v-model="windowData.moreMonParams[i].monIp" maxlength="255"
                   @input="(e) => { updateParam(i, 'monIp', e.target.value) }"
                   :class="{'is-error': windowData['emptymonIp_' + i] || windowData['invalidmonIp_' + i] || windowData['sameInvalidmonIp_' + i]}"
                   @blur="validate('monIp_' + i)" @keywown.enter="validate('monIp_' + i)"/>
            <div class="delete-param" @click="deleteMonParam(i, $event)"></div>
          </div>
          <div id="common-monIp" class="error error-text" v-if="windowData['emptymonIp_' + i]">
            {{$t("error.emptyInput")+$t("common.monIp")}}
          </div>
          <div id="common-monIp" class="error error-text"
               v-if="!windowData['emptymonIp_' + i] && windowData['invalidmonIp_' + i]">
            {{$t("error.invalid")+$t("common.monIp")}}
          </div>
          <div id="common-monIp" class="error error-text"
               v-if="!windowData['emptymonIp_' + i] && !windowData['invalidmonIp_' + i] && windowData['sameInvalidmonIp_' + i]">
            {{$t("error.same")+$t("common.monIp")}}
          </div>
        </div>

        <div id="common-sshPort" class="operation-row" v-if="!windowData.samePort">
          <div class="title required">
            {{$t("common.sshPort")}}
          </div>
          <input v-model="windowData.moreMonParams[i].sshPort" type="number" step="any"
                 @input="(e) => { updateParam(i, 'sshPort', e.target.value) }"
                 :class="{'is-error': windowData['emptysshPort_' + i] || windowData['invalidsshPort_' + i]}"
                 @blur="validate('sshPort_' + i)" @keywown.enter="validate('sshPort_' + i)"/>
          <div id="common-sshPort" class="error error-text" v-if="windowData['emptysshPort_' + i]">
            {{$t("error.emptyInput")+$t("common.sshPort")}}
          </div>
          <div id="common-sshPort" class="error error-text"
               v-if="!windowData['emptysshPort_' + i] && windowData['invalidsshPort_' + i]">
            {{$t("error.invalid")+$t("common.sshPort")}}
          </div>
        </div>

        <div id="user-name" class="operation-row" v-if="!windowData.sameUsername">
          <div class="title required">
            {{$t("user.name")}}
          </div>
          <input v-model="windowData.moreMonParams[i].username" maxlength="255"
                 @input="(e) => { updateParam(i, 'username', e.target.value) }"
                 :class="{'is-error': windowData['emptyusername_' + i]}" @blur="validate('username_' + i)"
                 @keywown.enter="validate('username_' + i)"/>
          <div id="user-name" class="error error-text" v-if="windowData['emptyusername_' + i]">
            {{$t("error.emptyInput")+$t("user.name")}}
          </div>
        </div>

        <div id="common-password" class="operation-row" v-if="!windowData.useSamePassword">
          <div class="title required">
            {{$t("common.password")}}
          </div>
          <input type="password" maxlength="255" v-model="windowData.moreMonParams[i].password"
                 @input="(e) => { updateParam(i, 'password', e.target.value) }"
                 :class="{'is-error': windowData['emptypassword_' + i]}" @blur="validate('password_' + i)"
                 @keywown.enter="validate('password_' + i)"/>
          <div id="common-password" class="error error-text" v-if="windowData['emptypassword_' + i]">
            {{$t("error.emptyInput")+$t("common.password")}}
          </div>
        </div>

      </div>

      <div class="operation-row" v-if="windowData.type === 'Ceph' || windowData.type === 'Fusionstor' ">
        <div class="title">
          {{$t("common.addMore")}}
        </div>
        <div class="content" @click="addMoreMon()">
          <div class="add"></div>
        </div>
      </div>

      <div id="common-poolName" class="operation-row"
           v-if=" windowData.type === 'Ceph' || windowData.type === 'Fusionstor'">
        <div class="title">
          {{$t('common.poolName')}}
        </div>
        <help-trigger name="backupStoragePoolName"/>
        <input maxlength="255" type="text" v-model="windowData.poolName"
               @input="(e) => { updateWindow({ 'poolName': e.target.value }) }"
               :class="{'is-error': windowData.poolName && windowData.invalidpoolName}" @blur="validate('poolName')"
               @keywown.enter="validate('poolName')"/>
        <div class="error error-text" v-if="windowData.poolName && windowData.invalidpoolName">
          {{$t("error.invalid")+$t("common.poolName")}}
        </div>
      </div>

      <div id="backupStorage-syncImageNetwork" class="operation-row" v-if="windowData.type === 'ImageStore'">
        <div class="title">
          {{$t("backupStorage.syncImageNetwork")}}
          <help-trigger name="syncImageNetwork"/>
        </div>
        <input v-model="windowData.syncImageNetwork" :class="{'is-error': windowData.invalidsyncImageNetwork}"
               @input="(e) => { updateWindow({ 'syncImageNetwork': e.target.value }) }"
               @blur="validate('syncImageNetwork')" placeholder="192.168.1.0/24"
               @keydown.enter="validate('syncImageNetwork')"/>
        <div id="backupStorage-syncImageNetwork" class="error error-text"
             v-if="windowData.type === 'ImageStore' && !windowData.emptysyncImageNetwork && windowData.invalidsyncImageNetwork">
          {{$t("error.invalid")+$t("backupStorage.syncImageNetwork")}}
        </div>
      </div>


    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="handleCommit">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('primarystorage')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import PrimaryStorageList from './List';
  import CreateTemplate from 'src/component/CreateTemplate';
  import Validator from 'src/utils/validator';

  export default {
    name: "CreateBackupStoragePage",
    mixins: [WindowBase, Root, PrimaryStorageList],
    components: {
      CreateTemplate
    },
    data() {
      return {
        BsTypes: []
      }
    },
    created() {
      if (this.dbData.common.isOpensource) {
        this.BsTypes = [
          'Sftp',
          'Ceph'
        ]
      } else {
        this.BsTypes = [
          'ImageStore',
          'Ceph'
        ]
      }

      /*
      if (_.includes(['Hybrid', 'HybridTrialExt'], this.dbData.common.license.licenseType)) {
        this.BsTypes.push('AliyunEBS')
      }*/

      //this.deleteAllAssistant()
      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')
      //if (this.param.ZoneUuid !== undefined) curSelectZoneUuid = this.param.ZoneUuid
      this.updateWindow({
        name: '',
        description: '',
        url: '',
        sshPort: 22,
        type: this.BsTypes[0],
        username: 'root',
        hostname: '',
        password: '',
        monIp: '',
        syncImageNetwork: '',
        cidr: '',
        ossBucket: '',
        ossBucketUuid: '',
        zoneUuid: curSelectZoneUuid,
        moreMonParams: [],
        samePort: true,
        sameUsername: true,
        useSamePassword: true,
        importImages: false
      })

      this.queryForAssistant()
      window.addEventListener('click', this.onWindowClick)
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
      this.deleteCurrAssistant(this.windowData.id)
    },
    methods: {
      ...Validator,
      toggleMoreSetting: function () {
        let showMoreSetting = this.windowData.showMoreSetting
        this.updateWindow({
          showMoreSetting: !showMoreSetting
        })
      },
      onWindowClick: function () {
        if (this.windowData.showMoreDropdownType) this.updateWindow({showMoreDropdownType: false})
      },
      isHybrid: function () {
        //return _.includes(['Hybrid', 'HybridTrialExt'], this.dbData.common.license.licenseType)
      },
      clearRow: function (rowName) {
        let obj = {}
        obj[rowName] = ''
        this.updateWindow(obj)
      },
      openBucketNameDlg: function () {
        const self = this
        self.openSideWindowForCreate('HybridBucketListSingleSelectDlg', {
          conditions: [],
          select: self.selectBucketName
        })
      },
      selectBucketName: function (uuid) {
        this.updateWindow({ossBucketUuid: uuid})
        this.validate('ossBucketUuid')
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let propToBeTrimed = ['name', 'url', 'hostname', 'syncImageNetwork']
        let input = (propToBeTrimed.indexOf(name) > -1 || name.indexOf('monIp') > -1) ? this.trimProp(name) : this.windowData[name]
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
        if (name === 'hostname' || name.indexOf('monIp') > -1) {
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'url') {
          if (this.windowData.type !== 'AliyunEBS') {
            if (!this.isPath(input)) {
              obj[`invalid${name}`] = true
            }
          }
        }
        if (name.indexOf('sshPort') > -1) {
          if (!this.isUint(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'poolName') {
          if (!this.isPoolName(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'syncImageNetwork') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let isInvalid
        let allValidations = []
        let type = this.windowData.type
        let props = ['name', 'username', 'password', 'sshPort']
        if (type === 'ImageStore' || type === 'Sftp') {
          props.push('hostname')
          props.push('url')
          if (type === 'ImageStore') {
            props.push('syncImageNetwork')
          }
        } else if (type !== 'AliyunEBS') {
          props.push('monIp')
        } else if (type === 'AliyunEBS') {
          props = ['name', 'url', 'ossBucketUuid']
        }
        if (type === 'Ceph' && this.windowData.poolName) {
          props.push('poolName')
        }
        props.forEach(item => this.validate(item))
        isInvalid = props.some(item => {
          if (item === 'poolName') return this.windowData[`invalid${item}`]
          else if (item === 'syncImageNetwork') return this.windowData[`invalid${item}`]
          else return this.windowData[`empty${item}`] || this.windowData[`invalid${item}`]
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
          this.checkSameMonIP()
        }
        this.updateWindow(obj)
      },
      createParam: function () {
        let hash = {
          'ImageStore': 'image-store',
          'Ceph': 'ceph',
          'Fusionstor': 'fusionstor',
          'Sftp': 'sftp',
          'AliyunEBS': 'AliyunEBS'
        }
        let data = this.windowData
        let param = {
          name: data.name,
          description: data.description,
          type: hash[data.type],
          zoneUuid: data.zoneUuid
        }
        if (data.type === 'ImageStore') {
          let systemTags = []
          if (data.syncImageNetwork) {
            systemTags.push(`sync::network::cidr::${data.syncImageNetwork}`)
          }
          return {
            hostname: data.hostname,
            sshPort: data.sshPort,
            username: data.username,
            password: data.password,
            url: data.url,
            importImages: data.importImages,
            systemTags,
            ...param
          }
        } else if (data.type === 'Sftp') {
          return {
            hostname: data.hostname,
            sshPort: data.sshPort,
            username: data.username,
            password: data.password,
            url: data.url,
            ...param
          }
        } else if (data.type === 'AliyunEBS') {
          return {
            url: data.url,
            ossBucketUuid: data.ossBucketUuid,
            ...param
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
          if (data.type === 'Ceph') {
            let p = {
              monUrls: monUrls,
              ...param
            }
            if (data.poolName !== '') {
              p['poolName'] = data.poolName
            }
            return p
          }
          return {
            monUrls: monUrls,
            ...param
          }
        }
      },
      queryForAssistant() {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          self.createAssistant({
            id,
            title: 'bsTitle',
            operation,
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
              self.openFullMainWindow(`Create${resourceName}Dlg`,
                {
                  ok: (param) => {
                    self[`create${resourceName}`](param)
                      .then(() => {
                        self.deleteAssistant(id)
                        this.windowData.zoneUuid = localStorage.getItem('currZoneUuid')
                      })
                  },
                  cancel: () => {
                    self.queryForAssistant()
                  }
                }
              )
            }
          })
        }
        rpc.query('zones', {count: true}).then(resp => {
          if (resp.total === 0) newAssistant('Zone', 'create')
        })
      },
      checkSameMonIP() {
        let obj = {}
        let repeatArr = []
        let allMonParams = _.cloneDeep(this.windowData.moreMonParams)
        allMonParams.push({
          uniqueId: this.windowData.moreMonParams.length,
          monIp: this.windowData.monIp,
          isDefault: true
        })
        for (let i = 0; i < allMonParams.length; i++) {
          let param = allMonParams[i]
          if (param.isDefault) {
            obj['sameInvalidmonIp'] = false
          } else {
            obj['sameInvalidmonIp_' + param.uniqueId] = false
          }
          for (let j = 0; j < allMonParams.length; j++) {
            let obj = allMonParams[j]
            if (param.monIp === obj.monIp && param.uniqueId !== obj.uniqueId) {
              repeatArr.push(param)
              break
            }
          }
        }
        for (let mon of repeatArr) {
          if (mon.isDefault) {
            obj['sameInvalidmonIp'] = true
          } else {
            obj['sameInvalidmonIp_' + mon.uniqueId] = true
          }
        }
        this.updateWindow(obj)
      },
      deleteMonParam: function (i) {
        let moreMonParams = _.cloneDeep(this.windowData.moreMonParams)
        moreMonParams.splice(i, 1)
        if (moreMonParams.length === 0) {
          this.updateWindow({
            samePort: true,
            sameUsername: true,
            useSamePassword: true,
            createMore: false
          })
        }
        let obj = {}
        obj['emptymonIp_' + i] = false
        obj['invalidmonIp_' + i] = false
        obj['sameInvalidmonIp_' + i] = false
        for (let i = 0; i < moreMonParams.length; i++) {
          obj['sameInvalidmonIp_' + moreMonParams[i].uniqueId] = false
          obj['sameInvalidmonIp_' + i] = false
          moreMonParams[i].uniqueId = i
        }
        this.updateWindow({moreMonParams})
        this.updateWindow(obj)
        this.checkSameMonIP()
      },
      handleCommit() {
        this.validateAll()
        if (this.windowData.invalidInput || !this.windowData.zoneUuid) return
        this.create(this.createParam())
        this.$router.push({name: 'backupstorage'});
      },
      updateParam: function (index, prop, value) {
        let moreMonParams = _.cloneDeep(this.windowData.moreMonParams)
        moreMonParams[index][prop] = value
        this.updateWindow({moreMonParams})
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
        let moreMonParams = _.cloneDeep(this.windowData.moreMonParams)
        let param = {
          uniqueId: moreMonParams.length,
          monIp: '',
          sshPort: 22,
          username: 'root',
          password: ''
        }
        moreMonParams.push(param)
        this.updateWindow({moreMonParams})
        this.updateWindow({createMore: true})
      },
      isMonIpRepeat: function () {
        let monIpArr = [this.windowData.monIp]
        for (let item of this.windowData.moreMonParams) {
          monIpArr.push(item.monIp)
        }
        return Utils.isArrRepeat(monIpArr)
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      clickCheckbox: function (item, $event) {
        let obj = {}
        obj[item] = !this.windowData[item]
        this.updateWindow(obj)
        $event.stopPropagation()
      }
    }
  }
</script>
