<template>
  <dialog-template style="font-size: 16px;">
    <div slot="title" class="modal-plain-header">
      <span id="cluster-stopCluster">{{ $t("cluster.stopCluster") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </div>
    <div slot="body">
      <div style="margin: 50px 100px 0 100px;">
        {{ $t("cluster.stopClusterConfirm", {length:dialogData.param.uuidList.length}) }}
      </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <div class="icon"></div>
          <div class="confirm-dialog-item-name">
            {{dbData.cluster[uuid].name}}
          </div>
        </div>
      </div>
      <div id="cluster-info-text3" class="confirm-dialog-warning">
        {{ $t("cluster.info.text3") }}
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>


<script>
import ClusterList from 'src/om/cluster/List'
import WindowBase from 'src/windows/Window'
import DialogBase from 'src/dialog/base/Dialog'
import DialogTemplate from 'src/dialog/DialogTemplate';

export default {
  name: 'DisableClusterConfirmDlg',
  mixins: [WindowBase, DialogBase, ClusterList],
  components: {DialogTemplate},
  data () {
    return {
    }
  },
  methods: {
    cancel: function () {
      this.closeDialog(this.windowId)
    },
    ok: function () {
      this.dialogData.param.ok(this.windowData.selectedItem)
      this.closeDialog(this.windowId)
    }
  }
}
</script>

<style scoped>
.icon {
  display: inline-block;
  background-image: url('~assets/cluster_popupico.svg');
  height: 36px;
  width: 36px;
  margin-right: 10px;
}



.checkbox {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 4px;
}

.checked {
  background-image: url('~assets/checkbox_selected.svg');
}

.unchecked {
  background-image: url('~assets/checkbox_normal.svg');
}


</style>


// WEBPACK FOOTER //
// DisableClusterConfirm.vue?4731b4b2
