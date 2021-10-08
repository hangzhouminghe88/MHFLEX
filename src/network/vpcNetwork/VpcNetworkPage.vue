<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{ $t(`common.vpcnetwork`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"
              name="mine" @tab-click="changeCurrTab('available')" v-if="dbData.common.isAdmin"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.mine')}(${windowData.mineCount ? windowData.mineCount : '0'})`"
                         name="destroyed" @tab-click="changeCurrTab('destroyed')"
                         v-if="!dbData.common.isAdmin"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.share')}(${windowData.shareCount ? windowData.shareCount : '0'})`"
                         name="exported" @tab-click="changeCurrTab('exported')"
                         v-if="!dbData.common.isAdmin"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-success"
                v-if="windowData.currTab == 'mine' && getApiPermission('L3.CREATE') && getApiPermission('L3.DNS.ADD')"
                v-permission.or="['L3_IP-RANGE.ADD', 'L3_IP-RANGE_CIDR.ADD']"
                @click="updateWindow({ currItemUuid: '' }); openCreateVpcNetwork()"><i class="el-icon-plus icon"></i>{{$t('vpcNetwork.create')}}</span>
          <drop-down class="btn-primary more dropdown"
                     :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}"
                     :enabled="isSelected && windowData.currItemUuid === ''">
              <span slot="title">
                 <i class="el-icon-more"></i>
                 <span class="text">{{ $t("common.moreActions") }}</span>
              </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-addIpRange" style="padding-top: 12px;"
                     v-permission.or="['L3_IP-RANGE.ADD', 'L3_IP-RANGE_CIDR.ADD']"
                     @click="isSingleSelected && pageAddIpRange()" :class="{ 'disabled-text': !isSingleSelected}">{{ $t("common.addIpRange") }}</a>
                  <a id="vpcNetwork-attachVpcNetworkToVpcVRouter" v-permission="'VM_L3.ATTACH'"
                     @click="isSingleSelected && !dbData.l3network[selectedList[0]].vpcVRouterUuid && pageAttachVpcNetworkToVpcVRouter()"
                     :class="{ 'disabled-text': !isSingleSelected || dbData.l3network[selectedList[0]].vpcVRouterUuid}">{{ $t("vpcNetwork.attachVpcNetworkToVpcVRouter") }}</a>
                  <a id="vpcNetwork-detachVpcNetworkFromVpcVRouter" v-permission="'VM_L3.DETACH'"
                     @click="isSingleSelected && dbData.l3network[selectedList[0]].vpcVRouterUuid && pageDetachVpcNetworkFromVpcVRouter()"
                     :class="{ 'disabled-text': !isSingleSelected || !dbData.l3network[selectedList[0]].vpcVRouterUuid}">{{ $t("vpcNetwork.detachVpcNetworkFromVpcVRouter") }}</a>
                  <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'"
                     @click="isSelected && hasNotSharedToAll() && pageShareVpcNetworkToAll()"
                     :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.shareToAll")}}</a>
                  <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'"
                     @click="isSelected && hasSharedToAll() && pageRecallVpcNetworkFromAll()"
                     :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.recallFromAll")}}</a>
                  <a id="common-destroy" style="padding-bottom: 12px;" v-permission="'L3.DELETE'"
                     :class="{'disabled-text':!pageCanDelete()}" @click="pageCanDelete() && pageDelete()">{{$t("common.destroy")}}</a>
                </div>
              </transition>
            </span>
          </drop-down>
        </div>
        <div style="text-align: right;flex-shrink: 0;">
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
      </el-row>
    </div>

    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        ref="multipleTable"
        :data="itemList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelect"
        v-loading="windowData.loading"
        @sort-change="handleSort"
      >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          :label="$t('common.name')"
          prop="name"
        >
          <template slot-scope="scope">
            <a class="link" @click="$router.push(`detailvpcnetwork/${scope.row.uuid}`);">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.vpcVRouter')"
          prop="vpcVRouter"
        >
          <template slot-scope="scope">
            {{dbData.l3network[scope.row.uuid].vpcVRouterUuid &&
            dbData.vm[dbData.l3network[scope.row.uuid].vpcVRouterUuid].name}}
          </template>
        </el-table-column>
        <el-table-column
          label="DHCP IP"
          prop="dhcpip"
        >
        </el-table-column>
        <el-table-column
          :label="$t('l3network.current')"
          prop="current"
        >
          <template slot-scope="scope">
            {{dbData.l3network[scope.row.uuid].availableCapacity | getCurrentValue(
            dbData.l3network[scope.row.uuid].totalCapacity)}}
          </template>
        </el-table-column>

        <el-table-column
          label="CIDR"
          prop="cidr"
        >
          <template slot-scope="scope">
            {{scope.row.ipRanges.length > 0 ? scope.row.ipRanges[0].networkCidr : void 0}}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.createDate')"
          prop="createDate">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
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
        <add-ip-range-dlg v-if="showIpRangeDlg" :param="ipRangeMessage" @close="closeIpRange"></add-ip-range-dlg>
      </div>
    </div>
  </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import List from 'src/network/vpcNetwork/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils'
  import AddIpRangeDlg from 'src/network/l3network/component/AddIPRange';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "VpcNetworkPage",
    mixins: [Root, WindowBase, List, MultiSelectList, PageBase],
    components: {PageTemplate, AddIpRangeDlg},
    created: function () {
      return this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        currTab: 'mine',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: () => {
            return this.init(this.windowData.currTab)
          }
        }
      }).then(() => {
        return this.init()
      })

    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },
    data() {
      return {
        showIpRangeDlg: false,
        ipRangeMessage: {},
        networkUuidList: [],
        l2NetworkUuidList: [],
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
        searchStr: "",
        selectVal: 'name',
        itemList: []
      }

    },
    methods: {
      closeIpRange() {
        this.showIpRangeDlg = false;
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push('type=L3VpcNetwork')
        conditionList.push(`uuid?=${this.networkUuidList.join()}`)
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      init: function (tabName = 'mine') {
        let self = this
        self.windowData.loading = true;
        self.deleteAllAssistant()
        let privateNetworkUuidList = []
        let vCenterNetworkUuidList = []
        let l2NetworkUuidList = []
        let vCenterL2NetworkUuidList = []
        let taskList = []
        let p = null
        if (self.dbData.common.isAdmin) {
          p = rpc.query('l3-networks', {
            q: ['system=false', 'category=Private']
          }).then((resp) => {
            privateNetworkUuidList = privateNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
            l2NetworkUuidList = l2NetworkUuidList.concat(resp.inventories.map(it => it.l2NetworkUuid))
          })
          taskList.push(p)
        } else {
          let myL3NetworkUuidList = []

          let p = rpc.query('accounts/resources/refs', {
            q: ['resourceType=L3NetworkVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myL3NetworkUuidList = resp.inventories.map((item) => item.resourceUuid)

              let condition = ['system=false', 'category=Private']
              if (tabName === 'mine') {
                condition = condition.concat(`uuid?=${myL3NetworkUuidList.join(',')}`)
              } else if (tabName === 'share') {
                condition = condition.concat(`uuid!?=${myL3NetworkUuidList.join(',')}`)
              }
              return rpc.query('l3-networks', {
                fields: 'uuid',
                q: condition
              }).then((resp) => {
                privateNetworkUuidList = privateNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
                l2NetworkUuidList = l2NetworkUuidList.concat(resp.inventories.map(it => it.l2NetworkUuid))
              })
            })
          taskList.push(p)
        }
        p = rpc.query('l3-networks', {
          q: [`l2Network.cluster.type=vmware`, 'system=false', 'category=Private']
        }).then((resp) => {
          vCenterNetworkUuidList = vCenterNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
          vCenterL2NetworkUuidList = vCenterL2NetworkUuidList.concat(resp.inventories.map(it => it.l2NetworkUuid))
        })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          self.windowData.loading = false;
          privateNetworkUuidList = _.difference(privateNetworkUuidList, vCenterNetworkUuidList)
          self.networkUuidList = privateNetworkUuidList
          self.l2NetworkUuidList = _.difference(l2NetworkUuidList, vCenterL2NetworkUuidList)
          return self.queryList().then(() => {
            self.queryForAssistant()
          })
        })
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
        let l2path = 'l2-networks'
        let tasks = []
        let obj = {}
        obj.hasL2Network = true
        let isAttached = false
        Object.defineProperty(obj, 'isAttached', {
          set(newVal) {
            if (newVal) isAttached = true
          },
          get() {
            return isAttached
          }
        })
        let p
        let checkL2 = (path) => {
          rpc.query('clusters', {q: zoneUuid}).then(clusterresp => {
            let clusterUuids = clusterresp.inventories.map(item => item.uuid)
            clusterUuids.forEach(clusterUuid => {
              let cluster = `cluster.uuid=${clusterUuid}`
              p = rpc.query(path, {q: cluster}).then(l2resp => {
                let l2respUuids = l2resp.inventories.map(item => item.uuid)
                obj.isAttached = _.intersection(l2respUuids, self.l2NetworkUuidList).length > 0
              })
              tasks.push(p)
            })
            p = rpc.query(path, {count: true, q: zoneUuid}).then(resp => {
              if (resp.total === 0) {
                obj.hasL2Network = false
              }
            })
            tasks.push(p)
            Promise.all(tasks).then(() => {
              if (!obj.isAttached && obj.hasL2Network && self.l2NetworkUuidList.length !== 0) {
                self.newAssistant('L2Network', 'check')
              }
            })
          })
        }
        if (self.dbData.common.isAdmin) {
          checkL2(l2path)
        }
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({
            currItemUuid: '',
            pageIndex: 1,
            currTab: tabName
          }).then(() => {
            this.init(tabName)
          })
        }
      },
      pageRecallVpcNetworkFromAll: function () {
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'common.recallFromAll',
            description: 'account.recall',
            uuidList: uuidList,
            icon: 'vm_plain',
            ok: () => {
              this.recallFromAll(uuidList)
            },
            getName: (uuid) => {
              return this.dbData.l3network[uuid].name;
            }
          })
        }
      },
      pageShareVpcNetworkToAll: function () {
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'common.shareToAll',
            uuidList: uuidList,
            description: 'instanceOffering.shareToAllText',
            icon: 'vm_plain',
            ok: () => {
              this.shareVpcNetworkToAll(uuidList)
            },
            getName: (uuid) => {
              return this.dbData.l3network[uuid].name;
            }
          })
        }
      },
      openCreateVpcNetwork: function () {
        this.$router.push("createvpcnetwork")
      },
      openVpcVRouterDetailPage: function (uuid) {
        this.openSideWindow('VpcVRouterDetailDlg', {uuid: this.dbData.l3network[uuid].vpcVRouterUuid})
      },
      pageStart: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.start(uuidList)
      },
      pageStop: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.stop(uuidList)
      },
      ...Utils
    },
    watch: {},
    filters: {
      getCurrentValue(availableCount, totalCount) {
        if (!availableCount || !totalCount) return '';
        return `${availableCount}/ ${totalCount}`;
      }
    }
  }
</script>

<style scoped>

</style>
