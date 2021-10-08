<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("zwatchEndpoint.updateAppointMember") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="phone-wrapper">
          <span class="phone-item" v-for="(number, index) in atPersonPhoneNumbers" >
            <input v-model="atPersonPhoneNumbers[index]" @blur="validatePhoneNumber(index)" :class="{'is-error': validatePhoneNumber(index)}"/>
            <div class="delete" @click="removeNumber(index)"></div>
            <div class="error error-text" v-if="validatePhoneNumber(index)">{{$t('zwatchEndpoint.inputPhoneNumber')}}</div>
          </span>
          <span class="phone-item"  @click="addNumber()">
            <input/>
            <div class="add"></div>
          </span>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import _ from 'lodash'

  export default {
    name: "EditAtPersonPhoneNumberDlg",
    components: {AddOrDeleteInput},
    mixins: [WindowBase],
    created(){
      let self = this;
      self.atPersonPhoneNumbers =  _.cloneDeep(this.dbData.zwatchEndpoint[this.dialogData.param.uuid].atPersonPhoneNumbers);
      self.dataUuid = self.dialogData.param.uuid ? self.dialogData.param.uuid : '';
    },
    data(){
      return {
        atPersonPhoneNumbers: [],
        dataUuid: ''
      }
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      removeNumber(index){
        let self = this;
        self.atPersonPhoneNumbers.splice(index, 1);
      },
      addNumber(){
        let self = this;
        self.atPersonPhoneNumbers.push("")
      },
      validatePhoneNumber(index){
        let self = this;
        if(self.atPersonPhoneNumbers[index] === ''){
          return true;
        }
        if(!/^(\+86-)(([1-9]\d{10}))$/.test(self.atPersonPhoneNumbers[index])){
          return true;
        }
        return false;
      },
      confirm(){
        let self = this;
        let invalid = self.atPersonPhoneNumbers.some((item,index) => self.validatePhoneNumber(index));
        if(invalid) return;
        self.dialogData.param.ok(self.atPersonPhoneNumbers);
        self.cancel();
      }
    }
  }
</script>

<style scoped>
  .delete {
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    position: absolute;
    right: 35px;
    top: 10px;
  }
  .phone-wrapper{
    display: inline-block;
    width: 100%;
  }
  .phone-item{
    display: inline-block;
    width: 40%;
    padding: 0px 20px 20px 30px;
    position: relative;
  }
  .add {
    height: 23px;
    width: 23px;
    position: absolute;
    right: 35px;
    top: 10px;
    background-image: url("~assets/add.svg");
    background-repeat: no-repeat;
  }
</style>
