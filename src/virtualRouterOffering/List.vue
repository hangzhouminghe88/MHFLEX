<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import VirtualRouterInstanceOfferingMethods from './Methods'

  export default {
    mixins: [WindowBase, VirtualRouterInstanceOfferingMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    computed: {
      itemList () {
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.instanceOffering[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.instanceOffering[uuid]
          }
        )
      }
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    },
    methods: {

      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: function () {
        // __printCallStack()
        // const self = this
        // if (this.windowData.conditions === undefined) this.windowData.conditions = []

        return rpc.query(`instance-offerings/virtual-routers`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`].concat(this.windowData.conditions)
        }).then((resp) => {
          this.updateCount()
          let uuidList = resp.inventories.map((item) => item.uuid)
          rpc.getResourceAccount(uuidList, this)
          let l3networkList = _.merge(_.uniq(resp.inventories.map((item) => item.managementNetworkUuid)), _.uniq(resp.inventories.map((item) => item.publicNetworkUuid)))
          rpc.query('l3-networks', {
            q: `uuid?=${l3networkList}`
          }).then((l3resp) => {
            this.updateDbTable({
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
          if (this.dbData.common.isAdmin) {
            let resourceUuidList
            rpc.query(`accounts/resources/refs`, {
              q: 'resourceUuid?=' + uuidList
            })
              .then((resp) => {
                let accountInventories = resp.inventories
                resourceUuidList = [...new Set(resp.inventories.map((item) => item.accountUuid))].join()
                return rpc.query(`accounts`, {
                  q: 'uuid?=' + resourceUuidList
                })
                  .then((resp) => {
                    accountInventories.forEach((item, index) => {
                      item.uuid = item.resourceUuid
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
            let tasks = () => {
              return resp.inventories.map((item, index) => {
                return this.isShareToAll(item.uuid)
                  .then((toPublic) => {
                    resp.inventories[index].toPublic = toPublic
                  })
              })
            }
            return Promise.all(tasks())
              .then(() => {
                this.updateDbTable({
                  tableName: 'instanceOffering',
                  list: resp.inventories
                })
                this.updateWindow({ uuidList, table })
              })
          }
          this.updateDbTable({
            tableName: 'instanceOffering',
            list: resp.inventories
          })
          this.updateWindow({ uuidList, table })
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
      canShareToAll: function () {
        if (!this.isSelected) return false
        if (!this.hasNotSharedToAll()) return false
        if (this.selectedList.every((uuid) => this.isVCenterVirtualRouterOffering(uuid))) return false
        return true
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.destory', uuidList.length === 1 ? self.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc._delete(`instance-offerings/${uuid}`)
              .then((resp) => {
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(uuid)
        })
      }
    }
  }
</script>
