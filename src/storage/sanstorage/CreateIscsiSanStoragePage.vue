<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #adb0b8;
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

  .rule-body {
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("iSCSI.create")}}
        </span>
      <span class="create-back" @click="$router.push('sanstorage')"><i class="el-icon-back"></i>回到SAN存储列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">
          {{$t('common.name')}}
        </div>
        <input maxlength="255" v-model="formData.name" :class="{'is-error': formValidator.emptyname}"
               @blur="validate('name')" @keydown.enter="validate('name')"/>
        <div class="error error-text" v-if="formValidator.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{ $t("common.ip") }}
        </div>
        <input :class="{'is-error': formValidator.emptyip || formValidator.invalidip}" v-model="formData.ip"
               @blur="validate('ip')" @keywown.enter="validate('ip')"/>
        <div class="error error-text" v-if="formValidator.emptyip">
          {{$t("error.emptyInput")+$t("common.ip")}}
        </div>
        <div class="error error-text" v-if="!formValidator.emptyip && formValidator.invalidip">
          {{$t("error.invalid")+$t("common.ip")}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">
          {{ $t("common.port") }}
        </div>
        <input :class="{'is-error': formValidator.emptyport || formValidator.invalidport}" v-model="formData.port"
               @blur="validate('port')" @keywown.enter="validate('port')"/>
        <div class="error error-text" v-if="formValidator.emptyport">
          {{$t("error.emptyInput")+$t("common.port")}}
        </div>
        <div class="error error-text" v-if="!formValidator.emptyport && formValidator.invalidport">
          {{$t("error.invalid")+$t("common.port")}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title">
          {{ $t('common.cluster') }}
        </div>
        <div v-if="formData.clusterUuid.length > 0">
          <add-or-delete-input
            :value="this.dbData.cluster[formData.clusterUuid] && this.dbData.cluster[formData.clusterUuid].name"
            @remove="removeCluster()"></add-or-delete-input>
        </div>
        <cluster-single-dlg :message="message" :model="showClusterSelectDlg" @close="close">
        </cluster-single-dlg>
        <div class="content" @click="attachCluster()" v-if="formData.clusterUuid.length===0">
          <div class="add"></div>
        </div>
      </div>

      <div class="operation-row">
        <div class="title">{{$t('iSCSI.chapUser')}}</div>
        <input maxlength="255" v-model="formData.chapUserName"/>
      </div>

      <div class="operation-row">
        <div class="title">
          {{$t('iSCSI.chapPassword')}}
        </div>
        <input type="password" maxlength="255" v-model="formData.chapUserPassword"/>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('sanstorage')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import CreateTemplate from 'src/component/CreateTemplate';
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import validator from 'src/utils/validator';
  import methods from './Methods'

  export default {
    name: "CreateIscsiSanStoragePage",
    mixins: [WindowBase, Root, methods],
    components: {
      CreateTemplate, ClusterSingleDlg, AddOrDeleteInput
    },
    data() {
      return {
        showClusterSelectDlg: false,
        message: {},
        formData: {
          name: '',
          ip: '',
          port: '3260',
          chapUserName: '',
          chapUserPassword: '',
          clusterUuid: ''
        },
        formValidator: {
          emptyname: false,
          emptyip: false,
          emptyport: false,
          invalidip: false,
          invalidport: false
        }
      }
    },
    created() {
      //this.deleteAllAssistant()
    },
    destroyed: function () {

    },
    methods: {
      close: function (uuid) {
        this.showClusterSelectDlg = false;
        if (!uuid || uuid.length <= 0) return;
        this.formData.clusterUuid = uuid;
      },
      removeCluster() {
        this.formData.clusterUuid = '';
      },
      attachCluster: async function () {
        this.showClusterSelectDlg = true;

        /*
        const self = this
        self.openSideWindowForCreate('ClusterListSingleSelectList', {
          conditions: ['hypervisorType=KVM'],
          select: (uuid) => {
            this.selectedCluster = this.dbData.cluster[uuid]
            this.formData.clusterUuid = uuid
          }
        })*/
      },
      validate(name) {
        this.formValidator[`empty${name}`] = false
        this.formValidator[`invalid${name}`] = false
        if (this.formData[`${name}`] === '') {
          this.formValidator[`empty${name}`] = true
          return false
        }
        if (name === 'ip') {
          if (!validator.isIP(this.formData.ip)) {
            this.formValidator[`invalid${name}`] = true
            return false
          }
        } else if (name === 'port') {
          if (!validator.isPort(this.formData.port)) {
            this.formValidator[`invalid${name}`] = true
            return false
          }
        }
        return true
      },
      validateAll() {
        let props = ['name', 'ip', 'port']
        let invalid = props.some((name) => {
          return !this.validate(name)
        })
        return invalid
      },
      ok() {
        let invalid = this.validateAll()
        if (invalid) return

        this.create(this.formData);
        this.$router.push({name: 'sanstorage'});
      }
    }
  }
</script>
