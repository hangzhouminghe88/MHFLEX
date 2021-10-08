<template>
  <div>
    <div class="line-item" style="margin-top:0px;">
      <line-list class="line-list" :param="{data: {
        metricList: [metircName.l3network.UsedIPInPercent],
        uuidName: 'L3NetworkUuid',
        uuidList: l3networkUuidList,
        resourceName: 'l3network',
        time: param.time,
        opposite: false,
        metircData: windowData.metircData.UsedIPInPercent,
        updateFn: queryL3networkAverageData([metircName.l3network.UsedIPInPercent])}}"></line-list>
      <histogram-single class="histogram-item"
                        :param="{data: {
        metricList: [metircName.l3network.UsedIPCount],
        uuidName: 'L3NetworkUuid',
        uuidList: l3networkUuidList,
        resourceName: 'l3network',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.l3network.UsedIPCount.unit),
        metircData: windowData.metircData.UsedIPCount,
        updateFn: queryL3networkAverageData([metircName.l3network.UsedIPCount])
      }}"></histogram-single>
    </div>
    <div class="line-item">
      <line-list class="line-list" :param="{data: {
        metricList: [metircName.l3network.AvailableIPInPercent],
        uuidName: 'L3NetworkUuid',
        uuidList: l3networkUuidList,
        resourceName: 'l3network',
        time: param.time,
        opposite: true,
        metircData: windowData.metircData.AvailableIPInPercent,
        updateFn: queryL3networkAverageData([metircName.l3network.AvailableIPInPercent])}}"></line-list>
      <histogram-single class="histogram-item"
                        :param="{data: {
        metricList: [metircName.l3network.AvailableIPCount],
        uuidName: 'L3NetworkUuid',
        uuidList: l3networkUuidList,
        resourceName: 'l3network',
        direction: 'across',
        time: param.time,
        fuc: formateValue(metircName.l3network.AvailableIPCount.unit),
        metircData: windowData.metircData.AvailableIPCount,
        updateFn: queryL3networkAverageData([metircName.l3network.AvailableIPCount])
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
    name: "L3NetworkTabPage",
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
    data () {
      return {
        queryInterval: null,
        metricNames: {
          currentValue: [
            MetircName.l3network.UsedIPInPercent,
            MetircName.l3network.UsedIPCount,
            MetircName.l3network.AvailableIPInPercent,
            MetircName.l3network.AvailableIPCount
          ]
        },
        data: {},
        leftDistance: 0,
        metircName: MetircName,
        l3networkUuidList: null,
        resourceName: 'l3network'
      }
    },
    methods: {
      queryTotalMetricData: function () {
        // this.queryTotalData(this.metricNames, 'L3NetworkUuid', this.l3networkUuidList, 'l3network', this.param.time, this)
        let param = `zoneUuid='${window.localStorage.getItem('currZoneUuid')}' and l2Network.cluster.type!='vmware'`
        this.queryTotalData(this.metricNames, 'L3NetworkUuid', 'l3network', 'l3network', param, this.param.time, this)
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
        // rpc.query('l3-networks', {
        //   fileds: 'uuid',
        //   q: [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'l2Network.cluster.type!=vmware']
        // })
        // .then((resp) => {
        //   if (resp.inventories.length > 0) {
        //     let uuidList = resp.inventories.map((item) => item.uuid)
        //     this.l3networkUuidList = uuidList
        //   } else this.l3networkUuidList = []
        //   this.queryTotalMetricData()
        // })
      },
      queryL3networkAverageData: function (item) {
        if (item.length === 2) {
          return (self) => {
            this.queryMulitiAverageData(item, 'L3NetworkUuid', this.l3networkUuidList, 'l3network', this.param.time, self)
          }
        } else {
          return (self) => {
            this.queryCurrentValue(item, 'L3NetworkUuid', this.l3networkUuidList, 'l3network', this.param.time, self)
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
