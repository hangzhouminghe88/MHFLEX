<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.vm') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-attach" style="padding-top: 12px;" @click="hasAttachedVpcVRouter() && pageAttach()" :class="{'disabled-text': !hasAttachedVpcVRouter()}">{{$t("common.attach")}}</a>
                  <a id="common-detach" style="padding-bottom: 12px;" @click="isSelected && pageDetach()" :class="{'disabled-text': !isSelected}">{{$t("common.detach")}}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelection">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
            <template slot-scope="scope">
              <span class="link" @click="$router.push({name:'detailVm', params: {uuid: scope.row.uuid}})">
                {{scope.row.name}}
              </span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('common.defaultIp')" prop="">
          <template slot-scope="scope">
            <table-body-item-list :content="getDefaultL3NetworkIp(scope.row.uuid)"/>
          </template>
        </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.owner')" v-if="dbData.common.isAdmin" prop="ownerName"></el-table-column>
          <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.total > 0"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="windowData.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="windowData.total"
              class="page-table-pagination"
              @current-change="pageCurrentChange"
              @size-change="pageSizeChange"
              :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import VmInstanceList from 'src/ecs/ecsInstance/List'
  import TableBodyItemList from "../../../component/TableBodyItemList";

  export default {
    name: "VmInstanceTabList",
    mixins:[Root,WindowBase,MultiSelectList,VmInstanceList],
    props:['param'],
    components:{
      TableBodyItemList,
      TableBodyItemState
    },
    created() {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        dataUuid: this.param.uuid,
        selectUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: []
      }
    },
    computed:{
      isSingleSelected(){
        let self = this;
        if(self.windowData.selectUuidList.length !==1) return false;
        return self.windowData.selectUuidList.length === 1;
      },
      isSelected() {
        let self = this;
        if(self.windowData.selectUuidList.length <=0) return false;
        return self.windowData.selectUuidList.length > 0;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      }
    },
    methods:{
      ...Utils,
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      handleSelection(val) {
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      handleSelectAll(val) {
        this.selectList = [];
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      refresh: function (uuid) {
        this.updateWindow({
          pageIndex: 1,
          searchStr:'',
          currItemUuid: '',
        })
        this.queryList()
        this.updateWindow()
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        if(self.windowData.pageIndex ===1 ) self.queryList();
      },
      handleSelection(row) {
        let selectUuidList = [], self  = this;
        selectUuidList =  row.map((item) => item.uuid);
        self.updateWindow({
          selectUuidList
        })
      },
      onWindowClick: function () {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      getCondition: function () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.windowData.searchConditionRawList && this.windowData.searchConditionRawList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionRawList)
        }
        return conditionList
      },
      openVmDetailPage: function (uuid) {
        if (this.dbData.vm[uuid].type === 'UserVm' && this.dbData.vm[uuid].hypervisorType === 'KVM') this.openSideWindow('VmInstanceDetailDlg', {uuid: uuid})
        if (this.dbData.vm[uuid].type === 'ApplianceVm' && this.dbData.vm[uuid].hypervisorType === 'KVM') this.openSideWindow('VirtualRouterDetailDlg', {uuid: uuid})
        if ((this.dbData.vm[uuid].type === 'ApplianceVm' || this.dbData.vm[uuid].type === 'UserVm') && this.dbData.vm[uuid].hypervisorType === 'ESX') this.openSideWindow('vCenterVirtualRouterVmInstanceDetailDialog', {uuid: uuid})
      },
      hasAttachedVpcVRouter: function () {
        return this.dbData.l3network[this.windowData.dataUuid].vpcVRouterUuid !== ''
      },
      attachVpcNetworkToVm: function (vmUuidList) {
        let event = this.createEvent('vm.action.attachL3NetworkToVm', this.dbData.vm[vmUuidList[0]] ? this.dbData.vm[vmUuidList[0]].name : '', vmUuidList.length)
        let tasks = []
        vmUuidList.forEach((uuid) => {
          ((uuid) => {
            let p = rpc.post(`vm-instances/${uuid}/l3-networks/${this.windowData.dataUuid}`, null, event)
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
      detachVpcNetworkFromVm: function (vmNicUuidList) {
        console.log(this.selectedList)
        let event = this.createEvent('vm.action.detachL3NetworkFromVm', this.selectedList.length === 1 ? this.dbData.vm[this.selectedList[0]].name : '', this.selectedList.length)
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
      hasAttachedVm: function () {
        return rpc.query('vm-instances', {
          q: ['type=UserVm', `vmNics.l3NetworkUuid=${this.windowData.dataUuid}`]
        }).then((resp) => {
          let has = resp.inventories.length > 0
          // let l3network = _.cloneDeep(this.dbData.l3network[this.windowData.dataUuid])
          return this.updateDbRow({
            tableName: 'l3network',
            id: this.windowData.dataUuid,
            data: {
              hasAttachedVm: has
            }
          })
        })
      },
      pageAttach: function () {
        const self = this
        let l2NetworkUuid = this.dbData.l3network[self.windowData.dataUuid].l2NetworkUuid
        let clusterUuidList = this.dbData.l2network[l2NetworkUuid] ? this.dbData.l2network[l2NetworkUuid].attachedClusterUuids : []
        let uuidList = []
        let tasks = []
        let p = rpc.query('vm-instances', {
          q: ['type=UserVm', 'hypervisorType=KVM', `cluster.uuid?=${clusterUuidList}`, `vmNics.l3NetworkUuid=${self.windowData.dataUuid}`]
        }).then((resp) => {
          let unableUuidList = resp.inventories.map(it => it.uuid)
          return rpc.query('vm-instances', {
            q: ['type=UserVm', 'hypervisorType=KVM', `cluster.uuid?=${clusterUuidList}`, `uuid!?=${unableUuidList}`]
          }).then((resp) => {
            uuidList = uuidList.concat(resp.inventories.map(it => it.uuid))
          })
        })
        tasks.push(p)
        p = rpc.query('vm-instances', {
          q: ['type=UserVm', 'hypervisorType=KVM', `cluster.uuid?=${clusterUuidList}`, `defaultL3NetworkUuid%20is%20null`]
        }).then((resp) => {
          uuidList = uuidList.concat(resp.inventories.map(it => it.uuid))
        })
        tasks.push(p)
        Promise.all(tasks).then(() => {
          self.openDialog('VmInstanceMultiSelectListDlg', {
            conditions: [`uuid?=${_.uniq(uuidList)}`, 'state?=Running,Stopped'],
            select: (vmUuidList) => self.attachVpcNetworkToVm(vmUuidList).then(() => {
              self.queryList()
              self.hasAttachedVm()
            })
          })
        })
      },
      pageDetach: function () {
        let selectedUuidList = this.selectedList
        let vmNicUuidList = selectedUuidList
          .map(uuid => this.dbData.vm[uuid].vmNics.filter(it => it.l3NetworkUuid === this.windowData.dataUuid)[0].uuid)
        this.openDialog('ConfirmDlg', {
          title: 'vpcNetwork.detach',
          description: 'vpcNetwork.detachConfirm',
          uuidList: selectedUuidList,
          icon: 'vm_popupico',
          ok: () => {
            this.detachVpcNetworkFromVm(vmNicUuidList).then(() => {
              this.queryList()
              this.hasAttachedVm()
            })
          },
          getName: (uuid) => {
            return this.dbData.vm[uuid].name;
          }
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
    },
    filters: {

    },
    watch: {
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : [],
            dataUuid: this.param && this.param.uuid
          }).then(() => this.queryList())
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

