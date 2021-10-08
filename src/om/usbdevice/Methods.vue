<script>
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  export default {
    name: "Methods",
    mixins: [Root],
    methods: {
      ...Utils,
      detach(vmUuid, uuidList){
        let self  = this;
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            vmUuid
          }
        })
       return self.dispatchActionWithEvent('usbdevice/detach', paramList)
      },
      attach(vmUuid, usbUuidList){
        let self = this;
        let paramList = usbUuidList.map((uuid) => {
          return {
            uuid,
            vmUuid
          }
        })
        return self.dispatchActionWithEvent('usbdevice/attach', paramList)
      },
      getVmName: function (uuid) {
        let usb = this.dbData.usbdevice[uuid]
        let value
        if (usb && this.dbData.vm[usb.vmInstanceUuid]) {
          value = this.dbData.vm[usb.vmInstanceUuid].name
        } else {
          if (this.checkBounce(`getVmName-${uuid}`)) return ''
          value = ''
          let vmUuid = usb && usb.vmInstanceUuid
          rpc.queryResourceNames(this, 'vm', vmUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      disable(uuidList){
        let self = this, event = null;
        event = self.createEvent(`usbDevice.action.disable`)
        return self.dispatchActionWithEvent(`usbdevice/disable`,  uuidList, null, event);
      },
      enable(uuidList){
        let self = this, event = null;
        event = self.createEvent(`usbDevice.action.enable`);
        return self.dispatchActionWithEvent(`usbdevice/enable`, uuidList, null, event);
      },
      updateName(uuid, name){
        let self = this;
        if (name === this.dbData.usbdevice[uuid].name) return
        let event = self.createEvent('usbDevice.updateName', this.dbData.usbdevice[uuid].name);
        let value = {
          name: name
        }
        self.dispatchActionWithEvent('usbdevice/update', {
          uuid,
          param: value
        }, null, event)
          .then(() => {
            self.queryList();
          })
      }
    }
  }
</script>

<style scoped>

</style>
