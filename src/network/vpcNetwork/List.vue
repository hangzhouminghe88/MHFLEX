<script>
  // import Vue from 'vue'
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'

  import WindowBase from 'src/windows/Window';
  import VpcNetworkMethods from 'src/network/vpcNetwork/Methods'

  export default {
    mixins: [WindowBase, VpcNetworkMethods],
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
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.l3network[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.l3network[uuid]
          }
        )
      },
      pageAttachVpcNetworkToVpcVRouter: function () {
        const self = this

        let l2NetworkUuid = this.dbData.l3network[self.selectedList[0]].l2NetworkUuid
        let clusterUuidList = this.dbData.l2network[l2NetworkUuid].attachedClusterUuids
        let selectedUuidList = self.selectedList
        if (selectedUuidList.length === 0) return

        this.openDialog('VpcVRouterSingleSelectListDlg', {
          conditions: [`cluster.uuid?=${clusterUuidList}`, 'state=Running'],
          ok: (vpcVRouterUuid) => {
            self.attachVpcNetworkToVpcVRouter(selectedUuidList, vpcVRouterUuid).then(() => self.queryCurrentL3Network(selectedUuidList[0]))
          }
        })
      },
      pageDetachVpcNetworkFromVpcVRouter: function () {
        let self = this
        if (self.dbData.l3network[self.selectedList[0]].hasAttachedVm) {
          self.openDialog('ConfirmDlg',{
            title: 'vpcNetwork.detachVpcVRouter',
            description: 'vpcNetwork.detachVpcVRouterConfirm',
            uuidList: self.selectedList.map(uuid => this.dbData.l3network[uuid].vpcVRouterUuid),
            icon: 'vpc_vrouter_popupico',
            warning: 'vpcNetwork.detachVpcNetworkFromVpcVRouterWarning',
            getName: (uuid) => {
              return self.dbData.vm[uuid].name;
            }
          })
        } else {
          rpc.query('vm-instances/nics', {
            q: `l3Network.uuid?=${self.selectedList}`
          }).then((resp) => {
            let vmNicUuidList = resp.inventories.map(it => it.uuid)
            self.openDialog('ConfirmDlg',{
              title: 'vpcNetwork.detachVpcVRouter',
              description: 'vpcNetwork.detachVpcVRouterConfirm',
              uuidList: self.selectedList.map(uuid => this.dbData.l3network[uuid].vpcVRouterUuid),
              icon: 'vpc_vrouter_popupico',
              ok: () => {
                self.detachVpcNetworkFromVpcVRouter(vmNicUuidList)
                  .then(() => {
                    self.queryCurrentL3Network(self.selectedList[0])
                  })
              },
              getName: (uuid) => {
                return self.dbData.vm[uuid].name;
              }
            })
          })
        }
      }
    }
  }
</script>
