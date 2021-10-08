<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <div style="display: inline-block"
               v-if="getLicensePermission('LICENSE_EXTRA_COMPANY')">
               <component :param="typeListItem.param" :is="typeListItem.ctrl"/>
          </div>
          <span class="detail-list-title">{{$t('common.share')}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
              <a style="padding-top: 12px;" :class="{'disabled-text': isSelected}"
                 @click="!isSelected && shareResource()" v-show="!windowData.shareToAll">{{ $t("common.share") }}</a>
              <a @click="isSelected && revokeResource()"
                 :class="{'disabled-text': !isSelected}" v-show="!windowData.shareToAll">{{ $t("common.recall") }}</a>
              <a @click="!isShareToAll() && PageShareResourceToAll()"
                 :class="{'disabled-text': isShareToAll()}">{{ $t("common.shareToAll") }}</a>
              <a style="padding-bottom:12px;" @click="isShareToAll() && PageRevokeResourceFromAll()"
                 :class="{'disabled-text': !isShareToAll()}">{{ $t("common.recallFromAll") }}</a>
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
    <div>
      <el-table
        :data="shareItemList"
        v-if="tabListType === 'account'"
        @selection-change="handleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name">
          <template slot-scope="scope">
            <span class="link" @click="goToAccount(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column>

        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type">
          <template slot-scope="scope">
            {{dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].type}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vmNum')">
          <template slot-scope="scope">
            {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].vmNum) ?
            dbData.account[scope.row.uuid].vmNum : 0}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.volumeNum')">
          <template slot-scope="scope">
            {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].volumeNum) ?
            dbData.account[scope.row.uuid].volumeNum : 0}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{new Date(scope.row.createDate) | formatDatetime}}
          </template>
        </el-table-column>
      </el-table>
      <el-table
        :data="shareIam2ItemList"
        v-if="tabListType === 'iam2project'"
        @selection-change="handleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name">
          <template slot-scope="scope">
            <span class="link">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('iam2project.projectAdmin')">
          <template slot-scope="scope">
           {{dbData.iam2projectA[scope.row.uuid] && dbData.iam2projectA[scope.row.uuid].projectAdmin}}
         </template>
        </el-table-column>
        <el-table-column :label="$t('common.vmNum')">
          <template slot-scope="scope">
            {{(dbData.iam2project[scope.row.uuid] && dbData.iam2project[scope.row.uuid].linkedAccountUuid &&
            dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid] &&
            dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].vmNum) ?
            dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].vmNum : 0}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.volumeNum')">
          <template slot-scope="scope">
            {{(dbData.iam2project[scope.row.uuid] && dbData.iam2project[scope.row.uuid].linkedAccountUuid &&
            dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid] &&
            dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].volumeNum) ?
            dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].volumeNum : 0}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
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
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import FullPanelTypeList from 'src/component/FullPanel/PanelTypeList';
  import Utils from 'src/utils/utils';
  import IAM2Methods from 'src/ecs/home/Methods';

  export default {
    name: "ShareTabList",
    mixins: [WindowBase, IAM2Methods],
    components: {
      FullPanelTypeList
    },
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      shareItemList() {
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.account[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.account[uuid]
          }
        )
      },
      shareIam2ItemList() {
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.iam2project[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.iam2project[uuid]
          }
        )
      },
      isSelected() {
        let self = this;
        return self.windowData.selectUuidList && self.windowData.selectUuidList.length >= 1;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      }
    },
    created() {
      let self = this;
      let resourceConditions = []
      let uuid = ''
      let tableName = ''
      let tableNameA = ''
      let currSelectTab = ''
      if (this.param.conditions) resourceConditions = resourceConditions.concat(this.param.conditions)
      if (this.param.uuid) uuid = this.param.uuid
      if (this.param.tableName) tableName = this.param.tableName
      if (this.param.tableNameA) {
        tableNameA = this.param.tableNameA
      } else if (this.param.tableName) {
        tableNameA = this.param.tableName
      }
      if (this.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
        self.tabListType = 'iam2project'
      }else{
        self.tabListType = 'account'
      }
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        uuid,
        tableName,
        tableNameA,
        selectUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        tabList: [
          {
            typeName: 'iam2project',
            value: 'iam2project',
            permission: 'LICENSE_BASIC_COMMUNITY'
          },
          {
            typeName: 'account',
            value: 'account',
            permission: 'LICENSE_BASIC_PAID'
          },
        ],
        tabListType: 'account',
        typeListItem: {
          id: 'tabListType',
          param: {
            getTypeList: () => this.tabList,
            getIndex: () => {
              return _.findIndex(this.tabList, it => it.value === this.tabListType)
            },
            setIndex: (index) => {
              if (this.tabList[index].value === this.tabListType) return;
              this.tabListType = this.tabList[index].value;
              this.queryList()
            },
            getDisabled: this.genGetDisabled('tabListType')
          },
          ctrl: FullPanelTypeList
        },
      }
    },
    methods: {
      ...Utils,
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1,
        }).then(() => {
          self.queryList();
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
      genGetDisabled() {

      },
      queryList() {
        const self = this
        if (self.tabListType === 'iam2project') {
          self.queryProjectList()
        } else {
          self.queryAccountList()
        }
      },
      //查询项目列表数据
      queryProjectList() {
        const self = this
        let projectCondition = `linkedAccountUuid in (query SharedResource.receiverAccountUuid where resourceUuid='${this.windowData.uuid}' and receiverAccountUuid is not null)`
        let offset = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let direction = self.windowData.sortDirection === '-' ? 'desc' : 'asc'
        let currPageCondition = self.translateConditions(this.getCondition())
        let zql = `
query iam2Project where ${currPageCondition} and ${projectCondition} order by ${self.windowData.sortBy} ${direction} limit ${limit} offset ${offset};
count iam2Project where ${currPageCondition} and ${projectCondition};`
        return rpc.query('zql', {
          zql: encodeURIComponent(zql)
        }).then((resp) => {
          let iam2project = resp.results[0].inventories
          return self.updateDbTable({
            tableName: 'iam2project',
            list: iam2project,
            total: iam2project.length
          }).then(() => {
            let uuidList = []
            let linkedAccountUuidList = []
            if (iam2project.length > 0) {
              uuidList = iam2project.map((item) => item.uuid)
              linkedAccountUuidList = iam2project.map((item) => item.linkedAccountUuid)
            }
            let table = {}
            uuidList.forEach(uuid => {
              table[uuid] = {
                selected: false
              }
            })
            let tasks = []
            let p = null
            if (uuidList.length > 0) {
              p = self.getProjectAdmin(uuidList)
              tasks.push(p)
            }
            linkedAccountUuidList.forEach((accountUuid) => {
              let obj = {
                'uuid': accountUuid
              }
              p = rpc.query(`accounts/quota/${obj.uuid}/usages`).then((resp) => {
                obj.volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used
                obj.vmNum = resp.usages.filter((i) => i.name === 'vm.num')[0].used
              })
                .then(() => {
                 return  self.updateDbRow({
                    tableName: 'account',
                    id: obj.uuid,
                    data: obj
                  })
                })
              tasks.push(p)
            })
            return Promise.all(tasks).then(() => {
              return self.updateWindow({
                pageCount: resp.results[1].total === 0 ? 1 : Math.ceil(resp.results[1].total / self.windowData.pageSize),
                uuidList,
                table,
                total: resp.results[1].total
              })
            })
          })
        })
      },
      //查询条件查询除admin账户的所有账户都可共享
      getCondition() {
        let conditionList = []
        conditionList.push(`name!=admin`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%${encodeURIComponent(this.searchStr)}%`)
        }
        return conditionList
      },
      //查询账户列表数据
      async queryAccountList() {
        const self = this
        let accountCondition = `uuid in (query SharedResource.receiverAccountUuid where resourceUuid='${this.windowData.uuid}' and receiverAccountUuid is not null)`
        let offset = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let direction = self.windowData.sortDirection === '-' ? 'desc' : 'asc'
        let currPageCondition = self.translateConditions(this.getCondition())
        let zql = `
query account where ${currPageCondition} and ${accountCondition} order by ${self.windowData.sortBy} ${direction} limit ${limit} offset ${offset};
count account where ${currPageCondition} and ${accountCondition};`
        return rpc.query('zql', {
          zql: encodeURIComponent(zql)
        }).then((resp) => {
          let AccountInventories = resp.results[0].inventories
          return self.updateDbTable({
            tableName: 'account',
            list: AccountInventories,
          }).then(() => {
            let uuidList = AccountInventories.map((item) => item.uuid)
            let table = {}
            uuidList.forEach(uuid => {
              table[uuid] = {
                selected: false
              }
            })
            let tasks = []
            let p = null
            AccountInventories.forEach((item) => {
              p = rpc.query(`accounts/quota/${item.uuid}/usages`).then((resp) => {
                item.volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used
                item.vmNum = resp.usages.filter((i) => i.name === 'vm.num')[0].used
              })
                .then(() => {
                  return self.updateDbRow({
                    tableName: 'account',
                    id: item.uuid,
                    list: item
                  })
                })
              tasks.push(p)
            })
            return Promise.all(tasks).then(() => {
              return self.updateWindow({
                pageCount: resp.results[1].total === 0 ? 1 : Math.ceil(resp.results[1].total / self.windowData.pageSize),
                uuidList,
                table,
                total: resp.results[1].total
              }).then(() => {
                self.updateDbTable({
                  tableName: 'account',
                  list: resp.results[0].inventories
                })
              })
            })
          })
        })
      },
      handleSelect(rows) {
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      //共享资源
      shareResource () {
        let currZoneUuid = window.localStorage.getItem('currZoneUuid')
        let projectCondition = `linkedAccountUuid not in (query SharedResource.receiverAccountUuid where resourceUuid='${this.windowData.uuid}' and receiverAccountUuid is not null) and (
  uuid in (
    query iAM2ProjectAttribute.projectUuid where value='${currZoneUuid}' and
    name='__ProjectRelatedZone__'
  ) or
  uuid not in (query iAM2ProjectAttribute.projectUuid where name='__ProjectRelatedZone__')
)`
        let accountCondition = `uuid not in (query SharedResource.receiverAccountUuid where resourceUuid='${this.windowData.uuid}' and receiverAccountUuid is not null)`
        if (this.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          this.openDialog('ShareResourceToAccountProjectMultiSelectListConfirm', {
            currSelectTab: this.tabListType,
            projectCondition: projectCondition,
            accountCondition: accountCondition,
            uuid: this.windowData.uuid,
            select: (uuidList) => this.shareResources([this.windowData.uuid], uuidList)
          })
        } else {
          this.openDialog('SharedSelectList', {
            uuid: this.windowData.uuid,
            share: (uuidList) => this.shareResources([this.windowData.uuid], uuidList),
            shareToAll: () => this.shareResourceToAll([this.windowData.uuid]),
            ok: () => {
              this.updateWindow({
                dialogList: []
              })
            }
          })
        }
      },
      //共享资源
      shareResources (uuid, accountUuidList) {
        let self = this
        let name = self.getAccountName(accountUuidList[0])
        let eventName = self.getEventName(accountUuidList[0])
        let event = self.createEvent(eventName, accountUuidList.length === 1 ? name : '')
        rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': uuid,
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
      //共享给所有
      shareResourceToAll (uuid) {
        let self = this
        let name = self.dbData[self.windowData.tableName][self.windowData.uuid].name
        if (!name) {
          name = self.dbData[self.windowData.tableName][self.windowData.uuid].description
        }
        let eventNameTab = self.windowData.tableName
        if (self.param.i18nTab) {
          eventNameTab = self.param.i18nTab
        }
        let event = self.createEvent(`${eventNameTab}.action.shareToAll`, name)
        return rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': uuid,
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
      getAccountName: function (uuid) {
        return _.has(this.dbData.account[uuid], 'linkedProjectUuid') ? _.get(this.dbData.iam2project, [this.dbData.account[uuid].linkedProjectUuid, 'name']) : this.dbData.account[uuid].name
      },
      getEventName: function (uuid) {
        return _.has(this.dbData.account[uuid], 'linkedProjectUuid') ? 'account.action.shareResourceToProject' : 'account.action.shareResource'
      },
      //召回
      revokeResource () {
        let self = this
        if (!self.isSelected || self.selectedList.length === 0) return
        let uuidList = self.selectedList
        if (self.tabListType === 'iam2project') {
          uuidList = self.selectedList.map(uuid => {
            if (self.dbData.iam2project[uuid]) {
              return self.dbData.iam2project[uuid].linkedAccountUuid
            }
          })
        }
        let accountName = self.tabListType === 'iam2project' ? self.dbData.iam2project[self.selectedList[0]].name : self.dbData.account[uuidList[0]].name
        let eventName = self.tabListType === 'iam2project' ? 'account.action.revokeResourceFromProject' : 'account.action.revokeResource'
        let event = self.createEvent(eventName, uuidList.length > 1 ? '' : accountName)
        rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': [this.windowData.uuid],
            'toPublic': false,
            'accountUuids': uuidList,
            'all': false
          }
        }, event).then((resp) => {
          self.incEventSuccess(event)
          self.queryList()
        }, () => {
          self.incEventFail(event)
        })
      },
      //全局共享
      PageShareResourceToAll(){
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              this.shareResourceToAll([this.windowData.uuid])
            }
          })
      },
      //是否可以全局共享
      isShareToAll() {
        if (this.windowData.tableNameA === '' || this.windowData.uuid === '') return false
        if (this.dbData[this.windowData.tableNameA] && this.dbData[this.windowData.tableNameA][this.windowData.uuid].toPublic) return true
        return false
      },
      //处理全局共享
      toggleShareToAll() {
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
      //全局召回
      PageRevokeResourceFromAll () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.recallFromAll',
          warning: 'account.recall',
          ok: () => {
            this.revokeResourceFromAll([this.windowData.uuid])
          }
        })
      },
      //全局召回请求
      revokeResourceFromAll () {
        let self = this
        let name = self.dbData[self.windowData.tableName][self.windowData.uuid].name
        if (!name) {
          name = self.dbData[self.windowData.tableName][self.windowData.uuid].description
        }
        let eventNameTab = self.windowData.tableName
        if (self.param.i18nTab) {
          eventNameTab = self.param.i18nTab
        }
        let event = self.createEvent(`${eventNameTab}.action.recallFromAll`, name)
        return rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': [this.windowData.uuid],
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
      //查看共享account详情
      goToAccount(uuid){
        let self = this;
        self.$router.push({name: 'detailAccount', params:{uuid}})
      }
    },
    watch: {
      'windowData.pageIndex': function (newVal, oldVal) {
        let self = this;
        if (newVal !== oldVal) {
          self.queryList();
        }
      },
      'windowData.pageSize': function (newVal, oldVal) {
        let self = this;
        if (newVal !== oldVal) {
          self.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
