<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  /* global localStorage:false */

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zone.uuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`type=VxlanNetworkPool`)
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
        this.updateCount()
        // if (this.windowData.conditions === undefined) this.windowData.conditions = []
        let actionPath = 'l2-networks'
        if (!this.dbData.common.isAdmin) {
          actionPath = 'l2-networks/vxlan'
        }
        let resp = await rpc.query(actionPath, {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        })
        this.windowData.loading = false;
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        rpc.getResourceAccount(uuidList, this)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })

        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'l2network',
          list: resp.inventories
        }).then(() => {
          let tasks = []
          const self = this

          if (!self.dbData.common.isAdmin) {
            resp.inventories.forEach(function (item) {
              ((item) => {
                let p = rpc.query('accounts/resources/refs', {
                  q: `resourceUuid=${item.uuid}`
                }).then((resp) => {
                  if (resp.inventories.length === 0) return
                  item.accountUuid = resp.inventories[0].accountUuid
                  self.updateDbRow({
                    tableName: 'l2network',
                    id: item.uuid,
                    data: item
                  })
                })
                tasks.push(p)
              })(item)
            })

          }
          if (this.dbData.common.isAdmin) {
            resp.inventories.forEach(function (item) {
              ((item) => {
                let p = self.isShareToAll(item.uuid)
                  .then((toPublic) => {
                    item.toPublic = toPublic
                    return rpc.query('accounts/resources/refs', {
                      q: `resourceUuid=${item.uuid}`
                    }).then((resp) => {
                      if (resp.inventories.length === 0) return
                      item.accountUuid = resp.inventories[0].accountUuid
                      return rpc.queryResourceNames(self, 'account', [item.accountUuid])
                    })
                      .then((resp) => {
                        if (!resp || resp.inventories.length === 0) return
                        return self.updateDbRow({
                          tableName: 'account',
                          id: resp.inventories[0].uuid,
                          data: resp.inventories[0]
                        })
                      })
                      .then(() => {
                        return self.updateDbRow({
                          tableName: 'l2network',
                          id: item.uuid,
                          data: item
                        })
                      })
                  })

                tasks.push(p)
              })(item)
            })

          }
          return Promise.all(tasks)
        })

      },
      getResourceOwner: function (uuid) {
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
      setVxlanPoolSystemTags: function (list, uuid, param) {
        return this.setVxlanPoolSystemTags(list, uuid, param, this)
      },
      isShareToAll: function (uuid) {
        return rpc.query('accounts/resources', {
          q: `resourceUuid=${uuid}`
        })
          .then((resp) => {
            let toPublic = false
            resp.inventories.forEach((item) => {
              if (item.toPublic) toPublic = true
            })
            return toPublic
          })
      },
      getL2NetworkAttachableCluster: async function (uuid) {
        let clusterUuidList = []
        let l2network = _.cloneDeep(this.dbData.l2network[uuid])
        let conditions = []
        conditions.push(`type=${l2network.type}`)
        if (l2network.type === 'L2NoVlanNetwork') {
          conditions.push(`physicalInterface=${l2network.physicalInterface}`)
        }
        if (l2network.type === 'L2VlanNetwork') {
          conditions.push(`physicalInterface=${l2network.physicalInterface}`)
          conditions.push(`vlan=${l2network.vlan}`)
        }
        let resp = await rpc.query('l2-networks', { q: conditions })
        resp.inventories.forEach((item) => {
          item.attachedClusterUuids.forEach((uuid) => {
            clusterUuidList.push(uuid)
          })
        })
        return clusterUuidList
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('l2network.action.delete', uuidList.length === 1 ? self.dbData.l2network[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            console.log(rpc)
            p = rpc._delete(`l2-networks/${uuid}`, null, event)
              .then((resp) => {

                self.incEventSuccess(event)
                self.updateCount()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      attach: function (uuid, clusterList) {
        const self = this
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterList[0]] && self.dbData.cluster[clusterList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, clusterList.length)
        let tasks = []
        let p = null
        clusterList.forEach(function (cluster) {
          ((cluster) => {
            p = rpc.create(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(cluster)
        })
        return Promise.all(tasks)
      },
      detach: function (uuid, clusterList) {
        const self = this
        let i18nContext = 'l2network.action.detach'
        if (self.dbData.cluster[clusterList[0]] && self.dbData.cluster[clusterList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.detachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, clusterList.length)
        let tasks = []
        let p = null
        clusterList.forEach(function (cluster) {
          ((cluster) => {
            p = rpc._delete(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(cluster)
        })
        return Promise.all(tasks)
      },
      detailAttach: async function (uuid) {
        const self = this
        let clusterUuidList = []
        clusterUuidList = await self.getL2NetworkAttachableCluster(uuid)
        let conditions = [`uuid!?=${clusterUuidList}`]
        let dlg = 'ClusterSelectListDlg'
        if (self.getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
          dlg = 'KVMClusterAndBaremetalClusterSelectListDlg'
        } else {
          conditions.push('hypervisorType=KVM')
        }
        await self.openDialog(dlg, {
          conditions: conditions,
          type: 'selection',
          select: (clusterList) => {
            self.attach(uuid, clusterList)
          }
        })
        // self.openInplaceDialog('ClusterSelectListDlg', ['attach', `l2Network.uuid=${uuid}`], )
      },
      //绑定集群
      detailDetach: function (uuid) {
        const self = this
        let conditions = [`l2Network.uuid=${uuid}`]
        let dlg = 'ClusterSelectListDlg'
        if (self.getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
          dlg = 'BaremetalClusterListMultiSelectList'
        } else {
          conditions.push('hypervisorType=KVM')
        }
        self.openDialog(dlg,
          {
            conditions: conditions,
            noAssistant: true,
            type: 'selection',
            showTab: true,
            select: (clusterList) => {
              let isBaretalCluser = false;
              if (clusterList.length > 0) {
                isBaretalCluser = false
                if (self.dbData.cluster[clusterList[0]] && self.dbData.cluster[clusterList[0]].hypervisorType === 'baremetal') {
                  isBaretalCluser = true
                }
                this.openDialog('ConfirmDlg', {
                  title: isBaretalCluser ? 'common.detachBaremetalCluster' : 'common.detachCluster',
                  description: isBaretalCluser ? "baremetalCluster.detachCluser" : 'cluster.detachCluser',
                  icon: 'cluster_popupico',
                  uuidList:clusterList,
                  ok: () => {
                    self.detach(uuid, clusterList).then(() => {
                      self.query()
                    })
                  },
                  warning: 'cluster.warning.detachWarning',
                  getName: (uuid) => {
                    return this.dbData.cluster[uuid].name;
                  }
                })
                  .then(() => {
                  })
              }
            }
          }
        )
      },
      getL2NetworkName: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.l2network[uuid].name
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getL2NetworkName-${uuid}`)) return 0
          rpc.query(`l2-networks/${uuid}`)
            .then((resp) => {
              if (resp.inventories.length > 0) {
                return self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: resp.inventories[0]
                })
              } else {
                return ''
              }
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      pageDelete: function () {
        let uuidList = this.selectedList
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'l2network.deleteVxlanPoolNetwork',
            description: 'l2network.info.deleteVxlanPoolConfirm',
            uuidList: uuidList,
            icon: 'vxlanpool_n',
            warning:'l2network.info.deleteVxlanPoolConfirmWarning',
            ok: () => {
              self.delete(uuidList)
                .then(() => {
                  self.queryList()
                })
            },
            getName: (uuid) => {
              return self.dbData.l2network[uuid].name;
            }
          })

        }
      },
      pageEnable: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.enable(uuidList)
      },
      pageDisable: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.disable(uuidList)
      },
      pageReconnect: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.reconnect(uuidList)
      },
      openCreateL2Network: function () {
        this.$router.push('createvxlanpool');
        //this.openFullMainWindow('CreateVXLANPoolNetworkDlg', { ok: (param) => this.create(param, this.init) })
      },
      updateCount: function () {
        if (this.dbData.common.isAdmin) {
          rpc.query('l2-networks', {
            replyWithCount: true,
            q: this.getCondition()
            // q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`]
          })
            .then((resp) => {
              this.updateWindow({
                availableCount: resp.total
              })
            })
        } else {
          rpc.query('accounts/resources/refs', {
            q: ['concreteResourceType=org.zstack.network.l2.vxlan.vxlanNetwork.VxlanNetworkVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              let myL2NetworkUuidList = resp.inventories.map((item) => item.resourceUuid)

              rpc.query('l2-networks/vxlan', {
                replyWithCount: true,
                q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`, `uuid?=${myL2NetworkUuidList.join(',')}`]
              })
                .then((resp) => {
                  this.updateWindow({
                    mineCount: resp.total
                  })
                })
              rpc.query('l2-networks/vxlan', {
                replyWithCount: true,
                q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`, `uuid!?=${myL2NetworkUuidList.join(',')}`]
              })
                .then((resp) => {
                  this.updateWindow({
                    shareCount: resp.total
                  })
                })
            })
        }
      },
      toggleToPublic: function (uuidList) {
        if (Array.isArray(uuidList) && uuidList.length === 0) return
        let self = this
        uuidList.forEach((uuid) => {
          let data = _.cloneDeep(this.dbData.l2network[uuid])
          if (data.toPublic !== undefined) data.toPublic = !data.toPublic
          self.updateDbRow({
            tableName: 'l2network',
            id: uuid,
            data: data
          })
        })
      },
      canSharedToAll: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return false
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          if (['VxlanNetwork', 'VxlanNetworkPool'].indexOf(self.dbData.l2network[self.selectedList[i]].type) === -1 || self.dbData.l2network[self.selectedList[i]].toPublic) {
            return false
          }
        }
        return true
      },
      canRecallFromAll: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return false
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          if (['VxlanNetwork', 'VxlanNetworkPool'].indexOf(self.dbData.l2network[self.selectedList[i]].type) === -1 || !self.dbData.l2network[self.selectedList[i]].toPublic) {
            return false
          }
        }
        return true
      },
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('l2network.action.recallFromAll', uuidList.length === 1 ? this.dbData.l2network[uuidList[0]].name : '')
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': uuidList,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            this.toggleToPublic(uuidList)
          }, () => {
            self.incEventFail(event)
          })
      },
      shareL2NetworkToAll: function (resourceUuidList) {
        let event = this.createEvent('l2network.action.shareToAll', resourceUuidList.length === 1 ? this.dbData.l2network[resourceUuidList[0]].name : '')
        return rpc.update('accounts', 'resources', {
          'shareResource': {
            'resourceUuids': resourceUuidList,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            this.toggleToPublic(resourceUuidList)
          }, () => {
            this.incEventFail(event)
          })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      create: async function (param, fn) {
        let self=this;
        let event = self.createEvent('l2network.action.create', param.name)
        let resp
        try {
          resp = await rpc.create(`l2-networks/${param.type}`, param, event)
        } catch (e) {
          self.incEventFail(event)
          return false
        }
        self.incEventSuccess(event)
        if (param.type === 'vxlan-pool') {
          let vnievent = self.createEvent('l2network.action.addVniRange', param.name)
          try {
            await rpc.create(`l2-networks/vxlan-pool/${resp.inventory.uuid}/vni-ranges`, {
              name: param.name,
              description: param.description !== '' ? param.description : undefined,
              startVni: param.startVni,
              endVni: param.endVni
            }, vnievent)
          } catch (e) {
            self.incEventFail(vnievent)
          }
          self.incEventSuccess(vnievent)
        }
        let systemTags = []
        self.setVxlanPoolSystemTags(systemTags, resp.inventory.uuid, param)
        // if (param.type === 'vxlan-pool' && param.clusterUuid !== '' && param.type !== 'vxlan') {
        //   systemTags.push(`l2NetworkUuid::${resp.inventory.uuid}::clusterUuid::${param.clusterUuid}::cidr::{${param.cidr}}`)
        // }
        if (param.clusterUuid !== undefined && param.clusterUuid !== '' && param.clusterUuid !== null && param.type !== 'vxlan') {
          let i18nContext = 'l2network.action.attach'
          if (self.dbData.cluster[param.clusterUuid] && self.dbData.cluster[param.clusterUuid].hypervisorType === 'baremetal') {
            i18nContext = 'l2network.action.attachBaremetalCluster'
          }
          let attachclusterevent = self.createEvent(i18nContext, param.name)
          await rpc.post(`l2-networks/${resp.inventory.uuid}/clusters/${param.clusterUuid}`, {
            systemTags: systemTags
          }, attachclusterevent)
            .then((resp) => {
              self.incEventSuccess(attachclusterevent)
            }, () => {
              self.incEventFail(attachclusterevent)
            })
        }
        if (self.windowData.uuidList && self.queryList) {
          await self.queryList()
        }
        if (fn) await fn()
        return true
      },
      setVxlanPoolSystemTags: function (list, uuid, param, self) {
        if (param.type === 'vxlan-pool' && param.clusterUuid !== '' && param.clusterUuid !== undefined && param.type !== 'vxlan' && uuid !== undefined && param.cidr !== '' && param.cidr !== undefined) {
          list.push(`l2NetworkUuid::${uuid}::clusterUuid::${param.clusterUuid}::cidr::{${param.cidr}}`)
        }
        return list
      },
      ...Utils
    }
  }
</script>
