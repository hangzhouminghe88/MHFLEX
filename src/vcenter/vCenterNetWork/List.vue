<script>
  import AddIpRange from 'src/vcenter/vCenterNetWork/components/AddIpRange';
  import vCenterNetWorkMethods from 'src/vcenter/vCenterNetWork/Methods'
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from 'src/component/PageTemplate';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'

  export default {
    mixins: [vCenterNetWorkMethods, MultiSelectList, WindowBase, PageBase],
    components: {PageTemplate, AddIpRange},
    data(){
      let self = this;
      return {
        itemList: [],
        selectedVCenterUuid: '',
        availableResourceUuids: [],
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        selectVal: 'name',
        searchStr: '',
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              className: 'link',
              onClick: (item) =>{self.$router.push({name: 'detailvCenterNetwork', params: {uuid: item.uuid}})},
              field: 'name'
            },
            {
              getContent: item => self.getField('category', item),
              getHeaderContent: self.$t('common.networkType'),
              field: 'category'
            },
            {
              getContent: item => self.getField('current', item),
              getHeaderContent: self.$t('l3network.current'),
              field: 'current'
            },
            {
              getContent: item => self.getField('cidr', item),
              getHeaderContent: 'CIDR',
              field: 'cidr'
            },
            {
              getContent: item => self.getField('ip', item),
              getHeaderContent: 'DHCP IP',
              field: 'ip'
            },
            {
              getContent: item => self.getField('vCenter', item),
              field: 'vCenter',
              renderHeader: self.handleRenderHeader
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        },
        showAddIpRange: false,
        addIpRangeMessage: {}
      }
    },
    created () {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 10,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.init();
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
      ...Utils,
      getField(field, item){
        let self = this;
       if(field === 'name') return item[field];
       if(field === 'category') return self.$t(`common.${item[field]}`);
       if(field === 'current') return self.getCurrent(self.dbData.l3network[item.uuid].availableCapacity, self.dbData.l3network[item.uuid].totalCapacity);
       if(field === 'ip') return self.dbData.l3network[item.uuid] && self.dbData.l3network[item.uuid].dhcpip
         ? self.dbData.l3network[item.uuid].dhcpip : '';
       if(field === 'vCenter') return self.dbData.l3networkA[item.uuid]
         && self.dbData.l3networkA[item.uuid].vCenterUuid
         && self.dbData.vCenters[self.dbData.l3networkA[item.uuid].vCenterUuid]
         && self.dbData.vCenters[self.dbData.l3networkA[item.uuid].vCenterUuid].name;
       if(field === 'cidr') return self.dbData.l3network[item.uuid].ipRanges.length > 0 ? self.dbData.l3network[item.uuid].ipRanges[0].networkCidr : void 0;
       if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
      },

      getCurrent (availableCount, totalCount) {
         if(!availableCount || !totalCount) return '';
         return `${availableCount}/${totalCount}`;
      },

      init() {
        let networkUuidList = []
        let vCenterNetworkUuidList = []
        let zStackNetworkUuidList = []
        let taskList = []
        let p
        if (this.dbData.common.isAdmin) {
          p = rpc.query('l3-networks', {
            fields: 'uuid'
          }).then((resp) => {
            networkUuidList = networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
        } else {
          let myL3NetworkUuidList = []
          p = rpc.query('accounts/resources/refs', {
            q: ['resourceType=L3NetworkVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myL3NetworkUuidList = resp.inventories.map((item) => item.resourceUuid)
              let condition = []
              let tabName = this.windowData.currTab
              if (tabName === 'mine') {
                condition = condition.concat(`uuid?=${myL3NetworkUuidList.join(',')}`)
              } else if (tabName === 'share') {
                condition = condition.concat(`uuid!?=${myL3NetworkUuidList.join(',')}`)
              }
              return rpc.query('l3-networks', {
                fields: 'uuid',
                q: condition
              }).then((resp) => {
                networkUuidList = networkUuidList.concat(resp.inventories.map(it => it.uuid))
              })
            })
          taskList.push(p)
        }

        p = rpc.query('l3-networks', {
          q: [`l2Network.cluster.type=zstack`],
          fields: 'uuid'
        }).then((resp) => {
          zStackNetworkUuidList = zStackNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          vCenterNetworkUuidList = _.difference(networkUuidList, zStackNetworkUuidList)
          this.networkUuidList = vCenterNetworkUuidList
          return this.queryList()
        })
      },

      getCondition: function () {
        let conditionList = []
        let uuidList = []
        if (this.selectedVCenterUuid && this.availableResourceUuids && this.availableResourceUuids.length > 0) {
          uuidList = _.intersection(this.networkUuidList, this.availableResourceUuids)
        } else {
          uuidList = this.networkUuidList
        }
        conditionList.push(`uuid?=${uuidList.join()}`)
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },

      updateCount: function () {
        let conditionList = this.getCondition()
        let preStep
        let myNetworkUuidList = []
        let zStackNetworkUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=L3NetworkVO', `accountUuid=${localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myNetworkUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
            .then(() => {
              return rpc.query('l3-networks', {
                q: [`l2Network.cluster.type=zstack`],
                fields: 'uuid'
              })
            })
            .then((resp) => {
              zStackNetworkUuidList = zStackNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
              return new Promise((resolve, reject) => { resolve() })
            })
        }

        if (this.dbData.common.isAdmin) {
          rpc.query('l3-networks', {
            count: true,
            q: conditionList
          })
            .then((resp) => {
              this.updateWindow({
                availableCount: resp.total
              })
            })
        } else {
          preStep
            .then(() => {
              rpc.query('l3-networks', {
                replyWithCount: true,
                q: [`uuid?=${myNetworkUuidList.join(',')}`].concat(conditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    mineCount: resp.total
                  })
                })

              rpc.query('l3-networks', {
                replyWithCount: true,
                q: [`uuid!?=${myNetworkUuidList.join(',')}`]
              })
                .then((resp) => {
                  let networkUuidList = resp.inventories.map(it => it.uuid)
                  let sharedNetworkUuidList = _.difference(networkUuidList, zStackNetworkUuidList)
                  this.updateWindow({
                    shareCount: sharedNetworkUuidList.length
                  })
                })
            })
        }
      },

      queryList: function () {
        this.windowData.loading = true;
        this.updateCount()
        this.itemList = [];
        let params = {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
          // q: [`zoneUuid=${localStorage.getItem('currZoneUuid')}`].concat(conditions).concat(windowDataConditions)
        }
        // if (system) conditions['q'] = system
        return rpc.query('l3-networks', params).then((resp) => {
          this.windowData.loading = false;
          let uuidList = resp.inventories.map((item) => item.uuid)
          let tasks = []
          let table = {}
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize)
          })
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          // this.updateWindow({ uuidList, table })
          // this.updateDbTable({
          //   tableName: 'l3network',
          //   list: resp.inventories
          // })
          let L2NetworkUuidList = resp.inventories.map((item) => item.l2NetworkUuid)
          let p = rpc.query(`network-services/providers`).then((resp) => {
            return this.updateDbTable({
              tableName: 'networkServiceType',
              list: resp.inventories
            })
          })
          // }
          tasks.push(p)

          p = rpc.query('system-tags', {
            q: [`resourceUuid?=${L2NetworkUuidList.join()}`, 'resourceType=L2NetworkVO', 'tag~=%25::vcenter::%25']
          }).then((resptags) => {
            resp.inventories.forEach(item => {
              let obj = {}
              for (let i = resptags.inventories.length - 1; i >= 0; i--) {
                if (resptags.inventories[i].resourceUuid === item.l2NetworkUuid) {
                  obj.vCenterUuid = resptags.inventories[i].tag.split('::')[2]
                }
              }
              return this.updateDbRow({
                tableName: 'l3networkA',
                id: item.uuid,
                data: obj
              })
            })
          })
          tasks.push(p)
          if (this.dbData.common.isAdmin) {
            p = rpc.query(`vcenters`).then((vcenter) => {
              return this.updateDbTable({
                tableName: 'vCenters',
                list: vcenter.inventories
              })
            })
            tasks.push(p)
            let L2NetworkUuidList = _.uniq(resp.inventories.map((i) => {
              return i.l2NetworkUuid
            }))
            if (L2NetworkUuidList.length === 0) return
            p = rpc.query('l2-networks', {
              q: `uuid?=${L2NetworkUuidList.join(',')}`
            }).then((resp) => {
              return this.updateDbTable({
                tableName: 'l2network',
                list: resp.inventories
              })
            })
            tasks.push(p)
          }

          if (this.dbData.common.isAdmin) {
            // partial = () => {
            let accountsUuidList = _.uniq(uuidList)
            if (accountsUuidList.length === 0) return
            p = rpc.query('accounts/resources/refs', {
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
            // }
            tasks.push(p)
            let p = resp.inventories.map((item, index) => {
              return this.isShareToAll(item.uuid)
                .then((toPublic) => {
                  resp.inventories[index].toPublic = toPublic
                })
            })
            tasks.push(p)
          }
          // let tasks = [ queryNetworkServiceProvider(), queryL2Network(), queryOwners() ]

          let getIpAddressCapacity = (uuid) => {
            return rpc.query('ip-capacity', {
              'l3NetworkUuids': uuid
            }).then((l3resp) => {
              let l3network = _.cloneDeep(this.dbData.l3network[uuid])
              l3network.availableCapacity = l3resp.availableCapacity
              l3network.totalCapacity = l3resp.totalCapacity
              return this.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: l3network
              })
            })
          }
          let getL3NetworkDhcpIpAddress = (uuid) => {
            return rpc.query(`system-tags`, {
              q: `resourceUuid=${uuid}`
            })
              .then((dhcpipResp) => {
                let l3network = _.cloneDeep(this.dbData.l3network[uuid])
                dhcpipResp.inventories.forEach((item) => {
                  if (item.tag.indexOf('DhcpServer::') > -1) {
                    l3network.dhcpip = item.tag.split('::')[2]
                  }
                })
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              })
          }
          return Promise.all(tasks).then(() => {
            resp.inventories.forEach((item) => {
              if (!this.getNetworkServiceTypeName(item)) return
              item.networkServiceType = this.getNetworkServiceTypeName(item)
            })
            this.updateDbTable({
              tableName: 'l3network',
              list: resp.inventories
            }).then(async() => {
              await uuidList.forEach((item) => {
                getIpAddressCapacity(item)
                getL3NetworkDhcpIpAddress(item)
              })
              this.itemList = this.getItemList();
              this.windowData.loading = false;
            })
            this.updateWindow({ uuidList, table })
          })
        })
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.l3network[uuid];
        })
      },

      pageRecallVCenterNetworkFromAll: function () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning:  'account.recall',
            ok: () => {
              this.recallFromAll(uuidList)
            }
          })
        }
      },

      pageShareVCenterNetworkToAll: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
           uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning:  'instanceOffering.shareToAllText',
            ok: () => {
              this.shareVpcNetworkToAll(uuidList)
            }
          })
        }
      },

      handleRenderHeader(h, {column, $index}) {
        let self = this;
        return h('el-dropdown',
          {
            on: {
              'command': self.selectVCenter
            }
          },
          [
            h('span', [
                [self.$t(`common.vCenter`)],
                h('i', {
                  staticClass: 'el-icon-caret-bottom'
                })
              ]
            ),
            h('el-dropdown-menu', {
                attrs: {
                  trigger: "hover",
                  placement: 'bottom',
                  slot: "dropdown"
                },
              },
              [
                self.vcenterList.map((item) => {
                  return (
                    h('el-dropdown-item', {
                      attrs: {
                        command: item.uuid
                      }
                    }, [self.$t(item.name)])
                  )
                })
              ])
          ])
      },

      selectVCenter (uuid) {
        this.selectedVCenterUuid = uuid
        let selectedClusters = []
        if (uuid === 'all') {
          this.selectedVCenterUuid = ''
          this.availableResourceUuids = []
          return this.queryList()
        }
        return rpc.query('clusters', {q: 'type=vmware'}).then(resp => {
          resp.inventories.forEach(cluster => {
            if (cluster.vCenterUuid === uuid) {
              selectedClusters.push(cluster.uuid)
            }
          })
        }).then(() => {
          return rpc.query('l3-networks', {q: `l2Network.cluster.uuid?=${selectedClusters}`}).then(resp => {
            this.availableResourceUuids = resp.inventories.map(l3 => l3.uuid)
          })
        }).then(() => {
          return this.queryList()
        })
      },

      goToCreate(){
        let self = this;
        self.$router.push({name: 'createvCenterNetwork'})
      },

      pageDelete(){
        let self = this;
        if(!self.isSelected) return
        self.openDialog('ConfirmDlg', {
           title:'vCenterNetwork.delete',
           description: 'vCenterNetwork.confirm.delete',
           icon: 'l2_popupico',
          uuidList: self.selectedList,
           getName(uuid){
             return self.dbData.l3network[uuid].name;
           },
          warning: 'vCenterNetwork.confirm.warning',
          ok(){
             self.delete(self.selectedList, self.queryList)
          }
        })
      },

      openAddIpRange(){
        let self  = this;
        if(!self.isSingleSelected) return;
        self.addIpRangeMessage= {
          uuid: self.selectedList[0],
          ok(params){
            self.addIpRange(self.selectedList[0], params);
          }
        }
        self.showAddIpRange = true;
      },

      openAddDns(){
        let self = this;
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openDialog('AddDNSDlg', {
          ok: (dns) => self.addDnsToL3Network(selectedUuidList[0], dns)
        })
      }
    },
    computed: {
      vcenterList() {
        let list = _.values(this.dbData.vCenters)
        list.sort((a, b) => {
          if (!a.name && b.name) return -1
          if (a.name && !b.name) return 1
          if (!a.name && !b.name) return 0
          return a.name.localeCompare(b.name)
        })
        list.unshift({name: 'operationLog.all', uuid: 'all'})
        return list
      }
    },
  }
</script>
