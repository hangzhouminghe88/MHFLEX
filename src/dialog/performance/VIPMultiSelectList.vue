<template>
  <dialog-template :width="'1000px'">
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("common.selectVmInstance") }}{{itemList}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="dialog-body-container">
      <div class="radio-group">
        <div class="tab-content">
          <div class="tab-item" :class="{'active': windowData.currTab === 'customized' }" @click="changeCurrTab('customized')">{{ $t('common.diy') }}</div>
          <div class="tab-item" :class="{'active': windowData.currTab === 'system'}"  @click="changeCurrTab('system')">{{ $t('common.system') }}</div>
        </div>
        <span style="padding: 0 15px;display: inline-block;float: right;">
          <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
            <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
              <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                  :value="item.value"></el-option>
              </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
        </span>
      </div>
      <el-table
        :data="windowData.uuidList"
        @selection-change="handleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
         <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name">
          <template slot-scope="scope">
            {{dbData.vip[scope.row].name}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.ip')">
          <template slot-scope="scope">
           {{dbData.vip[scope.row].ip}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.gateway')">
          <template slot-scope="scope">
            {{dbData.vip[scope.row].gateway}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.netmask')">
          <template slot-scope="scope">
            {{dbData.vip[scope.row].netmask}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.vip[scope.row].state" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.useFor')">
          <template slot-scope="scope">
            {{getVipUseFor(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" v-if="dbData.common.isAdmin && !dbData.common.isOpensource">
          <template slot-scope="scope">
            {{dbData.vip[scope.row].accountUuid && dbData.account[dbData.vip[scope.row].accountUuid] && dbData.account[dbData.vip[scope.row].accountUuid].name}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(dbData.vip[scope.row].createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="total > 0"
          :page-sizes="[5, 10]"
          :page-size="5"
          :total="total"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import Methods from 'src/network/vip/Methods';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import _ from 'lodash';
  export default {
    name: "VIPMultiSelectList",
    components: {TableBodyItemState},
    mixins: [Methods, WindowBase, MultiSelectList],
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        currTab: 'customized',
        sortDirection: '-',
        selectedUuidList: [],
      })
        .then(() => {
          self.queryList();
        })
    },
    computed:{
      total(){
        let self = this;
        if(self.windowData.currTab === 'customized') return self.windowData.customizedCount;
        if(self.windowData.currTab === 'system') return self.windowData.systemCount;
      }
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      getData(){
        let self = this;
        self.itemList =  self.windowData.uuidList.map((uuid) => {
          return self.dbData.vip[uuid];
        })
      },
      getCondition: async function () {
        let conditionList = [], self = this;
        conditionList = conditionList.concat(self.dialogData.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        let uuidList = await this.initVipUuidList()
        conditionList.push(`uuid?=${uuidList}`)
        return conditionList
      },
      initVipUuidList: async function (tableName) {
        let vipUuidList = []
        let vipResp = await rpc.query(`vips`)
        vipResp.inventories.forEach(item => {
          if (this.windowData.currTab === 'system') {
            if (_.has(item, 'useFor') && item.useFor.indexOf('SNAT') > -1) {
              vipUuidList.push(item.uuid)
            }
          } else {
            if (!_.has(item, 'useFor') || item.useFor.indexOf('SNAT') === -1) {
              vipUuidList.push(item.uuid)
            }
          }
        })
        return vipUuidList
      },
      changeCurrTab(tabName){
        let self = this;
        if(self.windowData.currTab === tabName) return;
        this.updateWindow({
          currTab: tabName,
          pageIndex: 1,
          pageCount: 1,
          pageSize: 5,
          sortBy: 'createDate',
          sortDirection: '-'
        })
        this.queryList()
      },
      confirm(){
        let self = this;
        if(self.selectedList && self.windowData.selectedUuidList.length <=0) return;
        self.dialogData.param.ok(self.selectedList);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>
 .tab-content{
   border: 1px solid #39f;
   border-radius: 2px;
   cursor: pointer;
   display: inline-block;

 }
  .tab-item{
    border-radius: 2px;
    display: inline-block;
    text-align: center;
    font-size: 12px;
    padding: 10px 21px;
  }
  .active{
    background: #39f;
    color: #fff;
  }
</style>
