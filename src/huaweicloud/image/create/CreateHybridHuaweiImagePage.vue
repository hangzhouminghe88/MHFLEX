<template>
  <div  class="create_image_container">
   <create-template>
    <div
      slot="header"
      class="create-header"
    >
      <span class="create-title">添加华为云私有镜像</span>
      <span
        class="create-back el-icon-back"
        @click="close()"
      >
        回到华为云镜像列表
      </span>
    </div>
    <div
      slot="body"
      class="create-body"
    >
      <mh-input
        :label="$t('common.name')"
        :required="true"
        prop="name"
        v-model="name"
        @validate="validate"
        :show-error="emptyname || invalidname"
        :error-message="rules.name.message"
        placeholder="请输入镜像名称"
      />

      <mh-input
        type="textarea"
        v-model="description"
        placeholder="请输入描述"
        :label="$t('common.description')"
      />

      <mh-input
        type="slot"
        :label="'操作系统'"
      >
        <div class="tab-container">
          <span
            class="tab-item"
            :class="{'active': os === 'Linux'}"
            @click="changeOs('Linux')"
          >Linux</span>
          <span
            class="tab-item"
            :class="{'active': os === 'Windows'}"
            @click="changeOs('Windows')"
          >Windows</span>
        </div>
      </mh-input>

      <mh-input
        type="select"
        :selectGroup="osTypeGroup"
        v-model="osType"
        @changeOption="handleChangeOsType"
        :label="'操作系统类型'"
      ></mh-input>

      <mh-input
        type="select"
        v-model="osVersion"
        :selectGroup="osVersionGroup"
        @changeOption="handleChangeOsVersion"
        :label="'操作系统类型'"
      ></mh-input>

      <mh-input
        :label="$t('common.image')"
        type="slot"
        :required="true"
        :error-message="rules.imageUuid.message"
        :show-error="emptyimageUuid"
      >
        <add-or-delete-input
          :value="dbData.image[imageUuid] && dbData.image[imageUuid].name"
          :class="{'is-error': emptyimageUuid}"
          @remove="removeUuid('imageUuid')"
          @open="openImageSelect"
        />
      </mh-input>

      <mh-input
        :label="$t('common.hybridDatacenter')"
        type="slot"
        :required="true"
        :error-message="rules.dataCenterUuid.message"
        :show-error="emptydataCenterUuid"
      >
        <add-or-delete-input
          :value="dbData.hybridHuaweiyunDataCenter[dataCenterUuid] && dbData.hybridHuaweiyunDataCenter[dataCenterUuid].regionName"
          :class="{'is-error': emptydataCenterUuid}"
          @remove="removeUuid('dataCenterUuid')"
          @open="openDataCenterSelect"
        />
      </mh-input>

      <mh-input
        :label="$t('common.bucketName')"
        :show-error="emptybucketName || invalidbucketName"
        v-model="bucketName"
        helperName="ecs_huaweiBucketName"
        prop="bucketName"
        @validate="validate"
        :error-message="rules.bucketName.message"
        :disabled="true"
        :required="true"
      />
    </div>
    <div
      slot="footer"
      class="create-footer"
    >
      <div class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</div>
      <div
        class="btn-cancel"
        @click="close()"
      >{{$t('common.cancel')}}</div>
    </div>
  </create-template>
  <create-oss-bucket v-if="showCreateOss" :param="createOssParam" @close="showCreateOss = false"></create-oss-bucket>
  </div>
</template>

