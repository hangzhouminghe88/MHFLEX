<script>
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  import { mapGetters, mapState } from 'vuex'
  /* global localStorage:false */

  export default {
    data: function () {
      return {
        start_time: '',
        end_time: '',
        end_at: '',
        start_at: ''
      }
    },
    created: function () {
    },
    computed: {
      ...mapState({
        vm: state => state.vm,
        volume: state => state.volume
      }),
      ...mapGetters({
        getVm: 'vm/get',
        getVolume: 'volume/get'
      })
    },
    methods: {
      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = new Date(resp.currentTime.MillionSeconds)
            self.start_at = new Date(resp.currentTime.MillionSeconds - 259200000)
          })
      },
      getCondition: function () {
        let conditionList = []
        // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: async function () {
        // let windowDataConditions = this.windowData.conditions ? this.windowData.conditions : []
        let self = this;
        self.windowData.loading = true;
        self.updateCount()
        if (self.dbData.common.isAdmin) {
          let resp = await rpc.query('accounts', {
            count: false,
            // start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
            // limit: this.windowData.pageSize,
            replyWithCount: true,
            q: this.getCondition()
            // q: windowDataConditions
          })
          let totalUuidList = resp.inventories.map((item) => item.uuid)
          if (self.getLicensePermission('LICENSE_EXTRA_COMPANY') && self.windowData.currTab === 'iam2project') { // dirty code by weiqi
            resp = await rpc.query('iam2/projects', {
              count: false,
              replyWithCount: true
            })
            totalUuidList = resp.inventories.map((item) => item.linkedAccountUuid)
            resp.inventories.forEach((item) => {
              item.uuid = item.linkedAccountUuid
            })
          }
          let AccountInventories = resp.inventories
          self.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
            availableCount: resp.total
          })
          self.updateDbTable({
            tableName: 'account',
            list: AccountInventories
          })
            .then(() => {
              let tasks = AccountInventories.map((account) => {
                let item = {}
                item.uuid = account.uuid
                this.start_time = self.start_at.getTime();
                this.end_time = self.end_at.getTime();
                return rpc.update('billings/accounts', account.uuid, {
                  'calculateAccountSpending': {
                    'dateStart': self.start_time,
                    'dateEnd': self.end_time
                  }
                }).then((resp) => {
                  item.billingTotal = resp.total
                  item.rootVolumeSum = 0
                  item.vmSum = 0
                  item.dataVolumeSum = 0
                  item.bandwidthSum = 0
                  resp.spending.forEach((billingItem) => {
                    if (billingItem.spendingType === 'rootVolume') {
                      item.rootVolumeSum = billingItem.spending
                      billingItem.details.forEach((itemdetails) => {
                        itemdetails.size = itemdetails.sizeInventory[0].volumeSize
                      })
                      item.rootVolumeBillingDetails = billingItem.details
                    }
                    if (billingItem.spendingType === 'VM') {
                      item.vmSum = billingItem.spending
                      let itemWithCPU = billingItem.details.filter(itemdetails => _.has(itemdetails, 'cpuInventory'))
                      itemWithCPU.forEach(itemdetails => {
                        itemdetails.cpuSpending = _.sum(itemdetails.cpuInventory.map((item) => item.spending))
                      })
                      item.cpuBillingDetails = itemWithCPU

                      let itemWithMemory = billingItem.details.filter(itemdetails => _.has(itemdetails, 'memoryInventory'))
                      itemWithMemory.forEach(itemdetails => {
                        itemdetails.memorySpending = _.sum(itemdetails.memoryInventory.map((item) => item.spending))
                      })
                      item.memoryBillingDetails = itemWithMemory

                      item.VmInstanceBillingDetails = billingItem.details
                    }
                    if (billingItem.spendingType === 'dataVolume') {
                      item.dataVolumeSum = billingItem.spending
                      billingItem.details.forEach((itemdetails) => {
                        itemdetails.size = itemdetails.sizeInventory[0].volumeSize
                      })
                      item.dataVolumeBillingDetails = billingItem.details
                    }
                    if (billingItem.spendingType === 'gpu') {
                      item.gpuSum = billingItem.spending
                      item.gpuBillingDetails = billingItem.details
                    }
                    if (_.includes(['pubIpVmNicBandwidth', 'pubIpVipBandwidth'], billingItem.spendingType)) {
                      item.bandwidthSum += billingItem.spending
                      let bandwidthType = {
                        'pubIpVmNicBandwidthIn': 'pubIpVmNicBandwidthIn',
                        'pubIpVmNicBandwidthOut': 'pubIpVmNicBandwidthOut',
                        'pubIpVipBandwidthIn': 'pubIpVipBandwidthIn',
                        'pubIpVipBandwidthOut': 'pubIpVipBandwidthOut'
                      }
                      let bandwidthSpending = {
                        'pubIpVmNicBandwidthIn': 'pubIpVmNicBandwidthInSpending',
                        'pubIpVmNicBandwidthOut': 'pubIpVmNicBandwidthOutSpending',
                        'pubIpVipBandwidthIn': 'pubIpVipBandwidthInSpending',
                        'pubIpVipBandwidthOut': 'pubIpVipBandwidthOutSpending'
                      }
                      let bandwidthBillingDetails = {
                        'pubIpVmNicBandwidth': 'pubIpVmNicBandwidthBillingDetails',
                        'pubIpVipBandwidth': 'pubIpVipBandwidthBillingDetails'
                      }
                      bandwidthType[`${billingItem.spendingType}In`] = billingItem.details.filter(itemdetails => _.has(itemdetails, 'bandwidthInInventory'))
                      bandwidthType[`${billingItem.spendingType}Out`] = billingItem.details.filter(itemdetails => _.has(itemdetails, 'bandwidthOutInventory'))

                      bandwidthType[`${billingItem.spendingType}In`].forEach(itemdetails => {
                        itemdetails[bandwidthSpending[`${billingItem.spendingType}In`]] = _.sum(itemdetails.bandwidthInInventory.map((item) => item.spending))
                      })
                      item[bandwidthBillingDetails[`${billingItem.spendingType}`]] = billingItem.details

                      bandwidthType[`${billingItem.spendingType}Out`].forEach(itemdetails => {
                        itemdetails[bandwidthSpending[`${billingItem.spendingType}Out`]] = _.sum(itemdetails.bandwidthOutInventory.map((item) => item.spending))
                      })
                      item[bandwidthBillingDetails[`${billingItem.spendingType}`]] = billingItem.details
                    }
                  })
                })
                  .then(() => {
                    return self.forceUpdateDbRow({
                      tableName: 'billing',
                      id: item.uuid,
                      data: item
                    }).then(() => {
                      self.$forceUpdate()
                    })
                  })
              })
              Promise.all([...tasks]).then(() => {
                 self.windowData.loading = false;
                totalUuidList.sort((a, b) => this.compare(a, b))
                let totalList = _.chunk(totalUuidList, self.windowData.pageSize)
                self.updateWindow({
                  pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
                  totalUuidList,
                  uuidList: totalList[0]
                })
              }).then(() => {
                self.getData()
              })
            })
        } else {
          let accountUuid = localStorage.getItem('accountUuid')
          let account = {}
          account.uuid = accountUuid
          account.name = localStorage.getItem('accountName')
          this.updateDbTable({
            tableName: 'account',
            list: [account]
          })
          let uuidList = [accountUuid]
          let table = {}
          table[accountUuid] = {
            selected: false
          }
          this.start_time = this.start_at.getTime();
          this.end_time = this.end_at.getTime();
          rpc.update('billings/accounts', accountUuid, {
            'calculateAccountSpending': {
              'dateStart': this.start_time,
              'dateEnd': this.end_time
            }
          })
            .then((resp) => {
              let obj = {}
              obj.uuid = accountUuid
              obj.billingTotal = resp.total
              obj.rootVolumeSum = 0
              obj.vmSum = 0
              obj.dataVolumeSum = 0
              obj.bandwidthSum = 0
              resp.spending.forEach((billingItem) => {
                if (billingItem.spendingType === 'rootVolume') {
                  obj.rootVolumeSum = billingItem.spending
                  billingItem.details.forEach((itemdetails) => {
                    itemdetails.size = itemdetails.sizeInventory[0].volumeSize
                  })
                  obj.rootVolumeBillingDetails = billingItem.details
                }
                if (billingItem.spendingType === 'VM') {
                  obj.vmSum = billingItem.spending
                  let itemWithCPU = billingItem.details.filter(itemdetails => _.has(itemdetails, 'cpuInventory'))
                  itemWithCPU.forEach(itemdetails => {
                    itemdetails.cpuSpending = _.sum(itemdetails.cpuInventory.map((item) => item.spending))
                  })
                  obj.cpuBillingDetails = itemWithCPU

                  let itemWithMemory = billingItem.details.filter(itemdetails => _.has(itemdetails, 'memoryInventory'))
                  itemWithMemory.forEach(itemdetails => {
                    itemdetails.memorySpending = _.sum(itemdetails.memoryInventory.map((item) => item.spending))
                  })
                  obj.memoryBillingDetails = itemWithMemory
                  obj.VmInstanceBillingDetails = billingItem.details
                }
                if (billingItem.spendingType === 'dataVolume') {
                  obj.dataVolumeSum = billingItem.spending
                  billingItem.details.forEach((itemdetails) => {
                    itemdetails.size = itemdetails.sizeInventory[0].volumeSize
                  })
                  obj.dataVolumeBillingDetails = billingItem.details
                }
                if (billingItem.spendingType === 'gpu') {
                  obj.gpuSum = billingItem.spending
                  obj.gpuBillingDetails = billingItem.details
                }
                if (_.includes(['pubIpVmNicBandwidth', 'pubIpVipBandwidth'], billingItem.spendingType)) {
                  obj.bandwidthSum += billingItem.spending
                  let bandwidthType = {
                    'pubIpVmNicBandwidthIn': 'pubIpVmNicBandwidthIn',
                    'pubIpVmNicBandwidthOut': 'pubIpVmNicBandwidthOut',
                    'pubIpVipBandwidthIn': 'pubIpVipBandwidthIn',
                    'pubIpVipBandwidthOut': 'pubIpVipBandwidthOut'
                  }
                  let bandwidthSpending = {
                    'pubIpVmNicBandwidthIn': 'pubIpVmNicBandwidthInSpending',
                    'pubIpVmNicBandwidthOut': 'pubIpVmNicBandwidthOutSpending',
                    'pubIpVipBandwidthIn': 'pubIpVipBandwidthInSpending',
                    'pubIpVipBandwidthOut': 'pubIpVipBandwidthOutSpending'
                  }
                  let bandwidthBillingDetails = {
                    'pubIpVmNicBandwidth': 'pubIpVmNicBandwidthBillingDetails',
                    'pubIpVipBandwidth': 'pubIpVipBandwidthBillingDetails'
                  }
                  bandwidthType[`${billingItem.spendingType}In`] = billingItem.details.filter(itemdetails => _.has(itemdetails, 'bandwidthInInventory'))
                  bandwidthType[`${billingItem.spendingType}Out`] = billingItem.details.filter(itemdetails => _.has(itemdetails, 'bandwidthOutInventory'))

                  bandwidthType[`${billingItem.spendingType}In`].forEach(itemdetails => {
                    itemdetails[bandwidthSpending[`${billingItem.spendingType}In`]] = _.sum(itemdetails.bandwidthInInventory.map((item) => item.spending))
                  })
                  obj[bandwidthBillingDetails[`${billingItem.spendingType}`]] = billingItem.details

                  bandwidthType[`${billingItem.spendingType}Out`].forEach(itemdetails => {
                    itemdetails[bandwidthSpending[`${billingItem.spendingType}Out`]] = _.sum(itemdetails.bandwidthOutInventory.map((item) => item.spending))
                  })
                  obj[bandwidthBillingDetails[`${billingItem.spendingType}`]] = billingItem.details
                }
              })
              self.updateDbTable({
                tableName: 'billing',
                list: [obj]
              }).then(() => {
                self.updateWindow({ uuidList, table })
              }).then(() => {
                self.getData()
              })
            })
        }
      },
      getData(){
        let self = this;
        self.itemList = self.windowData.uuidList.map((uuid) => {
          return self.dbData.billing[uuid];
        })
      },
      changePageIndex: function () {
        let totalList = _.chunk(this.windowData.totalUuidList, this.windowData.pageSize)
        let uuidList = totalList[this.windowData.pageIndex - 1]
        this.updateWindow({ uuidList })
      },
      sortList: function () {
        if (this.windowData.totalUuidList && this.windowData.totalUuidList.length > 0) {
          let totalUuidList = this.windowData.totalUuidList
          totalUuidList.sort((a, b) => this.compare(a, b))
          let totalList = _.chunk(totalUuidList, this.windowData.pageSize)
          let total = totalUuidList.length
          this.updateWindow({
            pageCount: total === 0 ? 1 : Math.ceil(total / this.windowData.pageSize),
            uuidList: totalList[0],
            pageIndex: 1
          })
        } else {
          this.queryList()
        }
      },
      compare: function (prev, next) {
        if (this.dbData.billing[prev][this.windowData.sortBy] > this.dbData.billing[next][this.windowData.sortBy]) {
          return this.windowData.sortDirection === '+' ? 1 : -1
        } else {
          return this.windowData.sortDirection === '+' ? -1 : 1
        }
      },
      queryAccountResourceRef: function (accountUuid, resourceType) {
        return rpc.query('accounts/resources/refs', {
          q: [`accountUuid=${accountUuid}`, `resourceType=${resourceType}`],
          fields: 'resourceUuid'
        }).then((resp) => {
          return resp.inventories.map(item => item.resourceUuid)
        })
      },
      updateCount: function () {
        const self = this
        rpc.query('iam2/projects', {
          q: `linkedAccountUuid?=${self.windowData.projectAccountUuidList}`,
          count: true
        }).then((resp) => {
          self.updateWindow({ iam2projectCount: resp.total })
        })
        rpc.query('accounts', {
          q: `uuid!?=${self.windowData.allProjectAccountUuidList}`,
          count: true
        }).then((accountsResp) => {
          self.updateWindow({ accountCount: accountsResp.total })
        })
      },
      ...Utils
    }
  }
</script>
