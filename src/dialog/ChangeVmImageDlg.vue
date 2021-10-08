<template>
    <el-dialog :visible.async="visiabled" @close="close">
      <div slot="title"></div>
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
      </div>
    </el-dialog>
</template>

<script>
  export default {
    name: "ChangeVmImageDlg",
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
    data(){
      return {
        visiabled: false
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
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

</style>
