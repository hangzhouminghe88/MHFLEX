<script>
  import rpc from 'src/utils/rpc'
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      createVRouterRouteEntry (routeTableUuid, param, fn) {
        const self = this
        let event = self.createEvent('vRouterRouteEntry.action.add')
        return rpc.create(`vrouter-route-tables/${routeTableUuid}/route-entries`, param, event)
          .then((resp) => {
            self.incEventSuccess(event)
            rpc.query(`vrouter-route-tables/${routeTableUuid}`)
              .then((resp) => {
                this.updateDbTable({
                  tableName: 'vRouterRouteTable',
                  list: resp.inventories
                })
              })
            if(fn) fn();
          }, () => {
            self.incEventFail(event)
          })
      },
      delete (uuidList, fn) {
        const self = this
        let event = self.createEvent('vrouterroutetable.action.delete', uuidList.length === 1 ? self.dbData.vRouterRouteTable[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vrouter-route-tables/${uuid}`, null, event)
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
      attach (routeTableUuid, uuidList, fn) {
        const self = this
        let event = self.createEvent('vrouterroutetable.action.attach', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.create(`vrouter-route-tables/${routeTableUuid}/attach`, {
              virtualRouterVmUuid: uuid
            }, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      detach (routeTableUuid, uuidList, fn) {
        const self = this
        let event = self.createEvent('vrouterroutetable.action.detach', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.create(`vrouter-route-tables/${routeTableUuid}/detach`, {
              virtualRouterVmUuid: uuid
            }, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
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
