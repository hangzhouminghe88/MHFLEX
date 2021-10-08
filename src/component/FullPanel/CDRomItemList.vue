<template>
  <div class="operation-row">
    <div class="title">
      {{ $t("vm.config.iso") }}
    </div>
    <div v-for="(item, index) of itemList" style="margin-top: 20px">
      <div class="title"  v-if="index !== 0">
        {{ $t("vm.config.iso") }}
      </div>
      <div class="content">
        <span style="padding-left:10px;">{{ item.cdRom }}</span>
        <div class="delete" @click="param.removeItem(index)"></div>
      </div>
      <div class="config" @click.stop="onClick(index)">
        <img v-show="addISO[index]" src="~assets/arrow_down.svg" >
        <img v-show="!addISO[index]" src="~assets/arrow_up.svg" >
        <a class="link">{{ $t("vm.cdRom.addISO") }}</a>
      </div>
      <single-picker style="padding-top: 5px" v-if="addISO[index]" :param="{
        getTitle: () => 'ISO',
        getValue: () => item.isoUuid && dbData.image[item.isoUuid].name,
        open: () => openISODlg(index),
        delete: () => param.removeISO(index)
      }" />
      <iso-image-single-dlg v-if="showIsoImageSingleDlg" :model="showIsoImageSingleDlg" :message="IsoMessage" @close="closeIsoSingleDlg"></iso-image-single-dlg>
    </div>
  </div>
</template>
<script>
  import  SinglePicker  from 'src/component/FullPanel/SinglePicker'
  import WindowBase from 'src/windows/Window'
  import IsoImageSingleDlg from "../../dialog/IsoImageSingleDlg";

  export default {
    name: 'CDROMItemList',
    mixins: [WindowBase],
    props: ['param'],
    components: {
      IsoImageSingleDlg,
      'single-picker': SinglePicker
    },
    data () {
      return {
        addISO: [false, false, false],
        showIsoImageSingleDlg: false,
        IsoMessage:{}
      }
    },
    methods: {
      openISODlg (index) {
        let self = this;
        let selectedISO = this.param.getAllItemList().filter(v => v.isoUuid).map(v => v.isoUuid)
        let conditions = ['mediaType=ISO', `uuid!?=${selectedISO}`];
        self.IsoMessage.conditions = conditions;
        self.IsoMessage.index = index;
        self.showIsoImageSingleDlg = true;
        // this.openSideWindowForCreate('ImageListSingleSelectList', {
        //   conditions,
        //   select: uuid => this.selectISO(uuid, index)
        // })
      },
      closeIsoSingleDlg(val){
        let self = this;
        if(val){
          self.selectISO(val.uuid, val.index)
        }
        self.showIsoImageSingleDlg = false;
      },
      onClick (index) {
        this.addISO[index] = !this.addISO[index]
        this.$forceUpdate()
      },
      selectISO (uuid, index) {
        let item = {
          isoUuid: uuid,
          cdRom: this.itemList[index].cdRom
        }
        this.param.setISO(index, item)
        this.$forceUpdate()
      }
    },
    computed: {
      itemList () {
        return this.param.getItemList() || []
      },
      dbData () {
        return this.$store.state.db
      }
    }
  }
</script>
<style scoped>
  .config {
    overflow: hidden;
    width: 350px;
    cursor: pointer;
    line-height: 2.4;
    padding: 0;
    font-size: 12px;
    margin-bottom: -10px;
  }

  .config img {
    float: right;
    position: relative;
    right: 70px;
    top: 3px;
  }

  .config .link {
    position: relative;
    float: right;
    color: #007FDF;
    text-decoration: none;
    cursor: pointer;
  }

</style>
