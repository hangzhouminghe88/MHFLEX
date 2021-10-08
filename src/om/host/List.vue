<script>
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import Vue from 'vue'
  import HostMethods from './Methods'
  // import CreateHostDlg from 'src/windows/Host/dialogs/CreateHost'
  // Vue.component('create-host-dlg', CreateHostDlg)
  // /* global localStorage:false */

  export default {
     mixins: [WindowBase, HostMethods],
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
      ...Utils,
      queryList: function () {
        let self = this
        self.windowData.loading = true;
        let start = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let condition = self.getCondition().join(' ')

        let script = `

def tmp = query("QueryHost limit=${limit} start=${start} ${condition} sortBy=${self.windowData.sortBy} sortDirection=${self.windowData.sortDirection === '-' ? 'desc' : 'asc'} replyWithCount=true")
put("total", tmp.total)

def HostList = tmp.result
put("host", HostList)

def clusterUuidList = HostList.collect{ it.clusterUuid }

def ClusterList = query("QueryCluster uuid?=" + clusterUuidList.join(",")).result

put("cluster", ClusterList)

`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          self.windowData.loading = false;
          self.updateCount()
          let result = resp.result
          return self.applyRespToDb(result, self).then(() => {
            let uuidList = result.host.map(host => host.uuid)
            let table = {}
            uuidList.forEach(uuid => {
              table[uuid] = {
                selected: false
              }
            })
            return self.updateWindow({
              pageCount: result.total === 0 ? 1 : Math.ceil(result.total / self.windowData.pageSize),
              uuidList,
              table,
              total: result.total
            })
          })
        }).catch(()=>{
          self.windowData.loading = false;
        }).then(() => {
          self.itemList = self.getItemList();
        })
      },
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) =>  {
          return self.dbData.host[uuid];
        })
      },
      queryAllList: async function () {
        let limit = 100000
        let start = 0
        let self = this
        let event = self.createEvent('host.action.queryAllList', undefined, undefined, '', 'NotApiCall')
        let uuidList = []
        let result = await this._queryList(start, limit, event)
        uuidList = result.host.map((item) => item.uuid)
        await this._handleList(result)
        return uuidList
      },
      _handleList: function (result) {
        let self = this
        return self.applyRespToDb(result, self).then(() => {
          let uuidList = result.host.map(host => host.uuid)
          let table = {}
          uuidList.forEach(uuid => {
            table[uuid] = {
              selected: false
            }
          })
          return self.updateWindow({
            availableCount: result.total,
            pageCount: result.total === 0 ? 1 : Math.ceil(result.total / self.windowData.pageSize),
            uuidList,
            table
          })
        })
      },
      _queryList: function (start, limit, event) {
        let self = this
        let condition = self.getCondition().join(' ')

        let script = `

def tmp = query("QueryHost limit=${limit} start=${start} ${condition} sortBy=${self.windowData.sortBy} sortDirection=${self.windowData.sortDirection === '-' ? 'desc' : 'asc'} replyWithCount=true")
put("total", tmp.total)

def HostList = tmp.result
put("host", HostList)

def clusterUuidList = HostList.collect{ it.clusterUuid }

def ClusterList = query("QueryCluster uuid?=" + clusterUuidList.join(",")).result

put("cluster", ClusterList)

`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let result = resp.result
          if (event) self.setEventSuccess(event)
          return result
        }, () => {
          if (event) self.setEventFail(event)
        })
      },
      canEnable(){
        let self = this;
        if(!self.selectedList) return false;
        return self.selectedList.some((uuid) => {
          return self.dbData.host[uuid].state !== 'Enabled';
        })
      },
      inState(){
        let self = this, states= [];
        for(let arg in arguments){
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every((uuid) => {
          return states.some((state) => state === self.dbData.host[uuid].state);
        })
        return instate;
      },
      inStatus(){
        let self = this, statuses= [];
        for(let arg in arguments){
          statuses.push(arguments[arg]);
        }
        let instatus = self.selectedList.every((uuid) => {
          return statuses.some((status) => status === self.dbData.host[uuid].status);
        })
        return instatus;
      },
      canDisabled(){
        let self = this;
        if(!self.selectedList) return false;
        return self.selectedList.some((uuid) => {
          return self.dbData.host[uuid].state !== 'Disabled';
        })
      }
    }
  }
</script>
