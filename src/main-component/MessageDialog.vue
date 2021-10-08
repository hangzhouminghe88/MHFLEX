<template>
  <el-dialog :visible.async="visiable" @close="close">
    <span slot="title">{{$t("message.content")}}</span>
    <message-detail :param="{ message: message }"></message-detail>
    <div slot="footer" class="dialog-footer">
      <span class="btn-cancel" @click="close">取消</span>
    </div>
  </el-dialog>
</template>

<script>
   import MessageDetail from './MessageDetail';
   export default {
    name: "MessageDialog",
    props: {
      model:{
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
      }
    },
     components: {
       MessageDetail
     },
     methods: {
       close() {
         let self =this;
         self.visiable = false;
         self.$emit('setModelVal', false);
       }
     },
     data() {
      return {
        visiable: this.model
      }
     },
    watch: {
      model: function (newVal, oldVal) {
        if(newVal !== oldVal){
          this.visiable = newVal;
        }
      },
      message(newVal, oldVal){
        if(newVal !== oldVal){
          return newVal;
        }
      }
    }
  }
</script>

<style scoped>
</style>
