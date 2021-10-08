<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.virtualRouterDevice') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown" >
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-attach" style="padding-top: 12px;" @click="pageAttach()">{{$t("common.attach")}}</a>
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
            <a class="link" @click="$router.push({name:'detailVirtualRouter', params: {uuid: scope.row.uuid}})">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.cpuNum')" prop="cpuNum" >
        </el-table-column>
        <el-table-column :label="$t('common.memorySize')"  prop="memorySize">
          <template slot-scope="scope">
            {{bytesToSize(dbData.vm[scope.row.uuid].memorySize)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.defaultIp')"  prop="">
          <template slot-scope="scope">
            {{dbData.vm[scope.row.uuid].vmNics[0] && getDefaultL3NetworkIp(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.host')">
          <template slot-scope="scope">
            {{getHostName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')">
          <template slot-scope="scope">
            {{getAccountName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
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
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import VirtualRouterVmInstanceList from 'src/network/virtualRouter/List'

  export default {
    name: "VRForVRouterRouteTable",
    mixins:[Root,WindowBase,MultiSelectList,VirtualRouterVmInstanceList],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      this.updateWindow({
        dataUuid:this.param.uuid,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        methods: {
          queryList: this.queryList
        },
        conditions: this.param ? this.param.conditions : []
      }).then(() => this.getAvaiableVrUuidList()).then(() => this.queryList())
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
      getAvaiableVrUuidList: function () {
        let condition = this.windowData.conditions
        return rpc.query('vrouter-route-tables/virtual-router-refs', {
          q: `${condition}`
        }).then((resp) => {
          if (resp.inventories.length === 0) {
            return this.updateWindow({ uuidList: [], table: {}, virtualRouterVmUuidList: [] })
          }
          let virtualRouterVmUuidList = resp.inventories.map(item => item.virtualRouterVmUuid)
          return this.updateWindow({ virtualRouterVmUuidList })
        })
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.virtualRouterVmUuidList) {
          conditionList.push(`uuid?=${this.windowData.virtualRouterVmUuidList}`)
        }
        conditionList.push('applianceVmType=vrouter')
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      getData(){
        let uuidList=[]
        if(!_.isArray(this.windowData.uuidList)) return[]

        uuidList=this.windowData.uuidList.filter(uuid=>this.dbData.vm[uuid])

        return uuidList.map(uuid=>{
          return this.dbData.vm[uuid]
        })
      },
      queryList: function () {
        if (this.windowData.virtualRouterVmUuidList === undefined) return
        if (this.windowData.virtualRouterVmUuidList.length === 0) {
          this.updateWindow({
            pageCount: 1
          })
          let uuidList = []
          let table = {}
          this.updateWindow({ uuidList, table })
          this.updateDbTable({
            tableName: 'vm',
            list: []
          })
          return
        }
        return rpc.query('vm-instances/appliances/virtual-routers', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition()
        }).then((resp) => {
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
            availableCount: resp.total
          })
          let uuidList = resp.inventories.map((item) => item.uuid)
          let table = {}
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          this.updateWindow({ uuidList, table })
          this.updateDbTable({
            tableName: 'vm',
            list: resp.inventories
          })
          this.itemList = this.getData();
        })
      },
      updateVRouterRouteTable: function () {
        let self = this
        let uuid = self.windowData.dataUuid
        rpc.query('vrouter-route-tables', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            return self.updateDbRow({
              tableName: 'vRouterRouteTable',
              id: uuid,
              data: resp.inventories[0]
            }).then(() => {
              self.getAvaiableVrUuidList().then(() => self.queryList())
            })
          })
      },
      getAttachableRouterList: function () {
        return rpc.query('vrouter-route-tables/virtual-router-refs').then((resp) => {
          if (resp.inventories.length === 0) return []
          let uuidList = resp.inventories.map(item => item.virtualRouterVmUuid)
          return uuidList
        })
      },
      pageAttach: function (uuid) {
        const self = this
        this.getAttachableRouterList().then((virtualRouterVmUuidList) => {
          this.openDialog('VirtualRouterListMultiSelectDlg', {
            conditions: [`uuid!?=${virtualRouterVmUuidList.join()}`, 'vmNics.l3Network.networkServices.networkServiceType=VRouterRoute', 'hypervisorType!=ESX', 'applianceVmType=vrouter'],
            ok: (uuidList) => {
              self.attach(self.windowData.dataUuid, uuidList, self.updateVRouterRouteTable)
            }
          })
        })
      },
      pageDetach: function (uuid) {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        let uuidList = self.selectedList
        this.openDialog('DetachVRFromRouteTableConfirmDlg', {
          title: 'vrouterroutetable.detach',
          icon: 'virtual_router_n',
          description: 'vrouterroutetable.detachRouter',
          uuidList,
          ok: () => {
            self.detach(self.windowData.dataUuid, self.selectedList, self.updateVRouterRouteTable)
          },
          getName: (uuid) => {
            return self.dbData.vRouterRouteTable[uuid].name;
          }
        })
      },
      attach (routeTableUuid, uuidList, fn) {
        const self = this
        let event = self.createEvent('vrouterroutetable.action.attach', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.create(`vrouter-route-tables/${routeTableUuid}/attach`, {
              virtualRouterVmUuid: uuid
            }, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      detach (routeTableUuid, uuidList, fn) {
        const self = this
        let event = self.createEvent('vrouterroutetable.action.detach', uuidList.length === 1 ? self.dbData.vm[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.create(`vrouter-route-tables/${routeTableUuid}/detach`, {
              virtualRouterVmUuid: uuid
            }, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
    },
    filters: {
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : []
          }).then(() => {
            return this.getAvaiableVrUuidList()
          }).then(() => {
            return this.queryList()
          })
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

