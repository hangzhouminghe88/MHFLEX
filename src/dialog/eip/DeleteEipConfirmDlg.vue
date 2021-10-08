<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span>{{ $t(dialogData.param.title) }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body">
      <div style="margin: 50px 100px 0 100px;">
        {{ $t(dialogData.param.description, {length: dialogData.param.uuidList.length}) }}
      </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <base-icon :name="dialogData.param.icon" />
          <div class="confirm-dialog-item-name">
            {{ dialogData.param.getName(uuid) }}
          </div>
        </div>
      </div>
      <div class="warning" v-if="dialogData.param.warning">
        {{ $t(dialogData.param.warning) }}
      </div>
      <div style="margin: 40px 100px;">
        <el-checkbox v-model="windowData.deleteVip">{{$t("vip.deleteVip")}}</el-checkbox>
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
  import Vue from 'vue';
  import WindowBase from 'src/windows/Window'
  import DialogTemplate from "../DialogTemplate";
  export default {
    name: 'DeleteEipConfirmDlg',
    components: {
      DialogTemplate,
    },
    mixins: [WindowBase],
    created: function () {
      this.updateWindow({
        deleteVip: true
      })
    },
    data () {
      return {
      }
    },
    methods: {
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      ok: function () {
        this.dialogData.param.ok(this.windowData.deleteVip)
        this.closeDialog(this.windowId)
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
    color: #EC5960;
  }

</style>



