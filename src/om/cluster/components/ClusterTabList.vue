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
                <div class="dropdown-content" v-if="param.isISCSI" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-attach" style="padding-top: 12px;" @click="!isSelected && pageAttach()" :class="{'disabled-text': isSelected}">{{ $t("common.attach") }}</a>
                  <a id="common-detach" style="padding-bottom:12px;" @click="isSelected && pageDetach()" :class="{'disabled-text': !isSelected}">{{$t("common.detach")}}</a>
               </div>
               <div class="dropdown-content" v-if="!param.isISCSI" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-attach" style="padding-top: 12px;" @click="!isSelected && tabAttach()" :class="{'disabled-text': isSelected}">{{ $t("common.attach") }}</a>
                  <a id="common-detach" style="padding-bottom:12px;" @click="isSelected && tabDetach_Dlg()" :class="{'disabled-text': !isSelected}">{{$t("common.detach")}}</a>
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
      <el-table :data="itemList"@selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name:'detailCluster', params: {uuid: scope.row.uuid}})">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.hypervisorType')" prop="hypervisorType">
          <template slot-scope="scope">
            {{scope.row.hypervisorType}}
          </template>
        </el-table-column>
        <el-table-column  prop="state" :label="$t('common.state')" >
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"></table-body-item-state>
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
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import ClusterList from 'src/om/cluster/List';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import ClusterTabList from 'src/om/zone/components/ClusterTabList'
  import ISCSIMethods from 'src/storage/sanstorage/Methods'
  import primaryStorageConditon from 'src/strategies/primaryStorage/conditon';

  export default {
    name: "ClusterTabList",
    mixins:[Root,WindowBase,ClusterList,MultiSelectList],
    props:['param'],
    components:{
      TableBodyItemState,
    },
    created() {
      this.init()
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click',this.onWindowClick)
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
    },
    methods:{
      ...Utils,
      ...{
        iscsiAttach: ISCSIMethods.methods.attachCluster,
        iscsiDetach: ISCSIMethods.methods.detachCluster,
        getParamList: ISCSIMethods.methods.getParamList
      },
      init:function () {
        this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 10,
          sortBy: 'createDate',
          selectedUuidList:[],
          sortDirection: '-',
          uuid: this.param.uuid,
          methods: {
            queryList: this.queryList
          }
        }).then(() => this.queryList())
      },
      getCondition: function () {
        let conditionList = []
        if (this.param.isISCSI) {
          let iscsiUuid = this.param.uuid
          let existedList = this.dbData.webStorage[iscsiUuid].iscsiClusterRefs.map(it => it.clusterUuid)
          conditionList.push(`uuid?=${existedList}`)
        }
        if (this.param.conditions) conditionList = conditionList.concat(this.param.conditions)
        // conditionList.push('type=zstack')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%${encodeURIComponent(this.searchStr)}%`)
        }
        return conditionList
      },
      async tabAttach(){
        let self = this;
        let psUuidList = await primaryStorageConditon.getPrimaryStorageAttachableCluster(self.dbData.primarystorage[self.param.primaryStorageUuid], self.dbData.common.isOpensource)
        self.openDialog('ClusterSelectListDlg', {
          primaryStorageUuid: self.param.primaryStorageUuid,
          conditions: [`uuid?=${psUuidList}`],
          type: 'selection',
          select: (clusterList) => this.attach(self.param.primaryStorageUuid, clusterList)
        })
      },
      tabDetach_Dlg: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        self.openDialog('ConfirmDlg', {
          title: 'common.detachCluster',
          description: 'cluster.detachCluser',
          icon: 'cluster_popupico',
          uuidList,
          ok: () => {
            self.tabDetach()
          },
          getName(uuid){
            return self.dbData.cluster[uuid].name
          }
        })
      },
      tabDetach: function () {
        const self = this
        let clusterList = []
        clusterList = self.selectedList;
        let event = this.createEvent('cluster.action.psDetach', clusterList.length > 1 ? '' : this.dbData.cluster[clusterList[0]].name, clusterList.length)
        let deletions = clusterList.map(cluster => {
          return rpc._delete(`clusters/${cluster}/primary-storage/${self.param.primaryStorageUuid}`, null, event)
            .then(() => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
        })
        Promise.all([...deletions])
          .then((resp) => {
            rpc.query('primary-storage', {
              q: `uuid=${this.param.primaryStorageUuid}`
            }).then((resp) => {
              this.updateDbRow({
                tableName: 'primarystorage',
                id: self.param.primaryStorageUuid,
                data: resp.inventories[0]
              })
            })
            this.queryList()
          })
      },
      attach: function (uuid, clusterList) {
        const self = this
        let event = this.createEvent('cluster.action.psAttach', clusterList.length > 1 ? '' : this.dbData.cluster[clusterList[0]].name, clusterList.length)
        let add = clusterList.map(cluster => {
          return rpc.create(`clusters/${cluster}/primary-storage/${uuid}`, null, event)
            .then(() => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
        })
        Promise.all([...add])
          .then((resp) => {
            rpc.query('primary-storage', {
              q: `uuid=${this.param.primaryStorageUuid}`
            }).then((resp) => {
              this.updateDbRow({
                tableName: 'primarystorage',
                id: self.param.primaryStorageUuid,
                data: resp.inventories[0]
              })
            })
            this.queryList()
          })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      pageAttach () {
        let iscsiUuid = this.param.uuid
        let existedList = this.dbData.webStorage[iscsiUuid].iscsiClusterRefs.map(it => it.clusterUuid)
        this.openDialog('ClusterSelectListDlg', {
          conditions: [`uuid!?=${existedList}`],
          type: 'selection',
          select: clusterList => this.iscsiAttach(iscsiUuid, clusterList).then(this.queryList, this.queryList)
        })
      },
      pageDetach () {
        const self = this
        let iscsiUuid = this.param.uuid
        let clusterUuidList = this.selectedList
        let isBaremetal = self.dbData.cluster[clusterUuidList[0]] && self.dbData.cluster[clusterUuidList[0]].hypervisorType === 'baremetal';
        let options ={};
        options ={
          title: isBaremetal ? 'common.detachBaremetalCluster' : 'common.detachCluster',
          description: isBaremetal ? 'baremetalCluster.detachCluster' : 'cluster.detachCluster',
          icon: isBaremetal ? 'cluster_popupico' : 'cluster_popupico',
          uuidList: clusterUuidList,
          getName(uuid){
            return self.dbData.cluster[uuid].name;
          },
          ok: () => this.iscsiDetach(iscsiUuid, clusterUuidList).then(this.queryList, this.queryList)
        }
        this.openDialog('ConfirmDlg', options);
      },
      inStates: function () {
        if (!this.isSelected) return
        let statesList = []
        if (arguments) {
          for (var i = 0; i < arguments.length; i++) {
            statesList.push(arguments[i])
          }
        }
        let selectedStatesList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) selectedStatesList.push(this.dbData.cluster[uuid].state)
        })
        let isInStates = selectedStatesList.every((item) => {
          return statesList.some((state) => { return state === item })
        })
        return isInStates
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

