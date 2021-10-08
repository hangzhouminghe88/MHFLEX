<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.cluster') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
            <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="cluster-create" style="padding-top: 12px;" @click="openCreateCluster(windowData.uuid)">{{ $t("cluster.create")}}</a>
                  <a id="common-start" @click="isSelected && !inStates('Enabled') && pageEnable()"
                     :class="{ 'disabled-text': !isSelected || inStates('Enabled') }">{{ $t("common.start") }}</a>
                  <a id="common-stop" @click="isSelected && !inStates('Disabled') && pageDisable()"
                     :class="{ 'disabled-text': !isSelected || inStates('Disabled') }">{{ $t("common.stop") }}</a>
                  <a id="common-attachl2" @click="isSingleSelected && pageAttachl2()"
                     :class="{ 'disabled-text': !isSingleSelected }">{{ $t("common.attachl2") }}</a>
                  <a id="common-detachl2"
                     @click="isSingleSelected && GetisAttachL2network(selectedList[0]) && pageDetachl2()"
                     :class="{ 'disabled-text': !isSingleSelected || !GetisAttachL2network(selectedList[0])}">{{ $t("common.detachl2") }}</a>
                  <a id="common-attachprimarystorage"
                     @click="isSingleSelected && canAttachPrimaryStorage(selectedList[0]) && pageAttachPrimaryStorage()"
                     :class="{ 'disabled-text': !isSingleSelected || !canAttachPrimaryStorage(selectedList[0])}">{{ $t("common.attachprimarystorage")}}</a>
                  <a id="common-detachprimarystorage"
                     @click="isSingleSelected && canDetachPrimaryStorage(selectedList[0]) && pageDetachPrimaryStorage()"
                     :class="{ 'disabled-text': !isSingleSelected || !canDetachPrimaryStorage(selectedList[0]) }">{{ $t("common.detachprimarystorage")}}</a>
                  <a id="common-destroy" style="padding-bottom:12px;" @click="isSelected && pageDelete()"
                     :class="{ 'disabled-text': !isSelected }">{{ $t("common.destroy") }}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-table :data="itemList" @selection-change="handleSelectChange" @sort-change="handleSortChange">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToCluster(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.hypervisorType')">
          <template slot-scope="scope">
            {{dbData.cluster[scope.row.uuid].hypervisorType}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.hostNum')">
          <template slot-scope="scope">
            {{dbData.clusterA[scope.row.uuid].hostNum}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="dbData.cluster[scope.row.uuid].state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(dbData.cluster[scope.row.uuid].createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.availableCount"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import ClusterList from 'src/om/cluster/List'
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';

  export default {
    name: "ClusterTabList",
    mixins: [Root, WindowBase, ClusterList],
    props: ['param'],
    components: {
      TableBodyItemState,
      PageTemplate

    },
    created() {
      this.init()
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data() {
      return {
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
        itemList: []
      }
    },
    computed: {
      isSelected() {
        let self = this;
        return self.windowData.selectedUuidList.length >= 1;
      },
      isSingleSelected() {
        let self = this;
        return self.windowData.selectedUuidList.length === 1;
      },
      selectedList() {
        let self = this;
        return self.windowData.selectedUuidList;
      }
    },
    methods: {
      //初始化请求参数
      init: function () {
        this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          uuid: this.param.uuid,
          selectList: [],
          selectedUuidList: [],
          methods: {
            queryList: this.queryList
          }
        }).then(() => this.queryList())
      },
      //构造查询条件
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.param.conditions) conditionList = conditionList.concat(self.param.conditions)
        // conditionList.push('type=zstack')
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%${encodeURIComponent(self.searchStr)}%`)
        }
        return conditionList
      },
      //处理选择
      handleSelectChange(row) {
        let self = this;
        let selectedUuidList = row.map((item) => {
          return item.uuid
        });
        self.updateWindow({
          selectList: row,
          selectedUuidList: selectedUuidList
        })
      },
      //处理排序
      handleSortChange(row) {
        let self = this;
        if (row) {
          let sortDirection = row.order === 'ascending' ? '+' : '-';
          self.updateWindow({
            sortDirection: sortDirection,
            sortBy: row.prop
          }).then(() => {
            self.queryList();
          })
        }
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      //加载二层网络
      pageAttachl2: async function () {
        if (!this.isSingleSelected) return
        let self = this
        let selectedUuidList = self.selectedList
        //查询已经绑定的二层网络
        let l2networkList = await self.getClusterAttachableL2Network(selectedUuidList[0])
        await this.openDialog('L2NetworkSingleSelectListDlg', {
          conditions: [`uuid?=${l2networkList}`, `zone.uuid=${this.param.uuid}`],
          ok: (l2networkUuid) => {
            // l2networkList.length = 1
            let l2network = _.cloneDeep(this.dbData.l2network[l2networkUuid])
            if (l2network.type !== 'VxlanNetworkPool') {
              this.attachl2(selectedUuidList[0], [l2networkUuid])
            } else {
              this.openDialog('ClusterAttachVxlanPoolInputCidrPopupDlg', {
                ok: (cidr) => this.attachVxlanNetworkPoolToCluster(l2network.uuid, selectedUuidList[0], cidr)
              })
            }
          }
        })
      },
      attachVxlanNetworkPoolToCluster: function (uuid, clusterUuid, cidr) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${clusterUuid}::cidr::{${cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterUuid] && self.dbData.cluster[clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        rpc.post(`l2-networks/${uuid}/clusters/${clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      //解绑二层网络
      pageDetachl2: function () {
        if (!this.isSingleSelected) return
        let self = this
        let selectedUuidList = self.selectedList
        this.openDialog('L2NetWorkMultiSelectListDlg', {
          conditions: [`cluster.uuid=${selectedUuidList[0]}`, 'type!=VxlanNetwork'],
          select: (l2networkList) => {
            this.detachl2(selectedUuidList[0], l2networkList)
            self.updateWindow({dialogList: []})
          }
        })
      },
      //绑定主存储
      pageAttachPrimaryStorage: async function () {
        let self = this;
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        let psUuidList = await primaryStorageConditon.getClusterAttachablePrimaryStorage(selectedUuidList[0])
        await self.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`uuid?=${psUuidList}`],
          zoneUuid: `zoneUuid=${self.windowData.uuid}`,
          type: 'radio',
          select: (primarystorageuuid) => self.attachPrimaryStorage(selectedUuidList[0], primarystorageuuid)
        })
      },
      //解绑主存储
      pageDetachPrimaryStorage: function () {
        let self = this;
        if (!self.isSingleSelected) return
        let selectedUuidList = this.selectedList
        self.openDialog('ClusterAttachPrimaryStorageDlg', {
          conditions: [`attachedClusterUuids?=${selectedUuidList[0]}`],
          type: 'selection',
          select: (primarystorageuuidList) => {
            this.openDialog('ConfirmDlg', {
              title: 'common.detachprimarystorage',
              description: 'primaryStorage.detachPS',
              warning: 'primaryStorage.detachClusterWarning',
              icon: 'storage_popupico',
              getName(uuid) {
                return self.dbData.primarystorage[uuid].name;
              },
              uuidList: primarystorageuuidList,
              ok: () => {
                self.detachPrimaryStorage(selectedUuidList[0], primarystorageuuidList)
              }
            })
          }
        })
      },
      //判断是否在某个状态下可以操作
      inStates: function () {
        if (!this.isSelected) return
        let statesList = []
        if (arguments) {
          for (var i = 0; i < arguments.length; i++) {
            statesList.push(arguments[i])
          }
        }
        let selectedStatesList = []
        this.windowData.selectedUuidList.forEach((uuid) => {
          selectedStatesList.push(this.dbData.cluster[uuid].state)
        })
        let isInStates = selectedStatesList.every((item) => {
          return statesList.some((state) => {
            return state === item
          })
        })
        return isInStates
      },
      //搜索
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1,
        })
          .then(() => {
            self.queryList()
          })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      goToCluster(uuid){
        let self = this;
        self.$router.push({name: 'detailCluster', params: {uuid}});
      },
    },
    watch: {
      'dbData.cluster': function (conditions, oldConditions) {
        // this.$nextTick(this.resizeHeader)
      },
      'param.uuid': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.init()
          this.destroyDialogs()
        }
      }
    }

  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>

