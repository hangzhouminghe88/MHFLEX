<template>
    <page-template>
      <div slot="page-header" style="height: 60px; line-height: 60px;">
        <el-row :gutter="10">
          <el-col :span="2">
            <span class="page-header-title">{{ $t(`common.vip`) }}</span>
          </el-col>
          <el-col :span="2.2">
            <el-tabs v-model="windowData.currTab" @tab-click="changeCurrTab">
              <el-tab-pane :label="`${$t('common.diy')}(${windowData.customizedCount ? windowData.customizedCount : '0'})`" name="customized" ></el-tab-pane>
              <el-tab-pane :label="`${$t('common.system')}(${windowData.systemCount ? windowData.systemCount : '0'})`"  name="system" ></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex" justify="space-between">
          <div style="flex-shrink: 0;">
            <span class="btn-success" v-if="windowData.currTab !== 'system'" v-permission="'VIP.CREATE'" @click="updateWindow({ currItemUuid: '' }); openCreateVipDlg()"><i class="el-icon-plus icon"></i>{{$t('common.createVip')}}</span>
            <drop-down v-if="windowData.currTab !== 'system'"  class="btn-primary more dropdown" :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}" :enabled="isSelected && windowData.currItemUuid === ''">
              <span slot="title">
                 <i class="el-icon-more"></i>
                 <span class="text">{{ $t("common.moreActions") }}</span>
              </span>
              <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-changeResourceOwner" :class="{ 'disabled-text': !canChangeResourseOwner() }" v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" style="padding-top: 12px" @click="isSelected && canChangeResourseOwner() && pageChangeResourceOwner()">{{$t("common.changeResourceOwner")}}</a>
                  <a id="common-destroy" v-permission="'VIP.DELETE'" @click="pageDelete()" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
                </div>
              </transition>
            </span>
            </drop-down>
          </div>
          <div style="text-align: right;flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
            <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
          </div>
        </el-row>
      </div>

      <div slot="page-table-content" style="max-height: 400px;">
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
            show-tooltip-when-overflow
          >
            <template slot-scope="scope">
              <a class="link" @click="$router.push(`detailvip/${scope.row.uuid}`);">{{scope.row.name}}</a>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.ip')"
            prop="ip"
            show-tooltip-when-overflow
          >
          </el-table-column>
          <el-table-column
            :label="$t('common.gateway')"
            prop="gateway"
            show-tooltip-when-overflow
          >
          </el-table-column>
          <el-table-column
            :label="$t('common.netmask')"
            prop="netmask"
            show-tooltip-when-overflow
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
            :label="$t('common.useFor')"
            prop=""
          >
            <template slot-scope="scope">
              {{getVipUseFor(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.hypervisorType')"
            prop="hypervisorType"
            show-tooltip-when-overflow
          >
            <template slot-scope="scope">
              {{dbData.vip[scope.row.uuid] && dbData.l3NetworkOfHost[dbData.vip[scope.row.uuid].l3NetworkUuid] && (dbData.l3NetworkOfHost[dbData.vip[scope.row.uuid].l3NetworkUuid].length > 0) && dbData.l3NetworkOfHost[dbData.vip[scope.row.uuid].l3NetworkUuid][0] && dbData.l3NetworkOfHost[dbData.vip[scope.row.uuid].l3NetworkUuid][0].hypervisorType}}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('common.owner')"
            prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource"
          >
            <template slot-scope="scope">
              {{getResourceOwner(scope.row.uuid)}}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('common.createDate')"
            show-tooltip-when-overflow
            prop="createDate">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
            :current-page="windowData.pageIndex"
            :page-size="windowData.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="windowData.availableCount"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </div>
      </div>
    </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import List from 'src/network/vip/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils'
  import TableBodyItemState from "../../component/TableBodyItemState";
  import IAM2ProjectMethods from 'src/IAM2Project/Methods'
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "VipListPage",
    mixins: [Root,WindowBase,List, MultiSelectList,PageBase],
    components: {PageTemplate,TableBodyItemState},
    created: function () {
      this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        systemCount: 0,
        customizedCount: 0,
        currItemUuid: '',
        currTab: 'customized',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: this.queryList
        },
        showSearchBox: false
      })
        .then(() => {
          this.queryList()
        })

    },
    computed:{

    },
    destroyed: function () {

    },
    data () {
      return {
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        searchStr: "",
        selectVal: 'name',
        itemList:[]
      }

    },
    methods: {
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      refresh(){
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          currItemUuid: ''
        }).then(() => {

          self.queryList();
        })
      },
      openCreateVipDlg: function () {
        this.$router.push("createvip")
        /*
        this.openDialog('CreateVipDlg', { ok: this.create })
          .then((dialogUuid) => {
            let dialogList = _.cloneDeep(this.windowData.dialogList)
            dialogList.push(dialogUuid)
            this.updateWindow({ dialogList })
              .then(() => {
                this._updateWindow({
                  id: dialogUuid,
                  left: this.$el.offsetLeft,
                  top: this.$el.offsetTop,
                  right: 0,
                  bottom: 0
                })
              })
          })*/
      },
      pageChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
      },
      changeOwner: function () {
        const self = this
        let currZoneUuid = window.localStorage.getItem('currZoneUuid')
        if (self.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          let uuidList = self.selectedList
          let accountUuid = self.dbData.resourceOwner[uuidList[0]] ? self.dbData.resourceOwner[uuidList[0]].uuid : ''
          let hasSameAccount = uuidList.every(uuid => {
            if (self.dbData.resourceOwner[uuid] && (self.dbData.resourceOwner[uuid].uuid === accountUuid)) {
              return true
            }
          })
          let notEnabledIAM2ProjectUuidList = []
          let relatedZoneProjectUuidList = []
          let accountUuidList = []
          let zoneUuidList = []
          let allProjectAccountUuidList = []
          let projectAccountUuidList = []
          let projectUuidList = []
          let allIAM2ProjectUuidList = []
          let taskList = []
          let q = null
          let tasks = []
          let p = null
          q = rpc.query('iam2/projects', {// all project
            limit: 100000000
          }).then((resp) => {
            allProjectAccountUuidList = allProjectAccountUuidList.concat(resp.inventories.map(it => it.linkedAccountUuid))
            allIAM2ProjectUuidList = allIAM2ProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            resp.inventories.forEach(function (item) {
              ((item) => {
                item.projectUuid = item.uuid
                item.projectName = item.name
                self.updateDbRow({
                  tableName: 'accountA',
                  id: item.linkedAccountUuid,
                  data: item
                })
              })(item)
            })
            self.getProjectAdmin(allIAM2ProjectUuidList)
            self.updateDbTable({
              tableName: 'iam2project',
              list: resp.inventories
            })
          })
          taskList.push(q)
          q = rpc.query('zones', {
            fields: 'uuid'
          }).then((zoneResp) => {
            zoneUuidList = zoneUuidList.concat(zoneResp.inventories.map(it => it.uuid))
            p = rpc.query('iam2/projects', {
              q: ['attributes.name=__ProjectRelatedZone__'],
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              relatedZoneProjectUuidList = relatedZoneProjectUuidList.concat(resp.inventories.map(it => it.uuid))
              projectUuidList = projectUuidList.concat(_.difference(allIAM2ProjectUuidList, relatedZoneProjectUuidList))
            })
            tasks.push(p)
            p = rpc.query('iam2/projects', {
              q: ['attributes.name=__ProjectRelatedZone__', `attributes.value=${currZoneUuid}`],
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              projectUuidList = projectUuidList.concat(resp.inventories.map(it => it.uuid))
            })
            tasks.push(p)
            p = rpc.query('iam2/projects', {
              q: 'state!=Enabled',
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              notEnabledIAM2ProjectUuidList = notEnabledIAM2ProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            })
            tasks.push(p)
          })
          taskList.push(q)
          q = rpc.query('accounts').then((resp) => {
            accountUuidList = accountUuidList.concat(resp.inventories.map(it => it.uuid))
            if (uuidList.length === 1 || hasSameAccount) accountUuidList = _.difference(accountUuidList, [accountUuid])
          })
          taskList.push(q)
          return Promise.all(taskList).then(() => {
            return Promise.all(tasks).then(() => {
              accountUuidList = _.difference(accountUuidList, allProjectAccountUuidList)
              projectUuidList = _.difference(projectUuidList, notEnabledIAM2ProjectUuidList)
              if (projectUuidList.length > 0) {
                let project = ''
                projectUuidList.forEach(function (projectUuid) {
                  ((projectUuid) => {
                    project = _.cloneDeep(self.dbData.iam2project[projectUuid])
                    if (project && project.linkedAccountUuid) {
                      projectAccountUuidList.push(project.linkedAccountUuid)
                    }
                  })(projectUuid)
                })
                if (uuidList.length === 1 || hasSameAccount) projectAccountUuidList = _.difference(projectAccountUuidList, [accountUuid])
              }
              self.openSideWindow('ChangeResourceOwnerToAccountProjectSingleSelectListDlg', {
                accountUuidList,
                projectAccountUuidList,
                select: (uuid) => self.changeResourceToAccountOrProject(uuidList, uuid)
              })
            })
          })
        } else {
          let uuidList = this.selectedList
          let uuid, select
          if (uuidList.length === 1) {
            uuid = this.dbData.vip[uuidList[0]].accountUuid
            select = (accountUuids) => {
              return this.changeResourceOwner(uuidList, accountUuids[0])
            }
          } else {
            let firstResourceAccountRef = this.dbData.vip[uuidList[0]].accountUuid
            let hasSameAccount = uuidList.every(uuid => this.dbData.vip[uuid].accountUuid === firstResourceAccountRef)
            uuid = hasSameAccount ? firstResourceAccountRef : ''
            select = (accountUuids) => {
              let list = []
              uuidList.forEach((item) => {
                if (this.dbData.vip[item].accountUuid !== accountUuids[0]) list.push(item)
              })
              if (list.length === 0) return
              return this.changeResourceOwner(list, accountUuids[0])
            }
          }
          this.openSideWindow('AccountListDlg', {
            uuid,
            select
          })
        }
      },
      ...Utils
    },
    watch: {
    },
    filters: {


    }
  }
</script>

<style scoped>

</style>
