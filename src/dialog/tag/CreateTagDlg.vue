<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("tag.create") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body">
       <div class="dialog-content">
         <div class="operation-row" style="margin: 20px 220px;">
           <div class="title">{{$t('common.name')}}</div>
           <input type="text" v-model="name" @keydown.enter="validate()" @blur="validate()" :class="{'is-error': errorMsg}"/>
           <div class="error-text error" v-if="errorMsg">{{errorMsg}}</div>
           <div class="color-content">
             <div class="title">{{$t('common.color')}}</div>
             <div class="color-list" v-for="(color, index) in colors" :index="index">
               <span :style="{'background-color': color.value}" :class="{'active':color.index==currentIndex}" @click="changeCurrentColor(color, index)"></span>
             </div>
           </div>
         </div>
       </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import DialogTemplate from "../DialogTemplate";
  import _ from 'lodash'

  export default {
    name: "CreateTagDlg",
    mixins: [WindowBase],
    components: {DialogTemplate},
    data(){
      return {
        name: '',
        errorMsg: '',
        currentIndex: 0,
        colors: [
          {index: 0, value: '#186EAE'},
          {index: 1, value: '#2CA6E6'},
          {index: 2, value: '#7385A8'},
          {index: 3, value: '#8A65D4'},
          {index: 4, value: '#D14B52'},
          {index: 5, value: '#DF9900'},
          {index: 6, value: '#918A12'},
          {index: 7, value: '#318857'}
        ],
        color: '#186EAE'
      }
    },
    methods: {
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      createCb (result = 'success') {
        if (_.get(result, ['error', 'code']) === 'TAG.1000') {
          this.errorMsg = this.$t('tag.warning.repeatTag')
        } else this.closeDialog(this.windowId)
      },
      confirm(){
        this.validate();
        if (this.errorMsg) return
        if (this.dialogData.param.ok) {
          this.dialogData.param.ok(this.name, this.color, this.createCb)
          this.closeDialog(this.windowId)
        } else this.closeDialog(this.windowId)
      },
      changeCurrentColor(e, index){
        this.color = e.value;
        this.currentIndex = index;
      },
      validate(){
        this.errorMsg = ''
        if (this.name.length <= 0) {
          this.errorMsg = this.$t('tag.warning.noEmpty')
        } else if (this.name.length > 20) {
          this.errorMsg = this.$t('tag.warning.lengthLimit')
        } else {
          this.errorMsg = ''
        }
      }
    }
  }
</script>

<style scoped lang="less">
 .color-content{
   margin-top: 30px;
   .title{

   }
   .color-list{
     height: 20px;
     width: 20px;
     margin-right: 15px;
     display: inline-block;
     span{
       height: 20px;
       width: 20px;
       margin-right: 10px;
       display: inline-block;
     }
     .active{
      border: 5px solid #ccc;
     }
   }
 }
</style>
