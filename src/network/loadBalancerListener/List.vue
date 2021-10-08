<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window'
  import LoadBalancerListenerMethods from './Methods'

  export default {
    mixins: [WindowBase, LoadBalancerListenerMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
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
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.loadBalancerListener[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.loadBalancerListener[uuid]
          }
        )
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`loadBalancer.vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      getIsOpensource () {
        return rpc.query('licenses').then(licensesResp => {
          return rpc.query('meta-data/opensource').then(opensourceResp => {
            let isOpensource = false
            if (opensourceResp.opensource || licensesResp.inventory.licenseType === 'Community') {
              isOpensource = true
            }
            return this.updateDbObject({
              name: 'common',
              data: {
                isOpensource
              }
            })
          })
        })
      },
      queryList: async function () {
        this.windowData.loading = true;
        let resp = await rpc.query('load-balancers/listeners', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        })
         this.windowData.loading = false;
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })

        let ipList = {}
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })

        let queryOwners = () => {
          let accountsUuidList = _.uniq(uuidList)
          if (accountsUuidList.length === 0) return
          if (!this.dbData.common.isAdmin || this.dbData.common.isOpensource) return
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

        let queryVmNicIp = () => {
          let _tasks = []
          _tasks = uuidList.map((uuid) => {
            return rpc.query('vm-instances/nics', {
              q: `loadBalancerListener.uuid=${uuid}`,
              fields: 'ip'
            })
              .then((resp) => {
                ipList[uuid] = resp.inventories.map((it) => it.ip)
                return new Promise((resolve, reject) => { resolve() })
              })
          })
          return Promise.all(_tasks)
        }

        let tasks = [ queryOwners() ]
        let queryMetric = () => rpc.query('zwatch/metrics', {
          namespace: 'ZStack/LoadBalancer',
          metricName: 'LoadBalancerBackendStatus',
          offsetAheadOfCurrentTime: 1,
          labels: [`ListenerUuid=~${uuidList.join('%7C')}`]
        })
          .then((resp) => {
            let loadBalancerListenerA = {}
            uuidList.forEach((uuid) => {
              loadBalancerListenerA[uuid] = {
                up: 0,
                total: ipList[uuid].length
              }
            })
            resp.data.forEach((item) => {
              if (item.value > 0 && ipList[item.labels.ListenerUuid].find((x) => x === item.labels.NicIpAddress)) loadBalancerListenerA[item.labels.ListenerUuid].up ++
            })
            let _array = []
            _.forIn(loadBalancerListenerA, (value, key) => {
              _array.push({
                uuid: key,
                ...value
              })
            })
            return this.updateDbTable({
              tableName: 'loadBalancerListenerA',
              list: _array
            })
          })

        rpc.getResourceAccount(uuidList, this)
        queryVmNicIp()
          .then(() => {
            if (this.dbData.common.isOpensource) return new Promise((resolve, reject) => { resolve() })
            else return queryMetric()
          })
          .then(() => {
            return Promise.all(tasks)
          })
          .then(() => {
            this.updateDbTable({
              tableName: 'loadBalancerListener',
              list: resp.inventories
            })
            this.updateWindow({ uuidList, table })
            this.itemList = this.getData();
          })
      },
      pageDelete: function () {
        let uuidList = this.selectedList
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'loadbalancer.deleteLoadBalancerListener',
            description: 'loadbalancer.info.deleteListenerConfirm',
            uuidList: uuidList,
            icon: 'listener_n',
            ok: () => {
              self.delete(uuidList).then(() => self.queryList())
            },
            getName: (uuid) => {
              return self.dbData.loadBalancerListener[uuid].name;
            }
          })
        }
      },
      pageAddVmNic: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        self.loadBalancerListenerAttachVmNicParam = {
          uuid: uuidList[0],
          ok: (params) => {
            self.addListenerVmNics(params, uuidList[0])
              .then(() => {
                self.queryList()
              })
          }
        }
          self.showLoaderListenerAttachNic = true;
      },
      pageDetachVmNic: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        let listenerUuid = uuidList[0]
        self.openDialog('LoadBalancerListenerVmNicSelect', {
          conditions: [`loadBalancerListener.uuid=${listenerUuid}`],
          type: 'selection',
          select: (uuidList) => {
            self.deleteListenerVmNics(uuidList, listenerUuid).then(() => self.queryList())
          }
        })
      },
      getLoadBalancerName: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.loadBalancer[self.dbData.loadBalancerListener[uuid].loadBalancerUuid].name
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getLoadBalancerName-${uuid}`)) return ''
          value = ''
          rpc.query('load-balancers', {
            q: [`uuid=${self.dbData.loadBalancerListener[uuid].loadBalancerUuid}`]
          }).then((resp) => {
            if (resp.inventories.length > 0) {
              return self.updateDbRow({
                tableName: 'loadBalancer',
                id: self.dbData.loadBalancerListener[uuid].loadBalancerUuid,
                data: resp.inventories[0]
              })
            } else {
              return ''
            }
          }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      openCreateLoadBalancerListenrDlg: function () {
        this.$router.push('createloadbalancerlistener');
      }
    }
  }
</script>

