<script>
  import {mapState} from 'vuex';
  import Controller from './Controller'
  import Utils from 'src/utils/utils';
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'

  export default {
    name: "Methods",
    computed: {
      ...mapState({
        loadBalancer: state => state.loadBalancer
      }),
    },
    methods: {
      ...Utils,

      create: async function (param) {
        return await this._create(param)
      },
      _create: function (param) {
        return Controller.create(param, this)
      },
      queryList() {
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('loadBalancer/query', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then((resp) => {
           self.windowData.loading = false;
          this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            availableCount: resp.total
          }).then(() => {
            this.itemList = this.getData();
          })
        })
      },
      updateLoadBalancer: function (uuid) {
        let currloadBalancerUuid = localStorage.getItem('loadBalancer')
        if (uuid === currloadBalancerUuid) localStorage.setItem('loadBalancer', '')
      },
      getCondition() {
        let conditionList = []
        conditionList.push(`vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
       if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      getData() {
        let uuidList = []
        if (!_.isArray(this.windowData.uuidList)) return []

        uuidList = this.windowData.uuidList.filter(uuid => this.dbData.loadBalancer[uuid])

        return uuidList.map(uuid => {
          return this.dbData.loadBalancer[uuid]
        })
      },
      delete(uuidList, fn) {
        const self = this
        let event = self.createEvent('loadbalancer.action.delete', uuidList.length === 1 ? self.dbData.loadBalancer[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`load-balancers/${uuid}`, null, event)
              .then((resp) => {
                // let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                // let newTable = _.cloneDeep(self.windowData.table)
                // delete newTable[uuid]
                // self.updateWindow({
                //   uuidList: newUuidList,
                //   table: newTable
                // })
                self.incEventSuccess(event)
                if (fn) fn()
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      updateCount: function () {
        rpc.query('load-balancers', {
          count: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
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
      getVipName: function (uuid) {
        let value
        if(!(this.dbData.loadBalancer[uuid] && this.dbData.loadBalancer[uuid].vipUuid))return;
        try {
          value = this.dbData.vip[this.dbData.loadBalancer[uuid].vipUuid].name
        } catch (e) {
          if (this.checkBounce(`getVipName-${uuid}`)) return ''
          value = ''
          return rpc.query(`vips/${this.dbData.loadBalancer[uuid].vipUuid}`, {
            fields: 'name'
          })
            .then((resp) => {
              return this.updateDbRow({
                tableName: 'vip',
                id: this.dbData.loadBalancer[uuid].vipUuid,
                data: resp.inventories[0]
              })
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },

      getLoadBalancerPort (uuid) {
        return this.dbData.loadBalancer[uuid].listeners.map((item) => item.loadBalancerPort)
      },

      getAccountName: function (uuid) {
        let value = ''
        try {
          value = this.dbData.account[this.dbData.loadBalancer[uuid].accountUuid].name
        } catch (e) {
          if (this.checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            this.dbData.loadBalancer[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', accountRefResp.inventories[0].accountUuid)
          })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },

    }
  }
</script>

<style scoped>

</style>
