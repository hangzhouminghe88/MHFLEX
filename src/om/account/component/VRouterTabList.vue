<template>
   <div class="container">
     <div class="page-toolbar-container" style="display: flex;">
       <div class="page-toolbar-left">
         <span>{{$t('common.router')}}{{$t('common.colon')}}</span>
         <drop-down class="detail-dropdown">
           <span slot="title">
             <span class="text">{{$t(`common.${currZoneName}`)}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
               <a style="margin-top: 12px" @click="changeZoneSelect('currZone')">{{$t('common.currZone')}}</a>
              <a style="margin-bottom: 12px" @click="changeZoneSelect('allZone')">{{$t('common.allZone')}}</a>
             </div>
           </span>
         </drop-down>
         <drop-down class="detail-dropdown">
           <span slot="title">
             <span class="text">{{$t(`common.actions`)}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
               <a style="padding-top: 12px;" :class="{ 'disabled-text': !isSelected || inStates('Running')}" @click="!inStates('Running') && pageOperation('start')">{{$t("common.start")}}</a>
               <a :class="{ 'disabled-text': !isSelected || inStates('Stopped')}" @click="!inStates('Stopped') && pageOperation('reboot')">{{$t("common.reboot")}}</a>
               <a :class="{ 'disabled-text': !isSelected }" @click="pageOperation('reconnect')">{{$t("common.reconnect")}}</a>
               <a :class="{ 'disabled-text': !(isSingleSelected && inStates('Stopped', 'Running'))}" @click="isSingleSelected && inStates('Stopped', 'Running') && pageMigrate()">{{$t("common.migrate")}}</a>
               <a :class="{ 'disabled-text': !(isSingleSelected && inStates('Running'))}" @click="(isSingleSelected && inStates('Running')) && pageOpenConsole()">{{$t("common.console")}}</a>
               <a :class="{ 'disabled-text': !(isSingleSelected && inStates('Running', 'Stopped'))}" @click="inStates('Running', 'Stopped') && pageSetVmConsolePassword()">{{$t("common.setConsolePassword")}}</a>
               <a style="padding-bottom:12px;" :class="{ 'disabled-text': !isSelected }" @click="isSelected && pageDelete()">{{ $t("common.destroy") }}</a>
             </div>
           </span>
         </drop-down>
       </div>
       <div class="page-toolbar-center"></div>
       <div class="page-toolbar-right">
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
       </div>
     </div>
     <div class="page-table">
       <el-table
         ref="multipleTable"
         :data="itemList"
         tooltip-effect="dark"
         style="width: 100%"
         @selection-change="handleSelect"
         v-loading="windowData.loading"
         @sort-change="handleSort"
       >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
         <el-table-column
           type="selection"
           width="55">
         </el-table-column>
         <el-table-column
           :label="$t('common.name')"
           prop="name"
         >
         </el-table-column>
         <el-table-column
           :label="$t('common.defaultIp')"
           prop="defaultIp"
         >
         </el-table-column>
         <el-table-column
           :label="$t('common.state')"
           prop="state"
         >
           <template slot-scope="scope">
             <table-body-item-state slot="item" :state="scope.row.state"/>
           </template>
         </el-table-column>

         <el-table-column
           :label="$t('common.status')"
           prop="status"
         >
           <template slot-scope="scope">
             <table-body-item-state slot="item" :state="scope.row.status"/>
           </template>
         </el-table-column>

         <el-table-column
           :label="$t('common.owner')"
           prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource"
         >
           <template slot-scope="scope">
             {{dbData.accountRef[scope.row.uuid].owner.name}}
           </template>
         </el-table-column>
         <el-table-column
           :label="$t('common.createDate')"
           prop="createDate">
           <template slot-scope="scope">
             {{formatDatetime(new Date(scope.row.createDate))}}
           </template>
         </el-table-column>
       </el-table>
       <div class="page-table-pagination">
         <el-pagination v-if="windowData.availableCount > 0"
           :page-sizes="[10, 20, 50, 100]"
           :page-size="windowData.pageSize"
           layout="total, sizes, prev, pager, next, jumper"
           :total="windowData.availableCount"
           class="page-table-pagination"
           @current-change="pageCurrentChange"
           @size-change="pageSizeChange"
           :current-page="windowData.pageIndex">
         </el-pagination>
       </div>
     </div>
   </div>
</template>

<script>
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VRouterList from 'src/network/virtualRouter/List';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VRouterTabList",
    components: {TableBodyItemState},
    mixins: [MultiSelectList, VRouterList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        currZoneName: '',
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
     self.currZoneName = 'currZone';
     self.init();
    },
    methods: {
      //切换区域时重新查找
      changeZoneSelect(zone){
        let self = this;
        self.currZoneName = zone;
        self.queryList();
      },
      //初始话查找参数
      init: function () {
        this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          sortBy: 'createDate',
          showMoreZone: false,
          sortDirection: '-',
          uuid: this.param.uuid,
          selectedUuidList: [],
          loading: false,
          methods: {
            queryList: this.queryList
          }
        }).then(() => {
          return rpc.query('accounts/resources/refs', {
            q: [`accountUuid=${this.windowData.uuid}`, 'resourceType=VmInstanceVO']
          })
        })
          .then((resp) => {
            let vrUuidList = []
            if (resp.inventories.length > 0) vrUuidList = _.uniq(resp.inventories.map((item) => item.resourceUuid))
            return this.updateWindow({vrUuidList: vrUuidList})
          })
          .then(() => this.queryList())
      },
      //获得查询条件
      getCondition () {
        let conditionList = []
        if (this.currZoneName === 'currZone') conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`uuid?=${this.windowData.vrUuidList}`)
        conditionList.push('type=ApplianceVm')
        conditionList.push('hypervisorType=KVM')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //是否在某个状态中
      inStates () {
        if (!this.isSelected) return
        let stateList = []
        for (let arg in arguments) {
          stateList.push(arguments[arg])
        }
        if (this.isSingleSelected) {
          return !stateList.every((item, index, array) => {
            return item !== this.dbData.vm[this.selectedList[0]].state
          })
        }
        let uuidList = []
        let resp = true
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        uuidList.forEach((uuid) => {
          if (!stateList.every((item, index, array) => { return item !== this.dbData.vm[uuid].state })) resp = true
        })
        return resp
      },
      //停用、启用、重连
      pageOperation (option) {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) self[option](uuidList)
      },
      //迁移云主机
      pageMigrate: function () {
        if (!this.isSingleSelected) return
        let self = this
        let vmUuid = self.selectedList[0]
        if (self.inStates('Running')) {
          rpc.query(`vm-instances/${vmUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid)
              self.openDialog('HostListSingleSelectList', {
                conditions: ['state=Enabled', 'status=Connected', `uuid?=${hostUuidList}`],
                select: (hostUuid) => self.migrate(vmUuid, hostUuid)
              })
            })
        } else {
          let rootVolumeUuid
          self.dbData.vm[vmUuid].allVolumes.forEach((item) => {
            if (item.type === 'Root') rootVolumeUuid = item.uuid
          })
          rpc.query(`volumes/${rootVolumeUuid}/migration-target-hosts`)
            .then((resp) => {
              let hostUuidList = resp.inventories.map((item) => item.uuid)
              self.openDialog('HostListSingleSelectList', {
                conditions: ['state=Enabled', 'status=Connected', `uuid?=${hostUuidList}`],
                select: (hostUuid) => self.coldMigrate(vmUuid, hostUuid)
              })
            })
        }
      },
      //设置控制台密码
      pageSetVmConsolePassword() {
        let self = this
        if (!self.isSingleSelected) return
        let selectedUuidList = self.selectedList
        self.openDialog('ModifyConsolePasswordDlg', {
          ok: (msg, isReboot) => {
            self.setVmConsolePassword(selectedUuidList, msg, isReboot)
          }
        })
      },
      //删除vRouter
      pageDelete(){
        let self = this, uuidList = [];
        uuidList = self.selectedList;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          title: 'virtualRouter.delete',
          description: 'virtualRouter.info.deleteConfirm',
          uuidList,
          icon: 'virtual_router_popupico',
          warning: 'virtualRouter.deleteWarning',
          getName(uuid){
            return self.dbData.virtualRouter[uuid].name;
          },
          ok(){
            self.delete(uuidList)
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
