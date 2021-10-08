<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{ $t(message.title) }}</div>
    <div style="margin: 50px 100px 0 100px;">
      {{ $t(message.description, {length: message.uuidList.length}) }}
    </div>
    <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
      <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in message.uuidList">
        <div class="confirm-dialog-item-name">
          {{ message.getName(uuid) }}
        </div>
      </div>
    </div>
    <div class="warning" v-if="message.warning">
      {{ $t(message.warning) }}
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</div>
      <div class="btn-cancel" @clikc="close">{{$t('common.cancel')}}</div>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "DetachVolumeConfirmDlg",
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
    data(){
      return {
        visiabled: false
      }
    },
    mounted(){
      let self= this;
      self.visiabled = this.model;
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close', {uuidList: self.message.uuidList, uuid: self.message.uuid});
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
  .warning{
    margin: 0px 100px;
  }
</style>
