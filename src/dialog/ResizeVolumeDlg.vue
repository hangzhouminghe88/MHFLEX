<template>
    <el-dialog :visible.async="visiabled" @close="close()">
      <div slot="title">{{$t('volume.resizeVolume')}}</div>
      <div class="dialog-content">
        <div class="operation-row">
          <div class="title required">
            {{$t('common.newSize')}}
          </div>
          <span style="display:inline-block; width: calc(100% - 70px)">
            <input type="number" v-model="size" @blur="validate()"/>
          </span>
          <drop-down class="btn-primary more dropdown" style="padding: 4px 10px;height: 30px;line-height: 30px;margin-left: -6px;">
          <span slot="title">
            <span class="text">{{unit}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content" style="min-width: 40px;">
              <a v-for="(item, index) in units" :key="index"
                 @click="(e) => {unit = e.target.text}">{{item}}</a>
            </div>
          </span>
          </drop-down>
          <div  v-if="isInvalid" class="error error-text">
            {{$t('vm.resizeRootVolumeInfo')}}
          </div>
          <div style="margin-top: 10px;">{{$t('vm.resizeRootVolumeInfo')}}{{(volume ? volume.size : 0) | bytesToSize}}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="confirmDlg()">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
      </div>
    </el-dialog>
</template>

<script>
  import Utils from 'src/utils/utils';
  export default {
    name: "ResizeVolumeDlg",
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        visiabled: false,
        size: '',
        unit:"GB",
        isInvalid: false,
        volume:"",
        units: [
          'MB',
          'GB',
          'TB'
        ],
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      if(self.message){
        self.volume = self.message.volume;
      }
    },
    methods: {
      ...Utils,
      confirmDlg() {
        let self = this;
        self.visiabled = false;
        self.$emit('close', {uuid: this.volume.uuid, size: self.parseSize(self.size + self.unit)});
      },
      close() {
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      validate(){
        let self = this;
        if (!self.message.volume) return false
        let size = this.parseSize(this.size + this.unit)
        if (Number(size) < (Number(this.volume.size) + 512)) this.isInvalid = true;
        else this.isInvalid = false;
      },
    },
    watch: {
      model(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
