<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span  class="title">{{getTitle()}}</span>
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
        @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
           </span>
           <el-table-column type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.defaultIp')" prop="defaultIp">
            <template slot-scope="scope">
              {{getDefaultL3NetworkIp(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.managementIp')" prop="managementIp">
            <template slot-scope="scope">
              {{getHostIp(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.hypervisorType')" prop="hypervisorType"></el-table-column>
          <el-table-column :label="$t('common.cluster')" prop="cluster">
            <template slot-scope="scope">
              {{getClusterName(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
             {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.availableCount"
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
  import MultiSelectedList from 'src/windows/Base/MultiSelectList';
  import VirtualRouterList from 'src/network/virtualRouter/List';
  import TableBodyItemState from "../../component/TableBodyItemState";
  export default {
    name: "VirtualRouterListMultiSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, MultiSelectedList, VirtualRouterList],
    data(){
      return {
        selectVal: 'name',
        searchStr:'',
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
        sortDirection: '-',
        selectedUuidList:[],
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      getTitle () {
        if (this.dialogData.param.title) {
          return this.dialogData.param.title
        } else {
          return this.$t('common.selectVirtualRouter')
        }
      },
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.dialogData.param.conditions && Array.isArray(self.dialogData.param.conditions)) {
          conditionList = conditionList.concat(self.dialogData.param.conditions)
        }
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        if(!self.isSelected) return;
        if(self.dialogData.param.select)
        self.dialogData.param.select(self.selectedList);
        if(self.dialogData.param.ok)
          self.dialogData.param.ok(self.selectedList);
        self.closeDialog(self.windowId);
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList:uuidList
        })
      },
    }
  }
</script>

<style scoped>

</style>
