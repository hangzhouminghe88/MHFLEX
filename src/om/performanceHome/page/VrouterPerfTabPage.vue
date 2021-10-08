<template>
  <div>
    <div class="metric-data">
      <metric-category :param="{data: {
      metricList: [metircName.vrouter.CPUAverageUsedUtilization],
      uuidName: 'VMUuid',
      uuidList: vmUuidList,
      resourceName: 'vm',
      time: param.time,
      metircData: windowData.metircData.CPUAverageUsedUtilization,
      updateFn: queryVMMetricData(metircName.vrouter.CPUAverageUsedUtilization)
    }}"></metric-category>
    </div>
    <div class="line-item">
      <line-list class="line-list" :param="{data: {
        metricList: [metircName.vrouter.MemoryUsedInPercent],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        time: param.time,
        opposite: false,
        metircData: windowData.metircData.MemoryUsedInPercent,
        updateFn: queryVMAverageData([metircName.vrouter.MemoryUsedInPercent])
      }}"></line-list>
      <histogram class="histogram-item"
                 :param="{data: {
        metricList: [metircName.vrouter.DiskAllReadOps, metircName.vrouter.DiskAllWriteOps],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        direction: 'vertical',
        time: param.time,
        fuc: formateValue(metircName.vrouter.DiskAllReadOps.unit),
        metircData: windowData.metircData.DiskAllOps,
        updateFn: queryVMAverageData([metircName.vrouter.DiskAllReadOps, metircName.vrouter.DiskAllWriteOps])
      }}"></histogram>
    </div>
    <div class="line-item">
      <line-list class="line-list" :param="{data: {
        metricList: [metircName.vrouter.MemoryFreeInPercent],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        opposite: true,
        metircData: windowData.metircData.MemoryFreeInPercent,
        updateFn: queryVMAverageData([metircName.vrouter.MemoryFreeInPercent])
      }}"></line-list>
      <histogram class="histogram-item"
                 :param="{data: {
        metricList: [metircName.vrouter.DiskAllReadBytes, metircName.vrouter.DiskAllWriteBytes],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        direction: 'vertical',
        time: param.time,
        fuc: formateValue(metircName.vrouter.DiskAllReadBytes.unit),
        metircData: windowData.metircData.DiskAllBytes,
        updateFn: queryVMAverageData([metircName.vrouter.DiskAllReadBytes, metircName.vrouter.DiskAllWriteBytes])
      }}"></histogram>
    </div>
    <div class="line-item">
      <histogram class="histogram-item" style="margin-right: 20px"
                 :param="{data: {
        metricList: [metircName.vrouter.NetworkOutBytes, metircName.vrouter.NetworkInBytes],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vrouter.NetworkOutBytes.unit),
        metircData: windowData.metircData.NetworkBytes,
        updateFn: queryVMNicAverageData([metircName.vrouter.NetworkOutBytes, metircName.vrouter.NetworkInBytes])
      }}"></histogram>
      <histogram class="histogram-item" style="margin-right: 20px"
                 :param="{data: {
        metricList: [metircName.vrouter.NetworkOutPackets, metircName.vrouter.NetworkInPackets],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vrouter.NetworkOutPackets.unit),
        metircData: windowData.metircData.NetworkPackets,
        updateFn: queryVMNicAverageData([metircName.vrouter.NetworkOutPackets, metircName.vrouter.NetworkInPackets])
      }}"></histogram>
      <histogram class="histogram-item"
                 :param="{data: {
        metricList: [metircName.vrouter.NetworkOutErrors, metircName.vrouter.NetworkInErrors],
        uuidName: 'VMUuid',
        uuidList: vmUuidList,
        resourceName: 'vm',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vrouter.NetworkOutErrors.unit),
        metircData: windowData.metircData.NetworkErrors,
        updateFn: queryVMNicAverageData([metircName.vrouter.NetworkOutErrors, metircName.vrouter.NetworkInErrors])
      }}"></histogram>
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';
  import LineList from "../components/LineList";
  import Histogram from "../components/Histogram";
  import consts from '../consts';
  import MetricCategory from "../components/MetricCategory";
  import MetircName from '../MetricName';
  import PageBase from 'src/windows/PageBase';
  export default {
    name: "VrouterPerfTabPage",
    props: ['param'],
    mixins: [WindowBase, Methods, PageBase],
    components: {
      MetricCategory,
      LineList,
      Histogram
    },
    created: function () {
      this.initWindowMetricData()
      if (this.param.time) this.time = this.param.time
      this.updateWindow({
        methods: {
          queryList: this.queryList
        }
      })
      this.currentZone = localStorage.getItem('currZoneUuid')
      let mainPageWindowId
      Object.keys(this.$store.state.windowManager.windows).forEach((_id) => {
        if (_id.indexOf('MainPage-') > -1) {
          mainPageWindowId = _id
        }
      })
      this._updateWindow({
        id: mainPageWindowId,
        currPageWindowId: this.windowId
      })
      this.queryList()
      if (_.isNull(this.queryInterval)) {
        this.queryInterval = setInterval(this.queryTotalMetricData, consts.refreshInterval)
      }
    },
    mounted: function () {
    },
    destroyed: function () {
      clearInterval(this.queryInterval)
    },
    data () {
      return {
        queryInterval: null,
        metricNames: {
          metricData: [
            MetircName.vrouter.CPUAverageUsedUtilization
          ],
          averageData: [
            MetircName.vrouter.MemoryUsedInPercent,
            MetircName.vrouter.MemoryFreeInPercent
          ],
          multiAverageData: [
            MetircName.vrouter.DiskAllReadOps,
            MetircName.vrouter.DiskAllWriteOps,
            MetircName.vrouter.DiskAllReadBytes,
            MetircName.vrouter.DiskAllWriteBytes
          ],
          multiNicAverageData: [
            MetircName.vrouter.NetworkOutBytes,
            MetircName.vrouter.NetworkInBytes,
            MetircName.vrouter.NetworkOutPackets,
            MetircName.vrouter.NetworkInPackets,
            MetircName.vrouter.NetworkOutErrors,
            MetircName.vrouter.NetworkInErrors
          ]
        },
        multiAverageDataCouples: {
          DiskAllOps: ['DiskAllReadOps', 'DiskAllWriteOps'],
          DiskAllBytes: ['DiskAllReadBytes', 'DiskAllWriteBytes']
        },
        multiNicAverageDataCouples: {
          NetworkBytes: ['NetworkOutBytes', 'NetworkInBytes'],
          NetworkPackets: ['NetworkOutPackets', 'NetworkInPackets'],
          NetworkErrors: ['NetworkOutErrors', 'NetworkInErrors']
        },
        data: {
          'index': 3,
          'namespace': 'ZStack/Host',
          'name': 'DiskAllWriteBytes',
          'unit': 'bytes'
        },
        leftDistance: 0,
        metircName: MetircName,
        vmUuidList: null,
        vrouterUuidList: [],
        l3networkUuidList: [],
        vipUuidList: [],
        host: null,
        resourceName: 'vm'
      }
    },
    methods: {
      queryTotalMetricData: function () {
        // this.queryTotalData(this.metricNames, 'VMUuid', this.vmUuidList, 'vm', this.param.time, this)
        let param = `zoneUuid='${window.localStorage.getItem('currZoneUuid')}' and hypervisorType='KVM' and type='ApplianceVm' and state?='Running'`
        this.queryTotalData(this.metricNames, 'VMUuid', 'vm', 'vmInstance', param, this.param.time, this)
          .then(() => {
            this.$forceUpdate()
          })
      },
      getCurrentTime: function () {
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            this.currTime = resp.currentTime.Seconds
          })
      },
      queryList: function () {
        this.queryTotalMetricData()
        // rpc.query('vm-instances', {
        //   fileds: 'uuid',
        //   q: [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM', 'type=ApplianceVm', 'state?=Running,Stopped']
        // })
        // .then((resp) => {
        //   if (resp.inventories.length > 0) {
        //     let uuidList = resp.inventories.map((item) => item.uuid)
        //     this.vmUuidList = uuidList
        //   } else this.vmUuidList = []
        //   this.queryTotalMetricData()
        // })
      },
      queryVMMetricData: function (item) {
        return (self) => {
          this.queryMetricData([item], 'VMUuid', this.vmUuidList, 'vm', this.param.time, self)
        }
      },
      queryVMAverageData: function (item) {
        if (item.length === 2) {
          return (self) => {
            this.queryMulitiAverageData(item, 'VMUuid', this.vmUuidList, 'vm', this.param.time, self)
          }
        } else {
          return (self) => {
            this.queryAverageValue(item, 'VMUuid', this.vmUuidList, 'vm', this.param.time, self)
          }
        }
      },
      queryVMNicAverageData: function (item) {
        if (item.length === 2) {
          return (self) => {
            this.queryMulitiNicAverageData(item, 'VMUuid', this.vmUuidList, 'vm', this.param.time, self)
          }
        } else {
          return (self) => {
            this.queryNicAverageValue(item, 'VMUuid', this.vmUuidList, 'vm', this.param.time, self)
          }
        }
      }
    },
    watch: {
      'param.time.value': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.queryTotalMetricData()
      }
    }
  }
</script>

<style scoped>
  .page-container .metric-data {
    background: #fff;
    height: 270px;
    width: 100%;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }

  .page-container .line-item {
    width: 100%;
    display: -ms-flexbox;
    display: flex;
    height: 380px;
    margin-top: 20px;
  }

  .metric-data {
    background: #fff;
    height: 270px;
    width: 100%;
    box-shadow: 0 1px 6px 0 #eef5ff;
    border-radius: 4px;
  }
</style>
