
<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="title">{{$t('hybridvirtualprivatecloud.createVirtualPrivateCloud')}}</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到腾讯云Vpc列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <mh-input
        :label="'common.datacenter'"
        type="slot"
        :required="true"
        :show-error="emptydataCenterUuid"
        :error-message="rules.dataCenterUuid.message"
        prop="dataCenterUuid"
      >
        <add-or-delete-input
          @open="openDataCenterSelect"
          :value="dbData.hybridTencentDataCenter[dataCenterUuid] && dbData.hybridTencentDataCenter[dataCenterUuid].regionName"
          @remove="removeUuid('dataCenterUuid')"
          :class="{'is-error': emptydataCenterUuid}"
        />
      </mh-input>

      <mh-input
        type="text"
        :label="'common.name'"
        :required="true"
        v-model="name"
        :show-error="emptyname || invalidname"
        :error-message="rules.name.message"
        @validate="validate"
        prop="name"
      />

      <mh-input type="textarea" :label="'common.description'" v-model="description" prop="description" />

      <mh-input
        type="select"
        :label="'CIDR'"
        v-model="cidrBlock"
        :selectGroup="cidrBlockGroup"
        :required="true"
        @changeOption="handleChangeCidrBlock"
        prop="cidrBlock"
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
import { checkHybridTencentDataCenterAssistant } from "src/tencent/dataCenter/assistant/tencentDataCenterAssistant";
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import CreateTemplate from "src/component/CreateTemplate";
import WindowBase from "src/windows/Window";
import Methods from "../Methods";

export default {
  name: "CreateHybridTencentVirtualPrivateCloudPage",

  mixins: [WindowBase],

  components: {
    CreateTemplate,
    AddOrDeleteInput
  },

  data() {
    return {
      dataCenterUuid: "",
      name: "",
      description: "",
      cidrBlock: "10.0.0.0/16",
      emptyname: false,
      invalidname: false,
      emptydataCenterUuid: false,
      canCreate: true,
      rules: {
        name: { message: "" },
        dataCenterUuid: { message: "" }
      },
      cidrBlockGroup: [
        {
          value: "10.0.0.0/16",
          label: "10.0.0.0/16"
        },
        {
          value: "172.16.0.0/16",
          label: "172.16.0.0/16"
        },
        {
          value: "192.168.0.0/16",
          label: "192.168.0.0/16"
        }
      ]
    };
  },

  created() {
    checkHybridTencentDataCenterAssistant(this);
    this.initTencentDataCenter();
  },

  methods: {
    ...{
      create: Methods.methods.create
    },
    //回到腾讯云Vpc列表
    close() {
      this.$router.push({ name: "hybridtencentvpc" });
    },
    //选择下拉框
    handleChangeCidrBlock(item) {
      this.cidrBlock = item.value;
    },
    //单个校验
    validate(name) {
      let self = this,
        input = "";
      input = name === "name" ? String(self[name]).trim() : self[name];
      self[`invalid${name}`] = false;
      self[`empty${name}`] = false;
      self.rules[name].message = "";
      if (!input) {
        self[`empty${name}`] = true;
        self.rules[name].message =
          name === "dataCenterUuid"
            ? self.$t("error.unselected") + self.$t("common.datacenter")
            : self.$t("error.emptyInput") + self.$t(`common.${name}`);
        return;
      }
      self.rules[name].message = "";
      if (name === "name") {
        if (
          !/^[a-zA-Z][0-9a-zA-Z-_]{1,256}[0-9a-zA-Z]$/.test(
            input
          )
        ) {
          self[`invalid${name}`] = true;
          self.rules[name].message =
            self.$t("error.invalid") + self.$t(`common.${name}`);
          return;
        }
      }
    },
    //初始化腾讯云地域
    initTencentDataCenter() {
      let self = this;
      self
        .dispatchAction("hybridTencentDataCenter/basicQuery", {
          replyWithCount: true
        })
        .then(resp => {
          if (resp.total === 1) {
            self.dataCenterUuid = resp.uuidList[0];
          }
        });
		},
		//选择地域
    openDataCenterSelect() {
      let self = this;
      self.openDialog("HybridTencentDataCenterSingleSelect", {
        conditions: [],
        select: uuid => {
          self.dataCenterUuid = uuid;
          self.validate("dataCenterUuid");
        }
      });
    },
    //删除地域
    removeUuid(uuid) {
      let self = this;
      self[uuid] = "";
      self.validate("dataCenterUuid");
    },
    //整体校验
    validateAll() {
      let self = this,
        props = ["dataCenterUuid", "name"];
      props.forEach(name => self.validate(name));
      let invalid = props.some(
        name => self[`empty${name}`] === true || self[`invalid${name}`] === true
      );
      return invalid;
    },
    //创建参数
    createParam() {
      let self = this;
      return {
        name: self.name,
        dataCenterUuid: self.dataCenterUuid,
        description: self.description,
        cidrBlock: self.cidrBlock,
        vRouterName: `VRouter-VPC-${self.name}`
      };
    },
    //创建
    confirm() {
      let self = this;
      if (self.validateAll()) return;
      self.canCreate = false;
      self
        .create(self.createParam())
        .then(() => {
          self.$router.push({ name: "hybridtencentvpc" });
        })
        .catch(() => {
          self.canCreate = true;
        });
    }
  },

  destroyed() {
    this.deleteAllAssistant();
  }
};
</script>