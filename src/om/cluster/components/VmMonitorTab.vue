<template>
  <div class="container">
    <div class="chart">
      <detail-monitor
        :param="{
         title: $t('common.' +cpuAllUsedUtilizationTimeList[windowData.cpuAllUsedUtilizationIntervalIndex].name),
         name: `${$t('vm.CPUAllUsedUtilization')}${$t('common.colon')}`,
         data: windowData.cpuAllUsedUtilizationData,
         timeIntervalList: cpuAllUsedUtilizationTimeList,
         changeInterval: changeInterval,
         type:'cpuAllUsedUtilization',
         hasValue: !isNoDataForcpuAllUsedUtilization && !noVM
        }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
         title: $t('common.' +memoryUsedInPercentTimeList[windowData.memoryUsedInPercentIntervalIndex].name),
         name: `${$t('vm.MemoryUsedInPercent')}${$t('common.colon')}`,
         data: windowData.memoryUsedInPercentData,
         timeIntervalList: memoryUsedInPercentTimeList,
         changeInterval: changeInterval,
         type:'memoryUsedInPercent',
         hasValue: !isNoDataForMemoryUsed && !noVM
        }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
          title: $t('common.' + networkTimeIntervalList[windowData.networkIntervalIndex].name),
          name: `${$t('vm.NetworkAllInAndOutBytes')}${$t('common.colon')}`,
          data: windowData.networkData,
          timeIntervalList: networkTimeIntervalList,
          changeInterval: changeInterval,
          type: 'network',
          hasValue: !noVM,
          networkDirectionList: networkDirectionList,
          networkDirectioTitle:  networkDirectionList[windowData.networkDirectionIndex].name,
          changeNetworkDirectionIndex: changeNetworkDirectionIndex
        }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
          title: $t('common.' + diskTimeIntervalList[windowData.diskIntervalIndex].name),
          name: `${$t('vm.DiskAllReadAndWriteOps')}${$t('common.colon')}`,
          data: windowData.diskData,
          timeIntervalList: diskTimeIntervalList,
          changeInterval: changeInterval,
          type: 'disk',
          hasValue: !noVM,
          diskDirectionList: diskDirectionList,
          diskDirectionTitle:  diskDirectionList[windowData.diskDirectionIndex].name,
          changeDiskDirectionIndex: changeDiskDirectionIndex
        }"
      />
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils'
  import Chart from 'src/utils/chart.js'
  import DetailMonitor from 'src/component/Detail/Monitor'
  export default {
    name: "VmMonitorTab",
    mixins: [WindowBase],
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
        noVM: false,
        currQueryInterval: null,
        uuidList: [],
        conditions: [],
        isNoDataForVipInPackes: false,
        isNoDataForcpuAllUsedUtilization: false,
        isNoDataForMemoryUsed: false,
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
        showDiskIntervalDropdown: false,
        memoryUsedInPercentTimeList: _.cloneDeep(timeIntervalList),
        cpuAllUsedUtilizationTimeList: _.cloneDeep(timeIntervalList),
        networkTimeIntervalList: _.cloneDeep(timeIntervalList),
        diskTimeIntervalList: _.cloneDeep(timeIntervalList),
        timeIntervalList: timeIntervalList,
        networkDirectionList: [
          {
            name: this.$t('monitoralarm.rx'),
            metricName: 'rx',
            selected: false
          },
          {
            name: this.$t('monitoralarm.tx'),
            metricName: 'tx',
            selected: false
          }
        ],
        diskDirectionList: [
          {
            name: this.$t('monitoralarm.read'),
            metricName: 'read',
            selected: false
          },
          {
            name: this.$t('monitoralarm.write'),
            metricName: 'write',
            selected: false
          }
        ],
        cpuAllUsedUtilizationList: [
          {
            name: 'CPUAllUsedUtilization',
            metricName: 'CPUAllUsedUtilization',
            unit: 'percent',
            selected: false
          }
        ],
        memoryUsedInPercentList: [
          {
            name: 'MemoryUsedInPercent',
            metricName: 'MemoryUsedInPercent',
            unit: 'percent',
            selected: false
          }
        ],
        networkLables: {
          rx: 'NetworkAllOutBytes',
          tx: 'NetworkAllInBytes'
        },
        diskLabels: {
          read: 'DiskAllReadOps',
          write: 'DiskAllWriteOps'
        }
      }
    },
    created: function () {
      this.updateWindow({
        dialogList: [],
        cpuAllUsedUtilizationData: [],
        memoryUsedInPercentData: [],
        networkData: [],
        diskData: [],
        cpuAllUsedUtilizationIntervalIndex: 0,
        memoryUsedInPercentIntervalIndex: 0,
        cpuAllUsedUtilizationIndex: 0,
        memoryUsedInPercentIndex: 0,
        networkIntervalIndex: 0,
        networkDirectionIndex: 0,
        diskIntervalIndex: 0,
        diskDirectionIndex: 0
      }).then(() => {
        this.$nextTick(() => this.query())
        if (_.isNull(this.currQueryInterval)) {
          this.currQueryInterval = setInterval(this.query, 20000)
        }
      })
      if (this.param) {
        this.updateWindow({dataUuid: this.param.uuid})
        this.conditions = this.param.conditions
      }
      window.addEventListener('click', this.onWindowClick)
    },
    destroyed: function () {
      this.clearTimer()
      if (this.currQueryInterval !== null) {
        clearInterval(this.currQueryInterval)
        this.currQueryInterval = null
      }
    },
    methods: {
      getCurrentTime: function () {
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            this.currTime = resp.currentTime.Seconds
            return new Promise((resolve, reject) => {
              resolve()
            })
          })
      },
      query: function () {
        let self = this
        rpc.query('vm-instances', {
          q: self.conditions,
          fields: 'uuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              self.noVM = false
              self.uuidList = resp.inventories.map((item) => item.uuid)
              self.queryCpuAllUsedUtilizationData()
              self.queryMemoryUsedInPercentData()
              self.queryNetworkData()
              self.queryDiskData()
            } else self.noVM = true
          })
      },
      queryCpuAllUsedUtilizationData: function () {
        let self = this
        let index = self.windowData.cpuAllUsedUtilizationIndex
        let timeIndex = self.windowData.cpuAllUsedUtilizationIntervalIndex
        let metricName = self.cpuAllUsedUtilizationList[index].metricName
        let cpuAllUsedUtilizationData = []
        let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "CPUAllUsedUtilization", "period": ${self.cpuAllUsedUtilizationTimeList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.cpuAllUsedUtilizationTimeList[timeIndex].value}, "labels": ["VMUuid=~ ${self.uuidList.join('|')}"]}')
      put("metricData", tmp.result)
      `
        rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let values = resp.result.metricData.data
          let _value = self.getAverageValue(values, metricName)
          self.isNoDataForcpuAllUsedUtilization = false
          _value = self.initMetricData(timeIndex, _value, metricName)
          _value.forEach((item) => {
            item[0] *= 1000
          })
          let maxValue = _.max(_value.map((it, index) => Math.ceil(it[1])))
          cpuAllUsedUtilizationData[0] = {
            id: self.$t(`vm.${metricName}`),
            index,
            values: _value,
            yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
            formataFuc: self.formateValue(self.cpuAllUsedUtilizationList[index].unit)
          }
          self.updateWindow({cpuAllUsedUtilizationData})
        }, () => {
          self.isNoDataForcpuAllUsedUtilization = true
          self.updateWindow({cpuAllUsedUtilizationData: []})
        })
      },
      queryMemoryUsedInPercentData: function () {
        let self = this
        let index = self.windowData.memoryUsedInPercentIndex
        let timeIndex = self.windowData.memoryUsedInPercentIntervalIndex
        let metricName = self.memoryUsedInPercentList[index].metricName
        let memoryUsedInPercentData = []
        let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "${metricName}", "period": ${self.cpuAllUsedUtilizationTimeList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.cpuAllUsedUtilizationTimeList[timeIndex].value}, "labels": ["VMUuid=~ ${self.uuidList.join('|')}"]}')
      put("metricData", tmp.result)
      `
        rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let values = resp.result.metricData.data
          let _value = self.getAverageValue(values, metricName)
          self.isNoDataForMemoryUsed = false
          _value = self.initMetricData(timeIndex, _value, metricName)
          _value.forEach((item) => {
            item[0] *= 1000
          })
          let maxValue = _.max(_value.map((it, index) => Math.ceil(it[1])))
          memoryUsedInPercentData[0] = {
            id: self.$t(`vm.${metricName}`),
            index,
            values: _value,
            yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
            formataFuc: self.formateValue(self.memoryUsedInPercentList[index].unit)
          }
          self.updateWindow({memoryUsedInPercentData})
        }, () => {
          self.isNoDataForMemoryUsed = true
          self.updateWindow({memoryUsedInPercentData: []})
        })
      },
      queryNetworkData: function () {
        let tasks = []
        let self = this
        let networkData = []
        let timeIndex = self.windowData.networkIntervalIndex
        let metricName = self.networkLables[self.networkDirectionList[self.windowData.networkDirectionIndex].metricName]
        let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "${metricName}", "period": ${self.networkTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.networkTimeIntervalList[timeIndex].value}, "labels": ["VMUuid=~ ${self.uuidList.join('|')}"]}')
        put("metricData", tmp)
        `
        let p = rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        })
          .then((resp) => {
            let values = resp.result.metricData.result.data
            let _value = self.getAverageValue(values, metricName)
            _value = self.initMetricData(timeIndex, _value, metricName)
            _value.forEach((item) => {
              item[0] *= 1000
            })
            let maxValue = _.max(_value.map((it, index) => Math.ceil(it[1])))
            networkData[0] = {
              id: self.$t(`vm.${metricName}`),
              index: 0,
              values: _value,
              yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
              formataFuc: (it) => {
                return self.bytesToSizeInMonitor(it, 'B/s', 0)
              }
            }
            return new Promise((resolve, reject) => {
              resolve()
            })
          })
        tasks.push(p)
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({networkData}))
        else this.updateWindow({networkData: 'nodata'})
      },
      queryDiskData: function () {
        let tasks = []
        let self = this
        let diskData = []
        let timeIndex = self.windowData.diskIntervalIndex
        let metricName = self.diskLabels[self.diskDirectionList[self.windowData.diskDirectionIndex].metricName]
        let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "${metricName}", "period": ${self.diskTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.diskTimeIntervalList[timeIndex].value}, "labels": ["VMUuid=~ ${self.uuidList.join('|')}"]}')
        put("metricData", tmp)
        `
        let p = rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        })
          .then((resp) => {
            let values = resp.result.metricData.result.data
            let _value = self.getAverageValue(values, metricName)
            _value = self.initMetricData(timeIndex, _value)
            _value.forEach((item) => {
              item[0] *= 1000
            })
            let maxValue = _.max(_value.map((it, index) => Math.ceil(it[1])))
            diskData[0] = {
              id: self.$t(`vm.${metricName}`),
              index: 0,
              values: _value,
              yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
              formataFuc: (it) => {
                return self.bytesToSizeInMonitor(it, 'ops/s', 0)
              }
            }
            return new Promise((resolve, reject) => {
              resolve()
            })
          })
        tasks.push(p)
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({diskData}))
        else this.updateWindow({diskData: []})
      },
      getAverageValue: function (value, metricName) {
        let values = []
        if (value.length === 0) return []
        let data = _.groupBy(value, 'time')
        for (let key in data) {
          let _value
          if (metricName === 'NetworkAllOutBytes' || metricName === 'NetworkAllInBytes' || metricName === 'DiskAllReadOps' || metricName === 'DiskAllWriteOps') _value = _.sumBy(data[key], function (o) {
            return o.value
          })
          else _value = _.sumBy(data[key], function (o) {
            return o.value
          }) / data[key].length
          values.push([key, _value])
        }
        return values
      },
      initMetricData: function (index, value, metricName) {
        let step = this.timeIntervalList[index].step
        let length = 100
        let valueLenth = value.length
        if (valueLenth >= length) return value
        let currentTime = (Date.now() + window.___currServerTimeMillionDvalue) / 1000
        let startTime = valueLenth > 0 ? value[0][0] : currentTime
        let endTime = valueLenth > 0 ? value[valueLenth - 1][0] : currentTime
        let _value = []
        if (endTime < currentTime) {
          for (let i = 1; i <= Math.round((parseInt(currentTime) - parseInt(endTime)) / step); i++) {
            value.push([parseInt(endTime) + i * step, 0])
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
      changeVipDirectionInBytesIndex: function (index) {
        this.updateWindow({
          cpuAllUsedUtilizationIndex: index
        }).then(() => {
          this.queryVipInBytesData()
        })
      },
      changeDiskUsageTypeIndex: function (index) {
        this.updateWindow({
          diskUsageTypeIndex: index
        }).then(() => {
          this.queryDiskData()
        })
      },
      changeVipInBytesInPackets: function (index) {
        this.updateWindow({
          vipDirectionInBytesInPackets: index
        }).then(() => {
          this.queryVipInPackesData()
        })
      },
      changeDiskDirectionIndex: function (index) {
        this.updateWindow({
          diskDirectionIndex: index
        }).then(() => {
          this.queryDiskData()
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
      changeNetworkDirectionIndex: function (index) {
        this.updateWindow({
          networkDirectionIndex: index
        }).then(() => {
          this.queryNetworkData()
        })
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
      }
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        // pass param for desktop manager
        if (this.param) {
          this.conditions = this.param.conditions
          this.updateWindow({dataUuid: this.param}).then(() => this.query())
        }
      }
    }
  }
</script>

<style scoped>
 .chart{
   margin-top: 20px;
 }
</style>
