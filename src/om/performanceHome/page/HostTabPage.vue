<template>
  <div>
    <div class="metric-data">
      <metric-category  :param="{data: {
      metricList: [metircName.host.CPUAllUsedUtilization],
      uuidName: 'HostUuid',
      uuidList: hostUuidList,
      resourceName: 'host',
      time: param.time,
      updateFn: queryHostMetricData(metircName.host.CPUAllUsedUtilization),
      metircData: windowData.metircData.CPUAllUsedUtilization
    }}"/>
    </div>
    <div class="line-item">
      <line-list
      :param="{
      data: {
        metricList: [metircName.host.MemoryUsedInPercent],
        uuidName: 'HostUuid',
        uuidList: hostUuidList,
        resourceName: 'host',
        time: param.time,
        opposite: false,
        updateFn: queryHostAverageData([metircName.host.MemoryUsedInPercent]),
        metircData: windowData.metircData.MemoryUsedInPercent
      }
      }"/>
      <histogram
       :param="{data: {
       metricList: [metircName.host.DiskAllReadOps, metircName.host.DiskAllWriteOps],
       uuidName: 'HostUuid',
       uuidList: hostUuidList,
       resourceName: 'host',
       direction: 'vertical',
       time: param.time,
       fuc: formateValue(metircName.host.DiskAllReadOps.unit),
       updateFn: queryHostAverageData([metircName.host.DiskAllReadOps, metircName.host.DiskAllWriteOps]),
       metircData: windowData.metircData.DiskAllOps
      }}"></histogram>
    </div>
    <div class="line-item">
      <line-list :param="{data: {
        metricList: [metircName.host.DiskAllUsedCapacityInPercent],
        uuidName: 'HostUuid',
        time: param.time,
        uuidList: hostUuidList,
        resourceName: 'host',
        opposite: false,
        updateFn: queryHostAverageData([metircName.host.DiskAllUsedCapacityInPercent]),
        metircData: windowData.metircData.DiskAllUsedCapacityInPercent
      }}"></line-list>
      <histogram class="histogram-item"
        :param="{data: {
        metricList: [metircName.host.DiskAllReadBytes, metircName.host.DiskAllWriteBytes],
        uuidName: 'HostUuid',
        uuidList: hostUuidList,
        resourceName: 'host',
        direction: 'vertical',
        time: param.time,
        fuc: formateValue(metircName.host.DiskAllReadBytes.unit),
        updateFn: queryHostAverageData([metircName.host.DiskAllReadBytes, metircName.host.DiskAllWriteBytes]),
        metircData: windowData.metircData.DiskAllBytes
      }}"></histogram>
    </div>
    <div class="line-item" style="height: 400px;">
      <histogram class="histogram-item" style="margin-right: 20px"
                 :param="{data: {
        metricList: [metircName.host.NetworkOutBytes, metircName.host.NetworkInBytes],
        uuidName: 'HostUuid',
        uuidList: hostUuidList,
        resourceName: 'host',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.host.NetworkOutBytes.unit),
        updateFn: queryHostNicAverageData([metircName.host.NetworkOutBytes, metircName.host.NetworkInBytes]),
        metircData: windowData.metircData.NetworkBytes
      }}"></histogram>
      <histogram class="histogram-item" style="margin-right: 20px"
                 :param="{data: {
        metricList: [metircName.host.NetworkOutPackets, metircName.host.NetworkInPackets],
        uuidName: 'HostUuid',
        uuidList: hostUuidList,
        resourceName: 'host',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.host.NetworkOutPackets.unit),
        updateFn: queryHostNicAverageData([metircName.host.NetworkOutPackets, metircName.host.NetworkInPackets]),
        metircData: windowData.metircData.NetworkPackets
      }}"></histogram>
      <histogram class="histogram-item"
                 :param="{data: {
        metricList: [metircName.host.NetworkOutErrors, metircName.host.NetworkInErrors],
        uuidName: 'HostUuid',
        uuidList: hostUuidList,
        resourceName: 'host',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.host.NetworkOutErrors.unit),
        updateFn: queryHostNicAverageData([metircName.host.NetworkOutErrors, metircName.host.NetworkInErrors]),
        metircData: windowData.metircData.NetworkErrors
      }}"></histogram>
    </div>
  </div>
</template>

