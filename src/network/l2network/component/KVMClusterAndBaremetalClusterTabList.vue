<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.cluster') }}{{$t("common.colon")}}</span>
          <drop-down class="dropdown" v-if="dbData.l2network[windowData.dataUuid].type !== 'VxlanNetwork'">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-attach" v-if="dbData.l2network[windowData.dataUuid].type !== 'VxlanNetworkPool'" style="padding-top: 12px;" @click="(dbData.l2network[windowData.dataUuid].type !== 'VxlanNetwork') && attachCluster(windowData.dataUuid)" :class="{'disabled-text': dbData.l2network[windowData.dataUuid].type === 'VxlanNetwork'}">{{$t('common.attach')}}</a>
                  <a id="common-attach" v-if="dbData.l2network[windowData.dataUuid].type === 'VxlanNetworkPool' " style="padding-top: 12px;" @click="pageVxlanNetworkPoolAttachCluster()">{{$t('common.attach')}}</a>
                  <a id="common-detach" style="padding-bottom:12px;" @click="(dbData.l2network[windowData.dataUuid].type !== 'VxlanNetwork') && canDetachCluster() && detachCluster_Dlg(windowData.dataUuid)" :class="{'disabled-text': !canDetachCluster() || (dbData.l2network[windowData.dataUuid].type === 'VxlanNetwork')}">{{$t('common.detach')}}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
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
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name:'detailCluster/${scope.row.uuid}'})">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('l2network.vtepcidr')" prop="" v-if="dbData.l2network[windowData.dataUuid] && dbData.l2network[windowData.dataUuid].type === 'VxlanNetworkPool'">
          <template slot-scope="scope">
            {{dbData.l2network[windowData.dataUuid].attachedCidrs && dbData.l2network[windowData.dataUuid].attachedCidrs[uuid]}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
              :page-sizes="[10, 20, 50, 100]"
              :page-size="windowData.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="windowData.availableCount"
              class="page-table-pagination"
              @current-change="pageCurrentChange"
              @size-change="pageSizeChange"
              :current-page="windowData.pageIndex">
      </el-pagination>
      {{itemList}}
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
  import ClusterList from 'src/om/cluster/List'

  export default {
    name: "ClusterTabListForL2Network",
    mixins:[Root,WindowBase,MultiSelectList,ClusterList],
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
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        methods: {
          queryList: this.queryList
        },
        conditions: this.param ? this.param.conditions : []
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
      getCondition: function () {
        let conditionList = []
        if (this.param.conditions) conditionList = conditionList.concat(this.param.conditions)
        if (this.windowData.searchConditionRawList && this.windowData.searchConditionRawList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionRawList)
        }
        return conditionList
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
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
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      attach: function (uuid, clusterList) {
        const self = this
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterList[0]] && self.dbData.cluster[clusterList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, clusterList.length)
        let tasks = []
        let p = null
        clusterList.forEach(function (cluster) {
          ((cluster) => {
            p = rpc.create(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: resp.inventory
                })
                self.queryList()
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(cluster)
        })
        return Promise.all(tasks)
      },
      pageVxlanNetworkPoolAttachCluster: function () {
        const self = this
        self.openFullMainWindow('VxlanNetworkPoolAttachClusterDlg', {
          uuid: self.windowData.dataUuid,
          ok: (params) => self.attachVxlanNetworkPoolToCluster(self.windowData.dataUuid, params)
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
      attachCluster: async function (uuid) {
        const self = this
        let clusterUuidList = []
        clusterUuidList = await self.getL2NetworkAttachableCluster(uuid)
        let conditions = [`uuid!?=${clusterUuidList}`]
        let dlg = 'ClusterSelectListDlg'
        if (self.getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
          dlg = 'KVMClusterAndBaremetalClusterSelectListDlg'
        } else {
          conditions.push('hypervisorType=KVM')
        }
        await self.openSideWindow(dlg, {
          conditions: conditions,
          select: (clusterList) => self.attach(uuid, clusterList)
        })
      },
      detachCluster_Dlg: function (uuid) {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        let self = this
        if (uuidList.length > 0) {
          let detachDlg = 'DetachClusterFromL2ConfirmDlg'
          if (self.dbData.cluster[uuidList[0]] && self.dbData.cluster[uuidList[0]].hypervisorType === 'baremetal') {
            detachDlg = 'DetachBaremetalClusterFromL2ConfirmDlg'
          }
          this.openDialog(detachDlg, {
            uuidList,
            ok: () => {
              self.detachCluster(uuid).then(() => {
                self.queryList()
              })
            }
          })
            .then(() => {
            })
        }
      },
      canDetachCluster: function () { // can not detach vCenter Cluster
        const self = this
        if (self.selectedList.length <= 0) return false
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          if (self.dbData.cluster[self.selectedList[i]].hypervisorType === 'ESX') {
            return false
          }
        }
        return true
      },
      detachCluster: function (uuid) {
        const self = this
        if (self.selectedList.length <= 0) return
        let i18nContext = 'l2network.action.detach'
        if (self.dbData.cluster[self.selectedList[0]] && self.dbData.cluster[self.selectedList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.detachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, self.selectedList.length)
        let tasks = []
        let q = null
        self.selectedList.forEach(function (cluster) {
          ((cluster) => {
            q = rpc._delete(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
              .then((resp) => {
                let l2network = resp.inventory
                l2network.attachedClusterUuids.splice(cluster, 1)
                self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: l2network
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(q)
          })(cluster)
        })
        return Promise.all(tasks)
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
      'dbData.host': function (conditions, oldConditions) {
        this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({
          curPrimaryStorageUuid: this.param.curPrimaryStorageUuid
        }).then(() => this.queryList())
        this.destroyDialogs()
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

