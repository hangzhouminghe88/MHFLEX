<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.cluster') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px;" @click="detailCreateBackUpStorage()">{{$t("backupStorage.add")}}</a>
                <a :class="{'disabled-text': !isSelected || instates('Enabled')}" @click="isSelected && !instates('Enabled') && detailEnable()">{{$t('common.enable')}}</a>
                <a :class="{'disabled-text': !isSelected || instates('Disabled')}"@click="isSelected && !instates('Disabled') && detailDisabled()">{{$t('common.disable')}}</a>
                <a :class="{'disabled-text': !isSelected}" @click="isSelected && detailConnection()">{{$t('common.reconnect')}}</a>
                <a style="margin-bottom: 12px;":class="{'disabled-text': !isSelected}" @click="isSelected && detailDelete()">{{$t('common.destroy')}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <el-table
      :data="itemList"
    @selection-change="handleSelect">
       <span slot="empty" class="table-nodata">
         <p class="empty-text" v-text="$t('common.noData')"></p>
       </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.name')" prop="name" sortable>
        <template slot-scope="scope">
          <span class="link" @click="goToBs(scope.row.uuid)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
      <el-table-column :label="$t('common.availableCapacity')">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.availableCapacity)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.totalCapacity')">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.totalCapacity)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.state')">
        <template slot-scope="scope">
          <table-body-item-state slot="item" :state="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')">
        <template slot-scope="scope">
          <table-body-item-state slot="item" :state="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.createDate')">
        <template slot-scope="scope">
         {{formatDatetime(new Date(scope.row.createDate))}}
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
</template>

<script>
  import BackupStorageList from 'src/storage/backupstorage/List';
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  export default {
    components: {TableBodyItemState},
    mixins: [BackupStorageList, WindowBase, MultiSelectList],
    props: {
      param:{
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    name: "BackupStorageTabList",
    data() {
      return {
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
        itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        conditions: this.param.conditions,
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    computed: {
    },
    methods: {
      //查询条件
      getCondition: function () {
        let conditionList = [], self = this;
        if (this.param.conditions) conditionList.push(this.param.conditions)
        conditionList.push('type!=VCenter')
        conditionList.push('__systemTag__!?=remote,onlybackup,aliyun,remotebackup')
        if (self.selectVal !=='' && self.searchStr !=='') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      //创建镜像服务器
      detailCreateBackUpStorage(){
        let self = this;
        self.$router.push({name: 'createbackupstorage', params:{
            ZoneUuid: this.param.ZoneUuid
          }})
      },
      //设置在某个状态下是否可以操作
      instates(){
        let self = this;
        if (!self.isSelected) return
        let statesList = []
        if (arguments) {
          for (let i = 0; i < arguments.length; i++) {
            statesList.push(arguments[i])
          }
        }
        let selectedStatesList = []
        self.windowData.selectedUuidList.forEach((uuid) => {
          selectedStatesList.push(self.dbData.backupstorage[uuid].state)
        })
        let isInStates = selectedStatesList.every((item) => {
          return statesList.some((state) => { return state === item })
        })
        return isInStates
      },
      //启用bs
      detailEnable(){
        let uuidList = []
        this.windowData.selectedUuidList.forEach(uuid => {
          if (this.dbData.backupstorage[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.enable(uuidList)
      },
      //停用bs
      detailDisabled(){
        let uuidList = []
        this.windowData.selectedUuidList.forEach(uuid => {
          if (this.dbData.backupstorage[uuid].state !== 'Disabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.disable(uuidList)
      },
      //重连bs
      detailConnection(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectedUuidList
        if (uuidList.length > 0) {
          return self.openDialog('ConfirmDlg',{
            title: 'backupStorage.reconnect',
            warning: 'backupStorage.reconnectWarning',
            uuidList: uuidList,
            icon: 'primary_storage_popupico',
            ok: () => {
              return self.reconnect(uuidList, self).then(() => {
                return self.queryList()
              })
            },
            getName(uuid){
              return self.dbData.backupstorage[uuid].name
            }
          })
        }
      },
      //删除bs
      detailDelete(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectedUuidList;
        if(uuidList.length > 0){
          return self.openDialog('ConfirmDlg', {
            title: 'backupStorage.delete',
            description: 'backupStorage.deleteBS',
            warning: 'backupStorage.deleteWarning',
            uuidList,
            icon: 'primary_storage_popupico',
            ok: () => {
              return self.delete(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName(uuid){
              return self.dbData.backupstorage[uuid].name
            }
          })
        }
      },
      //查看bs详情
      goToBs(uuid){
        let self = this;
        self.$router.push({name: 'detailbackupstorage', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
