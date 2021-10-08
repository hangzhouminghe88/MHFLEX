<template>
  <div>
    <div class="line-item" style="margin-top:0px;">
      <histogram-single class="histogram-item" style="margin-right: 20px; flex: 2;"
                        :param="{data: {
        metricList: [metircName.vip.VIPInBoundTrafficInBytes],
        uuidName: 'VipUUID',
        uuidList: vipUuidList,
        resourceName: 'vip',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vip.VIPInBoundTrafficInBytes.unit),
        metircData: windowData.metircData.VIPInBoundTrafficInBytes,
        updateFn: queryVipAverageData([metircName.vip.VIPInBoundTrafficInBytes])
      }}"></histogram-single>

      <histogram-single class="histogram-item" style="flex: 3;"
                        :param="{data: {
        metricList: [metircName.vip.VIPInBoundTrafficInPackages],
        uuidName: 'VipUUID',
        uuidList: vipUuidList,
        resourceName: 'vip',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vip.VIPInBoundTrafficInPackages.unit),
        metircData: windowData.metircData.VIPInBoundTrafficInPackages,
        updateFn: queryVipAverageData([metircName.vip.VIPInBoundTrafficInPackages])
      }}"></histogram-single>
    </div>
    <div class="line-item">
      <histogram-single class="histogram-item" style="margin-right: 20px; flex: 2;"
                        :param="{data: {
        metricList: [metircName.vip.VIPOutBoundTrafficInBytes],
        uuidName: 'VipUUID',
        uuidList: vipUuidList,
        resourceName: 'vip',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vip.VIPOutBoundTrafficInBytes.unit),
        metircData: windowData.metircData.VIPOutBoundTrafficInBytes,
        updateFn: queryVipAverageData([metircName.vip.VIPOutBoundTrafficInBytes])
      }}"></histogram-single>

      <histogram-single class="histogram-item" style="flex: 3;"
                        :param="{data: {
        metricList: [metircName.vip.VIPOutBoundTrafficInPackages],
        uuidName: 'VipUUID',
        uuidList: vipUuidList,
        resourceName: 'vip',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.vip.VIPOutBoundTrafficInPackages.unit),
        metircData: windowData.metircData.VIPOutBoundTrafficInPackages,
        updateFn: queryVipAverageData([metircName.vip.VIPOutBoundTrafficInPackages])
      }}"></histogram-single>
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';
  import LineList from "../components/LineList";
  import consts from '../consts';
  import MetricCategory from "../components/MetricCategory";
  import MetircName from '../MetricName';
  import HistogramSingle from "../components/HistogramSingle";
  import Histogram from "../components/Histogram";
  import PageBase from 'src/windows/PageBase';
  export default {
    name: "VipTabPage",
    props: ['param'],
    mixins: [WindowBase, Methods, PageBase],
    components: {
      Histogram,
      HistogramSingle,
      LineList,
      MetricCategory
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
    data() {
      return {
        queryInterval: null,
        metricNames: {
          averageData: [
            MetircName.vip.VIPOutBoundTrafficInBytes,
            MetircName.vip.VIPOutBoundTrafficInPackages,
            MetircName.vip.VIPInBoundTrafficInBytes,
            MetircName.vip.VIPInBoundTrafficInPackages
          ]
        },
        data: {
          'index': 3,
          'namespace': 'ZStack/Host',
          'name': 'DiskAllWriteBytes',
          'unit': 'bytes'
        },
        leftDistance: 0,
        metircName: MetircName,
        vipUuidList: null,
        vrouterUuidList: [],
        l3networkUuidList: [],
        resourceName: 'vip'
      }
    },
    methods: {
      queryTotalMetricData: function () {
        // this.queryTotalData(this.metricNames, 'VipUUID', this.vipUuidList, 'vip', this.param.time, this)
        let param = `l3Network.zoneUuid='${window.localStorage.getItem('currZoneUuid')}'`
        this.queryTotalData(this.metricNames, 'VipUUID', 'vip', 'vip', param, this.param.time, this)
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
        // rpc.query('vips', {
        //   fileds: 'uuid',
        //   q: [`l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        // })
        // .then((resp) => {
        //   if (resp.inventories.length > 0) {
        //     let uuidList = resp.inventories.map((item) => item.uuid)
        //     this.vipUuidList = uuidList
        //   } else this.vipUuidList = []
        //   this.queryTotalMetricData()
        // })
      },
      queryVipMetricData: function (item) {
        return (self) => {
          this.queryMetricData([item], 'VipUUID', this.vipUuidList, 'vip', this.param.time, self)
        }
      },
      queryVipAverageData: function (item) {
        if (item.length === 2) {
          return (self) => {
            this.queryMulitiAverageData(item, 'VipUUID', this.vipUuidList, 'vip', this.param.time, self)
          }
        } else {
          return (self) => {
            this.queryAverageValue(item, 'VipUUID', this.vipUuidList, 'vip', this.param.time, self)
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
    padding: 0 30px;
  }
</style>
