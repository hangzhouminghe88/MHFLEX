<template>
  <dialog-template>
    <div slot="title" class="el_dialog_header">
      <span id="cluster-deleteCluster">{{ $t('timer.select') }}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </div>
    <div slot="body">
      <div style="padding:30px;overflow-y: hidden;">
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
          @row-click="handleSingleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px;">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.uuid">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')">
            <template slot-scope="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('timer.strategy')">
            <template slot-scope="scope">
              {{$t('timer.execute', {length: scope.row.repeatCount})}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('timer.startTime')">
            <template slot-scope="scope">
              {{scope.row.startTime && formatDatetime(new Date(scope.row.startTime))}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('timer.cycle')">
            <template slot-scope="scope">
              {{showInterval(scope.row.schedulerInterval)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('timer.timerState')">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="timerIsDone(scope.row.uuid) ? 'Done' : 'Running'"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{scope.row.createDate && formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
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
    <div slot="footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import TimerList from 'src/om/timer/List';
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "AttachSchedulerJobDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, TimerList, MultiSelectList],
    data() {
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        currTab: 'available',
        itemList: [],
        templateRadio: ''
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: '-',
        sortDirection: 'createDate'
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
     getCondition() {
       let conditionList = [];
       if (this.searchStr !== '' && this.selectVal !== '') {
         conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
       }
       return conditionList
     },

      handleSingleSelect(rows) {
        let self = this;
        self.templateRadio = rows.uuid;
      },
      pageCurrentChange(val) {
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
          .then(() => {
            self.queryList();
          })
      },
      pageSizeChange(val) {
        let self = this;
        self.updateWindow({
          pageSize: val
        })
          .then(() => {
            self.queryList();
          })
      },
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        if (!this.$data.templateRadio) return
        if (this.dialogData.param.select) {
          this.dialogData.param.select(this.$data.templateRadio)
        } else if (this.dialogData.param.ok) {
          this.dialogData.param.ok(this.$data.templateRadio)
        }
        this.closeDialog(this.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
