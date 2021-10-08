<template>
  <div class="container">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title">{{$t('common.network') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown"
                   :enabled="currSelectTab !== 'system'"
                   :class="{'disabled': currSelectTab === 'system'}">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a  v-if="currSelectTab === 'vpc'" @click="pageCreate()">{{$t("common.create")}}</a>
              <a  @click="inStates('Running') && pageAttach([windowData.dataUuid])" :class="{ 'disabled-text': !inStates('Running')}">{{$t("common.attach")}}</a>
              <a  @click="isSelected && inStates('Running') && !isDisable() && pageDetachL3NetworkFromVpcVRouter(selectedList, windowData.dataUuid)" :class="{'disabled-text': isDisable()}">{{$t("common.detach")}}</a>
              <a  v-if="currSelectTab == 'vpc'" @click="isSelected &&  detailPageDelete()" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
        <div class="tab-container">
          <span class="tab-item" v-for="(network, index) in ['vpc', 'public', 'system']"
                :key="index" :class="{'is-active': currSelectTab === network}"
                @click="changeCurrTab(network)">{{$t(`common.${network}Network`)}}</span>
        </div>
      </div>
      <div class="detail-page-toolbar-right">
        <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
      </div>
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
  import NetworkList from 'src/network/l3network/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VpcVRouterNetWorkTab",

    mixins: [NetworkList, PageBase, WindowBase, MultiSelectList],
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
        currSelectTab: 'vpc',
        selectVal: 'name',
        searchStr: '',
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
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              className: 'link',
              onClick: (item) => {
                let router = this.currSelectTab === 'vpc' ? 'detailvpcnetwork' :
                'detail'+ this.currSelectTab.charAt(0).toUpperCase() + this.currSelectTab.slice(1)+'Network';
                self.$router.push({name: router, params: {uuid: item.uuid}})
              },
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state',
            },
            {
              getContent: item => self.getField('current', item),
              getHeaderContent: self.$t('l3network.current'),
              field: 'current',
            },
            {
              getContent: item => self.getField('cidr', item),
              getHeaderContent: self.$t('common.cidr'),
              field: 'cidr',
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true,
              tooltip: true
            }
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
          query: self.queryList
        }
      }).then( () => {
        self.init();
      })
    },

    methods: {
      //初始化请求
      init () {
        return this.queryList().then(() => {
          this.getDefaultL3()
          if (this.currSelectTab === 'vpc') {
            return this.hasAttachedVm(this.windowData.uuidList)
          }
        })
      },
      //获得默认三层网络
      getDefaultL3 () {
        let defaultL3 = []
        rpc.query(`vm-instances/appliances/virtual-routers`, {
          q: `uuid=${this.windowData.dataUuid}`
        }).then(vm => {
          let vmResp = vm.inventories[0]
          let nics = vmResp.vmNics
          nics.forEach(nic => {
            if (_.includes([vmResp.publicNetworkUuid, vmResp.managementNetworkUuid], nic.l3NetworkUuid)) {
              defaultL3.push(nic.l3NetworkUuid)
            }
          })
          this.updateWindow({defaultL3: defaultL3})
        })
      },
      //构造查询条件
      getCondition () {
        let conditionList = []
        switch (this.currSelectTab) {
          case 'system':
            conditionList = ['category=System', 'type=L3BasicNetwork']
            break
          case 'public':
            conditionList = ['category=Public', 'type=L3BasicNetwork']
            break
          case 'vpc':
            conditionList = ['category=Private', 'type=L3VpcNetwork', 'vmNic.uuid+not+null']
            break
        }
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      //是否绑定云主机
      hasAttachedVm (uuidList) {
        let tasks = []
        uuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.query('vm-instances', {
              q: ['type=UserVm', `vmNics.l3NetworkUuid=${uuid}`]
            }).then((resp) => {
              let has = resp.inventories.length > 0
              return this.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: {
                  hasAttachedVm: has
                }
              })
            })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      //切换tab
      changeCurrTab(tabName) {
        let self = this;
        self.itemList = [];
        if(tabName === self.currSelectTab) return;
        self.currSelectTab = tabName;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuidList: [],
          loading: false,
          methods: {
            query: self.queryList
          }
        }).then( () => {
          self.init();
        })
      },

      getField(field, item) {
        let self = this, normalFields = ['name', 'state'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'current') return `
        ${self.dbData.l3network[item.uuid] && self.dbData.l3network[item.uuid].availableCapacity} /
        ${self.dbData.l3network[item.uuid] && self.dbData.l3network[item.uuid].totalCapacity}`
        if(field === 'cidr' && self.dbData.l3network[item.uuid].ipRanges.length > 0) return self.dbData.l3network[item.uuid].ipRanges[0].networkCidr;
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      //判断是否在某个状态下
      inStates() {
        let self = this, states = [];
        for(let i in arguments) {
          states.shift(arguments[i]);
        }
        let instate = states.some((state) => state === self.dbData.vm[self.windowData.dataUuid].state);
        return instate;
      },
      //不能操作
      isDisable () {
        if (!this.isSelected || !this.inStates('Running')) return true
        let defaultL3 = this.windowData.defaultL3
        let disable = this.selectedList.some(item => {
          return _.includes(defaultL3, item)
        })
        if (this.currSelectTab === 'vpc') {
          return this.selectedList.some(uuid => this.dbData.l3network[uuid].hasAttachedVm)
        }
        return disable
      },
      //加载网络
      pageAttach(vpcVRouterUuid) {
        const self = this
        let hasAttachedL3NetworkUuidList = this.dbData.vm[vpcVRouterUuid].vmNics.map(it => it.l3NetworkUuid)
        let conditions = []
        let openVpcVRouterL3NetworkMultiSelectListDlg = (conditions) => {
          self.openDialog('L3NetworkMultiSelectListDlg', {
            type: this.currSelectTab,
            vpcVRouterUuid: vpcVRouterUuid,
            conditions,
            select: (l3NetworkUuidList) => self.attachL3NetworkToVpcVRouter(l3NetworkUuidList, vpcVRouterUuid).then(() => {
              self.queryList();
            })
          })
        }
        if (this.currSelectTab === 'public') {
          conditions = ['category=Public', 'type=L3BasicNetwork', `uuid!?=${hasAttachedL3NetworkUuidList}`]
          openVpcVRouterL3NetworkMultiSelectListDlg(conditions)
        } else if (this.windowData.currSelectTab === 'vpc') {
          rpc.post(`vpc/virtual-routers/${vpcVRouterUuid}/attachable-vpc-l3s`)
            .then((resp) => {
              let vpcNetworkUuidList = resp.inventories.map(item => item.uuid)
              conditions = ['category=Private', 'type=L3VpcNetwork', `uuid?=${vpcNetworkUuidList}`]
              openVpcVRouterL3NetworkMultiSelectListDlg(conditions)
            })
        }
      },
      //绑定三层网络到vpc
      attachL3NetworkToVpcVRouter (l3NetworkUuidList, vmUuid) {
        let event = this.createEvent('vpcVRouter.action.attachL3NetworkToVpcVRouter', this.dbData.l3network[l3NetworkUuidList[0]] ? this.dbData.l3network[l3NetworkUuidList[0]].name : '', l3NetworkUuidList.length)
        let tasks = []
        l3NetworkUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${vmUuid}/l3-networks/${uuid}`, null, event)
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
      //卸载三层网络
      pageDetachL3NetworkFromVpcVRouter (l3NetworkUuidList, vpcVRouterUuid) {
        let self = this
        let vmNicUuidList = this.dbData.vm[vpcVRouterUuid].vmNics.filter(it => l3NetworkUuidList.some(uuid => uuid === it.l3NetworkUuid)).map(it => it.uuid)
        let type = 'Public'
        let icon = 'public_network_n'
        if (this.windowData.currSelectTab === 'vpc') {
          type = 'Vpc'
          icon = 'vpc_network_popupico'
        }
        this.openDialog('ConfirmDlg',{
          title: `vpcVRouter.detach${type}Network`,
          desc: `vpcVRouter.detach${type}NetworkConfirm`,
          uuidList: l3NetworkUuidList,
          icon: icon,
          ok: () => {
            self.detachL3NetworkFromVpcVRouter(vmNicUuidList, vpcVRouterUuid)
              .then(() => {
                self.queryList()
              })
          },
          getName: (uuid) => {
            return self.l3network[uuid].name;
          }
        })
      },
      //解绑网络请求
      detachL3NetworkFromVpcVRouter (vmNicUuidList) {
        let event = this.createEvent('vpcVRouter.action.detachL3NetworkFromVpcVRouter', this.dbData.l3network[vmNicUuidList[0]] ? this.dbData.l3network[vmNicUuidList[0]].name : '', vmNicUuidList.length)
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
      //删除网络
      detailPageDelete() {
        let uuidList = this.selectedList
        let self = this;
        let networkType = self.currSelectTab + 'Network';
        let capitalize = networkType.charAt(0).toUpperCase() + networkType.slice(1);
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: `l3network.delete${capitalize}`,
            description: this.$t("l3network.info.deleteConfirm", {
              length: uuidList.length,
              resourceName: this.$t(`common.${networkType}`)
            }),
            warning:`l3network.info.${networkType}DeleteWarning`,
            uuidList: uuidList,
            icon: networkType.replace('N', '_n').replace(/$/, '_n'),
            ok: () => {
              self.delete(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.l3network[uuid].name;
            }
          })

        }
      },
      //创建网络
      pageCreate() {
        let self = this;
        self.$router.push({name: 'createvpcnetwork', params: { vpcVRouterUuid: self.windowData.dataUuid}})
      }
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
    }

    &-item{
      padding: 5px 20px;
      font-size: 12px;
      display: inline-block;
    }
  }

  @-moz-document url-prefix() {
    .tab-item{
      padding: 4px 20px!important;
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
