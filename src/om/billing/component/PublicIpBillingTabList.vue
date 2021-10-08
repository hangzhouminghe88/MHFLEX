<template>
  <div class="container">
    <ul class="tab-container">
      <li class="tab-item" :class="{'active': windowData.currSelectTab === 'pubIpVmNicBandwidth'}" @click="changeTab('pubIpVmNicBandwidth')">{{$t('billing.flatNetworkPublicIP')}}</li>
      <li class="tab-item" :class="{'active': windowData.currSelectTab === 'vip'}" @click="changeTab('vip')">{{$t('billing.virtualIP')}}</li>
    </ul>
    <el-table
    :data="windowData.currSelectTab === 'pubIpVmNicBandwidth' ? windowData.pubIpVmNicBandwidthBillingDetails : windowData.pubIpVipBandwidthBillingDetails">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column :label="$t('common.name')">
        <template slot-scope="scope">
          {{dbData.vip[scope.row.resourceUuid] && dbData.vip[scope.row.resourceUuid].name}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.vip')" v-if="windowData.currSelectTab === 'vip'">
        <template slot-scope="scope">
          {{scope.row.vipIp}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('billing.outBandwidthSpend')">
         <template slot-scope="scope" v-if="windowData.currSelectTab === 'pubIpVmNicBandwidth'">
            {{scope.row.pubIpVmNicBandwidthOutSpending}}
         </template>
        <template  slot-scope="scope" v-if="windowData.currSelectTab === 'pubIpVmNicBandwidth'">
          {{scope.row.pubIpVipBandwidthOutSpending}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('billing.inBandwidthSpend')">
        <template slot-scope="scope" v-if="windowData.currSelectTab === 'pubIpVmNicBandwidth'">
          {{scope.row.pubIpVmNicBandwidthInSpending}}
        </template>
        <template  slot-scope="scope" v-if="windowData.currSelectTab === 'pubIpVmNicBandwidth'">
          {{scope.row.pubIpVipBandwidthInSpending}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('billing.spending')">
        <template slot-scope="scope">
          {{formatCurrency(scope.row.spending)}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.pageCount > 0"
        :current-page="windowData.pageIndex"
        :page-size="5"
        :page-sizes="[5, 10]"
        :total="windowData.pageCount"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"></el-pagination>
    </div>
  </div>
</template>

<script>
  import BillingList from 'src/om/billing/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  export default {
    name: "PublicIpBillingTabList",
    mixins: [BillingList, WindowBase],
    props: {
      param: {
        type: String,
        default: ''
      }
    },
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        billingList: [],
        currbBillingList: [],
        currSelectTab: 'pubIpVmNicBandwidth'
      })
        .then(() => {
          return this.init()
        })
        .then(() => {
          this.chunkList()
        })
    },
    methods: {
      queryList: function () {
      },
      changePageIndex: function () {
      },
      chunkList: function (size = 20) {
        let billingList = _.chunk(this.windowData.pubIpVmNicBandwidthBillingDetails, size)
        if (this.windowData.currSelectTab !== 'pubIpVmNicBandwidth') {
          billingList = _.chunk(this.windowData.pubIpVipBandwidthBillingDetails, size)
        }
        let currbBillingList = billingList[0]
        let count = billingList.length
        this.updateWindow({
          pageCount:  count,
          pageIndex: 1,
          billingList,
          currbBillingList
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      changeTab: function (currSelectTab) {
        const self = this
        if (self.windowData.currSelectTab !== currSelectTab) {
          self.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            billingList: [],
            currbBillingList: [],
            currSelectTab: currSelectTab
          }).then(() => {
            self.init()
              .then(() => {
                self.chunkList()
              })
          })
        }
      },
      init () {
        if (this.param) {
          let dataUuid = this.param
          this.updateWindow({ dataUuid })
          let pubIpVmNicBandwidthBillingDetails = this.sortForLink(this.dbData.billing[dataUuid].pubIpVmNicBandwidthBillingDetails, this.isDeleted)
          let pubIpVipBandwidthBillingDetails = this.sortForLink(this.dbData.billing[dataUuid].pubIpVipBandwidthBillingDetails, this.isDeleted)
          return this.updateWindow({ pubIpVmNicBandwidthBillingDetails, pubIpVipBandwidthBillingDetails })
        }
      },
      openVipDetailPage: function (uuid) {
        this.openSideWindow('VipDetailDialog', {uuid: uuid})
      },
      isDeleted: function (uuid) {
        let result = false
        let vip = this.dbData.vip[uuid]
        let vipA = this.dbData.vipA[uuid]
        result = !vip
        if (vipA && !result) {
          result = !!vipA.isDestroyed
        }
        return result
      },
      isTitle: function (uuid) {
        return _.has(this.dbData.vip, uuid) ? '' : this.$t('billing.hasDeleted')
      },
      ...Utils
    },
    watch: {
      'dbData.vip': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.init()
            .then(() => {
              this.chunkList()
            })
        }
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.init()
            .then(() => {
              this.chunkList()
            })
          this.destroyDialogs()
        }
      },
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.chunkList(val)
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal === undefined || val === oldVal) return
        let currbBillingList = this.windowData.billingList[val - 1]
        this.updateWindow({
          currbBillingList
        })
      }
    }
  }
</script>

<style scoped lang="less">
 .tab-container{
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
    margin-bottom: 20px;
   li{
      display: inline-block;
      padding: 10px 20px;
      border-radius: 2px;
      font-size: 12px;
   }
   .active{
      background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
   }
 }
</style>
