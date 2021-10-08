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
          <span>
             <el-radio v-model="type" label="repeat">重复执行</el-radio>
             <el-radio v-model="type" label="count">选择次数</el-radio>
          </span>
        </div>
        <div class="operation-row" v-if="type==='count'">
          <span class="title required">次数</span>
          <span style="display: inline-block">
            <input type="text" v-model="repeatCount" :class="{'is-error': emptyrepeatCount}" @click="validate('repeatCount')"/>
            <div class="error error-text" v-if="emptyrepeatCount">{{$t('')}}{{$t('error.invalid')}}</div>
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
  export default {
    name: "ChangeTimerConfDlg",
    mixins: [WindowBase],
    data(){
      return {
        type: 'repeat',
        emptyrepeatCount: false,
        repeatCount: '2',
      }
    },
    created(){
      let self = this;
      self.dialogData.param.isRepeat ? self.type = 'repeat' : self.type = 'count';
      self.dialogData.param.repeatCount ? self.repeatCount =  self.dialogData.param.repeatCount : '2';
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      validate(name){
        let self = this;
        self[`empty${name}`] = false;
        let input = String(self[name]).trim();
        if(!input || !/\d+/.test(input)){
          self[`empty${name}`] = true;
          return
        }
      },
      confirm(){
        let self = this;
        self.validate('repeatCount');
        if(self.emptyrepeatCount && self.type === 'count') return;
        if(self.type == 'repeat') self.repeatCount = '0';
        let msg = {
            repeatCount: parseInt(self.repeatCount)
        }
        self.dialogData.param.ok(msg);
        self.closeDialog(self.windowId);
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
