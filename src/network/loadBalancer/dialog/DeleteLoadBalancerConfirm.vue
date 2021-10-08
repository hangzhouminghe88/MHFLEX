<template>
  <dialog-template style="font-size: 16px;">
    <div slot="header" class="modal-plain-header">
      <span id="loadbalancer-deleteLoadBalancer">{{$t("loadbalancer.deleteLoadBalancer")}}</span>
      <div class="modal-close" @click="cancel"></div>
    </div>
    <div slot="body">
      <div style="margin: 50px 100px 0 100px;">
        {{ $t("loadbalancer.info.deleteConfirm", { length: dialogData.param.uuidList.length }) }}
      </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <div class="icon"></div>
          <div class="confirm-dialog-item-name">
            {{dbData.loadBalancer[uuid].name}}
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>


<script>
import Vue from 'vue'
import LoadBalancerList from 'src/network/loadBalancer/List';
import WindowBase from 'src/windows/Window'
import DialogBase from 'src/dialog/base/Dialog'

export default {
  name: 'DeleteLoadBalancerConfirm',
  mixins: [WindowBase, DialogBase,LoadBalancerList],
  created: function () {
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
      this.dialogData.param.ok(this.windowData.selectedItem)
      this.closeDialog(this.windowId)
    }
  }
}
</script>

<style scoped>
.icon {
  display: inline-block;
  background-image: url('~assets/load_banlance_popupico.svg');
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

.warning {
  font-size: 14px;
  margin: 8px 100px 70px 100px;
  color: #EC5960;
  white-space: pre
}

</style>



// WEBPACK FOOTER //
// DeleteLoadBalancerConfirm.vue?cf0dbfa6