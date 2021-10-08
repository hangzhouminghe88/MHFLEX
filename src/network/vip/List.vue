<script>
  import WindowBase from 'src/windows/Window';
  import vipMethods from './Methods'
  import _ from 'lodash'

  export default {
    mixins: [WindowBase, vipMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    },
    methods: {
      pageDelete: function () {
        let uuidList = this.selectedList

        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'vip.delete',
            description: 'vip.info.deleteConfirm',
            waring:'vip.warning',
            uuidList: uuidList,
            icon: 'virtual_ip_popupico',
            ok: () => {
              self.delete(uuidList).then(() => self.queryList())
            },
            getName: (uuid) => {
              return self.dbData.vip[uuid].name;
            }
          })
        }
      },
      canChangeResourseOwner: function () {
        const self = this
        let value = true
        let vip = null
        if (!self.isSelected || self.selectedList.length <= 0) return false
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          vip = _.cloneDeep(self.dbData.vip[self.selectedList[i]])
          if (self.dbData.l3NetworkOfHost[vip.l3NetworkUuid] && self.dbData.l3NetworkOfHost[vip.l3NetworkUuid][0].hypervisorType === 'ESX') {
            value = false
            break
          }
        }
        return value
      }
    }
  }
</script>

