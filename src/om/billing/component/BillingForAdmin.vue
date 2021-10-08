<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.billing')}}</span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="between-space">
        <div class="page-toolbar-left">
          <el-date-picker
            v-model="start_at"
            type="datetime"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions0"
            @change="handleChangeDate">
          </el-date-picker>
          -
          <el-date-picker
            v-model="end_at"
            type="datetime"
            start-placeholder="开始日期"
            :picker-options="pickerOptions1"
            @change="handleChangeDate">
          </el-date-picker>
          <help-trigger name="billing" :style="{left: '455px', top: '10px'}"/>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right"></div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table :data="itemList" v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{windowData.currTab == 'iam2project' ? (dbData.accountA[scope.row.uuid] ? dbData.accountA[scope.row.uuid].projectName : dbData.account[scope.row.uuid].name) : dbData.account[scope.row.uuid].name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.billingTotal')">
          <template slot-scope="scope">
            {{dbData.billing[scope.row.uuid] && formatCurrency(dbData.billing[scope.row.uuid].billingTotal)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vm')">
          <template slot-scope="scope">
            {{dbData.billing[scope.row.uuid] && formatCurrency(dbData.billing[scope.row.uuid].vmSum)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.rootVolume')">
          <template slot-scope="scope">
            {{dbData.billing[scope.row.uuid] && formatCurrency(dbData.billing[scope.row.uuid].rootVolumeSum)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.dataVolume')">
          <template slot-scope="scope">
            {{dbData.billing[scope.row.uuid] && formatCurrency(dbData.billing[scope.row.uuid].dataVolumeSum)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('gpuDevice.gpuDevice')">
          <template slot-scope="scope">
            {{dbData.billing[scope.row.uuid] && formatCurrency(dbData.billing[scope.row.uuid].gpuSum)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('billing.publicNetworkIP')">
          <template slot-scope="scope">
            {{dbData.billing[scope.row.uuid] && formatCurrency(dbData.billing[scope.row.uuid].bandwidthSum)}}
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
    <div slot="page-footer"></div>
  </page-template>
</template>

<script>
  import IAM2ProjectMethods from 'src/ecs/home/Methods'
  import PageTemplate from "src/component/PageTemplate";
  import BillingList from "src/om/billing/List";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "BillingForAdmin",
    components: {PageTemplate},
    mixins: [BillingList, WindowBase],
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        end_at: '',
        start_at: '',
        date: new Date(),
        itemList: [],
        pickerOptions0: {
          disabledDate: (time) => {

          }
        },
        pickerOptions1: {
          disabledDate: (time) => {
            let self = this;
            return time.getTime() < self.start_at;
          }
        },
      }
    },
    created: function () {
      this.toFixed(1.1)
      // for passing this to template class
      this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      this.self = this
      let initTab = 'account'
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        conditions: {
          'available': 'state!=Destroyed',
          'destroyed': 'state=Destroyed'
        },
        currTab: initTab,
        showMoreDropdown: false,
        sortBy: 'billingTotal',
        sortDirection: '-',
        accountUuidList: [],
        allProjectAccountUuidList: [],
        projectAccountUuidList: [],
        loading: false,
        methods: {
          queryList: this.sortList,
          query: this.query
        }
      }).then(() => {
        this.getCurrTime().then(() => {
          this.initProjectAndAccountUuidList().then(() => {
            this.queryList()
          }, () => {
            this.queryList()
          })
        })
        if (this.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          this.updateWindow({currTab: 'iam2project'})
        }
      })
    },
    methods: {
      ...Utils,
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
      getCondition: function () {
        let conditionList = []
        if (this.windowData.currTab === 'iam2project') {
          conditionList.push(`uuid?=${this.windowData.projectAccountUuidList}`)
        } else if (this.windowData.currTab === 'account') {
          conditionList.push(`uuid!?=${this.windowData.allProjectAccountUuidList}`)
        }
        return conditionList
      },
      handleChangeDate(value) {
        let self = this;
        if (Date.parse(self.start_at) > Date.parse(self.end_at)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },
      initProjectAndAccountUuidList() {
        const self = this
        let allProjectAccountUuidList = []
        let projectUuidList = []
        let projectAccountUuidList = []
        let relatedZoneProjectUuidList = []
        let allIAM2ProjectUuidList = []
        let zoneUuidList = []
        let taskList = []
        let q = null
        let tasks = []
        let p = null
        p = rpc.query('iam2/projects', {
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
          self.updateWindow({allProjectAccountUuidList})
        })
        tasks.push(p)
        p = rpc.query('zones', {
          fields: 'uuid'
        }).then((zoneResp) => {
          zoneUuidList = zoneUuidList.concat(zoneResp.inventories.map(it => it.uuid))
          q = rpc.query('iam2/projects', {
            q: ['attributes.name=__ProjectRelatedZone__'],
            limit: 100000000,
            fields: 'uuid'
          }).then((resp) => {
            relatedZoneProjectUuidList = relatedZoneProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            projectUuidList = projectUuidList.concat(_.difference(allIAM2ProjectUuidList, relatedZoneProjectUuidList))
          })
          taskList.push(q)
          q = rpc.query('iam2/projects', {
            q: ['attributes.name=__ProjectRelatedZone__', `attributes.value?=${zoneUuidList}`],
            limit: 100000000,
            fields: 'uuid'
          }).then((resp) => {
            projectUuidList = projectUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(q)
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return Promise.all(taskList).then(() => {
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
            }
            self.updateWindow({projectAccountUuidList})
          })
        })
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailBilling', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
