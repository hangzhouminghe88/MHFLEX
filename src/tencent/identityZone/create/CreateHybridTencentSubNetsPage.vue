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
        :label="'common.hybridVpc'"
				type="slot"
        :required="true"
        :show-error="emptyvpcUuid"
        :error-message="rules.vpcUuid.message"
        prop="vpcUuid"
      >
        <add-or-delete-input
          @open="openVpcSelect"
          :value="dbData.hybridTencentVirtualPrivateCloud[vpcUuid]
																&& dbData.hybridTencentVirtualPrivateCloud[vpcUuid].name"
          :class="{'is-error': emptyvpcUuid}"
          @remove="removeUuid('vpcUuid')"
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
      emptyvpcUuid: false,
      emptyname: false,
      invalidname: false,
      cidr: "",
      emptycidr: false,
      invalidcidr: false,
      vpcCidr: "",
      rules: {
        name: { message: "" },
        vpcUuid: { message: "" },
        cidr: { message: "" }
      }
    };
  },

  created() {
    let self = this;
    self.identityZoneUuid = self.param.identityZoneUuid ? self.param.identityZoneUuid : "";
  },

  components: {
		CreateTemplateNoRoute,
		AddOrDeleteInput
  },

  methods: {
		...Validator,
    //关闭创建页
    close() {
      let self = this;
      self.$emit("close");
    },
    //创建参数
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
    //创建
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
    //选择vpc
    openVpcSelect() {
      let self = this;
      let conditions = []
          if (this.identityZoneUuid) {
            let identityZone = _.cloneDeep(this.dbData.hybridTencentIdentityZone[this.identityZoneUuid])
            conditions.push(`dataCenterUuid=${identityZone.dataCenterUuid}`)
          }
      self.openDialog("HybridTencentVpcSingleSelect", {
        conditions: conditions,
        select: (uuid) => {
          self.vpcUuid = uuid;
          self.validate("vpcUuid");
          self.vpcCidr = self.vpcUuid
          ? self.dbData.hybridTencentVirtualPrivateCloud[self.vpcUuid].cidrBlock
          : "";
        }
      });
    },
    //移除选择的vpc
    removeUuid(uuid) {
			let self = this;
      self[uuid] = "";
      if(uuid=== 'vpcUuid')  self.vpcCidr = "";
      self.validate(uuid);
    },
    //单行校验
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
          name === "vpcUuid"
            ? self.$t("error.unselected") + self.$t("common.hybridVpc")
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
    //整体校验
    validateAll() {
      let self = this,
        props = ["name", "vpcUuid", "cidr"];
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
