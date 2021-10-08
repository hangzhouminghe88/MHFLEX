<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.performance')}}</span>
        </el-col>
        <el-col :span="22">
          <el-tabs v-model="currTab" @tab-click="changeCurrTab">
            <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
            <el-tab-pane :label="$t('common.vrouterPerf')" name="router"></el-tab-pane>
            <el-tab-pane :label="$t('common.host')" name="host"></el-tab-pane>
            <el-tab-pane :label="$t('common.l3network')" name="l3network"></el-tab-pane>
            <el-tab-pane :label="$t('common.vip')" name="vip"></el-tab-pane>
            <el-tab-pane :label="$t('common.backupstorage')" name="bs"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
         <span class="btn-refresh" @click="refresh()" style="vertical-align: middle">
           <i class="el-icon-refresh" style="font-size: 20px;"></i>
         </span>
          <span class="toolbar-item">
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
         </span>
          <span class="toolbar-item">
           <span style="display: inline-block;margin-left: 30px; margin-right: 10px;">
             <el-radio v-model="instances" label="all" @change="searchAllOrPart('all')">{{$t("perf.all")}}</el-radio>
             <el-radio v-model="instances" label="customize" @change="searchAllOrPart('customize')">{{$t("perf.customize")}}</el-radio>
           </span>
           <span class="btn-primary" style="padding: 0px 30px" :class="{'disabled': instances === 'all'}" @click="instances !== 'all' && openSelectResource()">{{$t("perf.select")}}</span>
         </span>
          <span class="toolbar-item">
           筛选条目：
           <el-select v-model="currLabel"
                      @change="setCurrLabel"
                      style="width: 20%">
             <el-option v-for="(metric, index) in displayMetricListMap[currTab]"
                        :key="index"
                        :label="$t(metric.name)"
                        :value="metric.value"></el-option>
           </el-select>
           <el-select v-model="thresholdSymbol"
                      :disabled="currLabel === 'none'"
                      style="width: 10%"
                      @change="setThresholdSymbol">
             <el-option v-for="(thershold, index) in thersholdSymbolList"
                        :key="index"
                        :label="$t(thershold.name)"
                        :value="thershold.value"></el-option>
           </el-select>
            <input style="width: 100px;background: #fff;" class="numInput" type="text" :class="{'is-error': showErrorMsg}"
                     :placeholder="$t('perf.number')" :disabled="currLabel === 'none'" v-model="thresholdNumStr"
                     @input="onSetThresholdNum($event)"/>
           <span v-if="showFixUnit" class="light-container">{{ unitListByLabelNameMap[currLabel] }}</span>
             <el-select v-model="dropdownUnit"
                        style="width: 10%"
                        v-if="isUnitList(currLabel)">
             <el-option v-for="(unit, index) in unitListByLabelNameMap[currLabel]"
                        :key="index"
                        :label="$t(unit.name)"
                        @click.native="setUnit(unit)"
                        :value="unit.name"></el-option>
           </el-select>
         </span>
          <span class="error-text" v-if="showErrorMsg">{{ $t('perf.errorMsg') }}</span>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right"></div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
        :data="itemList"
       :header-cell-style="setHighLightColumn"
       v-loading="windowData.loading"
       >
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name">
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="['router', 'vm'].includes(currTab)" :column-key="metricName" :label="$t(`perf.${metricName}`)" v-for="(metricName, index) in metricListMap['vm']" :key="index">
          <template slot-scope="scope">
            {{normalizeData(dbData.vmA[scope.row.uuid] ? dbData.vmA[scope.row.uuid][metricName] : undefined,
            metricName)}}
          </template>
        </el-table-column>
        <el-table-column v-if="currTab === 'host'" :column-key="metricName" :label="$t(`perf.${metricName}`)" v-for="(metricName, index) in metricListMap['host']" :key="index">
          <template slot-scope="scope">
            {{normalizeData(dbData.hostA[scope.row.uuid] ? dbData.hostA[scope.row.uuid][metricName] : undefined,
            metricName)}}
          </template>
        </el-table-column>
        <el-table-column v-if="['l3network'].includes(currTab)" :column-key="metricName" :label="$t(`perf.${metricName}`)" v-for="(metricName, index) in metricListMap['l3network']" :key="index" >
          <template slot-scope="scope">
            {{normalizeData(dbData.l3networkA[scope.row.uuid] ? dbData.l3networkA[scope.row.uuid][metricName] : undefined,
            metricName)}}
          </template>
        </el-table-column>
        <el-table-column v-if="['vip'].includes(currTab)" :column-key="metricName" :label="$t(`perf.${metricName}`)" v-for="(metricName, index) in metricListMap['vip']" :key="index">
          <template slot-scope="scope">
            {{normalizeData(dbData.vipA[scope.row.uuid] ? dbData.vipA[scope.row.uuid][metricName] : undefined, metricName)}}
          </template>
        </el-table-column>
        <el-table-column v-if="['bs'].includes(currTab)" :column-key="metricName" :label="$t(`perf.${metricName}`)" v-for="(metricName, index) in metricListMap['bs']" :key="index">
          <template slot-scope="scope">
            {{normalizeData((dbData.bsA && dbData.bsA[scope.row.uuid]) ? dbData.bsA[scope.row.uuid].AvailableCapacityInPercent : undefined, metricName)}}
          </template>
        </el-table-column>
        <el-table-column v-if="currTab === 'vm'" :label="$t('common.owner')" prop="ownerName">
          <template slot-scope="scope">
            {{getResourceOwner(scope.row.uuid)}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.uuidList && windowData.uuidList.length > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.uuidList && windowData.uuidList.length"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import WindowBase from 'src/windows/Window';
  import MultiSelectedList from 'src/windows/Base/MultiSelectList';
  import VmInstanceMethods from 'src/ecs/ecsInstance/Methods';
  import rpc from 'src/utils/rpc';
  import PageBase from 'src/windows/PageBase';
  import Utils from 'src/utils/utils';

  const queryUrlMap = {
    'vm': 'vm-instances',
    'router': 'vm-instances/appliances/virtual-routers',
    'host': 'hosts',
    'bs': 'backup-storage',
    'l3network': 'l3-networks',
    'vip': 'vips',
    'vm-nic': 'vm-instances',
    'router-nic': 'vm-instances/appliances/virtual-routers',
    'host-nic': 'hosts',
    'vm-disk': 'vm-instances',
    'router-disk': 'vm-instances',
    'host-disk': 'hosts'
  }
  const isDeviceLabelMap = {
    'DiskReadBytes': true,
    'DiskWriteBytes': true,
    'DiskReadOps': true,
    'DiskWriteOps': true,
    'DiskUsedCapacityInPercent': true,
    'NetworkInBytes': true,
    'NetworkOutBytes': true,
    'NetworkInPackets': true,
    'NetworkOutPackets': true,
    'NetworkInErrors': true,
    'NetworkOutErrors': true
  }
  const isDiskLabelMap = {
    'DiskReadBytes': true,
    'DiskWriteBytes': true,
    'DiskReadOps': true,
    'DiskWriteOps': true,
    'DiskUsedCapacityInPercent': true
  }
  const isNicLabelMap = {
    'NetworkInBytes': true,
    'NetworkOutBytes': true,
    'NetworkInPackets': true,
    'NetworkOutPackets': true,
    'NetworkInErrors': true,
    'NetworkOutErrors': true
  }
  const isDeviceTabNameMap = {
    'vm-nic': true,
    'router-nic': true,
    'host-nic': true,
    'vm-disk': true,
    'router-disk': true,
    'host-disk': true
  }
  const conditionMap = {
    'vm': ['type=UserVm', 'state!=Destroyed', 'hypervisorType=KVM'],
    'router': ['type=ApplianceVm', 'state!=Destroyed', 'hypervisorType=KVM'],
    'host': ['status=Connected', 'hypervisorType=KVM'],
    'bs': ['type!=VCenter'],
    'l3network': ['l2Network.cluster.hypervisorType=KVM'],
    'vip': [],
    'vm-nic': ['type=UserVm', 'state!=Destroyed', 'hypervisorType=KVM'],
    'router-nic': ['type=ApplianceVm', 'state!=Destroyed', 'hypervisorType=KVM'],
    'host-nic': ['status=Connected', 'hypervisorType=KVM'],
    'vm-disk': ['type=UserVm', 'state!=Destroyed', 'hypervisorType=KVM'],
    'router-disk': ['type=ApplianceVm', 'state!=Destroyed', 'hypervisorType=KVM'],
    'host-disk': ['status=Connected', 'hypervisorType=KVM']
  }
  const vmDisplayMetricList = [
    {name: 'perf.none', value: 'none'},
    {name: 'perf.CPUAverageUsedUtilization', value: 'CPUAverageUsedUtilization'},
    {name: 'perf.MemoryUsedInPercent', value: 'MemoryUsedInPercent'},
    {name: 'perf.DiskAllReadBytes', value: 'DiskAllReadBytes'},
    {name: 'perf.DiskAllWriteBytes', value: 'DiskAllWriteBytes'},
    {name: 'perf.DiskAllReadOps', value: 'DiskAllReadOps'},
    {name: 'perf.DiskAllWriteOps', value: 'DiskAllWriteOps'},
    {name: 'perf.NetworkAllInBytes', value: 'NetworkAllInBytes'},
    {name: 'perf.NetworkAllOutBytes', value: 'NetworkAllOutBytes'},
    {name: 'perf.NetworkAllInPackets', value: 'NetworkAllInPackets'},
    {name: 'perf.NetworkAllOutPackets', value: 'NetworkAllOutPackets'},
    {name: 'perf.NetworkAllInErrors', value: 'NetworkAllInErrors'},
    {name: 'perf.NetworkAllOutErrors', value: 'NetworkAllOutErrors'}
  ]
  const hostDisplayMetricList = [
    {name: 'perf.none', value: 'none'},
    {name: 'perf.CPUAllUsedUtilization', value: 'CPUAllUsedUtilization'},
    {name: 'perf.MemoryUsedInPercent', value: 'MemoryUsedInPercent'},
    {name: 'perf.DiskAllReadBytes', value: 'DiskAllReadBytes'},
    {name: 'perf.DiskAllWriteBytes', value: 'DiskAllWriteBytes'},
    {name: 'perf.DiskAllReadOps', value: 'DiskAllReadOps'},
    {name: 'perf.DiskAllWriteOps', value: 'DiskAllWriteOps'},
    {name: 'perf.DiskAllUsedCapacityInPercent', value: 'DiskAllUsedCapacityInPercent'},
    {name: 'perf.NetworkAllInBytes', value: 'NetworkAllInBytes'},
    {name: 'perf.NetworkAllOutBytes', value: 'NetworkAllOutBytes'},
    {name: 'perf.NetworkAllInPackets', value: 'NetworkAllInPackets'},
    {name: 'perf.NetworkAllOutPackets', value: 'NetworkAllOutPackets'},
    {name: 'perf.NetworkAllInErrors', value: 'NetworkAllInErrors'},
    {name: 'perf.NetworkAllOutErrors', value: 'NetworkAllOutErrors'}
  ]
  const displayMetricListMap = {
    'vm': vmDisplayMetricList,
    'router': vmDisplayMetricList,
    'host': hostDisplayMetricList,
    'bs': [
      {name: 'perf.none', value: 'none'},
      {name: 'perf.AvailableCapacityInPercent', value: 'AvailableCapacityInPercent'}
    ],
    'l3network': [
      {name: 'perf.none', value: 'none'},
      {name: 'perf.UsedIPCount', value: 'UsedIPCount'},
      {name: 'perf.UsedIPInPercent', value: 'UsedIPInPercent'},
      {name: 'perf.AvailableIPCount', value: 'AvailableIPCount'},
      {name: 'perf.AvailableIPInPercent', value: 'AvailableIPInPercent'}
    ],
    'vip': [
      {name: 'perf.none', value: 'none'},
      {name: 'perf.VIPInBoundTrafficInBytes', value: 'VIPInBoundTrafficInBytes'},
      {name: 'perf.VIPInBoundTrafficInPackages', value: 'VIPInBoundTrafficInPackages'},
      {name: 'perf.VIPOutBoundTrafficInBytes', value: 'VIPOutBoundTrafficInBytes'},
      {name: 'perf.VIPOutBoundTrafficInPackages', value: 'VIPOutBoundTrafficInPackages'}
    ],
    'vm-nic': vmDisplayMetricList,
    'router-nic': vmDisplayMetricList,
    'host-nic': hostDisplayMetricList,
    'vm-disk': vmDisplayMetricList,
    'router-disk': vmDisplayMetricList,
    'host-disk': hostDisplayMetricList
  }
  const getMetricList = [
    'CPUAllUsedUtilization',
    'MemoryUsedInPercent',
    'DiskAllReadBytes',
    'DiskAllWriteBytes',
    'NetworkAllInBytes',
    'NetworkAllOutBytes'
  ]
  const getVmMetricList = [
    'CPUAverageUsedUtilization',
    'MemoryUsedInPercent',
    'DiskAllReadBytes',
    'DiskAllWriteBytes',
    'NetworkAllInBytes',
    'NetworkAllOutBytes'
  ]
  const metricListMap = {
    'vm': getVmMetricList,
    'router': getVmMetricList,
    'host': getMetricList,
    'bs': ['AvailableCapacityInPercent'],
    'l3network': [
      'UsedIPCount',
      'UsedIPInPercent',
      'AvailableIPCount',
      'AvailableIPInPercent'
    ],
    'vip': [
      'VIPInBoundTrafficInBytes',
      'VIPInBoundTrafficInPackages',
      'VIPOutBoundTrafficInBytes',
      'VIPOutBoundTrafficInPackages'
    ],
    'vm-nic': getMetricList,
    'router-nic': getMetricList,
    'host-nic': getMetricList,
    'vm-disk': getMetricList,
    'router-disk': getMetricList,
    'host-disk': getMetricList
  }
  const namespaceMap = {
    'vm': 'ZStack/VM',
    'router': 'ZStack/VM',
    'host': 'ZStack/Host',
    'bs': 'ZStack/BackupStorage',
    'l3network': 'ZStack/L3Network',
    'vip': 'ZStack/VIP',
    'vm-nic': 'ZStack/VM',
    'router-nic': 'ZStack/VM',
    'host-nic': 'ZStack/Host',
    'vm-disk': 'ZStack/VM',
    'router-disk': 'ZStack/VM',
    'host-disk': 'ZStack/Host'
  }
  const uuidNameMap = {
    'vm': 'VMUuid',
    'router': 'VMUuid',
    'host': 'HostUuid',
    'bs': 'BackupStorageUuid',
    'l3network': 'L3NetworkUuid',
    'vip': 'VipUUID',
    'vm-nic': 'VMUuid',
    'router-nic': 'VMUuid',
    'host-nic': 'HostUuid',
    'vm-disk': 'VMUuid',
    'router-disk': 'VMUuid',
    'host-disk': 'HostUuid'
  }
  const deviceLetterNameMap = {
    'vm-nic': 'NetworkDeviceLetter',
    'router-nic': 'NetworkDeviceLetter',
    'host-nic': 'NetworkDeviceLetter',
    'vm-disk': 'DiskDeviceLetter',
    'router-disk': 'DiskDeviceLetter',
    'host-disk': 'DiskDeviceLetter'
  }
  const dbDataTableNameMap = {
    'vm': 'vm',
    'router': 'vm',
    'host': 'host',
    'bs': 'bs',
    'l3network': 'l3network',
    'vip': 'vip',
    'vm-nic': 'vmDeviceForPerf',
    'router-nic': 'vmDeviceForPerf',
    'host-nic': 'hostDeviceForPerf',
    'vm-disk': 'vmDeviceForPerf',
    'router-disk': 'vmDeviceForPerf',
    'host-disk': 'hostDeviceForPerf'
  }
  const deviceHostTableNameMap = {
    'vm-nic': 'vm',
    'router-nic': 'vm',
    'host-nic': 'host',
    'vm-disk': 'vm',
    'router-disk': 'vm',
    'host-disk': 'host'
  }
  const dbDataAdditionTableNameMap = {
    'vm': 'vmA',
    'router': 'vmA',
    'host': 'hostA',
    'bs': 'bsA',
    'l3network': 'l3networkA',
    'vip': 'vipA'
  }
  const byteSecondUnitList = [
    {
      name: 'GB/s',
      size: 1024 * 1024 * 1024
    },
    {
      name: 'MB/s',
      size: 1024 * 1024
    },
    {
      name: 'KB/s',
      size: 1024
    },
    {
      name: 'B/s',
      size: 1
    }
  ]
  const loadingInterval = 200
  const debounceInterval = 300
  export default {
    name: "PerformancePage",
    mixins: [MultiSelectedList, WindowBase, PageBase],
    components: {
      PageTemplate,
      DropDown,
    },
    data() {
      return {
        currTab: 'vm',
        displayMetricListMap: displayMetricListMap,
        currLabel: 'none',
        thresholdSymbol: 'greaterEqual',
        instances: "all",
        thersholdSymbolList: [
          {name: 'common.greaterEqual', value: 'greaterEqual'},
          {name: 'common.lessEqual', value: 'lessEqual'}
        ],
        useThreshold: '',
        realUuidList: [],
        unitListByLabelNameMap: {
          'none': '',
          'CPUAllUsedUtilization': '%',
          'CPUAverageUsedUtilization': '%',
          'MemoryUsedInPercent': '%',
          'DiskAllReadBytes': byteSecondUnitList,
          'DiskAllWriteBytes': byteSecondUnitList,
          'DiskAllReadOps': 'ops',
          'DiskAllWriteOps': 'ops',
          'DiskReadBytes': byteSecondUnitList,
          'DiskWriteBytes': byteSecondUnitList,
          'DiskReadOps': 'ops',
          'DiskWriteOps': 'ops',
          'DiskUsedCapacityInPercent': '%',
          'DiskAllUsedCapacityInPercent': '%',
          'NetworkInBytes': byteSecondUnitList,
          'NetworkOutBytes': byteSecondUnitList,
          'NetworkInPackets': 'pps',
          'NetworkOutPackets': 'pps',
          'NetworkInErrors': 'pps',
          'NetworkOutErrors': 'pps',
          'NetworkAllInBytes': byteSecondUnitList,
          'NetworkAllOutBytes': byteSecondUnitList,
          'NetworkAllInPackets': 'pps',
          'NetworkAllOutPackets': 'pps',
          'NetworkAllInErrors': 'pps',
          'NetworkAllOutErrors': 'pps',
          'AvailableCapacityInPercent': '%',
          'UsedIPCount': '',
          'UsedIPInPercent': '%',
          'AvailableIPCount': '',
          'AvailableIPInPercent': '%',
          'VIPInBoundTrafficInBytes': byteSecondUnitList,
          'VIPInBoundTrafficInPackages': 'pps',
          'VIPOutBoundTrafficInBytes': byteSecondUnitList,
          'VIPOutBoundTrafficInPackages': 'pps'
        },
        dropdownUnit: '',
        showErrorMsg: false,
        thresholdNumStr: '',
        date: new Date(),
        start_time: "",
        end_time: '',
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
        itemList: [],
        metricListMap: metricListMap,
        selectFnMap: {
          'vm': this.openAddVmPanel,
          'router': this.openAddRouterPanel,
          'host': this.openAddHostPanel,
          'bs': this.openAddBsPanel,
          'l3network': this.openAddL3NetworkPanel,
          'vip': this.openAddVIPPanel,
          'vm-nic': this.openAddVmPanel,
          'router-nic': this.openAddRouterPanel,
          'vm-disk': this.openAddVmPanel,
          'router-disk': this.openAddRouterPanel,
          'host-nic': this.openAddHostPanel,
          'host-disk': this.openAddHostPanel
        },
        realDeviceHostUuidList: [],
        showAllInstances: true,
      }
    },
    created() {
      let self = this;
      self.stop = VmInstanceMethods.methods.stop.bind(this)
      self.filterHandler = _.debounce(() => {
        self.displayLoading()
        self.queryResourceByRealUuidList(this.realUuidList, this.currTab)
      }, debounceInterval)
      self.getCurrTime()
        .then(() => {
          self.updateWindow({
            IntervalIndex: 0,
            pageSizeIndex: 0,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            currItemUuid: '',
            sortBy: 'CPUAverageUsedUtilization',
            sortDirection: '-',
            loading: false,
            methods: {
              queryList: this.queryList
            }
          }).then(() => {
            this.queryList()
          })
        })
    },
    computed: {
      start_at: {
        get() {
          let self = this;
          return new Date(self.start_time);
        },
        set(val) {
          let self = this;
          self.start_time = val;
        }
      },
      end_at: {
        get() {
          let self = this;
          return new Date(self.end_time);
        },
        set(val) {
          let self = this;
          self.end_time = val;
        }
      },
      showFixUnit() {
        if (this.currLabel === 'none') return false
        if (this.isUnitList(this.currLabel)) return false
        if (this.unitListByLabelNameMap[this.currLabel] === '') return false
        return true
      },
    },
    methods: {
      ...Utils,
      //设置列高亮
      setHighLightColumn(row){
        let self = this;
        if(row.column.columnKey && row.column.columnKey === self.currLabel){
          return {
            'background': '#00c1de!important',
            'color': '#fff'
          }
        }
        return '';
      },
      //设置当前label
      setCurrLabel(newLabel) {
        this.thresholdNumStr = ''
        this.showErrorMsg = false
        if (this.isUnitList(newLabel)) {
          this.dropdownUnit = this.unitListByLabelNameMap[newLabel][1].name;
          this.currUnit = this.unitListByLabelNameMap[newLabel][1]
        } else {
          this.currUnit = null
        }
        if (isDeviceLabelMap[newLabel]) {
          let rawCurrTab = this.currTab.split('-')[0]
          let newTabName
          if (isNicLabelMap[newLabel]) {
            newTabName = rawCurrTab + '-nic'
          } else if (isDiskLabelMap[newLabel]) {
            newTabName = rawCurrTab + '-disk'
          } else {
            console.error('Wrong label!')
          }
          if (newTabName !== this.currTab) {
            this.changeCurrTab(newTabName, newLabel)
          } else {
            this.currLabel = newLabel
            this.queryList()
          }
        } else if (isDeviceLabelMap[this.currLabel] && !isDeviceLabelMap[newLabel]) {
          this.changeCurrTab(this.currTab.split('-')[0], newLabel)
        } else {
          if (newLabel === 'none') {
            this.useThreshold = false
            this.thresholdNumStr = ''
          }
          this.currLabel = newLabel
          this.queryList()
        }
      },
      //获得当前时间
      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.currTime = resp.currentTime.MillionSeconds
            self.end_time = resp.currentTime.MillionSeconds
            self.start_time = self.end_time - 60 * 1000
            return new Promise((resolve, reject) => {
              resolve()
            })
          })
      },
      //查询列表数据
      queryList() {
        let self = this;
        if (!isDeviceTabNameMap[self.currTab]) {
          self.queryPageData(self.currTab)
        } else {
          self.queryDevicePageData(self.currTab)
        }
      },
      //查询驱动
      queryDevicePageData (resourceType) {
        let queryObj = {
          start: 0,
          limit: 1000,
          replyWithCount: true,
          fields: 'uuid,name'
        }
        if (this.currTab.indexOf('router') === 0) {
          queryObj.fields += ',type,applianceVmType'
        }
        if (this.instances === 'all') {
          queryObj.q = conditionMap[resourceType]
        } else {
          queryObj.q = [`uuid?=${this.realDeviceHostUuidList.join(',')}`]
        }
        return rpc.query(queryUrlMap[resourceType], queryObj).then((resp) => {
          this.realDeviceHostUuidList = resp.inventories.map((item) => item.uuid)
          return this.updateDbTable({
            tableName: deviceHostTableNameMap[resourceType],
            list: resp.inventories
          })
        }).then(() => {
          return this.queryNicPageDataByUuidList(resourceType, this.realDeviceHostUuidList)
        })
      },
      queryNicPageDataByUuidList (resourceType, uuidList) {
        let endTime = Math.round(this.end_at / 1000)
        let startTime = Math.round(this.start_at / 1000)
        let metricList = metricListMap[resourceType].concat([this.currLabel])
        let script = `
def metricList = ["${metricList.join('","')}"]
def tmp
metricList.each{ metricName ->
  tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${namespaceMap[resourceType]}", "metricName": "' + metricName + '", "startTime":${startTime}, "endTime":${endTime}, "labels": ["${uuidNameMap[resourceType]}=~${uuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidNameMap[resourceType]}\\\\")"]}')
  put(metricName, tmp.result)
}
`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then((resp) => {
          // console.error(resp)
          let tableObj = this.createDeviceData(resp.result, resourceType, this.currLabel)
          this.realUuidList = Object.keys(tableObj)
          // console.error(tableObj)
          return this.updateDbObject({
            name: dbDataTableNameMap[resourceType],
            data: tableObj
          })
        })
          .then(() => {
            return this.queryResourceByRealUuidList(this.realUuidList, resourceType)
          })
      },

      changeCurrTab: function (e, event, defaultLabel) {
        let self = this;
        self.itemList = [];
        self.showErrorMsg = false;
        self.instances = 'all';
        self.getCurrTime()
          .then(() => {
            self.currTab = e.name;
            self.thresholdSymbol = 'greaterEqual';
            if (!defaultLabel) {
              self.currLabel = displayMetricListMap[self.currTab][0].value;
            } else {
              self.currLabel = defaultLabel
            }
            if (self.isUnitList(this.currLabel)) {
              self.currUnit = this.unitListByLabelNameMap[self.currLabel][1]
            } else {
              self.currUnit = null
            }
            self.useThreshold = false
            self.thresholdNumStr = ''
            return self.updateWindow({
              currItemUuid: '',
              pageIndex: 1,
              pageCount: 1,
              pageSize: 20,
              sortBy: displayMetricListMap[self.currTab][1],
              sortDirection: '-',
              table: {},
              uuidList: []
            })
          }).then(() => {
          this.queryList()
        })
      },
      setUnit(newUnit) {
        let self = this;
        this.currUnit = newUnit
        this.thresholdNum = this.getThresholdNum() * self.currUnit.size
        this.queryList()
      },
      isUnitList(currLabel) {
        let self = this;
        if (self.unitListByLabelNameMap[currLabel] === undefined) return false
        return typeof self.unitListByLabelNameMap[currLabel] !== 'string'
      },
      queryPageData(resourceType) {
        let queryObj = {
          start: 0,
          limit: 1000,
          replyWithCount: true,
          fields: 'uuid,name'
        }
        if (resourceType === 'router') {
          queryObj.fields += ',type,applianceVmType'
        }
        if (this.instances === 'all') {
          let condition = []
          if (resourceType !== 'bs' && resourceType !== 'vip') {
            condition = condition.concat(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
          }
          if (resourceType === 'l3network') {
            condition = condition.concat('l2Network.cluster.hypervisorType=KVM')
          }
          if (resourceType === 'bs') {
            condition = condition.concat('type!=VCenter')
          }
          if (resourceType === 'bs' && this.dbData.common.platformAdminRelatedZones) {
            condition = condition.concat(`zone.uuid=${window.localStorage.getItem('currZoneUuid')}`)
          }
          if (resourceType === 'vip' && this.dbData.common.platformAdminRelatedZones) {
            condition = condition.concat(`l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
          }
          if (conditionMap[resourceType].length > 0) {
            condition = condition.concat(conditionMap[resourceType])
          }
          queryObj.q = condition
        } else {
          queryObj.q = [`uuid?=${this.realUuidList.join(',')}`]
        }
        rpc.query(queryUrlMap[resourceType], queryObj).then((resp) => {
          this.realUuidList = resp.inventories.map((item) => item.uuid)
          this.updateDbTable({
            tableName: dbDataTableNameMap[resourceType],
            list: resp.inventories
          })
        }).then(() => {
          this.queryPageDataByRealUuidList(resourceType, this.realUuidList)
        })
      },
      queryPageDataByRealUuidList(resourceType) {
        // let relativeTime = '1m'
        let endTime = Math.round(this.end_at.getTime() / 1000)
        let startTime = Math.round(this.start_at.getTime() / 1000)
        // let timePointInterval = this.getTimePointInterval(relativeTime)
        // let timePointInterval = 30
        let metricList = metricListMap[resourceType]
        if (this.currLabel !== 'none') {
          metricList = metricList.concat([this.currLabel])
        }
        let script = `
def metricList = ["${metricList.join('","')}"]
def tmp
metricList.each{ metricName ->
  tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${namespaceMap[resourceType]}", "metricName": "' + metricName + '", "startTime":${startTime}, "endTime":${endTime}, "labels": ["${uuidNameMap[resourceType]}=~${this.realUuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidNameMap[resourceType]}\\\\")"]}')
  put(metricName, tmp.result)
}
`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then((resp) => {
          // console.error(resp)
          let AObj = {}
          metricList.forEach(metricName => {
            this.mergeMetricData(resp.result, metricName, uuidNameMap[resourceType], AObj)
          })
          // Only display aviable uuids
          this.realUuidList = Object.keys(AObj)
          return this.updateDbObject({
            name: dbDataAdditionTableNameMap[resourceType],
            data: AObj
          })
        })
          .then(() => {
            return this.queryResourceByRealUuidList(this.realUuidList, resourceType)
          })
      },
      queryResourceByRealUuidList(realUuidList, resourceType) {
        this.itemList = [];
         this.windowData.loading = true;
        realUuidList = this.sortUuidList(realUuidList, this.windowData.sortBy, this.windowData.sortDirection)
        let uuidList = this.getCurrentPageUuidList(realUuidList)
        let condition = []
        if (resourceType !== 'bs' && resourceType !== 'vip') {
          condition = condition.concat(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        }
        if (conditionMap[resourceType].length > 0) {
          condition = condition.concat(conditionMap[resourceType])
        }
        condition = condition.concat(`uuid?=${uuidList.join(',')}`)
        return rpc.query(queryUrlMap[resourceType], {
          start: 0,
          limit: 1000,
          replyWithCount: true,
          q: condition
        }).then((resp) => {
          return this.updateDbTable({
            tableName: dbDataTableNameMap[resourceType],
            list: resp.inventories
          })
        }).then(() => {
          if (resourceType === 'vm') return rpc.getResourceAccount(uuidList, this)
          else return new Promise((resolve, reject) => {
            resolve()
          })
        }).then(() => {
          let table = {}
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          let pageCount = this.getPageCount(realUuidList)
          return this.updateWindow({
            table,
            uuidList,
            pageCount
          })
        }).then(() => {
          this.itemList = this.getItem(resourceType);
          this.windowData.loading = false;
        })
      },
      getItem(resourceType) {
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData[dbDataTableNameMap[resourceType]][uuid];
        })
      },
      setThresholdSymbol(thresholdSymbol) {
        this.useThreshold = true
        this.thresholdSymbol = thresholdSymbol
        this.displayLoading()
        this.queryResourceByRealUuidList(this.realUuidList, this.currTab)
      },
      mergeMetricData(result, metricName, labelName, obj) {
        result[metricName].data.forEach(it => {
          if (!obj[it.labels[labelName]]) obj[it.labels[labelName]] = {}
          obj[it.labels[labelName]][metricName] = it.value
        })
      },
      displayLoading() {
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, loadingInterval)
      },
      getPageCount(realUuidList) {
        if (this.useThreshold) {
          let uuidList = this.filterUuidListByTreashold(realUuidList, this.currLabel, this.thresholdSymbol, this.getThresholdNum())
          return Math.ceil(uuidList.length / this.windowData.pageSize)
        }
        return Math.ceil(realUuidList.length / this.windowData.pageSize)
      },
      filterUuidListByTreashold(realUuidList, labelName, thresholdSymbol, thresholdNum) {
        let self = this
        let table
        if (isDeviceTabNameMap[self.currTab]) {
          table = self.dbData[dbDataTableNameMap[self.currTab]]
        } else {
          table = self.dbData[dbDataAdditionTableNameMap[self.currTab]]
        }
        let uuidList = realUuidList.filter(uuid => {
          if (!table[uuid]) return false
          let result = false
          if (thresholdSymbol === 'greaterEqual') {
            result = table[uuid][labelName] >= thresholdNum
          } else {
            result = table[uuid][labelName] <= thresholdNum
          }
          return result
        })
        return uuidList
      },
      getThresholdNum() {
        let numStr = this.thresholdNumStr.trim()
        if (numStr === '') numStr = '0'
        let num = parseFloat(numStr)
        if (this.isUnitList(this.currLabel)) {
          num = num * this.currUnit.size
        }
        return num
      },
      handleChangeDate(value) {
        let self = this;
        if (Date.parse(self.start_at) > Date.parse(self.end_at)) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },
      sortUuidList(uuidList, sortBy, sortDirection) {
        // name already sorted by server
        // if (sortBy === 'name') return uuidList
        let self = this
        let table
        if (sortBy === 'name' || isDeviceTabNameMap[self.currTab]) {
          table = self.dbData[dbDataTableNameMap[self.currTab]]
        } else {
          table = self.dbData[dbDataAdditionTableNameMap[self.currTab]]
        }
        return uuidList.sort((uuid1, uuid2) => {
          let it1 = table[uuid1]
          let it2 = table[uuid2]
          if (it1 === undefined && it2 === undefined) return 0
          if (it1 === undefined) return 1
          if (it2 === undefined) return -1
          if (it1[sortBy] === it2[sortBy]) {
            return 0
          }
          let result = false
          if (it1[sortBy] > it2[sortBy]) {
            result = true
          }
          if (sortDirection === '-') {
            result = !result
          }

          return result ? 1 : -1
        })
      },
      getCurrentPageUuidList(realUuidList) {
        let pageSize = this.windowData.pageSize
        let pageIndex = this.windowData.pageIndex - 1
        let uuidList = realUuidList
        if (this.useThreshold) {
          uuidList = this.filterUuidListByTreashold(realUuidList, this.currLabel, this.thresholdSymbol, this.getThresholdNum())
        }
        return uuidList.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      },
      //阈值输入框
      onSetThresholdNum($event) {
        this.thresholdNumStr = $event.target.value.trim()
        if (this.thresholdNumStr === '') {
          this.useThreshold = false
          this.showErrorMsg = false
        } else {
          this.useThreshold = true
          if (!Utils.isNumber(this.thresholdNumStr) || parseFloat(this.thresholdNumStr) < 0) {
            this.showErrorMsg = true
          } else {
            this.showErrorMsg = false
          }
        }
        this.filterHandler()
      },
      //获得所有者
      getResourceOwner: function (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.resourceOwner[uuid].name
          if (self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName) {
            value = self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName
          }
        } catch (e) {
        }
        return value
      },
      //资源占用率
      normalizeData(data, labelName) {
        if (data === undefined) return this.$t('common.noData')
        let percent = {
          'CPUAllUsedUtilization': true,
          'CPUAverageUsedUtilization': true,
          'MemoryUsedInPercent': true,
          'DiskUsedCapacityInPercent': true,
          'DiskAllUsedCapacityInPercent': true,
          'AvailableCapacityInPercent': true,
          'AvailableIPInPercent': true,
          'UsedIPInPercent': true
        }
        if (percent[labelName]) {
          data = parseInt(data * 100) / 100
          return `${data} %`
        }
        let speed = {
          'DiskReadBytes': true,
          'DiskWriteBytes': true,
          'NetworkInBytes': true,
          'NetworkOutBytes': true,
          'DiskAllReadBytes': true,
          'DiskAllWriteBytes': true,
          'NetworkAllInBytes': true,
          'NetworkAllOutBytes': true,
          'VIPInBoundTrafficInBytes': true,
          'VIPOutBoundTrafficInBytes': true
        }
        if (speed[labelName]) {
          data = Utils.bytesToSize(data)
          return `${data}/s`
        }
        let pps = {
          'NetworkOutPackets': true,
          'NetworkInPackets': true,
          'NetworkOutErrors': true,
          'NetworkInErrors': true,
          'NetworkAllInPackets': true,
          'NetworkAllOutPackets': true,
          'NetworkAllInErrors': true,
          'NetworkAllOutErrors': true,
          'VIPInBoundTrafficInPackages': true,
          'VIPOutBoundTrafficInPackages': true
        }
        if (pps[labelName]) {
          return Utils.bytesToSize(data, 'pps')
        }
        let roundToInt = {
          'DiskAllReadOps': true,
          'DiskAllWriteOps': true,
          'UsedIPCount': true,
          'AvailableIPCount': true
        }
        if (roundToInt[labelName]) {
          data = parseInt(data)
        }
        return data
      },
      goToDetail(uuid){
        let self = this, routeParam = '';
        switch (self.currTab) {
          case 'vm':
            routeParam = 'detailVm';
            break;
          case 'router':
            switch(self.dbData.vm[uuid].applianceVmType){
              case "vrouter":
                routeParam = 'detailVirtualRouter';
                break;
              case "vpcvrouter":
                routeParam = 'detailVpcVRouter';
                break;
            }
            break;
          case 'host':
            routeParam = 'detailHost'
            break;
          case 'l3network':
            routeParam = 'detaill3network'
            break;
          case 'vip':
            routeParam = 'detailvip'
            break;
          case 'bs':
            routeParam = 'detailbackupstorage'
            break;
        }
        self.$router.push({name: routeParam, params:{uuid}});
      },
      openSelectResource(){
        let self = this;
        self.selectFnMap[self.currTab]();
      },
      openAddVmPanel: function () {
        this.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: ['zoneUuid=' + window.localStorage.getItem('currZoneUuid')].concat(conditionMap[this.currTab]),
          select: this.AddResourceList
        })
      },
      openAddRouterPanel: function () {
        this.openDialog('VirtualRouterListMultiSelectDlg', {
          title: this.$t('common.selectRouter'),
          conditions: ['zoneUuid=' + window.localStorage.getItem('currZoneUuid')].concat(conditionMap[this.currTab]),
          ok: this.AddResourceList
        })
      },
      openAddHostPanel: function () {
        this.openDialog('HostListMultiSelectDlg', {
          conditions: ['zoneUuid=' + window.localStorage.getItem('currZoneUuid')].concat(conditionMap[this.currTab]),
          select: this.AddResourceList
        })
      },
      openAddBsPanel: function () {
        this.openDialog('BackupStorageListMultiSelectListDlg', {
          conditions: conditionMap[this.currTab],
          select: this.AddResourceList
        })
      },
      openAddL3NetworkPanel: function () {
        this.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: conditionMap[this.currTab],
          select: this.AddResourceList
        })
      },
      openAddVIPPanel: function () {
        this.openDialog('VIPMultiSelectList', {
          conditions: conditionMap[this.currTab],
          ok: this.AddResourceList
        })
      },
      AddResourceList (uuidList) {
        if (isDeviceTabNameMap[this.currTab]) {
          this.realDeviceHostUuidList = uuidList
        } else {
          this.realUuidList = uuidList
        }
        this.queryList()
      },
      searchAllOrPart(e){
        this.instances = e;
        this.queryList()
      }
    }
  }
</script>

<style scoped lang="less">
  .detail-dropdown {
    position: relative;
    height: 25px;
    line-height: 25px;
    padding: 8px 25px 5px 0px;
    display: inline-block;
    margin-right: -4px;
    width: auto;
  }

  .detail-dropdown > .item.dropdown-container {
    width: 120px !important;

    .dropdown-container {
      font-size: 12px;
    }
  }

  .toolbar-item {
    display: inline-block;
  }

  .light-container {
    display: inline-block;
    border: 1px solid #dae0e6;
    padding: 2px 20px;
    margin-left: -2px;
    border-radius: 0px;
    height: 34px;
  }

  .high-column{
    background: #409EFF!important;
  }
@-moz-document url-prefix() {
  .numInput{
    width: 100px;
    background: rgb(255, 255, 255) none repeat scroll 0% 0%;
    position: relative;
    top: -2px;
  }
}
</style>
