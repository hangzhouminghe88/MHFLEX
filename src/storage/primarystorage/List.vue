<script>
  import rpc from 'src/utils/rpc'
  // import ListBase from 'src/windows/Base/ResizeList'
  import PSMethods from './Methods'
  // import CreatePrimaryStorageDlg from 'src/windows/PrimaryStorage/dialogs/CreatePrimaryStorage'
  import strategy from 'src/strategies/primaryStorage/strategy'
  /* global localStorage:false */

  export default {
    mixins: [PSMethods],
    components: {
      // 'create-primarystorage-dlg': CreatePrimaryStorageDlg
    },
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    computed: {
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
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.primarystorage[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.primarystorage[uuid]
          }
        )
      },
      canCreateVolume () {
        if (!this.isSingleSelected) return false;
        let ps = this.dbData.primarystorage[this.selectedList[0]];
        if (!ps) return false;
        return strategy.canCreateVolume(ps)
      },
      canAttach () {
        return this.isSingleSelected
      },
      canMaintenance () {
        if (!this.isSelected) return false;
        return strategy.canMaintenanceList(this.selectedList, this.dbData.primarystorage)
      },
      canReconnect () {
        return this.isSelected
      },
      canDelete () {
        return this.isSelected
      },
      pageReconnect: function () {
        const self = this;
        let uuidList = self.selectedList;

        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'primaryStorage.reconnect',
            warning: 'primaryStorage.reconnectWarning',
            uuidList: uuidList,
            icon: 'storage_popupico',
            ok: () => {
              return self.reconnect(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.primarystorage[uuid].name;
            }
          })
        }
      },
      canDetachCluster () {
        if (!this.isSingleSelected) return false;
        let ps = this.dbData.primarystorage[this.selectedList[0]];
        if (!ps) return false;
        return strategy.canDetachCluster(ps)
      },
      getCondition: function () {
        let conditionList = [];
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}&q=type!=VCenter`);

        /*
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }*/

        if (this.selectVal !=='' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        let self = this
        self.updateWindow({
          loading: true
        })

        let resp = await rpc.query('primary-storage', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        });

        //alert(JSON.stringify(resp.inventories));

        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        });
        let uuidList = resp.inventories.map((item) => item.uuid);
        let table = {};
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        });
        return this.updateDbTable({
          tableName: 'primarystorage',
          list: resp.inventories
        }).then(() => {
          return this.updateWindow({ loading: false,uuidList, table })
        }).then(()=>{
          this.itemList = this.getData();
        })
      },

      instates(){
        let self = this, states = [];
        for(let arg in arguments){
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every((uuid) => {
          return states.some((state) => state === self.dbData.primarystorage[uuid].state)
        })
        return instate;
      }
    }
  }
</script>
