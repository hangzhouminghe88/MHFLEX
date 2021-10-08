<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.changeResourceOwner')}}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>
    <div slot="body" class="dialog-body-container">
      <div class="page-toolbar-container">
        <el-row type="flex">
          <div class="page-toolbar-left">
            <div class="tab-container">
              <span class="tab-item" @click="changeTab('project')" :class="{'is-active':currTab === 'project'}">{{$t('user.project')}}</span>
              <span class="tab-item" @click="changeTab('account')" :class="{'is-active':currTab === 'account'}">{{$t('common.account')}}</span>
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
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          </div>
        </el-row>
      </div>
      <div class="page-table">
        <el-table :data="itemList" @row-click="handleSingleSelect" highlight-current-row v-if="currTab === 'project'">
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.linkedAccountUuid">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('home.projectAdmin')" prop="projectAdmin">
            <template slot-scope="scope">
              {{dbData.iam2projectA[scope.row.uuid] && dbData.iam2projectA[scope.row.uuid].projectAdmin}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.vm')">
            <template slot-scope="scope">
              {{(dbData.iam2project[scope.row.uuid] && dbData.iam2project[scope.row.uuid].linkedAccountUuid &&
              dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid] &&
              dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].vmNum) ?
              dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].vmNum : 0}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.volume')">
            <template slot-scope="scope">
              {{(dbData.iam2project[scope.row.uuid] && dbData.iam2project[scope.row.uuid].linkedAccountUuid &&
              dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid] &&
              dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].volumeNum) ?
              dbData.account[dbData.iam2project[scope.row.uuid].linkedAccountUuid].volumeNum : 0}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-table :data="itemList" @row-click="handleSingleSelect" highlight-current-row v-if="currTab === 'account'">
          <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.uuid">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.type')" prop="type">
            <template slot-scope="scope">
              {{dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].type}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.vm')">
            <template slot-scope="scope">
              {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].vmNum) ?
              dbData.account[scope.row.uuid].vmNum : 0}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.volume')">
            <template slot-scope="scope">
              {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].volumeNum) ?
              dbData.account[scope.row.uuid].volumeNum : 0}}
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
    </div>
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
      </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import DialogTemplate from "../DialogTemplate";
  import HomeMethods from 'src/ecs/home/Methods';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  export default {
    name: "ChangeResourceOwnerToAccountProjectSingleSelectListDlg",
    components: {DialogTemplate},
    mixins: [WindowBase, MultiSelectList],
    data() {
      return {
        currTab: 'project',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: [],
        templateRadio: ''
      }
    },
    created() {
      let self = this;
      let accountUuidList = []
      let projectCondition = 'state!=Deleted'
      if (self.dialogData.param && self.dialogData.param.accountUuidList) {
        accountUuidList = self.dialogData.param.accountUuidList
      }
      if (self.dialogData.param && self.dialogData.param.projectCondition) {
        projectCondition = self.dialogData.param.projectCondition
      }
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        selectedUuidList: [],
        sortDirection: '-',
        accountUuidList,
        projectCondition,
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      ...{
        getProjectAdmin: HomeMethods.methods.getProjectAdmin
      },
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      //切换tab重新请求
      changeTab(name) {
        let self = this;
        if (_.isEqual(self.currTab, name)) return;
        self.currTab = name;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 5,
          sortBy: 'createDate',
          selectedUuidList: [],
          templateRadio: '',
          sortDirection: '-'
        }).then(() => {
          self.queryList();
        })
      },
      //查询条件
      getCondition: function () { // account
        let conditionList = []
        if (this.dialogData.param && this.dialogData.param.conditions && this.currTab !== 'project') {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (this.dialogData.param && this.dialogData.param.pjConditions && this.currTab === 'project') {
          conditionList = conditionList.concat('state!=Deleted')
          conditionList = conditionList.concat(this.dialogData.param.pjConditions)
        }
        if (this.selectVal !== '' && this.searchStr !== '' && this.currTab !== 'project') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        if (this.selectVal !== '' && this.searchStr !== '' && this.currTab === 'project') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      //查询项目列表
      queryProjectList: function () {
        let self = this
        let offset = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let direction = self.windowData.sortDirection === '-' ? 'desc' : 'asc'
        let currPageCondition = self.translateConditions(self.getCondition())
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
                total: resp.results[1].total
              }).then(() => {
                self.itemList = self.getItemList();
              })
            })
          })
        }).catch((error) => {
          throw new Error(error);
        })
      },
      //获得列表数据
      getItemList() {
        let self = this;
        if (self.currTab === 'project') {
          return self.windowData.uuidList.map((uuid) => {
            return self.dbData.iam2project[uuid]
          })
        } else {
          return self.windowData.uuidList.map((uuid) => {
            return self.dbData.account[uuid]
          })
        }
      },
      queryAccountList: async function () {
        const self = this
        let resp = await rpc.query('accounts', {
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition()
        }) // get all account
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          total: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let AccountInventories = resp.inventories
        self.updateDbTable({
          tableName: 'account',
          list: AccountInventories
        })
          .then(() => {
            AccountInventories.forEach((item) => {
              rpc.query(`accounts/quota/${item.uuid}/usages`).then((resp) => {
                item.volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used
                item.vmNum = resp.usages.filter((i) => i.name === 'vm.num')[0].used
              })
                .then(() => {
                  self.updateDbRow({
                    tableName: 'account',
                    id: item.uuid,
                    data: item
                  })
                })
            })
          })
          .then(() => {
            self.updateWindow({uuidList})
          }).then(() => {
          self.itemList = self.getItemList();
        })
      },
      //查询列表
      queryList: function () {
        const self = this
        if (self.currTab === 'project') {
          self.queryProjectList()
        } else {
          self.queryAccountList()
        }
      },
      //选择绑定数据
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      confirm(){
        let self = this;
        if(!self.templateRadio){
          self.$message('请选择所有者');
          return;
        }
        self.dialogData.param.select(self.templateRadio);
        self.close();
      }
    }
  }
</script>

<style scoped>
  .tab-container {
    display: inline-block;
    border: 1px solid #39f;
    border-radius: 2px;
    height: 35px;
    line-height: 35px;
    cursor: pointer;
  }

  .tab-item {
    display: inline-block;
    padding: 0px 20px;
    border-radius: 2px;
  }

  .is-active {
    background: #39f;
    color: #fff;
  }
</style>
