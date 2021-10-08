<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t("common.addDns")}}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>

    <div slot="body">
      <div style="padding: 50px 200px">
        <div class="operation-row">
          <div class="title">DNS:</div>
          <input type="text" v-model="dns" :class="{'is-error': invaliddns || emptydns}" @blur="validateDns('dns')"/>
          <div class="error error-text" v-if="emptydns">{{$t('error.emptyInput') + 'DNS'}}</div>
          <div class="error error-text" v-if="!emptydns && invaliddns">{{$t('error.invalid') + 'DNS'}}</div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.confirm')}}</span>
      <span class="btn-cancel"  @click="close">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "AddDNSDlg",
    mixins: [WindowBase],
    data(){
      return {
        dns: '',
        emptydns: false,
        invaliddns: false
      }
    },
    methods: {
      ...Validator,
      close() {
        this.closeDialog(this.windowId)
      },
      validateDns () {
        let input = String(this['dns']).trim();
        this[`emptydns`] = false
        if (!input) {
          this.emptydns = true
        }
        this[`invaliddns`] = false;
        if (!this.isIP(input)) {
          this.invaliddns = true
        }
      },
      ok () {
        this.validateDns()
        if (this.emptydns || this.invaliddns) {
          return
        }
        this.dialogData.param.ok(this.dns)
        this.closeDialog(this.windowId)
      }
    }
  }
</script>

<style scoped>

</style>
