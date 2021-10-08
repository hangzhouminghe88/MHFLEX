<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  /* global localStorage:false */

  export default {
    created: function () {
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push('applianceVmType?=vrouter,VirtualRouter')
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
         if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },

      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.vm[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.vm[uuid]
          }
        )
      },

      queryList: function () {
        this.windowData.loading = true;
        let vmInventories
        let table = {}
        let uuidList
        this.itemList = [];
        return rpc.query('vm-instances/appliances/virtual-routers', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          replyWithCount: true,
          q: this.getCondition()
          // q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`].concat(this.windowData.conditions)
        })
          .then((resp) => {
           this.windowData.loading = false;
            vmInventories = resp.inventories
            this.updateWindow({
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
            }

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
                p = rpc.query('l3-networks/ip-ranges', {
                  q: [`l3Network.vmNic.vmInstanceUuid=${item.uuid}`, 'l3Network.category=Private'],
                  fields: 'networkCidr'
                }).then((cidrResp) => {
                  if (cidrResp.inventories.length > 0) {
                    item.networkCidr = cidrResp.inventories[0].networkCidr
                    this.updateDbRow({
                      tableName: 'vmA',
                      id: item.uuid,
                      data: item
                    })
                  }
                })
                tasks.push(p)
              })(item)
            })
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
            let getVmConsoleAddress = (uuid) => {
              if (this.dbData.common.isAdmin && this.dbData.vm[uuid].state === 'Running') {
                return rpc.query(`vm-instances/${uuid}/console-addresses`)
                  .then((resp) => {
                    this.dbData.vm[uuid].vmConsoleAddress = resp.protocol + '://' + resp.hostIp + ':' + resp.port
                    return this.updateDbRow({
                      tableName: 'vm',
                      id: uuid,
                      data: this.dbData.vm[uuid]
                    })
                  })
              } else {
                return
              }
            }
            let getVmConsolePassword = (uuid) => {
              return rpc.query(`vm-instances/${uuid}/console-passwords`)
                .then((resp) => {
                  let hasPassword = false
                  if (!_.isUndefined(resp.password)) {
                    hasPassword = true
                  }
                  this.updateDbRow({
                    tableName: 'vmInstancesConsolePassword',
                    id: uuid,
                    data: {
                      hasPassword
                    }
                  })
                  // this.dbData.vm[uuid].hasConsolePassword = !!resp.password
                  // return this.updateDbRow({
                  //   tableName: 'vm',
                  //   id: uuid,
                  //   list: this.dbData.vm[uuid]
                  // })
                })
            }
            return Promise.all(tasks).then(() => {
              this.updateDbTable({
                tableName: 'vm',
                list: resp.inventories
              })
              this.updateWindow({ uuidList, table });
              let tasks  = [], p = null;
              uuidList.forEach((item) => {
                p =queryHaLevels(item);
                tasks.push(p);
                p =getVmConsoleAddress(item);
                tasks.push(p)
                p = getVmConsolePassword(item)
                tasks.push(p);
              })
              Promise.all(tasks).then(() => {
                this.itemList = this.getData();
              })
            })
          })
      },
      create: async function (param) {
        let resp = await rpc.create('vm-instances', param)
        let uuidList = this.windowData.uuidList.slice()
        uuidList.unshift(resp.inventory.uuid)
        let row = {}
        row[resp.inventory.uuid] = {}
        row[resp.inventory.uuid].selected = false
        let table = Object.assign({}, { ...this.windowData.table }, row)
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'vm',
          list: [resp.inventory]
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
      delete: function (uuidList) {
        let event = this.createEvent('virtualRouter.action.delete', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/${uuid}`, null, event)
              .then((resp) => {
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
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
      updateCount: function () {
        rpc.query('vm-instances/appliances/virtual-routers', {
          count: true
        }).then((resp) => {
          this.updateWindow({
            availableCount: resp.total
          })
        })
      },
      openConsole: function (uuid) {
        let event = this.createEvent('virtualRouter.action.openConsole', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
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
      consolePasswordIsSet: function (uuid) {
        return this.dbData.vmInstancesConsolePassword[uuid] && this.dbData.vmInstancesConsolePassword[uuid].hasPassword
      },
      expunge: function (uuidList) {
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
              'expungeVmInstance': {}
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
      start: function (uuidList, fn) {
        let event = this.createEvent('virtualRouter.action.start', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
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
          })(uuid)
        })
      },
      stop: function (uuidList) {
        const self = this
        let event = this.createEvent('virtualRouter.action.stop', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
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
          })(uuid)
        })
      },
      recover: function (uuidList) {
        let event = this.createEvent('vm.action.recover', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('vm-instances', uuid, {
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
          })(uuid)
        })
      },
      reconnect: function (uuidList) {
        let event = this.createEvent('virtualRouter.action.reconnect', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        const self = this
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let vmInventory = _.cloneDeep(self.dbData.vm[uuid])
            vmInventory.status = 'Connecting'
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: vmInventory
            })
            rpc.update('vm-instances/appliances/virtual-routers', uuid, {
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
          })(uuid)
        })
      },
      reboot: function (uuidList) {
        let event = this.createEvent('virtualRouter.action.reboot', uuidList.length === 1 ? this.dbData.vm[uuidList[0]].name : '', uuidList.length)
        let self = this, p = null, tasks = [];
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
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks);
      },
      resume: function (uuidList) {
        let  self = this, p = null, tasks = [];
        uuidList.forEach(function (uuid) {
          ((uuid) => {
           p = rpc.update('vm-instances', uuid, {
              'resumeVmInstance': {}
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
      pause: function (uuidList) {
        let self = this, p = null, tasks = [];
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('vm-instances', uuid, {
              'pauseVmInstance': {}
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
        return Promise.all(p);
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
       return  rpc.update('vm-instances', uuid, {
          'cloneVmInstance': {
            'strategy': strategy,
            'names': names
          }
        })
          .then((resp) => {
            this.updateDbTable({
              tableName: 'vm',
              data: resp.inventories
            })
          })
      },
      reimage: function (vmInstanceUuid) {
       return rpc.update('vm-instances', vmInstanceUuid, {
          'reimageVmInstance': {}
        })
          .then((resp) => {
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
      // migrate: function (volumeUuid, destHostUuid) {
      //   rpc.update(`primary-storage/local-storage/volumes`, volumeUuid, {
      //     'localStorageMigrateVolume': {
      //       'destHostUuid': destHostUuid
      //     }
      //   })
      //   .then((resp) => {
      //     console.log(resp)
      //   })
      // },
      migrate: function (vmInstanceUuid, hostUuid) {
        let event = this.createEvent('virtualRouter.action.migrate', this.dbData.vm[vmInstanceUuid] ? this.dbData.vm[vmInstanceUuid].name : '')
        return rpc.update('vm-instances', vmInstanceUuid, {
          'migrateVm': {
            'hostUuid': hostUuid
          }
        }, event)
          .then(resp => {
            this.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'vm',
              id: vmInstanceUuid,
              data: resp.inventory
            })
          }, () => {
            this.incEventFail(event)
          })
      },
      inStates: function () {
        if (!this.isSelected) return
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        if (this.isSingleSelected) {
          return !stateList.every((item, index, array) => {
            return item !== this.dbData.vm[this.selectedList[0]].state
          })
        }
        let uuidList = []
        let resp = true
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        uuidList.forEach((uuid) => {
          if (stateList.every((item, index, array) => { return item !== this.dbData.vm[uuid].state })) resp = false
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
        let event = self.createEvent('vm.action.deleteVmConsolePassword', this.dbData.vm[uuidList[0]] ? this.dbData.vm[uuidList[0]].name : '')
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/${uuid}/console-password`, null, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'vmInstancesConsolePassword',
                  id: uuid,
                  data: {
                    hasPassword: false
                  }
                }).then(() => {
                  self.$forceUpdate()
                })
                // let vm = _.cloneDeep(self.dbData.vm[uuid])
                // vm.hasConsolePassword = false
                // self.updateDbRow({
                //   tableName: 'vm',
                //   id: uuid,
                //   data: vm
                // })
                self.incEventSuccess(event)
                if (isReboot) {
                  self.reboot([uuid])
                }
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      setVmConsolePassword: function (uuid, password, isReboot) {
        const self = this
        let event = this.createEvent('vm.action.setVmConsolePassword', this.dbData.vm[uuid] ? this.dbData.vm[uuid].name : '')
       return rpc.put(`vm-instances/${uuid}/actions`, {
          'setVmConsolePassword': {
            'consolePassword': password
          }
        }, event)
          .then((resp) => {
            if (isReboot) {
              this.reboot([uuid])
            }
            // resp.inventory.hasConsolePassword = true
            // this.updateDbRow({
            //   tableName: 'vm',
            //   id: uuid,
            //   data: resp.inventory
            // })
            this.updateDbRow({
              tableName: 'vmInstancesConsolePassword',
              id: uuid,
              data: {
                hasPassword: true
              }
            }).then(() => {
              self.$forceUpdate()
            })
            this.incEventSuccess(event)
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
