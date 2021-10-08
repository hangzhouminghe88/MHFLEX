<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t("billing.setting") }}{{$t(`common.gpu`)}}{{ $t("billing.Price")}}</span>
      <help-trigger name="GPUbillingsettings" :style="{'left': '145px', 'top': '30px'}"></help-trigger>
      <span
        class="create-back"
        @click="$router.push({name: 'billingsettings',params:{resourceName: 'gpu'}})"
      >
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到计费设置列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.type')}}</div>
        <div>{{$t('common.gpu')}}</div>
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
        <el-select v-model="getGputypeList" style="width: 100%">
          <el-option v-for="(item, index) in typeList" :key="index" :value="item.value">{{$t(`${item.name}`)}}</el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('gpuDevice.model')}}</div>
        <el-select v-model="getGpuModels" style="width: 100%">
          <el-option v-for="(item, index) in gpuModelsList" :key="index" :value="item.name">{{$t(`${item.name}`)}}</el-option>
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
        @click="$router.push({name:'billingsettings',params:{resourceName: 'gpu'}})"
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
  name: "CreateGpuDeivceBillingSettings",
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
      type: "desktopGpu",
      typeList: [
        { name: "gpuDevice.desktopGpu", value: "desktopGpu" },
        { name: "gpuDevice.computeGpu", value: "computeGpu" },
      ],
      emptyprice: false,
      invalidprice: false,
      price: "",
      gpuOfferingUuid: '',
      gpuModels: [],
      gpuModelName: '',
      gpuModelsList: []
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
    },
    getGputypeList:{
      get(){
        let self = this;
        return self.$t(`gpuDevice.${self.type}`);
      },
      set(val){
        let self = this;
        self.type = val;
      }
    },
    getGpuModels: {
      get(){
        let self = this;
        _.findIndex(self.gpuModelsList, item => {
          if(self.gpuModelName === item.name)
          self.gpuOfferingUuid = item.gpuOfferingUuid;
        })
        return self.gpuModelName;
      },
      set(val){
        let self = this;
        self.gpuModelName = val;
      }
    }
  },
  created(){
    let self = this;
    self.initGpuInfos();
  },
  methods: {
    ...{
      create: BillingSettingsMethods.methods.create
    },
    initGpuInfos () {
        let gpuModels = this.$route.params.gpuModels === 'create' ? [] : this.$route.params.gpuModels , obj ={}, self = this;
        this.gpuModelsList = []
        if (gpuModels.length > 0) {
          self.gpuModels = gpuModels.filter(gpu => gpu.type === 'GPU_Video_Controller')
          if (self.gpuModels.length > 0) {
            self.gpuModels.forEach((item) => {
              obj.name = self.getGpuModelName(item);
              obj.value = item.gpuOfferingUuid;
              self.gpuModelsList.push(obj);
               self.gpuModelName = self.gpuModelsList[0].name;
            })
          } else {
            obj.name = self.$t('billingConfig.undetectedGpu');
            obj.value = '';
            self.gpuModelsList.push(obj);
            self.gpuModelName = self.gpuModelsList[0].name;
          }
        }else{
          obj.name = self.getGpuModelName();
          obj.value = '';
          self.gpuModelsList.push(obj);
          self.gpuModelName = self.gpuModelsList[0].name;
        }
      },
      getGpuModelName (gpuModel) {
        if (this.$route.params.gpuModels === 'create') {
          return this.$t('billingConfig.undetectedGpu')
        }
        let description = gpuModel.description
        return description
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
        resourceName: "gpu",
        timeUnit: self.timeUnit,
        price: self.price,
        resourceUnit: self.numUnit,
        systemTags:[`gpuOfferingUuid::${this.gpuOfferingUuid}`]
      };
    },
    confirm() {
      debugger
      let self = this;
      self.validate("price");
      if (self.invalidprice || self.emptyprice || !self.gpuOfferingUuid) return;
      self.create(self.createParam());
      self.$router.push({
        name: "billingsettings",
        params: { resourceName: "gpu" }
      });
    },
     changeGpuType (type) {
       let obj = {}
        if (type !== this.type) {
          this.type = type
          if (type === 'desktopGpu') {
            this.gpuModels = this.param.gpuModels.filter(gpu => gpu.type === 'GPU_Video_Controller')
          } else {
            this.gpuModels = this.param.gpuModels.filter(gpu => gpu.type !== 'GPU_Video_Controller')
          }
          this.gpuModels.forEach((item) => {
            obj.name = this.getGpuModelName(item);
            obj.value = item.gpuOfferingUuid;
            this.gpuModelsList.push(obj);
          })
          this.gpuModelName = this.gpuModelsList[0].name;
        }
      },
  }
};
</script>

<style scoped>
</style>
