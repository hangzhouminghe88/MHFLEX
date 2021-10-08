<template>
  <div class="create__tencent_image__container">
		 <create-template>
    <div slot="header" class="create-header">
      <span class="title">创建腾讯自定义镜像</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到腾讯云镜像列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <mh-input
        :label="'common.name'"
        v-model="name"
        :required="true"
        :show-error="emptyname || invalidname"
        :error-message="rules.name.message"
        @validate="validate"
        prop="name"
      />

      <mh-input :label="'common.description'" v-model="description" type="textarea" />

      <mh-input
        :label="'系统架构'"
        type="select"
        v-model="systemBit"
        :selectGroup="systemBitGroup"
        @changeOption="handleChangeBitGroup"
        :required="true"
      />

      <mh-input
        :label="'common.operatingSystem'"
        type="select"
        :selectGroup="platformGroup"
        v-model="platform"
        @changeOption="handleChangePlatformGroup"
        :required="true"
      />

      <mh-input
        :label="'hybridTencentImage.platform'"
        type="select"
        v-model="guestOsType"
        :selectGroup="guestOsGroup"
        @changeOption="handleChangeOsGroup"
        :required="true"
      />

      <mh-input
        :label="'hybridTencentImage.osVersion'"
        type="select"
        v-model="osVersion"
        :selectGroup="osVersionGroup"
        @changeOption="handleChangeOsVersionGroup"
        :required="true"
      />

      <mh-input
        :label="'common.image'"
        type="slot"
        :required="true"
        :show-error="emptyecsImageUuid"
        :error-message="rules.ecsImageUuid.message"
      >
        <add-or-delete-input
          :value="dbData.image[ecsImageUuid] && dbData.image[ecsImageUuid].name"
          @open="openImageSelect"
          @remove="removeUuid('ecsImageUuid')"
          :class="{'is-error': emptyecsImageUuid}"
        />
      </mh-input>

      <mh-input
        :label="'hybriddatacenter.region'"
        type="slot"
        :required="true"
        :show-error="emptydataCenterUuid"
        :error-message="rules.dataCenterUuid.message"
      >
        <add-or-delete-input
          :value="dbData.hybridTencentDataCenter[dataCenterUuid] && dbData.hybridTencentDataCenter[dataCenterUuid].regionName"
          @open="openTencentDataCenterSelect"
          @remove="removeUuid('dataCenterUuid')"
          :class="{'is-error': emptydataCenterUuid}"
        />
      </mh-input>

      <mh-input
        :label="'common.hybridBucket'"
        v-model="bucketName"
        :required="true"
        :show-error="emptybucketName || invalidbucketName"
        :error-message="rules.bucketName.message"
        @validate="validate"
        prop="bucketName"
        :disabled="true"
      />
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
   </create-template>
	 <create-tencent-bucket v-if="showCreateBucket" :param="createBucketParam" @close="showCreateBucket = false;"/>
	</div>
</template>

<script>

import CreateTencentBucket from 'src/tencent/dataCenter/create/CreateTencentBucket';
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import DataCenterMethods from 'src/tencent/dataCenter/Methods';
import CreateTemplate from "src/component/CreateTemplate";
import BucketMethods from 'src/tencent/bucket/Methods';
import { genUniqueId } from 'src/utils/utils';
import WindowBase from "src/windows/Window";
import Methods from "../Methods";
import rpc from "src/utils/rpc";

