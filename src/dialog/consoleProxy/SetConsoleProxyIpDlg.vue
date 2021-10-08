<template>
  <dialog-template>
    <div slot="title">
      <span>{{$t('consoleProxy.setOverriddenIp')}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body">
      <div style="margin: 100px 200px;position: relative">
        <div class="operation-row" style="width: 100%">
          <div class="title">{{$t('consoleProxy.consoleProxyOverriddenIp')}}</div>
          <help-trigger name="consoleProxyOverriddenIp"/>
          <input v-model="overrideIp" :class="{'is-error': emptyoverrideIp || invalidoverrideIp}" @blur="validate('overrideIp')"/>
          <div class="error error-text" v-if="emptyoverrideIp && !invalidoverrideIp">{{$t('error.emptyInput')}}{{$t('consoleProxy.consoleProxyOverriddenIp')}}</div>
          <div class="error error-text" v-if="!emptyoverrideIp && invalidoverrideIp">{{$t('error.invalid')}}{{$t('consoleProxy.consoleProxyOverriddenIp')}}</div>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import validator from 'src/utils/validator';
  export default {
    name: "SetConsoleProxyIpDlg",
    mixins: [WindowBase],
    data(){
      return {
        emptyoverrideIp: false,
        invalidoverrideIp: false,
        overrideIp: ''
      }
    },
    created(){
      let self = this;
      if(self.dialogData.param && self.dialogData.param.originIp) self.overrideIp = self.dialogData.param.originIp;
    },
    methods: {
      ...validator,
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      validate(name){
        let self = this, input;
        self[`empty${name}`] = false;
        input = self[name];
        if(!input){
          self[`empty${name}`] = true;
          return;
        };
        self[`invalid${name}`] = false;
        if (!this.isIP(input) && !this.isDNSDomainName(input)) {
          self[`invalid${name}`] = true;
          return;
        }
      },
      validateAll(){
        let self = this;
        self.validate("overrideIp");
        return self.emptyoverrideIp || self.invalidoverrideIp;
      },
      ok(){
        let self = this;
        let invalid = self.validateAll();
        if(invalid || self.dialogData.param.originIp === self.overrideIp) return;
        self.dialogData.param.ok(self.overrideIp);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
