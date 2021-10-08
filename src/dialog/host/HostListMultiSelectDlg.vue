<template>
 <dialog-template>
   <span slot="title" class="modal-plain-header">
      <span id="common-destroyHost">{{$t("common.selectHost")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </span>
   <div slot="body">
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
     </div>
     <el-table
     :data="itemList"
     @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
       <el-table-column type="selection"></el-table-column>
       <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
       <el-table-column :label="$t('common.managementIp')" prop="managementIp"></el-table-column>
       <el-table-column :label="$t('common.cluster')">
         <template
           slot-scope="scope"
         >{{dbData.cluster[dbData.host[scope.row.uuid].clusterUuid].name}}</template>
       </el-table-column>
       <el-table-column :label="$t('common.hypervisorType')" prop="hypervisorType"></el-table-column>
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
   <div slot="footer">
     <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
   </div>
 </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import HostList from 'src/om/host/List';
  export default {
    name: "HostListMultiSelectDlg",
    mixins: [WindowBase, MultiSelectList, HostList],
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
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
        selectedUuidList: [],
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      getCondition: function () {
        let conditionList = [], self = this;
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.dialogData.param && this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      handleSelect(rows){
        let self = this, uuidList;
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      confirm(){
        let self = this;
        if (!self.isSelected || self.selectedList.length <= 0) return
        self.dialogData.param.select(this.selectedList)
        self.closeDialog(self.windowId)
      }
    }
  }
</script>

<style scoped>

</style>
