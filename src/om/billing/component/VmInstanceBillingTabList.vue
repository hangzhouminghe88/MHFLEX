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
                @click="!isDeleted(scope.row.resourceUuid) && $router.push({name: 'detailVm', params:{uuid: scope.row.resourceUuid}})">
                {{scope.row.resourceName}}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.memorySize')">
        <template slot-scope="scope">
          {{!isDeleted(scope.row.resourceUuid) ? bytesToSize(itemList[scope.row.resourceUuid].memorySize) : ''}}
        </template>
      </el-table-column>
      <el-table-column :label="'CPU'">
        <template slot-scope="scope">
          {{!isDeleted(scope.row.resourceUuid) ? itemList[scope.row.resourceUuid].cpuNum : ''}}
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
  import WindowBase from 'src/windows/Window';
  import BillingList from 'src/om/billing/List';
  import {mapGetters} from 'vuex';
  export default {
    name: "VmInstanceBillingTabList",
    mixins: [WindowBase, BillingList],
    props: {
      param: {
        type: String,
        default: '',
      }
    },
    data(){
      return {
        vmInstanceBillingList: []
      }
    },
    created(){

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
          this.queryVM();
        })
    },
    computed: {
      vmItemList: {
        get(){
          let self = this;
          return self.vmInstanceBillingList;
        },
        set(val){
          this.vmInstanceBillingList = val;
        }
      },
      ...mapGetters({
        get: 'vm/get'
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
    methods: {
      init() {
        let self = this;
        if (self.param) {
          let dataUuid = this.param
          self.updateWindow({ dataUuid })
          let VmInstanceBillingDetails = []
          if(self.dbData.billing[dataUuid])
            VmInstanceBillingDetails = self.sortForLink(self.dbData.billing[dataUuid].VmInstanceBillingDetails, this.isDeleted)
          return self.vmInstanceBillingList = VmInstanceBillingDetails;
        }
      },
      chunkList (size = 20) {
        let billingList = _.chunk(this.vmItemList, size)
        let currbBillingList = billingList[0]
        let count = billingList.length
        this.updateWindow({
          pageCount: count,
          pageIndex: 1,
          billingList,
          currbBillingList
        })
      },
      queryVM(){
        let self = this, p = null, task = [];
        if(self.windowData.currbBillingList)
        self.windowData.currbBillingList.forEach((item) => {
         return p = self.dispatchAction('vm/detailQuery', item.resourceUuid);
        })
        task.push(p);
        return Promise.all(task);
      },
      isDeleted (uuid) {
        let result = false
        let vm = this.itemList[uuid]
        result = !(vm && vm.hypervisorType !== 'ESX')
        if (vm && !result) {
          result = !!vm.isDestroyed
        }
        if(vm && !vm.state){
          result = true;
        }
        return result
      },
      isTitle (uuid) {
        return _.has(this.dbData.vm, uuid) ? '' : this.$t('billing.hasDeleted')
      },
      showDetailDlg(param){
        let self = this;
        self.openDialog('VMBillingDetailDlg', {row: param, itemList: self.itemList})
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
    },
    watch: {
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
