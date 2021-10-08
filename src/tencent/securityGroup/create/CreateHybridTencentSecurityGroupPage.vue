<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="title">{{$t('hybridesecuritygroup.create')}}</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到腾讯云安全组列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <mh-input
        :label="'common.name'"
        :required="true"
        :show-error="emptyname || invalidname"
        :error-message="rules.name.message"
        v-model="name"
        @validate="validate"
				placeholder="以字母汉字开头，内含字母数字下划线"
        prop="name"
      />

      <mh-input
        :label="'common.description'"
        type="textarea"
        v-model="description"
        prop="description"
      />

      <mh-input
        :label="'common.datacenter'"
        type="slot"
        :requreid="true"
        prop="dataCenterUuid"
        :show-error="emptydataCenterUuid"
        :error-message="rules.dataCenterUuid.message"
      >
        <add-or-delete-input
          :value="dbData.hybridTencentDataCenter[dataCenterUuid] && dbData.hybridTencentDataCenter[dataCenterUuid].regionName"
          :class="{'is-error': emptydataCenterUuid}"
          @open="openDataCenterSelect"
          @remove="removeUuid('dataCenterUuid')"
        />
      </mh-input>

      <mh-input :label="'projectId'" type="text" v-model="projectId" prop="projectId" />
    </div>

    <div slot="footer" class="create-footer">
      <span
        class="btn-confirm"
        :class="{'disabled': !canCreate}"
        @click="canCreate && confirm()"
      >{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import CreateTemplate from "src/component/CreateTemplate";
import WindowBase from "src/windows/Window";
import Methods from "../Methods";

export default {
  name: "CreateHybridTencentSecurityGroupPage",

  mixins: [WindowBase],

  components: {
    AddOrDeleteInput,
    CreateTemplate
  },

  data() {
    return {
      projectId: "",
      name: "",
      emptyname: false,
      invalidname: false,
      description: "",
      dataCenterUuid: "",
      emptydataCenterUuid: false,
      canCreate: true,
      rules: {
        name: { message: "" },
        dataCenterUuid: { message: "" }
      }
    };
  },

  methods: {
    ...{
      create: Methods.methods.create
    },
    //返回
    close() {
      let self = this;
      self.$router.push({ name: "hybridtencentsecuritygroup" });
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
    //单个校验
    validate(name) {
      let self = this,
        input = "";
      input = name === "name" ? String(self[name]).trim() : self[name];
      self.rules[name].message = "";
      self[`empty${name}`] = false;
      self[`invalid${name}`] = false;
      if (!input) {
        self[`empty${name}`] = true;
        self.rules[name].message =
          name === "dataCenterUuid"
            ? self.$t("error.emptyInput") + self.$t("common.datacenter")
            : self.$t("error.emptyInput") + self.$t(`common.${name}`);
        return;
			}
      if (name === "name") {
        let regx = /^[a-zA-Z\u4e00-\u9fa5][0-9a-zA-Z\u4e00-\u9fa5-_]{0,255}$/, regxEnd = /[0-9a-zA-Z\u4e00-\u9fa5]$/;
        if (!isNaN(input) || !regx.test(input) || !regxEnd.test(input)) {
          self[`invalid${name}`] = true;
          self.rules[name].message =
            self.$t("error.invalid") + self.$t(`common.${name}`);
          return;
        }
      }
    },
    //整体校验
    vaidateAll() {
      let self = this,
        props = ["name", "dataCenterUuid"];
      props.forEach(name => {
        self.validate(name);
      });
      let invalid = props.some(name =>  self[`empty${name}`] === true || self[`invalid${name}`] === true);
      return invalid;
		},
		//删除地域
		removeUuid(uuid) {
			let self = this;
			self[uuid] = '';
			self.validate(uuid);
		},
    //添加条件
    createParam() {
			let self = this;
      return {
        name: self.name,
        description: self.description,
        dataCenterUuid: self.dataCenterUuid,
        projectId: self.projectId
      };
    },

    confirm() {
      let self = this;
      if (self.vaidateAll()) return;
      self.canCreate = false;
      self
        .create(self.createParam())
        .then(() => {
          self.close();
        })
        .catch(() => {
          self.canCreate = true;
        });
    }
  }
};
</script>

<style scoped>
</style>
