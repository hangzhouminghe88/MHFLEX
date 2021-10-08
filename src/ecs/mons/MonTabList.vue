<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.monitoringNode') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-addMons" style="padding-top: 12px;" @click="AddMons()">{{ $t("common.addMons") }}</a>
                  <a id="common-changeSshUserName" @click="isSingleSelected && ChangMonInfo('sshUserName')" :class="{'disabled-text': !isSingleSelected}">{{ $t("common.changeSshUserName") }}</a>
                  <a id="common-changeSshPassword" @click="isSingleSelected && ChangMonInfo('sshPassword')" :class="{'disabled-text': !isSingleSelected}">{{ $t("common.changeSshPassword") }}</a>
                  <a id="common-changeSshPort" @click="isSingleSelected && ChangMonInfo('sshPort')" :class="{'disabled-text': !isSingleSelected}">{{ $t("common.changeSshPort") }}</a>
                  <a id="common-changeMonPort" @click="isSingleSelected && ChangMonInfo('monPort')" :class="{'disabled-text': !isSingleSelected}">{{ $t("common.changeMonPort") }}</a>
                  <a id="common-deleteMons" style="padding-bottom: 12px;"@click="isSelected && DeleteMons()" :class="{'disabled-text': !isSelected}">{{ $t("common.deleteMons") }}</a>
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
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.monIp')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <span>{{scope.row.monAddr}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.monHostIP')" prop="hostname">
        </el-table-column>
        <el-table-column :label="$t('common.sshUserName')" prop="sshUsername">
        </el-table-column>
        <el-table-column :label="$t('common.sshUserPort')" prop="sshPort">
        </el-table-column>
        <el-table-column :label="$t('common.monPort')" prop="monPort">
        </el-table-column>
        <el-table-column :label="$t('common.connect')" prop="status">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
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
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'

  export default {
    name: "MonTabList",
    mixins:[Root,WindowBase,MultiSelectList],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        selectedUuidList: [],
        conditions: this.param && this.param.conditions ? this.param.conditions : [],
        curPrimaryStorageUuid: this.param.primaryStorageUuid,
        curBackupStorageUuid: this.param.backupStorageUuid,
        refresh: this.param.refresh,
        resourceType: this.param.resourceType
      }).then(() => this.queryList())
      //window.addEventListener('resize', this.resizeHeader)
    },
    updated() {
      //this.resizeHeader()
    },
    destroyed() {
      //window.removeEventListener('resize', this.resizeHeader)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: []
      }
    },
    computed:{
    },
    methods:{
      ...Utils,
      queryList: async function () {
        let self = this
        let condition = self.windowData.conditions
        let type = condition.split('.')[0]
        let typeUuid = condition.split('.')[1]
        let resp = await rpc.query(`${type}`, {
          q: `${typeUuid}`
        })
        let mons = resp.inventories[0].mons
        mons.forEach(item => {
          item.uuid = item.monUuid
          delete item.monUuid
        })
        let uuidList = mons.map(item => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        return self.updateDbTable({
          tableName: 'mon',
          list: mons
        }).then(() => {
          self.updateWindow({ uuidList, table })
          this.itemList = this.getItem(this.windowData.uuidList);
        })
      },
      getItem(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.mon[uuid];
        })
      },
      addmon: function (param) {
        let primarystorage = _.cloneDeep(this.dbData.primarystorage[this.windowData.curPrimaryStorageUuid])
        let backupstorage = _.cloneDeep(this.dbData.backupstorage[this.windowData.curBackupStorageUuid])
        let resourceType = this.windowData.resourceType
        let type = 'ceph'
        if (primarystorage) {
          type = primarystorage.type === 'Ceph' ? 'ceph' : 'fusionstor'
        }
        if (backupstorage) {
          type = backupstorage.type === 'Ceph' ? 'ceph' : 'fusionstor'
        }
        let event = null
        let resource = 'primary-storage'
        let resourceUuid = this.windowData.curPrimaryStorageUuid
        if (resourceType === 'PS') {
          event = this.createEvent('primaryStorage.action.addMons', primarystorage.name)
        }
        if (resourceType === 'BS') {
          event = this.createEvent('primaryStorage.action.addMons', backupstorage.name)
          resource = 'backup-storage'
          resourceUuid = this.windowData.curBackupStorageUuid
        }

        let monUrls = []
        monUrls.push(param.userName + ':' + param.passWord + '@' + param.monIp + ':' + param.sshPort)
        rpc.create(`${resource}/${type}/${resourceUuid}/mons`, {
          monUrls
        }, event).then(() => {
          this.reconnet()
          this.incEventSuccess(event)
          this.queryList()
        }, () => this.incEventFail(event))
      },
      AddMons: function () {
        let self = this;
        self.param.addMons({ ok: this.addmon })
      },
      DeleteMons: function () {
        let uuidList = []
        uuidList = this.selectedList;
        let primarystorage = _.cloneDeep(this.dbData.primarystorage[this.windowData.curPrimaryStorageUuid])
        let backupstorage = _.cloneDeep(this.dbData.backupstorage[this.windowData.curBackupStorageUuid])
        let resourceType = this.windowData.resourceType
        let type = 'ceph'
        if (primarystorage) {
          type = primarystorage.type === 'Ceph' ? 'ceph' : 'fusionstor'
        }
        if (backupstorage) {
          type = backupstorage.type === 'Ceph' ? 'ceph' : 'fusionstor'
        }
        this.openDialog('ConfirmDlg', {
          uuidList,
          title: 'mons.deleteMons',
          description: 'mons.info.deleteConfirm',
          icon: 'listener_popupico',
          ok: () => {
            let tasks = []
            uuidList.forEach((uuid) => {
              let event = null
              let resource = 'primary-storage'
              let resourceUuid = this.windowData.curPrimaryStorageUuid
              if (resourceType === 'PS') {
                event = this.createEvent('primaryStorage.action.deleteMons', primarystorage.name)
              }
              if (resourceType === 'BS') {
                event = this.createEvent('primaryStorage.action.deleteMons', backupstorage.name)
                resource = 'backup-storage'
                resourceUuid = this.windowData.curBackupStorageUuid
              }
              let monHostnames = []
              monHostnames.push(this.dbData.mon[uuid].hostname)
              let p = rpc._delete(`${resource}/${type}/${resourceUuid}/mons`, {
                monHostnames
              }, event).then(() => {
                this.reconnet()
                this.incEventSuccess(event)
              }, () => this.incEventFail(event))
              tasks.push(p)
            })
            return Promise.all(tasks).then(() => this.queryList())
          },
          getName: (uuid) => {
            return this.dbData.mon[uuid].monAddr;
          }
        })
      },
      ChangMonInfo: function (curChangeInfo) {
        let primarystorage = _.cloneDeep(this.dbData.primarystorage[this.windowData.curPrimaryStorageUuid])
        let backupstorage = _.cloneDeep(this.dbData.backupstorage[this.windowData.curBackupStorageUuid])
        let resourceType = this.windowData.resourceType
        let type = 'ceph'
        if (primarystorage) {
          type = primarystorage.type === 'Ceph' ? 'ceph' : 'fusionstor'
        }
        if (backupstorage) {
          type = backupstorage.type === 'Ceph' ? 'ceph' : 'fusionstor'
        }
        let curMonUuid = this.selectedList[0]
        this.openDialog('ModifyMonDlg', {
          curChangeInfo,
          ok: (param) => {
            this.changeMonInfo(resourceType, type, curMonUuid, primarystorage, backupstorage, param, curChangeInfo)
          }
        })
      },
      changeMonInfo: function (resourceType, type, curMonUuid, primarystorage, backupstorage, param, curChangeInfo) {
        let self = this;
        let _callback =  () => {
          self.reconnet().then(() => {
            self.queryList()
          })
        }

        if (resourceType === 'PS') {
          if (type === 'fusionstor') {
              let event = this.createEvent(`primaryStorage.action.edit${curChangeInfo}`, primarystorage.name)
              rpc.put(`primary-storage/${type}/mons/${curMonUuid}/actions`, {
                updateFusionstorPrimaryStorageMon: param
              }, event).then(() => {
                this.incEventSuccess(event)
                _callback()
              }, () => this.incEventFail(event))
          } else {
              let event = this.createEvent(`primaryStorage.action.edit${curChangeInfo}`, primarystorage.name)
              rpc.put(`primary-storage/${type}/mons/${curMonUuid}/actions`, {
                updateCephPrimaryStorageMon: param
              }, event).then(() => {
                this.incEventSuccess(event)
                _callback()
              }, () => this.incEventFail(event))
          }
        } else if (resourceType === 'BS') {
          if (type === 'fusionstor') {
              let event = this.createEvent(`primaryStorage.action.edit${curChangeInfo}`, backupstorage.name)
              rpc.put(`backup-storage/${type}/mons/${curMonUuid}/actions`, {
                updateFusionstorBackupStorageMon: param
              }, event).then(() => {
                this.incEventSuccess(event)
                _callback()
              }, () => this.incEventFail(event))
          } else {
              let event = this.createEvent(`primaryStorage.action.edit${curChangeInfo}`,backupstorage.name)
              rpc.put(`backup-storage/${type}/mons/${curMonUuid}/actions`, {
                updateCephBackupStorageMon: param
              }, event).then(() => {
                this.incEventSuccess(event)
                _callback()
              }, () => this.incEventFail(event))
          }
        }
      },
      reconnet: function () {
        let resourceType = this.windowData.resourceType
        let url
        let uuid
        let action = {}
        let tableName
        if (resourceType === 'PS') {
          url = 'primary-storage'
          uuid = this.windowData.curPrimaryStorageUuid
          action.reconnectPrimaryStorage = {}
          tableName = 'primarystorage'
        } else if (resourceType === 'BS') {
          url = 'backup-storage'
          uuid = this.windowData.curBackupStorageUuid
          action.reconnectBackupStorage = {}
          tableName = 'backupstorage'
        }
        let inventory = _.cloneDeep(this.dbData[tableName][uuid])
        inventory.status = 'Connecting'
        return this.updateDbRow({
          tableName: tableName,
          id: uuid,
          data: inventory
        }).then(() => {
          return rpc.update(url, uuid, action)
            .then(resp => {
              return this.updateDbRow({
                tableName: tableName,
                id: uuid,
                data: resp.inventory
              })
            }, () => {
              return new Promise((resolve, reject) => { resolve() })
            })
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
    },
    filters: {
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    },
    watch: {
      'dbData.mon': function (conditions, oldConditions) {
        //this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : [],
            curPrimaryStorageUuid: this.param.primaryStorageUuid,
            curBackupStorageUuid: this.param.backupStorageUuid,
            resourceType: this.param.resourceType
          }).then(() => this.queryList())
          this.destroyDialogs()
        }
      }
    }

  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>

