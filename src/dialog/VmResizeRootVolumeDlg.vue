<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{ $t("vm.resizeRootVolume") }}</div>
    <div class="dialog-content">
      <div class="operation-row">
        <div class="title required">
          {{$t('common.newSize')}}
          <help-trigger name="resizeRootVolume" :style="{ position: 'relative', top: '0', display: 'inline-block',left: '207px' }"></help-trigger>
        </div>
        <span style="display:inline-block; width: calc(100% - 70px)">
          <input type="number" v-model="size" @blur="validate"/>
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
        <div>
          {{ `${$t('vm.resizeRootVolumeInfo')}${bytesToSize(rootVolume ? rootVolume.size : 0)}` }}
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import Utils from 'src/utils/utils';
  export default {
    name: "VmResizeRootVolumeDlg",
    data() {
      return {
        visiabled: false,
        unit: 'GB',
        units: [
          'MB',
          'GB',
          'TB'
        ],
        isInvalid: false,
        rootVolume: {},
        size: 0
      }
    },
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
    mounted() {
      let self = this;
      self.visiabled = self.model;
      if(self.message){
        self.rootVolume = self.message.rootVolume;
      }
    },
    methods: {
      ...Utils,
      validate(){
        let self = this;
          if (!self.message.rootVolume) return false
          let size = this.parseSize(this.size + this.unit)
          if (Number(size) < (Number(this.rootVolume.size) + 512)) this.isInvalid = true;
          else this.isInvalid = false;
      },
      confirmDlg() {
        let self = this;
        if(self.isInvalid) return;
        self.$emit('close', {uuid: this.rootVolume.uuid, size: this.parseSize(this.size + this.unit)});
      },
      close() {
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      }
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
