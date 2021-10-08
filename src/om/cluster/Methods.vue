<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  let justUpdateResource = false
  /* global localStorage:false */

  export default {
    methods: {
      getCondition: function () {
        const self = this
        let conditionList = []
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      query (clusterUuidList) {
        const self = this
        let uuidListStr = ''
        if (_.isArray(clusterUuidList)) {
          uuidListStr = clusterUuidList.join(',')
        } else {
          uuidListStr = clusterUuidList
        }
        let script = `

def tmp = query("QueryCluster uuid?=${uuidListStr}")
def clusterList = tmp.result
put("cluster", clusterList)

tmp = query("QueryZone cluster.uuid?=${uuidListStr}")
def zoneList = tmp.result
put("zone", zoneList)

def clusterUuidList = clusterList.collect{ it.uuid }

def clusterAList = []

def HostList = query("QueryHost clusterUuid?=" + clusterUuidList.join(",")).result
def PrimaryStorageList = query("QueryPrimaryStorage cluster.uuid?=" + clusterUuidList.join(",")).result
def L2NetworkList = query("QueryL2Network cluster.uuid?=" + clusterUuidList.join(",")).result
def VmInstanceList = query("QueryVmInstance clusterUuid?=" + clusterUuidList.join(",")).result

clusterUuidList.each {uuid ->
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

  tmp["totalVm"] = query("QueryVmInstance limit=100000 count=true clusterUuid=" + uuid).total
  tmp["runningVm"] = query("QueryVmInstance limit=100000 count=true state=Running clusterUuid=" + uuid).total
  tmp["destroyedVm"] = query("QueryVmInstance limit=100000 count=true state=Destroyed clusterUuid=" + uuid).total
  tmp["stoppedVm"] = query("QueryVmInstance limit=100000 count=true state=Stopped clusterUuid=" + uuid).total
  clusterAList.push(tmp)

}
put("clusterA", clusterAList)
`
        if (self.dbData.common.isAdmin && !self.dbData.common.isOpensource) {
          script += `
          def systemTagList = query("QuerySystemTag resourceType=ClusterVO resourceUuid?=" + clusterUuidList.join(",")).result
          put("systemTag", systemTagList)
        `
        }
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let result = resp.result
          let clusterUuidList = result.cluster.map(it => it.uuid)
          if (self.dbData.common.isAdmin && !self.dbData.common.isOpensource) {
            clusterUuidList.forEach(uuid => {
              let index = _.findIndex(result.clusterA, (it) => { return it.uuid === uuid })
              result.systemTag.forEach(tag => {
                if (tag.resourceUuid === uuid) {
                  let index = _.findIndex(result.clusterA, (it) => { return it.uuid === uuid })
                  if (tag.tag.indexOf('clusterKVMCpuModel') > -1) {
                    result.clusterA[index].clusterKVMCpuModel = tag.tag.split('::')[1]
                  } else if (tag.tag.indexOf('display::network::cidr::') > -1) {
                    result.clusterA[index].displayNetworkCidr = tag.tag.split('::')[3]
                  } else if (tag.tag.indexOf('cluster::migrate::network::cidr::') > -1) {
                    result.clusterA[index].migrateNetworkCidr = tag.tag.split('::')[4]
                  } else if (tag.tag.indexOf('check::cluster::cpu::model::') > -1) {
                    result.clusterA[index].checkCpuModel = tag.tag.split('::')[4]
                    result.clusterA[index].checkCpuModelId = tag.uuid
                  }
                }
              })
              if (!result.clusterA[index].clusterKVMCpuModel) {
                result.clusterA[index].clusterKVMCpuModel = 'None'
              }
              if (!result.clusterA[index].checkCpuModel) {
                result.clusterA[index].checkCpuModel = 'default'
                result.clusterA[index].checkCpuModelId = ''
              }
            })
            delete result.systemTag
          }
          return self.applyRespToDb(result, self)
        })
      },
      create: function (param) {
        const self = this
        let event = self.createEvent('cluster.action.create', param.name)
        return rpc.create('clusters', param, event).then(() => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
      },
      getClusterAttachableL2Network: async function (uuid) {
        let clusterResp = await rpc.query('l2-networks', { q: `cluster.uuid=${uuid}` })

        // L2VlanNetwork
        let L2VlanNetwork = {}
        L2VlanNetwork.vlan = []
        L2VlanNetwork.physicalInterface = []

        // L2NoVlanNetwork
        let L2NoVlanNetwork = {}
        L2NoVlanNetwork.physicalInterface = []

        // VxlanNetworkPool
        let VxlanNetworkPool = {}
        VxlanNetworkPool.uuidList = []

        clusterResp.inventories.forEach((item) => {
          if (item.type === 'L2VlanNetwork') {
            L2VlanNetwork.vlan.push(item.vlan)
            L2VlanNetwork.physicalInterface.push(item.physicalInterface)
          }
          if (item.type === 'L2NoVlanNetwork') {
            L2NoVlanNetwork.physicalInterface.push(item.physicalInterface)
          }
          if (item.type === 'VxlanNetworkPool') {
            VxlanNetworkPool.uuidList.push(item.uuid)
          }
        })

        let l2networkUuidList = []
        let taskList = []
        let p

        // QueryL2Network type="L2VlanNetwork" vlan!?=1,2 physicalInterface?=eth0
        if (L2VlanNetwork.vlan.length > 0 && L2VlanNetwork.physicalInterface.length > 0) {
          p = rpc.query('l2-networks', {
            q: ['type=L2VlanNetwork', `vlan!?=${L2VlanNetwork.vlan}`, `physicalInterface?=${L2VlanNetwork.physicalInterface}`],
            fields: 'uuid'
          }).then((resp) => {
            l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)

          // QueryL2Network type="L2VlanNetwork" vlan!?=1,2 physicalInterface!?=eth0
          p = rpc.query('l2-networks', {
            q: ['type=L2VlanNetwork', `vlan!?=${L2VlanNetwork.vlan}`, `physicalInterface!?=${L2VlanNetwork.physicalInterface}`],
            fields: 'uuid'
          }).then((resp) => {
            l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)

          // QueryL2Network type="L2VlanNetwork" vlan?=1,2 physicalInterface!?=eth0
          p = rpc.query('l2-networks', {
            q: ['type=L2VlanNetwork', `vlan?=${L2VlanNetwork.vlan}`, `physicalInterface!?=${L2VlanNetwork.physicalInterface}`],
            fields: 'uuid'
          }).then((resp) => {
            l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
        } else {
          // QueryL2Network type="L2VlanNetwork"
          p = rpc.query('l2-networks', {
            q: 'type=L2VlanNetwork',
            fields: 'uuid'
          }).then((resp) => {
            l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
        }

        // QueryL2Network type="L2NoVlanNetwork" physicalInterface!?=eth0
        if (L2NoVlanNetwork.physicalInterface.length > 0) {
          p = rpc.query('l2-networks', {
            q: ['type=L2NoVlanNetwork', `physicalInterface!?=${L2NoVlanNetwork.physicalInterface}`],
            fields: 'uuid'
          }).then((resp) => {
            l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
        } else {
          // QueryL2Network type="L2NoVlanNetwork"
          p = rpc.query('l2-networks', {
            q: 'type=L2NoVlanNetwork',
            fields: 'uuid'
          }).then((resp) => {
            l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
        }

        // QueryL2Network uuid!?=uuidList type=VxlanNetworkPool
        p = rpc.query('l2-networks', {
          q: ['type=VxlanNetworkPool', `uuid!?=${VxlanNetworkPool.uuidList}`],
          fields: 'uuid'
        }).then((resp) => {
          l2networkUuidList = l2networkUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)
        return Promise.all(taskList).then(() => {
          l2networkUuidList = _.uniq(l2networkUuidList)
          // console.log(l2networkUuidList)
          return l2networkUuidList
        })
      },
      delete: function (uuidList) {
        const self = this
        let i18nContext = 'cluster.action.delete'
        if (uuidList.length > 0 && self.dbData.cluster[uuidList[0]] && self.dbData.cluster[uuidList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'baremetalCluster.action.delete'
        }
        let event = self.createEvent(i18nContext, uuidList.length === 1 ? self.dbData.cluster[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc._delete(`clusters/${uuid}`, null, event)
            .then(() => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      enable: function (uuidList) {
        const self = this
        let i18nContext = 'cluster.action.enable'
        if (uuidList.length > 0 && self.dbData.cluster[uuidList[0]] && self.dbData.cluster[uuidList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'baremetalCluster.action.enable'
        }
        let event = self.createEvent(i18nContext, uuidList.length === 1 ? self.dbData.cluster[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.update('clusters', uuid, {
            'changeClusterState': {
              'stateEvent': 'enable'
            }
          }, event).then((resp) => {
            self.updateDbRow({
              tableName: 'cluster',
              id: uuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      updateClusterCpuModel (uuid, tag) {
        const self = this
        let event = self.createEvent('cluster.updateCpuModel')
        return rpc.query('system-tags', {
          q: [`resourceUuid=${uuid}`, 'resourceType=ClusterVO', `tag~=clusterKVMCpuModel::%25`],
          fields: 'uuid'
        }).then(resp => {
          let task = null
          if (resp.inventories.length === 0 && tag !== 'None') {
            task = rpc.create('system-tags', {
              resourceType: 'ClusterVO',
              resourceUuid: uuid,
              tag: `clusterKVMCpuModel::${tag}`
            }, event)
          } else {
            if (tag === 'None') {
              task = rpc._delete(`tags/${resp.inventories[0].uuid}`, null, event)
            } else {
              task = rpc.update('system-tags', `${resp.inventories[0].uuid}`, {
                updateSystemTag: {
                  tag: `clusterKVMCpuModel::${tag}`
                }
              }, event)
            }
          }
          return task.then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        })
      },
      updateVdiDisplayNetworkCidr: function (uuidList, cidr) {
        if (justUpdateResource) return
        justUpdateResource = true
        setTimeout(() => {
          justUpdateResource = false
        }, 100)
        const self = this
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          if (self.dbData.clusterA[uuid].displayNetworkCidr === cidr) return
          p = rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=ClusterVO', `tag~=display::network::cidr::%25`],
            fields: 'uuid'
          }).then(resp => {
            let event = self.createEvent('common.updateVdiDisplayNetworkCidr', uuidList.length)
            let task = null
            if (resp.inventories.length === 0) {
              task = rpc.create('system-tags', {
                resourceType: 'ClusterVO',
                resourceUuid: uuid,
                tag: `display::network::cidr::${cidr}`
              }, event)
            } else {
              if (cidr === '') {
                task = rpc._delete(`tags/${resp.inventories[0].uuid}`, null, event)
              } else {
                task = rpc.update('system-tags', `${resp.inventories[0].uuid}`, {
                  updateSystemTag: {
                    tag: `display::network::cidr::${cidr}`
                  }
                }, event)
              }
            }
            return task.then(() => {
              self.incEventSuccess(event)
              let cluster = _.cloneDeep(self.dbData.clusterA[uuid])
              cluster.displayNetworkCidr = cidr
              return self.updateDbRow({
                tableName: 'clusterA',
                id: uuid,
                data: cluster
              })
            }, () => {
              self.incEventFail(event)
            })
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      updateMigrateNetworkCidr: function (uuidList, cidr) {
        if (justUpdateResource) return
        justUpdateResource = true
        setTimeout(() => {
          justUpdateResource = false
        }, 100)
        const self = this
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          if (self.dbData.clusterA[uuid].migrateNetworkCidr === cidr) return
          p = rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=ClusterVO', `tag~=cluster::migrate::network::cidr::%25`],
            fields: 'uuid'
          }).then(resp => {
            let event = self.createEvent('common.updateMigrateNetworkCidr', uuidList.length)
            let task = null
            if (resp.inventories.length === 0) {
              task = rpc.create('system-tags', {
                resourceType: 'ClusterVO',
                resourceUuid: uuid,
                tag: `cluster::migrate::network::cidr::${cidr}`
              }, event)
            } else {
              if (cidr === '') {
                task = rpc._delete(`tags/${resp.inventories[0].uuid}`, null, event)
              } else {
                task = rpc.update('system-tags', `${resp.inventories[0].uuid}`, {
                  updateSystemTag: {
                    tag: `cluster::migrate::network::cidr::${cidr}`
                  }
                }, event)
              }
            }
            return task.then(() => {
              self.incEventSuccess(event)
              let cluster = _.cloneDeep(self.dbData.clusterA[uuid])
              cluster.migrateNetworkCidr = cidr
              return self.updateDbRow({
                tableName: 'clusterA',
                id: uuid,
                data: cluster
              })
            }, () => {
              self.incEventFail(event)
            })
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      disable: function (uuidList) {
        const self = this
        let i18nContext = 'cluster.action.disable'
        if (uuidList.length > 0 && self.dbData.cluster[uuidList[0]] && self.dbData.cluster[uuidList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'baremetalCluster.action.disable'
        }
        let event = self.createEvent(i18nContext, uuidList.length === 1 ? self.dbData.cluster[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.update('clusters', uuid, {
            'changeClusterState': {
              'stateEvent': 'disable'
            }
          }, event)
            .then(resp => {
              self.updateDbRow({
                tableName: 'cluster',
                id: uuid,
                data: resp.inventory
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      async pageAttachl2() {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        let l2networkList = await this.getClusterAttachableL2Network(selectedUuidList[0])
        await this.openDialog('L2NetworkSingleSelectListDlg', {
          conditions: [`uuid?=${l2networkList}`, `zone.uuid=${localStorage.getItem('currZoneUuid')}`],
          ok: (l2networkList) => {
            // l2networkList.length = 1
            let l2network = _.cloneDeep(this.dbData.l2network[l2networkList])
            if (l2network.type !== 'VxlanNetworkPool') {
              this.attachl2(selectedUuidList[0], [l2networkList])
            } else {
              this.openDialog('ClusterAttachVxlanPoolInputCidrPopupDlg', {
                ok: (cidr) => this.attachVxlanNetworkPoolToCluster(l2network.uuid, selectedUuidList[0], cidr)
              })
            }
          }
        })
      },
      attachVxlanNetworkPoolToCluster (uuid, clusterUuid, cidr) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${clusterUuid}::cidr::{${cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterUuid] && self.dbData.cluster[clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        rpc.post(`l2-networks/${uuid}/clusters/${clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.queryList()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      pageDetachl2: function () {
        if (!this.isSingleSelected) return
        let uuid = this.selectedList[0]
        this.openDialog('L2NetWorkMultiSelectListDlg', {
          conditions: [`cluster.uuid=${uuid}`, 'type!=VxlanNetwork'],
          select: (l2networkList) => this.detachl2(uuid, l2networkList)
        })
      },
      pageDelete: function () {
        let uuidList = [], self = this;
        uuidList = self.windowData.selectedUuidList;
        if (uuidList.length > 0) {
          let dlg = this.dbData.cluster[uuidList[0]].hypervisorType !== 'baremetal' ? 'DeleteClusterConfirm' : 'DeleteBaremetalClusterConfirm'
          self.openDialog(dlg, {
            uuidList,
            ok: () => {
              self.delete(uuidList).then(() => {
                self.queryList()
              })
            }
          })
        }
      },
      pageEnable: function () {
        let uuidList = [], self = this;
        this.selectedList.forEach((uuid) => {
          if (self.dbData.cluster[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.enable(uuidList).then(() =>{self.queryList()})
      },
      pageDisable: function () {
        let uuidList = []
        const self = this
        this.selectedList.forEach((uuid) => {
            if (self.dbData.cluster[uuid].state !== 'Disabled') uuidList.push(uuid);
        })

        if (uuidList.length > 0) {
          let dlg = self.dbData.cluster[uuidList[0]].hypervisorType !== 'baremetal' ? 'DisableClusterConfirm' : 'DisableBaremetalClusterConfirm'
          self.openDialog(dlg, {
            uuidList,
            ok: () => {
              self.disable(uuidList)
                .then(() =>{self.queryList()})
            }
          })
        }
      },
      openCreateCluster: function (curSelectZoneUuid) {
        this.$router.push({name: "createCluster", params:{
          ZoneUuid: curSelectZoneUuid
        }});
      },
      attachl2: function (uuid, l2networkList) {
        const self = this
        let i18nContext = 'cluster.action.l2Attach'
        if (self.dbData.cluster[uuid] && self.dbData.cluster[uuid].hypervisorType === 'baremetal') {
          i18nContext = 'baremetalCluster.action.l2Attach'
        }
        let event = self.createEvent(i18nContext, self.dbData.cluster[uuid].name)
        let tasks = []
        let p = null
        l2networkList.forEach(l2networkUuid => {
          p = rpc.create(`l2-networks/${l2networkUuid}/clusters/${uuid}`, null, event)
            .then((resp) => {
              let cluster = _.cloneDeep(self.dbData.clusterA[uuid])
              cluster.isAttachL2network = true
              self.updateDbRow({
                tableName: 'clusterA',
                id: uuid,
                data: cluster
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      detachl2: function (uuid, l2networkList) {
        const self = this
        let i18nContext = 'cluster.action.l2Detach'
        if (self.dbData.cluster[uuid] && self.dbData.cluster[uuid].hypervisorType === 'baremetal') {
          i18nContext = 'baremetalCluster.action.l2Detach'
        }
        let event = self.createEvent(i18nContext, l2networkList.length === 1 ? self.dbData.cluster[uuid].name : '', l2networkList.length)
        let tasks = []
        let p = null
        l2networkList.forEach(l2networkUuid => {
          p = rpc._delete(`l2-networks/${l2networkUuid}/clusters/${uuid}`, null, event)
            .then((resp) => {
              rpc.query('l2-networks', {
                q: `cluster.uuid=${uuid}`,
                fields: 'uuid'
              }).then((result) => {
                if (result.inventories.length <= 0) {
                  let cluster = _.cloneDeep(self.dbData.clusterA[uuid])
                  cluster.isAttachL2network = false
                  self.updateDbRow({
                    tableName: 'clusterA',
                    id: uuid,
                    data: cluster
                  })
                }
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      attachPrimaryStorage: function (uuid, primaryStorageUuidList) {
        const self = this
        let event = self.createEvent('cluster.action.ps2Attach', self.dbData.cluster[uuid].name)
        if (primaryStorageUuidList.length > 0) {
          let task = primaryStorageUuidList.map(primarystorageuuid => {
            return rpc.create(`clusters/${uuid}/primary-storage/${primarystorageuuid}`, null, event)
          })
          return Promise.all([...task])
            .then(() => {
              self.refreshisAttachPs(uuid)
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
        }
      },
      detachPrimaryStorage: function (uuid, primarystorageUuidList) {
        const self = this
        let event = self.createEvent('cluster.action.ps2Detach', self.dbData.cluster[uuid].name)
        if (primarystorageUuidList.length > 0) {
          let task = primarystorageUuidList.map((primarystorageuuid) => {
            return rpc._delete(`clusters/${uuid}/primary-storage/${primarystorageuuid}`, null, event)
          })
          return Promise.all([...task])
            .then(() => {
              self.refreshisAttachPs(uuid)
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
        }
      },
      detailEnable: function (uuid) {
        rpc.update('clusters', uuid, {
          'changeClusterState': {
            'stateEvent': 'enable'
          }
        })
          .then((resp) => {
            this.updateDbRow({
              tableName: 'cluster',
              id: uuid,
              data: resp.inventory
            })
          })
      },
      detailAttachPrimaryStorage: function (uuid) {
        this.detailOpenInplaceDialog('PsSingleListForCluster', [`attachedClusterUuids!?=${uuid}`], (primarystorageuuidUuidList) => this.attachPrimaryStorage(uuid, primarystorageuuidUuidList))
      },
      detailDetachPrimaryStorage: function (uuid) {
        this.openSideWindow('PsSingleListForCluster', {
          data: [`attachedClusterUuids?=${uuid}`],
          select: (primarystorageuuidUuidList) => {
            this.openDialog('DetachPSConfirmDlg', {
              uuidList: primarystorageuuidUuidList,
              ok: () => {
                this.detachPrimaryStorage(uuid, primarystorageuuidUuidList)
              }
            })
          }
        })
      },
      detailDelete: function (uuid) {
        let uuidList = []
        uuidList.push(uuid)
        let self = this
        if (uuidList.length > 0) {
          let dlg = self.dbData.cluster[uuidList[0]].hypervisorType !== 'baremetal' ? 'DeleteClusterConfirm' : 'DeleteBaremetalClusterConfirm'
          this.openDialog(dlg, {
            uuidList,
            ok: () => {
              self.delete(uuidList)
            }
          })
        }
      },
      detailStart: function (uuid) {
        let uuidList = []
        uuidList.push(uuid)
        this.enable(uuidList)
      },
      detailStop: function (uuid) {
        let uuidList = []
        uuidList.push(uuid)
        let self = this
        if (uuidList.length > 0) {
          let dlg = self.dbData.cluster[uuidList[0]].hypervisorType !== 'baremetal' ? 'DisableClusterConfirm' : 'DisableBaremetalClusterConfirm'
          this.openDialog(dlg, {
            uuidList,
            ok: () => {
              self.disable(uuidList)
            }
          })
        }
      },
      canAttachPrimaryStorage: function (uuid) {
        const self = this
        if (self.dbData.cluster[uuid] && self.dbData.cluster[uuid].hypervisorType === 'baremetal') return false
        if (self.dbData.common.isOpensource) return true
        let cluster = self.dbData.clusterA[uuid]
        if (!cluster) return false
        if (!cluster.isAttachPrimaryStorage) return true
        let attachedPsTypes = cluster.psTypes
        if (_.includes(['Ceph', 'Fusionstor', 'AliyunNAS'], attachedPsTypes[0])) return false
        if (_.isEqual(attachedPsTypes, ['LocalStorage', 'NFS'].sort())) return false
        if (_.isEqual(attachedPsTypes, ['LocalStorage', 'SharedMountPoint'].sort())) return false
        if (_.isEqual(attachedPsTypes, ['LocalStorage', 'SharedBlock'].sort())) return false
        return true
      },
      canDetachPrimaryStorage: function (uuid) {
        const self = this
        if (self.dbData.cluster[uuid] && self.dbData.cluster[uuid].hypervisorType === 'baremetal') return false
        let cluster = self.dbData.clusterA[uuid]
        return cluster && cluster.isAttachPrimaryStorage
      },
      GetisAttachL2network: function (uuid) {
        if (!uuid) return false
        let clusterA = this.dbData.clusterA[uuid]
        if (!clusterA || !clusterA.isAttachL2network) return false
        return clusterA.isAttachL2network
      },
      refreshisAttachPs: function (uuid) {
        const self = this
        return rpc.query('primary-storage', {
          q: [`cluster.uuid=${uuid}`]
        }).then(resp => {
          let data = _.cloneDeep(self.dbData.clusterA[uuid])
          if (!data) return
          data.isAttachPrimaryStorage = false
          data.psTypes = []
          if (resp.inventories.length > 0) {
            data.isAttachPrimaryStorage = true
            data.psTypes = _.uniq(resp.inventories.map(ps => ps.type)).sort()
          }
          return self.updateDbRow({
            tableName: 'clusterA',
            id: uuid,
            data: data
          })
        })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      updateCount: function () {
        rpc.query('clusters', {
          replyWithCount: true,
          q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`]
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      ...Utils
    }
  }
</script>
