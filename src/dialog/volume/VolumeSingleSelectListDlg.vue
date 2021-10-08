<template>
  <dialog-template>
    <div slot="title">{{$t('common.selectImage')}}</div>
    <div slot="body">
      <div style="padding:30px;overflow: hidden">
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
          @row-click="handleSingleSelect"
          highlight-current-row>
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('common.name')"></el-table-column>
          <el-table-column
            prop="type"
            :label="$t('common.type')"></el-table-column>
          <el-table-column
            :label="$t('common.size')">
            <template slot-scope="scope">
              {{bytesToSize(scope.row.size)}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item"  :state="scope.row.state"></table-body-item-state>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.status')">
            <template slot-scope="scope">
              <table-body-item-state slot="item"  :state="scope.row.status"></table-body-item-state>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.attached')">
            <template slot-scope="scope">
              {{!!dbData.volume[scope.row.uuid].vmInstanceUuid ? $t('common.yes') : $t('common.no')}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.sharedVolume')">
            <template slot-scope="scope">
              {{dbData.volume[scope.row.uuid].isShareable ? $t('common.yes') : $t('common.no')}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.primaryStorage')">
            <template slot-scope="scope">
              {{getPsName(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[5, 10]"
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
    <div class="dialog-footer" slot="footer">
      <span @click="confirmDlg" class="btn-confirm">{{$t('common.ok')}}</span>
      <span @click="close" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import DialogTemplate from "../DialogTemplate";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VolumeList from 'src/ecs/volume/List';

  export default {
    name: "VolumeSingleSelectDlg",
    components: {DialogTemplate},
    mixins: [WindowBase, Root, MultiSelectList, VolumeList],
    data() {
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created() {
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    methods: {
      ...Utils,
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirmDlg() {
        let self = this;
        self.dialogData.param.ok(self.createParam());
        self.closeDialog(self.windowId);
      },
      createParam() {
        let self = this;
        return self.templateRadio;
      },
      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions !== undefined) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
    },
    watch: {
      'windowData.pageIndex': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.queryList();
        }
      },
      'windowData.pageSize': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.queryList();
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .search-content {
    text-align: right;
    /* float: right; */
    display: inline-block;
    /* float: right; */
    right: -190px;
    position: relative;
  }
</style>
