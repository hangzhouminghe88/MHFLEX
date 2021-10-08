<template>
  <create-template>
    <div class="create-header" slot="header">
      <span class="create-title">创建安全组</span>
      <span class="create-back el-icon-back" @click="close()">回到华为云安全组</span>
    </div>
    <div class="create-body" slot="body">
      <!--安全组名称-->
      <mh-input
        :label="$t('common.name')"
        :required="true"
        :show-error="emptyname"
        :error-message="rules.name.message"
        prop="name"
        @validate="validate"
        placeholder="请输入名称"
        v-model="name"
      />
      <!--描述-->
      <mh-input
        type="textarea"
        v-model="description"
        :label="$t('common.description')"
        placeholder="请输入简介"
      />
      <!--选择vpc-->
      <mh-input
        type="slot"
        :required="true"
        :label="'VPC'"
        :error-message="rules.vpcUuid.message"
        :show-error="emptyvpcUuid"
      >
        <add-or-delete-input
          :value="dbData.hybridHuaweiVirtualPrivateCloud[vpcUuid] && dbData.hybridHuaweiVirtualPrivateCloud[vpcUuid].name"
          :class="{'is-error': emptyvpcUuid}"
          @open="openHybridHuaweiVpcSelect"
          @remove="removeUuid('vpcUuid')"
        />
      </mh-input>
    </div>
    <div class="create-footer" slot="footer">
      <span
        class="btn-confirm"
        @click="canCreate && confirm()"
        :class="{'disabled': !canCreate}"
      >{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
import rpc from "src/utils/rpc";
import WindowBase from "src/windows/Window";
import CreateTemplate from "src/component/CreateTemplate";
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import Methods from "../Methods";
export default {
  name: "CreateSecurityGroupPage",
  mixins: [WindowBase],
  components: {
    CreateTemplate,
    AddOrDeleteInput
  },
  data() {
    return {
      name: "",
      emptyname: false,
      description: "",
      vpcUuid: "",
      emptyvpcUuid: "",
      canCreate: true,
      rules: {
        name: { message: "" },
        vpcUuid: { message: "" }
      }
    };
  },
  methods: {
    queryAssistant() {
      let _this = this;
      let newAssistant = (resourceName, operate) => {
        let id = `assistant-${_this.genUniqueId()}`;
        _this.createAssistant({
          id,
          title: "hybridHuaweiVpcTitle",
          operation,
          ownerId: _this.windowData.id,
          content: `lackOf${resourceName}`,
          handler: () => {
            if (resourceName === "HybridHuaweiVpc" && operate === 'create')
              _this.$router.push({ name: "createHybridHuaweiVpc" });
          }
        });
      }
      rpc.query('hybrid/huawei/vpc')
         .then((resp) => {
           if(resp.inventories.length <= 0) {
             newAssistant('HybridHuaweiVpc', 'create');
           }
         })
    },
    ...{
      create: Methods.methods.create
    },
    close() {
      let _this = this;
      _this.$router.push({ name: "hybridhuaweisecuritygroup" });
    },
    removeUuid(uuid) {
      let _this = this;
      _this[uuid] = "";
      _this.validate(uuid);
    },
    validate(name) {
      let _this = this,
        input = "",
        errorMsg = "";
      input = _this[name];
      switch (name) {
        case "name":
          errorMsg = _this.$t("common.name");
          break;
        case "vpcUuid":
          errorMsg = "VPC";
          break;
      }
      _this[`empty${name}`] = false;
      if (/^\s*$/.test(input)) {
        _this[`empty${name}`] = true;
        _this.rules[name].message = _this.$t("error.emptyInput") + errorMsg;
        return;
      }
    },
    openHybridHuaweiVpcSelect() {
      let _this = this;
      _this.validate("vpcUuid");
      _this.openDialog("HybridHuaweiVpcSingleSelect", {
        conditions: [],
        select: uuid => {
          _this.vpcUuid = uuid;
          _this.validate("vpcUuid");
        }
      });
    },
    validateAll() {
      let _this = this,
        props = ["name", "vpcUuid"];
      props.forEach(name => {
        _this.validate(name);
      });
      let invalid = props.some(
        name =>
          _this[`empty${name}`] === true || _this[`invalid${name}`] === true
      );
      return invalid;
    },
    createParam() {
      return {
        name: this.name,
        description: this.description,
        vpcUuid: this.vpcUuid
      };
    },
    confirm() {
      let _this = this;
      if (_this.validateAll()) return;
      _this.canCreate = false;
      _this
        .create(_this.createParam())
        .then(() => {
          _this.close();
        })
        .catch(() => {
          _this.canCreate = true;
        });
    }
  },
  destroyed() {
    let _this = this;
    _this.deleteAllAssistant();
  },
};
</script>

<style lang="less" scoped>
</style>
