<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'

  export default {
    created: function () {
    },
    methods: {

      createVipForIPsec: async function (param) {
        let vipParam = {
          name: `vip-for-${param.name}`,
          l3NetworkUuid: param.publicL3NetworkUuid,
          description: param.description,
          requiredIp: param.requiredIp === '' ? undefined : param.requiredIp
        }

        let vipevent = this.createEvent('vip.action.create', `vip-for-${param.name}`)
        let resp = {}
        try {
          resp = await rpc.create('vips', vipParam, vipevent)
          this.incEventSuccess(vipevent)
        } catch (e) {
          this.incEventFail(vipevent)
        }
        return resp
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: function () {
        this.windowData.loading = true;
        let vmInventories
        let table = {}
        let uuidList
        rpc.query('vpc/virtual-routers', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        })
          .then((resp) => {
            this.windowData.loading = false;
            vmInventories = resp.inventories
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              availableCount: resp.total
            })
            uuidList = vmInventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })

            let tasks = []

            let p
            let clustersUuidList = _.uniq(resp.inventories.map((i) => i.clusterUuid))
            if (clustersUuidList.length === 0) {
              this.updateWindow({ uuidList: [], table: {} })
              return
            }
            p = rpc.queryResourceNames(this, 'cluster', clustersUuidList)
            tasks.push(p)

            let hostsUuidList = _.uniq(resp.inventories.map((i) => {
              return i.hostUuid ? i.hostUuid : i.lastHostUuid
            }))
            if (hostsUuidList.length === 0) {
              this.updateWindow({ uuidList: [], table: {} })
              return
            }
            p = rpc.query('hosts', {
              q: `uuid?=${hostsUuidList.join(',')}`
            }).then((resp) => {
              return this.updateDbTable({
                tableName: 'host',
                list: resp.inventories
              })
            }, (e) => {
              this.$throw(e)
            })
            tasks.push(p)

            if (this.dbData.common.isAdmin) {
              let accountsUuidList = _.uniq(uuidList)
              if (accountsUuidList.length === 0) {
                this.updateWindow({ uuidList: [], table: {} })
                return
              }
              p = rpc.query('accounts/resources/refs', {
                q: `resourceUuid?=${accountsUuidList.join()}`
              }).then((accountRefResp) => {
                accountRefResp.inventories.forEach(accountRef => {
                  for (let i = 0; i < resp.inventories.length; i++) {
                    if (accountRef.resourceUuid === resp.inventories[i].uuid) {
                      resp.inventories[i].accountUuid = accountRef.accountUuid
                      break
                    }
                  }
                })
                return rpc.queryResourceNames(this, 'account', _.uniq(resp.inventories.map((item) => item.accountUuid)))
              })
              tasks.push(p)
            }

            if (this.dbData.common.isAdmin) {
              p = rpc.query('primary-storage', {
              })
                .then((resp) => {
                  return this.updateDbTable({
                    tableName: 'primarystorage',
                    list: resp.inventories
                  })
                })
              tasks.push(p)
              resp.inventories.forEach((item, index) => {
                ((item) => {
                  p = rpc.query(`vm-instances/${item.uuid}/capabilities`)
                    .then((resp) => {
                      item = _.assign(item, resp)
                      this.updateDbRow({
                        tableName: 'vmInstancesCapabilities',
                        id: item.uuid,
                        data: resp.capabilities
                      })
                    })
                  tasks.push(p)
                })(item)
              })
            }

            if (!this.dbData.common.isOpensource) {
              resp.inventories.forEach((item, index) => {
                let distributedRoutingTask = rpc.query(`vpc/virtual-routers/${item.uuid}/distributed-routing`)
                  .then((distributedRoutingResp) => {
                    resp.inventories[index].distributedRoutingEnabled = distributedRoutingResp.enabled
                  }).catch((err) => {
                    console.error(err)
                  })
                let p = Promise.race([
                  distributedRoutingTask,
                  new Promise(function (resolve, reject) {
                    setTimeout(() => {
                      resolve('request timeout')
                    }, 5000)
                  })
                ])
                tasks.push(p)
              })
            }

            if (this.dbData.common.isAdmin) {
              resp.inventories.forEach((item, index) => {
                if (item.state === 'Running') {
                  p = rpc.query(`vm-instances/${item.uuid}/console-addresses`)
                    .then((consoleAddressesResp) => {
                      resp.inventories[index].vmConsoleAddress = consoleAddressesResp.protocol + '://' + consoleAddressesResp.hostIp + ':' + consoleAddressesResp.port
                    })
                  tasks.push(p)
                }
              })
            }

            let queryHaLevels = (uuid) => {
              if (!this.dbData.common.isOpensource) {
                return rpc.query(`vm-instances/${uuid}/ha-levels`)
                  .then((resp) => {
                    let level = resp.level === 'NeverStop' ? 'NeverStop' : 'None'
                    this.dbData.vm[uuid].haLevel = level
                    this.updateDbRow({
                      tableName: 'vm',
                      id: uuid,
                      data: this.dbData.vm[uuid]
                    })
                  })
              } else {
                this.dbData.vm[uuid].haLevel = 'None'
                this.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: this.dbData.vm[uuid]
                })
              }
            }

            let getVmConsolePassword = (uuid) => {
              return rpc.query(`vm-instances/${uuid}/console-passwords`)
                .then((resp) => {
                  let hasPassword = false
                  if (!_.isUndefined(resp.password)) {
                    hasPassword = true
                  }
                  return this.updateDbRow({
                    tableName: 'vmInstancesConsolePassword',
                    id: uuid,
                    data: {
                      hasPassword
                    }
                  })
                }, () => {
                  let hasPassword = false
                  return this.updateDbRow({
                    tableName: 'vmInstancesConsolePassword',
                    id: uuid,
                    data: {
                      hasPassword
                    }
                  })
                })
            }
            Promise.all(tasks).then(() => {
              this.updateDbTable({
                tableName: 'vm',
                list: resp.inventories
              })
              this.updateWindow({ uuidList, table })
                .then( () => {
                  this.itemList = this.getData()
                })
              uuidList.forEach((item) => {
                queryHaLevels(item)
                // getVmConsoleAddress(item)
                getVmConsolePassword(item)
              })
            })
          })
      },
      create: async function (param) {
        let event = this.createEvent('vpcVRouter.action.create', param.name)
        let p = {
          name: param.name,
          description: param.description,
          virtualRouterOfferingUuid: param.virtualRouterOfferingUuid
        }
        let uuid = ''
        try {
          let resp = await rpc.create('vpc/virtual-routers', p, event)
          uuid = resp.inventory.uuid
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
        }
        if (!uuid) return
        await this.addDnsToVpcVRouter(uuid, param)
      },
      addDnsToVpcVRouter: async function (vpcVRouterUuid, param) {
        let dnsevent = this.createEvent('vpcVRouter.action.addDns', param.name)
        let addDnsToVpcVRouter = {}
        if (param.dns === '' || param.dns === undefined) param.dns = '223.5.5.5'
        addDnsToVpcVRouter['dns'] = param.dns
        try {
          await rpc.create('vpc/virtual-routers/' + vpcVRouterUuid + '/dns', addDnsToVpcVRouter, dnsevent)
          this.incEventSuccess(dnsevent)
        } catch (e) {
          this.incEventFail(dnsevent)
        }
      },
      delete: function (uuidList) {
        let event = this.createEvent('vpcVRouter.action.delete', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/${uuid}`, null, event)
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
      updateCount: function () {
        rpc.query('vm-instances/appliances/virtual-routers', {
          count: true,
          q: this.getCondition()
        }).then((resp) => {
          this.updateWindow({
            availableCount: resp.total
          })
        })
      },
      openConsole: function (uuid) {
        let event = this.createEvent('vpcVRouter.action.openConsole', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        rpc.create('consoles', {
          'vmInstanceUuid': uuid
        }, event)
          .then((resp) => {
            this.incEventSuccess(event)
            let address = ''
            address = `${window.location.origin}/thirdparty/vnc_auto.html?host=${resp.inventory.hostname}&port=${resp.inventory.port}&token=${resp.inventory.token}&title=${this.dbData.vm[uuid].name}`
            window.open(address)
          }, () => {
            this.incEventFail(event)
          })
      },
      getInstanceOfferingName: function (uuid) {
        let name = ''
        try {
          name = this.dbData.instanceOffering[this.dbData.vm[uuid].instanceOfferingUuid].name
        } catch (e) {
          rpc.query('resources/names', {
            uuids: [`${this.dbData.vm[uuid].instanceOfferingUuid}`]
          }).then((resp) => {
            let item = {
              uuid: this.dbData.vm[uuid].instanceOfferingUuid
            }
            if (resp.inventories.length > 0) {
              item.name = resp.inventories[0].resourceName
            }
            return this.updateDbRow({
              tableName: 'instanceOffering',
              id: item.uuid,
              data: item
            })
          })
        }
        return name
      },
      getVirtualrouterImageName: function (uuid) {
        let name = ''
        try {
          name = this.dbData.image[this.dbData.vm[uuid].imageUuid].name
        } catch (e) {
          rpc.query('resources/names', {
            uuids: [`${this.dbData.vm[uuid].imageUuid}`]
          }).then((resp) => {
            let item = {
              uuid: this.dbData.vm[uuid].imageUuid
            }
            if (resp.inventories.length > 0) {
              item.name = resp.inventories[0].resourceName
            }
            return this.updateDbRow({
              tableName: 'image',
              id: item.uuid,
              data: item
            })
          })
        }
        return name
      },
      consolePasswordIsSet: function (uuid) {
        return this.dbData.vmInstancesConsolePassword[uuid] && this.dbData.vmInstancesConsolePassword[uuid].hasPassword
      },
      expunge: function (uuidList) {
        let  self = this, tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('vm-instances', uuid, {
              'expungeVmInstance': {}
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      start: function (uuidList, fn) {
        let event = this.createEvent('vpcVRouter.action.start', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let self = this, tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('vm-instances', uuid, {
              'startVmInstance': {}
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
                if (fn) fn()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      stop: function (uuidList) {
        const self = this
        let event = this.createEvent('vm.action.stop', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length),
          tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('vm-instances', uuid, {
              'stopVmInstance': {}
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      recover: function (uuidList) {
        let event = this.createEvent('vm.action.recover', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let self = this, tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
           p = rpc.update('vm-instances', uuid, {
              'recoverVmInstance': {}
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks);
      },
      reconnect: function (uuidList) {
        let event = this.createEvent('vpcVRouter.action.reconnect', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let self = this, tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.status = 'Connecting'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
            p = rpc.update('vm-instances/appliances/virtual-routers', uuid, {
              'reconnectVirtualRouter': {}
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      reboot: function (uuidList) {
        let event = this.createEvent('vpcVRouter.action.reboot', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let self = this, tasks = [], p = null;
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.state = 'Rebooting'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
           p = rpc.update('vm-instances', uuid, {
              'rebootVmInstance': {}
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p);
          })(uuid)
        })
        return Promise.all(tasks);
      },
      resume: function (uuidList) {
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
              'resumeVmInstance': {}
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              })
          })(uuid)
        })
      },
      pause: function (uuidList) {
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
              'pauseVmInstance': {}
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              })
          })(uuid)
        })
      },
      powerOff: function (uuidList) {
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
              'stopVmInstance': {
                'type': 'cold'
              }
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              })
          })(uuid)
        })
      },
      clone: function (uuid, strategy, names) {
        rpc.update('vm-instances', uuid, {
          'cloneVmInstance': {
            'strategy': strategy,
            'names': names
          }
        })
          .then((resp) => {
            console.log(resp)
            this.updateDbTable({
              tableName: 'vm',
              data: resp.inventories
            })
          })
      },
      reimage: function (vmInstanceUuid) {
        rpc.update('vm-instances', vmInstanceUuid, {
          'reimageVmInstance': {}
        })
          .then((resp) => {
            console.log(resp)
          })
      },
      attachL3NetworkToVm: function (l3NetworkUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.attachL3NetworkToVm', this.dbData.l3network[l3NetworkUuidList[0]] ? this.dbData.l3network[l3NetworkUuidList[0]].name : '', l3NetworkUuidList.length)
        let tasks = []
        l3NetworkUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${uuid}`, null, event)
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
      migrate: function (vmInstanceUuid, hostUuid) {
        const self = this
        let event = self.createEvent('vpcVRouter.action.migrate', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '')
        let vmInventory = _.cloneDeep(self.dbData.vm[vmInstanceUuid])
        vmInventory.state = 'Migrating'
        let originState = self.dbData.vm[vmInstanceUuid].state
        let jobUuid = self.genUniqueId()
        self.updateDbRow({
          tableName: 'vm',
          id: vmInstanceUuid,
          data: vmInventory
        })
        return rpc.update('vm-instances', vmInstanceUuid, {
          'migrateVm': {
            'hostUuid': hostUuid
          }
        }, event, jobUuid)
          .then(resp => {
            self.incEventSuccess(event)
            return self.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: resp.inventory
            })
          }, () => {
            let obj = {state: originState}
            self.incEventFail(event)
            return self.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: obj
            })
          })
      },
      coldMigrate: function (vmInstanceUuid, hostUuid) {
        let self = this
        let event = self.createEvent('vpcVRouter.action.coldMigrate', self.dbData.vm[vmInstanceUuid] ? self.dbData.vm[vmInstanceUuid].name : '')
        let rootVolumeUuid
        let jobUuid = self.genUniqueId()
        self.dbData.vm[vmInstanceUuid].allVolumes.forEach((item) => {
          if (item.type === 'Root') rootVolumeUuid = item.uuid
        })
        let originState = self.dbData.vm[vmInstanceUuid].state
        let vmInventory = _.cloneDeep(self.dbData.vm[vmInstanceUuid])
        vmInventory.state = 'VolumeMigrating'
        self.updateDbRow({
          tableName: 'vm',
          id: vmInstanceUuid,
          data: vmInventory
        })
        return rpc.put(`primary-storage/local-storage/volumes/${rootVolumeUuid}/actions`, {
          'localStorageMigrateVolume': {
            'destHostUuid': hostUuid
          }
        }, event, jobUuid)
          .then(resp => {
            self.incEventSuccess(event)
            let obj = {state: originState, hostUuid: hostUuid}
            return self.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: obj
            })
          }, () => {
            let obj = {state: originState}
            self.incEventFail(event)
            return self.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: obj
            })
          })
      },
      inStatuses () {
        if (!this.isSelected) return false
        let uuidList = [], statuses = []
        let resp = true
        this.selectedList.forEach(uuid => {
          uuidList.push(uuid)
        })
        for(let i in arguments){
          statuses.unshift(arguments[i]);
        }
        uuidList.forEach(uuid => {
          if (statuses.every(item => { return item !== this.dbData.vm[uuid].status })) resp = false
        })
        return resp
      },
      inStates () {
        if (!this.isSelected) return false
        let uuidList = [], states = []
        let resp = true
        this.selectedList.forEach(uuid => {
           uuidList.push(uuid)
        })
        for(let i in arguments){
          states.unshift(arguments[i]);
        }
        uuidList.forEach(uuid => {
          if (states.every(item => { return item !== this.dbData.vm[uuid].state })) resp = false
        })
        return resp
      },
      setVmSshKey: function (uuid, SshKey) {
        rpc.update('vm-instances', uuid, {
          'setVmSshKey': {
            'SshKey': SshKey
          }
        })
      },
      changeResourceOwner: function (uuidList, accountUuid) {
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.create(`account/${accountUuid}/resources`, {
              'resourceUuid': uuid
            })
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: resp.inventory
                })
              })
          })(uuid)
        })
      },
      deleteVmConsolePassword: function (uuidList, isReboot) {
        const self = this
        let event = self.createEvent('vpcVRouter.action.deleteVmConsolePassword', this.dbData.vm[uuidList[0]] ? this.dbData.vm[uuidList[0]].name : '')
        let tasks = []
        uuidList.forEach(function (uuid) {
          let p = rpc._delete(`vm-instances/${uuid}/console-password`, null, event).then((resp) => {
            self.incEventSuccess(event)
            if (isReboot) {
              self.reboot([uuid])
            }
            return self.updateDbRow({
              tableName: 'vmInstancesConsolePassword',
              id: uuid,
              data: {
                hasPassword: false
              }
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks).then(() => {
          self.$forceUpdate()
        })
      },
      setVmConsolePassword: function (uuid, password, isReboot) {
        let event = this.createEvent('vpcVRouter.action.setVmConsolePassword', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
        return rpc.put(`vm-instances/${uuid}/actions`, {
          'setVmConsolePassword': {
            'consolePassword': password
          }
        }, event).then((resp) => {
          this.incEventSuccess(event)
          if (isReboot) {
            this.reboot([uuid])
          }
          return this.updateDbRow({
            tableName: 'vmInstancesConsolePassword',
            id: uuid,
            data: {
              hasPassword: true
            }
          })
        }, () => {
          this.incEventFail(event)
        })
      },
      getPrimaryStorageType: function (uuid) {
        let value
        let self = this
        if (self.dbData.vm[uuid].primaryStorageType) {
          value = self.dbData.vm[uuid].primaryStorageType
        } else {
          if (self.checkBounce(`getPrimaryStorageType-${uuid}`)) return ''
          value = ''
          let primaryStorageUuid
          self.dbData.vm[uuid].allVolumes.forEach((item) => {
            if (item.type === 'Root') primaryStorageUuid = item.primaryStorageUuid
          })
          rpc.query('primary-storage', {
            q: `uuid=${primaryStorageUuid}`
          })
            .then((resp) => {
              value = resp.inventories[0].type
              self.dbData.vm[uuid].primaryStorageType = value
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      ...Utils
    }
  }
</script>
