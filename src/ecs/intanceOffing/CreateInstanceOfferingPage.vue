<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>
          {{$t('common.createInstanceOffering')}}
        </span>
      <span class="create-back" @click="$router.push({name: 'instanceoffering'})"><i
        class="el-icon-back"></i>返回计算规格列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" @blur="validate('name')" :class="{'is-error': emptyname}"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title" v-text="$t('common.description')"></div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required" v-text="'CPU'" :class="{'is-error': emptycpuNum || invalidcpuNum}" @blur="validate('cpuNum')"></div>
        <input type="number" v-model="cpuNum" min="1" max="1024" @blur="validate('cpuNum')" :class="{'is-error': emptycpuNum || invalidcpuNum}"/>
        <div class="error error-text" v-if='emptycpuNum && !invalidcpuNum'>CPU{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row size-dropdown">
        <div class="title required" v-text="$t('common.memorySize')"></div>
        <detail-size-editor :defaultsize="'G'" :size-list="['M', 'G', 'T']"
                            :value="memorySize" class="editor" style="margin-right: 70px;width: 100%"
                            :finish="setMemorySize"
                            :input-class="{'is-error': emptymemorySize||invalidmemorySize}"/>
        <div class="error error-text" v-if="emptymemorySize && !invalidmemorySize">{{$t('common.memorySize')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="dbData.common.isAdmin">
        <div class="title required" v-text="$t('instanceOffering.allocatorStrategy')"></div>
        <el-select v-model="getAllocatorStrategy" style="width: 100%;">
          <el-option v-for="(item, index) in allocatorStrategyList" :key="index" :value="item">{{$t(`instanceOffering.${item}`)}}</el-option>
        </el-select>
      </div>
      <div class="operation-row" v-if="dbData.common.isAdmin && (allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy' || allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy')">
        <div class="title" v-permission="'INSTANCEOFFERING.ALLOCATTORSTRATEGY'" >
          {{$t("instanceOffering.strategyPattern")}}
        </div>
        <help-trigger name="strategyPattern" />
        <el-select v-model="getStrategyPattern" style="width: 100%;">
          <el-option v-for="(item, key) in strategyPatternList" :key="key" :value="item">{{$t(`instanceOffering.${item}`)}}</el-option>
        </el-select>
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
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confrim()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'instanceoffering'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import DetailSizeEditor from 'src/component/Detail/SizeEditor';
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import Utils from 'src/utils/utils';

  export default {
    name: "CreateInstanceOfferingPage",
    mixins: [WindowBase],
    components: {CreateTemplate, DetailSizeEditor},
    data(){
      return {
        name: '',
        emptyname: false,
        emptycpuNum: false,
        invalidcpuNum: false,
        invalidvolumeTotalBandwidth: false,
        invalidvolumeReadBandwidth: false,
        invalidvolumeWriteBandwidth: false,
        invalidnetworkOutboundBandwidth: false,
        invalidnetworkInboundBandwidth: false,
        invalidmemorySize: false,
        invalidmaxInstancePerHost: false,
        emptymemorySize: false,
        description: '',
        cpuNum: '',
        memorySize: '',
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
        maxInstancePerHost: '',
        canCreate: true
      }
    },
    computed: {
      getAllocatorStrategy: {
        get(){
            let self = this;
            return self.$t(`instanceOffering.${self.allocatorStrategy}`)
        },
        set(val){
          let self = this;
          self.allocatorStrategy = val;
        }
      },
      getStrategyPattern:{
        get(){
          let self = this;
          return self.$t(`instanceOffering.${self.strategyPattern}`)
        },
        set(val){
          let self = this;
          self.strategyPattern = val;
        }
      }
    },
    methods: {
      ...Validator,
      ...Utils,
      //确定创建
      confrim() {
        let self = this;
        self.validateAll();
        if(self.invalidInput) return
        self.canCreate = false;
        this.dispatchActionWithEvent('instanceOffering/create', self.createParam())
          .then(() =>{
            self.$router.push({name: 'instanceoffering'})
          }).catch(() => {
          self.canCreate = true;
        });
      },
      //创建参数
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
      //设置内存
      setMemorySize(value){
        let self = this;
        if(value)
        self.memorySize = value;
        self.validate('memorySize');
      },
      //设置上行网络带宽
      setNetworkInboundBandwidth(value){
        let self = this;
        if(value)
        self.networkInboundBandwidth = value;
        self.validate('networkInboundBandwidth');
      },
      //设置下行网络带宽
      setNetworkOutboundBandwidth(value){
        let self = this;
        if(value)
          self.networkOutboundBandwidth = value;
        self.validate('networkOutboundBandwidth');
      },
      //设置写入速度
      setVolumeWriteBandwidth(value){
        let self = this;
        if(value)
          self.volumeWriteBandwidth = value;
        self.validate('volumeWriteBandwidth');
      },
      //设置读取速度
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
      //校验表单
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
    }
  }
</script>

