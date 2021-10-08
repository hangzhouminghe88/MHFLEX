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
          :page-sizes="[5, 10, 20, 50, 100]"
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
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import TableBodyItemList from "../../component/TableBodyItemList";

  export default {
    name: "VmSingleSelectListDlg",
    components: {TableBodyItemList, TableBodyItemState, DialogTemplate},
    mixins: [WindowBase, VmList, MultiSelectList],
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
      let self = this;
      self.updateWindow({
        pageSize: 5,
        pageIndex: 1,
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          return self.queryList();
        })
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
        let conditionList = [];
        conditionList.push(`state?=Running,Stopped`);
        // if (this.windowData.attachableVmUuidList.length > 0) {
        //   conditionList.push(`uuid?=${this.windowData.attachableVmUuidList.join()}`)
        // }
        conditionList.push('type=UserVm');
        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      cancel() {
        let self = this;
        self.closeDialog(self.windowId)
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
