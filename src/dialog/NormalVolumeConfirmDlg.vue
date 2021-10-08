<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t(`volume.${$data.type}`)}}</div>
    <div class="dialog-content operation-row" style="width: auto">
      <div class="title" style="margin: 0px 20px;">
        {{ $data.type ? $t(`volume.info.${$data.type}Confirm`, { length: message.uuidList.length }) : '' }}
      </div>
      <div style="margin: 20px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
        <div style="width: 50%;display: inline-block;" v-for="(uuid, index) in message.uuidList" :key="index">
          <div class="icon"></div>
          <div class="confirm-dialog-item-name">{{dbData.volume[uuid].name}}</div>
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
  import WindowBase from 'src/windows/Window';
  export default {
    name: "NormalVolumeConfirmDlg",
    mixins: [WindowBase],
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
        type: ''
      }
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
      self.message.confirmType ? self.$data.type = self.message.confirmType : '';
    },
    methods: {
      confirmDlg() {
        let self = this;
        self.visiabled = false;
        switch (self.message.confirmType) {
          case 'cancelQos':
            self.$emit('close', {uuidList: self.message.uuidList, mode: self.message.mode, type: self.$data.type});
          return;
          case 'delete':
            self.$emit('close', {uuidList: self.message.uuidList, type: self.$data.type});
            break;
          case 'detach':
            self.$emit('close', {uuidList: self.message.uuidList, type: self.$data.type});
            break;
        }
      },
      close() {
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      }
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
  .icon{
    display: inline-block;
    background-image: url('~assets/volume_popupico.svg');
    height: 36px;
    width: 36px;
    margin-right: 10px;
  }
</style>
