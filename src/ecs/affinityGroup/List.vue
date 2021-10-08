<script>
  import rpc from '../../utils/rpc'
  import Utils from '../../utils/utils'
  import Methods from './Methods'

  export default {
    mixins: [Methods],
    computed: {
    },
    methods: {
      queryList: function () {
        let self = this
        self.updateWindow({
          loading: true
        })
        let start = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let condition = self.getCondition().join(' ')
        let script = `

def tmp = query("QueryAffinityGroup limit=${limit} start=${start} ${condition} sortBy=${self.windowData.sortBy} sortDirection=${self.windowData.sortDirection === '-' ? 'desc' : 'asc'} replyWithCount=true")
put("total", tmp.total)

def affinityGroupList = tmp.result
put("affinitygroup", affinityGroupList)

def affinityGroupUuids = affinityGroupList.collect{ it.uuid }

def vmsInAffinityGroup = []
def usages = affinityGroupList.collect{ it.usages }.flatten()

usages.each{ it ->
  vmsInAffinityGroup.push(it.resourceUuid)
}

def vmUuidList = query("QueryVmInstance state!=Destroyed uuid?=" + vmsInAffinityGroup.join(",")).result.collect{ it.uuid }

if (affinityGroupUuids.size() > 0) {
  def resourceAccountList = call("org.zstack.header.identity.APIGetResourceAccountMsg", '{"resourceUuids": ["' + affinityGroupUuids.join('","') + '"]}').result.inventories
  put("resourceAccount", resourceAccountList)
}

def affinitygroupAList = []

affinityGroupUuids.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def affinityGroup = affinityGroupList.find{ it.uuid == uuid }
  tmp["vmNums"] = affinityGroup.usages.findAll{ vmUuidList.contains(it.resourceUuid) }.size()
  affinitygroupAList.push(tmp)
}
put("affinitygroupA", affinitygroupAList)

`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let result = resp.result
          let uuidList = result.affinitygroup.map(item => item.uuid)
          let affinitygroupA = result.affinitygroupA
          let resourceAccount = result.resourceAccount;
          affinitygroupA.map(item => {
            item.accountUuid = resourceAccount[item.uuid].uuid
            item.accountName = resourceAccount[item.uuid].name
          })
          delete result.resourceAccount
          return self.applyRespToDb(result, self).then(() => {
            let table = {}
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            return self.updateWindow({
              loading: false,
              availableCount: result.total,
              pageCount: result.total === 0 ? 1 : Math.ceil(result.total / self.windowData.pageSize),
              uuidList,
              table
            }).then(() => {
              self.affinitygroupList = self.getData()
            })
          })
        }, (e) => {
          console.error(e);
          self.updateWindow({
            loading: false
          })
        })
      },
      getData() {
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.affinitygroup[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.affinitygroup[uuid]
          }
        )
      },
      pageDelete: function () {
        let uuidList = []
        const self = this
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'affinityGroup.delete',
            description: 'affinityGroup.info.deleteConfirm',
            uuidList: uuidList,
            icon: 'affinity_group_popupico',
            ok: () => {
              self.delete(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.affinitygroup[uuid].name;
            }
          })
        }
      },
      pageStart() {
        let uuidList = []
        this.selectedList.forEach(uuid => {
          if (this.dbData.affinitygroup[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          return this.start(uuidList).then(() => {
            return this.queryList()
          })
        }
      },
      pageStop() {
        let uuidList = []
        this.selectedList.forEach(uuid => {
          if (this.dbData.affinitygroup[uuid].state !== 'Disabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          return this.stop(uuidList).then(() => {
            return this.queryList()
          })
        }
      },
      pageAddVmToAffinityGroup: async function (fn) {
        const self = this
        let affinityGroupUuid = self.selectedList[0]
        let conditions = []
        let vmUuidList = await self.getCandidateVmForAttachingAffinityGroup(affinityGroupUuid)
        conditions.push(`uuid?=${vmUuidList}`)
        self.openDialog('VmSingleSelectListDlg', {
          conditions,
          ok: (vmUuid) => {
            self.addVmToAffinityGroup(affinityGroupUuid, vmUuid).then(() => {
              if(fn) fn(self.selectedList[0]);
              else return self.queryList()
            })
          }
        })
      },
      pageRemoveVmFromAffinityGroup: async function (fn) {
        const self = this
        let affinityGroupUuid = self.selectedList[0]
        let affinityGroup = this.dbData.affinitygroup[affinityGroupUuid]
        if (!affinityGroup) return
        let conditions = []
        let vmInAffinityGroup = await self.getVmUuidListInAffinityGroup(affinityGroupUuid)
        conditions.push(`uuid?=${vmInAffinityGroup}`)
        conditions.push('state!=Destroyed')
        self.openDialog('VmInstanceMultiSelectListDlg', {
          conditions,
          select: (vmUuidList) => {
            self.removeVmFromAffinityGroup(affinityGroupUuid, vmUuidList).then(() => {
              if(fn) fn(self.selectedList[0]);
              else return self.queryList()
            })
          }
        })
      },
      openCreateAffinityGroupDlg: function () {
        this.openFullMainWindow('CreateAffinityGroupDlg', {
          ok: (param) => {
            this.create(param).then(() => {
              return this.queryList()
            })
          }
        })
      },
      pageChangeResourceOwner: function () {
        let uuidList = this.selectedList
        let uuid, select
        if (uuidList.length === 1) {
          uuid = this.dbData.affinitygroupA[uuidList[0]].accountUuid
          select = (accountUuids) => {
            return this.changeResourceOwner(uuidList, accountUuids)
          }
        } else {
          let firstResourceAccountRef = this.dbData.affinitygroupA[uuidList[0]].accountUuid
          let hasSameAccount = uuidList.every(uuid => this.dbData.affinitygroupA[uuid].accountUuid === firstResourceAccountRef)
          uuid = hasSameAccount ? firstResourceAccountRef : ''
          select = (accountUuids) => {
            let list = []
            uuidList.forEach((item) => {
              if (this.dbData.affinitygroupA[item].accountUuid !== accountUuids[0]) list.push(item)
            })
            if (list.length === 0) return
            return this.changeResourceOwner(list, accountUuids[0])
          }
        }
        this.openDialog('AccountListDlg', {
          uuid,
          select
        })
      },
      inStates () {
        let self = this, states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every( (uuid) => {
          return states.some( (state) => {
            return self.dbData.affinitygroup[uuid].state === state;
          })
        })
        return instate;
      },
      ...Utils
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    }
  }
</script>
