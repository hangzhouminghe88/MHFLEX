<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{ $t("identity.VM.HA-LEVEL") }}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>

    <div slot="body" class="dialog-body-container">
      <div class="operation-row" style="width: 100%; text-align: center">
        <div class="title" style="text-align: left; padding: 0px 223px;">{{$t('vm.haLevel') + $t('common.colon')}}</div>
        <el-select v-model="haLevel" style="width: 300px;">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';

  export default {
    name: "SetHaLevelDlg",
    mixins: [WindowBase],
    data(){
      return {
        options: [
          {value: 'None', label: 'None'},
          {value: 'NeverStop', label: 'NeverStop'}
        ],
        haLevel: ''
      }
    },
    created(){
      let self = this;
      self.haLevel = self.dialogData.param.haLevel
    },
    methods: {
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        self.dialogData.param.ok(self.haLevel)
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
