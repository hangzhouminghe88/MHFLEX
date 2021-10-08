<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title">{{$t("common.selectVip")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="radio-group" style="text-align: right">
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
          <el-table-column :label="$t('common.ip')" prop="ip" >
          </el-table-column>
          <el-table-column :label="$t('common.gateway')" prop="gateway">
          </el-table-column>
          <el-table-column :label="$t('common.netmask')" prop="netmask">
          </el-table-column>

          <el-table-column :label="$t('common.state')" prop="state">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"/>
            </template>
          </el-table-column>

          <el-table-column :label="$t('common.useFor')" prop="useFor">
            <template slot-scope="scope">
              {{getVipUseFor(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.owner')" prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource">
            <template slot-scope="scope">
              {{dbData.vip[scope.row.uuid].accountUuid && dbData.account[dbData.vip[scope.row.uuid].accountUuid] && dbData.account[dbData.vip[scope.row.uuid].accountUuid].name}}
            </template>
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
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import VipList from "src/network/vip/List";
  import _ from 'lodash'

  export default {
    name: "VipListSingleSelectListDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, VipList],
    created(){
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currTab: 'customized',
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        templateRadio: '',
        itemList: [],
        conditionNameList:[
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    methods: {
      getCondition:async function () {
        let conditionList = []
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        let uuidList = await this.initVipUuidList()
        conditionList.push(`uuid?=${uuidList}`)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
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
        self.dialogData.param.select(self.templateRadio);
        self.closeDialog(self.windowId);
      }

    }
  }
</script>

<style scoped>

</style>
