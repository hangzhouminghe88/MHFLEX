<template>
  <div class="container">
    <div class="tab-drop">
      <drop-down class="detail-dropdown">
        <span slot="title">{{$t('common.actions')}}</span>
        <span slot="content">
        <div class="dropdown-content">
          <a style="margin-top: 12px;" :class="{'disabled-text':!isSelected || hasOnState('Enabled')}" @click="isSelected && !hasOnState('Enabled') && pageEnable()">{{$t('common.enable')}}</a>
          <a :class="{'disabled-text': !isSelected || hasOnState('Disabled')}" @click="isSelected && !hasOnState('Disabled') && pageDisable()">{{$t('common.disable')}}</a>
          <a style="margin-bottom: 12px" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDetach()">{{$t('common.destroyed')}}</a>
        </div>
      </span>
      </drop-down>
    </div>
    <el-table
      :data="itemList"
      border>
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection" width="55px">
        <template slot-scope="scope"></template>
      </el-table-column>
      <el-table-column :label="$t('pciDevice.deviceName')" prop="description"></el-table-column>
      <el-table-column :label="$t('pciDevice.pciAddress')" prop="pciAddress"></el-table-column>
      <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
      <el-table-column v-if="param.isCluster" :label="$t('common.host')"></el-table-column>
      <el-table-column :label="$t('common.state')">
        <template slot-scope="scope">
          <table-body-item-state :state="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')">
        <template slot-scope="scope">
          <table-body-item-state :state="scope.row.status === 'System' || scope.row.status === 'Active' ? 'Ready' : scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.vm')">
        <template slot-scope="scope">
          {{getVmName(scope.row.uuid) || $t('common.noAttach')}}
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
</template>

<script>
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PciDeviceList from 'src/om/pciDevice/List'
  import WindowBase from 'src/windows/Window';;
  import Utils from 'src/utils/utils'
  export default {
    name: "PciDeviceTabList",
    components: {TableBodyItemState},
    mixins: [MultiSelectList, PciDeviceList, WindowBase],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        },
        conditions: this.param && this.param.conditions ? this.param.conditions : []
      }).then(() => this.queryList())
    },
    updated: function () {
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
        itemList: [],
        selectVal: 'description',
        searchStr: ''
      }
    },
    methods: {
      ...Utils,
    }
  }
</script>

<style scoped>
  .tab-drop{
    display: inline-block;
    position: absolute;
    top: 15px;
    left: 323px;
  }
</style>
