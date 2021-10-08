<template>
  <div class="container">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.nic') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a @click="inStates('Running') && pageAttach()" :class="{'disabled-text': !inStates('Running')}" style="padding-top: 12px;">{{$t("common.attach")}}</a>
              <a @click="isSelected && inStates('Running') && !isDisable() && pageDetach()"  style="padding-bottom: 12px;" :class="{'disabled-text': !(isSelected && inStates('Running') && !isDisable())}">{{$t("common.detach")}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="detail-page-toolbar-right"></div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource" v-loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.availableCount"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VirtualRouterConfigTabList",

    mixins: [PageBase, WindowBase, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data() {
      let self = this;
      return {
        selectVal: 'internalName',
        searchStr: '',
        conditionNameList: [
          {
            name: 'common.name',
            value: 'internalName'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('internalName', item),
              getHeaderContent: self.$t('common.name'),
              field: 'internalName',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('default', item),
              getHeaderContent: self.$t('common.default'),
              field: 'default',
            },
            {
              getContent: item => self.getField('network', item),
              getHeaderContent: self.$t('common.network'),
              field: 'network',
              className: 'link',
              onClick: (item) => {
                self.$router.push({name: 'detailPublicNetwork', params: {uuid: self.dbData.vmNicRefs[item.uuid].l3NetworkUuid}});
              },
              tooltip: true
            },
            {
              getContent: item => self.getField('mac', item),
              getHeaderContent: 'MAC',
              field: 'mac',
              tooltip: true
            },
            {
              getContent: item => self.getField('deviceId', item),
              getHeaderContent: self.$t('common.deviceId'),
              field: 'deviceId',
            },
            {
              getContent: item => self.getField('ip', item),
              getHeaderContent: self.$t('common.ip'),
              field: 'ip',
            },
          ]
        }
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        dataUuid,
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          query: self.init
        }
      }).then( () => {
        self.init();
      })
    },

    methods: {
      //构造查询条件
      getCondition () {
        let conditionList = [];
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
       //判断状态是否在某一状态下
      inStates () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        let isInStates = stateList.some(item => {
          return item === this.dbData.vm[this.windowData.dataUuid].state
        })
        return isInStates
      },

      getField(field, item) {
        let self = this, normalFields = ['internalName', 'deviceId', 'mac', 'ip'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'default') return  self.isDefaultL3Network(item.uuid) ? self.$t('common.yes') : self.$t('common.no');
        if(field === 'network') return self.dbData.l3network[item.l3NetworkUuid] && self.dbData.l3network[item.l3NetworkUuid].name;
      },
      //初始化查询
      init () {
        rpc.query(`vm-instances/nics`, {
          q: `vmInstanceUuid=${this.windowData.dataUuid}`,
          replyWithCount: true
        })
          .then((resp) => {
            let table = {}
            let uuidList = resp.inventories.map((item) => item.uuid)
            this.updateDbTable({
              tableName: 'vmNicRefs',
              list: resp.inventories
            })
            this.updateWindow({
              sortBy: 'createDate',
              sortDirection: '-',
              methods: {
                queryList: this.queryQos
              }
            })
            this.updateWindow({ uuidList, table, availableCount: resp.total })
              .then(() => this.queryL3Network(uuidList))
              .then(() => this.getDefaultL3())
              .then(() => this.itemList = this.getData())
          })
      },

      getData() {
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.vmNicRefs[uuid];
        })
      },
      //查询三层网络
      queryL3Network (uuidList) {
        rpc.query(`l3-networks`, {
          q: `vmNic.uuid?=${uuidList}`
        }).then(resp => {
          let L3Networks = resp.inventories.map((item) => item.uuid)
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
            .then(() => {
              this.updateWindow({
                L3Networks: L3Networks
              })
            })
        })
      },
      //获得默认网卡
      getDefaultL3 () {
        let defaultL3 = []
        rpc.query(`vm-instances/appliances/virtual-routers`, {
          q: `uuid=${this.windowData.dataUuid}`
        }).then(vm => {
          let vmResp = vm.inventories[0]
          let nics = vmResp.vmNics
          rpc.query('l3-networks', {
            q: ['category=Private', `vmNic.vmInstance.uuid=${this.windowData.dataUuid}`]
          })
            .then(resp => {
              nics.forEach(nic => {
                if (_.includes([vmResp.publicNetworkUuid, vmResp.managementNetworkUuid].concat(resp.inventories.map(l3 => l3.uuid)), nic.l3NetworkUuid)) {
                  defaultL3.push(nic.uuid)
                }
              })
              this.updateWindow({defaultL3: defaultL3})
            })
        })
      },
      //判断是否是默认网卡
      isDefaultL3Network (uuid) {
        let vmNicRef = _.cloneDeep(this.dbData.vmNicRefs[uuid])
        let vm = _.cloneDeep(this.dbData.vm[this.windowData.dataUuid])
        if (vm.defaultRouteL3NetworkUuid === vmNicRef.l3NetworkUuid) {
          return true
        } else {
          return false
        }
      },

      //创建网络
      pageCreate() {
        let self = this;
        self.$router.push({name: 'createvip'})
      },
       //是否可用
      isDisable () {
        if (!this.isSelected || !this.inStates('Running')) return true
        let defaultL3 = this.windowData.defaultL3
        let disable = this.selectedList.some(item => {
          return _.includes(defaultL3, item)
        })
        return disable
      },
      //绑定网卡
      pageAttach() {
        let self = this;
        self.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: [`uuid!?=${this.windowData.L3Networks}`, 'category?=Public,System', 'type=L3BasicNetwork'],
          select: (l3NetworkUuidList) => this.attachL3NetworkToVm(l3NetworkUuidList, this.windowData.dataUuid).then(() => this.init())
        })
      },
      //绑定网卡到云路由器
      attachL3NetworkToVm (l3NetworkUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.attachL3NetworkToVm', this.dbData.l3network[l3NetworkUuidList[0]] ? this.dbData.l3network[l3NetworkUuidList[0]].name : '', l3NetworkUuidList.length)
        let tasks = []
        l3NetworkUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${uuid}`, null, event)
              .then(resp => {
                this.incEventSuccess(event)
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventory.uuid,
                  data: resp.inventory
                })
              }, () => {
                this.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      //解绑网卡
      pageDetach() {
        if (!this.isSelected) return
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'securityGroup.detachVmNic',
            description: 'securityGroup.info.detachVmNicConfirm',
            icon: 'vm_plain',
            getName: (uuid) => {
              return self.dbData.vm[self.dbData.vmNicRefs[uuid].vmInstanceUuid].name ;
            },
            ok: () => {
              self.detachL3NetworkFromVm(this.selectedList).then(() => this.init())
            }
          })
        }
      },

      detachL3NetworkFromVm (vmNicUuidList) {
        let event = this.createEvent('vm.action.detachL3NetworkFromVm', this.dbData.l3network[vmNicUuidList[0]] ? this.dbData.l3network[vmNicUuidList[0]].name : '', vmNicUuidList.length)
        const self = this

        let tasks = []
        vmNicUuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`vm-instances/nics/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },

    }
  }
</script>

<style scoped lang="less">
  .tab{
    &-container{
      display: inline-block;
      border: 1px solid #409EFF;
      border-radius: 2px;
      cursor: pointer;
      height: 25px;
      line-height: 25px;
    }

    &-item{
      padding: 0px 20px;
      font-size: 12px;
      display: inline-block;
    }
  }

  .is-active{
    background: #409EFF;
    color: #fff;
  }
  .disabled {
    background: #f1f4f7!important;
    border: 1px solid #dae0e6!important;
    color: #97a4b6;
    cursor: not-allowed !important;
  }
</style>
