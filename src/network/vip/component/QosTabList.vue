<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{'QoS' + $t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-add" v-permission="'VIP_QOS.SET'" style="padding-top: 12px;" @click="pageAddVipQos()">{{$t("common.add")}}</a>
                  <a id="common-destroy" v-permission="'VIP_QOS.DELETE'" style="padding-bottom: 12px;" @click="isSelected && pageDeleteVipQos()" :class="{ 'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
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
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.port')"
                width="120"
                prop=""
                show-overflow-tooltip
                >
          <template slot-scope="scope">
            {{scope.row.port !== 0 ? scope.row.port : $t('vip.allPorts')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.networkOutboundBandwidth')">
          <template slot-scope="scope">
            {{scope.row.outboundBandwidth !== 0 ? bytesToSize(parseInt(scope.row.outboundBandwidth), 'bps') : $t('common.unlimited')}}
          </template>
        </el-table-column>
          <el-table-column :label="$t('common.networkInboundBandwidth')">
            <template slot-scope="scope">
              {{scope.row.inboundBandwidth !== 0 ? bytesToSize(parseInt(scope.row.inboundBandwidth), 'bps') : $t('common.unlimited')}}
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
  import PageBase from 'src/windows/PageBase';
  import VipList from '../List'

  export default {
    name: "QosTabList",
    mixins:[Root,WindowBase,MultiSelectList,VipList, PageBase],
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
          queryList: this.getVipQos
        }
      }).then(() => this.getVipQos())
    },
    updated() {
    },
    destroyed() {

    },
    data(){
      return{
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
      getVipQos: function () {
        rpc.query(`vip/${this.windowData.dataUuid}/vip-qos`, {
          replyWithCount: true
        })
          .then((resp) => {
            let table = {}
            let uuidList = resp.inventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            this.updateWindow({ uuidList, table, availableCount: resp.total })
            this.updateDbTable({
              tableName: 'vipqos',
              list: resp.inventories,
              availableCount: resp.total
            }).then(() =>{
              this.itemList = this.getItemList();
            })
          })
      },

      getItemList(){
        return this.windowData.uuidList.map((uuid) => {
          return  this.dbData.vipqos[uuid];
        })
      },

      pageAddVipQos: function () {
        const self = this
        let vipUuid = self.windowData.dataUuid
        let unAvailablePort = {}
        rpc.query(`vip/${vipUuid}/vip-qos`)
          .then((resp) => {
            resp.inventories.forEach(function (item) {
              ((item) => {
                unAvailablePort[item.port] = true
              })(item)
            })
            self.param.vipAddVipQos({
              unAvailablePort,
              ok: (params) => self.addVipQos(vipUuid, params).then(() => self.getVipQos()),
              queryList: self.queryList,
            });
          }, () => {
            self.param.vipAddVipQos({
              unAvailablePort,
              ok: (params) => self.addVipQos(vipUuid, params).then(() => self.getVipQos()),
              queryList: self.queryList,
            });
          })
      },
      pageDeleteVipQos: function () {
        let selectedUuidList = this.selectedList
        let ports = selectedUuidList.map(uuid => this.dbData.vipqos[uuid].port)
        let self = this
        this.openDialog('ConfirmDlg', {
          title: 'vip.deleteQos',
          description: 'vip.deleteQosConfirm',
          icon: '',
          ok: () => {
            self.deleteVipQos(self.windowData.dataUuid, ports)
              .then(() => {
                self.getVipQos()
              })
          }
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      }
    },
    filters: {

    },
    watch: {
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({ dataUuid: this.param.uuid }).then(() => this.getVipQos())
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

