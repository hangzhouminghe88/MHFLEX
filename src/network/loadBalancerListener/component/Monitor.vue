 <template>
  <div class="container">
    <div class="body" @scroll="onScroll">
      <detail-monitor :param="{
        name: $t('loadbalancer.LoadBalancerSessionNumber')+$t('common.colon'),
        title:$t(`common.${sessionNumberTimeList[windowData.sessionNumberIntervalIndex].name}`),
        timeIntervalList: timeIntervalList,
        isAllLabelsSelected:isAllSelectedSessionLabels,
        hasValue: !isNoDataForsessionNumber,
        changeInterval: changeInterval,
        type: 'sessionNumber',
        data: windowData.sessionNumberData,
        labels: sessionNumberLabel,
        clickItemId: ($event, id) => {
          clickLabel($event, 'sessionNumber', id);
          $event.stopPropagation();
        }
      }"></detail-monitor>
      <detail-monitor :param="{
        name: $t('loadbalancer.LoadBalancerTrafficBytes')+$t('common.colon'),
        title:$t(`common.${trafficBytesTimeList[windowData.trafficBytesIntervalIndex].name}`),
        timeIntervalList: trafficBytesTimeList,
        hasValue: !isNoDataForTrafficBytes,
        changeInterval: changeInterval,
        type: 'trafficBytes',
        data: windowData.trafficBytesData,
        labels: trafficBytesLabel,
        networkDirectionList: trafficBytesDirectionList,
        networkDirectioTitle: trafficBytesDirectionList[windowData.trafficBytesDirectionIndex].name,
        changeNetworkDirectionIndex: changeTrafficBytesDirectionIndex,
        clickItemId: ($event, id) => {
          clickLabel($event, 'trafficBytes', id);
            $event.stopPropagation();
        },
         isAllLabelsSelected: isAllSelectedTrafficBytesLabels,
      }"></detail-monitor>
    </div>
    <div class="scrollbar" v-show="showScrollbar" :style="{ top: scrollTop + 'px', height: scrollLength + 'px' }" @mousedown="onScrollBarMouseDown($event)"></div>
  </div>
</template>


