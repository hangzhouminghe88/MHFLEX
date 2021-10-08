<template>
  <div>
    <volume-tab-list :param="{uuid: uuid, refresh: refresh, showCreateVmImage:param.showCreateVolumeImage}"></volume-tab-list>
    <div class="split-line"></div>
    <net-work-tab-list :param="{uuid: uuid, refresh: refresh, show: show, addNicMessage: param.addNicMessage}"></net-work-tab-list>
    <div class="split-line" style="padding-top: 10px;"></div>
    <iso-tab-list :param="{conditions: {vmUuid: uuid}, refresh: refresh, show: param.showCreateIosPage, isoMessage: param.isoMessage}"></iso-tab-list>
    <div class="split-line"></div>
    <lun-tab-list-for-vm v-if="dbData.common.isAdmin" :param="{conditions: `scsiLunVmInstanceRef.vmInstanceUuid=${uuid}`, uuid: uuid }"/>
    <div class="split-line"></div>
    <gpu-device-tab-list :param="{conditions: `vmInstanceUuid=${uuid}`, uuid: uuid, }"/>
    <div class="split-line"></div>
    <usb-device-tab-list :param="{conditions: `vmInstanceUuid=${uuid}`, uuid: uuid}"/>
    <div class="split-line"></div>
    <pci-device-tab-list/>
  </div>
</template>

<script>
  import VolumeTabList from "./VolumeTabList";
  import WindowBase from 'src/windows/Window';
  import NetWorkTabList from "./NetWorkTabList";
  import IsoTabList from "./IsoTabList";
  import LunTabListForVm from "./LunTabListForVm";
  import GpuDeviceTabList from "./GpuDeviceTabList";
  import UsbDeviceTabList from "./UsbDeviceTabList";
  import PciDeviceTabList from "./PciDeviceTabList";
  export default {
    name: "ConfigTabList",
    mixins: [WindowBase],
    components: {
      PciDeviceTabList,
      UsbDeviceTabList, GpuDeviceTabList, LunTabListForVm, IsoTabList, NetWorkTabList, VolumeTabList},
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        uuid: '',
        refresh: null,
        show: null,
        close: null
      }
    },
    created() {
      let self = this;
      self.uuid = self.param.uuid ? self.param.uuid :  '';
      self.refresh = self.param.refresh ? self.param.refresh : '';
      self.show = self.param.show ? self.param.show : null;
      self.close = self.param.close ? self.param.close:  null;
    },
    'param.uuid': function (newValue, oldValue) {
      let self = this;
      if (_.isEqual(newValue, oldValue)) return
      self.uuid = self.param.uuid;
    }
  }
</script>

<style scoped>
  .split-line{
    width: 97%;
  }
</style>
