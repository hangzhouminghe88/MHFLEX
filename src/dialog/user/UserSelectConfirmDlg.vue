<template>
  <dialog-template>
    <div slot="title" class="modal-header">
      <span class="title">{{$t('common.selectVirtualID')}}</span>
      <span @click="cancel" class="el-icon-close dialog-close"></span>
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
          @selection-change="handleSelection">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('account.name')" prop="accountName"></el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
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
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import UserList from 'src/om/user/List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  export default {
    name: "UserSelectConfirmDlg",
    mixins: [WindowBase, UserList],
    data(){
      return {
        itemList: [],
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    created(){
      let self = this, dataUuidList = [];
      rpc.query(`accounts/users`, {
        q: `group.uuid=${self.dialogData.param.uuid}`,
        fields: 'uuid'
      })
        .then((resp) => {
          resp.inventories.forEach((item) => {
            dataUuidList.push(item.uuid)
          })
          self.updateWindow({
            pageIndex: 1,
            pageSize: 5,
            sortBy: 'createDate',
            sortDirection: '-',
            selectedUuidList: [],
            dataUuidList: dataUuidList,
            methods: {
              queryList: self.queryList
            }
          })
            .then(() => {
              self.queryList();
            })
        })
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        conditionList.push(`uuid!?=${this.windowData.dataUuidList.join(',')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      handleSelection(rows){
        let self = this;
        let uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
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
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
          })
      },
      confirm(){
        let self = this;
        if(!self.windowData.selectedUuidList) return;
        self.dialogData.param.select(self.windowData.selectedUuidList);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
