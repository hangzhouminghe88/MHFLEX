<template>
    <el-dialog :visible.async="visiabled" @close="close">
      <div slot="title">{{$t('common.createSnapshot')}}</div>
      <div class="dialog-content">
        <div class="form-item">
          <label class="title required">{{$t('common.name')}}</label>
          <input type="text" placeholder="请输入名称" v-model="snapName"
                 @input="(e) => {snapName = e.target.value; validate()}"
                 @blur="(e) => {snapName = e.target.value; validate()}"/>
          <div class="error error-text" v-if="validatename">{{`${$t('common.snapshotName')}${$t('error.noEmpty')}`}}</div>
        </div>
        <div class="form-item">
          <label class="title">{{$t('common.description')}}</label>
          <textarea rows="3" v-model="snapDescription"/>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
      </div>
    </el-dialog>
</template>

<script>
  export default {
    name: "CreateSnapDlg",
    props: {
      model:{
        type: Boolean,
        default: false,
      },
      message: {
        type: Object,
        defalut: {}
      }
    },
    data(){
      return {
        visiabled: false,
        snapDescription: '',
        snapName: '',
        validatename: false,
        vmInstanceUuid: ''
      }
    },
    mounted (){
      let self = this;
      self.visiabled = self.model;
      self.vmInstanceUuid = self.message.vmInstanceUuid;
    },
    methods: {
      confirmDlg(){
        let self = this;
        let valid = self.validate();
        if(valid){
          self.$emit('close', {
            name: this.snapName,
            description: this.snapDescription,
            vmInstanceUuid: self.vmInstanceUuid
          });
        }
      },
      close(){
        let self = this;
        self.$emit('close');
      },
      validate(){
        let input;
        if(this.snapName.trim() === ''){
          this.validatename = true;
          return;
        }
        this.validatename = false;
        return true;
      }
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
