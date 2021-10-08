<template>
  <dialog-template width="1000px">
    <div slot="title" class="model-plain-header">
      <span v-if="dialogData.param.isRootVolumeOfferingSelect === 'isRootVolumeOfferingSelect'"  class="modal-title">{{$t("common.selectRootVolumeOffering")}}</span>
      <span v-else  class="modal-title">{{$t("common.selectVolumeOffering")}}</span>
      <span @click="close()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body">
      <div style="padding:30px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left"></div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
           <span style="padding: 0 15px;display: inline-block;position: relative;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
           </span>
          </div>
        </div>

       <div class="page-table">
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
           <el-table-column :label="$t('common.name')">
             <template slot-scope="scope">
               {{scope.row.name}}
             </template>
           </el-table-column>
           <el-table-column :label="$t('common.size')" >
             <template slot-scope="scope">
               {{bytesToSize(scope.row.diskSize)}}
             </template>
           </el-table-column>
           <el-table-column :label="$t('common.createDate')">
             <template slot-scope="scope">
               {{formatDatetime(new Date(scope.row.createDate))}}
             </template>
           </el-table-column>
         </el-table>
         <el-pagination v-if="windowData.total > 0"
                        :current-page="windowData.pageIndex"
                        :page-size="5"
                        :page-sizes="[5, 10]"
                        :total="windowData.total"
                        @current-change="pageCurrentChange"
                        @size-change="pageSizeChange"
                        class="page-table-pagination"
                        layout="total, sizes, prev, pager, next"></el-pagination>
       </div>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <span @click="select" class="btn-confirm">{{$t('common.ok')}}</span>
      <span @click="close" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VolumeOfferingList from 'src/ecs/volumeOffering/List';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils';
  export default {
    name: "SingleSelectList",
    components: {TableBodyItemState},
    mixins: [MultiSelectList, WindowBase, VolumeOfferingList],
    data() {
      return {
        templateRadio: '',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: [],
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
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions !== undefined) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },
      close: function () {
        if(this.dialogData.param.ok)
        this.dialogData.param.ok()
        this.closeDialog(this.windowData.id)
      },
      select: function () {
        this.dialogData.param.select(this.templateRadio);
        this.close();
      },
    }
  }
</script>

<style scoped>

</style>
