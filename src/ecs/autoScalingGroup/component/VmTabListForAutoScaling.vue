<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col style="text-align: right">
          <span style="display: inline-block;">
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
        </el-col>
      </el-row>
    </div>
    <div>
      <el-table
        :data="itemList">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            <span class="link" @click="openVmDetailPage(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.hostIp')">
          <template slot-scope="scope">
            <table-body-item-list slot="item" :content="getDefaultL3NetworkIp(scope.row.uuid)" copy="true" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('autoScaling.healthStatus')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.vm[scope.row.uuid].healthStatus"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
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
</template>

<script>
  import VmList from 'src/ecs/ecsInstance/List';
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import TableBodyItemList from "../../../component/TableBodyItemList";
  export default {
    name: "VmTabListForAutoScaling",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    mixins: [VmList, WindowBase],
    components: {
      TableBodyItemList,
      TableBodyItemState
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created() {
      let self = this;
      let isSubListOfL3Network = false
      let dataUuid = ''
      if (self.param) {
        if (self.param.isSubListOfL3Network) isSubListOfL3Network = true
        if (self.param.uuid) dataUuid = self.param.uuid
      }
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        isSubListOfL3Network,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        conditionList = conditionList.concat(this.getSearchCondition())
        return conditionList
      },
      openVmDetailPage: function (uuid) {
        if (this.dbData.vm[uuid].type === 'UserVm' && this.dbData.vm[uuid].hypervisorType === 'KVM') this.$router.push({name: 'detailVm', params:{uuid: uuid}})
        if (this.dbData.vm[uuid].type === 'ApplianceVm' && this.dbData.vm[uuid].hypervisorType === 'KVM') '';
        if ((this.dbData.vm[uuid].type === 'ApplianceVm' || this.dbData.vm[uuid].type === 'UserVm') && this.dbData.vm[uuid].hypervisorType === 'ESX') ''
      },
      getSearchCondition () {
        if (this.selectVal !== '' && this.searchStr === '') {
          return `${this.selectVal}~=%25${this.searchStr}`;
        }
        return []
      },
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
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList()
        })
      }
    }
  }
</script>

<style scoped>

</style>
