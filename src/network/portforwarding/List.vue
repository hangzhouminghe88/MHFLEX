<script>
  // import _ from 'lodash'
  // import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window'
  import PortForwardingMethods from 'src/network/portforwarding/Methods'

  export default {
    mixins: [WindowBase, PortForwardingMethods],
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
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.portforwarding[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.portforwarding[uuid]
          }
        )
      },
      pageDelete: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'portforwarding.delete',
            description: 'portforwarding.info.deleteConfirm',
            icon: 'port_forwarding_popupico',
            ok: () => {
              self.delete(uuidList).then(() => {
                self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.portforwarding[uuid].name;
            }
          })
        }
      }
    }
  }
</script>
