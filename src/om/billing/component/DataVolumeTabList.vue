<template>
  <div class="container">
    <el-table
      :data="windowData.currbBillingList">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column :label="$t('common.name')">
        <template slot-scope="scope">
          <span :class="{'link': !isDeleted(scope.row.resourceUuid)}"
                @click="!isDeleted(scope.row.resourceUuid) && $router.push({name: 'detailVolume', params:{uuid: scope.row.resourceUuid}})">
                {{scope.row.resourceName}}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.size')">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.size)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('billing.spending')">
        <template slot-scope="scope">
          {{formatCurrency(scope.row.spending)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('billing.detail').replace(/计费/g, '')">
        <template slot-scope="scope">
          <span :class="{'link': itemList[scope.row.resourceUuid], 'disabled-text': !itemList[scope.row.resourceUuid]}"
                @click="showDetailDlg(scope.row)">{{$t('billing.detail').replace(/计费/g, '')}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.pageCount > 0 "
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
  import {mapGetters} from 'vuex';
  export default {
    name: "DataVolumeTabList",
    mixins: [WindowBase, BillingList],
    props: {
      param: {
        type: String,
        default: ''
      }
    },
    computed: {
      ...mapGetters({
        get: 'volume/get'
      }),
      itemList(){
        let self = this, Obj ={};
        for(let item of self.windowData.currbBillingList){
          Object.assign(Obj, {
            [item.resourceUuid]: self.get(item.resourceUuid)
          });
        }
        return Obj;
      }
    },
    created () {
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
        .then(() => {
          this.queryVolume();
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
      chunkList (size = 20) {
        let billingList = _.chunk(this.windowData.dataVolumeBillingDetails, size)
        let currbBillingList = billingList[0]
        let count = billingList.length
        this.updateWindow({
          pageCount: count,
          pageIndex: 1,
          billingList,
          currbBillingList
        })
      },
      init: function () {
        if (this.param) {
          let dataUuid = this.param
          this.updateWindow({ dataUuid })
          let dataVolumeBillingDetails = this.sortForLink(this.dbData.billing[dataUuid].dataVolumeBillingDetails, this.isDeleted)
          this.updateWindow({ dataVolumeBillingDetails })
          this.updateWindow({ dataUuid })
        }
      },
      openVolumeDetailPage (uuid) {
        let detailPage = this.dbData.volume[uuid].format === 'vmtx' ? 'vCenterVolumeDetailDlg' : 'VolumeDetailDlg'
        this.openSideWindow(detailPage, { uuid: uuid })
      },
      isDeleted: function (uuid) {
        let result = false
        let volumeA = this.itemList[uuid];
        if (volumeA) {
          result = !!volumeA.isDestroyed
        }else{
          result = true;
        }
        return result
      },
      isTitle: function (uuid) {
        return _.has(this.dbData.volume, uuid) ? '' : this.$t('billing.hasDeleted')
      },
      queryVolume(){
        let self = this, p = null, task = [];
        self.windowData.currbBillingList.forEach((item) => {
           p = self.dispatchAction('volume/query', item.resourceUuid);
        })
        task.push(p);
        return Promise.all(task);
      },
      showDetailDlg(param){
        let self = this;
        if(self.itemList[param.resourceUuid])
        self.openDialog('VMBillingDetailDlg', {row: param, itemList: self.itemList})
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
