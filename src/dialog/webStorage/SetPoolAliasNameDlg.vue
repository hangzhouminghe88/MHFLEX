<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('primaryStorage.updateAliasName')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding: 30px 200px 50px;">
        <div class="operation-row">
          <div class="title">{{$t('primaryStorage.aliasName') + $t('common.colon')}}</div>
          <input type="text" v-model="aliasName" :class="{'is-error': emptyaliasName}" @blur="validate('aliasName')"/>
          <div class="error error-text" v-if="emptyaliasName">{{$t('error.emptyInput') + $t('primaryStorage.aliasName')}}</div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    name: "SetPoolAliasNameDlg",
    mixins: [WindowBase],
    data(){
      return {
        emptyaliasName: false,
        aliasName: ''
      }
    },

    created(){
      let self = this;
      self.aliasName = self.dialogData.param.aliasName ? self.dialogData.param.aliasName : '';
    },

    methods: {
      validate(name){
        let self = this,
          input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if(!input) {
          self[`empty${name}`] = true;
          return;
        }
      },

      confirm(){
        let self = this;
        self.validate('aliasName');
        if(self.emptyaliasName) return;
        self.dialogData.param.ok(self.aliasName);
        self.close();
      },

      close(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
