<template>
  <div class="container">
    <el-table
      :data="windowData.currbBillingList">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column :label="$t('common.name')">
        <template slot-scope="scope">
          <span>
            {{scope.row.resourceName}}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('gpuDevice.deviceName')">
        <template slot-scope="scope">

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
    name: "GpuDeviceBillingTabList",
    mixins: [WindowBase, BillingList],
    props: {
      param:{
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
        currbBillingList: []
      })
        .then(() => {
          return this.init()
        })
        .then(() => {
          this.chunkList()
        })
    },
    destroyed: function () {
    },
    updated: function () {
    },
    data () {
      return {
      }
    },
    methods: {
      queryList: function () {
      },
      changePageIndex: function () {
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
      chunkList: function (size = 20) {
        let billingList = _.chunk(this.windowData.gpuBillingDetails, size)
        let currbBillingList = billingList[0]
        let count = billingList.length
        this.updateWindow({
          pageCount: count,
          pageIndex: 1,
          billingList,
          currbBillingList
        })
      },
      getGpuType (uuid) {
        let gpu = this.dbData.pcidevice[uuid]
        if (!gpu) return ''
        if (gpu.type === 'GPU_Video_Controller') {
          return this.$t('gpuDevice.desktopGpu')
        }
        return this.$t('gpuDevice.computeGpu')
      },
      init: function () {
        if (this.param) {
          let dataUuid = this.param
          this.updateWindow({ dataUuid })
          let gpuBillingDetails = this.sortForLink(this.dbData.billing[dataUuid].gpuBillingDetails, this.isDeleted)
          this.updateWindow({ gpuBillingDetails })
          this.updateWindow({ dataUuid })
        }
      },
      isTitle: function (uuid) {
        return _.has(this.dbData.pcidevice, uuid) ? '' : this.$t('billing.hasDeleted')
      },
      ...Utils
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.init()
            .then(() => {
              this.chunkList()
            })
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

<style scoped>

</style>
