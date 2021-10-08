<script>
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      create: async function (routeTableUuid, param) {
        let event = this.createEvent('vRouterRouteEntry.action.add')
        let resp
        try {
          resp = await rpc.create(`vrouter-route-tables/${routeTableUuid}/route-entries`, param, event)
          this.incEventSuccess(event)
        } catch (e) {
          console.log(e)
          this.incEventFail(event)
          return
        }
        let uuidList = this.windowData.uuidList.slice()
        uuidList.unshift(resp.inventory.uuid)
        let row = {}
        row[resp.inventory.uuid] = {}
        row[resp.inventory.uuid].selected = false
        let table = Object.assign({}, { ...this.windowData.table }, row)
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'vRouterRouteEntry',
          list: [resp.inventory]
        })
        rpc.query(`vrouter-route-tables/${routeTableUuid}`)
          .then((resp) => {
            this.updateDbTable({
              tableName: 'vRouterRouteTable',
              list: resp.inventories
            })
          })
        this.updateCount()
      },
      delete (routeTableUuid, uuidList, fn) {
        const self = this
        let event = self.createEvent('vRouterRouteEntry.action.delete')
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            console.log(rpc)
            let p = rpc._delete(`vrouter-route-tables/${routeTableUuid}/route-entries/${uuid}`, null, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      attach (uuidList, fn) {
        const self = this
        let event = self.createEvent('hybridKey.action.Attach', uuidList.length === 1 ? self.dbData.vRouterRouteEntry[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.put(`vrouter-route-tables/route-entries/${uuid}/attach`, null, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      detach (uuidList, fn) {
        const self = this
        let event = self.createEvent('hybridKey.action.Detach', uuidList.length === 1 ? self.dbData.vRouterRouteEntry[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.put(`vrouter-route-tables/route-entries/${uuid}/detach`, null, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      getVRouterRouteTableName: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.vRouterRouteTable[self.dbData.vRouterRouteEntry[uuid].routeTableUuid].name
        } catch (e) {
          if (self.checkBounce(`getVRouterRouteTableName-${uuid}`)) return ''
          value = ''
          return rpc.queryResourceNames(self, 'vRouterRouteTable', self.dbData.vRouterRouteEntry[uuid].routeTableUuid)
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
      ...Utils
    }
  }
</script>

