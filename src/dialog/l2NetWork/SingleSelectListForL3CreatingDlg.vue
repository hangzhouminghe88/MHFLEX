<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title" v-if="!windowData.vxlanNetworkPool">{{$t("common.selectL2network")}}</span>
      <span class="title" v-if="windowData.vxlanNetworkPool">{{$t("l2network.selectVxlanNetworkPools")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div class="page-toolbar-container" style="display: flex">
        <div class="page-toolbar-left">
          <div class="tab-container">
            <div class="tab-item" :class="{'is-active': windowData.currSelectTab === 'default'}" @click="changeTab('default')">{{$t('common.default')}}</div>
            <div class="tab-item" :class="{'is-active': windowData.currSelectTab === 'all'}" @click="changeTab('all')">{{$t('operationLog.all')}}</div>
          </div>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
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
      </div>
        <el-table
          :data="itemList"
          highlight-current-row
          @row-click="handleSingleSelect">
           <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
           </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.physicalInterface')" prop="physicalInterface" v-if="dbData.common.isAdmin">
          </el-table-column>
          <el-table-column :label="$t('common.type')" prop="type">
          </el-table-column>
          <el-table-column :label="$t('common.vlan')" prop="vlan">
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.total > 0"
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.total"
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
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import L2NetWorkList from "src/network/l2network/List";
  import Utils from 'src/utils/utils'
  import _ from 'lodash';

  export default {
    name: "SingleSelectListForL3CreatingDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, L2NetWorkList],
    created(){
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        l2networkList: [],
        currSelectTab: 'default',
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        return this.getVmwareL2Network()
      }).then(() => {
        return this.getUsedL2Network()
      }).then(() => {
        return this.queryList()
      })
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        templateRadio: '',
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
        usedL2NetworkList: [],
        vmwareL2NetworkList: [],
        itemList: []
      }
    },
    methods: {
      getCondition: function () {

        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList.push('type!=VxlanNetworkPool')
        let uuidList = this.$data.vmwareL2NetworkList
        if (this.windowData.currSelectTab === 'default') {
          uuidList = uuidList.concat(this.$data.usedL2NetworkList)
        } else {
          _.remove(conditionList, (item) => { item.indexOf('uuid!?=') > -1 })
        }
        conditionList.push(`uuid!?=${uuidList}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      getVmwareL2Network () {
        return rpc.query(`l3-networks`, {q: `l2Network.cluster.type=vmware`}).then(resp => {
          let vmwareL2NetworkList = resp.inventories.map(l2 => l2.l2NetworkUuid)
          this.$data.vmwareL2NetworkList = vmwareL2NetworkList
        })
      },
      getUsedL2Network: function () {
        let usedL2NetworkList = []
        return rpc.query('l3-networks', {
          fields: 'l2NetworkUuid'
        }).then(resp => {
          usedL2NetworkList = resp.inventories.map(item => item.l2NetworkUuid)
          this.$data.usedL2NetworkList = usedL2NetworkList
        })
      },
      changeTab: function (tabName) {
        this.itemList = [];
        if (this.windowData.currSelectTab !== tabName) {
          this.updateWindow({
            currItemUuid: '',
            currSelectTab: tabName,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            sortBy: 'createDate',
            sortDirection: '-',
            templateRadio: '',
          }).then(() => {
            this.queryList()
          })
        }
      },
      select: function (uuid) {
        this.singleSelect(uuid)
        this.param.select(uuid)
      },
      ...Utils
      ,
      handleSingleSelect(rows){
        let self = this;
        self.templateRadio = rows.uuid;
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
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
      confirm() {
        let self = this;
        self.dialogData.param.ok(self.templateRadio);
        self.closeDialog(self.windowId);
      }

    }
  }
</script>

<style scoped>
  .tab-container{
    display: inline-flex;
    border: 1px solid #39f;
    border-radius: 2px;
    cursor: pointer;
  }

  .tab-item{
    padding: 5px 20px;
    background: #fff;
    border-radius: 2px;
    display: inline-block;
  }

  .is-active{
    background: #39f;
    color: #fff;
  }
</style>
