<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>添加网卡</span>
        <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
      </div>
      <div slot="body">
        <el-form style="width: 100%">
          <el-form-item :label="$t('vm.vmNicMAC')">
            <el-input type="text" v-model="mac" placeholder="08:00:20:0A:8C:6D"/>
          </el-form-item>
        </el-form>
        <div class="operation-row">
          <div class="title required">IPV4</div>
          <add-or-delete-input :value="dbData.l3network[ipv4Uuid] && dbData.l3network[ipv4Uuid].name "
                               @open="openIPv4"
                               @remove="removeIPv4($event)"
                               :class="{'is-error': ipv4IsValid}"/>
          <div v-if="!ipv4Uuid && ipv4IsValid" class="error error-text">ipv4{{$t('error.noEmpty')}}</div>
          <div v-if="ipv4Uuid" class="add-nic" @click="openAddNicDlg('IPV4')"><i class="el-icon-plus"></i>{{$t('common.addNic')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">IPV6</div>
          <add-or-delete-input :value="dbData.l3network[ipv6Uuid] && dbData.l3network[ipv6Uuid].name "
                               @open="openIPv6"
                               @remove="removeIPv6($event)"
                               :class="{'is-error': ipv6IsValid}"/>
          <div v-if="!ipv6Uuid && ipv6IsValid" class="error error-text" :class="{'isValid':ipv6IsValid}">ipv6{{$t('error.noEmpty')}}</div>
          <div v-if="ipv6Uuid" class="add-nic" @click="openAddNicDlg('IPV6')"><i class="el-icon-plus"></i>{{$t('common.addNic')}}</div>
        </div>
      </div>
      <div slot="footer" class="create-footer">
        <span class="btn-confirm" @click="ok()">{{$t('common.confirm')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
    <net-work-select-list-confirm-dlg v-if="showNetWorkSelectDlg" :message="message" :model="showNetWorkSelectDlg" :ipType="networkType"
                                      @setShowFlase="setShowOrFalse">
    </net-work-select-list-confirm-dlg>
    <add-nic-dlg v-if="showNicDlg" :model="showNicDlg" :message="addNicMessage" @close="closeNicDlg"></add-nic-dlg>
  </div>
</template>

<script>
  import CreateTemplate from "../../../component/CreateTemplate";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import NetWorkSelectListConfirmDlg from "../../../dialog/NetWorkSelectListConfirmDlg";
  import WindowBase from 'src/windows/Window';
  import AddNicDlg from "../../../dialog/AddNicDlg";
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";

  export default {
    name: "DoubleNetWorkSelect",
    mixins: [WindowBase],
    props:{
      param:{
        type: Array,
        default: []
      }
    },
    components: {CreateTemplateNoRoute, AddNicDlg, NetWorkSelectListConfirmDlg, AddOrDeleteInput, CreateTemplate},
    data() {
      return {
        showNetWorkSelectDlg: false,
        networkType: 'IPV4',
        ipv4Uuid: '',
        ipv6Uuid: '',
        message:{},
        vmNicConfigList: [],
        mac: '',
        ipv6IsValid: false,
        ipv4IsValid: false,
        ipv6StaticIP: '',
        ipv4StaticIP: '',
        addNicMessage: {},
        showNicDlg: false
      }
    },
    methods: {
      openIPv4(){
        let self = this;
        self.networkType = 'IPV4';
        self.message.selectType = 'single';
        self.message.networkUuidList= self.param;
        self.showNetWorkSelectDlg = true;
      },
      removeIPv4($event){
        this.ipv4Uuid = '';
        $event.stopPropagation();
      },
      openIPv6(){
        this.networkType = 'IPV6';
        this.message.selectType = 'single';
        this.message.ipv6NetworkUuidList = this.param;
        this.showNetWorkSelectDlg = true;
      },
      openAddNicDlg(param){
        let self = this;
        if(param === 'IPV4'){
          self.addNicMessage = {
            uuid: this.ipv4Uuid,
            staticIp: this.ipv4StaticIP,
            isSingle: true,
            isUserVm: true,
            hideMac: true,
            isIPv6: false,
          }
        }else if(param === 'IPV6'){
          self.addNicMessage ={
            uuid: this.ipv6Uuid,
            staticIp: this.ipv6StaticIP,
            isSingle: true,
            isUserVm: true,
            isIPv6: true,
            hideMac: true,
          }
        }
        self.showNicDlg = true;
      },
      closeNicDlg(val){
        let self = this;
        if(val && val.IPv6 === 'IPV4'){
          self.ipv4StaticIP = val;
        }else if(val && val.IPv6 === 'IPV6'){
          self.ipv6StaticIP = val;
        }
        self.showNicDlg = false;
      },
      removeIPv6($event){
        this.ipv6Uuid = '';
        $event.stopPropagation();
      },
      setShowOrFalse(uuidList){
        if(this.networkType === 'IPV4')
          this.ipv4Uuid = uuidList;
        if(this.networkType === 'IPV6')
          this.ipv6Uuid = uuidList;
        this.showNetWorkSelectDlg = false;
      },
      ok () {
        let self = this;
        let vmNicConfigList = _.cloneDeep(self.vmNicConfigList)
        if(self.ipv4Uuid == "") {
          this.ipv4IsValid = true;
        } else if(self.ipv4Uuid) {
          this.ipv4IsValid = false;
          vmNicConfigList.push(self.ipv4Uuid)
        } else if(self.ipv6Uuid == "") {
          this.ipv6IsValid = true;
        } else if(self.ipv6Uuid){
          this.ipv4IsValid = false;
          vmNicConfigList.push(self.ipv6Uuid)
        }
        if(self.ipv6IsValid || self.ipv4IsValid) {
          return;
        }else{
          let param = {
            mac: self.mac,
            ipv4NetworkUuid: self.ipv4Uuid,
            ipv6NetworkUuid: self.ipv6Uuid,
            ipv6StaticIP: self.ipv6StaticIP,
            ipv4StaticIP: self.ipv4StaticIP
          }
          this.$emit('close',param)
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .wrapper{
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background: #fff;
    z-index: 8888;
  }
  .container{
    width: 100%;
    height: 100%;
    .create-header{
      border: 1px solid #ccc;
      box-shadow: 0 1px 1px #ccc;
    }
    .create-body{
      margin-top: 20px;
      padding: 0px 20px 0px 30px;
      width: 15%;
      .add-nic{
        width: 100%;
        height: 20px;
        margin-top: 0px;
        position: relative;
        text-align: right;
        color: #409EFF;
        cursor: pointer;
      }
      .isValid{
        color: #ff0000;
      }
    }
  }
</style>
