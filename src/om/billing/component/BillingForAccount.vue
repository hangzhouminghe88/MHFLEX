<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.billing')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab" v-if="getLicensePermission('LICENSE_EXTRA_COMPANY')"
            @tab-click="changeCurrTab">
            <el-tab-pane :label="`${$t('billing.zstack')}`" name="zstack"></el-tab-pane>
            <el-tab-pane :label="`${$t('billing.vcenter')}`" name="vcenter"></el-tab-pane>
          </el-tabs>
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
        <el-table-column :label="$t('common.billingTotal')" prop="total"></el-table-column>
        <el-table-column :label="$t('common.vm')" prop="vmSum"></el-table-column>
        <el-table-column :label="$t('common.rootVolume')" prop="rootVolumeSum"></el-table-column>
        <el-table-column :label="$t('common.dataVolume')" prop="dataVolumeSum"></el-table-column>
        <el-table-column v-if="isZstack" :label="$t('gpuDevice.gpuDevice')" prop="gpuSum"></el-table-column>
        <el-table-column v-if="isZstack" :label="$t('billing.publicNetworkIP')" prop="publicIpSum"></el-table-column>
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
    name: "BillingForAccount",
    components: {PageTemplate},
    mixins: [BillingList, WindowBase],
    created(){
      this.toFixed(1.1)
      // for passing this to template class
      this.self = this
      let initTab = 'zstack'
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        condition: this.conditions[initTab],
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
          this.queryList()
        })
      })
    },
    computed: {
      isZstack () {
        return this.currTab === 'zstack'
      }
    },
    data () {
      return {
        conditions: {
          'available': 'state!=Destroyed',
          'destroyed': 'state=Destroyed'
        },
        iam2projectCount: 0,
        accountCount: 0,
        checkboxWidth: '100px',
        nameWidth: '100px',
        cpuWidth: '100px',
        memoryWidth: '100px',
        stateWidth: '100px',
        createDateWidth: '100px',
        currTab: 'zstack',
        start_at: new Date(new Date().getTime() - 259200000),
        end_at: new Date(new Date().getTime()),
        disabled: true,
        clear: true,
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          }
        ],
        billing: {
          vmSum: 0,
          rootVolumeSum: 0,
          dataVolumeSum: 0,
          gpuSum: 0,
          total: 0
        },
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
    methods: {
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
      handleChangeDate(value) {
        let self = this;
        if (Date.parse(self.start_at) > Date.parse(self.end_at)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },
      changeCurrTab: function (e) {
        let self = this;
        if (self.currTab !== e.name) {
          self.currTab == e.name;
          self.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            sortBy: 'createDate',
            sortDirection: '-',
            accountUuidList: [],
            allProjectAccountUuidList: [],
            projectAccountUuidList: [],
            methods: {
              queryList: this.queryList
            }
          }).then(() => {
            setTimeout(() => {
            }, 1000)
          })
          self.billing = {
            vmSum: 0,
            dataVolumeSum: 0,
            rootVolumeSum: 0,
            gpuSum: 0,
            total: 0
          }
          self.queryList()
        }
      },
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      initProjectAndAccountUuidList: function () {
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
          self.updateDbTable({
            tableName: 'iam2project',
            list: resp.inventories
          })
          self.updateWindow({ allProjectAccountUuidList })
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
            self.updateWindow({ projectAccountUuidList })
          })
        })
      },
      queryList () {
        let starTime = this.start_at.getTime();
        let endTime = this.end_at.getTime();
        this.start_time = this.start_at.getTime();
        this.end_time = this.end_at.getTime();
        let uuid = window.localStorage.getItem('accountUuid')
        let accountData = {}
        let vmUuidList = []
        let dataVolumeList = {}
        let dataVolumeUuidList = []
        let rootVolumeUuidList = []
        let rootVolumeList = {}
        let vmList = {}
        let billing = {
          vmSum: 0,
          dataVolumeSum: 0,
          rootVolumeSum: 0,
          gpuSum: 0,
          total: 0
        }
        // let isZstack = this.currTab === 'zstack'
        rpc.update('billings/accounts', uuid, {
          'calculateAccountSpending': {
            'dateStart': starTime,
            'dateEnd': endTime
          }
        }).then((resp) => {
          accountData.billing = resp
          accountData.billing.rootVolumeSum = 0
          accountData.billing.vmSum = 0
          accountData.billing.dataVolumeSum = 0
          accountData.billing.billingTotal = resp.total
          accountData.billing.spending.forEach((billingItem) => {
            if (billingItem.spendingType === 'rootVolume') {
              accountData.billing.rootVolumeSum = billingItem.spending
              rootVolumeUuidList = billingItem.details.map((item) => item.resourceUuid)
              billingItem.details.forEach((item) => {
                rootVolumeList[item.resourceUuid] = item.spending
              })
            }
            if (billingItem.spendingType === 'VM') {
              vmUuidList = billingItem.details.map((item) => item.resourceUuid)
              billingItem.details.forEach((item) => {
                vmList[item.resourceUuid] = item.spending
              })
            }
            if (billingItem.spendingType === 'gpu' && this.isZstack) {
              billing.gpuSum = billingItem.spending
              billing.total += billingItem.spending
            }
            if (billingItem.spendingType === 'dataVolume') {
              accountData.billing.dataVolumeSum = billingItem.spending
              dataVolumeUuidList = billingItem.details.map((item) => item.resourceUuid)
              billingItem.details.forEach((item) => {
                dataVolumeList[item.resourceUuid] = item.spending
              })
            }
          })
          // 分段获取vm数据，每次20个uuid
          let tasks = _.chunk(vmUuidList, 20).map(uuidList => {
            return rpc.query('vm-instances', {
              q: [`uuid?=${uuidList}`, `hypervisorType=${this.isZstack ? 'KVM' : 'ESX'}`],
              fields: 'uuid'
            }).then((resp) => {
              resp.inventories.forEach((inventory) => {
                billing.vmSum += vmList[inventory.uuid]
                billing.total += vmList[inventory.uuid]
              })
            })
          })

          let _tasks = []
          _tasks = _.chunk(rootVolumeUuidList, 20).map(uuidList => {
            return rpc.query('volumes', {
              q: [`uuid?=${uuidList}`, `format=${this.isZstack ? 'qcow2' : 'vmtx'}`],
              fields: 'uuid'
            }).then((resp) => {
              resp.inventories.forEach((inventory) => {
                billing.rootVolumeSum += rootVolumeList[inventory.uuid]
                billing.total += rootVolumeList[inventory.uuid]
              })
            })
          })
          tasks.concat(_tasks)

          _tasks = _.chunk(dataVolumeUuidList, 20).map(uuidList => {
            return rpc.query('volumes', {
              q: [`uuid?=${uuidList}`, `format=${this.isZstack ? 'qcow2' : 'vmtx'}`],
              fields: 'uuid'
            }).then((resp) => {
              resp.inventories.forEach((inventory) => {
                billing.dataVolumeSum += dataVolumeList[inventory.uuid]
                billing.total += dataVolumeList[inventory.uuid]
              })
            })
          })
          tasks.concat(_tasks)

          Promise.all(tasks)
            .then(() => {
              this.billing = billing;
              this.itemList = [billing]
            })
        })
      },
      ...Utils
    }
  }
</script>

<style scoped>

</style>
