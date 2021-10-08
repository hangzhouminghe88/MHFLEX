<template>
  <dialog-template>
    <div slot="title">
      <span>{{$t('usbDevice.updateName')}}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </div>
    <div slot="body">
      <div class="dialog-content">
        <div class="operation-row">
          <div class="title">{{$t('usbDevice.deviceName')}}</div>
          <input type="text" v-model="usbName" @blur="validate('usbName')" :class="{'is-error': emptyusbName}"/>
          <div class="error error-text" v-if="emptyusbName">{{$t('usbDevice.deviceName')}}{{$t('error.noEmpty')}}</div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: "UpdateUsbDeviceNameDlg",
    mixins: [WindowBase],
    data(){
      return {
        usbName: '',
        emptyusbName: false,
      }
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      validate(name){
        let self = this;
        let input = name === 'usbName' ? String(self[name]).trim() : '';
        if(!input){
          self[`empty${name}`] = true;
          return ;
        }else{
          self[`empty${name}`] = false;
        }
      },
      confirm(){
        let self = this;
        self.validate('usbName');
        if(self.emptyusbName) return;
        self.dialogData.param.ok(self.usbName);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
