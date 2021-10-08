<template>
  <dialog-template style="font-size: 16px;">
    <div slot="header" class="modal-plain-header">
      <span id="common-stopZone">{{ $t("common.stopZone") }}</span>
      <div class="modal-close" @click="cancel"></div>
    </div>
    <div slot="body">
      <div style="margin: 50px 100px 0 100px;">
        {{ $t("zone.disable", { length: dialogData.param.uuidList.length }) }}
      </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <div class="icon"></div>
          <div class="confirm-dialog-item-name">
            {{dbData.zone[uuid].name}}
          </div>
        </div>
      </div>
      <div id="zone-disableWaring" class="confirm-dialog-warning">
        {{ $t("zone.disableWaring") }}
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
    <!--<div slot="footer" class="modal-plain-footer">-->
      <!--&lt;!&ndash;<div id="common-cancel" class="modal-button-right cancel" @click="cancel">&ndash;&gt;-->
        <!--&lt;!&ndash;{{$t("common.cancel")}}&ndash;&gt;-->
      <!--&lt;!&ndash;</div>&ndash;&gt;-->
      <!--&lt;!&ndash;<div id="common-ok" class="modal-button-right primary" @click="ok">&ndash;&gt;-->
        <!--&lt;!&ndash;{{$t("common.ok")}}&ndash;&gt;-->
      <!--&lt;!&ndash;</div>&ndash;&gt;-->

    <!--</div>-->
  </dialog-template>
</template>


<script>
import Vue from 'vue'
import ZoneList from 'src/om/zone/List'
import DialogTemplate from 'src/dialog/DialogTemplate'
Vue.component('dialog-template', DialogTemplate)
import WindowBase from 'src/windows/Window';
import DialogBase from '../base/Dialog'

export default {
  name: 'DisableZoneConfirmDlg',
  mixins: [WindowBase, DialogBase, ZoneList],
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
  background-image: url('~assets/zone_popupico.svg');
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

