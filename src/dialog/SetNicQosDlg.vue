<template>
  <el-dialog :visible.async="visiabled" @close="cancel()">
    <div slot="title">{{$t('vm.setVolumeQos')}}</div>
    <div class="dialog-content">
      <div class="operation-row">
        <div>
          <div class="opreation-row">
            <div class="title" v-text="$t('common.networkOutboundBandwidth')"></div>
            <span style="display:inline-block; width: calc(100% - 90px)">
            <input v-model="windowData.networkOutboundBandwidth" :class="{'is-error': (windowData.emptynetworkInboundBandwidth && windowData.emptynetworkOutboundBandwidth) || (!windowData.emptynetworkOutboundBandwidth && windowData.invalidnetworkOutboundBandwidth)}" placeholder="8Kbps ~ 30Gbps" type="number" @blur="validate('networkOutboundBandwidth')" @keydown.enter="validate('networkOutboundBandwidth')" />
          </span>
            <drop-down class="btn-primary more dropdown"
                       style="padding: 4px 10px;height: 30px;line-height: 30px;margin-left: -6px;">
              <span slot="title">
                <span class="text">{{`${windowData.networkOutboundBandwidthUnit}bps`}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" style="min-width: 40px;">
                  <a v-for="(item, index) in unitList" :key="index"
                     @click="selectSize(item, 'networkOutboundBandwidthUnit')" style="padding-top: 12px;">
                   {{ `${item}bps` }}
                   </a>
                </div>
             </span>
            </drop-down>
            <div  class="error error-text" v-if="(windowData.emptynetworkInboundBandwidth && windowData.emptynetworkOutboundBandwidth) && !windowData.invalidnetworkOutboundBandwidth">
              {{$t('common.networkInboundBandwidth')}}/{{$t('common.networkOutboundBandwidth')}}{{$t('common.bothEmpty')}}
            </div>
            <div  class="error error-text"  v-if="!(windowData.emptynetworkInboundBandwidth && windowData.emptynetworkOutboundBandwidth) && windowData.invalidnetworkOutboundBandwidth">
              {{$t('error.invalid')}}{{$t('common.networkOutboundBandwidth')}}
            </div>
          </div>
          <div class="operation-row">
            <div class="title" v-text="$t('common.networkInboundBandwidth')"></div>
            <span style="display:inline-block; width: calc(100% - 90px)">
            <input v-model="windowData.networkInboundBandwidth" :class="{'is-error': (windowData.emptynetworkInboundBandwidth && windowData.emptynetworkOutboundBandwidth) || (!windowData.emptynetworkInboundBandwidth && windowData.invalidnetworkInboundBandwidth)}" type="number" @input="(e) => { updateWindow({ 'networkInboundBandwidth': e.target.value }) }" @blur="validate('networkInboundBandwidth')" @keydown.enter="validate('networkInboundBandwidth')" placeholder="8Kbps ~ 30Gbps" />
          </span>
            <drop-down class="btn-primary more dropdown"
                       style="padding: 4px 10px;height: 30px;line-height: 30px;margin-left: -6px;">
          <span slot="title">
            <span class="text">{{`${windowData.networkInboundBandwidthUnit}bps`}}</span>
          </span>
              <span slot="content">
            <div class="dropdown-content" style="min-width: 40px;">
              <a v-for="(item, index) in unitList" :key="index"
                 @click="selectSize(item, 'networkInboundBandwidthUnit')"
                 style="padding-top: 12px;">
                {{ `${item}bps` }}
              </a>
            </div>
          </span>
            </drop-down>
            <div  class="error error-text"  v-if="(windowData.emptynetworkInboundBandwidth && windowData.emptynetworkOutboundBandwidth) && !windowData.invalidnetworkInboundBandwidth">
              {{$t('common.networkInboundBandwidth')}}/{{$t('common.networkOutboundBandwidth')}}{{$t('common.bothEmpty')}}
            </div>
            <div class="error error-text"  v-if="!(windowData.emptynetworkInboundBandwidth && windowData.emptynetworkOutboundBandwidth) && windowData.invalidnetworkInboundBandwidth">
              {{$t('error.invalid')}} {{$t('common.networkInboundBandwidth')}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import Utils from 'src/utils/utils';

  export default {
    name: "SetNicQosDlg",
    mixins: [WindowBase],
    props: {
      message: {
        type: Object,
        default: {}
      },
      model: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        visiabled: false,
        bandWidthUnit: '',
        unitList: ['K', 'M', 'G'],
        innewValue: '',
        outnewValue: ''
      }
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
      this.updateWindow({
        networkInboundBandwidthUnit: 'K',
        networkOutboundBandwidthUnit: 'K',
        volumeTotalBandwidth: '',
        networkInboundBandwidth: '',
        networkOutboundBandwidth: ''
      })
    },
    methods: {
      ...Validator,
      ...Utils,
      confirmDlg() {
        let self = this;
        self.validateAll();
        if(!this.windowData.invalidInput){
          self.visiabled = false;
          self.$emit('close', {msg: self.createParam(), uuidList: self.message.uuidList});
        }
      },
      createParam(){
        this.inedit()
        this.outedit()
        if (isNaN(this.outnewValue) && isNaN(this.innewValue)) return
        return {outboundBandwidth: this.outnewValue, inboundBandwidth: this.innewValue}
      },
      validateBothEmpty: function () {
        let obj = {
          emptynetworkInboundBandwidth: false,
          emptynetworkOutboundBandwidth: false
        }
        if (this.windowData.networkInboundBandwidth === '') {
          obj.emptynetworkInboundBandwidth = true
        }
        if (this.windowData.networkOutboundBandwidth === '') {
          obj.emptynetworkOutboundBandwidth = true
        }
        this.updateWindow(obj)
        if (obj.emptynetworkInboundBandwidth && obj.emptynetworkOutboundBandwidth) {
          return true
        }
      },
      validate (name) {
        if (this.validateBothEmpty()) {
          return
        }
        let input = this.windowData[name]
        let obj = {}
        obj[`invalid${name}`] = false
        let parsedInput = this.parseSize(input + this.windowData[`${name}Unit`])
        let range = {
          maxValue: 32212254720,
          minValue: 8192
        }
        if (!this.isIn(parsedInput, range)) {
          obj[`invalid${name}`] = true
        }
        this.updateWindow(obj)
      },
      validateAll () {
        let obj = {}
        obj.invalidInput = false
        let props = ['networkInboundBandwidth', 'networkOutboundBandwidth']
        props.forEach(item => this.validate(item))
        let isInvalid = props.every(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      cancel() {
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      inedit: function () {
        this.innewValue = this.parseSize(this.windowData.networkInboundBandwidth + this.windowData.networkInboundBandwidthUnit)
      },
      outedit: function () {
        this.outnewValue = this.parseSize(this.windowData.networkOutboundBandwidth + this.windowData.networkOutboundBandwidthUnit)
      },
      selectSize(size, unitName, dropName, $event) {
        let obj = {}
        obj[unitName] = size
        obj[dropName] = !this.windowData[dropName]
        this.updateWindow(obj).then(() => {
          let propName = unitName.replace('Unit', '')
          this.validate(propName)
        })
      },
    },
    watch: {
      model(newVal, oldVal) {
        let self = this;
        if (newVal !== oldVal) {
          self.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
