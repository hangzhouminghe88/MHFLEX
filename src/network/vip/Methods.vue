<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      getCondition: async function () {
        let conditionList = []
        conditionList.push(`l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        let uuidList = await this.initVipUuidList()
        conditionList.push(`uuid?=${uuidList}`)
        return conditionList
      },
      initVipUuidList: async function (tableName) {
        let vipUuidList = []
        let vipResp = await rpc.query(`vips`, {q: `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`})


        vipResp.inventories.forEach(item => {
          if (this.windowData.currTab === 'system') {
            if (_.has(item, 'useFor') && item.useFor.indexOf('SNAT') > -1) {
              vipUuidList.push(item.uuid)
            }
          } else {
            if (!_.has(item, 'useFor') || item.useFor.indexOf('SNAT') === -1) {
              vipUuidList.push(item.uuid)
            }
          }
        })
        return vipUuidList
      },
      queryList: async function () {
        let self = this;
        self.windowData.loading = true;
        let conditionList = await self.getCondition()
        let resp = await rpc.query('vips', {
          count: false,
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          q: conditionList
          // q: this.windowData.conditions
        })
        self.windowData.loading = false;
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          availableCount: resp.total
        })

        if (self.updateCount) {
          self.updateCount()
        }

        let uuidList = resp.inventories.map((item) => item.uuid)
        rpc.getResourceAccount(uuidList, self)
        let l3NetworkUuidList = _.uniq(resp.inventories.map((item) => item.l3NetworkUuid))
        rpc.query('l3-networks', {
          q: `uuid?=${l3NetworkUuidList}`
        }).then((l3resp) => {
          self.updateDbTable({
            tableName: 'l3network',
            list: l3resp.inventories
          })
        })
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        l3NetworkUuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.query('hosts', {
              q: `cluster.l2Network.l3Network.uuid=${uuid}`,
              limit: 1,
              fields: 'hypervisorType'
            }).then((l3host) => {
              if (l3host.inventories.length === 0) l3host.inventories = [{'hypervisorType': ''}]
              self.forceUpdateDbRow({
                tableName: 'l3NetworkOfHost',
                id: uuid,
                data: l3host.inventories
              })
            })
          })(uuid)
        })

        let p
        let tasks = []
        resp.inventories.forEach((item, index) => {
          ((item) => {
            if (self.dbData.common.isAdmin) {
              p = rpc.query('accounts/resources/refs', {
                q: `resourceUuid?=${item.uuid}`
              }).then((accountRefResp) => {
                if (accountRefResp.inventories.length > 0) {
                  item.accountUuid = accountRefResp.inventories[0].accountUuid
                  item = _.assign(item, resp)
                  return rpc.queryResourceNames(self, 'account', [accountRefResp.inventories[0].accountUuid])
                }
              })
              tasks.push(p)
            }
          })(item)
        })

        Promise.all(tasks)
          .then(() => {
            self.updateWindow({uuidList, table})
            self.updateDbTable({
              tableName: 'vip',
              list: resp.inventories
            })
              .then(() => {
                self.itemList = self.getData()
              })
          })
      },
      getData(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.vip[uuid];
        })
      },
      changeCurrTab(tableName, event) {
        /*if (this.windowData.currTab !== tableName) {
          this.updateWindow({currTab: tableName}).then(() => {
            this.queryList()
          })
        }*/

        this.queryList()
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
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('vip.action.delete', uuidList.length === 1 ? self.dbData.vip[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`vips/${uuid}`, null, event)
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
        let conditions = [`l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditions = conditions.concat(this.windowData.searchConditionList)
        }
        return rpc.query(`vips`, {
          q: conditions
        }).then(resp => {
          let customizedCount = 0
          let systemCount = 0
          resp.inventories.forEach(item => {
            if (_.has(item, 'useFor') && item.useFor.indexOf('SNAT') > -1) systemCount++
            if (!_.has(item, 'useFor') || item.useFor.indexOf('SNAT') === -1) customizedCount++
          })
          return this.updateWindow({customizedCount, systemCount})
        })
      },
      getVipUseFor(uuid) {
        let vip = this.dbData.vip[uuid]
        if (!_.has(vip, 'useFor')) return ''
        let useForList = vip && vip.useFor.split(',')
        let value = ''
        vip && useForList.forEach(useFor => {
          value = value + this.$t(`vip.useFor.${useFor}`) + ','
        })
        value = value.replace(/,$/, '')
        return value
      },
      deleteOneVip: function () {
        let self = this
        let uuidList = [this.windowData.dataUuid]
        this.openDialog('ConfirmDlg', {
          uuidList,
          title:'vip.delete',
          description: 'vip.info.deleteConfirm',
          icon: 'vrouter_popupico',
          warning: 'vip.warning',
          ok: () => {
            self.delete(uuidList)
            self.$route.push({name: 'vip'});
          },
          getName: (uuid) => {
            return self.dbData.vip[uuid].name;
          }
        })
      },
      changeResourceOwner: async function (uuidListParam, accountUuid) {
        const self = this
        let uuidList = await self.uniqCurrentAccountResources(uuidListParam, accountUuid)
        let event = self.createEvent('vip.action.changeOwner', uuidList.length === 1 ? self.dbData.vip[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event).then(resp => {
            let vip = {}
            vip.accountUuid = accountUuid
            self.incEventSuccess(event)
            return self.updateDbRow({
              tableName: 'vip',
              id: uuid,
              data: vip
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
        let event = this.createEvent('vip.action.changeOwner', this.dbData.vip[uuidList[0]] ? this.dbData.vip[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc.create(`account/${accountUuid}/resources`, {
            'resourceUuid': uuid
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
              let vip = {}
              vip.accountUuid = accountUuid
              self.updateDbRow({
                tableName: 'vip',
                id: uuid,
                data: vip
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
      create: async function (param) {
        return this._create(param)
      },
      _create: function (param) {
        let self = this
        if (param.requiredIp === '') {
          param.requiredIp = undefined
        }
        let obj = {
          name: param.name,
          description: param.description,
          l3NetworkUuid: param.l3NetworkUuid,
          requiredIp: param.requiredIp
        }
        let event = self.createEvent('vip.action.create', param.name)
        return rpc.create('vips', obj, event)
          .then((resp) => {
            let qosParams = param.qosParams ? param.qosParams.filter(item => item.port || item.inboundBandwidth || item.outboundBandwidth) : []
            if (!self.dbData.common.isOpensource && qosParams.length > 0) {
              self.addVipQos(resp.inventory.uuid, qosParams, resp.inventory.name)
                .then(() => {
                  // if (self.queryList) {
                  //   self.queryList()
                  // }
                  self.incEventSuccess(event)
                })
            } else {
              // if (self.queryList) {
              //   self.queryList()
              // }
              self.incEventSuccess(event)
            }
          }, () => {
            self.incEventFail(event)
          })
      },
      addVipQos: function (vipUuid, params, vipName) {
        const self = this
        if (params.length === 0) return
        let event = self.createEvent('vip.action.setQos', vipName !== undefined ? vipName : self.dbData.vip[vipUuid].name, params.length)
        let tasks = []
        params.forEach(param => {
          let obj = {}
          if (param.port) obj['port'] = param.port
          if (param.inboundBandwidth) obj['inboundBandwidth'] = param.inboundBandwidth
          if (param.outboundBandwidth) obj['outboundBandwidth'] = param.outboundBandwidth
          let p = rpc.put(`vips/${vipUuid}/actions`, {
            setVipQos: obj
          }, event).then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      deleteVipQos: function (vipUuid, ports) {
        const self = this
        let event = self.createEvent('vip.action.deleteQos', self.dbData.vip[vipUuid].name, ports.length)
        let tasks = []
        ports.forEach(port => {
          let p = rpc._delete(`vips/${vipUuid}/vip-qos`, {
            port: port
          }, event).then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      ...Utils
    }
  }
</script>
