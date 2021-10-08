<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionRawList && this.windowData.searchConditionRawList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionRawList)
        }
        return conditionList
      },
      query (uuidList) {
        const self = this
        let uuidListStr = ''
        if (_.isArray(uuidList)) {
          uuidListStr = uuidList.join(',')
        } else {
          uuidListStr = uuidList
        }

        let script = `

def tmp = query("QueryAffinityGroup uuid?=${uuidListStr}")

def affinityGroupList = tmp.result
put("affinitygroup", affinityGroupList)

def affinityGroupUuids = affinityGroupList.collect{ it.uuid }

def vmsInAffinityGroup = []
def usages = affinityGroupList.collect{ it.usages }.flatten()

usages.each{ it ->
  vmsInAffinityGroup.push(it.resourceUuid)
}

def vmUuidList = query("QueryVmInstance state!=Destroyed uuid?=" + vmsInAffinityGroup.join(",")).result.collect{ it.uuid }

def resourceAccountList = call("org.zstack.header.identity.APIGetResourceAccountMsg", '{"resourceUuids": ["' + affinityGroupUuids.join('","') + '"]}').result.inventories

def affinitygroupAList = []

put("resourceAccount", resourceAccountList)

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
          rpc.getResourceAccount(uuidList, self)
          let affinitygroupA = result.affinitygroupA
          let resourceAccount = result.resourceAccount
          affinitygroupA.forEach(item => {
            item.accountUuid = resourceAccount[item.uuid].uuid
            item.accountName = resourceAccount[item.uuid].name
          })
          delete result.resourceAccount
          return self.applyRespToDb(result, self)
        })
      },
      create: function (param) {
        const self = this
        let event = self.createEvent('affinityGroup.action.create', param.name)
        return rpc.create(`affinity-groups`, param, event).then(resp => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
      },
      getResourceOwner (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.resourceOwner[uuid].name
          if (self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName) {
            value = self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName
          }
        } catch (e) {
        }
        return value
      },
      delete (uuidList) {
        const self = this
        let event = self.createEvent('affinityGroup.action.delete', uuidList.length === 1 ? self.dbData.affinitygroup[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc._delete(`affinity-groups/${uuid}`, null, event).then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      start (uuidList) {
        const self = this
        let event = self.createEvent('affinityGroup.action.enable', uuidList.length === 1 ? self.dbData.affinitygroup[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.update('affinity-groups', uuid, {
            'changeAffinityGroupState': {
              'stateEvent': 'enable'
            }
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      stop (uuidList) {
        const self = this
        let event = self.createEvent('affinityGroup.action.disable', uuidList.length === 1 ? self.dbData.affinitygroup[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.update('affinity-groups', uuid, {
            'changeAffinityGroupState': {
              'stateEvent': 'disable'
            }
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      canRemoveVmFromAffinityGroup (uuid) {
        let affinityGroup = this.dbData.affinitygroupA[uuid]
        if (!affinityGroup) return false
        return affinityGroup.vmNums > 0
      },
      canAddVmToAffinityGroup (uuid) {
        let affinityGroup = this.dbData.affinitygroup[uuid]
        if (!affinityGroup || affinityGroup.state !== 'Enabled') return false
        return true
      },
      getCandidateVmForAttachingAffinityGroup: async function (affinityGroupUuid) {
        let excludeVms = []
        let affinityGroupResp = await rpc.query(`affinity-groups`)
        affinityGroupResp.inventories.forEach(affinityGroup => {
          excludeVms = excludeVms.concat(affinityGroup.usages.map(vm => vm.resourceUuid))
        })
        let affinityGroup = this.dbData.affinitygroup[affinityGroupUuid]
        if (!affinityGroup) return
        if (affinityGroup.policy === 'ANTIHARD') {
          let vmInAffinityUuids = affinityGroup.usages.map(vm => vm.resourceUuid)
          let runningVmInAffinityResp = await rpc.query(`vm-instances`, {q: [`uuid?=${vmInAffinityUuids}`, 'state=Running']})
          let excludeHosts = runningVmInAffinityResp.inventories.map(runningVm => runningVm.hostUuid)
          let vmOnExcludeHosts = await rpc.query(`vm-instances`, {q: [`hostUuid?=${excludeHosts}`]})
          let vmUuidsOnExcludeHosts = vmOnExcludeHosts.inventories.map(vm => vm.uuid)
          excludeVms = excludeVms.concat(vmUuidsOnExcludeHosts)
          let stoppedVmOnLocalHost = await rpc.query(`vm-instances`, {q: [`rootVolume.localStorageHostRef.hostUuid?=${excludeHosts}`, 'state=Stopped']})
          let stoppedVmUuidsOnExcludeHosts = stoppedVmOnLocalHost.inventories.map(vm => vm.uuid)
          excludeVms = excludeVms.concat(stoppedVmUuidsOnExcludeHosts)
        }
        excludeVms = _.uniq(excludeVms)
        let vmResp = await rpc.query(`vm-instances`, {q: [`uuid!?=${excludeVms}`, 'state?=Running,Stopped', 'type=UserVm', 'hypervisorType=KVM']})
        let vmList = vmResp.inventories
        let vmUuidList = vmList.map(vm => vm.uuid)
        if (vmUuidList.length === 0) return []
        if (this.dbData.common.isAdmin) {
          let affinityGroupAccountUuid = this.dbData.affinitygroupA[affinityGroupUuid].accountUuid
          let accountResp = await rpc.query(`resources/accounts`, {resourceUuids: vmUuidList})
          vmList.forEach(vm => {
            vm.accountUuid = accountResp.inventories[vm.uuid].uuid
          })
          vmList = vmList.filter(vm => vm.accountUuid === affinityGroupAccountUuid)
          vmUuidList = vmList.map(vm => vm.uuid)
        }
        return vmUuidList
      },
      addVmToAffinityGroup (uuid, vmUuid) {
        const self = this
        let event = this.createEvent('affinityGroup.action.addVmToAffinityGroup', self.dbData.affinitygroup[uuid].name)
        return rpc.create(`affinity-groups/${uuid}/vm-instances/${vmUuid}`, null, event).then(resp => {
          self.incEventSuccess(event)
          return self.updateDbRow({
            tableName: 'affinitygroup',
            id: uuid,
            data: resp.inventory
          })
        }, () => {
          self.incEventFail(event)
        })
      },
      getVmUuidListInAffinityGroup: function (affinityGroupUuid) {
        let affinityGroup = this.dbData.affinitygroup[affinityGroupUuid]
        if (!affinityGroup) return
        let vmInAffinity = affinityGroup.usages.map(vm => vm.resourceUuid)
        return vmInAffinity
      },
      removeVmFromAffinityGroup (uuid, vmUuidList) {
        const self = this
        let event = this.createEvent('affinityGroup.action.removeVmFromAffinityGroup', vmUuidList.length === 1 ? self.dbData.affinitygroup[uuid].name : '', vmUuidList.length)
        let tasks = []
        let p = null
        vmUuidList.forEach(vmUuid => {
          p = rpc._delete(`affinity-groups/${uuid}/vm-instances`, {
            uuid: vmUuid
          }, event).then(resp => {
            self.incEventSuccess(event)
            return self.updateDbRow({
              tableName: 'affinitygroup',
              id: uuid,
              data: resp.inventory
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      changeResourceOwner: async function (uuidListParam, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(uuidListParam, accountUuid)
        let event = this.createEvent('affinityGroup.action.changeOwner', this.dbData.affinitygroup[uuidList[0]] ? this.dbData.affinitygroup[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
              return self.query(uuid)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks).then(() => self.$forceUpdate())
      },
      changeResourceToAccountOrProject: async function (resourceUuidList, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(resourceUuidList, accountUuid)
        let event = this.createEvent('affinityGroup.action.changeOwner', this.dbData.affinitygroup[uuidList[0]] ? this.dbData.affinitygroup[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      refresh: function (uuid) {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          this.queryList();
        })
      },
      ...Utils
    }
  }
</script>

