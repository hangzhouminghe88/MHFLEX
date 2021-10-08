<template>
    <page-template>
      <div slot="page-header" style="height: 60px; line-height: 60px;">
        <el-row :gutter="10">
          <el-col :span="2">
            <span class="page-header-title">{{ $t(`common.l2network`) }}</span>
          </el-col>
          <el-col :span="2.2">
            <el-tabs v-model="windowData.currTab" @tab-click="changeCurrTab">
              <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available" v-if="dbData.common.isAdmin"></el-tab-pane>
              <el-tab-pane :label="`${$t('common.mine')}(${windowData.mineCount ? windowData.mineCount : '0'})`"  v-if="!dbData.common.isAdmin" @click="changeCurrTab('mine')"></el-tab-pane>
              <el-tab-pane :label="`${$t('common.share')}(${windowData.shareCount ? windowData.shareCount : '0'})`" v-if="!dbData.common.isAdmin" @click="changeCurrTab('share')"></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex" justify="space-between">
          <div style="flex-shrink: 0;">
            <span class="btn-success" v-if="windowData.currTab !== 'share'" @click="updateWindow({ currItemUuid: '' }); openCreateL2Network()"><i class="el-icon-plus icon"></i>{{$t('l2network.create')}}</span>

            <drop-down class="btn-primary more dropdown" :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}" :enabled="isSelected && windowData.currItemUuid === ''">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
              <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-attachCluster" style="padding-top: 12px;" @click="isSingleSelected && (dbData.l2network[selectedList[0]].type !== 'VxlanNetwork') && pageAttach()" :class="{ 'disabled-text': !(isSingleSelected) || (dbData.l2network[selectedList[0]].type === 'VxlanNetwork')}">{{ $t("common.attachCluster") }}</a>
                  <a id="common-detachCluster" @click="isSingleSelected && (dbData.l2network[selectedList[0]].attachedClusterUuids.length !== 0) && (dbData.l2network[selectedList[0]].type !== 'VxlanNetwork') && pageDetach()" :class="{ 'disabled-text': !(isSingleSelected) || (dbData.l2network[selectedList[0]].attachedClusterUuids.length === 0) || (dbData.l2network[selectedList[0]].type === 'VxlanNetwork')}">{{ $t("common.detachCluster") }}</a>
                  <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && canSharedToAll() && pageShareL2NetworkToAll()" :class="{ 'disabled-text': !isSelected || !canSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.shareToAll")}}</a>
                  <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && canRecallFromAll() && pageRecallL2NetworkFromAll()" :class="{ 'disabled-text': !isSelected || !canRecallFromAll()}" v-if="dbData.common.isAdmin">{{$t("common.recallFromAll")}}</a>
                  <a id="common-destroy" style="padding-bottom:12px;" @click="pageDelete()">{{ $t("common.destroy") }}</a>
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
              <a class="link" @click="$router.push(`detaill2network/${scope.row.uuid}`);">{{scope.row.name}}</a>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.physicalInterface')"
            prop="physicalInterface" v-if="dbData.common.isAdmin"
          >
          </el-table-column>
          <el-table-column
            :label="$t('common.type')"
            prop="type"
          >
          </el-table-column>

          <el-table-column
            :label="$t('common.vlan')"
            prop="vlan" v-if="dbData.common.isAdmin"
          >
          </el-table-column>
          <el-table-column
            :label="$t('common.Vni')"
            prop="Vni" v-if="!dbData.common.isAdmin"
          >
          </el-table-column>

          <el-table-column
            :label="$t('common.owner')"
            prop="owner" v-if="dbData.common.isAdmin"
          >
            <template slot-scope="scope">
              {{getResourceOwner(scope.row.uuid)}}
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
        </div>
      </div>
    </page-template>
</template>

<script>
  import L2networkList from 'src/network/l2network/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';

  export default {
    name: "L2NetworkPage",
    mixins: [Root,WindowBase,L2networkList, PageBase],
    components: {PageTemplate},
    created: function () {
      return this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currTab: 'available',
        currentAccountUuid: window.localStorage.getItem('accountUuid'),
        selectUuidList: [],
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: () => {
            return this.init(this.windowData.currTab)
          },
          refreshL2Network: this.refreshL2Network
        }
      }).then(() => {
        return this.init()
      })
    },
    computed:{
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >=1;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length ===1;
      }
    },
    destroyed: function () {

    },
    data () {
      return {
        searchStr: "",
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        l2networkUuidList: [],
        showClusterSelectDlg:false,
        message: {},
        itemList: []
      }
    },
    methods: {
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      refresh(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {

          self.queryList();
        })
      },
      handleSort(e){
        if(e.order === 'ascending'){
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        }else{
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      pageCreate: function () {
        this.$router.push('createsanstorage');
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`uuid?=${this.l2networkUuidList.join()}`)
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`type!=VxlanNetworkPool`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        if (this.selectVal !=='' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      init: function (tabName = 'mine') {
        let l2NetworkUuidList = []
        let vCenterl2NetworkUuidList = []
        let taskList = []
        if (this.dbData.common.isAdmin) { // admin
          let p = rpc.query('l2-networks', {
            fields: 'uuid'
          }).then((resp) => {
            l2NetworkUuidList = l2NetworkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)

          p = rpc.query('l2-networks', {
            q: `cluster.type=vmware`,
            fields: 'uuid'
          }).then((resp) => {
            vCenterl2NetworkUuidList = vCenterl2NetworkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
        } else {
          // this.updateCount()
          let myL2NetworkUuidList = []
          let p = rpc.query('accounts/resources/refs', {
            q: ['concreteResourceType=org.zstack.network.l2.vxlan.vxlanNetwork.VxlanNetworkVO', `accountUuid=${window.localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              myL2NetworkUuidList = resp.inventories.map((item) => item.resourceUuid)

              let condition = []
              if (tabName === 'mine') {
                condition = condition.concat(`uuid?=${myL2NetworkUuidList.join(',')}`)
              } else if (tabName === 'share') {
                condition = condition.concat(`uuid!?=${myL2NetworkUuidList.join(',')}`)
              }
              return rpc.query('l2-networks/vxlan', {
                fields: 'uuid',
                q: condition
              }).then((resp) => {
                l2NetworkUuidList = l2NetworkUuidList.concat(resp.inventories.map(it => it.uuid))
              })
            })
          // let partial = rpc.query('l2-networks/vxlan', {
          //   fields: 'uuid'
          // }).then((resp) => {
          //   l2NetworkUuidList = l2NetworkUuidList.concat(resp.inventories.map(it => it.uuid))
          // })
          taskList.push(p)
        }
        Promise.all(taskList).then(() => {
          l2NetworkUuidList = _.differenceWith(l2NetworkUuidList, vCenterl2NetworkUuidList)
          this.l2networkUuidList = l2NetworkUuidList
          return this.queryList()
        })
      },
      changeCurrTab(e) {
          this.itemList = [];
          this.updateWindow({
            currItemUuid: '',
            pageIndex: 1,
            currTab: e.name,
            selectUuidList: []
          }).then(() => {
            this.init(e.name)
          })
      },
      hasPermission: function () {
        if (this.dbData.common.isAdmin) return true
        let selectUuidList = this.selectedList
        let hasPermission = selectUuidList.every(uuid => this.dbData.l2network[uuid] && this.dbData.l2network[uuid].accountUuid === this.windowData.currentAccountUuid)
        return hasPermission
      },
      refreshL2Network: function () {
        this.init()
      },
      getL2NetworkAttachableCluster: async function (uuid) {
        let clusterUuidList = []
        let l2network = _.cloneDeep(this.dbData.l2network[uuid])
        let conditions = []
        conditions.push(`type=${l2network.type}`)
        if (l2network.type === 'L2NoVlanNetwork') {
          conditions.push(`physicalInterface=${l2network.physicalInterface}`)
        }
        if (l2network.type === 'L2VlanNetwork') {
          conditions.push(`physicalInterface=${l2network.physicalInterface}`)
          conditions.push(`vlan=${l2network.vlan}`)
        }
        let resp = await rpc.query('l2-networks', { q: conditions })
        resp.inventories.forEach((item) => {
          item.attachedClusterUuids.forEach((uuid) => {
            clusterUuidList.push(uuid)
          })
        })
        return clusterUuidList
      },
      pageAttach: async function () {
        const self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        let l2network = _.cloneDeep(self.dbData.l2network[selectedUuidList[0]])
        if (l2network.type !== 'VxlanNetworkPool' && l2network.type !== 'VxlanNetwork') {
          let clusterUuidList = []
          clusterUuidList = await self.getL2NetworkAttachableCluster(selectedUuidList[0])
          let conditions = [`uuid!?=${clusterUuidList}`]

          if (!self.getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
            conditions.push('hypervisorType=KVM')
          }

          self.openDialog('ClusterSelectListDlg', {
            primaryStorageUuid: self.selectedList[0],
            conditions: conditions,
            type: 'selection',
            select: (clusterList) => {
              self.attach(selectedUuidList[0], clusterList)
            }
          })

        } else if (l2network.type === 'VxlanNetworkPool') {
          self.pageVxlanNetworkPoolAttachCluster()
        }
      },
      pageVxlanNetworkPoolAttachCluster: function () {
        const self = this
        let selectedUuidList = self.selectedList
        let clusterUuidList = []

        clusterUuidList = self.getL2NetworkAttachableCluster(selectedUuidList[0])
        let conditions = [`uuid!?=${clusterUuidList}`]
        self.openDialog('ClusterSelectListDlg', {
          primaryStorageUuid: self.selectedList[0],
          conditions: conditions,
          type: 'selection',
          select: (clusterList) => {
            self.attachVxlanNetworkPoolToCluster(selectedUuidList[0], clusterList)
          }
        })
      },
      attachVxlanNetworkPoolToCluster: function (uuid, params) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${params.clusterUuid}::cidr::{${params.cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[params.clusterUuid] && self.dbData.cluster[params.clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        rpc.post(`l2-networks/${uuid}/clusters/${params.clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'l2network',
              id: uuid,
              data: resp.inventory
            })
            self.queryList()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      pageDetach: function () {
        const self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        let l2network = _.cloneDeep(self.dbData.l2network[selectedUuidList[0]])
        let conditions = [`l2Network.uuid=${selectedUuidList[0]}`]
        let dlg = 'ClusterSelectListDlg'
        if (!self.getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
          conditions.push('hypervisorType=KVM')
        }
        if (l2network.type !== 'VxlanNetwork') {

          self.openDialog('ClusterSelectListDlg', {
            primaryStorageUuid: self.selectedList[0],
            conditions: conditions,
            type: 'selection',
            select: (clusterList) => {
              self.detach(selectedUuidList[0], clusterList)
            }
          })

        }

      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val,
          pageIndex: 1,
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      }
    },
    watch: {
      'dbData.l2network': function (conditions, oldConditions) {
        setTimeout(this.resizeHeader, 0)
      }
    },
    filters: {


    }
  }
</script>

<style scoped>

</style>
