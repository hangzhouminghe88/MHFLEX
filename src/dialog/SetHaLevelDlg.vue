<template>
    <el-dialog :visible.async="visiabled" @close="close">
      <div slot="title">{{$t('identity.VM.HA-LEVEL')}}</div>
      <div class="dialog-content">
        <label>{{ $t("common.haLevel") }}{{$t("common.colon")}}</label>
        <drop-down class="button dropdown" style="padding-left: 12px; padding-right: 8px;">
              <span slot="title">
                <span class="text">{{haLevel}}</span>
              </span>
          <span slot="content">
                <div class="dropdown-content">
                  <a @click="(e) => { haLevel =  e.target.text}" style="padding-top: 12px;">None</a>
                  <a @click="(e) => {haLevel = e.target.text }">NeverStop</a>
                </div>
              </span>
        </drop-down>
      </div>
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
      </div>
    </el-dialog>
</template>

<script>
  export default {
    name: "SetHaLevelDlg",
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: {}
      }
    },
    data(){
      return {
        visiabled: false,
        haLevel: 'None',
        selectUuidList: ''
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      self.haLevel = self.message.haLevel;
      self.selectUuidList = self.message.selectUuidList;
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close', {selectUuidList: self.selectUuidList, haLevel: self.haLevel});
      }
    },
    watch:{
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped lang="less">
 .dropdown{
   width: 50%;
   border: 1px solid #dae0e6;
   display: inline-block;
   height: 40px;
   border-radius: 2px;
   .dropdown-content{
     width: 100%;
   }
 }
</style>
