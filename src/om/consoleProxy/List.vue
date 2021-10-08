<script>
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  export default {
    name: "List",
    computed: {
      ...mapGetters({
        get: 'consoleProxy/getList'
      })
    },
    methods: {
      queryList(){
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('consoleProxy/basicQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
          let uuidList = resp.uuidList;
          return self
            .updateWindow({
              uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              pageCount: Utils.computePageCount(
                resp.total,
                self.windowData.pageSize
              ),
              total: resp.total
            })
            .then(() => {
              self.windowData.loading = false;
              self.itemList = self.get(self.windowData.uuidList);
            });
        });
      },
      pageReconnect(){
        let self = this;
        let event = this.createEvent('consoleProxy.action.ReConnected', self.dbData.consoleproxy[self.selectedList[0]].managementIp)
        self.dispatchActionWithEvent('consoleProxy/reconnect', self.selectedList, undefined, event)
          .then(self.queryList());
      },
      setOverridIp(uuid){
        let self = this;
        let originIP = self.dbData.consoleproxy[uuid].consoleProxyOverriddenIp;
        self.openDialog('SetConsoleProxyIpDlg', {
          originIP,
          ok: (ip) => {
            return self.setConsoleProxy(uuid, ip).then(() => {
              self.queryList()
            })
          }
        })
      },
      setConsoleProxy(uuid, ip){
        let self = this;
        let event = self.createEvent('consoleProxy.setOverriddenIp')
        return self.dispatchActionWithEvent('consoleProxy/setConsoleProxy', {uuid, ip}, undefined, event)
      }
    }
  }
</script>

<style scoped>

</style>