<script>
  import LineList from "../components/LineList";
  import Histogram from "../components/Histogram";
  import WindowBase from 'src/windows/Window';
  import MetircName from '../MetricName';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';
  import consts from '../consts';
  import MetricCategory from "../components/MetricCategory";
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "HostTabPage",
    mixins: [Methods, WindowBase, PageBase],
    props: ['param'],
    components: {MetricCategory, Histogram, LineList},
    created: function () {
      let self = this;
      this.initWindowMetricData()
      if (this.param.time) this.time = this.param.time
      this.updateWindow({
        methods: {
          queryList: this.queryList
        }
      })
      this.queryList()
      if (_.isNull(this.queryInterval)) {
        // this.queryInterval = setInterval(this.queryList, 10000)
      }
      if (_.isNull(this.queryInterval)) {
        this.queryInterval = setInterval(this.queryTotalMetricData, consts.refreshInterval)
      }
    },
    mounted: function () {
    },
    destroyed: function () {
      clearInterval(this.queryInterval)
    },
    data() {
      return {
        metricNames: {
          metricData: [
            MetircName.host.CPUAllUsedUtilization
          ],
          averageData: [
            MetircName.host.MemoryUsedInPercent,
            MetircName.host.DiskAllUsedCapacityInPercent
          ],
          multiAverageData: [
            MetircName.host.DiskAllReadOps,
            MetircName.host.DiskAllWriteOps,
            MetircName.host.DiskAllReadBytes,
            MetircName.host.DiskAllWriteBytes
          ],
          multiNicAverageData: [
            MetircName.host.NetworkOutBytes,
            MetircName.host.NetworkInBytes,
            MetircName.host.NetworkOutPackets,
            MetircName.host.NetworkInPackets,
            MetircName.host.NetworkOutErrors,
            MetircName.host.NetworkInErrors
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
        queryInterval: null,
        leftDistance: 0,
        metircName: MetircName,
        hostUuidList: null,
        vmUuidList: [],
        vrouterUuidList: [],
        l3networkUuidList: [],
        vipUuidList: [],
        host: null,
        resourceName: 'host',
        selectList: [{
          'namespace': 'ZStack/Host',
          'name': 'DiskAllWriteBytes'
        }]
      }
    },
    methods: {
      queryTotalMetricData: function () {
        // this.queryTotalData(this.metricNames, 'HostUuid', this.hostUuidList, 'host', this.param.time, this)
        let param = `zoneUuid='${window.localStorage.getItem('currZoneUuid')}' and hypervisorType='KVM' and status='Connected'`
        this.queryTotalData(this.metricNames, 'HostUuid', 'host', 'host', param, this.param.time, this)
          .then(() => {
            this.$forceUpdate()
          })
      },
      changeResource: function (name) {
        this.resourceName = name
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
        // this.currentZone = localStorage.getItem('currZoneUuid')
        // rpc.query('hosts', {
        //   fileds: 'uuid',
        //   q: [`zoneUuid=${this.currentZone}`, 'hypervisorType=KVM', 'status=Connected']
        // })
        // .then((resp) => {
        //   if (resp.inventories.length > 0) {
        //     let uuidList = resp.inventories.map((item) => item.uuid)
        //     this.hostUuidList = uuidList
        //   } else this.hostUuidList = []
        //   this.queryTotalMetricData()
        // })
      },
      queryHostMetricData: function (item) {
        return (self) => {
          this.queryMetricData([item], 'HostUuid', this.hostUuidList, 'host', this.param.time, self)
        }
      },
      queryHostAverageData: function (item) {
        if (item.length === 2) {
          return (self) => {
            this.queryMulitiAverageData(item, 'HostUuid', this.hostUuidList, 'host', this.param.time, self)
          }
        } else {
          return (self) => {
            this.queryAverageValue(item, 'HostUuid', this.hostUuidList, 'host', this.param.time, self)
          }
        }
      },
      queryHostNicAverageData: function (item) {
        if (item.length === 2) {
          return (self) => {
            this.queryMulitiNicAverageData(item, 'HostUuid', this.hostUuidList, 'host', this.param.time, self)
          }
        } else {
          return (self) => {
            this.queryNicAverageValue(item, 'HostUuid', this.hostUuidList, 'host', this.param.time, self)
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
  .metric-data{
    background: #fff;
    height: 270px;
    width: 100%;
    box-shadow: 0 1px 6px 0 #eef5ff;
    border-radius: 4px;
  }
</style>
