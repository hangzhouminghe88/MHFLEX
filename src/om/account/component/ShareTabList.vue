<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.share') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-share" style="padding-top: 12px;" :class="{'disabled-text': isSelected}" @click="!isSelected && shareResource()" v-show="!windowData.shareToAll">{{ $t("common.share") }}</a>
                  <a id="common-recall" @click="isSelected && revokeResource()" :class="{'disabled-text': !isSelected}" v-show="!windowData.shareToAll">{{ $t("common.recall") }}</a>
                  <a id="common-shareToAll" @click="!isShareToAll() && PageShareResourceToAll()" :class="{'disabled-text': isShareToAll()}">{{ $t("common.shareToAll") }}</a>
                  <a id="common-recallFromAll" style="padding-bottom:12px;" @click="isShareToAll() && PageRevokeResourceFromAll()" :class="{'disabled-text': !isShareToAll()}">{{ $t("common.recallFromAll") }}</a>
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
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name:'detailAccount', params: {uuid: scope.row.uuid}})">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" >
        </el-table-column>
        <el-table-column :label="$t('common.vmNum')"  prop="vmNum">
          <template slot-scope="scope">
            {{dbData.account[scope.row.uuid].vmNum ? dbData.account[scope.row.uuid].vmNum : 0}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.volumeNum')"  prop="volumeNum">
          <template slot-scope="scope">
            {{dbData.account[scope.row.uuid].volumeNum ? dbData.account[scope.row.uuid].volumeNum : 0}}
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
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import IAM2ProjectMethods from 'src/IAM2Project/Methods'

  export default {
    name: "AccountShareTabList",
    mixins:[Root,WindowBase,MultiSelectList,IAM2ProjectMethods],
    props:['param'],
    created() {
      let obj = this.getInitData(this.param)
      this.updateWindow(obj).then(() => {
        return this.initProjectAndAccountUuidList()
      }).then(() => {
        return this.queryList()
      })
      // window.addEventListener('resize', this.resizeHeader)
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
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
    methods:{
      ...Utils,
      getData(){
        let uuidList=[]
        if(!_.isArray(this.windowData.uuidList)) return[]

        uuidList=this.windowData.uuidList.filter(uuid=>this.dbData.account[uuid])

        return uuidList.map(uuid=>{
          return this.dbData.account[uuid]
        })
      },
      getInitData (param) {
        let currSelectTab = 'account'
        if (this.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          currSelectTab = 'iam2project'
        }
        let obj = {
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          currSelectTab: currSelectTab,
          sortBy: 'createDate',
          sortDirection: '-',
          resourceConditions: [],
          selectedUuidList: [],
          uuid: '',
          tableName: '',
          tableNameA: '',
          methods: {
            queryList: this.queryList
          }
        }
        if (param.conditions) obj.resourceConditions = obj.resourceConditions.concat(param.conditions)
        if (param.uuid) obj.uuid = param.uuid
        if (param.tableName) obj.tableName = param.tableName
        if (param.tableNameA) {
          obj.tableNameA = param.tableNameA
        } else if (param.tableName) {
          obj.tableNameA = param.tableName
        }
        return obj
      },
      initProjectAndAccountUuidList: function () {
        const self = this
        let accountUuidList = []
        let projectUuidList = []
        let tasks = []
        let p = null
        p = rpc.query('iam2/projects', {
          limit: 100000000
        }).then((resp) => {
          accountUuidList = accountUuidList.concat(resp.inventories.map(it => it.linkedAccountUuid))
          projectUuidList = projectUuidList.concat(resp.inventories.map(it => it.uuid))
          resp.inventories.forEach(function (item) {
            ((item) => {
              item.projectUuid = item.uuid
              self.updateDbRow({
                tableName: 'accountA',
                id: item.linkedAccountUuid,
                data: item
              })
            })(item)
          })
          self.getProjectAdmin(projectUuidList)
          self.updateDbTable({
            tableName: 'iam2project',
            list: resp.inventories
          })
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          if (self.windowData.currSelectTab === 'iam2project') {
            self.windowData.resourceConditions.push(`receiverAccountUuid?=${accountUuidList}`)
          } else {
            if (accountUuidList.length > 0) {
              self.windowData.resourceConditions.push(`receiverAccountUuid!?=${accountUuidList}`)
            }
          }
        })
      },
      queryList: async function () {
        let resp = await rpc.query('accounts/resources', {
          q: this.windowData.resourceConditions
        })
        let accountUuidList = []
        resp.inventories.forEach((item) => {
          if (!item.toPublic) accountUuidList.push(item.receiverAccountUuid)
        })
        await this.updateWindow({ accountUuidList })
        this._queryList()
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`uuid?=${this.windowData.accountUuidList}`)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      _queryList: async function () {
        let AccountInventories
        let uuidList = []
        let table = {}
        rpc.query('accounts', {
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition()
        })
          .then((resp) => {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              availableCount: resp.total
            })
            AccountInventories = resp.inventories
            uuidList = resp.inventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            return this.updateDbTable({
              tableName: 'account',
              list: AccountInventories
            })
          })
          .then(() => {
            AccountInventories.forEach((item) => {
              rpc.query(`accounts/quota/${item.uuid}/usages`).then((resp) => {
                item.volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used
                item.vmNum = resp.usages.filter((i) => i.name === 'vm.num')[0].used
              })
                .then(() => {
                  this.updateDbRow({
                    tableName: 'account',
                    id: item.uuid,
                    list: item
                  })
                })
            })
          })
          .then(() => {
            this.updateWindow({ uuidList, table })
            this.itemList = this.getData();
          })
      },
      shareResource: function () {
        debugger
        if (this.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          this.openDialog('ShareResourceToAccountProjectMultiSelectListConfirm', {
            currSelectTab: this.windowData.currSelectTab,
            uuid: this.windowData.uuid,
            select: (uuidList) => this.shareResources(this.windowData.uuid, uuidList)
          })
        } else {
          this.openDialog('SharedSelectList', {
            uuid: this.windowData.uuid,
            share: (uuidList) => {
              this.shareResources(this.windowData.uuid, uuidList)
            },
            shareToAll: () => this.shareResourceToAll(this.windowData.uuid)
          })
        }
      },
      isShareToAll: function () {
        if (this.windowData.tableNameA === '' || this.windowData.uuid === '') return false
        if (this.dbData[this.windowData.tableNameA] && this.dbData[this.windowData.tableNameA][this.windowData.uuid].toPublic) return true
        return false
      },
      toggleShareToAll: function () {
        let tableNameA = this.windowData.tableNameA
        let uuid = this.windowData.uuid
        if (!tableNameA) return
        let data = _.cloneDeep(this.dbData[tableNameA][uuid])
        if (data.toPublic !== undefined) data.toPublic = !data.toPublic
        this.updateDbRow({
          tableName: tableNameA,
          id: uuid,
          data: data
        }).then(() => {
          this.$forceUpdate()
        })
      },
      shareResources: function (uuid, accountUuidList) {
        let self = this
        let gpuUuids = [uuid]
        let gpuA = self.dbData.pcideviceA[uuid]
        if (gpuA && gpuA.audioUuid) {
          gpuUuids.push(gpuA.audioUuid)
        }
        let event = self.createEvent('account.action.shareResource', accountUuidList.length === 1 ? this.dbData.account[accountUuidList[0]].name : '')
        rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': gpuUuids,
            'accountUuids': accountUuidList,
            'toPublic': false
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            if (resp.success === true) this.queryList()
          }, () => {
            self.incEventFail(event)
          })
      },
      shareResourceToAll: function (uuid) {
        let self = this
        let name = self.dbData[self.windowData.tableName][self.windowData.uuid].name
        if (!name) {
          name = self.dbData[self.windowData.tableName][self.windowData.uuid].description
        }
        let eventNameTab = self.windowData.tableName
        if (self.param.i18nTab) {
          eventNameTab = self.param.i18nTab
        }
        let gpuUuids = [uuid]
        let gpuA = self.dbData.pcideviceA[uuid]
        if (gpuA && gpuA.audioUuid) {
          gpuUuids.push(gpuA.audioUuid)
        }
        let event = self.createEvent(`${eventNameTab}.action.shareToAll`, name)
        return rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': gpuUuids,
            'toPublic': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            self.toggleShareToAll()
            if (resp.success === true) self.queryList()
          }, () => {
            self.incEventFail(event)
          })
      },
      revokeResource () {
        let uuidList = []
        let self = this
        uuidList = this.selectedList;
        let event = self.createEvent('account.action.revokeResource', uuidList.length > 1 ? '' : this.dbData.account[uuidList[0]].name)
        let uuid = self.windowData.uuid
        let gpuUuids = [uuid]
        let gpuA = self.dbData.pcideviceA[uuid]
        if (gpuA && gpuA.audioUuid) {
          gpuUuids.push(gpuA.audioUuid)
        }
        rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': gpuUuids,
            'toPublic': false,
            'accountUuids': uuidList,
            'all': false
          }
        }, event).then((resp) => {
          self.incEventSuccess(event)
          this.queryList()
        }, () => {
          self.incEventFail(event)
        })
      },
      changeTab: function (currSelectTab) {
        if (this.windowData.currSelectTab !== currSelectTab) {
          let resourceConditions = []
          let uuid = ''
          let tableName = ''
          let tableNameA = ''
          if (this.param.conditions) resourceConditions = resourceConditions.concat(this.param.conditions)
          if (this.param.uuid) uuid = this.param.uuid
          if (this.param.tableName) tableName = this.param.tableName
          if (this.param.tableNameA) {
            tableNameA = this.param.tableNameA
          } else if (this.param.tableName) {
            tableNameA = this.param.tableName
          }
          this.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            sortBy: 'createDate',
            sortDirection: '-',
            resourceConditions,
            uuid,
            currSelectTab: currSelectTab,
            tableName,
            tableNameA,
            methods: {
              queryList: this.queryList
            }
          }).then(() => {
            setTimeout(() => {
              this.resetWidth()
            }, 1000)
          })
          this.initProjectAndAccountUuidList().then(() => this.queryList())
        }
      },
      PageShareResourceToAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.shareToAll',
          warning:  'instanceOffering.shareToAllText',
          ok: () => {
            this.shareResourceToAll(this.windowData.uuid)
          }
        })
      },
      PageRevokeResourceFromAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.recallFromAll',
          warning:  'account.recall',
          ok: () => {
            this.revokeResourceFromAll()
          }
        })
      },
      revokeResourceFromAll: function () {
        let self = this
        let name = self.dbData[self.windowData.tableName][self.windowData.uuid].name
        if (!name) {
          name = self.dbData[self.windowData.tableName][self.windowData.uuid].description
        }
        let eventNameTab = self.windowData.tableName
        if (self.param.i18nTab) {
          eventNameTab = self.param.i18nTab
        }
        let uuid = self.windowData.uuid
        let gpuUuids = [uuid]
        let gpuA = self.dbData.pcideviceA[uuid]
        if (gpuA && gpuA.audioUuid) {
          gpuUuids.push(gpuA.audioUuid)
        }
        let event = self.createEvent(`${eventNameTab}.action.recallFromAll`, name)
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': gpuUuids,
            'toPublic': true,
            'all': true
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            if (resp.success === true) {
              self.toggleShareToAll()
              self.updateWindow({ uuidList: [], shareToAll: false })
              self.queryList()
            }
          }, () => {
            self.incEventFail(event)
          })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      }
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
      'dbData.l2network': function (conditions, oldConditions) {
        // this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param ? this.param.conditions : []
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

