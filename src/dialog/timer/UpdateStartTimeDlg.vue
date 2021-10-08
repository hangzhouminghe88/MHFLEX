<template>
  <dialog-template>
    <div slot="title" class="model-plain-header">
      <span class="title">{{$t('common.changeResourceOwner')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body">
      <div style="margin: 50px 135px;">
        <div class="operation-row">
          <span class="title required">执行策略</span>
          <span>{{systemTimeStr}}</span>
        </div>
        <div class="operation-row">
          <span class="title required">次数</span>
          <span>
            <el-date-picker v-model="startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
          </span>
        </div>
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import Validator from 'src/utils/validator';

  export default {
    mixins: [WindowBase],
    name: "updateStartTimeDlg",
    data () {
      return {
        uuid: '',
        startTime: '',
        start_at: new Date().getTime() - 86400000 + 6000,
        systemTime: 0,
        isRepeat: false,
        intervalHandler: null
      }
    },
    created(){
      let param = this.dialogData.param
      this.uuid = param.uuid
      this.isRepeat = param.isRepeat
      this.startTime = new Date(param.startTime)
      rpc.put('management-nodes/actions', {
        'getCurrentTime': {}
      })
        .then((resp) => {
          this.systemTime = new Date(resp.currentTime.MillionSeconds).getTime()
          this.intervalHandler = setInterval(() => {
            this.systemTime += 1000
          }, 1000)
        })
    },
    destroyed(){
      let self = this;
      if(self.intervalHandler)
        clearInterval(self.intervalHandler);
      self.intervalHandler = null;
    },
    methods: {
      ...Validator,
      createParam: function () {
        let param = {
          uuid: this.uuid,
          startTime: Date.parse(this.startTime) / 1000
        }
        return param
      },
      validateAll: function () {
        if (this.startTime === '' || this.startTime === null) {
          return false
        }
        return true
      },
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      confirm: function () {
        if (!this.validateAll()) {
          return
        }
        this.dialogData.param.ok(this.createParam())
        this.closeDialog(this.windowId)
      }
    },
    computed: {
      systemTimeStr () {
        if (this.systemTime === 0) return ''
        return Utils.formatDatetime(new Date(this.systemTime))
      }
    }
  }
</script>

<style scoped>
  .title{
    display: inline-block;
    width: 150px;
  }
  .operation-row{
    width: 100%;
  }
</style>
