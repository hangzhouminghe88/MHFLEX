<script>
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import rpc from 'src/utils/rpc'

  export default {
    methods: {
      ...Utils,
      attachCluster (uuidList, clusterUuidList) {
        let paramList = this.getParamList(uuidList, clusterUuidList, 'clusterUuid')
        return this.dispatchActionWithEvent('webStorage/attachCluster', paramList)
      },
      create (param) {
        const { clusterUuid } = param
        return this.dispatchActionWithEvent('webStorage/create', param).then(resp => {
          if (clusterUuid) {
            return this.dispatchActionWithEvent('webStorage/attachCluster', {
              clusterUuid,
              uuid: resp.inventory.uuid
            })
          } else {
            return Promise.resolve()
          }
        })
      },
      async getCandidateVmForLun (lun, hostUuid) {
        const { wwid, scsiLunVmInstanceRefs, scsiLunHostRefs } = lun
        let hostUuids = hostUuid || scsiLunHostRefs.map(v => v.hostUuid)
        let attachedVms = scsiLunVmInstanceRefs.map(v => v.vmInstanceUuid)
        let sharedBlockResp = await rpc.query('sharedblock-group/sharedblocks', { q: `diskUuid=${wwid}` })
        let isAttachedPrimaryStorage = sharedBlockResp.inventories.length > 0
        if (isAttachedPrimaryStorage) return []
        let conditions = ['type=UserVm', 'hypervisorType=KVM', `hostUuid?=${hostUuids}`, `uuid!?=${attachedVms}`, `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'state!=Destroyed']
        let vmResp = await rpc.query('vm-instances', { q: conditions })
        return vmResp.inventories.map(vm => vm.uuid)
      },
      getParamList (uuidList, OtherUuidList, OtherKey) {
        OtherUuidList = _.isArray(OtherUuidList) ? OtherUuidList : [OtherUuidList]
        let isSingle = !_.isArray(uuidList)
        let paramList = []
        if (isSingle) {
          paramList = OtherUuidList.map(OtherUuid => ({ uuid: uuidList, [OtherKey]: OtherUuid }))
        } else {
          paramList = _.flatten(uuidList.map(uuid => OtherUuidList.map(OtherUuid => ({ uuid, [OtherKey]: OtherUuid }))))
        }
        return paramList
      },
      detachCluster (uuidList, clusterUuidList) {
        let paramList = this.getParamList(uuidList, clusterUuidList, 'clusterUuid')
        return this.dispatchActionWithEvent('webStorage/detachCluster', paramList)
      },
      detachWebStorage (uuidList, clusterUuidList) {
        let firstName = _.get(this.dbData.webStorage, `${[uuidList[0]]}.name`, '')
        let event = this.createEvent('action.webStorage.detachWebStorage', firstName, uuidList.length)
        let paramList = this.getParamList(uuidList, clusterUuidList, 'clusterUuid')
        return this.dispatchActionWithEvent('webStorage/detachCluster', paramList, null, event)
      },
      attachWebStorage (uuidList, clusterUuidList) {
        let firstName = _.get(this.dbData.webStorage, `${[uuidList[0]]}.name`, '')
        let event = this.createEvent('action.webStorage.attachWebStorage', firstName, uuidList.length)
        let paramList = this.getParamList(uuidList, clusterUuidList, 'clusterUuid')
        return this.dispatchActionWithEvent('webStorage/attachCluster', paramList, null, event)
      },
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        if (this.selectVal !=='' && this.searchStr !== '') {
          conditionList.push(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      attachVm (uuidList, vmUuidList) {
        let paramList = this.getParamList(uuidList, vmUuidList, 'vmInstanceUuid')
        return this.dispatchActionWithEvent('fiberChannelLun/attachVm', paramList)
      },
      detachVm (uuidList, vmUuidList) {
        let paramList = this.getParamList(uuidList, vmUuidList, 'vmInstanceUuid')
        return this.dispatchActionWithEvent('fiberChannelLun/detachVm', paramList)
      },
      attachLunToVm (vmUuid, lunUuidList) {
        let event = this.createEvent('vm.action.attachLun', _.get(this, `dbData.vm[${vmUuid}].name`), lunUuidList.length)
        let paramList = this.getParamList(lunUuidList, [vmUuid], 'vmInstanceUuid')
        return this.dispatchActionWithEvent('fiberChannelLun/attachVm', paramList, null, event)
      },
      detachLunFromVm (vmUuid, lunUuidList) {
        let event = this.createEvent('vm.action.detachLun', _.get(this, `dbData.vm[${vmUuid}].name`), lunUuidList.length)
        let paramList = this.getParamList(lunUuidList, [vmUuid], 'vmInstanceUuid')
        return this.dispatchActionWithEvent('fiberChannelLun/detachVm', paramList, null, event)
      },
      syncDevice () {
        let zoneUuid = window.localStorage.getItem('currZoneUuid')
        let event = this.createEvent('action.fiberChannelLun.refresh')
        return this.dispatchActionWithEvent('fiberChannelLun/refresh', {zoneUuid}, null, event)
      }
    }
  }
</script>
