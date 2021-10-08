<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.consoleproxy')}}</span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageReconnect()">
            <i class="el-icon-news icon"></i>
            <span v-text="$t('common.reconnect')"></span>
          </span>
          <span class="btn-primary" :class="{'disabled': !isSingleSelected}" @click="isSingleSelected && setOverridIp(selectedList[0])">
            <i class="el-icon-setting icon"></i>
            <span v-text="$t('consoleProxy.setOverriddenIp')"></span>
          </span>
          <help-trigger name="consoleProxy" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }"/>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right"></div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
      :data="itemList"
      @sort-change="handleSort"
      @selection-change="handleSelect"
      v-loading="windowData.loading"
      >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px"></el-table-column>
        <el-table-column :label="$t('common.managementIp')" sortable prop="managementIp"></el-table-column>
        <el-table-column :label="$t('consoleProxy.consoleProxyOverriddenIp')" prop="consoleProxyOverriddenIp"></el-table-column>
        <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')">
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" sortable>
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
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import ConsoleList from 'src/om/consoleProxy/List';
  import WindowBase from  'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "ConsoleProxyPage",
    components: {TableBodyItemState, PageTemplate},
    mixins: [ConsoleList, WindowBase, MultiSelectList],
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
      })
        .then(() => {
          self.queryList();
        })
    },
    data(){
      return {
        itemList: []
      }
    },
    methods: {
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map(row => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      }
    }
  }
</script>

<style scoped>

</style>
