<script>
  import WindowBase from 'src/windows/Window';
  import {mapGetters, mapState} from 'vuex';
  import Utils from 'src/utils/utils';
  import Root from 'src/windows/Root';
  import UsbMethods from './Methods';
  export default {
    name: "List",
    mixins: [WindowBase, Root, UsbMethods],
    computed: {
      ...mapGetters({
        getList: 'usbdevice/getList'
      }),
      ...mapState({
        usbdevice: state => state.usbdevice
      }),
    },
    methods: {
      queryList(){
        let self = this;
        return self.dispatchAction('usbdevice/query',{
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition(),
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        })
          .then((resp)=>{
            return this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              total: resp.total
            })
          }).then(() => {
            self.itemList = self.getList(self.windowData.uuidList)
          })
      },
      getCondition: function () {
        let conditionList = []
        if (this.param.uuidList && this.param.uuidList.length > 0) {
          conditionList.push(`hostUuid?=${this.param.uuidList.join()}`)
        }
        if (this.windowData.conditions) conditionList = conditionList.concat(this.windowData.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      pageDetach() {
        let self = this
        let uuidList = []
        let vmInstanceUuid = this.windowData.vmUuid
        uuidList = self.windowData.selectUuidList
        if (uuidList.length > 0) {
          self.openDialog( 'ConfirmDlg', {
            description: 'usbDevice.detachUsbDevice',
            getName: uuid => self.dbData.usbdevice[uuid].name,
            title: 'usbDevice.action.detach',
            uuidList: uuidList,
            icon: 'usb_popupico',
            ok: () => {
               self.detach(vmInstanceUuid, uuidList).then(() => self.queryList())
            }
          })
        }
      },
      pageAttach(){
        let self  = this;
        let vmInstanceUuid = self.windowData.vmUuid;
        self.openDialog('UsbMultiSelectListDlg', {
          vmInstanceUuid: vmInstanceUuid,
          select: (uuidList) => self.attach(vmInstanceUuid, uuidList).then(() => self.queryList())
        })
      },
      hasOnState: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        const self = this
        let has = false
        this.selectedList.forEach(uuid => {
          let usb = self.dbData.usbdevice[uuid]
          let usbState = usb && usb.state
          if (stateList.indexOf(usbState) > -1) has = true
        })
        return has
      },
      canDisable () {
        if (!this.isSelected) return false
        let uuidList = this.selectedList
        let canDis = this.hasOnState('Enabled')
        let hasNotAttachedVm = false
        uuidList.forEach(uuid => {
          let usb = this.dbData.usbdevice[uuid]
          let usbVmInstance = usb && usb.vmInstanceUuid
          if (!usbVmInstance) hasNotAttachedVm = true
        })
        return canDis && hasNotAttachedVm
      },
      canAttach () {
        let self = this;
        if (!self.isSingleSelected) return false
        let usb = self.usbdevice[self.selectedList[0]]
        let host = usb && this.dbData.host[usb.hostUuid]
        let isAttachable = host && host.state === 'Enabled' && host.status === 'Connected'
        return self.hasOnState('Enabled') && usb && !usb.vmInstanceUuid && isAttachable
      },
      canDetach () {
        if (!this.isSingleSelected) return false
        let usb = this.dbData.usbdevice[this.selectedList[0]]
        return usb && usb.vmInstanceUuid
      },
    }
  }
</script>

<style scoped>

</style>
