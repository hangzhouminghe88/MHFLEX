<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Methods from './Methods'
  import {checkBounce} from 'src/utils/utils'
  import IAM2ProjectMethods from 'src/ecs/home/Methods'
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import PageTemplate from 'src/component/PageTemplate';
  import VmClone from 'src/vcenter/vCenterVmInstance/components/VmClone';

  export default {
    mixins: [WindowBase, MultiSelectList, Methods, PageBase],
    components: {PageTemplate, VmClone},
    created() {
      let self = this;
      // this.external.createTicket = TicketMethods.methods.create.bind(this)
      self.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(self)
      self.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(self)
      let initTab = 'available'
      self.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: initTab,
        conditions: self.conditions[initTab],
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.updateWindow({conditions: ['hypervisorType=ESX', 'state!=Destroyed']})
        self.queryList();
      })
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
      },
      total(){
        let self = this, total = 0;
        switch (self.windowData.currTab) {
          case 'available':
            total = self.windowData.availableCount;
            break;
          case 'destroyed':
            total = self.windowData.destroyedCount;
            break;
        }
        return total;
      }
    },
    data() {
      return {
        external: {},
        itemList: [],
        conditions: {
          'available': 'state!=Destroyed',
          'destroyed': 'state=Destroyed'
        },
        availableCount: 0,
        destroyedCount: 0,
        selectedVCenterUuid: '',
        availableResourceUuids: [],
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          },
          {
            name: 'common.ip',
            value: 'vmNics.ip'
          },
          {
            name: 'common.hostIp',
            value: 'host.managementIp'
          },
          {
            name: 'common.eip',
            value: 'vmNics.eip.vipIp'
          },
          {
            name: 'common.instanceOfferingName',
            value: 'instanceOffering.name'
          }
        ],
        dataDestroyedSource: {
          getItemList: () => this.itemList,
          handleSelection: this.handleSelect,
          handleSort: this.handleSort,
          type: 'selection',
          fields: []
        },
        dataSource: {
          getItemList: () => this.itemList,
          handleSelection: this.handleSelect,
          handleSort: this.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => this.getField('name', item),
              className: 'link',
              onClick: item => {
                this.$router.push({name: 'detailVCenterVmInstance', params: {uuid: item.uuid}})
              },
              getHeaderContent: this.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => this.getField('cpuNum', item),
              getHeaderContent: this.$t('common.cpu'),
              field: 'cpuNum'
            },
            {
              getContent: item => this.getField('memorySize', item),
              getHeaderContent: this.$t('common.memorySize'),
              field: 'memorySize'
            },
            {
              getContent: item => this.getField('defaultIp', item),
              getHeaderContent: this.$t('common.defaultIp'),
              field: 'defaultIp'
            },
            {
              getContent: item => this.getField('hostIp', item),
              getHeaderContent: this.$t('common.hostIp'),
              field: 'hostIp'
            },
            {
              getContent: item => this.getField('cluster', item),
              getHeaderContent: this.$t('common.cluster'),
              field: 'cluster'
            },
            {
              getContent: item => this.getField('vCenter', item),
              getHeaderContent: this.$t('common.vCenter'),
              renderHeader: this.handleRenderHeader
            },
            {
              getContent: item => this.getField('state', item),
              getHeaderContent: this.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => this.getField('owner', item),
              getHeaderContent: this.$t('common.owner'),
              field: 'owner',
            },
            {
              getContent: item => this.getField('haLevel', item),
              getHeaderContent: this.$t('common.haLevel'),
              field: 'haLevel',
            },
            {
              getContent: item => this.getField('createDate', item),
              getHeaderContent: this.$t('common.createDate'),
              field: 'createDate'
            }
          ]
        },
        showVmClone: false,
        vmCloneParam: {}
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
      //获得列表行数据
      getField(field, item) {
        let self = this;
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'state', 'cpuNum', 'haLevel']
        if (_.includes(normalFields, field)) return item[field];
        if (field === 'defaultIp') return self.getDefaultL3NetworkIp(item.uuid);
        if (field === 'hostIp') return self.getHostIp(item.uuid);
        if (field === 'cluster') return self.getClusterName(item.uuid);
        if (field === 'owner') return self.getResourceOwner(item.uuid);
        if (field === 'memorySize') return self.bytesToSize(item[field]);
        if (field === 'createDate') return self.formatDatetime(new Date(item[field]));
        if (field === 'vCenter') return self.dbData.vmA[item.uuid] && self.dbData.vmA[item.uuid].vCenterUuid
          && self.dbData.vCenters[self.dbData.vmA[item.uuid].vCenterUuid]
          && self.dbData.vCenters[self.dbData.vmA[item.uuid].vCenterUuid].name;
        if(field === 'lastOpDate') return self.formatDatetime(new Date(item[field]));
      },
      selectVCenter(uuid) {
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
          return rpc.query('vm-instances', {q: `clusterUuid?=${selectedClusters}`}).then(resp => {
            this.availableResourceUuids = resp.inventories.map(vm => vm.uuid)
          })
        }).then(() => {
          return this.queryList()
        })
      },
      openCreateForTicket: function (Dlg, fn, type) {
        this.updateWindow({currItemUuid: ''})
        this.openFullPanel(Dlg, {ok: fn, type: type})
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
      openCreateVmInstanceRequest: function () {
        this.openCreateForTicket('windows/Ticket/dialogs/CreateTicket', (param) => {
          this.external.createTicket(param)
            .then(() => {
              this.$router.push('/main/ticket')
            })
        }, 'ESX')
      },
      create: function (param, number) {
        let event = this.createEvent('vm.action.create', param.name, number)
        let channel = 100
        let index = 0
        let self = this

        function _create() {
          if (index >= number) return
          let p = _.cloneDeep(param)
          // p.l3NetworkUuids.forEach((uuid) => {
          //   if (p.staticIp[uuid]) {
          //     let eachByteOfIp = p.staticIp[uuid].split('.')
          //     eachByteOfIp[3] = (parseInt(eachByteOfIp[3]) + index).toString()
          //     let tmpIp = eachByteOfIp.join('.')
          //     p.systemTags.push(`staticIp::${uuid}::${tmpIp}`)
          //   }
          // })
          delete p.staticIp
          index++
          if (number > 1) p.name = `${param.name}-${index}`
          return rpc.create('vm-instances', p, event)
            .then(resp => {
              self.insertCreatedItem(resp.inventory)
              self.incEventSuccess(event)
              self.$nextTick(_create)
            }, () => {
              self.incEventFail(event)
              self.$nextTick(_create)
            })
        }

        let tasks = []
        let p = null
        for (let i = 0; i < channel; i++) {
          p = _create()
          tasks.push(p)
        }
        return Promise.all(tasks)
          .then(() => self.queryList())
      },
      insertCreatedItem: function (it) {
        this.updateCount()

        if (this.windowData.currTab === 'destroyed') return

        let tasks = []
        let p

        if (!this.dbData.cluster[it.clusterUuid]) {
          p = rpc.queryResourceNames(this, 'cluster', [it.clusterUuid])
          tasks.push(p)
        }

        if (!this.dbData.host[it.hostUuid]) {
          p = rpc.query('hosts', {
            q: `uuid=${it.hostUuid}`
          }).then((resp) => {
            return this.updateDbTable({
              tableName: 'host',
              list: resp.inventories
            })
          })
          tasks.push(p)
        }

        if (this.dbData.common.isAdmin) {
          p = rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${it.uuid}`
          }).then((accountRefResp) => {
            it.accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', [accountRefResp.inventories[0].accountUuid])
          })
          tasks.push(p)

          p = rpc.getResourceAccount([it.uuid], this)
          tasks.push(p)
        }

        p = rpc.query('system-tags', {
          q: [`resourceUuid=${it.uuid}`, 'resourceType=VmInstanceVO']
        })
          .then((systemResp) => {
            it.systemTag = systemResp.inventories
          })
        tasks.push(p)

        let getVcenterUuids = (vm) => {
          return rpc.query('clusters', {q: `uuid=${vm.clusterUuid}`}).then(resp => {
            return this.updateDbRow({
              tableName: 'vmA',
              id: vm.uuid,
              data: {
                vCenterUuid: resp.inventories[0].vCenterUuid
              }
            })
          })
        }
        if (this.dbData.common.isAdmin) {
          p = getVcenterUuids(it)
          tasks.push(p)
        }

        p = rpc.query(`vm-instances/${it.uuid}/ha-levels`)
          .then((resp) => {
            let level = resp.level === 'NeverStop' ? 'NeverStop' : 'None'
            it.haLevel = level
          })
        tasks.push(p)

        Promise.all(tasks).then(() => {
          let uuidList = _.clone(this.windowData.uuidList)
          if (uuidList.indexOf(it.uuid) < 0) {
            uuidList.unshift(it.uuid)
          }
          let table = _.clone(this.windowData.table)
          table[it.uuid] = {
            selected: false
          }
          this.updateDbRow({
            tableName: 'vm',
            id: it.uuid,
            data: it
          }).then(() => {
            this.updateWindow({uuidList, table})
          })
        })
      },
      getCondition: function () {
        let conditionList = []
        if (this.windowData.currTab === 'available') {
          conditionList.push('state!=Destroyed')
        } else {
          conditionList.push('state=Destroyed')
        }
        conditionList.push('type=UserVm')
        conditionList.push('hypervisorType=ESX')
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //查询vCenter云主机列表
      queryList() {
        let self = this;
        self.itemList = [];
        //查询可用、已删除数量
        self.updateCount()
        //查询云主机
        rpc.query(`vm-instances`, {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition(),
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        }).then((resp) => {
          if (self.windowData.currTab === 'available') {
            this.updateWindow({
              availableCount: resp.total
            })
          } else if (self.windowData.currTab === 'destroyed') {
            this.updateWindow({
              destroyedCount: resp.total
            })
          }

          let uuidList = resp.inventories.map((item) => item.uuid)
          let tasks = []

          let p
          let clustersUuidList = _.uniq(resp.inventories.map((i) => i.clusterUuid))
          if (clustersUuidList.length === 0) {
            this.updateWindow({uuidList: [], table: []})
            return
          }
          //查询集群
          p = rpc.queryResourceNames(this, 'cluster', clustersUuidList)
          tasks.push(p)
          //查询所属资源
          p = rpc.getResourceAccount(uuidList, this)
          tasks.push(p)
          //查询物理机
          let hostsUuidList = _.uniq(resp.inventories.map((i) => {
            return i.hostUuid ? i.hostUuid : i.lastHostUuid
          }))
          if (hostsUuidList.length === 0) {
            this.updateWindow({uuidList: [], table: []})
            return
          }
          p = rpc.query('hosts', {
            q: `uuid?=${hostsUuidList.join(',')}`
          }).then((resp) => {
            return this.updateDbTable({
              tableName: 'host',
              list: resp.inventories
            })
          })
          tasks.push(p)
          //如果是admin用户查询vcenter
          if (this.dbData.common.isAdmin) {
            p = rpc.query('vcenters').then(resp => {
              return this.updateDbTable({
                tableName: 'vCenters',
                list: resp.inventories
              })
            })
            tasks.push(p)
          }
          //admin用户查询所有者
          if (this.dbData.common.isAdmin) {
            let accountsUuidList = _.uniq(uuidList)
            if (accountsUuidList.length === 0) {
              this.updateWindow({uuidList: [], table: []})
              return
            }
            p = rpc.query('accounts/resources/refs', {
              q: `resourceUuid?=${accountsUuidList.join()}`
            }).then((accountRefResp) => {
              accountRefResp.inventories.forEach(accountRef => {
                for (let i = 0; i < resp.inventories.length; i++) {
                  if (accountRef.resourceUuid === resp.inventories[i].uuid) {
                    resp.inventories[i].accountUuid = accountRef.accountUuid
                    break
                  }
                }
              })
              return rpc.queryResourceNames(this, 'account', _.uniq(resp.inventories.map((item) => item.accountUuid)))
            })
            tasks.push(p)
          }
          //admin用户查询主存储
          if (this.dbData.common.isAdmin) {
            p = rpc.query('primary-storage', {})
              .then((resp) => {
                return this.updateDbTable({
                  tableName: 'primarystorage',
                  list: resp.inventories
                })
              })
            tasks.push(p)
          }
          //查询系统标签
          resp.inventories.forEach((item, index) => {
            p = rpc.query('system-tags', {
              q: [`resourceUuid=${item.uuid}`, 'resourceType=VmInstanceVO']
            })
              .then((systemResp) => {
                resp.inventories[index] = _.assign(resp.inventories[index], {'systemTag': systemResp.inventories})
              })
            tasks.push(p)

            p = rpc.query(`vm-instances/${item.uuid}/console-passwords`).then(consolePasswordResp => {
              this.updateDbRow({
                tableName: 'vmInstancesConsolePassword',
                id: item.uuid,
                data: {
                  hasPassword: !_.isUndefined(consolePasswordResp.password)
                }
              })
            })
            tasks.push(p)
          })
          //查询高可用
          let queryHaLevels = (uuid) => {
            return rpc.query(`vm-instances/${uuid}/ha-levels`)
              .then((resp) => {
                let level = resp.level === 'NeverStop' ? 'NeverStop' : 'None'
                this.dbData.vm[uuid].haLevel = level
                this.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: this.dbData.vm[uuid]
                })
              }).then(() => {
                self.itemList = self.getItem();
              })
          }
          //查询vCenterUuid
          let getVcenterUuids = (vm) => {
            return rpc.query('clusters', {q: `uuid=${vm.clusterUuid}`}).then(resp => {
              return this.updateDbRow({
                tableName: 'vmA',
                id: vm.uuid,
                data: {
                  vCenterUuid: resp.inventories[0].vCenterUuid
                }
              })
            })
          }

          resp.inventories.forEach(item => {
            if (this.dbData.common.isAdmin) {
              p = getVcenterUuids(item)
              tasks.push(p)
            }
            p = rpc.query(`vm-instances/${item.uuid}/capabilities`)
              .then((resp) => {
                item = _.assign(item, resp)
              }, () => {
                return
              })
            tasks.push(p)
          })

          resp.inventories.forEach((item, index) => {
            ((item) => {
              p = rpc.query('volumes/vm-instances/refs', {
                q: `vmInstanceUuid=${item.uuid}`,
                fields: 'volumeUuid'
              })
                .then((resp) => {
                  let obj = {}
                  if (resp.inventories.length > 0) obj.hasShareVolume = true
                  else obj.hasShareVolume = false
                  item = _.assign(item, obj)
                })
              tasks.push(p)
            })(item)
          })

          let table = {}
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          Promise.all(tasks).then(() => {
            this.updateDbTable({
              tableName: 'vm',
              list: resp.inventories
            })
            this.updateWindow({uuidList, table}).then(() => {
              self.itemList = self.getItem();
            })
            uuidList.forEach((item) => {
              queryHaLevels(item)
            })
          })
        })
      },

      getItem() {
        return this.windowData.uuidList.map((uuid) => {
          return this.dbData.vm[uuid];
        })
      },

      pageOpenConsole: function () {
        if (!this.isSingleSelected) return
        this.openConsole(this.selectedList[0])
      },
      pageDelete () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            confirmDlgType: 'Delete',
            uuidList,
            ok: (isDeleteVolume) => {
              self.delete(uuidList, isDeleteVolume, this.updateCount).then(() => this.queryList())
            }
          })
            .then(() => {
            })
        }
      },
      pageExpunge: function () {
        let uuidList = []
        uuidList = this.selectedList;
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            confirmDlgType: 'Delete',
            uuidList,
            ok: () => {
              self.expunge(uuidList).then(() => self.queryList())
            }
          })
            .then(() => {
            })
        }
      },
      pageRecover: function () {
        const self = this
        let uuidList = []
        uuidList = this.selectedList;
        if (uuidList.length > 0) {
          self.openDialog('NormalVmInstanceConfirmDlg', {
            'confirmDlgType': 'Recover',
            uuidList,
            ok: (startVm) => {
              self.recover(uuidList, self.updateCount, startVm).then(() => self.queryList())
            }
          })
        }
      },
      pageStart: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state !== 'Running' && this.dbData.vm[uuid].state !== 'Paused' && this.dbData.vm[uuid].state !== 'VolumeMigrating' && this.dbData.vm[uuid].state !== 'Migrating') uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          this.start(uuidList)
            .then(() => {
              this.queryList()
            })
        }
      },
      pageStop: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state !== 'Stopped') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            'confirmDlgType': 'Stop',
            uuidList,
            ok: (stopHa) => {
              self.stop(uuidList, stopHa)
                .then(() => {
                  self.queryList()
                })
            }
          })
            .then(() => {
            })
        }
      },
      pageReboot: function () {
        let uuidList = []
        debugger
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state === 'Running') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            'confirmDlgType': 'Reboot',
            uuidList,
            ok: () => {
              self.reboot(uuidList).then(() => self.queryList())
            }
          })
            .then(() => {
            })
        }
      },
      pagePause: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state === 'Running') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            'confirmDlgType': 'Pause',
            uuidList,
            ok: () => {
              self.pause(uuidList)
            }
          })
            .then(() => {
            })
        }
      },
      pageResume: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state === 'Paused') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            'confirmDlgType': 'Resume',
            uuidList,
            ok: () => {
              self.resume(uuidList)
            }
          })
            .then(() => {
            })
        }
      },
      pagePowerOff: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.vm[uuid].state === 'Running' || this.dbData.vm[uuid].state === 'Paused') uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('NormalVmInstanceConfirmDlg', {
            'confirmDlgType': 'PowerOff',
            uuidList,
            ok: (stopHa) => {
              self.powerOff(uuidList, stopHa)
            }
          })
            .then(() => {
            })
        }
      },
      pageClone: function () {
        if (this.selectedList.length > 1) return
        this.openClonePanel(this.selectedList[0], (resp) => {
          if (resp.numberOfClonedVm > 0) {
            this.queryList()
          }
        })
      },
      pageReimage: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openDialog('NormalVmInstanceConfirmDlg', {
          'confirmDlgType': 'Reimage',
          uuidList: selectedUuidList,
          ok: () => {
            this.reimage(selectedUuidList[0])
          }
        })
      },
      pageSetVmSshKey: function () {
        let self = this
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        self.openDialog('SetVmSshKeyDlg', {
          ok: (msg) => {
            self.setVmSshKey(selectedUuidList, msg)
          }
        })
      },
      pageDeleteVmSshKey: function () {
        if (!this.isSingleSelected) return
        this.deleteVmSshKey(this.selectedList)
      },
      pageSetVmConsolePassword: function () {
        let self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        let state = this.dbData.vm[self.selectedList[0]] ? this.dbData.vm[self.selectedList[0]].state : ''
        self.openDialog('ModifyVmConsolePasswordConfirmDlg', {
          state: state,
          ok: (msg, isReboot) => {
            self.setVmConsolePassword(selectedUuidList, msg, isReboot)
          }
        })
      },
      pageSetVmPassword: function () {
        let self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openDialog('ModifyVmPasswordDlg', {
          ok: (account, password) => {
            self.setVmPassword(selectedUuidList, account, password)
          }
        })
      },
      pageChangeInstanceOffering: function () {
        const self = this
        if (!self.selectedList || self.selectedList.length <= 0) return
        let uuidList = _.filter(self.selectedList, (uuid) => {
          return _.includes(['Stopped'], self.dbData.vm[uuid].state)
        })
        if (uuidList.length > 0) {
          let instanceOfferingUuid = _.get(self.dbData.vm, [uuidList[0], 'instanceOfferingUuid'])
          instanceOfferingUuid = _.every(uuidList, (uuid) => _.get(self.dbData.vm, [`${uuid}`, 'instanceOfferingUuid']) === instanceOfferingUuid) ? instanceOfferingUuid : ''
          let conditions = ['state!=Disabled', 'type=UserVm']
          if (instanceOfferingUuid) conditions.push(`uuid!=${instanceOfferingUuid}`)
          self.openDialog('InstanceOfferingListSingleSelectDlg', {
            conditions: conditions,
            select: (uuid) => {
              // filter vm
              let list = _.filter(uuidList, (vmUuid) => {
                return _.get(self.dbData.vm, [`${vmUuid}`, 'instanceOfferingUuid']) !== uuid
              })
              if (list.length === 0) return
              self.changeInstanceOffering(list, uuid)
            },
            ok: () => {
              self.updateWindow({
                dialogList: []
              })
            }
          })
        }
      },
      pageChangeSnapshot: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          // this.openInplaceDialog('InstanceOfferingListSingleSelectList', [], (uuid) => this.changeInstanceOffering(uuidList, uuid))
        }
      },
      goToCreate() {
        let self = this, canCreate = self.getApiPermission('VM.CREATE')
        if (canCreate) {
          self.$router.push({name: 'createVCenterVmInstance'})
        } else {
          this.openDialog('SimpleConfirmDlg', {
            title: self.$t('ticket.notice'),
            text: self.$t('ticket.createVmPrompt'),
            okText: self.$t('ticket.toCreate'),
            ok: () => {
              self.$router.push({name: 'createVCenterVmInstance'})
            }
          })
        }
      },
      pageChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
      },
      changeOwner: function () {
        const self = this
        let currZoneUuid = window.localStorage.getItem('currZoneUuid')
        if (self.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          let uuidList = self.selectedList
          let accountUuid = self.dbData.resourceOwner[uuidList[0]] ? self.dbData.resourceOwner[uuidList[0]].uuid : ''
          let hasSameAccount = uuidList.every(uuid => {
            if (self.dbData.resourceOwner[uuid] && (self.dbData.resourceOwner[uuid].uuid === accountUuid)) {
              return true
            }
          })
          let notEnabledIAM2ProjectUuidList = []
          let relatedZoneProjectUuidList = []
          let accountUuidList = []
          let zoneUuidList = []
          let allProjectAccountUuidList = []
          let projectAccountUuidList = []
          let projectUuidList = []
          let allIAM2ProjectUuidList = []
          let taskList = []
          let q = null
          let tasks = []
          let p = null
          q = rpc.query('iam2/projects', {// all project
            limit: 100000000
          }).then((resp) => {
            allProjectAccountUuidList = allProjectAccountUuidList.concat(resp.inventories.map(it => it.linkedAccountUuid))
            allIAM2ProjectUuidList = allIAM2ProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            resp.inventories.forEach(function (item) {
              ((item) => {
                item.projectUuid = item.uuid
                item.projectName = item.name
                self.updateDbRow({
                  tableName: 'accountA',
                  id: item.linkedAccountUuid,
                  data: item
                })
              })(item)
            })
            self.getProjectAdmin(allIAM2ProjectUuidList)
            self.updateDbTable({
              tableName: 'iam2project',
              list: resp.inventories
            })
          })
          taskList.push(q)
          q = rpc.query('zones', {
            fields: 'uuid'
          }).then((zoneResp) => {
            zoneUuidList = zoneUuidList.concat(zoneResp.inventories.map(it => it.uuid))
            p = rpc.query('iam2/projects', {
              q: ['attributes.name=__ProjectRelatedZone__'],
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              relatedZoneProjectUuidList = relatedZoneProjectUuidList.concat(resp.inventories.map(it => it.uuid))
              projectUuidList = projectUuidList.concat(_.difference(allIAM2ProjectUuidList, relatedZoneProjectUuidList))
            })
            tasks.push(p)
            p = rpc.query('iam2/projects', {
              q: ['attributes.name=__ProjectRelatedZone__', `attributes.value=${currZoneUuid}`],
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              projectUuidList = projectUuidList.concat(resp.inventories.map(it => it.uuid))
            })
            tasks.push(p)
            p = rpc.query('iam2/projects', {
              q: 'state!=Enabled',
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              notEnabledIAM2ProjectUuidList = notEnabledIAM2ProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            })
            tasks.push(p)
          })
          taskList.push(q)
          q = rpc.query('accounts').then((resp) => {
            accountUuidList = accountUuidList.concat(resp.inventories.map(it => it.uuid))
            if (uuidList.length === 1 || hasSameAccount) accountUuidList = _.difference(accountUuidList, [accountUuid])
          })
          taskList.push(q)
          return Promise.all(taskList).then(() => {
            return Promise.all(tasks).then(() => {
              accountUuidList = _.difference(accountUuidList, allProjectAccountUuidList)
              projectUuidList = _.difference(projectUuidList, notEnabledIAM2ProjectUuidList)
              if (projectUuidList.length > 0) {
                let project = ''
                projectUuidList.forEach(function (projectUuid) {
                  ((projectUuid) => {
                    project = _.cloneDeep(self.dbData.iam2project[projectUuid])
                    if (project && project.linkedAccountUuid) {
                      projectAccountUuidList.push(project.linkedAccountUuid)
                    }
                  })(projectUuid)
                })
                if (uuidList.length === 1 || hasSameAccount) projectAccountUuidList = _.difference(projectAccountUuidList, [accountUuid])
              }
              self.openSideWindow('ChangeResourceOwnerToAccountProjectSingleSelectListDlg', {
                accountUuidList,
                projectAccountUuidList,
                select: (uuid) => self.changeResourceToAccountOrProject(uuidList, uuid).then(() => self.queryList())
              })
            })
          })
        } else {
          let uuidList = self.selectedList
          let uuid, select
          if (uuidList.length === 1) {
            uuid = self.dbData.accountResourceRef[uuidList[0]] ? self.dbData.accountResourceRef[uuidList[0]].accountList[0] : ''
            select = (accountUuids) => {
              return self.changeResourceOwner(uuidList, accountUuids)
            }
          } else {
            let firstResourceAccountRef = self.dbData.accountResourceRef[uuidList[0]] ? self.dbData.accountResourceRef[uuidList[0]].accountList[0] : ''
            let hasSameAccount = uuidList.every(uuid => {
              if (self.dbData.accountResourceRef[uuid] && (self.dbData.accountResourceRef[uuid].accountList[0] === firstResourceAccountRef)) {
                return true
              }
            })
            uuid = hasSameAccount ? firstResourceAccountRef : ''
            select = (accountUuids) => {
              let list = []
              uuidList.forEach((item) => {
                if (self.dbData.accountResourceRef[item] && (self.dbData.accountResourceRef[item].accountList[0] !== accountUuids[0])) list.push(item)
              })
              if (list.length === 0) return
              return self.changeResourceOwner(list, accountUuids[0])
            }
          }
          self.openSideWindow('AccountListDlg', {
            uuid,
            select
          })
        }
      },
      pageCreateVmInstanceScheduler: function () {
        if (!this.isSingleSelected) return
        let uuid = this.selectedList[0]
        let createSchedulerForVmInstance = (param) => this.createVmInstanceScheduler(uuid, param)
        let createSchedulerForRootVolume = (param) => this.createVolumeScheduler(uuid, param)
        this.openDialog('CreateScheduler', {
          createSchedulerForVmInstance: createSchedulerForVmInstance,
          createSchedulerForRootVolume: createSchedulerForRootVolume
        })
          .then((dialogUuid) => {
            let dialogList = _.cloneDeep(this.windowData.dialogList)
            dialogList.push(dialogUuid)
            this.updateWindow({dialogList})
              .then(() => {
                this._updateWindow({
                  id: dialogUuid,
                  left: this.$el.offsetLeft,
                  top: this.$el.offsetTop,
                  right: 0,
                  bottom: 0
                })
              })
          })
      },
      loadNetwork: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openInplaceDialog('L3NetworkMultiSelectList', ['system=false'], (uuidList) => this.attachL3NetworkToVm(uuidList, selectedUuidList[0]))
      },
      updateVm: function (uuid) {
        let self = this
        rpc.query('vm-instances', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            self.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: resp.inventories[0]
            })
          })
      },
      loadVolume: function () {
        let self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openDialog('VolumeMultiSelectListDlg', {
          uuid: selectedUuidList,
          select: (volumeUuidList) => self.attachDataVolumeToVm(volumeUuidList, selectedUuidList[0]).then(() => self.queryList())
        })
      },
      enableDetachVolume() {
        return this.isSingleSelected && this.inStates('Stopped', 'Running') && this.isAttachVolume(this.selectedList[0])
      },
      unloadVolume: function () {
        let uuid = this.selectedList[0]
        let self = this
        let volumeList = []
        let taskList = []
        let p = rpc.query('volumes', {
          q: `vmInstanceUuid=${uuid}`,
          fields: 'uuid'
        }).then(resp => {
          volumeList = volumeList.concat(resp.inventories.map(item => item.uuid))
        })
        taskList.push(p)
        p = rpc.query('volumes/vm-instances/refs', {
          q: `vmInstanceUuid=${uuid}`,
          fields: 'volumeUuid'
        }).then(resp => {
          volumeList = volumeList.concat(resp.inventories.map(item => item.volumeUuid))
        })
        taskList.push(p)
        return Promise.all(taskList).then(() => {
          volumeList = _.uniq(volumeList)
          const openConfirm = (uuidList) => self.openDialog('ConfirmDlg', {
            title: 'volume.detach',
            description: 'vm.detachVolume',
            uuidList: uuidList,
            icon: 'volume_n',
            warning: 'vm.detachVolumeWarning',
            getName: uuid => self.dbData.volume[uuid].name,
            ok: () => {
              self.detachDataVolumeFromVm(uuidList, self.windowData.dataUuid)
                .then(() => {
                  self.queryList()
                })
            }
          })
          return self.openDialog('VolumeMultiSelectListDlg', {
            conditions: [`uuid?=${volumeList}`, 'type=Data'],
            ok: openConfirm
          })
        })
      },
      loadISO: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openInplaceDialog('ISOList', selectedUuidList, (isoUuidList) => this.attachISOToVmInstance(isoUuidList, selectedUuidList[0]).then(() => this.queryList()))
      },
      unloadISO: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        let systemTag = _.cloneDeep(this.dbData.vm[this.selectedList[0]].systemTag)
        if (!systemTag) return false
        let uuidList = []
        systemTag.forEach((item) => {
          let val = item.tag.split('::')
          if (val[0] === 'iso' && item.resourceUuid === this.selectedList[0]) {
            uuidList.push(val[1])
          }
        })
        this.openDialog('DetachISOConfirmDlg', {
          uuidList,
          ok: () => {
            this.detachISOFromVmInstance(selectedUuidList[0]).then(() => this.queryList())
          }
        })
      },
      openCreate: function (Dlg, fn) {
        this.updateWindow({currItemUuid: ''})
        this.openFullMainWindow(Dlg, {ok: fn})
        // this.openDialog()
        // .then((dialogUuid) => {
        //   let dialogList = _.cloneDeep(this.windowData.dialogList)
        //   dialogList.push(dialogUuid)
        //   this.updateWindow({ dialogList })
        //   .then(() => {
        //     this._updateWindow({
        //       id: dialogUuid,
        //       left: this.$el.offsetLeft,
        //       top: this.$el.offsetTop,
        //       right: 0,
        //       bottom: 0
        //     })
        //   })
        // })
      },
      openCreateSnapshot: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        let create = (param) => this.createSnapshot(this.dbData.vm[selectedUuidList[0]].rootVolumeUuid, param)
        this.openCreate('CreateSnapshotDlg', create)
      },
      openCreateImage: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.updateWindow({currItemUuid: ''})
        this.openFullMainWindow('CreateImageForVmDlg', {
          volumeUuid: this.dbData.vm[selectedUuidList[0]].rootVolumeUuid,
          ok: (param) => this.createImage(selectedUuidList[0], param)
        })
        // this.openCreate('CreateImageForVmDlg', create)
      },
      openCreateVolume: function () {
        if (!this.isSingleSelected) return
        let selectedUuidList = this.selectedList
        this.openCreate('CreateVolumeForVmDlg', (param) => this.createVolume(selectedUuidList[0], param))
      },
      openCreateVmInstance: function () {
        this.openCreate('vCenterCreateVmInstanceDlg', this.create)
      },
      pageSetHaLevel: function () {
        let self = this
        let uuidList = []
        self.selectedList.forEach((uuid) => {
           uuidList.push(uuid)
        })
        if (uuidList.length === 1) {
          let selectedUuidList = this.selectedList
          self.openDialog('SetHaLevelDlg', {
            uuidList: uuidList,
            haLevel: self.dbData.vm[selectedUuidList[0]].haLevel ? self.dbData.vm[selectedUuidList[0]].haLevel : 'None',
            ok: (msg) => {
              self.updateHaLevel(selectedUuidList, msg)
            }
          })
        } else {
          self.openDialog('SetHaLevelDlg', {
            uuidList: uuidList,
            haLevel: 'None',
            ok: (msg) => {
              self.updateHaLevel(uuidList, msg)
            }
          })
        }
      },
      canStartFromHost: function () {
        if (!this.isSingleSelected) return false
        if (this.inStates('Stopped') && this.canLiveMigrate()) return true
        else return false
      },
      pageSetVmBootOrder: function () {
        if (!this.isSingleSelected) return
        let self = this
        let selectedUuidList = self.selectedList
        let systemTag = _.cloneDeep(this.windowData.systemTag)
        if (!systemTag) return false
        let bootOrder
        systemTag.forEach((item) => {
          let val = item.tag.split('::')
          if (val[0] === 'bootOrder' && item.resourceUuid === this.selectedList[0]) {
            bootOrder = val[1]
          }
        })
        self.openDialog('SetVmBootOrderDlg', {
          ok: (msg) => {
            self.updateVmBootOrder(selectedUuidList, msg)
          },
          bootOrder: bootOrder
        })
      },
      pageDeleteVmConsolePassword: function () {
        if (!this.isSingleSelected) return
        let self = this
        let selectedUuidList = self.selectedList
        self.openDialog('NormalVmInstanceConfirm', {
          'confirmDlgType': 'DeleteConsolePassword',
          'state': self.dbData.vm[selectedUuidList[0]].state,
          uuidList: selectedUuidList,
          ok: (isReboot) => {
            self.deleteConsolePassword(selectedUuidList[0], isReboot)
          }
        })
      },
      canLiveMigrate: function () {
        if (!_.has(this.dbData.vm[this.selectedList[0]], 'capabilities')) return
        else {
          return this.dbData.vm[this.selectedList[0]].capabilities.LiveMigration
        }
      },
      canMigrate: function () {
        let self = this
        if (!self.isSingleSelected) return false
        if (!_.has(self.dbData.vm[self.selectedList[0]], 'capabilities')) return false
        if (self.inStates('Stopped') && self.dbData.vm[self.selectedList[0]].capabilities.VolumeMigration && self.dbData.vm[self.selectedList[0]].allVolumes.length === 1 && !self.dbData.vm[self.selectedList[0]].hasShareVolume) return true
        else if (self.canLiveMigrate() && self.inStates('Running')) return true
        else return false
      },
      pageStartFromHost: function () {
        let self = this
        if (!this.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openSideWindow('StartingVmFromHostDlg', {
          uuid: selectedUuidList[0],
          select: (uuid) => {
            self.startVmFromHost(uuid, selectedUuidList[0])
          }
        })
      },
      pageMigrate: async function () {
        let self = this
        let vmUuid = self.selectedList[0]
        return rpc.query(`vm-instances/${vmUuid}/migration-target-hosts`)
          .then((resp) => {
            let hostUuidList = resp.inventories.map((item) => item.uuid)
            self.openDialog('HostListMultiSelectDlg', {
              hostUuidList: hostUuidList,
              select: (hostUuid) => {
                self.migrate(vmUuid, hostUuid)
              }
            })
          })
      },
      inStates: function () {
        if (!this.isSelected) return
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        if (this.isSingleSelected) {
          return !stateList.every((item, index, array) => {
            return item !== this.dbData.vm[this.selectedList[0]].state
          })
        }
        let uuidList = []
        let resp = false
        uuidList = this.selectedList;
        uuidList.forEach((uuid) => {
          if (!stateList.every((item, index, array) => {
            return item !== this.dbData.vm[uuid].state
          })) resp = true
        })
        return resp
      },
      getDefaultL3NetworkIp: function (uuid) {
        let value = ''
        for (let i = 0; i < this.dbData.vm[uuid].vmNics.length; i++) {
          if (this.dbData.vm[uuid].defaultL3NetworkUuid === this.dbData.vm[uuid].vmNics[i].l3NetworkUuid) {
            value = this.dbData.vm[uuid].vmNics[i].ip
            break
          }
        }
        return value
      },
      getClusterName: function (uuid) {
        let value
        try {
          value = this.dbData.cluster[this.dbData.vm[uuid].clusterUuid].name
        } catch (e) {
          if (checkBounce(`getClusterName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'cluster', this.dbData.vm[uuid].clusterUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getHostIp: function (uuid) {
        let value
        let hostUuid = this.dbData.vm[uuid].hostUuid ? this.dbData.vm[uuid].hostUuid : this.dbData.vm[uuid].lastHostUuid
        try {
          value = this.dbData.host[hostUuid].managementIp
        } catch (e) {
          if (checkBounce(`getHostName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, 'host', hostUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
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
      getAccountName: function (uuid) {
        let value = ''
        try {
          value = this.dbData.account[this.dbData.vm[uuid].accountUuid].name
        } catch (e) {
          if (checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            this.dbData.vm[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            return rpc.queryResourceNames(this, 'account', accountRefResp.inventories[0].accountUuid)
          })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getHaLevel: function (uuid) {
        if (this.queryListing) {
          return ''
        }
        let value
        if (this.dbData.vm[uuid].haLevel) {
          value = this.dbData.vm[uuid].haLevel
        } else {
          if (checkBounce(`getHaLevel-${uuid}`)) return 'None'
          if (this.dbData.common.isOpensource) return 'None'
          value = 'None'
          rpc.query(`vm-instances/${uuid}/ha-levels`)
            .then((resp) => {
              let level = resp.level === 'NeverStop' ? 'NeverStop' : 'None'
              this.dbData.vm[uuid].haLevel = level
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      changeCurrTab(e) {
        let self = this;
        self.itemList = [];
        self.updateWindow({
          currItemUuid: '',
          currTab: e.name,
          pageIndex: 1,
          conditions: [self.conditions[e.name], 'hypervisorType=ESX'],
          loading: false,
        })
        if(self.windowData.currTab === 'destroyed'){
         self.dataDestroyedSource.fields = [];
         for(let item of self.dataSource.fields){
           if(item.field !== 'defaultIp' || item.field !== 'vCenter'){
             self.dataDestroyedSource.fields.push(item)
           }
         }
          self.dataDestroyedSource.fields.push({
            getContent: item => this.getField('lastOpDate', item),
            getHeaderContent: this.$t('common.lastOpDate'),
            field: 'lastOpDate',
          });
        }
        self.queryList()
      },
    }
  }
</script>
