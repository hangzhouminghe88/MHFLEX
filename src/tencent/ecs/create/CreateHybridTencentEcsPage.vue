<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="title">创建CVM云主机</span>
      <span class="create-back el-icon-back" @click="close()">返回CVM云主机列表</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('vm.addType')}}</div>
        <el-radio-group v-model="isSingle">
          <el-radio :label="true">{{$t('common.single')}}</el-radio>
          <el-radio :label="false">{{$t('common.multiple')}}</el-radio>
        </el-radio-group>
      </div>

      <mh-input
        :label="'common.name'"
        :required="true"
        v-model="name"
        :show-error="emptyname || invalidname"
        :error-message="rules.name.message"
        prop="name"
        @validate="validate"
      />

      <mh-input
        :label="'common.number'"
        v-if="!isSingle"
        :type="'number'"
        :required="true"
        v-model="ecsNum"
        :show-error="emptyecsNum || invalidecsNum"
        :error-message="rules.ecsNum.message"
        prop="ecsNum"
        @validate="validate"
      />

      <mh-input
        :label="'common.description'"
        type="textarea"
        v-model="description"
        prop="description"
      />

      <mh-input
        :label="'common.image'"
        type="slot"
        :required="true"
        :show-error="emptyimageUuid"
        :error-message="rules.imageUuid.message"
      >
        <add-or-delete-input
          @open="openImageSelect"
          :value="dbData.hybridTencentImage[imageUuid] && dbData.hybridTencentImage[imageUuid].name"
          :class="{'is-error': emptyimageUuid}"
          @remove="removeUuid('imageUuid')"
        />
      </mh-input>

      <mh-input
        :label="'common.securitygroup'"
        type="slot"
        :required="true"
        :show-error="emptyecsSecurityGroupUuid"
        :error-message="rules.ecsSecurityGroupUuid.message"
      >
        <add-or-delete-input
          @open="openSecurityGroupSelect"
          :class="{'is-error': emptyecsSecurityGroupUuid}"
          :value="dbData.hybridTencentSecurityGroup[ecsSecurityGroupUuid] && dbData.hybridTencentSecurityGroup[ecsSecurityGroupUuid].name"
          @remove="removeUuid('ecsSecurityGroupUuid')"
        />
      </mh-input>

      <mh-input
        :label="'common.hybrididentityzone'"
        type="slot"
        :required="true"
        :show-error="emptyidentityZoneUuid"
        :error-message="rules.identityZoneUuid.message"
      >
        <add-or-delete-input
          @open="openIzoneSelect"
          :class="{'is-error': emptyidentityZoneUuid}"
          :value="dbData.hybridTencentIdentityZone[identityZoneUuid] && dbData.hybridTencentIdentityZone[identityZoneUuid].zoneName"
          @remove="removeUuid('identityZoneUuid')"
        />
      </mh-input>

      <mh-input
        :label="'子网'"
        type="slot"
        :required="true"
        :show-error="emptysubNetUuid"
        :error-message="rules.subNetUuid.message"
      >
        <add-or-delete-input
          @open="opensubNetsSelect"
          :class="{'is-error': emptysubNetUuid}"
          :value="dbData.hybridTencentSubNets[subNetUuid] && dbData.hybridTencentSubNets[subNetUuid].name"
          @remove="removeUuid('subNetUuid')"
        />
      </mh-input>

      <mh-input
        :label="'common.instanceoffering'"
        type="slot"
        :required="true"
        :show-error="emptyinstanceOfferingUuid"
        :error-message="rules.instanceOfferingUuid.message"
      >
        <add-or-delete-input
          @open="openEcsInstanceTypeSelect"
          :class="{'is-error': emptyinstanceOfferingUuid}"
          :value="dbData.HybridTencentEcsInstanceType[instanceOfferingUuid] && dbData.HybridTencentEcsInstanceType[instanceOfferingUuid].uuid"
          @remove="removeUuid('instanceOfferingUuid')"
        />
      </mh-input>

      <mh-input
        :label="'common.privateNetworkIP'"
        :required="true"
        v-model="privateNetworkIP"
        :show-error="emptyprivateNetworkIP || invalidprivateNetworkIP"
        :error-message="rules.privateNetworkIP.message"
        @validate="validate"
        prop="privateNetworkIP"
      />
      <p class="text-hint">{{ cidr ? `CIDR: ${cidr}` : '' }}</p>
      <p
        class="text-hint"
      >{{availableIpAddressCount ? `${$t(`common.ipNumber`)}: ${availableIpAddressCount}` : '' }}</p>

      <mh-input
        :label="'common.publicNetworkIP'"
        :required="true"
        type="select"
        v-model="publicNetworkIP"
        :selectGroup="publicNetWorkGroup"
        prop="publicNetworkIP"
        @validate="validate"
      />

      <mh-input
        style="width: 240px;display: inline-block;"
        :label="'hybridecsinstance.ecsBandWidth'"
        v-if="publicNetworkIP"
        :required="true"
        v-model="ecsBandWidth"
        type="number"
        :show-error="emptyecsBandWidth || invalidecsBandWidth"
        :error-message="rules.ecsBandWidth.message"
        prop="ecsBandWidth"
        @validate="validate"
      />
      <div class="unit" v-if="publicNetworkIP">Mbps</div>

      <mh-input
        :label="'数据盘类型'"
        type="select"
        v-model="ecsRootVolumeType"
        :selectGroup="ecsRootVolumeTypeGroup"
      />

      <mh-input
        :label="'hybridecsinstance.ecsConsolePassword'"
        :required="true"
        :type="'password'"
        v-model="consolePassword"
        :show-error="emptyconsolePassword || invalidconsolePassword"
        :error-message="rules.consolePassword.message"
        :placeholder="$t('hybridecsinstance.ecsConsolePasswordInfo')"
        prop="consolePassword"
        helperName="hybirdConsolePassword"
        @validate="validate"
      />

      <mh-input
        :label="'hybridecsinstance.ecsRootPassword'"
        :required="true"
        type="password"
        v-model="ecsRootPassword"
        :show-error="emptyecsRootPassword || invalidecsRootPassword"
        :error-message="rules.ecsRootPassword.message"
        :placeholder="$t('hybridecsinstance.ecsRootPasswordInfofortencent')"
        helperName="hybridTencentRootPassword"
        prop="ecsRootPassword"
        @validate="validate"
      />
    </div>

    <div slot="footer" class="create-footer">
      <div
        class="btn-confirm"
        :class="{'disabled': !canCreate}"
        @click="canCreate && confirm()"
      >{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="close()">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import CreateTemplate from "src/component/CreateTemplate";
import Validator from "src/utils/validator";
import WindowBase from "src/windows/Window";
import Methods from "../Methods";

export default {
  name: "CreateHybridTencentEcsPage",

  components: {
    CreateTemplate,
    AddOrDeleteInput
  },

  mixins: [WindowBase],

  data() {
    return {
      canCreate: true,
      isSingle: true,
      publicNetworkIP: false,
      publicNetWorkGroup: [
        {
          label: this.$t("hybridecsinstance.allocatePublicIpTrue"),
          value: true
        },
        {
          label: this.$t("hybridecsinstance.allocatePublicIpFalse"),
          value: false
        }
      ],
      name: "",
      emptyname: false,
      invalidname: false,
      emptyimageUuid: false,
      ecsNum: 1,
      invalidecsNum: false,
      emptyecsNum: false,
      description: "",
      imageUuid: "",
      emptyimagUuid: false,
      ecsSecurityGroupUuid: "",
      emptyecsSecurityGroupUuid: false,
      subNetUuid: "",
      emptysubNetUuid: false,
      instanceOfferingUuid: "",
      emptyinstanceOfferingUuid: false,
      privateNetworkIP: "",
      emptyprivateNetworkIP: false,
      invalidprivateNetworkIP: false,
      ecsBandWidth: 1,
      emptyecsBandWidth: false,
      invalidecsBandWidth: false,
      consolePassword: "",
      emptyconsolePassword: false,
      invalidconsolePassword: false,
      ecsRootPassword: "",
      emptyecsRootPassword: false,
      invalidecsRootPassword: false,
      identityZoneUuid: "",
      emptyidentityZoneUuid: false,
      ecsRootVolumeType: "CLOUD_PREMIUM",
      rules: {
        name: { message: "" },
        ecsNum: { message: "" },
        imageUuid: { message: "" },
        ecsSecurityGroupUuid: { message: "" },
        subNetUuid: { message: "" },
        instanceOfferingUuid: { message: "" },
        privateNetworkIP: { message: "" },
        ecsBandWidth: { message: "" },
        consolePassword: { message: "" },
        ecsRootPassword: { message: "" },
        identityZoneUuid: { message: "" },
        publicNetworkIP: { message: "" }
      },
      cidr: "",
      availableIpAddressCount: ""
    };
  },

  computed: {
    ecsRootVolumeTypeGroup() {
      let self = this,
        group = [];
      if (
        this.dbData.hybridTencentIdentityZone &&
        this.dbData.hybridTencentIdentityZone[this.identityZoneUuid]
      ) {
        if (
          ["shanghai", "beijing", "chengdu", "chongqing", "guangzhou"].includes(
            this.dbData.hybridTencentIdentityZone[this.identityZoneUuid].zoneId
              .replace(/ap-/g, "")
              .replace(/-\d/, "")
          )
        ) {
          group = [
            { label: "SSD云硬盘", value: "CLOUD_SSD" },
            { label: "高性能云硬盘", value: "CLOUD_PREMIUM" }
          ];
          self.ecsRootVolumeType = "CLOUD_PREMIUM";
        }
      } else {
        (group = [
          { label: "SSD云硬盘", value: "CLOUD_SSD" },
          { label: "高性能云硬盘", value: "CLOUD_PREMIUM" },
          { label: "普通云硬盘", value: "CLOUD_BASIC" }
        ]),
          (self.ecsRootVolumeType = "CLOUD_BASIC");
      }
      return group;
    }
  },

  methods: {
    ...Validator,
    ...{
      create: Methods.methods.create
    },
    opensubNetsSelect() {
      let self = this;
      self.validate("identityZoneUuid");
      if (!self.identityZoneUuid) return;
      self.openDialog("HybridTencentSubNetsSingleSelect", {
        conditions: [`identityZoneUuid?=${self.identityZoneUuid}`],
        ok: uuid => {
          self.subNetUuid = uuid;
          self.initPrivateIpAddress();
          self.validate("subNetUuid");
        }
      });
    },

    initPrivateIpAddress() {
      this.cidr = this.dbData.hybridTencentSubNets[this.subNetUuid].cidrBlock;
      this.availableIpAddressCount = this.dbData.hybridTencentSubNets[
        this.subNetUuid
      ].availableIpAddressCount;
    },

    openSecurityGroupSelect() {
      let self = this;
      self.validate("imageUuid");
      if (!self.imageUuid) return;
      let hybridImage = _.cloneDeep(
        self.dbData.hybridTencentImage[self.imageUuid]
      );
      self.openDialog("HybridTencentSecurityGroupSingleSelect", {
        conditions: [`dataCenterUuid?=${hybridImage.dataCenterUuid}`],
        ok: uuid => {
          self.ecsSecurityGroupUuid = uuid;
          self.validate("ecsSecurityGroupUuid");
        }
      });
    },

    openImageSelect() {
      let self = this;
      self.openDialog("HybridTencentImageSingleSelect", {
        conditions: [],
        ok: uuid => {
          self.imageUuid = uuid;
          self.validate("imageUuid");
        }
      });
    },

    openIzoneSelect() {
      let self = this;
      self.validate("ecsSecurityGroupUuid");
      if (!self.ecsSecurityGroupUuid) return;
      self.openDialog("HybridTencentIdentityZoneSelect", {
        conditions: [],
        select: uuid => {
          self.identityZoneUuid = uuid;
          self.validate("identityZoneUuid");
        }
      });
    },

    openEcsInstanceTypeSelect() {
      let self = this;
      self.validate("subNetUuid");
      if (!this.subNetUuid) return;
      let hybridEcsVswitch = this.dbData.hybridTencentSubNets[this.subNetUuid];
      self.openDialog("HybridTencentInstanceOfferingSingleSelect", {
        conditions: [],
        iZoneUuid: hybridEcsVswitch.identityZoneUuid,
        ok: uuid => {
          self.instanceOfferingUuid = uuid;
          self.validate("instanceOfferingUuid");
        }
      });
    },

    validate(name) {
      let self = this,
        input = "",
        errorMessage = "";
      input = name === "name" ? String(self[name]).trim() : self[name];
      self.rules[name].message = "";
      self[`empty${name}`] = false;
      self[`invalid${name}`] = false;
      switch (name) {
        case "imageUuid":
          errorMessage = self.$t("common.image");
          break;
        case "ecsSecurityGroupUuid":
          errorMessage = self.$t("common.securitygroup");
          break;
        case "identityZoneUuid":
          errorMessage = self.$t("common.hybrididentityzone");
          break;
        case "instanceOfferingUuid":
          errorMessage = self.$t("common.instanceoffering");
          break;
        case "subNetUuid":
          errorMessage = "子网";
          break;
        case "name":
          errorMessage = self.$t("common.name");
          break;
        case "ecsNum":
          errorMessage = self.$t("common.number");
          break;
        case "consolePassword":
          errorMessage = self.$t("hybridecsinstance.ecsConsolePassword");
          break;
        case "ecsRootPassword":
          errorMessage = self.$t("hybridecsinstance.ecsRootPassword");
          break;
        case "ecsBandWidth":
          errorMessage = self.$t("hybridecsinstance.ecsBandWidth");
          break;
        case "privateNetworkIP":
          errorMessage = self.$t("common.privateNetwork");
          break;
      }
      if (!input) {
        self[`empty${name}`] = true;
        self.rules[name].message = self.$t("error.emptyInput") + errorMessage;
        return;
      }
      if (name === "privateNetworkIP" && !this.isIP(input)) {
        self[`invalid${name}`] = true;
        self.rules[name].message = self.$t("error.invalid") + errorMessage;
        return;
      }
      if (name === "ecsConsolePassword" && !this.isEcsPassword(input)) {
        self[`invalid${name}`] = true;
        self.rules[name].message = self.$t("error.invalid") + errorMessage;
        return;
      }
      if (name === "ecsRootPassword" && !this.isEcsRootPassword(input)) {
        self[`invalid${name}`] = true;
        self.rules[name].message = self.$t("error.invalid") + errorMessage;
        return;
      }
      if (name === "name" && !this.isEcsInstanceName(input)) {
        self[`invalid${name}`] = true;
        self.rules[name].message = self.$t("error.invalid") + errorMessage;
        return;
      }
      let range = {
        maxValue: 200,
        minValue: 1
      };
      if (this.publicNetworkIP) {
        if (name === "ecsBandWidth") {
          if (!this.isIn(input, range)) {
            self[`invalid${name}`] = true;
            self.rules[name].message = self.$t("error.invalid") + errorMessage;
            return;
          }
        }
      }
    },

    removeUuid(uuid) {
      let self = this;
      self[uuid] = "";
      self.validate(uuid);
      if (uuid === "subNetUuid") {
        self.cidr = "";
        self.availableIpAddressCount = "";
      }
    },

    close() {
      this.$router.push({ name: "hybridtencentecs" });
    },

    confirm() {
      let self = this;
      if (self.validateAll()) return;
      self.canCreate = false;
      self
        .create(self.createParam(), parseInt(self.ecsNum))
        .then(() => {
          self.close();
        })
        .catch(() => {
          self.canCreate = true;
        });
    },

    validateAll() {
      let self = this,
        props = [
          "name",
          "ecsBandWidth",
          "instanceOfferingUuid",
          "ecsNum",
          "imageUuid",
          "identityZoneUuid",
          "ecsSecurityGroupUuid",
          "privateNetworkIP",
          "subNetUuid",
          "ecsRootPassword",
          "consolePassword"
        ];
      props.forEach(name => {
        self.validate(name);
      });
      let invalid = props.some(
        name => self[`empty${name}`] === true || self[`invalid${name}`] === true
      );
      return invalid;
    },
    createParam() {
      return {
        name: this.name,
        description: this.description === "" ? undefined : this.description,
        ecsImageUuid: this.imageUuid,
        instanceType: !!this.instanceOfferingUuid
          ? this.dbData.HybridTencentEcsInstanceType[this.instanceOfferingUuid]
              .instanceType
          : "",
        allocatePublicIp: this.publicNetworkIP,
        privateIpAddress:
          this.privateNetworkIP === "" ? undefined : this.privateNetworkIP,
        ecsSecurityGroupUuid: this.ecsSecurityGroupUuid,
        ecsVSwitchUuid: this.subNetUuid,
        ecsRootPassword: this.ecsRootPassword,
        ecsBandWidth: this.ecsBandWidth,
        ecsConsolePassword: this.consolePassword,
        ecsBandWidth: this.ecsBandWidth,
        ecsRootVolumeType: this.ecsRootVolumeType
      };
    }
  }
};
</script>

<style scoped>
.text-hint {
  line-height: 20px;
  position: relative;
  text-decoration: none;
  font-size: 12px;
  color: #5e6978;
  text-align: right;
  width: 300px;
}
.unit {
  display: inline-block;
  width: 60px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #dae0e6;
}
</style>