<script>
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import CreateTemplate from "src/component/CreateTemplate";
import WindowBase from "src/windows/Window";
import { LinuxOsTypeList, OsVersionMap } from "./utils";
import { genUniqueId } from 'src/utils/utils';
import CreateOssBucket from './CreateOssBucket';
import rpc from 'src/utils/rpc';
export default {
  name: "CreateHybridHuaweiImagePage",
  components: {
    CreateTemplate,
    AddOrDeleteInput,
    CreateOssBucket
  },
  mixins: [WindowBase],
  data() {
    let _this = this;
    return {
      name: "",
      description: "",
      os: "Linux",
      imageUuid: "",
      dataCenterUuid: "",
      bucketName: "",
      invalidbucketName: false,
      osTypeGroup: LinuxOsTypeList,
      osType: "CentOS",
      osVersionGroup: OsVersionMap["CentOS"],
      osVersion: "CentOS 7.5 64bit",
      emptyname: false,
      invalidname: false,
      emptybucketName: false,
      emptyimageUuid: false,
      emptydataCenterUuid: false,
      backupStorageUuid: "",
      showCreateOss: false,
      createOssParam: {},
      rules: {
        name: { message: "" },
        bucketName: { message: "" },
        dataCenterUuid: { message: "" },
        imageUuid: { message: "" }
      }
    };
  },
  methods: {
    //关闭创建页面
    close() {
      let _this = this;
      _this.$router.push({ name: "hybridhuaweiimage" });
    },
    //该表os
    changeOs(tabName) {
      let _this = this;
      if (_this.os !== tabName) {
        _this.os = tabName;
        _this.getOsType();
      }
    },
    //或得操作系统类型
    getOsType() {
      debugger;
      let _this = this;
      if (_this.os === "Linux") {
        _this.osTypeGroup = LinuxOsTypeList;
        _this.osType = "CentOS";
      }
      if (_this.os === "Windows") {
        _this.osTypeGroup = [
          {
            label: "Windows",
            value: "Windows"
          }
        ];
        _this.osType = "Windows";
      }
      _this.getOsVersion();
    },
    //或得操作系统版本
    getOsVersion() {
      let _this = this;
      _this.osVersionGroup = OsVersionMap[_this.osType.replace(/\s/g, "")];
      _this.osVersion = OsVersionMap[_this.osType.replace(/\s/g, "")][0].value;
    },
    //切换操作系统类型
    handleChangeOsType(item) {
      let _this = this;
      debugger;
      _this.osType = item.value;
      _this.getOsVersion();
    },
    //切换操作系统版本
    handleChangeOsVersion(item) {
      let _this = this;
      _this.osVersion = item.value;
    },
    //校验
    validate(name) {
      let _this = this,
        input = "", errMsg = '';
      input = _this[name];
      _this[`empty${name}`] = false;
      switch(name) {
        case 'name':
          errMsg = _this.$t(`common.${name}`);
          break;
        case 'bucketName':
           errMsg = _this.$t(`common.${name}`);
          break;
        case 'imageUuid':
         errMsg = _this.$t(`common.image`);
          break;
          case 'dataCenterUuid':
         errMsg = _this.$t(`common.hybridDatacenter`);
          break;
      }
      if (/^\s*$/.test(input) || /\s/g.test(input)) {
        _this[`empty${name}`] = true;
        _this.rules[name].message =
          _this.$t(`error.emptyInput`) + errMsg;
      }
       _this[`invalid${name}`] = false
      if(name === 'bucketName') {
        if(!/^[\d\w][\d\w\-\.\(\)]{2,62}$/.test(input)){
            _this[`invalid${name}`] = true;
            _this.rules[name].message =  _this.$t(`error.invalid`) + errMsg;
        }
      }
    },
    //移除选择的uuid
    removeUuid(name) {
      let _this = this;
      _this[name] = "";
      _this.validate(name);
    },

    //选择镜像
    openImageSelect() {
      let _this = this;
      _this.validate("imageUuid");
      _this.openDialog("ImageSingleSelectListDlg", {
        conditions: [`format=iso`],
        select: uuid => {
          _this.imageUuid = uuid;
          _this.validate("imageUuid");
        }
      });
    },
    //选择地域
    openDataCenterSelect() {
      let _this = this;
      _this.validate("dataCenterUuid");
      _this.openDialog("HybridHuaweiDataCenterSingleSelect", {
        conditions: [],
        select: uuid => {
          _this.dataCenterUuid = uuid;
          _this.validate("dataCenterUuid");
          _this.queryForAssistant();
          _this.initGetBucketName();
        }
      });
    },
    //初始化桶
    initGetBucketName() {
      const _this = this;
      let dataCenterUuid = self.windowData.dataCenterUuid;
      return rpc
        .query("/hybrid/huawei/obs-bucket", {
          q: [`dataCenterUuid=${dataCenterUuid}`, "current=true"]
        })
        .then(resp => {
          if (resp.inventories.length !== 0) {
            _this.$data.bucketName = resp.inventories[0].bucketName;
            _this.backupStorageUuid = resp.inventories[0].uuid;
          } else {
            _this.$data.bucketName = "";
          }
        });
    },
    //帮助
     queryForAssistant () {
      let self = this
      let newAssistant = (resourceName, operation) => {
        let id = `assistant-${genUniqueId()}`
        let content, handler
        handler = () => {
          if(resourceName === 'HybridDataCenter') {
            self.$router.push({name: 'createHybridHuaweiDataCenter'})
          }
          if(resourceName === 'HybridBucket') {
            self.createOssParam = {
              dataCenterUuid: self.dataCenterUuid,
              ok: (param) => {
                self.createBucket(param);
              }
            }
            self.showCreateOss = true;
          }
        }
        if (operation === 'check') {
          handler = () => {
            this.$router.push('/main/hybriddatacenter')
          }
        }
        content = `lackOf${resourceName}`
        self.createAssistant({
          id,
          hide: false,
          title: 'hybridImageTitle',
          ownerId: self.windowData.id,
          content,
          operation,
          handler
        })
      }
      rpc.query(`brid/data-center`, {count: true}).then(dataCenterResp => {
        if (dataCenterResp.total === 0) {
          newAssistant('HybridDataCenter', 'add')
          return
        }
        let dataCenterUuid = this.windowData.dataCenterUuid
        if (!dataCenterUuid) return
        rpc.query('brid/huawei/obs-bucket', {
          q: [`dataCenterUuid=${dataCenterUuid}`],
          replyWithCount: true
        }).then(resp => {
          if (resp.total === 0) {
            newAssistant('HybridBucket', 'add')
            return
          }
          let count = 0
          for (let i = resp.inventories.length - 1; i >= 0; i--) {
            if (resp.inventories[i].current === 'false') {
              count++
            }
          }
          if (count === resp.inventories.length) {
            newAssistant('DefaultHybridBucket')
          }
        })
      })
    },
    //整体校验
    validateAll() {
     let _this = this, props = ['name', 'bucketName', 'imageUuid', 'dataCenterUuid'];
     props.forEach((name) => {
       _this.validate(name);
     })
     let invalid = props.some((name) => _this[`empty${name}`] === true || _this[`invalid${name}`] === true);
     return invalid;
    },
    //创建参数
    createParam() {
      let _this = this;
      return {
        name: _this.name,
        description: _this.description,
        imageUuid: _this.imageUuid,
        dataCenterUuid: _this.dataCenterUuid,
        guestOsType: _this.osType,
        backupStorageUuid: _this.backupStorageUuid,
        osVersion: _this.osVersion
      }
    },
    //创建
    confirm() {
      let _this = this;
      if(_this.validateAll()) return;
      _this.canCreate = false;
      _this.create(_this.createParam())
      _this.close();
    }
  },
  destroyed() {
    let _this = this;
    _this.deleteAllAssistant();
  }
};
</script>

<style lang="less" scoped>
.tab {
  &-container {
    border-radius: 2px;
    cursor: pointer;
  }
  &-item {
    background-color: #e9edfa;
    border-radius: 2px;
    padding: 10px 20px;
    display: inline-block;
    transition: background-color .5s ease-out;
  }
}

.active {
  background-color: #5e7ce0;
  color: #fff;
  transition: background-color .5s ease-in, color .5s ease-in;
}

.create_image_container{
  background: #fff;
  height: 100%;
}
</style>
