<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="tablist-title">{{ $t('common.sanstorage') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span id="common-actions" class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px" @click="!isSelected && attachSan()" :class="{'disabled-text': isSelected}">{{$t('common.attach')}}</a>
                <a style="margin-bottom: 12px" @click="isSelected && detachSan()" :class="{'disabled-text': !isSelected}">{{$t('common.detach')}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <el-table :data="itemList"
              @selection-change="handleSelect">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
      <el-table-column :label="$t('common.name')" prop="name" sortable>
        <template slot-scope="scope">
          <span class="link">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.ip')" prop="ip">
        <template slot-scope="scope">
          <table-body-item-list :content="scope.row.ip"
                                copy="true"></table-body-item-list>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.port')" prop="port" sortable></el-table-column>
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
</template>

<script>
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import TableBodyItemList from "../../../component/TableBodyItemList";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import SanStorageList from 'src/storage/sanstorage/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  export default {
    name: "SanStorageTabList",
    components: {TableBodyItemList, TableBodyItemState},
    props:{
      param: {
        type: Object,
        default: () => {
          return '';
        }
      }
    },
    mixins: [SanStorageList, WindowBase, MultiSelectList],
    data(){
      return {
        conditionNameList:[
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
        itemList: []
      }
    },
    computed:{
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        selectList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      getCondition: function () {
        let conditionList = [], self = this;
        if (this.param.condition) conditionList.push(this.param.condition)
        if (self.selectVal !=='' && self.searchStr !=='') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      //加载san存储
      async attachSan(){
        let self = this;
        let clusterUuid = this.param.clusterUuid
        let attachedUuidList = await this.getAttachedISCSIUuidList()
        let conditions = []
        if (attachedUuidList.length > 0) {
          conditions.push(`uuid!?=${attachedUuidList}`)
        }
        this.openDialog('SanStorageMultiSelectListDlg', {
          conditions,
          select: iscsiUuidList => this.attachWebStorage(iscsiUuidList, clusterUuid).then(this.queryList, this.queryList)
        })
      },
      //获得已绑定的pciUUIDLIST
      getAttachedISCSIUuidList: async function () {
        let clusterUuid = this.param.clusterUuid
        let ISCSIResp = await rpc.query('storage-devices/iscsi/servers', {q: [`iscsiCluster.clusterUuid=${clusterUuid}`]})
        return ISCSIResp.inventories.map(it => it.uuid)
      },
      //解绑san存储
      detachSan(){
        let self = this, uuidList = [];
        uuidList = self.selectedList;
        let clusterUuid = this.param.clusterUuid
        self.openDialog('ConfirmDlg',{
          title: 'iSCSI.detach',
          uuidList,
          description: 'iSCSI.info.detachConfirm',
          icon: 'pop_iscsi_server_n',
          getName(uuid){
            return self.webStorage[uuid].name;
          },
          ok: () => this.detachWebStorage(uuidList, clusterUuid).then(this.queryList, this.queryList),
        })
      }
    }
  }
</script>

<style scoped>

</style>
