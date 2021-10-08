<script>
  import WindowBase from 'src/windows/Window'
  import IPsecMethods from './Methods'

  export default {
    mixins: [WindowBase, IPsecMethods],
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
            title: 'common.destroyIPsec',
            description: 'ipsec.deleteIpsec',
            uuidList: uuidList,
            icon: 'ipsec_popupico',
            ok: () => {
              self.delete(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.ipsec[uuid].name;
            }
          })
        }
      }
    }
  }
</script>
