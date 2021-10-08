<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{$t('common.vm') + $t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="loadbalancer-attachVmNic" style="padding-top: 12px;" @click="!isSelected && addVmNic()" :class="{ 'disabled-text': isSelected}">{{$t("loadbalancer.attachVmNic")}}</a>
                  <a id="loadbalancer-detachVmNic" style="padding-bottom: 12px;" @click="isSelected && pageDelete()" :class="{ 'disabled-text': !isSelected}">{{$t("loadbalancer.detachVmNic")}}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">

        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelection">
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
        </el-table-column>
        <el-table-column :label="$t('loadbalancer.vmNic')" prop="internalName">
        </el-table-column>
        <el-table-column :label="$t('common.ip')" prop="ip">
        </el-table-column>
        <el-table-column :label="$t('loadbalancer.loadBalancerPort')" prop="">
          <template slot-scope="scope">
            {{dbData.vmNicRefsA[scope.row.uuid] && dbData.vmNicRefsA[scope.row.uuid].loadBalancerPort}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('loadbalancer.instancePort')" prop="">
          <template slot-scope="scope">
            {{dbData.vmNicRefsA[scope.row.uuid] && dbData.vmNicRefsA[scope.row.uuid].instancePort}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('loadbalancer.vmNicStatus')" prop="" v-if="!dbData.common.isOpensource">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.vmNicRefsA[scope.row.uuid].status"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')"  prop="" v-if="dbData.common.isAdmin && !dbData.common.isOpensource">
          <template slot-scope="scope">
            {{dbData.accountRef[scope.row.uuid] && dbData.accountRef[scope.row.uuid].owner && dbData.accountRef[scope.row.uuid].owner.name}}
          </template>
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination  v-if="windowData.availableCount > 0"
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
  import List from '../List'

  export default {
    name: "LoadBalancerListenervmNicRefsTabList",
    mixins:[Root,WindowBase,MultiSelectList,List],
    props:['param'],
    components:{
      PageTemplate,
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
      }).then(() => {
        return this.queryList()
      })
        .then(() => {
          this.$forceUpdate()
        })
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {

    },
    data(){
      return{
        itemList: [],
        conditionNameList: [
          {
            name: 'common.name',
            value: 'vmInstance.name'
          },
          {
            name: 'common.ip',
            value: 'ip'
          }
        ]
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
      getCondition: function () {
        let conditionList = []
        conditionList.push(`loadBalancerListener.uuid=${this.windowData.dataUuid}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: function () {
        rpc.query(`vm-instances/nics`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        }).then((resp) => {
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize)
          })
          let vmUuidList = _.uniq(resp.inventories.map((item) => item.vmInstanceUuid))
          let vmNicUuidList = _.uniq(resp.inventories.map((item) => item.uuid))
          const self = this
          let table = {}
          let uuidList = vmNicUuidList
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          this.updateWindow({ uuidList, table })
          let LoadBalancerListener = _.cloneDeep(this.dbData.loadBalancerListener[this.windowData.dataUuid])
          let tasks = []
          if (!this.dbData.common.isOpensource) {
            tasks = resp.inventories.map(function (item) {
              return rpc.query('zwatch/metrics', {
                namespace: 'ZStack/LoadBalancer',
                metricName: 'LoadBalancerBackendStatus',
                offsetAheadOfCurrentTime: 1,
                labels: [`ListenerUuid=${self.windowData.dataUuid}`, `NicIpAddress=${item.ip}`]
              })
                .then((status) => {
                  item.status = status.data.length > 0 ? (status.data[0].value > 0 ? 'up' : 'down') : 'down'
                  item.loadBalancerPort = LoadBalancerListener.loadBalancerPort
                  item.instancePort = LoadBalancerListener.instancePort
                  item.listenerUuid = LoadBalancerListener.uuid
                  return self.updateDbRow({
                    tableName: 'vmNicRefsA',
                    id: item.uuid,
                    data: item
                  })
                })
            })
          }

          rpc.query(`vm-instances`, {
            q: `uuid?=${vmUuidList.join()}`
          }).then((resp) => {
            this.updateDbTable({
              tableName: 'vm',
              list: resp.inventories
            })
          })
          if (this.dbData.common.isAdmin) {
            rpc.query('accounts/resources/refs', {
              q: `resourceUuid?=${vmNicUuidList.join()}`
            }).then((resp) => {
              let accountInventories = resp.inventories
              let uuidList = _.uniq(resp.inventories.map((item) => item.accountUuid))
              return rpc.query('accounts', {
                q: `uuid?=${uuidList.join()}`
              }).then((resp) => {
                accountInventories.forEach((item, index) => {
                  item.uuid = vmNicUuidList[index]
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
          }
          Promise.all(tasks).then(() => {
            self.updateDbTable({
              tableName: 'vmNicRefs',
              list: resp.inventories
            })
            this.itemList = this.getData();
          })
        })
      },
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.vmNicRefs[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.vmNicRefs[uuid]
          }
        )
      },
      addVmNic: function () {
        const self = this;
        self.param.detachVmNic();
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      openVmInstanceDetailPage (uuid, $event) {
        let pageName = this.dbData.vm[this.dbData.vmNicRefs[uuid].vmInstanceUuid].hypervisorType === 'ESX' ? 'vCenterVirtualRouterVmInstanceDetailDialog' : 'VmInstanceDetailDlg'
        this.openSideWindow(pageName, {uuid: this.dbData.vmNicRefs[uuid].vmInstanceUuid})
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      pageDelete: function () {
        let uuidList = []
        uuidList = self.selectList;
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('DeleteLoadBalancerListenerVmNicConfirm', {
            uuidList,
            title: 'loadbalancer.detachVmNic',
            description: 'loadbalancer.info.detachVmNicConfirm',
            icon: 'vm_plain',
            ok: () => {
              self.deleteListenerVmNics(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.vm[self.dbData.vmNicRefs[uuid].vmInstanceUuid].name
            }
          })
        }
      },
      deleteListenerVmNics: function (uuidList) {
        let event = this.createEvent('vm.action.detachVmNicToLoadBalancer', uuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[uuidList[0]].vmInstanceUuid].name : '', uuidList.length)
        const self = this
        rpc._delete(`load-balancers/listeners/${this.windowData.dataUuid}/vm-instances/nics`, {
          vmNicUuids: uuidList
        }, event)
          .then((resp) => {
            self.setEventSuccess(event)
            self.queryList()
            self.param.refresh()
          }, () => {
            self.setEventFail(event)
          })
      },
      addListenerVmNics: function (param) {
        if (!param || (param.vmNicUuidList.length <= 0)) return
        let event = this.createEvent('vm.action.addVmNicToLoadBalancer', param.vmNicUuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[param.vmNicUuidList[0]].vmInstanceUuid].name : '', param.vmNicUuidList.length)
        let self = this
        let msg = {
          vmNicUuids: param.vmNicUuidList
        }
        rpc.create(`load-balancers/listeners/${self.windowData.dataUuid}/vm-instances/nics`, msg, event)
          .then((resp) => {
            self.setEventSuccess(event)
            self.queryList()
          }, () => {
            self.setEventFail(event)
          })
      }
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
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : [],
            dataUuid: this.param.uuid
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

