<template>
  <dialog-template style="font-size: 16px;">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t(`vm.${$data.type}`)}} {{ $t("common.vm") }} {{$data.text ? $t(`vm.${$data.text}`) : void 0}}</span>
      <div class="dialog-close el-icon-close" @click="cancel"></div>
    </div>
    <div slot="body">
      <div style="margin: 50px 100px 0 100px;" v-if="$data.hideLength.indexOf(dialogData.param.confirmDlgType) > -1">
        {{ $t("vm.singleVmActionTitle", { type: $t(`vm.${$data.type}`), text: $data.text ? $t(`vm.${$data.text}`) : '' }) }}
      </div>
      <div style="margin: 50px 100px 0 100px;" v-else>
        {{ $t("vm.vmActionTitle", { type: $t(`vm.${$data.type}`), length: dialogData.param.uuidList.length,text: $data.text ? $t(`vm.${$data.text}`) : '' }) }}
      </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <div class="icon"></div>
          <div class="confirm-dialog-item-name">
            {{dbData.vm[uuid].name}}
          </div>
        </div>
      </div>
      <div style="margin: 40px 100px 20px 100px;" v-if="type === 'stop'">
        <el-checkbox v-model="windowData.stopHa" @click="stopHa()">{{$t("vm.stopHa")}}</el-checkbox>
      </div>
      <div style="margin: 40px 100px 20px 100px;" v-if="type === 'powerOff'">
        <el-checkbox v-model="windowData.stopHaByPowerOff" @click="stopHaByPowerOff()">{{$t("vm.stopHaByPowerOff")}}</el-checkbox>
        <!--<div class="checkbox" :class="{ 'checked': windowData.stopHaByPowerOff, 'unchecked': !windowData.stopHaByPowerOff }" @click="stopHaByPowerOff()"></div>-->
        <!--<span id="vm-stopHa" style="position: relative; top: -6px; cursor: pointer" @click="stopHaByPowerOff()">{{$t("vm.stopHaByPowerOff")}}</span>-->
      </div>
      <div style="margin: 40px 100px 20px 100px;" v-if="type === 'recover'">
        <el-checkbox v-model="windowData.startVm" @click="startVm()">{{$t("vm.startVm")}}</el-checkbox>
        <!--<div class="checkbox" :class="{ 'checked': windowData.startVm, 'unchecked': !windowData.startVm }" @click="startVm()"></div>-->
        <!--<span id="vm-start" style="position: relative; top: -6px; cursor: pointer" @click="startVm()">{{$t("vm.startVm")}}</span>-->
      </div>
      <div style="margin: 40px 100px 20px 100px;" v-if="type === 'delete'">
        <el-checkbox v-model="windowData.deleteVolume" @click="deleteVolume()">{{$t("vm.deleteVolume")}}</el-checkbox>
        <!--<div class="checkbox" :class="{ 'checked': windowData.startVm, 'unchecked': !windowData.startVm }" @click="startVm()"></div>-->
        <!--<span id="vm-start" style="position: relative; top: -6px; cursor: pointer" @click="startVm()">{{$t("vm.startVm")}}</span>-->
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
      <div id="vm-info-reimageConfirm" class="confirm-dialog-warning" v-if="type === 'delete'">
        {{ $t("vm.deleteVolumeWarning") }}
      </div>
    </div>
    <div slot="footer" class="modal-footer">
       <span class="btn-confirm" @click="ok">
        {{ $t('common.confirm') }}
      </span>
      <span class="btn-cancel" @click="cancel">
        {{ $t('common.cancel') }}
      </span>
    </div>
  </dialog-template>
</template>


<script>
  import WindowBase from 'src/windows/Window'

  export default {
    name: 'NormalVmInstanceConfirmDlg',
    mixins: [WindowBase],
    created: function () {
      let type = ''
      switch (this.dialogData.param.confirmDlgType) {
        case 'Delete':
          type = 'delete'
          break
        case 'Stop':
          type = 'stop'
          break
        case 'Pause':
          type = 'pause'
          break
        case 'Resume':
          type = 'resume'
          break
        case 'Recover':
          type = 'recover'
          break
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
          type = 'delete'
          this.$data.text = 'SshKey'
          break
        case 'DeleteConsolePassword':
          type = 'cancel'
          this.$data.text = 'consolePassword'
          break
        default:
          type = '操作'
      }
      this.$data.type = type
    },
    data () {
      return {
        type: '',
        text: '',
        hideLength: ['DeleteConsolePassword', 'Reimage', 'DeleteSshKey']
      }
    },
    methods: {
      stopHa: function () {
        this.updateWindow({
          stopHa: !this.windowData.stopHa
        })
      },
      stopHaByPowerOff: function () {
        this.updateWindow({
          stopHaByPowerOff: !this.windowData.stopHaByPowerOff
        })
      },
      startVm: function () {
        this.updateWindow({
          startVm: !this.windowData.startVm
        })
      },
      deleteVolume: function(){
        this.updateWindow({
          deleteVolume: !this.windowData.deleteVolume
        })
      },
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      ok: function () {
        let table = {
          stop: 'stopHa',
          recover: 'startVm',
          powerOff: 'stopHaByPowerOff',
          delete: 'deleteVolume'
        }
        let type = this.$data.type
        if (table.hasOwnProperty(type) && this.windowData[table[type]]) {
          this.dialogData.param.ok(this.windowData[table[type]])
        } else {
          this.dialogData.param.ok()
        }
        this.closeDialog(this.windowId)
      }
    }
  }
</script>

<style scoped>
  .icon {
    display: inline-block;
    background-image: url('~assets/vm_plain.svg');
    height: 36px;
    width: 36px;
    margin-right: 10px;
  }

</style>

