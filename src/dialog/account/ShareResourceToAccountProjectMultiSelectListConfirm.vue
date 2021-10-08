<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span class="title">{{$t('common.account')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body" class="dialog-body-container" >
      <div style="padding: 30px">
        <div class="page-toolbar-container" style="padding: 10px 0px;">
          <el-row type="flex">
            <div class="page-toolbar-left">
              <div  style="display: inline-block" v-if="getLicensePermission('LICENSE_EXTRA_COMPANY')">
                <component :param="typeListItem.param" :is="typeListItem.ctrl"/>
              </div>
            </div>
            <div class="page-toolbar-center"></div>
            <div class="page-toolbar-right">
              <span style="padding: 0 15px;display: inline-block;">
                 <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                           @change="search()">
                   <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                              style="width: 105px">
                       <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                                  :value="item.value">
                      </el-option>
                   </el-select>
                 <span slot="append"><i class="el-icon-search icon"></i></span>
                 </el-input>
               </span>
            </div>
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
                <span class="link">{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column>

            </el-table-column>
            <el-table-column :label="$t('image.imageType')" prop="type"></el-table-column>
            <el-table-column :label="$t('common.vmNum')">
              <template slot-scope="scope">
                {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].vmNum) ? dbData.account[scope.row.uuid].vmNum : 0}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.volumeNum')">
              <template slot-scope="scope">
                {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].volumeNum) ? dbData.account[scope.row.uuid].volumeNum : 0}}
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
                {{(dbData.iam2project[scope.row.uuid] && dbData.iam2project[scope.row.uuid].linkedAccountUuid && dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid] && dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].vmNum) ? dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].vmNum : 0}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.volumeNum')">
              <template slot-scope="scope">
                {{(dbData.iam2project[scope.row.uuid] && dbData.iam2project[scope.row.uuid].linkedAccountUuid && dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid] && dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].volumeNum) ? dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].volumeNum : 0}}
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
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DialogTemplate from "../DialogTemplate";
  import WindowBase from 'src/windows/Window';
  import FullPanelTypeList from 'src/component/FullPanel/PanelTypeList';
  import HomeMethods from 'src/ecs/home/Methods';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import _ from 'lodash';
  export default {
    name: "ShareResourceToAccountProjectMultiSelectListConfirm",
    mixins: [WindowBase, MultiSelectList],
    components: {DialogTemplate},
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        tabList: [
          {
            typeName: 'selectProjectToShare',
            value: 'iam2project',
            permission: 'LICENSE_BASIC_COMMUNITY'
          },
          {
            typeName: 'selectAccountToShare',
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
    computed: {
      shareItemList(){
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.account[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.account[uuid]
          }
        )
      },
      shareIam2ItemList(){
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.iam2project[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.iam2project[uuid]
          }
        )
      },
    },
    created () {
      let dataUuid = '', self = this;
      if (this.dialogData.param && this.dialogData.param.uuid) {
        dataUuid = this.dialogData.param.uuid
      }
      let currSelectTab = 'iam2project'
      let projectCondition = 'state!=Deleted'
      let accountCondition = 'name!=admin'
      if (this.dialogData.param.currSelectTab) self.tabListType = this.dialogData.param.currSelectTab
      if (this.dialogData.param && this.dialogData.param.projectCondition) {
        projectCondition = this.dialogData.param.projectCondition
      }
      if (this.dialogData.param && this.dialogData.param.accountCondition) {
        accountCondition = this.dialogData.param.accountCondition
      }
      this.updateWindow({
        dataUuid,
        projectCondition,
        accountCondition,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        accountUuidList: [],
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
      })
    },
    methods: {
      ...Utils,
      ...{
        getProjectAdmin: HomeMethods.methods.getProjectAdmin
      },
      //获得查询条件
      getCondition() {
        let conditionList = []
        conditionList.push(`name!=admin`)
        if (this.selectVal !=='' && this.searchStr!=='' ) {
          conditionList = conditionList.concat(`${this.selectVal}~=%${this.searchStr}%`)
        }
        return conditionList
      },
      //查找列表数据
      queryList: function () {
        let self = this
        if (self.tabListType === 'iam2project') {
          self.queryProjectList()
        } else {
          self.queryAccountList()
        }
      },
      //查找项目列表
      queryProjectList: function () {
        const self = this
        let offset = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let direction = self.windowData.sortDirection === '-' ? 'desc' : 'asc'
        let currPageCondition = self.translateConditions(this.getCondition())
        let zql = `
query iam2Project where ${currPageCondition} and ${self.windowData.projectCondition} order by ${self.windowData.sortBy} ${direction} limit ${limit} offset ${offset};
count iam2Project where ${currPageCondition} and ${self.windowData.projectCondition};`
        return rpc.query('zql', {
          zql: encodeURIComponent(zql)
        }).then((resp) => {
          let iam2project = resp.results[0].inventories
          return self.updateDbTable({
            tableName: 'iam2project',
            list: iam2project
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
                  self.updateDbRow({
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
      //查找账户列表
      async queryAccountList () {
        const self = this
        let offset = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let direction = self.windowData.sortDirection === '-' ? 'desc' : 'asc'
        let currPageCondition = self.translateConditions(this.getCondition())
        let zql = `
query account where ${currPageCondition} and ${self.windowData.accountCondition} order by ${self.windowData.sortBy} ${direction} limit ${limit} offset ${offset};
count account where ${currPageCondition} and ${self.windowData.accountCondition};`
        return rpc.query('zql', {
          zql: encodeURIComponent(zql)
        }).then((resp) => {
          let AccountInventories = resp.results[0].inventories
          return self.updateDbTable({
            tableName: 'account',
            list: AccountInventories
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
                  self.updateDbRow({
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
              })
            })
          })
        })
      },
      genGetDisabled(){

      },
      confirm(){
        let self = this;
        if (!self.isSelected || self.selectedList.length === 0) return
        let accountUuidList = this.selectedList
        if (this.tabListType === 'iam2project') {
          accountUuidList = this.selectedList.map(uuid => {
            if (this.dbData.iam2project[uuid]) {
              return this.dbData.iam2project[uuid].linkedAccountUuid
            }
          })
        }
        if (this.dialogData.param.select) {
          this.dialogData.param.select(accountUuidList)
        } else if (this.dialogData.param.ok) {
          this.dialogData.param.ok(accountUuidList)
        }
        self.closeDialog(self.windowId);
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
