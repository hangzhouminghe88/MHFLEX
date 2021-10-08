<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Controller from './Controller'
  /* global localStorage:false */

  export default {
    created: function () {
    },
    watch: {
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push('type=L3VpcNetwork')
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: function () {
        if (!this.dbData.common.isAdmin) {
          this.normalAccountUpdateCount()
        }
        let params = {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        }
        return rpc.query('l3-networks', params).then((resp) => {
          let uuidList = resp.inventories.map((item) => item.uuid)
          let tasks = []
          let table = {}
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
            availableCount: resp.total
          })
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          this.updateWindow({ uuidList, table })
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
          // let p = () => {
          let p = rpc.query(`network-services/providers`, {
          }).then((resp) => {
            return this.updateDbTable({
              tableName: 'networkServiceType',
              list: resp.inventories
            })
          })
          // }
          tasks.push(p)
          p = rpc.getResourceAccount(uuidList, this)
          tasks.push(p)
          if (this.dbData.common.isAdmin) {
            let L2NetworkUuidList = _.uniq(resp.inventories.map((i) => {
              return i.l2NetworkUuid
            }))
            if (L2NetworkUuidList.length === 0) return
            p = rpc.query('l2-networks', {
              q: `uuid?=${L2NetworkUuidList.join(',')}`
            }).then((resp) => {
              return this.updateDbTable({
                tableName: 'l2network',
                list: resp.inventories
              })
            })
            tasks.push(p)
          }
          if (this.dbData.common.isAdmin) {
            // p = () => {
            let accountsUuidList = _.uniq(uuidList)
            if (accountsUuidList.length === 0) return
            p = rpc.query('accounts/resources/refs', {
              q: `resourceUuid?=${accountsUuidList.join()}`
            }).then((resp) => {
              let accountInventories = resp.inventories
              let uuidList = _.uniq(resp.inventories.map((item) => item.accountUuid))
              return rpc.query('accounts', {
                q: `uuid?=${uuidList.join()}`
              }).then((resp) => {
                accountInventories.forEach((item, index) => {
                  item.uuid = accountsUuidList[index]
                  resp.inventories.forEach((i) => {
                    if (i.uuid === item.accountUuid) {
                      item.owner = i
                    }
                  })
                })
                return this.updateDbTable({
                  tableName: 'accountRef',
                  list: accountInventories
                })
              })
            })
            tasks.push(p)
            let p = resp.inventories.map((item, index) => {
              return this.isShareToAll(item.uuid)
                .then((toPublic) => {
                  resp.inventories[index].toPublic = toPublic
                })
            })
            tasks.push(p)
          }
          let getIpAddressCapacity = (uuid) => {
            return rpc.query('ip-capacity', {
              'l3NetworkUuids': uuid
            }).then((l3resp) => {
              let l3network = _.cloneDeep(this.dbData.l3network[uuid])
              l3network.availableCapacity = l3resp.availableCapacity
              l3network.totalCapacity = l3resp.totalCapacity
              return this.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: l3network
              })
            })
          }
          let getL3NetworkDhcpIpAddress = (uuid) => {
            return rpc.query(`system-tags`, {
              q: `resourceUuid=${uuid}`
            })
              .then((dhcpipResp) => {
                let l3network = _.cloneDeep(this.dbData.l3network[uuid])
                dhcpipResp.inventories.forEach((item) => {
                  if (item.tag.indexOf('DhcpServer::') > -1) {
                    l3network.dhcpip = item.tag.split('::')[2]
                  }
                })
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              })
          }
          let getVpcVRouter = (uuid) => {
            return rpc.query('vm-instances/appliances/virtual-routers', {
              q: [`vmNics.l3Network.uuid=${uuid}`, 'applianceVmType=vpcvrouter']
            }).then((resp) => {
              if (resp.inventories.length > 0) {
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
                let l3network = _.cloneDeep(this.dbData.l3network[uuid])
                l3network.vpcVRouterUuid = resp.inventories[0].uuid
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              }
            })
          }
          let hasAttachedVm = (uuid) => {
            return rpc.query('vm-instances', {
              q: ['type=UserVm', `vmNics.l3NetworkUuid=${uuid}`]
            }).then((resp) => {
              let has = resp.inventories.length > 0
              return this.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: {
                  hasAttachedVm: has
                }
              })
            })
          }
          return Promise.all(tasks).then(() => {
            this.updateDbTable({
              tableName: 'l3network',
              list: resp.inventories
            }).then(() => {
              uuidList.forEach((item) => {
                getIpAddressCapacity(item)
                getL3NetworkDhcpIpAddress(item)
                getVpcVRouter(item)
                hasAttachedVm(item)
              })
            })
            this.updateWindow({ uuidList, table })
          })
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
      normalAccountUpdateCount: function () {
        rpc.query('accounts/resources/refs', {
          q: ['resourceType=L3NetworkVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
        })
          .then((resp) => {
            let myL3NetworkUuidList = resp.inventories.map((item) => item.resourceUuid)
            let condition = ['system=false', 'l2Network.cluster.type!=vmware', 'category=Private', 'type=L3VpcNetwork', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]

            rpc.query('l3-networks', {
              replyWithCount: true,
              q: [...condition, `uuid?=${myL3NetworkUuidList.join(',')}`]
            })
              .then((resp) => {
                this.updateWindow({
                  mineCount: resp.total
                })
              })
            rpc.query('l3-networks', {
              replyWithCount: true,
              q: [...condition, `uuid!?=${myL3NetworkUuidList.join(',')}`]
            })
              .then((resp) => {
                this.updateWindow({
                  shareCount: resp.total
                })
              })
          })
      },
      queryCurrentL3Network: function (uuid) {
        return rpc.query('l3-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              let l3network = _.cloneDeep(resp.inventories[0])
              let tasks = []
              let p = rpc.query(`system-tags`, {
                q: `resourceUuid=${uuid}`
              })
                .then((dhcpipResp) => {
                  dhcpipResp.inventories.forEach((item) => {
                    if (item.tag.indexOf('DhcpServer::') > -1) {
                      l3network.dhcpip = item.tag.split('::')[2]
                    }
                  })
                  return new Promise((resolve, reject) => {
                    resolve({})
                  })
                })
              tasks.push(p)
              p = rpc.query('vm-instances/appliances/virtual-routers', {
                q: [`vmNics.l3Network.uuid=${uuid}`, 'applianceVmType=vpcvrouter']
              }).then((resp) => {
                if (resp.inventories.length > 0) {
                  this.updateDbRow({
                    tableName: 'vm',
                    id: resp.inventories[0].uuid,
                    data: resp.inventories[0]
                  })
                  l3network.vpcVRouterUuid = resp.inventories[0].uuid
                }
                return new Promise((resolve, reject) => {
                  resolve({})
                })
              })
              tasks.push(p)
              p = rpc.query('ip-capacity', {
                'l3NetworkUuids': uuid
              }).then((l3resp) => {
                l3network.availableCapacity = l3resp.availableCapacity
                l3network.totalCapacity = l3resp.totalCapacity
                return new Promise((resolve, reject) => {
                  resolve({})
                })
              })
              tasks.push(p)
              p = this.isShareToAll(uuid)
                .then((toPublic) => {
                  l3network.toPublic = toPublic
                })
              tasks.push(p)
              return Promise.all(tasks).then(() => {
                return this.updateDbTable({
                  tableName: 'l3network',
                  list: [l3network]
                })
              })
            }
          })
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
      create: async function (param, fn) {
        let self = this;
       return Controller.create(param, self.queryList, self);
      },
      delete: function (uuidList, fn) {
        return Controller.delete(uuidList,fn, this)
      },
      destroy: function (uuid) {
        let self = this
        let event = self.createEvent('vpcNetwork.action.delete', this.dbData.l3network[uuid].name, 1)
        let tasks = []
        let p = rpc._delete(`l3-networks/${uuid}`, null, event)
          .then(() => {
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
        tasks.push(p)
        return Promise.all(tasks)
      },
      addDnsToL3Network: function (l3NetworkUuid, dns) {
        let event = this.createEvent('vpcNetwork.action.addDns', this.dbData.l3network[l3NetworkUuid].name)
        return rpc.create(`l3-networks/${l3NetworkUuid}/dns`, {
          'dns': dns
        }, event).then((resp) => {
          this.updateDbRow({
            tableName: 'l3network',
            id: l3NetworkUuid,
            data: resp.inventory
          })
          this.incEventSuccess(event)
        }, () => this.incEventFail(event))
      },
      removeDnsFromL3Network: function (l3NetworkUuid, dnsList, fn) {
        // const self = this
        let event = this.createEvent('vpcNetwork.action.deleteDns', this.dbData.l3network[this.selectedList[0]].name)
        let self = this
        dnsList.forEach(function (dns) {
          ((dns) => {
            rpc._delete(`l3-networks/${l3NetworkUuid}/dns/${dns}`)
              .then((resp) => {
                console.log(resp.inventory)
                if (fn) fn()
                // let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                // let newTable = _.cloneDeep(self.windowData.table)
                // delete newTable[uuid]
                // self.updateWindow({
                //   uuidList: newUuidList,
                //   table: newTable
                // })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(dns)
        })
      },
      getIpAddressCapacity: function (uuid) {
        return rpc.query('l3-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              return rpc.query('ip-capacity', {
                'l3NetworkUuids': uuid
              }).then((l3resp) => {
                let l3network = _.cloneDeep(resp.inventories[0])
                l3network.availableCapacity = l3resp.availableCapacity
                l3network.totalCapacity = l3resp.totalCapacity
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              })
            }
          })
      },
      addIpRangeByNetworkCidr: function (l3NetworkUuid, params, event) {
        // let event = this.createEvent('l3network.action.addIpRange', this.dbData.l3network[l3NetworkUuid].name)
        return rpc.create(`l3-networks/${l3NetworkUuid}/ip-ranges/by-cidr`, {
          'name': this.dbData.l3network[l3NetworkUuid].name,
          'networkCidr': params.networkCidr
        }, event).then((resp) => {
          // this.queryList()
          this.getIpAddressCapacity(l3NetworkUuid)
          this.incEventSuccess(event)
        }, () => this.incEventFail(event))
      },
      addIpRange: function (l3NetworkUuid, params) {
        let event = this.createEvent('vpcNetwork.action.addIpRange', this.dbData.l3network[l3NetworkUuid].name)
        if (!params.showMethod) {
          rpc.create(`l3-networks/${l3NetworkUuid}/ip-ranges`, {
            'name': this.dbData.l3network[l3NetworkUuid].name,
            'startIp': params.startIp,
            'endIp': params.endIp,
            'netmask': params.netmask,
            'gateway': params.gateway
          }, event).then((resp) => {
            this.queryList()
            this.incEventSuccess(event)
          }, () => this.incEventFail(event))
        } else {
          this.addIpRangeByNetworkCidr(l3NetworkUuid, params, event)
        }
      },
      deleteIpRange: function (ipRangeUuidList, fn) {
        // const self = this
        let event = this.createEvent('vpcNetwork.action.deleteIpRange', this.dbData.l3network[this.selectedList[0]].name)
        let self = this
        ipRangeUuidList.forEach(function (uuid) {
          ((uuid) => {
            console.log(rpc)
            rpc._delete(`l3-networks/ip-ranges/${uuid}`)
              .then((resp) => {
                if (fn) fn()
                // let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                // let newTable = _.cloneDeep(self.windowData.table)
                // delete newTable[uuid]
                // self.updateWindow({
                //   uuidList: newUuidList,
                //   table: newTable
                // })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(uuid)
        })
      },
      attachNetworkServiceToL3Network: function (l3NetworkUuid, services) {
        rpc.create(`l3-networks/${l3NetworkUuid}/network-services`, {
          'networkServices': {
            l3NetworkUuid: services
          }
        }).then((resp) => {
          console.log(resp)
        })
      },
      detachNetworkServiceFromL3Network: function (l3NetworkUuid, services) {
        rpc._delete(`l3-networks/${l3NetworkUuid}/network-services`, {
          'networkServices': {
            l3NetworkUuid: services
          }
        }).then((resp) => {
          console.log(resp)
        })
      },
      getNetworkServiceTypeName: function (l3network) {
        const self = this
        if (l3network.networkServices.length === 0) return false
        let networkServices = l3network.networkServices.filter((item) => item.networkServiceType !== 'SecurityGroup')
        if (networkServices.length === 0) return false
        // let networkServiceProviderUuid = networkServices[0].networkServiceProviderUuid
        let networkServiceProviderUuid = null
        let flag = false // true = vrouter
        let type = ''
        networkServices.forEach(function (item) {
          ((item) => {
            // if (item.networkServiceType === 'Eip') networkServiceProviderUuid = item.networkServiceProviderUuid
            networkServiceProviderUuid = item.networkServiceProviderUuid
            if (self.dbData.networkServiceType[networkServiceProviderUuid]) {
              if (self.dbData.networkServiceType[networkServiceProviderUuid].type === 'vrouter' || self.dbData.networkServiceType[networkServiceProviderUuid].type === 'VirtualRouter') {
                flag = true
                type = 'vrouter'
              }
              if (self.dbData.networkServiceType[networkServiceProviderUuid].type === 'Flat') {
                type = 'Flat'
              }
            }
          })(item)
        })
        if (flag) {
          return 'vrouter'
        } else {
          return type
        }
        // return ''
      },
      pageAddIpRange: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openFullMainWindow('AddIPRangeDlg', {
          ok: (params) => this.addIpRange(selectedUuidList[0], params)
        })
      },
      pageAddDns: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openDialog('AddDNSDlg', {
          ok: (dns) => this.addDnsToL3Network(selectedUuidList[0], dns)
        })
        // this.openInplaceDialog('AddDNSDlg', [], (dns) => this.addDnsToL3Network(this.selectedList[0], dns))
      },
      pageDeleteIpRange: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openInplaceDialog('IPRangeListConfirmDlg', selectedUuidList[0], (uuidList) => this.deleteIpRange(uuidList, this.queryList))
      },
      pageDeleteDns: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openInplaceDialog('DnsListConfirmDlg', selectedUuidList[0], (dnsList) => this.removeDnsFromL3Network(selectedUuidList[0], dnsList))
      },
      attachVpcNetworkToVpcVRouter: function (vpcNetworkUuidList, vmUuid) {
        let event = this.createEvent('vpcNetwork.action.attachVpcNetworkToVpcVRouter', this.dbData.l3network[vpcNetworkUuidList[0]] ? this.dbData.l3network[vpcNetworkUuidList[0]].name : '', vpcNetworkUuidList.length)
        let tasks = []
        vpcNetworkUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmUuid}/l3-networks/${uuid}`, null, event)
              .then(resp => {
                this.incEventSuccess(event)
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventory.uuid,
                  data: resp.inventory
                })
              }, () => {
                this.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      detachVpcNetworkFromVpcVRouter: function (vmNicUuidList) {
        let event = this.createEvent('vpcNetwork.action.detachVpcNetworkFromVpcVRouter', this.dbData.l3network[vmNicUuidList[0]] ? this.dbData.l3network[vmNicUuidList[0]].name : '', vmNicUuidList.length)
        const self = this
        let tasks = []
        vmNicUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/nics/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      start: function (uuidList) {
        const self = this
        let event = self.createEvent('vpcNetwork.action.enable', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('l3-networks', uuid, {
              'changeL3NetworkState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      stop: function (uuidList) {
        const self = this
        let event = self.createEvent('vpcNetwork.action.disable', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('l3-networks', uuid, {
              'changeL3NetworkState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      pageDelete: function () {
        Controller.pageDelete(this)
      },
      getAccountName: function (uuid) {
        let value
        try {
          value = this.dbData.account[this.dbData.l3network[uuid].accountUuid].name
        } catch (e) {
          if (this.checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            this.dbData.l3network[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', accountRefResp.inventories[0].accountUuid)
          })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getL3NetworkRouterInterfaceIp: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.l3network[uuid].routerInterfaceIp
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getL3NetworkRouterInterfaceIp-${uuid}`)) return ''
          value = ''
          if (!self.dbData.common.isAdmin) return ''
          rpc.query(`l3-networks/${uuid}/router-interface-ip`)
            .then((resp) => {
              let l3network = _.cloneDeep(self.dbData.l3network[uuid])
              l3network.routerInterfaceIp = resp.routerInterfaceIp
              self.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: l3network
              })
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      canDelete: function (uuid) {
        if (this.dbData.common.currProject) return true
        if (this.dbData.common.isAdmin) return true
        let accountName = this.getAccountName(uuid)
        return accountName === localStorage.getItem('accountName')
      },
      pageCanDelete: function () {
        let candelete = false
        let uuidList = []
        if (this.windowData.uuidList === undefined) return
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        uuidList.forEach((uuid) => {
          if (this.canDelete(uuid)) {
            candelete = true
          }
        })
        return candelete
      },
      getL3NetworkMtu: function (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.l3network[uuid].mtu
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getL3NetworkMtu-${uuid}`)) return ''
          value = ''
          rpc.query(`l3-networks/${uuid}/mtu`)
            .then((resp) => {
              let l3network = _.cloneDeep(self.dbData.l3network[uuid])
              l3network.mtu = resp.mtu
              return self.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: l3network
              })
            })
            .then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('vpcNetwork.action.recallFromAll', uuidList.length === 1 ? this.dbData.l3network[uuidList[0]].name : '')
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
      shareVpcNetworkToAll: function (resourceUuidList) {
        let event = this.createEvent('vpcNetwork.action.shareToAll', resourceUuidList.length === 1 ? this.dbData.l3network[resourceUuidList[0]].name : '')
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
      toggleToPublic: function (uuidList) {
        if (Array.isArray(uuidList) && uuidList.length === 0) return
        let self = this
        uuidList.forEach((uuid) => {
          let data = _.cloneDeep(this.dbData.l3network[uuid])
          if (data.toPublic !== undefined) data.toPublic = !data.toPublic
          self.updateDbRow({
            tableName: 'l3network',
            id: uuid,
            data: data
          })
        })
      },
      getSharedToAllList: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
           uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => this.dbData.l3network[uuid].toPublic)
          return list
        }
        return []
      },
      getNotSharedToAllList: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
           uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !this.dbData.l3network[uuid].toPublic)
          return list
        }
        return []
      },
      hasSharedToAll: function () {
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      hasNotSharedToAll: function () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      }
    }
  }
</script>
