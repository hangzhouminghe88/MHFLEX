<template>
  <create-template-no-route>
    <div slot="header">
      <span class="title">创建腾讯云子网</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到腾讯云子网列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <mh-input
        :label="'common.hybrididentityzone'"
				type="slot"
        :required="true"
        :show-error="emptyidentityZoneUuid"
        :error-message="rules.identityZoneUuid.message"
        prop="identityZoneUuid"
      >
        <add-or-delete-input
          @open="openIdentityZoneSelect"
          :value="dbData.hybridTencentIdentityZone[identityZoneUuid]
																&& dbData.hybridTencentIdentityZone[identityZoneUuid].zoneName"
          :class="{'is-error': emptyidentityZoneUuid}"
          @remove="removeUuid('identityZoneUuid')"
        />
      </mh-input>

      <mh-input
        :label="'common.name'"
        :required="true"
        v-model="name"
        :show-error="emptyname"
        :error-message="rules.name.message"
        prop="name"
        @validate="validate"
      />

      <mh-input
        :label="'common.description'"
        type="textarea"
        v-model="description"
        prop="description"
      />

      <mh-input
        :label="'Cidr'"
        :required="true"
        v-model="cidr"
				placeholder='192.168.1.0/24'
        type="text"
        :show-error="emptycidr || invalidcidr"
        :error-message="rules.cidr.message"
        prop="cidr"
        @validate="validate"
      />
      <span class="vpc-cidr" v-if="vpcCidr">{{'Vpc Cidr: ' + vpcCidr}}</span>
    </div>

    <div slot="footer" class="create-footer">
      <span
        class="btn-confirm"
        @click="canCreate && confirm()"
        :class="{'disabled': !canCreate}"
      >{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>

import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import Validator from "src/utils/validator";
import WindowBase from "src/windows/Window";

export default {
  name: "CreateHybridTencentSubNetsPage",

  mixins: [WindowBase],

  props: {
    param: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    return {
      vpcUuid: "",
      canCreate: true,
      identityZoneUuid: "",
			name: "",
			description:'',
      emptyidentityZoneUuid: false,
      emptyname: false,
      invalidname: false,
      cidr: "",
      emptycidr: false,
      invalidcidr: false,
      vpcCidr: "",
      rules: {
        name: { message: "" },
        identityZoneUuid: { message: "" },
        cidr: { message: "" }
      }
    };
  },

  created() {
    let self = this;
    self.vpcUuid = self.param.vpcUuid ? self.param.vpcUuid : "";
    self.vpcCidr = self.vpcUuid
      ? self.dbData.hybridTencentVirtualPrivateCloud[self.vpcUuid].cidrBlock
      : "";
  },

  components: {
		CreateTemplateNoRoute,
		AddOrDeleteInput
  },

  methods: {
		...Validator,

    close() {
      let self = this;
      self.$emit("close");
    },

    createParam() {
			let self = this;
      return {
        name: self.name,
        description: self.description,
        cidrBlock: self.cidr,
        vpcUuid: self.vpcUuid,
        identityZoneUuid: self.identityZoneUuid
      };
    },

    confirm() {
      let self = this;
      if (self.validateAll()) return;
      self.canCreate = false;
      self
        .param.ok(self.createParam())
        .then(() => {
          self.close();
        })
        .catch(() => {
          self.canCreate = true;
        });
    },

    openIdentityZoneSelect() {
      let self = this;
      self.openDialog("HybridTencentIdentityZoneSelect", {
        conditions: [],
        select: (uuid) => {
          self.identityZoneUuid = uuid;
          self.validate("identityZoneUuid");
        }
      });
    },

    removeUuid(uuid) {
			let self = this;
      self[uuid] = "";
      self.validate(uuid);
    },

    validate(name) {
      let self = this,
        input = "";
      input =  name === "name" ? String(self[name]).trim() : self[name];
      self.rules[name].message = "";
      self[`empty${name}`] = false;
      self[`invalid${name}`] = false;
      if (!input) {
        self[`empty${name}`] = true;
        self.rules[name].message =
          name === "identityZoneUuid"
            ? self.$t("error.unselected") + self.$t("common.hybrididentityzone")
            : name === "cidr"
            ? self.$t("error.emptyInput") + "cidr"
            : self.$t("error.emptyInput") + self.$t(`common.${name}`);
        return;
      }
      if (name === "cidr") {
        if (!self.isCidr(input)) {
          self[`invalid${name}`] = true;
          self.rules[name].message = self.$t("error.invalid") + "cidr";
          return;
        }
      }
    },

    validateAll() {
      let self = this,
        props = ["name", "identityZoneUuid", "cidr"];
      props.forEach(name => {
        self.validate(name);
      });
      let invalid = props.some(name => {
        return self[`empty${name}`] === true || self[`invalid${name}`] === true;
      });
      return invalid;
    }
  }
};
</script>

<style scoped>
 .vpc-cidr {
	  display: inline-block;
    text-align: right;
		width: 300px;
		position: relative;
    font-size: 12px;
		top: 3px;
 }
</style>
