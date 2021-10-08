<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import Controller from './Controller'
  /* global localStorage:false */
  export default {
    methods: {
      getCondition: function () {
        return Controller.getCondition(this)
      },
      queryList: function () {
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('zone/basicQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          q: this.getCondition(),
          sortDirection: this.windowData.sortDirection,
          sortBy: this.windowData.sortBy,
          replyWithCount: true
        }).then(resp => {
           self.windowData.loading = false;
          let uuidList = resp.uuidList
          return this.updateWindow({
            uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            availableCount: resp.total
          })
        }).then(() => {
          self.itemList =  self.getList(self.windowData.uuidList)
        })
      },
      updateCount: function () {
        return Controller.updateCount(this)
      },
      create: function (param) {
        const self = this
        let event = self.createEvent('zone.action.create', param.name)
        return rpc.create('zones', param, event).then((resp) => {
          if (_.keys(self.dbData.zone).length === 0) {
            localStorage.setItem('currZoneUuid', resp.inventory.uuid)
          }
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
      },
      delete(uuidList) {
        let self = this;
        return self.dispatchActionWithEvent('zone/delete', uuidList)
      },
      attach(uuid, bsList) {
        const self = this
        let add = bsList.map(bs => rpc.create(`zones/${uuid}/backup-storage/${bs}`))
        Promise.all([...add])
          .then(resp => {
            self.updateDbRow({
              tableName: 'zone',
              id: uuid,
              data: resp.inventory
            })
          })
      },
      detach(uuid, bsList) {
        const self = this
        let deletions = bsList.map(bs => rpc._delete(`zones/${uuid}/backup-storage/${bs}`))
        Promise.all([...deletions])
          .then(resp => {
            self.updateDbRow({
              tableName: 'zone',
              id: uuid,
              data: resp.inventory
            })
          })
      },
      enable(uuidList) {
        let self = this;
        return self.dispatchActionWithEvent('zone/enable', uuidList)
      },
      disable(uuidList) {
        let self = this;
        return self.dispatchActionWithEvent('zone/disable', uuidList)
      },
      updateZone: function (uuid) {
        let currZoneUuid = localStorage.getItem('currZoneUuid')
        if (uuid === currZoneUuid) localStorage.setItem('currZoneUuid', '')
      },
      detailEnable(uuidList) {
        this.enable(uuidList)
      },
      detailDisable(uuidList) {
        let self = this
        this.openDialog('ConfirmDlg', {
          title: 'common.stopZone',
          description: 'zone.disable',
          waring: 'zone.disableWaring',
          icon: 'zone_popupico',
          getName(uuid) {
            return self.dbData.zone[uuid].name
          },
          uuidList,
          ok: () => {
            self.disable(uuidList)
              .then(() => {
                self.queryList();
              })
          }
        })
      },
      detailDelete(uuidList) {
        let self = this
        this.openDialog('ConfirmDlg', {
          uuidList,
          title: 'common.destroyZone',
          description: 'zone.delete',
          waring: 'zone.deleteWarning',
          icon: 'zone_popupico',
          getName(uuid) {
            return self.dbData.zone[uuid].name
          },
          ok: () => {
            self.delete(uuidList)
              .then(() => this.queryList())

          }
        })
      },
      pageDelete() {
        const self = this
        let uuidList = []
        this.windowData.selectList.map((item) => {
          uuidList.push(item.uuid)
        })
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'common.destroyZone',
            description: 'zone.delete',
            waring: 'zone.deleteWarning',
            icon: 'zone_popupico',
            getName(uuid) {
              return self.dbData.zone[uuid].name
            },
            ok: () => {
              self.delete(uuidList)
                .then(() => this.queryList())
            }
          })
        }
      },
      pageEnable() {
        let uuidList = []
        this.windowData.selectList.map((item) => {
          if (item.state !== 'Enable')
            uuidList.push(item.uuid);
        })
        if (uuidList.length > 0)
          this.enable(uuidList)
          .then(() => {
            this.queryList();
          })
      },
      pageDisable() {
        let uuidList = [], self = this;
        this.windowData.selectList.map((item) => {
          if (item.state !== 'Disabled')
            uuidList.push(item.uuid);
        })
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'common.stopZone',
            description: 'zone.disable',
            waring: 'zone.disableWaring',
            icon: 'zone_popupico',
            getName(uuid) {
              return self.dbData.zone[uuid].name
            },
            uuidList,
            ok: () => {
              self.disable(uuidList)
                .then(() => {
                  self.queryList();
                })
            }
          })
        }
      },
      openCreateZone() {
        this.$router.push('createZone');
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
