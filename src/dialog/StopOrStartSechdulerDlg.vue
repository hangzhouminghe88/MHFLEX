<template>
    <el-dialog :visible.async="visiabled" @close="close">
      <div  slot="title" v-if="message.type==='delete'">{{$t('common.deleteSchduler')}}</div>
      <div slot="title" v-if="message.type==='disabled'">{{$t('scheduler.disable')}}</div>
        <div class="dialog-confirm-title" v-if="message.type==='delete'">{{$t('common.deleteScheduler', { length: message.uuidList.length })}}</div>
        <div class="dialog-confirm-title" v-if="message.type==='disabled'">{{$t('scheduler.info.disableConfirm', { length: message.uuidList.length })}}</div>
        <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
          <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="(uuid, index) in  message.uuidList" :index="index">
            <div class="icon"></div>
            <div class="confirm-dialog-item-name">
              {{dbData.scheduler[uuid] && dbData.scheduler[uuid].name}}
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
    name: "StopOrStartSechdulerDlg",
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
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
    },
    methods: {
      close() {
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.visiabled = false;
        self.$emit('close', {uuidList: self.message.uuidList, type: self.message.type});
      }
    },
    watch: {
      model(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          return self.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>
  .icon {
    display: inline-block;
    background-image: url('~assets/timed_task_n.svg');
    height: 36px;
    width: 36px;
    margin-right: 10px;
  }

</style>
