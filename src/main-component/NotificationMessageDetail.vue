<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">
      {{$t('zwatchAlarm.messageContent')}}
    </div>
    <message-notification-detail :message="message"></message-notification-detail>
    <div slot="footer" class="dialog-footer">
      <span class="btn-cancel" @click="close">{{$t('common.close')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import MessageNotificationDetail from "./MessageNotificationDetail";
  export default {
    name: "NotificationMessageDetail",
    components: {MessageNotificationDetail},
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
        visiabled: false
      }
    },
    methods: {
      close() {
        this.visiabled = false;
        this.$emit('changShowVal');
      }
    },
    watch: {
      model(newVal, oldVal){
         if(newVal!==oldVal){
           this.visiabled = newVal;
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
