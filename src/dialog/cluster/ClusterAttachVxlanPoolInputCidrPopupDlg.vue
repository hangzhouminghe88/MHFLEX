<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">VTEP CIDR</span>
      <span class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body" class="dialog-body-container">
      <div class="operation-row" style="padding: 100px 0px; margin: 0 auto;">
        <div class="title">{{ $t('common.value') }}</div>
        <input  v-model="cidr"  placeholder="192.168.1.1/24" :class="{'is-error': emptycidr || invalidcidr}" @blur="validate()"/>
        <div class="error error-text" v-if="emptycidr && !invalidcidr">VTEP CIDR{{$t('error.noEmpty')}}</div>
        <div class="error error-text" v-if="!emptycidr && invalidcidr">{{$t('error.invalid')}}VTEP CIDR</div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import validator from 'src/utils/validator';
  export default {
    name: "ClusterAttachVxlanPoolInputCidrPopupDlg",
    mixins: [WindowBase],
    data(){
      return{
        emptycidr: false,
        invalidcidr: false,
        cidr: ''
      }
    },
    methods: {
      ...validator,
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      validate(){
        let self = this;
        self.emptycidr  = false;
        self.invalidcidr = false;
        if(!self.cidr){
          self.emptycidr = true;
          return;
        }
        if(!self.isCidr(self.cidr)){
          self.invalidcidr = true;
          return;
        }
      },
      confirm(){
        let self = this;
        self.validate();
        if(self.emptycidr || self.invalidcidr) return;
        this.dialogData.param.ok(this.cidr);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
