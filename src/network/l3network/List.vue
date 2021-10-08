<script>
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import L3NetworkMethods from 'src/network/l3network/Methods'

  export default {
    mixins: [WindowBase, L3NetworkMethods],
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
      PageAttachVirtualRouterOffering: function (uuid) {
        let self = this
        this.openDialog('VirtualRouterInstanceOfferingListSingleSelectDlg', {
          conditions: ['state=Enabled', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'image.format!=vmtx'],
          ok: (resourceUuid) => {
            self.attachVirtualRouterOffering(uuid, resourceUuid)
          }
        })
      },
      PageDetachVirtualRouterOffering: function (uuid) {
        const self = this
        if (self.dbData.l3network[uuid].tagForVirtualRouterOfferingUuid === '') return
        rpc.query('instance-offerings')
          .then((resp) => {
            self.updateDbTable({
              tableName: 'instanceOffering',
              list: resp.inventories
            }).then(() => {

              self.openDialog('ConfirmDlg',{
                title: `common.detachVirtualRouterOffering`,
                description: this.$t("l3network.detachVirtualRouterOffering", { length: 1 }),
                uuidList: [self.dbData.l3network[uuid].virtualRouterOfferingUuid],
                icon: 'instance_offering_popupico',
                ok: () => {
                  self.detachVirtualRouterOffering(uuid, self.dbData.l3network[uuid].tagForVirtualRouterOfferingUuid)
                },
                getName: (uuid) => {
                  return self.dbData.instanceOffering[uuid].name;
                }
              })
            })
          })
      }
    }
  }
</script>
