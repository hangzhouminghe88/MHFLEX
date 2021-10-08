 <template>
  <div class="container">
    <detail-monitor
      :param="{
          title: $t('common.' +  ipUsedInPercentTimeList[windowData.ipUsedInPercentIntervalIndex].name),
          name: `${$t('l3network.UsedIPInPercent')}${$t('common.colon')}`,
          data: windowData.ipUsedInPercentData,
          timeIntervalList: ipUsedInPercentTimeList,
          changeInterval: changeInterval,
          type: 'ipUsedInPercent',
          hasValue: !isNoDataForIPUsedInPercent,
        }"
    />
  </div>
</template>


<script>
import _ from 'lodash'
import WindowBase from 'src/windows/Window'
import ScrollBar from 'src/windows/Base/ScrollBar'
import rpc from 'src/utils/rpc'
import Utils from 'src/utils/utils'
import Chart from 'src/utils/chart.js'
import Dropdown from 'src/component/DropDown'
import DetailMonitor from 'src/component/Detail/Monitor'
export default {
  name: 'L3networkMonitor',
  mixins: [ScrollBar, WindowBase],
  props: ['param'],
  components: {
    'dropdown': Dropdown,
    'detail-monitor': DetailMonitor
  },
  data: function () {
    let timeIntervalList = [
      {
        name: '15m',
        value: 15 * 60,
        step: 9,
        index: 0
      },
      {
        name: '1h',
        value: 1 * 60 * 60,
        step: 36,
        index: 1
      },
      {
        name: '6h',
        value: 6 * 60 * 60,
        step: 216,
        index: 2
      },
      {
        name: '1d',
        value: 24 * 60 * 60,
        step: 864,
        index: 3
      },
      {
        name: '2w',
        value: 14 * 24 * 60 * 60,
        step: 12096,
        index: 4
      },
      {
        name: '8w',
        value: 4 * 14 * 24 * 60 * 60,
        step: 48384,
        index: 5
      },
      {
        name: '1y',
        value: 365 * 24 * 60 * 60,
        step: 315360,
        index: 6
      }
    ]
    return {
      isNoDataForVipInPackes: false,
      isNoDataForIPUsedInPercent: false,
      queryCpuDataTimerId: null,
      showMoreDropdownHaLevel: false,
      showCpuIntervalDropdown: false,
      showCpuDropdown: false,
      showDiskDropdown: false,
      showMemoryDropdown: false,
      showNetworkUsageDropdown: false,
      showMemoryIntervalDropdown: false,
      showSizeIntervalDropdown: false,
      showDiskDirectionDropdown: false,
      showDiskUsageTypeDropdown: false,
      showNetworkIntervalDropdown: false,
      showNetworkDirectionDropdown: false,
      showNetworkUsageTypeDropdown: false,
      cpuTimeIntervalList: _.cloneDeep(timeIntervalList),
      memoryTimeIntervalList: _.cloneDeep(timeIntervalList),
      ipUsedInPercentTimeList: _.cloneDeep(timeIntervalList),
      timeIntervalList: timeIntervalList,
      ipUsedInPercentList: [
        {
          name: 'UsedIPInPercent',
          metricName: 'UsedIPInPercent',
          unit: 'percent',
          selected: false
        }
      ]
    }
  },
  created: function () {
    this.scrollContainerSelector = '.container'
    this.scrollElementSelector = '.body'
    this.updateWindow({
      dialogList: [],
      ipUsedInPercentData: [],
      ipUsedInPercentIntervalIndex: 0,
      ipUsedInPercentIndex: 0
    }).then(() => {
      this.$nextTick(() => this.query())
    })
    if (this.param) {
      this.updateWindow({dataUuid: this.param})
    }
    window.addEventListener('click', this.onWindowClick)
  },
  destroyed: function () {
    this.clearTimer()
  },
  methods: {
    getCurrentTime: function () {
      return rpc.put('management-nodes/actions', {
        'getCurrentTime': {}
      })
        .then((resp) => {
          this.currTime = resp.currentTime.Seconds
          return new Promise((resolve, reject) => { resolve() })
        })
    },
    query: function () {
      this.queryIpUsedInPercentData()
    },
    queryIpUsedInPercentData: function () {
      let self = this
      let index = self.windowData.ipUsedInPercentIndex
      let timeIndex = self.windowData.ipUsedInPercentIntervalIndex
      let metricName = self.ipUsedInPercentList[index].metricName
      let ipUsedInPercentData = []
      this.getCurrentTime()
        .then(() => {
          let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/L3Network", "metricName": "${metricName}", "period": ${self.ipUsedInPercentTimeList[timeIndex].step}, "startTime": ${this.currTime - self.ipUsedInPercentTimeList[timeIndex].value}, "endTime": ${self.currTime}, "labels": ["L3NetworkUuid=~ ${self.windowData.dataUuid}"]}')
        put("metricData", tmp.result)
        `
          rpc.query('batch-queries', {
            script: encodeURIComponent(script)
          }).then(resp => {
            let values = resp.result.metricData.data
            let _value = []
            self.isNoDataForIPUsedInPercent = false
            let maxValue = _.max(values.map((it, index) => {
              _value[index] = [it.time, it.value]
              return Math.ceil(it.value)
            }))
            _value = self.initMetricData(timeIndex, _value)
            _value.forEach((item) => {
              item[0] *= 1000
            })
            ipUsedInPercentData[0] = {
              id: self.$t(`l3network.${metricName}`),
              index,
              values: _value,
              yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
              formataFuc: self.formateValue(self.ipUsedInPercentList[index].unit)
            }
            self.updateWindow({ ipUsedInPercentData })
          }, () => {
            self.isNoDataForIPUsedInPercent = true
            self.updateWindow({ ipUsedInPercentData: [] })
          })
        })
    },
    initMetricData: function (index, value) {
      let step = this.timeIntervalList[index].step
      let length = 100
      let valueLenth = value.length
      if (valueLenth >= length) return value
      let currentTime = (this.currTime)
      let startTime = valueLenth > 0 ? value[0][0] : currentTime
      let endTime = valueLenth > 0 ? value[valueLenth - 1][0] : currentTime
      let _value = []
      if (endTime < currentTime) {
        for (let i = 1; i <= Math.round((currentTime - endTime) / step); i++) {
          value.push([endTime + i * step, 0])
        }
      }
      valueLenth = value.length
      for (let i = 0; i < valueLenth; i++) {
        _value.push(value[i])
        if ((i + 1) < value.length && value[i + 1][0] - value[i][0] > step) {
          let num = Math.round((value[i + 1][0] - value[i][0]) / step)
          for (let n = 1; n < num; n++) {
            _value.push([parseInt(value[i][0]) + step * n, 0])
          }
        }
      }
      let _length = _value.length
      for (let i = 1; i <= (length - _length); i++) {
        _value.unshift([startTime - i * step, 0])
      }
      return _value
    },
    changeInterval: function (type, index) {
      let obj = {}
      obj[`${type}IntervalIndex`] = index
      this.updateWindow(obj)
        .then(() => {
          this[`query${type.charAt(0).toUpperCase() + type.slice(1)}Data`]()
        })
    },
    clearTimer: function () {
      clearInterval(this.queryCpuDataTimerId)
    },
    toggleDropdown: function ($event, dropdownName) {
      let obj = {}
      obj[dropdownName] = !this.windowData[dropdownName]
      this.updateWindow(obj)
      $event.stopPropagation()
    },
    onWindowClick: function (event) {
      let list = [
        'showSizeIntervalDropdown'
      ]
      let obj = {}
      list.forEach((it) => {
        if (this.windowData[it]) obj[it] = false
      })
      this.updateWindow(obj)
    },
    ...Chart,
    ...Utils
  },
  computed: {
    itemData: function () {
      return this.dbData.vm[this.windowData.dataUuid]
    },
    isAllCpuLabelsSelected: function () {
      let show = true
      this.cpuLabels.forEach((it) => {
        if (!it.selected) show = false
      })
      return show
    },
    selectedCpuLabels: function () {
      let list = []
      this.cpuLabels.forEach((it) => {
        if (it.selected) list.push(it)
      })
      return list
    },
    isAllMemoryLabelsSelected: function () {
      let show = true
      this.memoryLabels.forEach((it) => {
        if (!it.selected) show = false
      })
      return show
    },
    selectedMemoryLabels: function () {
      let list = []
      this.memoryLabels.forEach((it) => {
        if (it.selected) list.push(it)
      })
      return list
    },
    isAllDiskDevicesSelected: function () {
      let show = true
      this.windowData.diskDevices.forEach((it) => {
        if (!it.selected) show = false
      })
      return show
    },
    selectedDiskDevices: function () {
      let list = []
      this.windowData.diskDevices.forEach((it) => {
        if (it.selected) list.push(it)
      })
      return list
    },
    isAllNetworkDevicesSelected: function () {
      let show = true
      this.windowData.networkDevices.forEach((it) => {
        if (!it.selected) show = false
      })
      return show
    },
    selectedNetworkDevices: function () {
      let list = []
      this.windowData.networkDevices.forEach((it) => {
        if (it.selected) list.push(it)
      })
      return list
    }
  },
  watch: {
    'param': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      // pass param for desktop manager
      if (this.param) {
        this.updateWindow({dataUuid: this.param}).then(() => this.query())
        this.destroyDialogs()
      }
    }
  }
}
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>
