<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">账单详情</span>
      <span @click="$router.push({name:'billing'})" class="create-back item">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到账单列表</span>
      </span>
      <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
               class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
        <el-tab-pane :label="$t('common.rootVolume')" name="rootVolume"></el-tab-pane>
        <el-tab-pane :label="$t('common.dataVolume')" name="dataVolume"></el-tab-pane>
        <el-tab-pane :label="$t('gpuDevice.gpuDevice')" name="gpuDevice"></el-tab-pane>
        <el-tab-pane :label="$t('billing.publicNetworkIP')" name="publicNetworkIP"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="billing_ico"/>
          <div class="after-icon"></div>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: $t('common.billingTotal'),
              content: model && formatCurrency(model.billingTotal)
            }"
          />
          <detail-row
            :param="{
              title: $t('common.vm'),
              content: model && formatCurrency(model.vmSum)
            }"
          />
          <detail-row
            :param="{
              title: $t('common.rootVolume'),
              content: model && formatCurrency(model.rootVolumeSum)
            }"
          />
          <detail-row
            :param="{
              title: $t('common.dataVolume'),
              content: model &&  formatCurrency(model.dataVolumeSum)
            }"
          />
          <detail-row
            :param="{
              title: $t('gpuDevice.gpuDevice'),
              content:model &&  formatCurrency(model.gpuSum)
            }"
          />
          <detail-row
            :param="{
              title: $t('billing.publicNetworkIP'),
              content: model &&  formatCurrency(model.bandwidthSum)
            }"
          />
          <detail-row
            :param="{
              title: $t('common.createDate'),
              content: dbData.account[windowData.dataUuid] && dbData.account[windowData.dataUuid].createDate && formatDatetime(new Date(dbData.account[windowData.dataUuid].createDate))
            }"
          />
          <detail-row
            :param="{
              title: $t('common.lastOpDate'),
              content: dbData.account[windowData.dataUuid] && dbData.account[windowData.dataUuid].lastOpDate && formatDatetime(new Date(dbData.account[windowData.dataUuid].lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: dbData.accountA[windowData.dataUuid] ? $t('common.billingProject') : $t('common.billingAccount'),
            content: getAccountName(),
            handler: () => {

            }
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vm'">
      <vm-instance-billing-tab-list :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'rootVolume'">
      <root-volume-billing-tab-list :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'dataVolume'">
      <data-volume-tab-list :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'gpuDevice'">
      <gpu-device-billing-tab-list :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'publicNetworkIP'">
      <public-ip-billing-tab-list :param="windowData.dataUuid"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import projectAdminMethods from 'src/ecs/home/Methods';
  import BillingList from 'src/om/billing/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import VmInstanceBillingTabList from "../component/VmInstanceBillingTabList";
  import RootVolumeBillingTabList from "../component/RootVolumeBillingTabList";
  import DataVolumeTabList from "../component/DataVolumeTabList";
  import GpuDeviceBillingTabList from "../component/GpuDeviceBillingTabList";
  import PublicIpBillingTabList from "../component/PublicIpBillingTabList";

  export default {
    name: "BillingDetailPage",
    components: {
      PublicIpBillingTabList,
      GpuDeviceBillingTabList,
      DataVolumeTabList, RootVolumeBillingTabList, VmInstanceBillingTabList, DetailTemplate},
    mixins: [WindowBase, BillingList],
    data() {
      return {
        activeName: 'info',
        billing: {}
      }
    },
    created() {
      let dataUuid = this.$route.params.uuid, self = this;
      this.toFixed(1.1)
      // for passing this to template class
      this.getProjectAdmin = this.getProjectAdmin.bind(this)
      this.self = this
      let initTab = 'account'
      this.updateWindow({
        dataUuid,
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
        methods: {
          queryList: this.sortList,
          query: this.query
        }
      })
        .then(() => {
          this.getCurrTime().then(() => {
            this.initProjectAndAccountUuidList().then(() => {
              this.queryList()
            }, () => {
              this.queryList()
            })
          })
          if (this.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
            this.updateWindow({currTab: 'iam2project'})
              .then(() => {
                this.queryList();
              })
          }
        })
    },
    computed: {
      model() {
        let self = this;
        return self.dbData.billing[self.windowData.dataUuid];
      }
    },
    methods: {
      ...Utils,
      ...{
        getProjectAdmin: projectAdminMethods.methods.getProjectAdmin
      },
      handleTabChange() {

      },
      initProjectAndAccountUuidList() {
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
        return Promise.all(tasks)
      },
      getAccountName() {
        let self = this;
        if (self.dbData.accountA[self.windowData.dataUuid]) {
          return self.dbData.accountA[self.windowData.dataUuid].name
        } else {
          return self.dbData.account[self.windowData.dataUuid] && self.dbData.account[self.windowData.dataUuid].name;
        }
      }
    }
  }
</script>

<style scoped>
  .item {
    top: -16px;
    display: inline-block;
    margin-top: 25px;
    font-size: 12px;
  }
  .icon{
    position: relative;
    display: inline-block;
    width: 62px;
    height: 62px;
    background-repeat: no-repeat;
  }
</style>
