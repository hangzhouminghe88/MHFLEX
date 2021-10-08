<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'

  export default {
    created: function () {
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      queryList: function () {
        this.windowData.loading = true;
        // if (this.windowData.conditions === undefined) this.windowData.conditions = []
        return rpc.query('port-forwarding', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: this.windowData.conditions
        }).then((resp) => {
          this.windowData.loading = false;
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
            availableCount: resp.total
          })
          let table = {}
          let uuidList
          uuidList = resp.inventories.map((item) => item.uuid)
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          let queryVip = () => {
            let vipUuidList = _.uniq(resp.inventories.map((item) => item.vipUuid))
            if (vipUuidList.length === 0) return
            return rpc.query('vips', {
              q: `uuid?=${vipUuidList}`
            }).then((resp) => {
              return this.updateDbTable({
                tableName: 'vip',
                list: resp.inventories
              })
            })
          }
          let l3networkList = _.merge(_.uniq(resp.inventories.map((item) => item.managementNetworkUuid)), _.uniq(resp.inventories.map((item) => item.publicNetworkUuid)))
          rpc.query('l3-networks', {
            q: `uuid?=${l3networkList}`
          }).then((l3resp) => {
            this.updateDbTable({
              tableName: 'l3network',
              list: l3resp.inventories
            })
          })
          let queryVms = () => {
            let vmUuidList = resp.inventories.filter((item) => !!item.vmNicUuid).map((i) => i.vmNicUuid)
            if (vmUuidList.length === 0) return
            return rpc.query(`vm-instances`, {
              q: `vmNics.uuid?=${_.uniq(vmUuidList).join()}`
            }).then((resp) => {
              return this.updateDbTable({
                tableName: 'vm',
                list: resp.inventories
              })
            })
          }
          let queryOwners = () => {
            if (this.dbData.common.isAdmin) {
              let accountsUuidList = _.uniq(uuidList)
              if (accountsUuidList.length === 0) return
              return rpc.query('accounts/resources/refs', {
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
            }
          }
          let tasks = [ queryVms(), queryOwners(), queryVip() ]
          Promise.all(tasks).then(() => {
            this.updateWindow({ uuidList, table })
            this.updateDbTable({
              tableName: 'portforwarding',
              list: resp.inventories
            })
            this.itemList = this.getData()
          })
        })
      },
      getCandidateVipForCreatePortforwarding: async function () {
        let vipUuidList = []
        let task = []
        let p = rpc.query('vips', {
          q: 'useFor%20is%20null',
          fields: 'uuid'
        }).then((resp) => {
          vipUuidList = vipUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        task.push(p)

        p = rpc.query('vips', {
          q: 'useFor==PortForwarding',
          fields: 'uuid'
        }).then((resp) => {
          vipUuidList = vipUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        task.push(p)

        return Promise.all(task).then(() => {
          vipUuidList = _.uniq(vipUuidList)
          return vipUuidList
        })
      },
      getVmUuid: function (uuid) {
        let vmUuid = ''
        let vm = this.dbData.vm
        for (let key in vm) {
          if (vm[key].vmNics && vm[key].vmNics.length > 0) {
            let vmNic = vm[key].vmNics.filter((i) => i.uuid === this.dbData.portforwarding[uuid].vmNicUuid)
            vmNic.length > 0 ? vmUuid = vm[key].uuid : void 0
          }
        }
        return vmUuid
      },
      getAccountName: function (uuid) {
        let value = ''
        try {
          value = this.dbData.account[this.dbData.portforwarding[uuid].accountUuid].name
        } catch (e) {
          if (this.checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            this.dbData.portforwarding[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', accountRefResp.inventories[0].accountUuid)
              .then(() => this.$forceUpdate())
          })
        }
        return value
      },
      hasVmNic: function () {
        if (!this.isSelected) return false
        if (this.isSingleSelected) {
          return !!this.dbData.portforwarding[this.selectedList[0]].vmNicUuid
        } else {
          return false
        }
      },
      create: async function (param) {
        let uuid = await this._create(param)
        return uuid
      },
      _create: async function (param) {
        let event = this.createEvent('portforwarding.action.add', param.name)
        let resp
        try {
          resp = await rpc.create('port-forwarding', param, event)
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
        }
        await this.updateDbRow({
          tableName: 'portforwarding',
          id: resp.inventory.uuid,
          data: resp.inventory
        })
        // await this.queryList()
        return resp.inventory.uuid
      },
      attachPortForwardingRule: function (ruleUuid, vmNicUuid) {
        let event = this.createEvent('portforwarding.action.attach', this.dbData.portforwarding[ruleUuid].name)
        return rpc.create(`port-forwarding/${ruleUuid}/vm-instances/nics/${vmNicUuid}`, null, event)
          .then((resp) => {
            console.log(resp)
            this.updateDbRow({
              tableName: 'portforwarding',
              id: ruleUuid,
              data: resp.inventory
            })
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      detachPortForwardingRule: function (uuidList) {
        const self = this
        let event = self.createEvent('portforwarding.action.detach', uuidList.length === 1 ? self.dbData.portforwarding[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let q = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            q = rpc._delete(`port-forwarding/${uuid}/vm-instances/nics`, null, event)
              .then((resp) => {
                console.log(resp)
                self.updateDbTable({
                  tableName: 'portforwarding',
                  list: [resp.inventory]
                })
                // self.queryList()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(q)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      updateCount: function () {
        rpc.query('port-forwarding', {
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('portforwarding.action.delete', uuidList.length === 1 ? self.dbData.portforwarding[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`port-forwarding/${uuid}`, null, event)
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
                // self.updateDbTable({
                //   tableName: 'vm',
                //   list: [resp.inventory]
                // })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      getVipName: function (uuid) {
        let value
        try {
          value = this.dbData.vip[this.dbData.portforwarding[uuid].vipUuid].name
        } catch (e) {
          if (this.checkBounce(`getVipName-${uuid}`)) return ''
          value = ''
          return rpc.query(`vips/${this.dbData.portforwarding[uuid].vipUuid}`, {
            fields: 'name'
          })
            .then((resp) => {
              return this.updateDbRow({
                tableName: 'vip',
                id: this.dbData.portforwarding[uuid].vipUuid,
                data: resp.inventories[0]
              })
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      ...Utils
    }
  }
</script>
