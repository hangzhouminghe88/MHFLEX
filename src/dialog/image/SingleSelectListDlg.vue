<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title">{{$t("common.selectImage")}}</span>
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
          <el-table-column :label="$t('common.backupStorage')">
            <template slot-scope="scope">
              {{dbData.backupstorage[scope.row.backupStorageRefs[0].backupStorageUuid].name}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.mediaType')">
            <template slot-scope="scope">
              {{scope.row.mediaType === 'RootVolumeTemplate' ? 'Image' : 'ISO'}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.platform')" prop="platform">
          </el-table-column>
          <el-table-column :label="$t('common.size')" prop="size">
            <template slot-scope="scope">
              {{bytesToSize(scope.row.size)}}
            </template>
          </el-table-column>

          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.pageCount > 0"
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.pageCount"
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
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import VirtualRouterImageList from "src/ecs/image/List";
  import _ from 'lodash';

  export default {
    name: "VirtualRouterImageListSingleSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, VirtualRouterImageList],
    created(){
      let self = this;

      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      })
        .then(() => {
          this.queryList();
        })
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        templateRadio: '',
        conditionNameList:[
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList:[]
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
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
        if(!self.templateRadio){
          self.$message('您还没有选择镜像, 请选择');
          return
        }
        self.dialogData.param.select(self.templateRadio);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