export default {
  name: "CreateTemplateImagePage",

  mixins: [WindowBase],

  components: { CreateTemplate, AddOrDeleteInput, CreateTencentBucket },

  data() {
    return {
			imageConditions: ["type=zstack", "state=Enabled", "system=false"],
			showCreateBucket: false,
			createBucketParam: {},
      name: "",
      emptyname: false,
      invalidname: false,
      description: "",
      dataCenterUuid: "",
      emptydataCenterUuid: false,
      ecsImageUuid: "",
      emptyecsImageUuid: false,
      bucketName: "",
      emptybucketName: false,
      invalidbucketName: false,
      systemBit: "64位",
      systemBitGroup: [
        { label: "64位", value: "64位" },
        { label: "32位", value: "32位" }
      ],
      platform: "Linux",
      platformGroup: [
        { label: "Linux", value: "Linux" },
        { label: "Windows", value: "Windows" }
      ],
      guestOsType: "CentOS",
      guestOsGroup: [
        { label: "CentOS", value: "CentOS" },
        { label: "Ubuntu", value: "Ubuntu" },
        { label: "Debian", value: "Debian" },
        { label: "OpenSUSE", value: "OpenSUSE" },
        { label: "SUSE", value: "SUSE" },
        { label: "CoreOS", value: "CoreOS" },
        { label: "FreeBSD", value: "FreeBSD" },
        { label: "Other Linux", value: "Other Linux" }
      ],
      osVersion: "5",
      osVersionGroup: [
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" }
      ],
      rules: {
        name: { message: "" },
        dataCenterUuid: { message: "" },
        ecsImageUuid: { message: "" },
        bucketName: { message: "" }
      }
    };
  },

  methods: {
    ...{
			create: Methods.methods.create,
			createHybridTencentBucket: BucketMethods.methods.create,
			createHybridTencentDataCenter: DataCenterMethods.methods.create
    },
    confirm() {
      let self = this;
      if (self.validateAll()) return;
      self.create(self.createParam());
      self.close();
    },

    createParam() {
      return {
        name: this.name,
        dataCenterUuid: this.dataCenterUuid,
        description:
          this.description === "" || this.description === undefined
            ? undefined
            : this.description,
        osVersion: this.osVersion,
        archicture: this.systemBit.indexOf("64") > -1 ? "x86_64 " : "i386",
        bucketName: this.bucketName,
        imageUuid: this.ecsImageUuid,
        osType: this.guestOsType
      };
    },

    close() {
      let self = this;
      self.$router.push({ name: "hybridtencentimage" });
    },

    removeUuid(uuid) {
      let self = this;
      self[uuid] = "";
      self.validate(uuid);
    },

    handleChangeBitGroup(item) {
      let self = this;
      self.systemBit = item.value;
      self.ecsImageUuid = "";
    },

    handleChangePlatformGroup(item) {
      let self = this;
      self.platform = item.value;
      self.ecsImageUuid = "";
      switch (self.platform) {
        case "Linux":
          self.guestOsGroup = [
            { label: "CentOS", value: "CentOS" },
            { label: "Ubuntu", value: "Ubuntu" },
            { label: "Debian", value: "Debian" },
            { label: "OpenSUSE", value: "OpenSUSE" },
            { label: "SUSE", value: "SUSE" },
            { label: "CoreOS", value: "CoreOS" },
            { label: "FreeBSD", value: "FreeBSD" },
            { label: "Other Linux", value: "Other Linux" }
          ];
          self.guestOsType = "CentOS";
          break;
        case "Windows":
          self.guestOsGroup = [
            { label: "Windows Server 2008", value: "Windows Server 2008" },
            { label: "Windows Server 2012", value: "Windows Server 2012" },
            { label: "Windows Server 2016", value: "Windows Server 2016" }
          ];
          self.guestOsType = "Windows Server 2008";
          break;
      }
      self.handleChangeOsGroup({ value: self.guestOsType });
    },

    handleChangeOsGroup(item) {
      let self = this;
      self.ecsImageUuid = "";
      if (!!item.value) {
        switch (item.value) {
          case "CentOS":
            self.osVersionGroup = [
              { label: "5", value: "5" },
              { label: "6", value: "6" },
              { label: "7", value: "7" }
            ];
            self.osVersion = "1";
            break;
          case "Ubuntu":
            self.osVersionGroup = [
              { label: "10", value: "10" },
              { label: "12", value: "12" },
              { label: "14", value: "14" },
              { label: "16", value: "16" }
            ];
            self.osVersion = "10";
            break;
          case "Debian":
            self.osVersionGroup = [
              { label: "6", value: "6" },
              { label: "7", value: "7" },
              { label: "8", value: "8" },
              { label: "8", value: "8" }
            ];
            self.osVersion = "6";
            break;
          case "OpenSUSE":
            self.osVersionGroup = [
              { label: "11", value: "11" },
              { label: "12", value: "12" }
            ];
            self.osVersion = "11";
            break;
          case "SUSE":
            self.osVersionGroup = [
              { label: "10", value: "10" },
              { label: "11", value: "11" },
              { label: "12", value: "12" },
              { label: "13", value: "13" }
            ];
            self.osVersion = "10";
            break;
          case "CoreOS":
            self.osVersionGroup = [{ label: "7", value: "7" }];
            self.osVersion = "7";
            break;
          case "FreeBSD":
            self.osVersionGroup = [{ label: "10", value: "10" }];
            self.osVersion = "10";
            break;
          case "Other Linux":
            self.osVersionGroup = [{ label: "-", value: "-" }];
            self.osVersion = "-";
            break;
          default:
            self.osVersionGroup = [{ label: "-", value: "-" }];
            self.osVersion = "-";
            break;
        }
      }
    },

    handleChangeOsVersionGroup(item) {
      let self = this;
      self.osVersion = item.value;
    },

    validate(name) {
      let self = this,
        input = "",
        errorMsg = "";
      self[`empty${name}`] = false;
      self[`invalid${name}`] = false;
      self.rules[name].message = "";
      input = name === "name" ? String(self[name]).trim() : self[name];
      switch (name) {
        case "name":
          errorMsg = "common.name";
          break;
        case "dataCenterUuid":
          errorMsg = "hybriddatacenter.region";
          break;
        case "bucketName":
          errorMsg = "common.hybridBucket";
        case "ecsImageUuid":
          errorMsg = "common.image";
          break;
      }
      if (!input) {
        self[`empty${name}`] = true;
        self.rules[name].message =
          self.$t("error.emptyInput") + self.$t(errorMsg);
      }
    },

    openImageSelect() {
      let self = this,
        windowsList = ["Windows", "WindowsVirtio"],
        conditions = [];
      conditions = self.$data.imageConditions;
      if (self.platform === "Linux")
        conditions = conditions.concat("platform=Linux");
      if (self.platform === "Windows")
        conditions = conditions.concat(`platform?=${windowsList}`);
      self.openDialog("ImageSingleSelectListDlg", {
        conditions,
        ok: uuid => {
          self.ecsImageUuid = uuid;
          self.validate("ecsImageUuid");
        }
      });
    },

    openTencentDataCenterSelect() {
      let self = this;
      self.openDialog("HybridTencentDataCenterSingleSelect", {
        conditions: [],
        select: uuid => {
          self.selectDataCenter(uuid);
        }
      });
    },

    validateAll() {
      let self = this,
        props = ["name", "dataCenterUuid", "bucketName"];
      props.forEach(name => {
        self.validate(name);
      });
      let invalid = props.some(
        name => self[`empty${name}`] === true || self[`invalid${name}`] === true
      );
      return invalid;
    },

    //选择地域
    selectDataCenter(uuid) {
      let self = this;
      self.dataCenterUuid = uuid;
      self.initTencentBucket();
      // self.deleteCurrAssistant(this.windowData.id);
      self.queryForAssistant();
      self.validate("dataCenterUuid");
    },
    //初始化bucketName
    initTencentBucket() {
      let dataCenterUuid = this.dataCenterUuid;
      return rpc
        .query("hybrid/tencent/oss-bucket", {
          q: [`dataCenterUuid=${dataCenterUuid}`, "current=true"]
        })
        .then(resp => {
          if (resp.inventories.length !== 0) {
            this.$data.bucketName = resp.inventories[0].bucketName;
          } else {
            this.$data.bucketName = "";
          }
        });
    },
    //帮助提示
    queryForAssistant() {
      let self = this;
      let newAssistant = (resourceName, operation) => {
        let id = `assistant-${genUniqueId()}`;
        let content, handler;
        handler = () => {
          self.createBucketParam= {
						dataCenterUuid: self.dataCenterUuid,
            ok: param => {
              self[`create${resourceName}`](param).then(
                () => {
                  if (resourceName === "HybridTencentBucket") {
                    this.$data.bucketName = param.bucketName;
                  }
                  self.queryForAssistant();
                },
                () => {
                  self.queryForAssistant();
                }
							);
            }
					};
					self.showCreateBucket = true;
						self.deleteAllAssistant();
        };
        if (operation === "check") {
          handler = () => {
            this.$router.push({name: 'hybridtencentdatacenter'});
          };
        }
        content = `lackOf${resourceName}`;
        self.createAssistant({
          id,
          hide: false,
          title: "hybridImageTitle",
          ownerId: self.windowData.id,
          content,
          operation,
          handler
        });
      };
      rpc
        .query(`hybrid/tencent/data-center`, { count: true })
        .then(dataCenterResp => {
          if (dataCenterResp.total === 0) {
            newAssistant("HybridTencentDataCenter", "add");
            return;
          }
          let dataCenterUuid = this.dataCenterUuid;
          if (!dataCenterUuid) return;
          rpc
            .query("hybrid/tencent/oss-bucket", {
              q: [`dataCenterUuid=${dataCenterUuid}`],
              replyWithCount: true
            })
            .then(resp => {
              if (resp.total === 0) {
                newAssistant("HybridTencentBucket", "add");
                return;
              }
              let count = 0;
              for (let i = resp.inventories.length - 1; i >= 0; i--) {
                if (resp.inventories[i].current === "false") {
                  count++;
                }
              }
              if (count === resp.inventories.length) {
                newAssistant("DefaultHybridBucket", "check");
              }
            });
        });
    }
	},
	
	destroyed() {
		let self = this;
		self.deleteAllAssistant();
	}
};
</script>

<style scoped>
  .create__tencent_image__container{
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
