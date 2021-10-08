<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("common.selectVmInstance") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="dialog-body-container">
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
      <div class="dialog-body-content">
        <el-table :data="itemList"
                  highlight-current-row
                  @row-click="handleSingleSelect">
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
          <el-table-column width="50px;">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.cpuNum')" prop="cpuNum"></el-table-column>
          <el-table-column :label="$t('common.memorySize')">
            <template slot-scope="scope">
              {{scope.row.memorySize | bytesToSize}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.defaultIp')">
            <template slot-scope="scope">
              <table-body-item-list :content="getDefaultL3NetworkIp(scope.row.uuid)"></table-body-item-list>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.hostIp')">
            <template slot-scope="scope">
              {{getHostIp(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"></table-body-item-state>
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
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DialogTemplate from "../DialogTemplate";
  import WindowBase from 'src/windows/Window';
  import VmList from 'src/ecs/ecsInstance/List';
  import ScrollBar from "../../component/scoller/ScrollBar";
  import TableBodyItemState from "../../component/TableBodyItemState";
  import TableBodyItemList from "../../component/TableBodyItemList";
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: "EipToVmListSingleSelectList",
    components: {TableBodyItemList, TableBodyItemState, DialogTemplate},
    mixins: [WindowBase, ScrollBar, VmList],
    data() {
      return {
        templateRadio: '',
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created() {
      let nicList = []
      let taskList = []
      if (this.dialogData.param.data) {
        let dataUuid = this.dialogData.param.data
        this.updateWindow({ dataUuid })
        let p = rpc.query(`eips/${this.windowData.dataUuid}/vm-instances/candidate-nics`)
          .then((resp) => {
            nicList = nicList.concat(resp.inventories)
          })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          _.uniqBy(nicList, 'uuid')
          this.vmNicList = nicList
          this.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 5,
            sortBy: 'createDate',
            sortDirection: '-',
            currItemUuid: '',
            methods: {
              queryList: this.queryList
            }
          }).then(() => this.queryList())
        })
      }
    },
    methods: {
      confirm() {
        let self = this;
        if (!this.$data.templateRadio) return;
        this.dialogData.param.ok(this.$data.templateRadio);
        self.closeDialog(self.windowId)
      },
      //查询条件
      getCondition() {
        let conditionList = []
        conditionList.push(`uuid?=${this.vmNicList.map(it => it.uuid).join()}`)
        conditionList.push('vmInstance.type=UserVm')
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: function () {
        let vmNicInventories
        let uuidList
        let table = {}
        let vmUuidList
        rpc.query('vm-instances/nics', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        })
          .then((resp) => {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              availableCount: resp.total
            })
            vmNicInventories = resp.inventories
            uuidList = vmNicInventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            vmUuidList = _.uniq(vmNicInventories.map((item) => item.vmInstanceUuid))
            this.updateWindow({
              vmUuidList
            })
            return rpc.queryResourceNames(this, 'vm', vmUuidList)
          })
          .then(() => {
            this.updateWindow({ uuidList, table })
            this.updateDbTable({
              tableName: 'vmNicRefs',
              list: vmNicInventories
            })
          }).then(() => {
          return rpc.query('vm-instances', {
            q: `uuid?=${vmUuidList}`
          })
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'vm',
            list: resp.inventories
          }).then(() => {
            this.itemList = this.getItemList();
          })
        })
      },

      getItemList(){
        let self = this;
        return self.windowData.vmUuidList.map((uuid) => {
          return self.dbData.vm[uuid];
        })
      },

      cancel() {
        let self = this;
        self.closeDialog(self.windowId)
      },
      //分页改变页码
      pageSizeChange(val) {
        let self = this;
        self.updateWindow({
          pageSize: val
        })
      },
      //改变当前页
      pageCurrentChange(val) {
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
      },
      //处理单选
      handleSingleSelect(row) {
        this.templateRadio = row.uuid;
      },
      //搜索过滤
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        });
        this.queryList();
      }
    }
  }
</script>

<style scoped>

</style>
