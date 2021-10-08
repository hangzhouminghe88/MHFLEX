<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{ $t(dialogData.param.title) }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body">
      <div style="margin: 50px 100px 0 100px;" :style="{'marginBottom': dialogData.param.uuidList ? '0px' : '50px'}">
        <div v-if="dialogData.param.description">
          <span class="help-icon"></span>{{dialogData.param.uuidList ? $t(dialogData.param.description, {length: dialogData.param.uuidList.length}) :
          (dialogData.param.name ? $t(dialogData.param.description, {name: dialogData.param.name}) : $t(dialogData.param.description))
          }}
        </div>
      </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;" v-if="dialogData.param.uuidList">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <base-icon :name="dialogData.param.icon" />
          <div class="confirm-dialog-item-name" v-if="dialogData.param.getName">
            {{ dialogData.param.getName(uuid) }}
          </div>
        </div>
      </div>
      <div class="checkbox-container" v-if="!dialogData.param.hideCheckbox">
        <el-checkbox v-model="remote" :disabled="!dialogData.param.RemoteSynce">{{$t('backupData.deleteRemoteConfirm')}}</el-checkbox>
      </div>
      <div class="checkbox-container" v-if="showDeletionWholeOption">
        <el-checkbox v-model="deleteWholeVmBackup">{{$t('backupData.deleteWholeVmBackup')}}</el-checkbox>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
    <span class="btn-confirm"  @click="ok">
      {{ $t("common.ok") }}
    </span>
      <span v-if="dialogData.param.ok" class="btn-cancel" @click="cancel">
      {{ $t("common.cancel") }}
    </span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: "DeleteBackupDataConfirm",

    mixins: [WindowBase],

    data() {
      return {
        remote: false,
        deleteWholeVmBackup: false
      }
    },

    methods: {
      ok() {
        this.dialogData.param.ok(this.remote, this.deleteWholeVmBackup)
        this.closeDialog(this.windowId)
      },

      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      }
    },

    computed: {
      showDeletionWholeOption () {
        let uuidList = this.dialogData.param.uuidList
        return uuidList.some(uuid => this.dbData.backupData[uuid].type === 'Root' && this.dbData.backupData[uuid].groupUuid)
      }
    }
  }
</script>

<style scoped>
  .checkbox-container {
    padding: 0px 100px 50px;
  }
</style>
