<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t(`vm.${$data.type}`)}}{{$t('common.vm')}}{{$data.text ? $t(`vm.${$data.text}`) : void 0}}</div>
    <div class="item" v-if="$data.hideLength.indexOf(message.confirmDlgType) > -1">
      {{$t('vm.singleVmActionTitle', {type: $t(`vm.${$data.type}`), text: $data.text ? $t(`vm.${$data.text}`): ''})}}
    </div>
    <div class="item" v-else>
      {{ $t("vm.vmActionTitle", { type: $t(`vm.${$data.type}`), length:message.uuidList.length,text: $data.text ? $t(`vm.${$data.text}`) : '' }) }}
    </div>
    <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
      <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in message.uuidList">
        <div class="icon"></div>
        <div class="confirm-dialog-item-name">
          {{message.vmModel ? message.vmModel.name : dbData.vm && dbData.vm[uuid].name}}
        </div>
      </div>
    </div>
    <div style="margin: 40px 100px 20px 100px;" v-if="type === 'stop'">
      <el-checkbox v-model="windowData.stopHa" @click.native="stopHa()" style="color: #e41f2b">{{$t("vm.stopHa")}}</el-checkbox>
    </div>
    <div style="margin: 40px 100px 20px 100px;" v-if="type === 'powerOff'">
      <el-checkbox v-model="windowData.stopHaByPowerOff" @click.native="stopHaByPowerOff()" style="color: #e41f2b">{{$t("vm.stopHaByPowerOff")}}</el-checkbox>
    </div>
    <div style="margin: 40px 100px 20px 100px;" v-if="type === 'recover'">
      <el-checkbox v-model="windowData.startVm" @click.native="startVm()" style="color: #e41f2b">{{$t("vm.startVm")}}</el-checkbox>
    </div>
    <div style="margin: 40px 100px 20px 100px;" v-if="type=== 'cancel'">
      <el-checkbox v-model="isReboot">{{$t("common.rebootInstance")}}</el-checkbox>
    </div>
    <div style="margin: 40px 100px 20px" v-if="type==='delete'">
      <el-checkbox v-model="isDeleteVolume">{{$t('vm.deleteVolume')}}</el-checkbox>
    </div>
    <div id="account-accountWarning" class="confirm-dialog-warning" v-if="type === 'cancel'">
      {{$t("account.accountWarning")}}
    </div>
    <div id="vm-powerOffVmWarning" class="confirm-dialog-warning" v-if="type === 'powerOff'">
      {{ $t("vm.powerOffVmWarning") }}
    </div>
    <div id="vm-info-reimageConfirm" class="confirm-dialog-warning" v-if="type === 'reimage'">
      {{ $t("vm.info.reimageConfirm") }}
    </div>
    <div class="confirm-dialog-warning" v-if="type === 'delete'">
      {{$t('vm.deleteVolumeWarning')}}
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
    mixins: [WindowBase],
    name: "NormalVmInstanceConfirmDlg",
    props: {
      model:{
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: {}
      }
    },
    data(){
       return{
         visiabled: true,
         type: '',
         text:'',
         hideLength:['DeleteConsolePassword', 'Reimage', 'DeleteSshKey'],
         isReboot: false,
         isDeleteVolume: false
      }
    },
    mounted(){
      let self = this;
      let type = '';
      switch(self.message.confirmDlgType){
        case 'Delete':
          type = 'delete';
          break;
        case 'Stop':
          type = 'stop';
          break;
        case 'Pause':
          type = 'pause';
          break;
        case 'Resume':
          type = 'resume';
          break;
        case 'Recover':
          type = 'recover';
          break;
        case 'PowerOff':
          type = 'powerOff'
          this.$data.text = 'power'
          break
        case 'Reboot':
          type = 'reboot'
          break
        case 'Reimage':
          type = 'reimage'
          break
        case 'DeleteSshKey':
          type = 'deleteSshKey'
          this.$data.text = 'SshKey'
          break
        case 'DeleteConsolePassword':
          type = 'cancel'
          this.$data.text = 'consolePassword'
          break
        case 'LeaveAffinity':
          type = 'leaveAffinity';
          break;
        case 'Expunge':
          type = 'expunge';
          break;
        default:
          type = '操作'
      }
      this.$data.type = type
    },
    methods: {
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.visiabled = false;
        let table = {
          stop: 'stopHa',
          recover: 'startVm',
          powerOff: 'stopHaByPowerOff'
        }
        let type = this.$data.type
        let uuidList = [];
        if(this.message.uuidList) uuidList =  this.message.uuidList;
        if(this.message.confirmDlgType === 'DeleteConsolePassword'){
          self.$emit('close', {uuidList, type: self.$data.type, isReboot: self.isReboot});
        }else if(this.message.confirmDlgType === 'Delete') {
          self.$emit('close', {uuidList, type: self.$data.type, isDeleteVolume: self.isDeleteVolume});
        }else if(this.message.confirmDlgType === 'Recover'){
          self.$emit('close', {uuidList, type: self.$data.type, startVm: self.windowData.startVm});
        }else if(this.message.confirmDlgType === 'Stop') {
          self.$emit('close', {uuidList, type: self.$data.type, stopHa: self.windowData.stopHa});
        }else if(this.message.confirmDlgType === 'PowerOff'){
          self.$emit('close', {uuidList, type: self.$data.type, stopHa: self.windowData.stopHaByPowerOff});
        }else{
          self.$emit('close', {uuidList, type: self.$data.type});
        }
      },
      stopHa(){
        this.updateWindow({
          stopHa: this.windowData.stopHa
        })
      },
      stopHaByPowerOff(){
        let self = this;
        self.updateWindow({
          stopHaByPowerOff: this.windowData.stopHaByPowerOff
        })
      },
      startVm(){
        let self = this;
        self.updateWindow({
          startVm: this.windowData.startVm
        })
      },
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped lang="less">
 .item{
   margin: 50px 100px 0 100px;
 }
 .icon {
   display: inline-block;
   background-image: url('~assets/vm_plain.svg');
   height: 36px;
   width: 36px;
   margin-right: 10px;
 }
</style>
