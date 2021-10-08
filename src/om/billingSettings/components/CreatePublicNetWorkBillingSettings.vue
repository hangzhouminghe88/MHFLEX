<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t("billing.setting") }}{{$t(`common.publicNetworkIP`)}}{{ $t("billing.Price")}}</span>
      <help-trigger name="publicNetworkIPbillingsettings" :style="{'left': '130px', 'top': '30px'}"></help-trigger>
      <span
        class="create-back"
        @click="$router.push({name: 'billingsettings',params:{resourceName: 'publicNetworkIP'}})"
      >
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到计费设置列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.type')}}</div>
        <div>{{$t(`common.publicNetworkIP`)}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.networkType')}}</div>
        <el-radio v-model="netWorkType" label="pubIpVmNicBandwidthOut">扁平网络公网IP</el-radio>
        <el-radio v-model="netWorkType" label="pubIpVipBandwidthOut">虚拟网络</el-radio>
      </div>
      <div class="operation-row">
        <div class="titlte" style="font-size: 16px;">{{$t('billingConfig.price')}}</div>
        <span style="border: 0.5px solid #dae0e6;display: inline-block;width: 100%;margin-top: 10px;"></span>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('billing.outBandwidthPrice')}}</div>
        <input type="text" v-model="outBandwidthPrice" :class="{'is-error': invalidoutBandwidthPrice || (emptyoutBandwidthPrice && emptyinBandwidthPrice)}" @blur="validate('outBandwidthPrice');"/>
        <div class="error error-text" v-if="!(emptyoutBandwidthPrice || emptyinBandwidthPrice) && invalidoutBandwidthPrice">{{$t('billing.outBandwidthPrice')}}{{$t('error.invalid')}}</div>
        <div class="error error-text" v-if="emptyoutBandwidthPrice && emptyinBandwidthPrice">{{$t('billing.bothEmptyBandwidth')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('billing.inBandwidthPrice')}}</div>
        <input type="text" v-model="inBandwidthPrice" :class="{'is-error': invalidinBandwidthPrice || (emptyoutBandwidthPrice && emptyinBandwidthPrice)}"  @blur="validate('inBandwidthPrice')"/>
        <div class="error error-text" v-if="!(emptyoutBandwidthPrice || emptyinBandwidthPrice) && invalidinBandwidthPrice">{{$t('billing.outBandwidthPrice')}}{{$t('error.invalid')}}</div>
        <div class="error error-text"  v-if="emptyoutBandwidthPrice && emptyinBandwidthPrice">{{$t('billing.bothEmptyBandwidth')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('billingConfig.numUnit')}}</div>
        <div v-text="'Mbps'"></div>
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
        @click="$router.push({name:'billingsettings',params:{resourceName: 'publicNetworkIP'}})"
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
import { denodeify } from 'q';
export default {
  name: "CreatePublicNetWorkBillingSettings",
  mixins: [WindowBase],
  components: {
    CreateTemplate,
    DropDown
  },
  data() {
    let self = this;
    return {
      netWorkType: 'pubIpVmNicBandwidthOut',
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
      numUnitParam: {
        getOptionList: () => {
          return self.numUnitList;
        },
        getIndex() {
          return _.findIndex(self.numUnitList, item => {
            return self.numUnit === item.value;
          });
        },
        setIndex: index => {
          return (self.numUnit = self.numUnitList[index].value);
        }
      },
      emptyprice: false,
      invalidprice: false,
      price: "",
      outBandwidthPrice: '',
      inBandwidthPrice: '',
      invalidoutBandwidthPrice: false,
      invalidinBandwidthPrice: false,
      emptyoutBandwidthPrice: false,
      emptyinBandwidthPrice: false,
      invalid: false
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
        return
      }
      if (name.indexOf('Price') > -1 && !/^\d+(\.\d{0,5})?$/.test(self[name])) {
        self[`invalid${name}`] = true;
        return;
      }
    },
    createParam() {
      let self = this;
       let paramList = []
          let resourceName, price
          if (this.outBandwidthPrice) {
            resourceName = self.netWorkType
            price = self.outBandwidthPrice
            paramList.push({
              resourceName: resourceName,
              timeUnit: self.timeUnit,
              resourceUnit: 'M',
              price: price
            })
          }
          if (this.inBandwidthPrice) {
            resourceName = self.netWorkType
            price = self.inBandwidthPrice
            paramList.push({
              resourceName: resourceName,
              timeUnit: self.timeUnit,
              resourceUnit: 'M',
              price: price
            })
          }
          return paramList
    },
    validateAll(){
      let self = this, prop=['outBandwidthPrice', 'inBandwidthPrice'];
      prop.forEach((name) => {
        self.validate(name);
      })
      self.invalid = prop.some((name) => self[`invalie${name}`] == true || (self.emptyoutBandwidthPrice && self.emptyinBandwidthPrice));
    },
    confirm() {
      let self = this;
      self.validateAll();
      if (self.invalid) return;
      self.create(self.createParam());
      self.$router.push({
        name: "billingsettings",
        params: { resourceName: "publicNetworkIP" }
      });
    }
  }
};
</script>

<style scoped>
</style>
