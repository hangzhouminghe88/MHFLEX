<script>
  import ClusterMethods from './Methods'
  import rpc from 'src/utils/rpc'
  import Root from "../../windows/Root";
  import _ from 'lodash'
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';

  export default {
    mixins: [ ClusterMethods,Root],
    computed:{
    },
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
      queryList: function () {
        let self = this
        self.windowData.loading = true;
        let start = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let condition = self.getCondition().join(' ')
        let script = `

def tmp = query("QueryCluster limit=${limit} start=${start} ${condition} sortBy=${self.windowData.sortBy} sortDirection=${self.windowData.sortDirection === '-' ? 'desc' : 'asc'} replyWithCount=true")
put("total", tmp.total)

def clusterList = tmp.result
put("cluster", clusterList)

def clusterUuidList = clusterList.collect{ it.uuid }

def clusterAList = []

def HostList = query("QueryHost clusterUuid?=" + clusterUuidList.join(",")).result
def PrimaryStorageList = query("QueryPrimaryStorage cluster.uuid?=" + clusterUuidList.join(",")).result
def L2NetworkList = query("QueryL2Network cluster.uuid?=" + clusterUuidList.join(",")).result
def VmInstanceList = query("QueryVmInstance clusterUuid?=" + clusterUuidList.join(",")).result

clusterUuidList.each { uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  tmp["hostNum"] = HostList.findAll { it.clusterUuid == uuid }.size()

  def attachedPs = PrimaryStorageList.findAll { it.attachedClusterUuids.contains(uuid) }
  tmp["isAttachPrimaryStorage"] = attachedPs.size() > 0
  tmp["psTypes"] = attachedPs.collect{ it.type }.unique().sort()

  tmp["isAttachL2network"] = L2NetworkList.findAll { it.attachedClusterUuids.contains(uuid) }.size() > 0

  result = call("org.zstack.header.allocator.APIGetCpuMemoryCapacityMsg", '{"clusterUuids": ' + [uuid] +'}').result
  tmp["totalCpu"] = result.totalCpu
  tmp["availableCpu"] = result.availableCpu
  tmp["totalMemory"] = result.totalMemory
  tmp["availableMemory"] = result.availableMemory
  clusterAList.push(tmp)
}

put("clusterA", clusterAList)

`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          self.windowData.loading = false;
          let result = resp.result
          return self.applyRespToDb(result, self).then(() => {
            let uuidList = result.cluster.map(cluster => cluster.uuid)
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
          }).then(() => {
            self.itemList = self.getData();
          })
        })
      },
      getData(){
        let uuidList=[]
        if(!_.isArray(this.windowData.uuidList)) return[]

        uuidList=this.windowData.uuidList.filter(uuid=>this.dbData.cluster[uuid])

        return uuidList.map(uuid=>{
          return this.dbData.cluster[uuid]
        })
      },
       async pageAttachPrimaryStorage(){
        let self = this;
        if (!self.isSingleSelected) return
        let uuid = this.selectedList[0]
        let psUuidList = await primaryStorageConditon.getClusterAttachablePrimaryStorage(uuid)
        await this.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`uuid?=${psUuidList}`],
          type:'radio',
          select: (primarystorageuuid) => this.attachPrimaryStorage(uuid, primarystorageuuid)
        })
      },
      pageDetachPrimaryStorage(){
        let self = this;
        if (!self.isSingleSelected) return
        let uuid = self.selectedList[0]
        this.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`attachedClusterUuids=${uuid}`],
          type:'selection',
          select: (primarystorageuuid) => {
            this.openDialog('ConfirmDlg', {
              title: 'common.detachprimarystorage',
              description: 'primaryStorage.detachPS',
              icon: 'storage_popupico',
              warning: 'primaryStorage.detachClusterWarning',
              getName(uuid){
                return self.dbData.primarystorage[uuid].name;
              },
              uuidList: primarystorageuuid,
              ok: () => {
                this.detachPrimaryStorage(uuid, primarystorageuuid)
              }
            })
          }
        })
      }
    }
  }
</script>
