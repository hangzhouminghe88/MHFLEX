<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t("billing.setting") }}{{$t(`common.memory`)}}{{ $t("billing.Price")}}</span>
      <help-trigger name="Memorybillingsettings" :style="{'left': '118px', 'top': '30px'}"></help-trigger>
      <span
        class="create-back"
        @click="$router.push({name: 'billingsettings',params:{resourceName: 'memory'}})"
      >
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到计费设置列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.type')}}</div>
        <div>{{$t('common.memory')}}</div>
      </div>
      <div class="operation-row">
        <div class="title requried">{{$t('billingConfig.price')}}</div>
        <input
          type="text"
          v-model="price"
          :class="{'is-error': emptyprice ||invalidprice}"
          :placeholder="$t('billing.billPriceRange')"
          @blur="validate('price')"
        >
        <div
          class="error error-text"
          v-if="emptyprice && !invalidprice"
        >{{$t('billingConfig.price')}}{{$t('error.noEmpty')}}</div>
        <div
          class="error error-text"
          v-if="invalidprice && !emptyprice"
        >{{$t('error.invalid')}}{{$t('billingConfig.price')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('billingConfig.numUnit')}}</div>
        <el-select v-model="numUnit" style="width: 100%">
          <el-option  v-for="(item, index ) in numUnitList"  :key="index" :value="item.value"></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('billingConfig.timeUnit')}}</div>
        <el-select v-model="getTimeUnit" style="width: 100%">
          <el-option v-for="(item, index) in timeUnitList" :key="index" :value="item.value">{{$t(`${item.name}`)}}</el-option>
        </el-select>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span
        class="btn-cancel"
        @click="$router.push({name:'billingsettings',params:{resourceName: 'memory'}})"
      >{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
import DropDown from "src/ecs/autoScalingGroup/component/Dropdown";
import BillingSettingsMethods from "src/om/billingSettings/Methods";
import CreateTemplate from "src/component/CreateTemplate";
import WindowBase from "src/windows/Window";
import rpc from "src/utils/rpc";
export default {
  name: "CreateMemoryBillingSettings",
  mixins: [WindowBase],
  components: {
    CreateTemplate,
    DropDown
  },
  data() {
    let self = this;
    return {
      timeUnitList: [
        { name: "common.second", value: "s" },
        { name: "common.minute", value: "m" },
        { name: "common.hour", value: "h" },
        { name: "common.day", value: "d" },
        { name: "common.week", value: "w" },
        { name: "common.month30", value: "mon" }
      ],
      timeUnit: "h",
      numUnit: "G",
      numUnitList: [
        { name: "M", value: "M" },
        { name: "G", value: "G" },
        { name: "T", value: "T" }
      ],
      emptyprice: false,
      invalidprice: false,
      price: ""
    };
  },
  computed: {
    getTimeUnit:{
      get(){
        let self = this, value;
        switch (self.timeUnit) {
          case 's':
            value = self.$t('common.second');
            break;
          case 'm':
            value = self.$t('common.minute');
            break;
          case 'h':
            value = self.$t('common.hour');
            break;
          case 'd':
            value = self.$t('common.day');
            break;
          case 'w':
            value = self.$t('common.week');
            break;
          case 'mon':
            value = self.$t('common.month30');
            break;
        }
        return value;
      },
      set(val){
        let self = this;
        self.timeUnit = val;
      }
    }
  },
  methods: {
    ...{
      create: BillingSettingsMethods.methods.create
    },
    validate(name) {
      let self = this;
      self[`empty${name}`] = false;
      self[`invalid${name}`] = false;
      let input = name === "name" ? String(self[name]).trim() : self[name];
      if (!input) {
        self[`empty${name}`] = true;
        return;
      }
      if (name === "price" && !/^\d+(\.\d{0,5})?$/.test(self[name])) {
        self[`invalid${name}`] = true;
        return;
      }
    },
    createParam() {
      let self = this;
      return {
        resourceName: "memory",
        timeUnit: self.timeUnit,
        price: self.price,
        resourceUnit: self.numUnit
      };
    },
    confirm() {
      let self = this;
      self.validate("price");
      if (self.invalidprice || self.emptyprice) return;
      self.create(self.createParam());
      self.$router.push({
        name: "billingsettings",
        params: { resourceName: "memory" }
      });
    }
  }
};
</script>

<style scoped>
</style>
