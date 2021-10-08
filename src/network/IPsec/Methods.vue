<script>
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.selectStr}%25`)
        }
        return conditionList
      },
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.ipsec[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.ipsec[uuid]
          }
        )
      },
      queryList: function () {
        this.windowData.loading = true;
        let ipsecInventories
        let table = {}
        let uuidList = []
        // let windowDataConditions = this.windowData.conditions ? this.windowData.conditions : []
        rpc.query(`ipsec`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: [].concat(windowDataConditions)
        }).then((resp) => {
           this.windowData.loading = false;
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
            availableCount: resp.total
          })
          uuidList = resp.inventories.map((item) => item.uuid)
          let vipUuidList = resp.inventories.map((item) => item.vipUuid)
          ipsecInventories = resp.inventories
          if (resp.inventories.length === 0) {
            this.updateWindow({ uuidList })
            return
          }
          this.updateDbTable({
            tableName: 'ipsec',
            list: ipsecInventories
          })
          this.updateWindow({ uuidList })
            .then(() => {
              this.itemList = this.getData();
            })
          rpc.query(`vips`, {
            q: `uuid?=${vipUuidList}`
          }).then((vipresp) => {
            this.updateDbTable({
              tableName: 'vip',
              list: vipresp.inventories
            })
          })
        })
      },
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
      create: async function (param) {
        await this._create(param)
      },
      _create: async function (param) {
        let baseIPsecMsg = {
          name: param.name,
          description: param.description,
          systemTags: ['ephemeral::deleteVipOnFailure'],
          peerAddress: param.peerAddress,
          authKey: param.authKey,
          l3NetworkUuid: param.privateL3NetworkUuidList[0],
          peerCidrs: param.peerCidrs,
          // vipUuid: vipResp.inventory.uuid,
          authMode: param.authMode,
          policyMode: param.policyMode,
          ikeAuthAlgorithm: param.ikeAuthAlgorithm,
          ikeDhGroup: param.ikeDhGroup,
          ikeEncryptionAlgorithm: param.ikeEncryptionAlgorithm,
          policyEncryptionAlgorithm: param.policyEncryptionAlgorithm,
          policyAuthAlgorithm: param.policyAuthAlgorithm,
          transformProtocol: param.transformProtocol
          // pfs: param.pfs
        }
        let ipsecMsg = {}
        if (param.isCreateVip === true) {
          let vipResp = await this.createVipForIPsec(param)
          if (!vipResp.inventory) return

          if (param.pfs !== '') {
            ipsecMsg = {
              ...baseIPsecMsg,
              vipUuid: vipResp.inventory.uuid,
              pfs: param.pfs
            }
          } else {
            ipsecMsg = {
              ...baseIPsecMsg,
              vipUuid: vipResp.inventory.uuid
            }
          }
        } else {
          if (param.pfs !== '') {
            ipsecMsg = {
              ...baseIPsecMsg,
              vipUuid: param.vipUuid,
              pfs: param.pfs
            }
          } else {
            ipsecMsg = {
              ...baseIPsecMsg,
              vipUuid: param.vipUuid
            }
          }
        }
        let ipsecevent = this.createEvent('ipsec.action.add', param.name)
        let ipsecResp = {}
        try {
          ipsecResp = await rpc.create('ipsec', ipsecMsg, ipsecevent)
          this.incEventSuccess(ipsecevent)
        } catch (e) {
          this.incEventFail(ipsecevent)
          return
        }
        if (param.privateL3NetworkUuidList.length > 1) {
          param.privateL3NetworkUuidList.shift()
          await this.attachLocalCidrToIPsec(param.privateL3NetworkUuidList, ipsecResp.inventory.uuid, ipsecResp.inventory.name)
        }
        // await this.queryList()
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('ipsec.action.delete', uuidList.length === 1 ? self.dbData.ipsec[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`ipsec/${uuid}`, null, event)
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
          })(uuid)
        })
        return Promise.all(tasks)
      },
      updateCount: function () {
        rpc.query('ipsec', {
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      getVipName: function (uuid) {
        let value
        try {
          value = this.dbData.vip[this.dbData.ipsec[uuid].vipUuid].name
        } catch (e) {
          if (this.checkBounce(`getVipName-${uuid}`)) return ''
          value = ''
          return rpc.query(`vips/${this.dbData.ipsec[uuid].vipUuid}`, {
            fields: 'name'
          })
            .then((resp) => {
              return this.updateDbRow({
                tableName: 'vip',
                id: this.dbData.ipsec[uuid].vipUuid,
                data: resp.inventories[0]
              })
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      attachLocalCidrToIPsec: function (uuidList, ipsecUuid, name) {
        const self = this
        let event = self.createEvent('ipsec.action.attachLocalCidrToIPsec', name || self.dbData.ipsec[ipsecUuid].name)
        return rpc.create(`ipsec/${ipsecUuid}/l3networks`, {
          l3NetworkUuids: uuidList
        }, event)
          .then((resp) => {
            self.updateCount()
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      detachLocalCidrFromIPsec: function (uuidList, ipsecUuid) {
        const self = this
        let event = self.createEvent('ipsec.action.detachLocalCidrFromIPsec', self.dbData.ipsec[ipsecUuid].name)
        return rpc._delete(`ipsec/${ipsecUuid}/l3networks`, {
          l3NetworkUuids: uuidList
        }, event)
          .then((resp) => {
            self.updateCount()
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      addRemoteCidrToIPsec: function (peerCidrs, ipsecUuid) {
        const self = this
        let event = self.createEvent('ipsec.action.addRemoteCidrToIPsec', self.dbData.ipsec[ipsecUuid].name)
        return rpc.create(`ipsec/${ipsecUuid}/remote-cidrs`, {
          peerCidrs: peerCidrs
        }, event)
          .then((resp) => {
            self.updateCount()
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      deleteRemoteCidrFromIPsec: function (peerCidrs, ipsecUuid) {
        const self = this
        let event = self.createEvent('ipsec.action.deleteRemoteCidrFromIPsec', self.dbData.ipsec[ipsecUuid].name)
        return rpc._delete(`ipsec/${ipsecUuid}/remote-cidrs`, {
          peerCidrs: peerCidrs
        }, event)
          .then((resp) => {
            self.updateCount()
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      ...Utils
    }
  }
</script>

