<script>
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import VRouterRouteEntryMethods from './Methods'

  export default {
    mixins: [WindowBase, VRouterRouteEntryMethods],
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
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: async function () {
        let resp = await rpc.query('vrouter-route-tables/route-entries', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'vRouterRouteEntry',
          list: resp.inventories
        })
        this.itemList = this.getItemList();
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.vRouterRouteEntry[uuid];
        })
      },

      updateCount: function () {
        rpc.query('vrouter-route-tables/route-entries', {
          replyWithCount: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      pageCreate: function () {
        const self = this;
        self.param.addVRouterRouteEntry(self.queryList)
      },
      pageDelete: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        self.openDialog('ConfirmDlg', {
          uuidList: self.selectedList,
          title: 'vRouterRouteEntry.delete',
          icon: 'router_table_small',
          description: 'vRouterRouteEntry.deleteEntry',
          ok: () => {
            self.delete(this.windowData.dataUuid, self.selectedList, self.queryList)
          },
          getName: (uuid) => {
            return self.dbData.vRouterRouteEntry[uuid].destination;
          }
        })
      }
      // pageAttach: function () {
      //   const self = this
      //   if (!self.isSelected || self.selectedList.length <= 0) return
      //   self.attach(self.selectedList, self.queryList)
      // },
      // pageDetach: function () {
      //   const self = this
      //   if (!self.isSelected || self.selectedList.length <= 0) return
      //   self.detach(self.selectedList, self.queryList)
      // }
    }
  }
</script>