<script>
import _ from 'lodash'
import WindowBase from 'src/windows/Window'
import rpc from 'src/utils/rpc'
import Utils from 'src/utils/utils'
import ScrollBar from 'src/windows/Base/ScrollBar'
import Chart from 'src/utils/chart.js'
import DetailMonitor from  'src/component/Detail/Monitor';
export default {
  name: 'VmInstanceMonitor',
  mixins: [ScrollBar, WindowBase],
  props: ['param'],
  components: {
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
      isNoDataForsessionNumber: false,
      showSizeIntervalDropdown: false,
      isNoDataForTrafficBytes: false,
      sessionNumberTimeList: _.cloneDeep(timeIntervalList),
      trafficBytesTimeList: _.cloneDeep(timeIntervalList),
      timeIntervalList: timeIntervalList,
      queryInterval: null,
      sessionNumberLabel: [],
      trafficBytesLabel: [],
      sessionNumber: [
        {
          name: 'LoadBalancerSessionNumber',
          metricName: 'LoadBalancerBackendSessionNumber',
          unit: 'count',
          selected: false
        }
      ],
      trafficBytes: [],
      totalTrafficBytes: [],
      trafficBytesDirectionList: [
        {
          name: 'in_bytes',
          selected: false,
          index: 0
        },
        {
          name: 'out_bytes',
          selected: false,
          index: 1
        }
      ]
    }
  },
  created: function () {
    this.scrollContainerSelector = '.container'
    this.scrollElementSelector = '.body'
    this.updateWindow({
      dialogList: [],
      sessionNumberData: [],
      sessionNumberIntervalIndex: 0,
      sessionNumberIndex: 0,
      trafficBytesData: [],
      trafficBytesIntervalIndex: 0,
      trafficBytesDirectionIndex: 0
    }).then(() => {
      this.$nextTick(() => this.query())
    })
    if (this.param) {
      this.updateWindow({dataUuid: this.param})
    }
    this.queryInterval = setInterval(this.queryData, 20000)
    // window.addEventListener('click', this.onWindowClick)
    this.config = {
      sessionNumber: {
        timeLabel: {
          labelList: this.sessionNumberTimeList,
          getName: () => this.$t(`common.${this.sessionNumberTimeList[this.windowData.sessionNumberIntervalIndex].name}`),
          changeInterval: (index) => this.changeInterval('sessionNumber', index)
        },
        vmNicLabel: {
          query: this.querySessionNumberData,
          labelList: this.sessionNumberLabel,
          clickLabel: this.clickSessionLabel
        }
      }
    }
  },
  destroyed: function () {
    this.clearTimer()
  },
  methods: {
    initTrafficBytes: function () {
      let isUdp = this.dbData.loadBalancerListener[this.windowData.dataUuid].healthCheckProtocol === 'udp'
      this.trafficBytes = [
        {
          name: 'LoadBalancerTrafficInBytes',
          metricName: isUdp ? 'LoadBalancerBackendTrafficOutBytes' : 'LoadBalancerBackendTrafficInBytes',
          unit: 'bytes',
          selected: false
        },
        {
          name: 'LoadBalancerTrafficOutBytes',
          metricName: isUdp ? 'LoadBalancerBackendTrafficInBytes' : 'LoadBalancerBackendTrafficOutBytes',
          unit: 'bytes',
          selected: false
        }
      ]
      this.totalTrafficBytes = isUdp ? [ 'LoadBalancerTrafficOutBytes', 'LoadBalancerTrafficInBytes' ] : [ 'LoadBalancerTrafficInBytes', 'LoadBalancerTrafficOutBytes' ]
    },
    query: function () {
      this.initTrafficBytes()
      this.queryVmNic()
      .then(() => {
        this.queryData()
      })
    },
    queryData: function () {
      this.querySessionNumberData()
      this.queryTrafficBytesData()
    },
    queryVmNic: function () {
      return rpc.query(`vm-instances/nics`, {
        q: `loadBalancerListener.uuid=${this.param}`
      }).then((resp) => {
        let vmNicLabels = [{
          name: 'total',
          selected: true
        }]
        resp.inventories.forEach((item) => {
          if (item.ip) {
            vmNicLabels.push({
              name: item.internalName,
              value: item.internalName,
              ip: item.ip,
              selected: false
            })
          }
        })
        this.sessionNumberLabel = _.cloneDeep(vmNicLabels)
        this.trafficBytesLabel = _.cloneDeep(vmNicLabels)
        this.isNoDataForsessionNumber = !vmNicLabels.length > 0
        this.isNoDataForTrafficBytes = !vmNicLabels.length > 0
      })
    },
    querySessionNumberData: function () {
      let self = this
      let hasTotal = false
      let index = self.windowData.sessionNumberIndex
      let timeIndex = self.windowData.sessionNumberIntervalIndex
      let metricName = self.sessionNumber[index].metricName
      let sessionNumberData = []
      let selectedList = []
      let currentTime = parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
      this.selectedSessionLabels.forEach((it) => {
        if (it.name === 'total') hasTotal = true
        else selectedList.push(it)
      })
      let tasks = []
      for (let i = 0; i < selectedList.length; i++) {
        (function (label, i) {
          let it = label.ip
          let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/LoadBalancer", "metricName": "${metricName}", "period": ${self.sessionNumberTimeList[timeIndex].step}, "startTime": ${currentTime - self.sessionNumberTimeList[timeIndex].value}, "endTime": ${currentTime}, "labels": ["ListenerUuid=~ ${self.windowData.dataUuid}", "NicIpAddress= ${it}"]}')
            put("metricData", tmp)
            `
          let p = rpc.query('batch-queries', {
            script: encodeURIComponent(script)
          })
          .then((resp) => {
            let values = resp.result.metricData.result.data
            // if (values.length > 0) {
            let _value = []
            let maxValue = _.max(values.map((it, index) => {
              _value[index] = [it.time, it.value]
              return Math.ceil(it.value)
            }))
            if (maxValue % 4 > 0) {
              maxValue = (parseInt(maxValue / 4) + 1) * 4
            }
            _value = self.initMetricData(timeIndex, _value)
            _value.forEach((item) => {
              item[0] *= 1000
            })
            let labelIndex = hasTotal ? i + 1 : i
            sessionNumberData[labelIndex] = {
              id: label.name,
              index: self.sessionNumberLabel.findIndex((_it) => { return _it.ip === it }),
              values: _value,
              yAxis: {min: 0, max: maxValue > 4 ? maxValue : 4},
              formataFuc: self.formateValue(self.sessionNumber[index].unit)
            }
            // }
          })
          tasks.push(p)
        })(selectedList[i], i)
      }

      if (hasTotal) {
        let p = rpc.query('zwatch/metrics', {
          namespace: 'ZStack/LoadBalancer',
          metricName: 'LoadBalancerSessionNumber',
          startTime: currentTime - self.sessionNumberTimeList[timeIndex].value,
          endTime: currentTime,
          labels: [`ListenerUuid=${self.windowData.dataUuid}`],
          period: self.sessionNumberTimeList[timeIndex].step
        })
        .then((resp) => {
          let values = resp.data
          let _value = []
          let maxValue = _.max(values.map((it, index) => {
            _value[index] = [it.time, it.value]
            return Math.ceil(it.value)
          }))
          if (maxValue % 4 > 0) {
            maxValue = (parseInt(maxValue / 4) + 1) * 4
          }
          _value = self.initMetricData(timeIndex, _value)
          _value.forEach((item) => {
            item[0] *= 1000
          })
          sessionNumberData[0] = {
            id: 'total',
            index: 0,
            values: _value,
            yAxis: {min: 0, max: maxValue > 4 ? maxValue : 4},
            formataFuc: self.formateValue('count')
          }
        })
        tasks.push(p)
      }

      if (tasks.length > 0) {
        return Promise.all(tasks).then(() => {
          self.updateWindow({ sessionNumberData })
        })
      } else this.updateWindow({sessionNumberData: []})
    },
    queryTrafficBytesData: function () {
      let self = this
      let index = self.windowData.trafficBytesDirectionIndex
      let timeIndex = self.windowData.trafficBytesIntervalIndex
      let metricName = self.trafficBytes[index].metricName
      let trafficBytesData = []
      let hasTotal = false
      let currentTime = parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
      let selectedList = []
      this.selectedTrafficBytesLabels.forEach((it) => {
        if (it.name === 'total') hasTotal = true
        else selectedList.push(it)
      })
      let tasks = []
      for (let i = 0; i < selectedList.length; i++) {
        (function (label, i) {
          let it = label.ip
          let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/LoadBalancer", "metricName": "${metricName}", "period": ${self.trafficBytesTimeList[timeIndex].step}, "startTime": ${currentTime - self.trafficBytesTimeList[timeIndex].value}, "endTime": ${currentTime}, "labels": ["ListenerUuid=~ ${self.windowData.dataUuid}", "NicIpAddress= ${it}"]}')
            put("metricData", tmp)
            `
          let p = rpc.query('batch-queries', {
            script: encodeURIComponent(script)
          })
          .then((resp) => {
            let values = resp.result.metricData.result.data
            // if (values.length > 0) {
            let _value = []
            let maxValue = _.max(values.map((it, index) => {
              _value[index] = [it.time, it.value]
              return Math.ceil(it.value)
            }))
            if (maxValue % 4 > 0) {
              maxValue = (parseInt(maxValue / 4) + 1) * 4
            }
            _value = self.initMetricData(timeIndex, _value)
            _value.forEach((item) => {
              item[0] *= 1000
            })
            let labelIndex = hasTotal ? i + 1 : i
            trafficBytesData[labelIndex] = {
              id: label.name,
              index: self.trafficBytesLabel.findIndex((_it) => { return _it.ip === it }),
              values: _value,
              yAxis: {min: 0, max: maxValue > 4 ? maxValue : 4},
              formataFuc: self.formateValue(self.trafficBytes[index].unit)
            }
            // }
          })
          tasks.push(p)
        })(selectedList[i], i)
      }

      if (hasTotal) {
        let p = rpc.query('zwatch/metrics', {
          namespace: 'ZStack/LoadBalancer',
          metricName: this.totalTrafficBytes[index],
          startTime: currentTime - self.trafficBytesTimeList[timeIndex].value,
          endTime: currentTime,
          labels: [`ListenerUuid=${self.windowData.dataUuid}`],
          period: self.trafficBytesTimeList[timeIndex].step
        })
        .then((resp) => {
          let values = resp.data
          let _value = []
          let maxValue = _.max(values.map((it, index) => {
            _value[index] = [it.time, it.value]
            return Math.ceil(it.value)
          }))
          if (maxValue % 4 > 0) {
            maxValue = (parseInt(maxValue / 4) + 1) * 4
          }
          _value = self.initMetricData(timeIndex, _value)
          _value.forEach((item) => {
            item[0] *= 1000
          })
          trafficBytesData[0] = {
            id: 'total',
            index: 0,
            values: _value,
            yAxis: {min: 0, max: maxValue > 4 ? maxValue : 4},
            formataFuc: self.formateValue('bytes')
          }
        })
        tasks.push(p)
      }

      if (tasks.length > 0) {
        return Promise.all(tasks).then(() => {
          self.updateWindow({ trafficBytesData })
        })
      } else this.updateWindow({trafficBytesData: []})
    },
    initMetricData: function (index, value) {
      let step = this.timeIntervalList[index].step
      let length = 100
      let valueLenth = value.length
      if (valueLenth >= length) return value
      let currentTime = (Date.now() + window.___currServerTimeMillionDvalue) / 1000
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
    changeTrafficBytesDirectionIndex: function (index) {
      this.updateWindow({
        trafficBytesDirectionIndex: index
      }).then(() => {
        this.queryTrafficBytesData()
      })
    },
    clearTimer: function () {
      clearInterval(this.queryInterval)
    },
    toggleDropdown: function ($event, dropdownName) {
      let obj = {}
      obj[dropdownName] = !this.windowData[dropdownName]
      this.updateWindow(obj)
      $event.stopPropagation()
    },
    clickLabel: function ($event, name, id) {
      $event.stopPropagation()
      let labelName = [`${name}Label`]
      function isAllLabelListSelected () {
        let show = true
        this[labelName].forEach((it) => {
          if (!it.selected) show = false
        })
        return show
      }
      if (id === 'all') {
        let showAll = isAllLabelListSelected.bind(this)()
        this[labelName] = this[labelName].map((it) => {
          it.selected = !showAll
          return it
        })
      } else {
        this[labelName] = this[labelName].map((it) => {
          if (id === it.name) it.selected = !it.selected
          return it
        })
      }
      this[`query${name.charAt(0).toUpperCase() + name.slice(1)}Data`]()
    },
    ...Chart,
    ...Utils
  },
  computed: {
    selectedSessionLabels: function () {
      let list = []
      this.sessionNumberLabel.forEach((it) => {
        if (it.selected) list.push(it)
      })
      return list
    },
    selectedTrafficBytesLabels: function () {
      let list = []
      this.trafficBytesLabel.forEach((it) => {
        if (it.selected) list.push(it)
      })
      return list
    },
    isAllSelectedTrafficBytesLabels(){
      return this.trafficBytesLabel.every((it) => {
        return it.selected === true;
      })
    },
    isAllSelectedSessionLabels(){
      return this.sessionNumberLabel.every((it) => {
        return it.selected === true;
      })
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

  .cpu,
  .memory,
  .disk,
  .network
  {
    padding-top: 40px;
    padding-right: 30px;
  }

  .chart-name {
    margin-right: 15px;
    color: #1A2736;
  }

  .button.dropdown .text{
    color: #5E6978;
  }

  .label-list {
    color: #5E6978;
  }

  .label-list-dropdown {
    display: inline-block;
    float: right;
    padding: 0 10px;
    height: 34px;
    border: 1px solid #D7DCE2;
    font-size: 14px;
    position: relative;
    cursor: pointer;
  }

  .label-list-dropdown .dropdown-content{
    position: absolute;
    top: 32px;
    left: -344px;
    padding: 0;
    width: 440px;
  }

  .chart-header .row .label-list-dropdown .item .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    margin-right: 10px;
  }

  .chart-header .row .label-list-dropdown .item {
    display: inline-block;
    cursor: pointer;
    height: 33px;
    padding: 0 9px;
    border-bottom: 1px solid #D7DCE2;
    margin-bottom: -1px;
    flex-grow: 0;
    align-self: flex-start;
    min-width: 73px;
  }

  .chart-header .row .label-list-dropdown .item.active {
    background-color: #D2EEFF;
    color: #5E6978;
  }

  .label-list-dropdown .arrow {
    display: inline-block;
    position: relative;
    top: 3px;
    left: 0px;
    color: #5E6978;
  }

  .show-lable {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .chart-header .row {
    padding-right: 20px;
  }

  .active .dot{
    border: none;
  }

  .paddingtop {
    padding-top: 12px;
  }
  .paddingbottom {
    padding-bottom:12px;
  }
</style>


// WEBPACK FOOTER //
// Monitor.vue?93d864c8
