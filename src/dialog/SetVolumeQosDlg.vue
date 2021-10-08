<template>
  <el-dialog :visible.async="visiabled" @close="cancel()">
    <div slot="title">{{$t('vm.setVolumeQos')}}</div>
    <div class="dialog-content">
      <div class="operation-row">
        <div class="title" v-text="$t('common.volumeTotalBandwidth')"></div>
        <div class="el-radio-group" style="margin-bottom: 10px;">
          <el-radio v-model="qosMode" label="qosModeTotal">{{$t('volume.qosModeTotal')}}</el-radio>
          <el-radio v-model="qosMode" label="qosModePart">{{$t('volume.qosModePart')}}</el-radio>
        </div>
        <div v-if="qosMode==='qosModeTotal'">
            <span style="display:inline-block; width: calc(100% - 90px)">
            <input v-model="windowData.volumeTotalBandwidth" type="text"
                   :class="{'is-error': isvolumeTotalValidate || isvolumeTotalformatValidate}"
                   placehoder="1Mbps ~ 100Gbps" @blur="validate('volumeTotal')"/>
          </span>
          <drop-down class="btn-primary more dropdown"
                     style="padding: 4px 10px;height: 30px;line-height: 30px;margin-left: -6px;">
          <span slot="title">
            <span class="text">{{windowData.volumeTotalBandwidthUnit}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content" style="min-width: 40px;">
              <a v-for="item in ['MB/s', 'GB/s']" @click="(e) => { updateWindow({ 'volumeTotalBandwidthUnit': item }) }"
                 style="padding-top: 12px;">
                 {{ item }}
              </a>
            </div>
          </span>
          </drop-down>
          <div v-if="isvolumeTotalValidate && !isvolumeTotalformatValidate" class="error error-text">
            {{$t('vm.resizeRootVolumeInfo')}}
          </div>
          <div v-if="isvolumeTotalformatValidate && !isvolumeTotalValidate" class="error error-text">
            {{$t('error.invalid')}}{{$t('common.volumeTotalBandwidth')}}
          </div>
        </div>
        <div v-if="qosMode==='qosModePart'">
          <div class="opreation-row">
            <div class="title" v-text="$t('volume.volumeReadBandwidth')"></div>
            <span style="display:inline-block; width: calc(100% - 90px)">
              <input type="text" v-model="windowData.volumeReadBandwidth"
                     :class="{'is-error': isvolumeReadValidate || isvolumeReadformatValidate}"
                     placehoder="1Mbps ~ 100Gbps" @blur="validate('volumeRead')"/>
          </span>
            <drop-down class="btn-primary more dropdown"
                       style="padding: 4px 10px;height: 30px;line-height: 30px;margin-left: -6px;">
              <span slot="title">
                <span class="text">{{windowData.volumeReadBandwidthUnit}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" style="min-width: 40px;">
                  <a v-for="item in ['MB/s', 'GB/s']"
                     @click="(e) => { updateWindow({ 'volumeReadBandwidthUnit': item }) }" style="padding-top: 12px;">
                   {{ item }}
                   </a>
                </div>
             </span>
            </drop-down>
            <div v-if="isvolumeReadValidate && !isvolumeReadformatValidate" class="error error-text">
              {{$t('vm.resizeRootVolumeInfo')}}
            </div>
            <div v-if="isvolumeReadformatValidate && !isvolumeReadValidate" class="error error-text">
              {{$t('error.invalid')}}{{$t('volume.volumeReadBandwidth')}}
            </div>
          </div>
          <div class="operation-row">
            <div class="title" v-text="$t('volume.volumeWriteBandwidth')"></div>
            <span style="display:inline-block; width: calc(100% - 90px)">
            <input type="text" v-model="windowData.volumeWriteBandwidth"
                   :class="{'is-error': isvolumeWriteValidate || isvolumeWriteformatValidate}"
                   placehoder="1Mbps ~ 100Gbps" @blur="validate('volumeWrite')"/>
          </span>
            <drop-down class="btn-primary more dropdown"
                       style="padding: 4px 10px;height: 30px;line-height: 30px;margin-left: -6px;">
          <span slot="title">
            <span class="text">{{windowData.volumeWriteBandwidthUnit}}</span>
          </span>
              <span slot="content">
            <div class="dropdown-content" style="min-width: 40px;">
              <a v-for="item in ['MB/s', 'GB/s']" @click="(e) => { updateWindow({ 'volumeWriteBandwidthUnit': item }) }"
                 style="padding-top: 12px;">
                {{ item }}
              </a>
            </div>
          </span>
            </drop-down>
            <div v-if="isvolumeWriteValidate && !isvolumeWriteformatValidate" class="error error-text">
              {{$t('vm.resizeRootVolumeInfo')}}
            </div>
            <div v-if="isvolumeWriteformatValidate && !isvolumeWriteValidate" class="error error-text">
              {{$t('error.invalid')}}{{$t('common.volumeTotalBandwidth')}}
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
    name: "SetVolumeQosDlg",
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
        size: '',
        bandWidthUnit: '',
        qosMode: 'qosModeTotal',
        isvolumeTotalValidate: false,
        isvolumeReadValidate: false,
        isvolumeWriteValidate: false,
        isvolumeTotalformatValidate: false,
        isvolumeReadformatValidate: false,
        isvolumeWriteformatValidate: false
      }
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
      this.updateWindow({
        volumeTotalBandwidth: '',
        volumeTotalBandwidthUnit: 'MB/s',
        volumeReadBandwidth: '',
        volumeReadBandwidthUnit: 'MB/s',
        volumeWriteBandwidth: '',
        volumeWriteBandwidthUnit: 'MB/s'
      })
        .then(() => {
          if (!self.dbData.common.isAdmin) {
            self.initInNormalAccount()
          }
        })
    },
    methods: {
      ...Validator,
      ...Utils,
      initInNormalAccount() {
        let self = this;
        let uuid = self.message.uuidList[0]
        let volume = self.$store.state.volume[uuid]
        self.qosMode = 'qosModeTotal';
        if ((volume.volumeReadBandwidth > -1) || (volume.volumeWriteBandwidth > -1)) {
          self.qosMode = 'qosModePart'
        }
      },
      confirmDlg() {
        let self = this;
        if(self.validateAll()){
          self.visiabled = false;
          self.$emit('close', {msg: self.createParam(), uuidList: self.message.uuidList});
        }
      },
      validateAll(){
        let qos = ['volumeTotal', 'volumeWrite', 'volumeRead'], self = this;
        qos.forEach((item) =>{
           self.validate(item);
        })
        let result = qos.some(item => {
          if(self.qosMode === '')
          return self[`is${item}formatValidate`] === true
        })
        if(result)
          return false;
        return true;
      },
      cancel() {
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      validate(name) {
        let self = this;
        let input = String(self.windowData[`${name}Bandwidth`].trim());
        if (name) {
          self[`is${name}Validate`] = false;
          if (self.qosMode === 'qosModeTotal' && self.windowData.volumeTotalBandwidth.trim() === '') {
            self.isvolumeTotalValidate = true;
            return;
          }
          if (self.qosMode !== 'qosModeTotal' && self.windowData.volumeReadBandwidth.trim() === '') {
            self.isvolumeReadValidate = true;
            return;
          }
          if (self.qosMode !== 'qosModeTotal' && self.windowData.volumeWriteBandwidth.trim() === '') {
            self.isvolumeWriteValidate = true;
            return;
          }
          let qos = ['volumeTotal', 'volumeWrite', 'volumeRead'];
          let hasName = qos.some((item) => {
            return item === name
          })
          if (hasName) {
            let unit = this.windowData[`${name}BandwidthUnit`]
            self[`is${name}formatValidate`] = !this.validateQos(input, unit);
            if(self[`is${name}formatValidate`]) return;
          }
        }
      },
      validateQos(value, unit) {
        if (!this.isUint(value)) {
          return false
        }
        let parsedInput = this.parseNumber(value, unit)
        let range = {
          maxValue: 1024 * 1024 * 1024 * 100,
          minValue: 1024 * 1024
        }
        if (!this.isIn(parsedInput, range)) {
          return false
        }
        return true
      },
      createParam() {
        let params = [], self = this;
        if (self.qosMode === 'qosModeTotal') {
          params = [{
            volumeBandwidth: self.parseNumber(self.windowData.volumeTotalBandwidth, self.windowData.volumeTotalBandwidthUnit),
            mode: 'total'
          }]
        }
        if (self.qosMode === 'qosModePart') {
          if (self.windowData.volumeWriteBandwidth !== '') {
            params.push({
              volumeBandwidth: self.parseNumber(self.windowData.volumeWriteBandwidth, self.windowData.volumeWriteBandwidthUnit),
              mode: 'write'
            })
          }
          if (self.windowData.volumeReadBandwidth !== '') {
            params.push({
              volumeBandwidth: self.parseNumber(self.windowData.volumeReadBandwidth, self.windowData.volumeReadBandwidthUnit),
              mode: 'read'
            })
          }
        }
        return params
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
