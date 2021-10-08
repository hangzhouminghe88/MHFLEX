<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>
          {{$t('action.cdRom.create')}}
        </span>
        <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
      </div>
      <div slot="body">
        <div class="clone-container">
          <div class="title required">
            {{ `${$t("vm.config.iso")}${$t('common.colon')}` + `${name}`}}
          </div>
          <component style="margin-top: 20px;" :param="isoItem.param" :is="isoItem.ctrl"/>
          <!--展示悬着哪一个网络列表-->
        </div>
      </div>
      <div slot="footer">
        <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
    <iso-image-single-dlg v-if="showIsoImageSingleDlg" :model="showIsoImageSingleDlg" :message="isoImageMessage" @close="closeIsoImageSingSelect"/>
  </div>
</template>

<script>

  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import IsoSinglePicker from 'src/component/FullPanel/SinglePicker';
  import rpc from 'src/utils/rpc';
  import IsoImageSingleDlg from "../../../dialog/IsoImageSingleDlg";
  import WindowBase from 'src/windows/Window';
  export default {
    name: "VmCreateIso",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    components: {IsoImageSingleDlg, CreateTemplateNoRoute},
    data(){
      return {
        name:'CDROM-1',
        vmInstanceUuid: "",
        showIsoImageSingleDlg: false,
        isoImageMessage: {},
        availableISO: "",
        isoUuid: "",
        isoItem: {
          param: {
            getTitle: () => 'ISO',
            canShowStar: () => this.param.isISORequired,
            open: this.openISODlg,
            delete: () => { this.isoUuid = '' },
            getValue: () => {
              return this.isoUuid && this.dbData.image[this.isoUuid].name
            }
          },
          ctrl: IsoSinglePicker
        }
      }
    },
    mounted(){
      let self = this;
      self.getCDRom()
        .then(() =>{});
    },
    methods: {
      confirm(){
       let self = this;
       self.$emit('close', self.createParam());
      },
      getCDRom () {
        this.vmInstanceUuid = this.param.vmInstanceUuid
        return rpc.query('vm-instances/cdroms', { q: `vmInstanceUuid=${this.vmInstanceUuid}` }).then(resp => {
          this.name = `CDROM-${resp.inventories.length + 1}`
        })
      },
      openISODlg(){
        let self = this;
        self.isoImageMessage ={
          vmInstanceUuid: this.vmInstanceUuid
        }
        self.showIsoImageSingleDlg = true;
      },
      closeIsoImageSingSelect(param){
        let self = this;
        if(param){
          this.isoUuid = param.uuid;
        }
        self.showIsoImageSingleDlg = false;
      },
      //创建参数
      createParam () {
        let obj = {
          name: this.name,
          vmInstanceUuid: this.vmInstanceUuid
        }
        if (this.isoUuid) obj.isoUuid = this.isoUuid
        return obj
      },
    }
  }
</script>

<style scoped>

</style>
