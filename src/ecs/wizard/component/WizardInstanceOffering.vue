<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <help-trigger name="instanceOffering"/>
      <input v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
      <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
    </div>

    <div class="operation-row">
      <div class="title">{{$t('common.description')}}</div>
      <textarea rows="3" v-model="description"/>
    </div>

    <div class="operation-row">
      <div class="title required">{{$t('common.cpuNum')}}</div>
      <input placeholder="1~1024" type="number" step="any" min="1" v-model="cpuNum" :class="{'is-error': emptycpuNum || invalidcpuNum}" @blur="validate('cpuNum')"/>
      <div class="error error-text" v-if="emptycpuNum">{{$t('error.emptyInput') + $t('common.cpuNum')}}</div>
      <div class="error error-text" v-if="!emptycpuNum && invalidcpuNum">{{$t('error.invalid') + $t('common.cpuNum')}}</div>
    </div>

    <div class="operation-row size-dropdown">
      <div class="title required">{{$t('common.memory')}}</div>
      <detail-size-editor :defaultsize="'G'" :size-list="['M', 'G', 'T']"
                          :value="memorySize" class="editor" style="margin-right: 70px;width: 100%"
                          :finish="setMemorySize"
                          :input-class="{'is-error': emptymemorySize||invalidmemorySize}"
                         />
      <div class="error error-text" v-if="emptymemorySize && !invalidmemorySize">{{$t('common.memorySize')}}{{$t('error.noEmpty')}}</div>
    </div>

    <div class="operation-row">
      <div class="title">{{$t('instanceOffering.allocatorStrategy')}}</div>
      <help-trigger name="allocatorStrategy"/>
      <drop-down class="dropdown create-dropdown">
          <span slot="title">
            <span class="text">{{$t(`instanceOffering.${allocatorStrategy}`)}}</span>
          </span>
        <span slot="content">
            <div class="dropdown-content">
              <a @click="(e) => { allocatorStrategy =  item }"
                 :key="index"
                 v-for="(item,index) in allocatorStrategyList">{{$t(`instanceOffering.${item}`)}}</a>
            </div>
          </span>
      </drop-down>
    </div>

    <div class="operation-row" v-if="allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy' && !dbData.common.isOpensource">
      <div class="title required">
        {{$t("instanceOffering.maxInstancePerHost")}}
      </div>
      <input type="number"  step="any" min="1" v-model="maxInstancePerHost" :class="{'error-input': emptymaxInstancePerHost || invalidmaxInstancePerHost}" @input="(e) => { maxInstancePerHost =  e.target.value}" @blur="validate('maxInstancePerHost')" @keydown.enter="validate('maxInstancePerHost')" />
    </div>

    <div class="operation-row">
      <div class="title" v-text="$t('common.volumeTotalBandwidth')"></div>
      <el-radio v-model="type" label="qosModeTotal">{{$t('volume.qosModeTotal')}}</el-radio>
      <el-radio v-model="type" label="qosModePart">{{$t('volume.qosModePart')}}</el-radio>
    </div>

    <div class="operation-row size-dropdown" v-if="type === 'qosModeTotal'">
      <div class="title">{{$t('volume.qos')}}</div>
      <detail-size-editor :defaultsize="'M'" :size-list="['M', 'G']"
                          :value="volumeTotalBandwidth" class="editor" style="margin-right: 70px;width: 100%"
                          :finish="setVolumeTotalBandwidth"
                          :unit="'B/s'"
                          :inputClass="{'is-error': invalidvolumeTotalBandwidth}"
                          :placeholder="'1MB/s ~ 100GB/s'"/>
      <div class="error error-text" v-if="invalidvolumeTotalBandwidth">
        {{$t("error.invalid")+$t("common.volumeTotalBandwidth")}}
      </div>
    </div>

    <div class="operation-row size-dropdown" v-if="type === 'qosModePart'">
      <div class="title">{{$t('volume.volumeReadBandwidth')}}</div>
      <detail-size-editor :defaultsize="'M'" :size-list="['M', 'G']"
                          :value="volumeReadBandwidth" class="editor" style="margin-right: 70px;width: 100%"
                          :finish="setVolumeReadBandwidth"
                          :unit="'B/s'"
                          :inputClass="{'is-error': invalidvolumeReadBandwidth}"
                          :placeholder="'1MB/s ~ 100GB/s'"/>
      <div class="error error-text" v-if="invalidvolumeReadBandwidth">
        {{$t("error.invalid")+$t("volume.volumeReadBandwidth")}}
      </div>
    </div>

    <div class="operation-row size-dropdown"v-if="type === 'qosModePart'">
      <div class="title">{{$t('volume.volumeWriteBandwidth')}}</div>
      <detail-size-editor :defaultsize="'M'" :size-list="['M', 'G']"
                          :value="volumeWriteBandwidth" class="editor" style="margin-right: 70px;width: 100%"
                          :finish="setVolumeWriteBandwidth"
                          :unit="'B/s'"
                          :inputClass="{'is-error': invalidvolumeWriteBandwidth}"
                          :placeholder="'1MB/s ~ 100GB/s'"/>
      <div class="error error-text" v-if="invalidvolumeWriteBandwidth">
        {{$t("error.invalid")+$t("volume.volumeWriteBandwidth")}}
      </div>
    </div>

    <div class="operation-row size-dropdown">
      <div class="title">{{$t('common.networkOutboundBandwidth')}}</div>
      <detail-size-editor :defaultsize="'M'" :size-list="['K','M', 'G']"
                          :value="networkOutboundBandwidth" class="editor" style="margin-right: 70px;width: 100%"
                          :finish="setNetworkOutboundBandwidth"
                          :unit="'bps'"
                          :inputClass="{'is-error': invalidnetworkOutboundBandwidth}"
                          :placeholder="'1Mbps ~ 100Gbps'"/>
      <div class="error error-text" v-if="invalidnetworkOutboundBandwidth">
        {{$t("error.invalid")+$t("common.networkOutboundBandwidth")}}
      </div>
    </div>

    <div class="operation-row size-dropdown">
      <div class="title">{{$t('common.networkInboundBandwidth')}}</div>
      <detail-size-editor :defaultsize="'M'" :size-list="['K', 'M', 'G']"
                          :value="networkInboundBandwidth" class="editor" style="margin-right: 70px;width: 100%"
                          :finish="setNetworkInboundBandwidth"
                          :unit="'bps'"
                          :inputClass="{'is-error': invalidnetworkInboundBandwidth}"
                          :placeholder="'1Mbps ~ 100Gbps'"/>
      <div class="error error-text" v-if="invalidnetworkInboundBandwidth">
        {{$t("error.invalid")+$t("common.networkInboundBandwidth")}}
      </div>
    </div>

  </div>
