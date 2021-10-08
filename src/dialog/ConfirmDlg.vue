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
    <div class="warning" v-if="dialogData.param.warning">
      <div class="warning-content">
        {{ $t(dialogData.param.warning) }}
      </div>
    </div>
    <div class="checkbox-container" v-if="dialogData.param.isChecked && dialogData.param.isChecked">
      <el-checkbox v-model="isChecked">{{$t(dialogData.param.checkBoxText)}}</el-checkbox>
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
  import WindowBase from 'src/windows/Window'
  import DialogTemplate from "./DialogTemplate";
  export default {
    name: 'ConfirmDialogTemplate',
    components: {
      DialogTemplate,
    },
    mixins: [WindowBase],
    created: function () {
    },
    data () {
      return {
        isChecked: false
      }
    },
    methods: {
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      ok: function () {
        let self = this;
        if(self.dialogData.param.checkBoxText) self.dialogData.param.ok(self.isChecked);
        else self.dialogData.param.ok()
        self.closeDialog(this.windowId)
      }
    },
  }
</script>

<style scoped>

  .name {
    display: inline-block;
    position: relative;
    top: -12px;
    width: calc(100% - 52px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
  }

  .warning {
    font-size: 14px;
    margin: 8px 100px 70px 100px;
    color: #222;
  }

  .warning-content{
    background-color: #ffe4e4;
    font-size: 12px;
    padding: 15px 30px;
    color: #ff4d37;
    border: 1px solid #ff6755;
  }
  .help-icon{
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    padding-right: 10px;
    background-image: url('~assets/del_icon.svg');
    background-repeat: no-repeat;
  }
  .checkbox-container{
    margin: -30px 100px 30px;;
  }
</style>
