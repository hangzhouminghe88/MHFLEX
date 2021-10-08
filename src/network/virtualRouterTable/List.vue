<script>
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Methods from './Methods'

  export default {
    mixins: [WindowBase, Methods],
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
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.vRouterRouteTable[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.vRouterRouteTable[uuid]
          }
        )
      },
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        if (this.selectVal !=='' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        this.windowData.loading = true;
        let resp = await rpc.query('vrouter-route-tables', {
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
         this.windowData.loading = false;
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'vRouterRouteTable',
          list: resp.inventories
        })
          .then(() => {
            this.itemList = this.getData();
          })
      },
      create: async function (param) {
        let event = this.createEvent('vrouterroutetable.action.create', param.name)
        let resp, attach;
        try {
          resp = await rpc.create('vrouter-route-tables', {
            name: param.name,
            description: param.description
          }, event)
          this.incEventSuccess(event);
          if (param.virtualRouterUuidList && param.virtualRouterUuidList.length > 0) {
            attach = this.attach(resp.inventory.uuid, param.virtualRouterUuidList, this.queryList)
          }
        } catch (e) {
          this.incEventFail(event)
        }
        return Promise.all([resp, attach]);
      },
      openCreateVRouterRouteTable: function () {
        this.$router.push("createvrouterroutetable")
      },
      hasAttachedRouter: function (uuid) {
        return this.dbData.vRouterRouteTable[uuid].attachedRouterRefs.length > 0
      },
      getAttachableRouterList: function () {
        return rpc.query('vrouter-route-tables/virtual-router-refs').then((resp) => {
          if (resp.inventories.length === 0) return []
          let uuidList = resp.inventories.map(item => item.virtualRouterVmUuid)
          return uuidList
        })
      },
      updateCount: function () {
        rpc.query('vrouter-route-tables', {
          replyWithCount: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      pageAddVRouterRouteEntry: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        let selectedUuidList = self.selectedList

        this.showRouterEntryDlg=true;
        this.routerEntryMessage = {
          conditions: selectedUuidList,
          ok: (param) => self.createVRouterRouteEntry(selectedUuidList[0], param)
        }
      },
      pageDelete: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        let selectedUuidList = self.selectedList

        if (selectedUuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'vrouterroutetable.delete',
            description: this.$t("vrouterroutetable.deleteTable", {
              length: selectedUuidList.length}),
            uuidList: selectedUuidList,
            icon: 'router_table_small',
            ok: () => {
              self.delete(selectedUuidList, self.queryList)
            },
            getName: (uuid) => {
              return self.dbData.vRouterRouteTable[uuid].name;
            }
          })

        }
      },
      pageAttach: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        let selectedUuidList = self.selectedList
        this.getAttachableRouterList().then((virtualRouterVmUuidList) => {
          this.openDialog('RouterMultiSelectListDlg', {
            conditions: [`uuid!?=${virtualRouterVmUuidList.join()}`],
            select: (uuidList) => {
              self.attach(selectedUuidList[0], uuidList, self.queryList)
            }
          })
        })
      },
      pageDetach: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0 || self.dbData.vRouterRouteTable[self.selectedList[0]].attachedRouterRefs.length === 0) return
        let selectedUuidList = self.selectedList
        let virtualRouterVmUuidList = self.dbData.vRouterRouteTable[selectedUuidList[0]].attachedRouterRefs.map(item => item.virtualRouterVmUuid)
        self.openDialog('RouterMultiSelectListDlg', {
          conditions: [`uuid?=${virtualRouterVmUuidList.join()}`],
          select: (uuidList) => {
            self.openDialog('ConfirmDlg', {
              uuidList,
              title: 'vrouterroutetable.detach',
              description: 'vrouterroutetable.detachRouter',
              icon: 'router_table_small',
              ok: () => {
                self.detach(selectedUuidList[0], uuidList, self.queryList)
              },
              getName: (uuid) => {
                return self.dbData.vRouterRouteTable[uuid].name;
              }
            })
          }
        })
      }
    }
  }
</script>