</template>

<script>
  //添加计算规格导航
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  export default {
    name: "WizardInstanceOffering",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        },
      },
      'parentWindowUuid': {
        type: String,
        default: ''
      }
    },
    data(){
      return {
        name: 'InstanceOffering-1',
        emptyname: false,
        emptycpuNum: false,
        invalidcpuNum: false,
        invalidvolumeTotalBandwidth: false,
        invalidvolumeReadBandwidth: false,
        invalidvolumeWriteBandwidth: false,
        invalidnetworkOutboundBandwidth: false,
        invalidnetworkInboundBandwidth: false,
        invalidmemorySize: false,
        emptymemorySize: false,
        description: '',
        cpuNum: '1',
        memorySize: '1',
        strategyPattern: 'soft',
        strategyPatternList: ['soft', 'hard'],
        allocatorStrategy:'LeastVmPreferredHostAllocatorStrategy',
        allocatorStrategyList: ['LeastVmPreferredHostAllocatorStrategy', 'MinimumCPUUsageHostAllocatorStrategy', 'MinimumMemoryUsageHostAllocatorStrategy', 'MaxInstancePerHostHostAllocatorStrategy'],
        type: 'qosModeTotal',
        volumeTotalBandwidth: '',
        networkOutboundBandwidth: '',
        networkInboundBandwidth:'',
        volumeWriteBandwidth: '',
        volumeReadBandwidth: '',
        invalidInput: false,
        maxInstancePerHost: '10',
        wizard: {},
        emptymaxInstancePerHost: false,
        invalidmaxInstancePerHost: false
      }
    },
    created(){
      let wizard = _.cloneDeep(this.$store.state.windowManager.windows[this.parentWindowUuid].wizard), self = this;
      self.wizard = wizard;
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
    },
    methods: {
      ...Validator,
      ...Utils,
      //添加计算规格参数
      createParam () {
        let bandWidths = {
          volumeTotalBandwidth: this.volumeTotalBandwidth === '' ? '' : this.volumeTotalBandwidth
        }
        if (this.type === 'qosModePart') {
          bandWidths = {
            volumeReadBandwidth: this.volumeReadBandwidth === '' ? '' : this.volumeReadBandwidth,
            volumeWriteBandwidth: this.volumeWriteBandwidth === '' ? '' : this.volumeWriteBandwidth
          }
        }
        return {
          name: this.name,
          description: this.description,
          cpuNum: parseInt(this.cpuNum),
          memorySize: this.memorySize,
          allocatorStrategy: this.allocatorStrategy,
          maxInstancePerHost: this.maxInstancePerHost,
          strategyPattern: this.strategyPattern,
          bandWidths: bandWidths,
          networkInboundBandwidth: this.networkInboundBandwidth === '' ? '' : this.networkInboundBandwidth,
          networkOutboundBandwidth: this.networkOutboundBandwidth === '' ? '' : this.networkOutboundBandwidth
        }
      },
      //设置内存大小
      setMemorySize(value){
        let self = this;
        if(value)
          self.memorySize = value;
        self.validate('memorySize');
      },
      //设置网络入带宽
      setNetworkInboundBandwidth(value){
        let self = this;
        if(value)
          self.networkInboundBandwidth = value;
        self.validate('networkInboundBandwidth');
      },
      //设置网络出带宽
      setNetworkOutboundBandwidth(value){
        let self = this;
        if(value)
          self.networkOutboundBandwidth = value;
        self.validate('networkOutboundBandwidth');
      },
      //设置云盘写入
      setVolumeWriteBandwidth(value){
        let self = this;
        if(value)
          self.volumeWriteBandwidth = value;
        self.validate('volumeWriteBandwidth');
      },
      setVolumeReadBandwidth(value){
        let self = this;
        if(value)
          self.volumeReadBandwidth = value;
        self.validate('volumeReadBandwidth');
      },
      setVolumeTotalBandwidth(value){
        let self = this;
        if(value)
          self.volumeTotalBandwidth = value;
        self.validate('volumeTotalBandwidth');
      },
      validate (name) {
        const self = this
        self[`empty${name}`] = false
        let input = name === 'name' ? String(self[name]).trim() : self[name]
        if (input === undefined || input === '' || input === null) {
          self[`empty${name}`] = true
          self[`invalid${name}`] = false
          return
        }
        self[`invalid${name}`] = false
        let isUntils = ['memorySize', 'cpuNum', 'networkOutboundBandwidth', 'networkInboundBandwidth', 'volumeTotalBandwidth']
        let isNum = ['cpuNum']
        if (isUntils.indexOf(name) > -1) {
          if (name === 'cpuNum') {
            if (!self.isOverInt(input) || input < 1 || input > 1024) {
              self[`invalid${name}`] = true
            }
            return
          }
          if (name === 'memorySize') {
            let size = input
            const min = self.parseNumber('16', 'M')
            const max = self.parseNumber('1000', 'T')
            if (size < min || size > max) {
              self[`invalid${name}`] = true
            }
            return
          }
          if (['networkOutboundBandwidth', 'networkInboundBandwidth'].indexOf(name) > -1) {
            let size = input
            if (size <= 8192) {
              self[`invalid${name}`] = true
            }
            return
          }
        }
        if (self.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy' && name === 'maxInstancePerHost') {
          if (!self.isNumber(input)) {
            self[`invalid${name}`] = true
          }
          if (self.isNumber(input) && parseInt(input) < 1) {
            self[`invalid${name}`] = true
          }
          return
        }
        if (isNum.indexOf(name) > -1) {
          if (!self.isOverInt(input)) {
            self[`invalid${name}`] = true
            return
          }
        }
      },
      validateAll () {
        let self = this;
        self.invalidInput = false
        let props = ['name', 'memorySize', 'cpuNum']
        if (this.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy') {
          props.push('maxInstancePerHost')
        }
        let bandWidths = ['networkOutboundBandwidth', 'networkInboundBandwidth', 'volumeTotalBandwidth']
        bandWidths.forEach(item => {
          if (this[item]) {
            props.push(item)
          }
        })
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) this.invalidInput = true
      },

      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        self.validateAll();
        if(this.invalidInput) return;
        self.param.update(self.createParam());
      }

    },
    destroyed(){
      let self = this;
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true);
    },
  }
</script>

<style scoped>

</style>
