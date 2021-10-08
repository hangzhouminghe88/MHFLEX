<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    created: function () {
    },
    computed:{

    },
    watch: {

    },
    methods: {
      ...Utils,
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.l3network[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.l3network[uuid]
          }
        )
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        if (this.ipVersionCondition) conditionList.push(this.ipVersionCondition)
        return conditionList
      },
      queryList: function () {
        this.windowData.loading = true;
        if (!this.dbData.common.isAdmin) {
          this.normalAccountUpdateCount()
        }
        // let windowDataConditions = this.windowData.conditions ? this.windowData.conditions : []
        // let conditions = this.conditions ? this.conditions : []
        let params = {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`].concat(conditions).concat(windowDataConditions)
        }
        // if (system) conditions['q'] = system
        return rpc.query('l3-networks', params).then((resp) => {
          // To prevent getting the same uuid l3, refer to bug ZSTAC-17508
          resp.inventories = _.unionBy(resp.inventories, 'uuid')
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
          let p = rpc.query(`network-services/providers`).then(resp => {
            return this.updateDbTable({
              tableName: 'networkServiceType',
              list: resp.inventories
            })
          })
          tasks.push(p)
          p = rpc.getResourceAccount(uuidList, this)
          tasks.push(p)

          if (this.dbData.common.isAdmin) {
            let L2NetworkUuidList = _.uniq(resp.inventories.map((i) => {
              return i.l2NetworkUuid
            }))
            if (L2NetworkUuidList.length > 0) {
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
          }

          if (this.dbData.common.isAdmin) {
            let accountsUuidList = _.uniq(uuidList)
            if (accountsUuidList.length > 0) {
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
            }
          } else {
            const self = this
            resp.inventories.forEach(function (item) {
              ((item) => {
                let p = rpc.query('accounts/resources/refs', {
                  q: `resourceUuid=${item.uuid}`
                }).then((resp) => {
                  if (resp.inventories.length === 0) return
                  item.accountUuid = resp.inventories[0].accountUuid
                  self.updateDbRow({
                    tableName: 'l3network',
                    id: item.uuid,
                    data: item
                  })
                })
                tasks.push(p)
              })(item)
            })
          }

          if (this.dbData.common.isAdmin) {
            let p = resp.inventories.map((item, index) => {
              return this.isShareToAll(item.uuid)
                .then((toPublic) => {
                  resp.inventories[index].toPublic = toPublic
                })
            })
            tasks.push(p)
          }

          p = resp.inventories.map((item, index) => {
            return this.getHypervisorType(item.l2NetworkUuid)
              .then((hypervisorType) => {
                resp.inventories[index].hypervisorType = hypervisorType
              })
          })
          tasks.push(p)
          // let tasks = [ queryNetworkServiceProvider(), queryL2Network(), queryOwners() ]

          let getVirtualRouterOffering = (uuid) => {
            return rpc.query('system-tags', {
              q: ['resourceType=InstanceOfferingVO', `tag=guestL3Network::${uuid}`]
            })
              .then((respVroffering) => {
                let l3network = _.cloneDeep(this.dbData.l3network[uuid])
                if (respVroffering.inventories.length > 0) {
                  l3network.virtualRouterOfferingUuid = respVroffering.inventories[0].resourceUuid
                  l3network.tagForVirtualRouterOfferingUuid = respVroffering.inventories[0].uuid
                } else {
                  l3network.virtualRouterOfferingUuid = ''
                  l3network.tagForVirtualRouterOfferingUuid = ''
                }
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              }) .then(() => {
                    this.itemList = this.getData();
                })
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
            }) .then(() => {
                  this.itemList = this.getData();
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
                    let dhcpip = item.tag.split('::')[2]
                    l3network.dhcpip = dhcpip.replace(/--/, '::')
                  }
                })
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              }) .then(() => {
                    this.itemList = this.getData();
                })
          }
          return Promise.all(tasks).then(() => {
            resp.inventories.forEach((item) => {
              if (!this.getNetworkServiceTypeName(item)) return
              item.networkServiceType = this.getNetworkServiceTypeName(item)
            })
            this.updateDbTable({
              tableName: 'l3network',
              list: resp.inventories
            }).then(() => {
                let p = null, tasks = [];
              uuidList.forEach((item) => {
                p = getIpAddressCapacity(item)
                  tasks.push(p)
                p = getL3NetworkDhcpIpAddress(item)
                  tasks.push(p);
                p = getVirtualRouterOffering(item)
                  tasks.push(p);
              })
            })

            this.updateWindow({ uuidList, table })
                .then(() => {
                   return Promise.all(tasks);
                })
          })
              .then(() => {
                this.windowData.loading = false;
                this.itemList = this.getData();
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
      getHypervisorType: function (uuid) {
        return rpc.query('hosts', {
          q: `cluster.l2Network.uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.inventories.length === 0) return ''
            return resp.inventories[0].hypervisorType
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
        // Create L3
        let createL3 = {}
        createL3['name'] = param.name
        createL3['type'] = param.type
        createL3['system'] = param.system
        createL3['l2NetworkUuid'] = param.l2NetworkUuid
        createL3['category'] = param.category
        if (param.useIpv6) createL3['ipVersion'] = 6
        let event = this.createEvent('l3network.action.create', createL3.name)
        let resp
        try {
          resp = await rpc.create('l3-networks', createL3, event)
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
        }
        if(resp && !resp.inventory) return;
        const { uuid: l3NetworkUuid } = resp.inventory
        // Attach Network Service
        if (param.networkServices) {
          let AttachNetworkServiceToL3Network = {}
          AttachNetworkServiceToL3Network['networkServices'] = param.networkServices
          await rpc.create(`l3-networks/${l3NetworkUuid}/network-services`, AttachNetworkServiceToL3Network)
        }
        // vrouter network
        if (param.virtualRouterOfferingUuid) {
          await rpc.create('system-tags', {
            resourceType: 'InstanceOfferingVO',
            resourceUuid: param.virtualRouterOfferingUuid,
            tag: `guestL3Network::${l3NetworkUuid}`
          })
        }
        // Add IpRange
        let IpRangeevent = this.createEvent('l3network.action.addIpRange', param.name)
        if (param.ipRangeOrcidr === false) {
          let addIpRange = {}
          addIpRange['name'] = param.name
          addIpRange['startIp'] = param.startIp
          addIpRange['endIp'] = param.endIp
          addIpRange['gateway'] = param.gateway
          addIpRange.systemTags = param.systemTags
          let url = ''
          if (param.useIpv6) {
            addIpRange.prefixLen = param.prefixLen
            addIpRange.addressMode = param.addressMode
            url = `l3-networks/${l3NetworkUuid}/ipv6-ranges`
          } else {
            addIpRange['netmask'] = param.netmask
            url = `l3-networks/${l3NetworkUuid}/ip-ranges`
          }
          try {
            await rpc.create(url, addIpRange, IpRangeevent)
            this.incEventSuccess(IpRangeevent)
          } catch (e) {
            this.incEventFail(IpRangeevent)
          }
        } else {
          let url = ''
          let addCidr = {
            name: param.name,
            networkCidr: param.cidr,
            systemTags: param.systemTags
          }
          if (param.useIpv6) {
            addCidr.addressMode = param.addressMode
            url = `l3-networks/${l3NetworkUuid}/ipv6-ranges/by-cidr`
          } else url = `l3-networks/${l3NetworkUuid}//ip-ranges/by-cidr`
          try {
            await rpc.create(url, addCidr, IpRangeevent)
            this.incEventSuccess(IpRangeevent)
          } catch (e) {
            this.incEventFail(IpRangeevent)
          }
        }
        // Add DNS
        let dnsevent = this.createEvent('l3network.action.addDns', param.name)
        let addDnsToL3Network = {}
        if (param.dns === '' || param.dns === undefined) param.dns = param.useIpv6 ? '240c::6644' : '223.5.5.5'
        addDnsToL3Network['dns'] = param.dns
        try {
          await rpc.create(`l3-networks/${l3NetworkUuid}/dns`, addDnsToL3Network, dnsevent)
          this.incEventSuccess(dnsevent)
        } catch (e) {
          this.incEventFail(dnsevent)
        }

        if (param.ipRangeOrcidr === false && param.showPrivate && param.routerInterfaceIp) {
          let routerInterfaceIpEvent = this.createEvent('l3network.action.setL3NetworkRouterInterfaceIp', param.name)
          let routerInterfaceIp = {}
          routerInterfaceIp['routerInterfaceIp'] = param.routerInterfaceIp
          try {
            await rpc.create(`l3-networks/${resp.inventory.uuid}/router-interface-ip`, routerInterfaceIp, routerInterfaceIpEvent)
            this.incEventSuccess(routerInterfaceIpEvent)
          } catch (e) {
            this.incEventFail(routerInterfaceIpEvent)
          }
        }
        // whether create L3 from L3 Page directly or not
        if (this.windowData.uuidList && this.queryList) {
          await this.queryList()
        }
        if (fn) await fn()
      },
      delete: function (uuidList) {
        let self=this
        let event = self.createEvent('l3network.action.delete', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`l3-networks/${uuid}`, {}, event)
              .then(() => {
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      destroy: function (uuid) {
        let self = this
        let event = self.createEvent('l3network.action.delete', this.dbData.l3network[uuid].name, 1)
        let tasks = []
        let p = rpc._delete(`l3-networks/${uuid}`, null, event)
          .then(() => {
            // rpc.query('l3-networks')
            // .then((resp) => {
            //   this.updateWindow({
            //     name: 'l3network',
            //     list: resp.inventories
            //   })
            // })
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
        tasks.push(p)
        return Promise.all(tasks)
      },
      shareL3Network: function (resourceUuidList, accountUuid) {
        // const self = this
        let event = this.createEvent('l3network.action.share', resourceUuidList.length === 1 ? this.dbData.l3network[resourceUuidList[0]].name : '', resourceUuidList.length)
        rpc.update('accounts', 'resources', {
          'shareResource': {
            'resourceUuids': resourceUuidList,
            'accountUuids': accountUuid,
            'toPublic': false
          }
        }, event)
          .then((resp) => this.incEventSuccess(event), () => this.incEventFail(event))
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
      recallFromAll: function (uuidList) {
        let self = this
        let event = this.createEvent('l3network.action.recallFromAll', uuidList.length === 1 ? this.dbData.l3network[uuidList[0]].name : '')
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
      shareL3NetworkToAll: function (resourceUuidList) {
        let event = this.createEvent('l3network.action.shareToAll', resourceUuidList.length === 1 ? this.dbData.l3network[resourceUuidList[0]].name : '')
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
      getSharedToAllList: function () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => this.dbData.l3network[uuid].toPublic)
          return list
        }
        return []
      },
      getNotSharedToAllList: function () {
        let uuidList = this.selectedList
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
      },
      addDnsToL3Network: function (l3NetworkUuid, dns) {
        let event = this.createEvent('l3network.action.addDns', this.dbData.l3network[l3NetworkUuid].name)
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
        let event = this.createEvent('l3network.action.deleteDns', this.dbData.l3network[this.selectedList[0]].name)
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
        let url = ''
        let addCidr = {
          name: this.dbData.l3network[l3NetworkUuid].name,
          networkCidr: params.networkCidr,
          systemTags: params.systemTags
        }
        if (this.dbData.l3network[l3NetworkUuid].ipVersion === 6) {
          addCidr.addressMode = params.addressMode
          url = `l3-networks/${l3NetworkUuid}/ipv6-ranges/by-cidr`
        } else url = `l3-networks/${l3NetworkUuid}/ip-ranges/by-cidr`
        return rpc.create(url, addCidr, event).then((resp) => {
          this.getIpAddressCapacity(l3NetworkUuid)
          this.incEventSuccess(event)
        }, () => this.incEventFail(event))
      },
      addIpRange (l3NetworkUuid, params) {
        let event = this.createEvent('l3network.action.addIpRange', this.dbData.l3network[l3NetworkUuid].name)
        if (!params.showMethod) {
          let url
          let param = {
            name: this.dbData.l3network[l3NetworkUuid].name,
            startIp: params.startIp,
            endIp: params.endIp,
            gateway: params.gateway,
            systemTags: params.systemTags
          }
          if (this.dbData.l3network[l3NetworkUuid].ipVersion === 6) {
            url = `l3-networks/${l3NetworkUuid}/ipv6-ranges`
            param.prefixLen = params.prefixLen
            param.addressMode = params.addressMode
          } else {
            param.netmask = params.netmask
            url = `l3-networks/${l3NetworkUuid}/ip-ranges`
          }
          rpc.create(url, param, event).then((resp) => {
            this.queryList()
            this.incEventSuccess(event)
          }, () => this.incEventFail(event))
        } else {
          this.addIpRangeByNetworkCidr(l3NetworkUuid, params, event)
        }
      },
      deleteIpRange: function (ipRangeUuidList, fn) {
        // const self = this
        let event = this.createEvent('l3network.action.deleteIpRange', this.dbData.l3network[this.selectedList[0]].name)
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
      getNetworkType: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.l3network[uuid].networkCategory
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getNetworkType-${uuid}`)) return ''
          value = ''
          rpc.query('system-tags', {
            q: ['resourceType=L3NetworkVO', `resourceUuid=${uuid}`, 'tag~=networkCategory::%25']
          }).then((resp) => {
            let l3network = _.cloneDeep(self.dbData.l3network[uuid])
            if (resp.inventories.length > 0) {
              l3network.networkCategory = resp.inventories[0].tag.split('::')[1]
              return self.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: l3network
              })
            } else {
              return ''
            }
          }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
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
      attachVirtualRouterOffering: function (l3NetworkUuid, resourceUuid) {
        let event = this.createEvent('l3network.action.attachVirtualRouterOffering', this.dbData.l3network[l3NetworkUuid].name)
        return rpc.create('system-tags', {
          resourceType: 'InstanceOfferingVO',
          resourceUuid: resourceUuid,
          tag: `guestL3Network::${l3NetworkUuid}`
        }, event).then((resp) => {
          this.updateWindow({
            virtualRouterOfferingUuid: resp.inventory.resourceUuid,
            tagForVirtualRouterOfferingUuid: resp.inventory.uuid
          })
          let l3network = _.cloneDeep(this.dbData.l3network[l3NetworkUuid])
          l3network.tagForVirtualRouterOfferingUuid = resp.inventory.uuid
          l3network.virtualRouterOfferingUuid = resp.inventory.resourceUuid
          this.updateDbRow({
            tableName: 'l3network',
            id: l3NetworkUuid,
            data: l3network
          })
          this.incEventSuccess(event)
        }, () => this.incEventFail(event))
      },
      detachVirtualRouterOffering: function (l3NetworkUuid, tagUuid) {
        if (this.windowData.virtualRouterOfferingUuid === '') return
        let event = this.createEvent('l3network.action.detachVirtualRouterOffering', this.dbData.l3network[l3NetworkUuid].name)
        return rpc._delete(`tags/${tagUuid}`)
          .then((resp) => {
            this.updateWindow({
              virtualRouterOfferingUuid: '',
              tagForVirtualRouterOfferingUuid: ''
            })
            let l3network = _.cloneDeep(this.dbData.l3network[l3NetworkUuid])
            l3network.tagForVirtualRouterOfferingUuid = ''
            l3network.virtualRouterOfferingUuid = ''
            this.updateDbRow({
              tableName: 'l3network',
              id: l3NetworkUuid,
              data: l3network
            })
            this.incEventSuccess(event)
          }, () => this.incEventFail(event))
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
        // if (this.dbData.networkServiceType[networkServiceProviderUuid]) {
        //   return this.dbData.networkServiceType[networkServiceProviderUuid].type
        // }
        if (flag) {
          return 'vrouter'
        } else {
          return type
        }
        // return ''
      },
      pageShareL3Network: async function () {
        let self = this
        if (this.windowData.dialogList.length > 0) {
          await this.windowData.dialogList.forEach((it) => {
            self.closeDialog(it)
          })
          self.updateWindow({
            dialogList: []
          })
        }
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length === 1) {
          this.openInplaceDialog('SharedSelectList', {uuid: uuidList[0]}, {
            share: (uuid) => this.shareL3Network(uuidList, uuid),
            shareToAll: () => this.shareL3NetworkToAll(uuidList)
          })
        } else {
          this.openInplaceDialog('SharedSelectList', {uuid: ''}, {
            share: (uuid) => this.shareL3Network(uuidList, uuid),
            shareToAll: () => this.shareL3NetworkToAll(uuidList)
          })
        }
      },
      pageAddIpRange: function () {
        if (!this.isSingleSelected) return
        let uuid = this.selectedList[0]
        this.showIpRangeDlg=true;

        this.ipRangeMessage = {
          isIPV6: this.dbData.l3network[uuid].ipVersion === 6,
          l3NetworkUuid: uuid,
          isHideCidr: this.dbData.l3network[uuid].ipRanges.length > 0,
          isHideDHCP: _.get(this.dbData, `l3network.${uuid}.category`) === 'System',
          ok: (params) => this.addIpRange(uuid, params)
        }

        /*
        this.openFullMainWindow('AddIPRangeDlg', {
          isIPV6: this.dbData.l3network[uuid].ipVersion === 6,
          l3NetworkUuid: uuid,
          isHideCidr: this.dbData.l3network[uuid].ipRanges.length > 0,
          isHideDHCP: _.get(this.dbData, `l3network.${uuid}.category`) === 'System',
          ok: (params) => this.addIpRange(uuid, params)
        })*/
      },
      pageAddDns: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.showDnsDlg = true
        this.dnsMessage = {
          isIPv6: this.dbData.l3network[selectedUuidList[0]].ipVersion === 6,
          ok: (dns) => this.addDnsToL3Network(selectedUuidList[0], dns)
        }

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
      start: function (uuidList) {
        const self = this
        let event = self.createEvent('l3network.action.enable', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name : '', uuidList.length)
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
        let event = self.createEvent('l3network.action.disable', uuidList.length === 1 ? self.dbData.l3network[uuidList[0]].name : '', uuidList.length)
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
        let uuidList = this.selectedList
        let self = this;
        let networkType = self.$options.name.replace('Page', '');
        let lowerCase = () => {
         return networkType.replace(/\b(\w)|\s(\w)/g, (m) => {
            return m.toLowerCase();
          })
        }
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: `l3network.delete${networkType}`,
            description: this.$t("l3network.info.deleteConfirm", {
              length: uuidList.length,
              resourceName: this.$t(`common.${lowerCase()}`)
            }),
            warning:`l3network.info.${lowerCase()}DeleteWarning`,
            uuidList: uuidList,
            icon: lowerCase().replace('N', '_n').replace(/$/, '_n'),
            ok: () => {
              self.delete(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.l3network[uuid].name;
            }
          })

        }
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
        let uuidList = this.selectedList

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
      normalAccountUpdateCount: function () {
        rpc.query('accounts/resources/refs', {
          q: ['resourceType=L3NetworkVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
        })
          .then((resp) => {
            let myL3NetworkUuidList = resp.inventories.map((item) => item.resourceUuid)
            let condition = ['system=false', 'l2Network.cluster.type!=vmware', 'category=Private', 'type=L3BasicNetwork', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
            if (this.ipVersionCondition) condition.push(this.ipVersionCondition)
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
      createRouterEntry: function (L3Uuid, param) {
        const self = this
        let event = self.createEvent('l3network.action.addHostRoute', self.dbData.l3network[L3Uuid].name)
        return rpc.create(`l3-networks/${L3Uuid}/hostroute`, param, event)
          .then((resp) => {
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'l3network',
              id: L3Uuid,
              data: resp.inventory
            }).then(() => {
              self.queryTableList(L3Uuid)
            })
          }, (e) => {
            self.incEventFail(event)
          })
      },
      deleteRouterEntry (L3Uuid, uuidList) {
        console.log(uuidList);
        const self = this
        let event = self.createEvent('l3network.action.deleteHostRoute', self.dbData.l3network[L3Uuid].name)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let param = {
              l3NetworkUuid: L3Uuid,
              prefix: self.tableData[uuid].prefix
            }
            let p = rpc._delete(`l3-networks/${L3Uuid}/hostroute`, param, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'l3network',
                  id: L3Uuid,
                  data: resp.inventory
                }).then(() => {
                  self.queryTableList(L3Uuid)
                })
              }, (e) => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      }

    }
  }
</script>
