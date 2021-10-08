<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title"
            v-if="windowData.networkType[0] === 'system=false'">{{$t("common.selectPrivateNetwork")}}</span>
      <span class="title" v-if="windowData.networkType[0] === 'system=true'">{{$t("common.selectPublicNetwork")}}</span>
      <span class="title"
            v-if="windowData.networkType[0] !== 'system=true' && windowData.networkType[0] !== 'system=false'">{{$t("common.selectSubNetwork")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="radio-group" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="itemList"
          @selection="handleSelect"
          type="selection"
          >
          <el-table-column width="50px" type="selection">
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('vrouterroutetable.route')" prop="">
            <template slot-scope="scope">
              {{dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].vRouterUuid &&
              dbData.vm[dbData.l3network[scope.row.uuid].vRouterUuid].name}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.dhcpIp')" prop="dhcpip">
          </el-table-column>
          <el-table-column :label="$t('l3network.current')" prop="">
            <template slot-scope="scope">
              {{`${dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].availableCapacity} /
              ${dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].totalCapacity}`}}
            </template>
          </el-table-column>
          <el-table-column label="CIDR" prop="vlan">
            <template slot-scope="scope">
              {{dbData.l3network[scope.row.uuid].ipRanges.length > 0 ?
              dbData.l3network[scope.row.uuid].ipRanges[0].networkCidr : void 0}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.availableCount"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: "SubNetworkMultiSelectListDlg",

    mixins: [WindowBase, MultiSelectList],

    created() {
      let self = this;
      let networkType = this.dialogData.param.conditions;

      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        networkType: networkType
      })
        .then(() => {
          this.queryList();
        })
    },

    computed: {
      itemList() {
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.l3network[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.l3network[uuid]
          }
        )
      }
    },

    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },

    methods: {
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      confirm() {
        let self = this;
        self.dialogData.param.ok(self.templateRadio);
        self.closeDialog(self.windowId);
      },

      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}25%`)
        }
        return conditionList
      },
      queryList: function () {
        if (!this.dbData.common.isAdmin) {
          this.normalAccountUpdateCount()
        }
        let params = {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        }
        return rpc.query('l3-networks', params).then((resp) => {
          let uuidList = resp.inventories.map((item) => item.uuid)
          let tasks = []
          let table = {}
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
            availableCount: resp.total
          })
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          this.updateWindow({uuidList, table})
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
          let p = rpc.query(`network-services/providers`, {}).then((resp) => {
            return this.updateDbTable({
              tableName: 'networkServiceType',
              list: resp.inventories
            })
          })
          // }
          tasks.push(p)

          if (this.dbData.common.isAdmin) {
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
            tasks.push(p)
          } else {
            const self = this
            resp.inventories.forEach(function (item) {
              ((item) => {
                let p = rpc.query('accounts/resources/refs', {
                  q: `resourceUuid=${item.uuid}`
                }).then((resp) => {
                  if (resp.inventories.length === 0) return
                  item.accountUuid = resp.inventories[0].accountUuid
                  self.updateDbRow({
                    tableName: 'l3network',
                    id: item.uuid,
                    data: item
                  })
                })
                tasks.push(p)
              })(item)
            })
          }

          if (this.dbData.common.isAdmin) {
            let p = resp.inventories.map((item, index) => {
              return this.isShareToAll(item.uuid)
                .then((toPublic) => {
                  resp.inventories[index].toPublic = toPublic
                })
            })
            tasks.push(p)
          }
          let getVirtualRouterOffering = (uuid) => {
            return rpc.query('system-tags', {
              q: ['resourceType=InstanceOfferingVO', `tag=guestL3Network::${uuid}`]
            })
              .then((respVroffering) => {
                let l3network = _.cloneDeep(this.dbData.l3network[uuid])
                if (respVroffering.inventories.length > 0) {
                  l3network.virtualRouterOfferingUuid = respVroffering.inventories[0].resourceUuid
                  l3network.tagForVirtualRouterOfferingUuid = respVroffering.inventories[0].uuid
                } else {
                  l3network.virtualRouterOfferingUuid = ''
                  l3network.tagForVirtualRouterOfferingUuid = ''
                }
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              })
          }
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

          let getVpcVRouter = (uuid) => {
            return rpc.query('vm-instances/appliances/virtual-routers', {
              q: [`vmNics.l3Network.uuid=${uuid}`]
            }).then((resp) => {
              if (resp.inventories.length > 0) {
                this.updateDbRow({
                  tableName: 'vm',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
                let l3network = _.cloneDeep(this.dbData.l3network[uuid])
                l3network.vRouterUuid = resp.inventories[0].uuid
                return this.updateDbRow({
                  tableName: 'l3network',
                  id: uuid,
                  data: l3network
                })
              }
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
            }).then(() => {
              uuidList.forEach((item) => {
                getIpAddressCapacity(item)
                getL3NetworkDhcpIpAddress(item)
                getVirtualRouterOffering(item)
                getVpcVRouter(item)
              })
            })
            this.updateWindow({uuidList, table})
          })
        })
      }

    }

  }
</script>

<style scoped>

</style>
