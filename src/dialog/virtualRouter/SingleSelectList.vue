<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.selectvirtualRouterDevice')}}</span>
      <span class="el-icon-close dialog-close" @click="close()"></span>
    </div>
    <div slot="body">
      <div style="padding: 30px;">
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
        <el-table :data="itemList" highlight-current-row @row-click="handleSingleSelect" v-loading="loading">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
           </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.uuid">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.defaultIp')">
            <template slot-scope="scope">
              {{getVRouterDefaultIp(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.hostIp')">
            <template slot-scope="scope">
              {{scope.row.hostUuid ? dbData.host[scope.row.hostUuid].managementIp : dbData.host[scope.row.hostUuid].managementIp}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.hypervisor')" prop="hypervisorType"></el-table-column>
          <el-table-column :label="$t('common.cluster')">
            <template slot-scope="scope">
             {{dbData.cluster[scope.row.clusterUuid].name}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.availableCount > 0"
          :current-page="windowData.pageIndex"
          :page-size="5"
          :page-sizes="[5, 10]"
          :total="windowData.availableCount"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="select()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel"  @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VirtualRouterList from 'src/network/virtualRouter/List';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils';

  export default {
    name: "SingleSelectList",
    components: {TableBodyItemState},
    mixins: [MultiSelectList, WindowBase, VirtualRouterList],
    data(){
      return {
        templateRadio: '',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value:  'uuid'}
        ],
        itemList: [],
        loading: false
      }
    },

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      //查询条件
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.dialogData.param.conditions) conditionList = conditionList.concat(self.dialogData.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25}`)
        }
        return conditionList
      },
      //关闭弹框
      close: function () {
        this.closeDialog(this.windowData.id)
      },
      //获得默认Ip
      getVRouterDefaultIp(uuid) {
        let vrouter = this.dbData.vm[uuid]
        if (!vrouter) return
        for (let i = 0; i < vrouter.vmNics.length; i++) {
          if (vrouter.defaultRouteL3NetworkUuid === vrouter.vmNics[i].l3NetworkUuid) {
            return vrouter.vmNics[i].ip
          }
        }
      },
      //单选
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      //点击确定回调
      select() {
        let self = this;
        if(!self.templateRadio) {
          self.$message('请选择云路由器!');
          return;
        }
        this.dialogData.param.select(self.templateRadio)
        self.close();
      },
      ...Utils
    }
  }
</script>

<style scoped>

</style>
