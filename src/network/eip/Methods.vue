<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        this.windowData.loading = true;
        // if (this.windowData.conditions === undefined) this.windowData.conditions = []
        let resp = await rpc.query('eips', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: this.windowData.conditions
        })
         this.windowData.loading = false;
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let vipUuidList = resp.inventories.map((item) => item.vipUuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        const self = this
        let tasks = []
        let p = null
        let l3NetworkUuidList = []
        p = rpc.getResourceAccount(uuidList, self)
        tasks.push(p)
        p = rpc.query('vips', {
          q: `uuid?=${vipUuidList.join()}`
        }).then((result) => {
          l3NetworkUuidList = l3NetworkUuidList.concat(result.inventories.map(it => it.l3NetworkUuid))
          self.updateDbTable({
            tableName: 'vip',
            list: result.inventories
          })
          // result.inventories.forEach((item, index) => {
          //   resp.inventories.forEach((i) => {
          //     if (i.vipUuid === item.uuid) {
          //       i.l3NetworkUuid = item.l3NetworkUuid
          //     }
          //   })
          l3NetworkUuidList.forEach(function (ituuid) {
            ((ituuid) => {
              rpc.query('hosts', {
                q: `cluster.l2Network.l3Network.uuid=${ituuid}`,
                limit: 1,
                fields: 'hypervisorType'
              }).then((l3host) => {
                if (l3host.inventories.length === 0) l3host.inventories = [{ 'hypervisorType': '' }]
                self.forceUpdateDbRow({
                  tableName: 'l3NetworkOfHost',
                  id: ituuid,
                  data: l3host.inventories
                })
              })
            })(ituuid)
          })
          // })
        })
        tasks.push(p)

        resp.inventories.forEach((item, index) => {
          ((item) => {
            if (this.dbData.common.isAdmin) {
              p = rpc.query('accounts/resources/refs', {
                q: `resourceUuid?=${item.uuid}`
              }).then((accountRefResp) => {
                if (accountRefResp.inventories.length > 0) {
                  item.accountUuid = accountRefResp.inventories[0].accountUuid
                  // item = _.assign(item, resp)
                  return rpc.queryResourceNames(this, 'account', [accountRefResp.inventories[0].accountUuid])
                }
              })
              tasks.push(p)
            }
          })(item)
        })

        p = () => {
          return rpc.query('l3-networks')
            .then((result) => {
              this.updateDbTable({
                tableName: 'l3network',
                list: result.inventories
              })
            })
        }
        tasks.push(p)
        // let queryVmInstances = () => {
        //   return rpc.query('vm-instances')
        //   .then((result) => {
        //     this.updateDbTable({
        //       tableName: 'vm',
        //       list: result.inventories
        //     })
        //   })
        // }
        // let tasks = [ queryVips(), queryL3Networks() ]
        let queryL3Network = (uuid, vmNicUuid) => {
          return rpc.query('l3-networks', {
            q: `vmNic.uuid=${vmNicUuid}`
          }).then((result) => {
            this.dbData.eip[uuid].peerL3NetworkUuids = resp.inventories.map((item) => item.uuid)
            this.updateDbRow({
              tableName: 'eip',
              id: uuid,
              data: this.dbData.eip[uuid]
            })
          })
        }
        let queryVmInstance = (uuid, vmNicUuid) => {
          return rpc.query('vm-instances', {
            q: `vmNics.uuid?=${vmNicUuid}`
          }).then((result) => {
            this.dbData.eip[uuid].vmInstanceUuid = result.inventories[0].uuid
            this.dbData.eip[uuid].vmInstanceName = result.inventories[0].name
            this.updateDbRow({
              tableName: 'eip',
              id: uuid,
              data: this.dbData.eip[uuid]
            })
            this.updateDbRow({
              tableName: 'vmNicVmInstanceRef',
              id: vmNicUuid,
              data: {
                uuid: result.inventories[0].uuid
              }
            })
            this.updateDbRow({
              tableName: 'vm',
              id: result.inventories[0].uuid,
              data: result.inventories[0]
            })
            setTimeout(this.resizeHeader, 0)
          })
        }
        let queryOwners = (it) => {
          if (this.dbData.common.isAdmin) {
            return rpc.query('accounts/resources/refs', {
              q: `resourceUuid?=${it.uuid}`
            }).then((accountRefResp) => {
              if (accountRefResp.inventories.length > 0) {
                it.accountUuid = accountRefResp.inventories[0].accountUuid
                this.updateDbRow({
                  tableName: 'eip',
                  id: it.uuid,
                  data: it
                })
                return rpc.queryResourceNames(this, 'account', [accountRefResp.inventories[0].accountUuid])
              }
            })
          }
        }
        Promise.all(tasks).then(() => {
          resp.inventories.forEach((item) => {
            if (item.vmNicUuid !== undefined) {
              queryL3Network(item.uuid, item.vmNicUuid)
              queryVmInstance(item.uuid, item.vmNicUuid)
            }
            queryOwners(item)
          })
          this.updateWindow({ uuidList, table })
          this.updateDbTable({
            tableName: 'eip',
            list: resp.inventories
          })
          this.itemList = this.getData()
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
      create: async function (param) {
        let uuid = await this._create(param)
          //await this.queryList()
        return uuid
      },
      _create: async function (param) {
        if (param.ipMode === true) { // Create New Vip
          let createVipMsg = {
            name: `vip-for-${param.name}`,
            description: param.description,
            requiredIp: param.requiredIp === '' ? undefined : param.requiredIp,
            l3NetworkUuid: param.l3NetworkUuid
          }
          let vipevent = this.createEvent('vip.action.create', `vip-for-${param.name}`)
          let resp
          try {
            resp = await rpc.create('vips', createVipMsg, vipevent)
            this.incEventSuccess(vipevent)
          } catch (e) {
            this.incEventFail(vipevent)
            return
          }
          let createEipMsg = {
            name: param.name,
            description: param.description,
            vipUuid: resp.inventory.uuid
          }
          // let eip = await rpc.create('eips', createEipMsg, event)
          let event = this.createEvent('eip.action.create', param.name)
          let eip
          try {
            eip = await rpc.create('eips', createEipMsg, event)
            this.incEventSuccess(event)
          } catch (e) {
            this.incEventFail(event)
          }
          // .then(() => {
          //   this.incEventSuccess(event)
          //   await this.queryList()
          //   return eip.inventory.uuid
          // }, () => {
          //   this.incEventFail(event)
          // })
          // await this.queryList()
          await this.updateDbRow({
            tableName: 'eip',
            id: eip.inventory.uuid,
            data: eip.inventory
          })
          return eip.inventory.uuid
        }
        if (param.ipMode === false) {
          let event = this.createEvent('eip.action.create', param.name)
          let createEipMsg = {
            name: param.name,
            description: param.description,
            vipUuid: param.vipUuid
          }
          let eip
          try {
            eip = await rpc.create('eips', createEipMsg, event)
            this.incEventSuccess(event)
          } catch (e) {
            console.log(e)
            this.incEventFail(event)
          }
          // await this.queryList()
          await this.updateDbRow({
            tableName: 'eip',
            id: eip.inventory.uuid,
            data: eip.inventory
          })
          return eip.inventory.uuid
        }
      },
      delete: function (uuidList, deleteVip) {
        const self = this
        let event = self.createEvent('eip.action.delete', uuidList.length === 1 ? self.dbData.eip[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            console.log(rpc)
            if (deleteVip) {
              let vip = _.cloneDeep(self.dbData.eip[uuid])
              p = rpc._delete(`vips/${vip.vipUuid}`, null, event)
                .then((resp) => {
                  // let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                  // let newTable = _.cloneDeep(self.windowData.table)
                  // delete newTable[uuid]
                  // self.updateWindow({
                  //   uuidList: newUuidList,
                  //   table: newTable
                  // })
                  // self.updateCount()
                  self.incEventSuccess(event)
                }, () => {
                  self.incEventFail(event)
                })
              tasks.push(p)
            } else {
              p = rpc._delete(`eips/${uuid}`, null, event)
                .then((resp) => {
                  // let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                  // let newTable = _.cloneDeep(self.windowData.table)
                  // delete newTable[uuid]
                  // self.updateWindow({
                  //   uuidList: newUuidList,
                  //   table: newTable
                  // })
                  // self.updateCount()
                  self.incEventSuccess(event)
                }, () => {
                  self.incEventFail(event)
                })
              tasks.push(p)
            }
          })(uuid)
        })
        return Promise.all(tasks)
      },
      updateCount: function () {
        rpc.query('eips', {
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      attachEipToVm: function (uuid, vmNicUuid) {
        const self = this
        let event = self.createEvent('eip.action.attach', self.dbData.eip[uuid].name)
        return rpc.post(`eips/${uuid}/vm-instances/nics/${vmNicUuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      detach: function (uuidList) {
        const self = this
        let tasks = []
        let p = null
        let event = self.createEvent('eip.action.detach', uuidList.length === 1 ? self.dbData.eip[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`eips/${uuid}/vm-instances/nics`, null, event)
              .then((resp) => {
                resp.inventory.vmInstanceName = ''
                resp.inventory.guestIp = ''
                // resp.inventory.peerL3NetworkUuid = ''
                resp.inventory.vmNicUuid = ''
                self.updateDbRow({
                  tableName: 'eip',
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
        return Promise.all(tasks)
      },
      detachOneEip: function () {
        let self = this
        let uuid = self.windowData.dataUuid
        let vmInstanceName
        rpc.query('vm-instances', {
          q: `vmNics.uuid=${self.dbData.eip[uuid].vmNicUuid}`,
          fields: 'name'
        }).then((resp) => {
          vmInstanceName = resp.inventories[0].name
          self.openDialog('ConfirmDlg', {
            uuidList:  [vmInstanceName],
            title: 'eip.detachVm',
            description: 'eip.action.detachVm',
            icon: 'vm_plain',
            ok: () => {
              self.detach([uuid])
                .then(() => {
                  self.query()
                })
            },
            getName: (name) => {
              return name;
            }
          })
        })
        // self.dbData.eip[uuid].vmInstanceName
      },
      changeResourceOwner: async function (uuidListParam, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(uuidListParam, accountUuid)
        let event = self.createEvent('eip.action.changeOwner', uuidList.length === 1 ? self.dbData.eip[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event).then((resp) => {
            let eip = {}
            eip.accountUuid = accountUuid
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'eip',
              id: uuid,
              data: eip
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      changeResourceToAccountOrProject: async function (resourceUuidList, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(resourceUuidList, accountUuid)
        let event = this.createEvent('eip.action.changeOwner', this.dbData.eip[uuidList[0]] ? this.dbData.eip[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
              let eip = {}
              eip.accountUuid = accountUuid
              self.updateDbRow({
                tableName: 'eip',
                id: uuid,
                data: eip
              })
              return self.updateDbRow({
                tableName: 'resourceOwner',
                id: uuid,
                data: {
                  uuid: resp.inventory.accountUuid
                }
              })
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      getVipName: function (uuid) {
        let value
        try {
          value = this.dbData.vip[this.dbData.eip[uuid].vipUuid].name
        } catch (e) {
          if (this.checkBounce(`getVipName-${uuid}`)) return ''
          value = ''
          return rpc.query(`vips/${this.dbData.eip[uuid].vipUuid}`, {
            fields: 'name'
          })
            .then((resp) => {
              return this.updateDbRow({
                tableName: 'vip',
                id: this.dbData.eip[uuid].vipUuid,
                data: resp.inventories[0]
              })
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getVmInstanceName: function (uuid) {
        let value = ''
        try {
          let vmNicUuid = this.dbData.eip[uuid].vmNicUuid
          let vmInstanceUuid = this.dbData.vmNicVmInstanceRef[vmNicUuid].uuid
          value = this.dbData.vm[vmInstanceUuid].name
        } catch (e) {
          if (this.checkBounce(`getVmInstanceName-${uuid}`)) return ''
          value = ''
          let vmNicUuid = this.dbData.eip[uuid].vmNicUuid
          rpc.query('vm-instances', {
            q: `vmNics.uuid?=${vmNicUuid}`
          }).then((result) => {
            if (result.inventories.length <= 0) return
            let uuid = result.inventories[0].uuid
            this.updateDbRow({
              tableName: 'vmNicVmInstanceRef',
              id: vmNicUuid,
              data: {
                uuid: result.inventories[0].uuid
              }
            })
            this.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: result.inventories[0]
            })
          }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getAccountName: function (uuid) {
        let value = ''
        try {
          value = this.dbData.account[this.dbData.eip[uuid].accountUuid].name
        } catch (e) {
          if (this.checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            this.dbData.eip[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', accountRefResp.inventories[0].accountUuid)
          })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      ...Utils
    }
  }
</script>
