<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('common.createVolumeOffering')}}</span>
      <span class="create-back" @click="$router.push({name: 'volumeoffering'})">
          <i class="el-icon-back"></i>回到云盘规格列表
        </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">
          {{$t('common.name')}}{{$t('error.noEmpty')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row size-dropdown">
        <div class="title required" v-text="$t('volumeoffering.diskSize')"></div>
        <detail-size-editor :defaultsize="'G'" :size-list="['M', 'G', 'T']"
                            :value="diskSize" class="editor" style="margin-right: 70px;width: 100%"
                            :finish="setMemorySize"
                            :input-class="{'is-error': emptydiskSize||invaliddiskSize}"
                            :placeholder="'40'"/>
        <div class="error error-text" v-if="emptydiskSize && !invaliddiskSize">
          {{$t('volumeoffering.diskSize')}}{{$t('error.noEmpty')}}
        </div>
        <div class="error error-text" v-if="!emptydiskSize && invaliddiskSize">
          {{$t('error.invalid')}}{{$t('volumeoffering.diskSize')}}
        </div>
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
                            :value="volumeReadBandwidth" class="editor" style="margin-right: 70px;width: 100%;position: relative"
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
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate &&  confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'volumeoffering'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import DetailSizeEditor from 'src/component/CreateSelectSize';
  import Root from 'src/windows/Root';

  export default {
    name: "CreateVolumeOfferingPage",
    mixins: [Root],
    components: {CreateTemplate, DetailSizeEditor},
    data() {
      return {
        emptyname: false,
        description: '',
        name: '',
        emptydiskSize: false,
        invaliddiskSize: false,
        type: 'qosModeTotal',
        volumeTotalBandwidth: '',
        invalidvolumeTotalBandwidth: false,
        volumeReadBandwidth: null,
        invalidvolumeReadBandwidth: false,
        volumeWriteBandwidth: '',
        invalidvolumeWriteBandwidth: false,
        diskSize: '',
        isInvalid: false,
        canCreate: true
      }
    },
    methods: {
      setMemorySize(value){
        let self = this;
        if(String(value)){
          self.diskSize = value;
        }
        if(typeof(value) == 'NaN'){
          self.validate('diskSize');
        }
        self.validate('diskSize');
      },
      setVolumeWriteBandwidth(value){
        let self = this;
        if(String(value))
          self.volumeWriteBandwidth = value;
        self.validate('volumeWriteBandwidth');
      },
      setVolumeReadBandwidth(value){
        let self = this;
        if(String(value))
          self.volumeReadBandwidth = value;
        self.validate('volumeReadBandwidth');
      },
      setVolumeTotalBandwidth(value){
        let self = this;
        if(String(value))
          self.volumeTotalBandwidth = value;
        self.validate('volumeTotalBandwidth');
      },
      validate (name) {
        const self = this
        self[`empty${name}`] = false
        let input = name === 'name' ? String(self.$data[name]).trim() : String(self.$data[name])
        if (input === undefined || input === '' || input === null || input === 'NaN') {
          self.$data[`empty${name}`] = true
          self.$data[`invalid${name}`] = false
          return
        }
        self.$data[`invalid${name}`] = false;
        let prop = ['volumeTotalBandwidth', 'volumeReadBandwidth', 'volumeWriteBandwidth', 'diskSize'];
        prop.forEach((item) => {
          if(self.$data[item]<=0){
            self.$data[`invalid${item}`] = true;
          }
        })
      },
      validateAll(){
        let self = this;
        let prop = ['name', 'diskSize'];
        prop.forEach((item) => {
          return self.validate(item);
        })
        let isInvalid = prop.some((item) => this[`empty${item}`] === true) || prop.some(item => this[`invalid${item}`] === true)
          self.isInvalid = isInvalid;
      },
      createParam(){
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
          diskSize: this.diskSize,
          bandWidths: bandWidths
        }
      },
      confirm(){
        let self = this;
        self.validateAll();
        if(self.isInvalid) return;
        self.canCreate = false;
        self.dispatchActionWithEvent('volumeoffering/create', self.createParam())
          .then(() => {
            self.$router.push({name: 'volumeoffering'});
          })
          .catch(() => {
            self.canCreate = true;
          });
      }
    }
  }
</script>

<style scoped>

</style>
