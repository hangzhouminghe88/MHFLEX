<template>
  <div class="container">
    <div class="chart">
      <detail-monitor
        :param="{
          title: $t('common.' + cpuTimeIntervalList[windowData.cpuIntervalIndex].name),
          name: `${$t('zwatchAlarm.CPU')}(%)${$t('common.colon')}`,
          data: windowData.cpuData,
          timeIntervalList: cpuTimeIntervalList,
          changeInterval: changeInterval,
          type: 'cpu',
          hasValue: windowData.cpuData ? true : false,
          cpuUsageTypeList: cpuUsageTypeList,
          cpuUsageTypeTitle:  cpuUsageTypeList[windowData.cpuUsageTypeIndex].name,
          changeCpuUsageTypeIndex: changeCpuUsageTypeIndex,
          labels: windowData.cpuLabels,
          clickItemId: clickCpuId,
          isAllLabelsSelected: isAllCpuLabelsSelected,
        }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
          title: $t('common.' + memoryTimeIntervalList[windowData.memoryIntervalIndex].name),
          name: `${$t('common.memory')}${$t('common.colon')}`,
          data: windowData.memoryData,
          timeIntervalList: timeIntervalList,
          changeInterval: changeInterval,
          type: 'memory',
          hasValue: windowData.memoryData ? true : false,
          memoryTimeIntervalList: memoryTimeIntervalList,
          cpuUsageTypeTitle:  memoryTimeIntervalList[windowData.memoryIntervalIndex].name,
          labels: windowData.memoryLabels,
          clickItemId: clickMemoryLabel,
          isAllLabelsSelected: isAllMemoryLabelsSelected
        }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
          title: $t('common.' + diskTimeIntervalList[windowData.diskIntervalIndex].name),
          name: `${$t('common.disk')}${$t('common.colon')}`,
          data: windowData.diskData,
          timeIntervalList: timeIntervalList,
          changeInterval: changeInterval,
          type: 'disk',
          hasValue: windowData.memoryData ? true : false,
          diskTimeIntervalList: diskTimeIntervalList,
          diskDirectionList: diskDirectionList,
          changeDiskDirectionIndex: changeDiskDirectionIndex,
          diskDirectionTitle: diskDirectionList[windowData.diskDirectionIndex].name,
          diskUsageTypeTitle: diskUsageTypeList[windowData.diskUsageTypeIndex].name,
          diskUsageTypeList: diskUsageTypeList,
          changeDiskUsageTypeIndex: changeDiskUsageTypeIndex,
          labels: windowData.diskDevices,
          clickItemId: clickDiskDevice,
           isAllLabelsSelected: isAllDiskDevicessSelected
        }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
          title: $t('common.' + networkTimeIntervalList[windowData.networkIntervalIndex].name),
          name: `${$t('zwatchAlarm.Network')}${$t('common.colon')}`,
          data: windowData.networkData,
          timeIntervalList: networkTimeIntervalList,
          changeInterval: changeInterval,
          type: 'network',
          hasValue: windowData.memoryData ? true : false,
          networkTimeIntervalList:networkTimeIntervalList,
          networkDirectionList: networkDirectionList,
          networkDirectioTitle: networkDirectionList[windowData.networkDirectionIndex].name,
          networkUsageTypeTitle: networkUsageTypeList[windowData.networkUsageTypeIndex].name,
          networkUsageTypeList: networkUsageTypeList,
          changeNetworkDirectionIndex: changeNetworkDirectionIndex,
          changeNetworkUsageTypeIndex: changeNetworkUsageTypeIndex,
          labels: windowData.networkDevices,
          clickItemId: clickNetworkDevice,
           isAllLabelsSelected: isAllNetworkDevicesSelected
        }"
      />
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import WindowBase from 'src/windows/Window'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  import { formatPercentage, getColors } from 'src/utils/chart.js'
  import DetailMonitor from 'src/component/Detail/Monitor'

  export default {
    name: 'HostMonitor',
    mixins: [WindowBase],
    props: ['param'],
    components: {
      'detail-monitor': DetailMonitor
    },
    data: function () {
      let timeIntervalList = [
        {
          name: '15m',
          step: 9,
          index: 0,
          value: 15 * 60
        },
        {
          name: '1h',
          step: 36,
          index: 1,
          value: 60 * 60
        },
        {
          name: '6h',
          step: 216,
          index: 2,
          value: 6 * 60 * 60
        },
        {
          name: '1d',
          step: 864,
          index: 3,
          value: 24 * 60 * 60
        },
        {
          name: '2w',
          step: 12096,
          index: 4,
          value: 14 * 24 * 60 * 60
        },
        {
          name: '8w',
          step: 48384,
          index: 5,
          value: 56 * 24 * 60 * 60
        },
        {
          name: '1y',
          step: 315360,
          index: 6,
          value: 365 * 24 * 60 * 60
        }
      ]
      return {
        currQueryInterval: null,
        queryCpuDataTimerId: null,
        showCpuIntervalDropdown: false,
        showCpuUsageDropdown: false,
        showMemoryIntervalDropdown: false,
        showDiskIntervalDropdown: false,
        showDiskDirectionDropdown: false,
        showDiskUsageTypeDropdown: false,
        showNetworkIntervalDropdown: false,
        showNetworkDirectionDropdown: false,
        showNetworkUsageTypeDropdown: false,
        showNetworkDevicesDropdown: false,
        showCpuDropdown: false,
        showMemoryDropdown: false,
        showDiskDevicesDropdown: false,
        cpuTimeIntervalList: _.cloneDeep(timeIntervalList),
        memoryTimeIntervalList: _.cloneDeep(timeIntervalList),
        diskTimeIntervalList: _.cloneDeep(timeIntervalList),
        networkTimeIntervalList: _.cloneDeep(timeIntervalList),
        timeIntervalList: timeIntervalList,
        cpuUsageTypeList: [
          {
            name: 'used',
            selected: false
          },
          {
            name: 'user',
            selected: false
          },
          {
            name: 'wait',
            selected: false
          },
          {
            name: 'system',
            selected: false
          },
          {
            name: 'idle',
            selected: false
          }
        ],
        diskDirectionList: [
          {
            name: 'read',
            selected: false
          },
          {
            name: 'write',
            selected: false
          }
        ],
        diskUsageTypeList: [
          {
            name: 'disk_octets',
            selected: false
          },
          {
            name: 'disk_ops',
            selected: false
          }
        ],
        networkDirectionList: [
          {
            name: 'rx',
            selected: false
          },
          {
            name: 'tx',
            selected: false
          }
        ],
        networkUsageTypeList: [
          {
            name: 'if_octets',
            selected: false
          },
          {
            name: 'if_packets',
            selected: false
          },
          {
            name: 'if_errors',
            selected: false
          }
        ],
        cpuMetricName: {
          single: ['CPUUsedUtilization', 'CPUUserUtilization', 'CPUWaitUtilization', 'CPUSystemUtilization', 'CPUIdleUtilization'],
          total: ['CPUAllUsedUtilization', 'CPUAllUserUtilization', 'CPUAllWaitUtilization', 'CPUAllSystemUtilization', 'CPUAllIdleUtilization']
        },
        networkLables: {
          rx: {
            if_octets: 'NetworkInBytes',
            if_packets: 'NetworkInPackets',
            if_errors: 'NetworkInErrors'
          },
          tx: {
            if_octets: 'NetworkOutBytes',
            if_packets: 'NetworkOutPackets',
            if_errors: 'NetworkOutErrors'
          }
        },
        diskLabels: {
          read: {
            disk_ops: 'DiskReadOps',
            disk_octets: 'DiskReadBytes'
          },
          write: {
            disk_ops: 'DiskWriteOps',
            disk_octets: 'DiskWriteBytes'
          }
        }
      }
    },
    created: function () {
      this.scrollContainerSelector = '.container'
      this.scrollElementSelector = '.body'
      this.updateWindow({
        dialogList: [],
        cpuLabels: [],
        diskDevices: [],
        memoryLabels: [
          {
            name: 'used',
            selected: true,
            metricName: 'MemoryUsedBytes'
          },
          {
            name: 'free',
            selected: false,
            metricName: 'MemoryFreeBytes'
          }
        ],
        networkDevices: [],
        cpuData: [],
        memoryData: [],
        diskData: [],
        networkData: [],
        cpuUsageTypeIndex: 0,
        cpuIntervalIndex: 0,
        memoryIntervalIndex: 0,
        diskIntervalIndex: 0,
        diskDirectionIndex: 0,
        diskUsageTypeIndex: 0,
        networkIntervalIndex: 0,
        networkDirectionIndex: 0,
        networkUsageTypeIndex: 0
      }).then(() => {
        this.$nextTick(() => this.query())
        if (_.isNull(this.currQueryInterval)) {
          this.currQueryInterval = setInterval(this.queryData, 20000)
        }
        this.queryCpuDataTimerId = setInterval(() => {
          // this.queryCpuData()
        }, 2000)
      })
      // if (this.uuid) {
      //   this.updateWindow({dataUuid: this.uuid})
      // }
      // pass param for desktop manager
      if (this.param) {
        this.updateWindow({dataUuid: this.param})
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
            return new Promise((resolve, reject) => { resolve() })
          })
      },
      query: function () {
        this.queryLabels()
          .then(() => {
            this.queryData()
          })
      },
      queryData: function () {
        this.queryCpuData()
        this.queryMemoryData()
        this.queryDiskData()
        this.queryNetworkData()
      },
      drawChart: function () {
        // drawChart(this.$el, '.cpu .chart-body', _.cloneDeep(this.windowData.cpuData), formatPercentage, (it) => it, 0, 100)
        // drawChart(this.$el, '.memory .chart-body', _.cloneDeep(this.windowData.memoryData), this.bytesToSizeInMonitor, (it) => { return this.bytesToSizeInMonitor(it, '', 0) }, 0)
        // drawChart(this.$el, '.disk .chart-body', _.cloneDeep(this.windowData.diskData), (it) => { return this.bytesToSizeInMonitor(it, this.diskUsageTypeList[this.windowData.diskUsageTypeIndex].name === 'disk_ops' ? 'ops/s' : 'B/s', 0) }, (it) => { return this.bytesToSizeInMonitor(it, '', 0) }, 0)
        // drawChart(this.$el, '.network .chart-body', _.cloneDeep(this.windowData.networkData), (it) => { return this.bytesToSizeInMonitor(it, this.networkUsageTypeList[this.windowData.networkUsageTypeIndex].name === 'if_octets' ? 'Bps' : 'pps', 0) }, (it) => { return this.bytesToSizeInMonitor(it, '', 0) }, 0)
      },
      queryLabels: function () {
        let self = this
        let tasks = []
        let p = null
        // p = rpc.query('prometheus/labels', {
        //   labels: ['memory']
        // }).then((resp) => {
        //   return this.updateWindow({
        //     memoryLabels: resp.inventories.memory.data.map((it) => { return { name: it, selected: it === 'used' } })
        //   })
        // })
        // tasks.push(p)
        p = rpc.query('zwatch/metrics/label-values', {
          namespace: 'ZStack/Host',
          metricName: 'NetworkInBytes',
          labelNames: 'NetworkDeviceLetter',
          filterLabels: [`HostUuid=${self.windowData.dataUuid}`, 'NetworkDeviceLetter:=NetworkDeviceLetterInDb']
        })
          .then((resp) => {
            let divicesList = []
            let divicesLabels = []
            resp.labels.forEach(function (it, index) {
              if (!divicesList.find(x => x === it.NetworkDeviceLetter)) {
                divicesList.push(it.NetworkDeviceLetter)
                divicesLabels.push({ name: it.NetworkDeviceLetter, selected: index === 0 })
              }
            })
            this.updateWindow({
              networkDevices: divicesLabels
            })
          })
        tasks.push(p)

        // p = rpc.query('prometheus/meta-data', {
        //   matches: [encodeURI('collectd:collectd_interface_if_octets_rx{hostUuid="' + self.itemData.uuid + '"}')]
        // }).then((resp) => {
        //   let interfaceList = []
        //   let interfaceLabels = []
        //   resp.inventories.data.forEach(function (it, index) {
        //     if (!interfaceList.find(x => x === it.interface)) {
        //       interfaceList.push(it.interface)
        //       interfaceLabels.push({ name: it.interface, selected: index === 0 })
        //     }
        //   })
        //   this.updateWindow({
        //     networkDevices: interfaceLabels
        //   })
        // })
        // tasks.push(p)
        p = rpc.query('zwatch/metrics/label-values', {
          namespace: 'ZStack/Host',
          metricName: 'CPUUsedUtilization',
          labelNames: 'CPUNum',
          filterLabels: `HostUuid=${self.windowData.dataUuid}`
        })
          .then((resp) => {
            let cpuList = []
            let cpuLabels = []
            resp.labels.forEach(function (it, index) {
              if (!cpuList.find(x => x === it.CPUNum)) {
                cpuList.push(it.CPUNum)
                cpuLabels.push({ name: it.CPUNum, selected: index === 0 })
              }
            })
            cpuLabels = _.sortBy(cpuLabels, (item) => parseInt(item.name))
            this.updateWindow({
              cpuLabels: cpuLabels
            })
          })
        tasks.push(p)

        // p = rpc.query('prometheus/meta-data', {
        //   matches: [encodeURI('collectd:collectd_cpu_percent{hostUuid="' + self.itemData.uuid + '"}')]
        // }).then((resp) => {
        //   let cpuList = []
        //   let cpuLabels = []
        //   resp.inventories.data.forEach(function (it, index) {
        //     if (!cpuList.find(x => x === it.cpu)) {
        //       cpuList.push(it.cpu)
        //       cpuLabels.push({ name: it.cpu, selected: index === 0 })
        //     }
        //   })
        //   this.updateWindow({
        //     cpuLabels: cpuLabels
        //   })
        // })
        // tasks.push(p)
        p = rpc.query('zwatch/metrics/label-values', {
          namespace: 'ZStack/Host',
          metricName: 'DiskReadBytes',
          labelNames: 'DiskDeviceLetter',
          filterLabels: `HostUuid=${self.windowData.dataUuid}`
        })
          .then((resp) => {
            let diskList = []
            let diskLabels = []
            resp.labels.forEach(function (it, index) {
              if (!diskList.find(x => x === it.DiskDeviceLetter)) {
                diskList.push(it.DiskDeviceLetter)
                diskLabels.push({ name: it.DiskDeviceLetter, selected: index === 0 })
              }
            })
            this.updateWindow({
              diskDevices: diskLabels
            })
          })
        tasks.push(p)

        // p = rpc.query('prometheus/meta-data', {
        //   matches: [encodeURI('collectd:collectd_disk_disk_octets_read{hostUuid="' + self.itemData.uuid + '"}')]
        // }).then((resp) => {
        //   let diskList = []
        //   let diskLabels = []
        //   resp.inventories.data.forEach(function (it, index) {
        //     if (!diskList.find(x => x === it.disk)) {
        //       diskList.push(it.disk)
        //       diskLabels.push({ name: it.disk, selected: index === 0 })
        //     }
        //   })
        //   this.updateWindow({
        //     diskDevices: diskLabels
        //   })
        // })
        // tasks.push(p)
        return Promise.all(tasks)
      },
      queryCpuData: function () {
        let self = this
        let tasks = []
        let cpuData = []
        let cpuUsageTypeIndex = self.windowData.cpuUsageTypeIndex
        let metricName = self.cpuMetricName.single[cpuUsageTypeIndex]
        let timeIndex = self.windowData.cpuIntervalIndex
        let hasTotal = false
        let cpuSelectList = []
        this.selectedCpuLabels.forEach((it) => {
          if (it.name !== 'total') cpuSelectList.push(it.name)
          else hasTotal = true
        })
        for (let i = 0; i < cpuSelectList.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/Host", "metricName": "${metricName}", "period": ${self.cpuTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.cpuTimeIntervalList[timeIndex].value}, "labels": ["HostUuid= ${self.windowData.dataUuid}", "CPUNum=${it}"]}')
            put("metricData", tmp)
            `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                if (values.length > 0 && _.get(values, [0, 'labels', 'HostUuid']) !== self.windowData.dataUuid) return
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return Math.ceil(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                let labelIndex = hasTotal ? i + 1 : i
                cpuData[labelIndex] = {
                  id: it,
                  index: self.windowData.cpuLabels.findIndex((_it) => { return _it.name === it }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: formatPercentage
                }
              })
            tasks.push(p)
          })(cpuSelectList[i], i)
        }
        if (hasTotal) {
          let allMetricName = self.cpuMetricName.total[cpuUsageTypeIndex]
          let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/Host", "metricName": "${allMetricName}", "period": ${self.cpuTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.cpuTimeIntervalList[timeIndex].value}, "labels": ["HostUuid= ${self.windowData.dataUuid}"]}')
          put("metricData", tmp)`
          let p = rpc.query('batch-queries', {
            script: encodeURIComponent(script)
          })
            .then((resp) => {
              let values = resp.result.metricData.result.data
              if (values.length > 0 && _.get(values, [0, 'labels', 'HostUuid']) !== self.windowData.dataUuid) return
              let _value = []
              let maxValue = _.max(values.map((it, index) => {
                _value[index] = [it.time, it.value]
                return Math.ceil(it.value)
              }))
              _value = self.initMetricData(timeIndex, _value)
              _value.forEach((item) => {
                item[0] *= 1000
              })
              cpuData[0] = {
                id: 'total',
                index: 0,
                values: _value,
                yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                formataFuc: formatPercentage
              }
            })
          tasks.push(p)
        }
        if (tasks.length > 0) {
          return Promise.all(tasks).then(() => {
            self.updateWindow({ cpuData })
          })
        } else this.updateWindow({cpuData: []})
      },
      // queryCpuData: function () {
      //   // var parseTime = d3.timeParse('%Y%m%d')
      //   let cpuData = []
      //   let tasks = []
      //   let self = this
      //   for (let i = 0; i < this.selectedCpuLabels.length; i++) {
      //     (function (it, i) {
      //       let p = rpc.query('prometheus/all', {
      //         expression: self.hostCpuQueryExpression(it.name, self.cpuUsageTypeList[self.windowData.cpuUsageTypeIndex].name, self.itemData.uuid),
      //         relativeTime: self.cpuTimeIntervalList[self.windowData.cpuIntervalIndex].name,
      //         step: self.cpuTimeIntervalList[self.windowData.cpuIntervalIndex].step
      //       }).then((resp) => {
      //         let values = self.initMetricData(self.windowData.cpuIntervalIndex, resp.inventories.data.result)
      //         let maxValue = 100
      //         for (let i = 0; i < values.length; i++) {
      //           values[i][0] = new Date(values[i][0] * 1000)
      //           values[i][1] = parseFloat(values[i][1])
      //           if (maxValue < values[i][1]) maxValue = values[i][1]
      //         }

      //         cpuData[i] = {
      //           id: it.name,
      //           index: self.windowData.cpuLabels.findIndex((_it) => { return _it.name === it.name }),
      //           values,
      //           yAxis: {min: 0, max: maxValue},
      //           formataFuc: formatPercentage
      //         }
      //         return new Promise((resolve, reject) => { resolve() })
      //       })
      //       tasks.push(p)
      //     })(this.selectedCpuLabels[i], i)
      //   }
      //   if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ cpuData }))
      //   else this.updateWindow({cpuData: []})
      // },
      queryMemoryData: function () {
        let tasks = []
        let self = this
        let timeIndex = self.windowData.memoryIntervalIndex
        let memoryData = []
        for (let i = 0; i < this.selectedMemoryLabels.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/Host", "metricName": "${it.metricName}", "period": ${self.memoryTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.memoryTimeIntervalList[timeIndex].value}, "labels": ["HostUuid= ${self.windowData.dataUuid}"]}')
              put("metricData", tmp)
              `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                if (values.length > 0 && _.get(values, [0, 'labels', 'HostUuid']) !== self.windowData.dataUuid) return
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return Math.ceil(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                memoryData[i] = {
                  id: it.name,
                  index: self.windowData.memoryLabels.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: (it) => { return self.bytesToSizeInMonitor(it, '', 0) }
                }
                return new Promise((resolve, reject) => { resolve() })
              })
            tasks.push(p)
          })(this.selectedMemoryLabels[i], i)
        }
        if (tasks.length > 0) {
          return Promise.all(tasks).then(() => {
            self.updateWindow({ memoryData })
          })
        } else this.updateWindow({memoryData: []})
      },
      // queryMemoryData: function () {
      //   let memoryData = []
      //   let tasks = []
      //   let self = this
      //   for (let i = 0; i < this.selectedMemoryLabels.length; i++) {
      //     (function (it, i) {
      //       let p = rpc.query('prometheus/all', {
      //         expression: self.hostMemoryQueryExpression(it.name, self.itemData.uuid),
      //         relativeTime: self.memoryTimeIntervalList[self.windowData.memoryIntervalIndex].name,
      //         step: self.memoryTimeIntervalList[self.windowData.memoryIntervalIndex].step
      //       }).then((resp) => {
      //         let values = self.initMetricData(self.windowData.memoryIntervalIndex, resp.inventories.data.result)
      //         let maxValue = 5
      //         for (let i = 0; i < values.length; i++) {
      //           values[i][0] = new Date(values[i][0] * 1000)
      //           values[i][1] = parseFloat(values[i][1])
      //           if (maxValue < values[i][1]) maxValue = values[i][1]
      //         }
      //         memoryData[i] = {
      //           id: it.name,
      //           index: self.windowData.memoryLabels.findIndex((_it) => { return _it.name === it.name }),
      //           values,
      //           yAxis: {min: 0, max: maxValue * 1.1},
      //           formataFuc: (it) => { return self.bytesToSizeInMonitor(it, '', 0) }
      //         }
      //         return new Promise((resolve, reject) => { resolve() })
      //       })
      //       tasks.push(p)
      //     })(this.selectedMemoryLabels[i], i)
      //   }
      //   if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ memoryData }))
      //   else this.updateWindow({memoryData: []})
      // },
      queryDiskData: function () {
        let tasks = []
        let self = this
        let diskData = []
        let timeIndex = self.windowData.diskIntervalIndex
        let metricName = self.diskLabels[self.diskDirectionList[self.windowData.diskDirectionIndex].name][self.diskUsageTypeList[self.windowData.diskUsageTypeIndex].name]
        for (let i = 0; i < this.selectedDiskDevices.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/Host", "metricName": "${metricName}", "period": ${self.diskTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.diskTimeIntervalList[timeIndex].value}, "labels": ["HostUuid= ${self.windowData.dataUuid}", "DiskDeviceLetter=${it.name}"]}')
              put("metricData", tmp)
              `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                if (values.length > 0 && _.get(values, [0, 'labels', 'HostUuid']) !== self.windowData.dataUuid) return
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return Math.ceil(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                diskData[i] = {
                  id: it.name,
                  index: self.windowData.diskDevices.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: (it) => { return self.diskUsageTypeList[self.windowData.diskUsageTypeIndex].name === 'disk_ops' ? self.opsFormatter(it) : self.bytesToSizeInMonitor(it, 'B/s', 0) }
                }
                return new Promise((resolve, reject) => { resolve() })
              })
            tasks.push(p)
          })(this.selectedDiskDevices[i], i)
        }
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ diskData }))
        else this.updateWindow({diskData: []})
      },
      queryNetworkData: function () {
        let tasks = []
        let self = this
        let networkData = []
        let timeIndex = self.windowData.networkIntervalIndex
        let metricName = self.networkLables[self.networkDirectionList[self.windowData.networkDirectionIndex].name][self.networkUsageTypeList[self.windowData.networkUsageTypeIndex].name]
        for (let i = 0; i < this.selectedNetworkDevices.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/Host", "metricName": "${metricName}", "period": ${self.networkTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.networkTimeIntervalList[timeIndex].value}, "labels": ["HostUuid= ${self.windowData.dataUuid}", "NetworkDeviceLetter=${it.name}"]}')
              put("metricData", tmp)
              `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                if (values.length > 0 && _.get(values, [0, 'labels', 'HostUuid']) !== self.windowData.dataUuid) return
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return Math.ceil(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                networkData[i] = {
                  id: it.name,
                  index: self.windowData.networkDevices.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: (it) => { return self.bytesToSizeInMonitor(it, self.networkUsageTypeList[self.windowData.networkUsageTypeIndex].name === 'if_octets' ? 'B/s' : 'pps', 0) }
                }
                return new Promise((resolve, reject) => { resolve() })
              })
            tasks.push(p)
          })(this.selectedNetworkDevices[i], i)
        }
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ networkData }))
        else this.updateWindow({networkData: []})
      },
      // queryDiskData: function () {
      //   let diskData = []
      //   let tasks = []
      //   let self = this
      //   for (let i = 0; i < this.selectedDiskDevices.length; i++) {
      //     (function (it, i) {
      //       let p = rpc.query('prometheus/all', {
      //         expression: self.hostDiskQueryExpression(it.name, self.diskUsageTypeList[self.windowData.diskUsageTypeIndex].name, self.diskDirectionList[self.windowData.diskDirectionIndex].name, self.itemData.uuid),
      //         relativeTime: self.diskTimeIntervalList[self.windowData.diskIntervalIndex].name,
      //         step: self.diskTimeIntervalList[self.windowData.diskIntervalIndex].step
      //       }).then((resp) => {
      //         let values = self.initMetricData(self.windowData.diskIntervalIndex, resp.inventories.data.result)
      //         let maxValue = 5
      //         for (let i = 0; i < values.length; i++) {
      //           values[i][0] = new Date(values[i][0] * 1000)
      //           values[i][1] = parseFloat(values[i][1])
      //           if (maxValue < values[i][1]) maxValue = values[i][1]
      //         }
      //         diskData[i] = {
      //           id: it.name,
      //           index: self.windowData.diskDevices.findIndex((_it) => { return _it.name === it.name }),
      //           values,
      //           yAxis: {min: 0, max: maxValue * 1.1},
      //           formataFuc: (it) => { return self.bytesToSizeInMonitor(it, self.diskUsageTypeList[self.windowData.diskUsageTypeIndex].name === 'disk_ops' ? 'ops/s' : 'B/s', 0) }
      //         }
      //         return new Promise((resolve, reject) => { resolve() })
      //       })
      //       tasks.push(p)
      //     })(this.selectedDiskDevices[i], i)
      //   }
      //   if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ diskData }))
      //   else this.updateWindow({diskData: []})
      // },
      // queryNetworkData: function () {
      //   let networkData = []
      //   let tasks = []
      //   let self = this
      //   for (let i = 0; i < this.selectedNetworkDevices.length; i++) {
      //     (function (it, i) {
      //       let p = rpc.query('prometheus/all', {
      //         expression: self.hostNetworkQueryExpression(it.name, self.networkUsageTypeList[self.windowData.networkUsageTypeIndex].name, self.networkDirectionList[self.windowData.networkDirectionIndex].name, self.itemData.uuid),
      //         relativeTime: self.networkTimeIntervalList[self.windowData.networkIntervalIndex].name,
      //         step: self.networkTimeIntervalList[self.windowData.networkIntervalIndex].step
      //       }).then((resp) => {
      //         let values = self.initMetricData(self.windowData.networkIntervalIndex, resp.inventories.data.result)
      //         let maxValue = 5
      //         for (let i = 0; i < values.length; i++) {
      //           values[i][0] = new Date(values[i][0] * 1000)
      //           values[i][1] = parseFloat(values[i][1])
      //           if (maxValue < values[i][1]) maxValue = values[i][1]
      //         }
      //         networkData[i] = {
      //           id: it.name,
      //           index: self.windowData.networkDevices.findIndex((_it) => { return _it.name === it.name }),
      //           values,
      //           yAxis: {min: 0, max: maxValue * 1.1},
      //           formataFuc: (it) => { return self.bytesToSizeInMonitor(it, self.networkUsageTypeList[self.windowData.networkUsageTypeIndex].name === 'if_octets' ? 'Bps' : 'pps', 0) }
      //         }
      //         return new Promise((resolve, reject) => { resolve() })
      //       })
      //       tasks.push(p)
      //     })(this.selectedNetworkDevices[i], i)
      //   }
      //   if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ networkData }))
      //   else this.updateWindow({networkData: []})
      // },
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
        if (_value.length > 200) {
          console.log(_value)
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
      changeCpuUsageTypeIndex: function (index) {
        this.updateWindow({
          cpuUsageTypeIndex: index
        }).then(() => {
          this.queryCpuData()
        })
      },
      changeDiskDirectionIndex: function (index) {
        this.updateWindow({
          diskDirectionIndex: index
        }).then(() => {
          this.queryDiskData()
        })
      },
      changeDiskUsageTypeIndex: function (index) {
        this.updateWindow({
          diskUsageTypeIndex: index
        }).then(() => {
          this.queryDiskData()
        })
      },
      changeNetworkDirectionIndex: function (index) {
        this.updateWindow({
          networkDirectionIndex: index
        }).then(() => {
          this.queryNetworkData()
        })
      },
      changeNetworkUsageTypeIndex: function (index) {
        this.updateWindow({
          networkUsageTypeIndex: index
        }).then(() => {
          this.queryNetworkData()
        })
      },
      clickCpuId: function ($event, id) {
        let labels = {}
        if (id === 'all') {
          let showAll = this.isAllCpuLabelsSelected
          labels = this.windowData.cpuLabels.map((it) => {
            it = _.cloneDeep(it)
            it.selected = !showAll
            return it
          })
        } else {
          labels = this.windowData.cpuLabels.map((it) => {
            it = _.cloneDeep(it)
            if (id === it.name) it.selected = !it.selected
            return it
          })
        }
        this.updateWindow({
          cpuLabels: labels
        }).then(() => this.queryCpuData())
        $event.stopPropagation()
      },
      clickMemoryLabel: function ($event, label) {
        let labels = {}
        if (label === 'all') {
          let showAll = this.isAllMemoryLabelsSelected
          labels = this.windowData.memoryLabels.map((it) => {
            it = _.cloneDeep(it)
            it.selected = !showAll
            return it
          })
        } else {
          labels = this.windowData.memoryLabels.map((it) => {
            it = _.cloneDeep(it)
            if (label === it.name) it.selected = !it.selected
            return it
          })
        }
        this.updateWindow({
          memoryLabels: labels
        }).then(() => this.queryMemoryData())
        $event.stopPropagation()
      },
      clickDiskDevice: function ($event, label) {
        let labels = {}
        if (label === 'all') {
          let showAll = this.isAllDiskDevicessSelected
          labels = this.windowData.diskDevices.map((it) => {
            it = _.cloneDeep(it)
            it.selected = !showAll
            return it
          })
        } else {
          labels = this.windowData.diskDevices.map((it) => {
            it = _.cloneDeep(it)
            if (label === it.name) it.selected = !it.selected
            return it
          })
        }
        this.updateWindow({
          diskDevices: labels
        }).then(() => this.queryDiskData())
        $event.stopPropagation()
      },
      clickNetworkDevice: function ($event, label) {
        let labels = {}
        if (label === 'all') {
          let showAll = this.isAllNetworkDevicesSelected
          labels = this.windowData.networkDevices.map((it) => {
            it = _.cloneDeep(it)
            it.selected = !showAll
            return it
          })
        } else {
          labels = this.windowData.networkDevices.map((it) => {
            it = _.cloneDeep(it)
            if (label === it.name) it.selected = !it.selected
            return it
          })
        }
        this.updateWindow({
          networkDevices: labels
        }).then(() => this.queryNetworkData())
        $event.stopPropagation()
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
          'showCpuIntervalDropdown',
          'showCpuUsageDropdown',
          'showMemoryIntervalDropdown',
          'showDiskIntervalDropdown',
          'showDiskDirectionDropdown',
          'showDiskUsageTypeDropdown',
          'showNetworkIntervalDropdown',
          'showNetworkDirectionDropdown',
          'showNetworkUsageTypeDropdown',
          'showCpuDropdown',
          'showMemoryDropdown',
          'showDiskDevicesDropdown',
          'showNetworkDevicesDropdown'
        ]
        let obj = {}
        list.forEach((it) => {
          if (this.windowData[it]) obj[it] = false
        })
        this.updateWindow(obj)
      },
      ...{getColors},
      ...Utils
    },
    computed: {
      itemData: function () {
        return this.dbData.host[this.windowData.dataUuid]
      },
      isAllCpuLabelsSelected: function () {
        let show = true
        this.windowData.cpuLabels.forEach((it) => {
          if (!it.selected) show = false
        })
        return show
      },
      selectedCpuLabels: function () {
        let list = []
        this.windowData.cpuLabels.forEach((it) => {
          if (it.selected) list.push(it)
        })
        return list
      },
      isAllMemoryLabelsSelected: function () {
        let show = true
        this.windowData.memoryLabels.forEach((it) => {
          if (!it.selected) show = false
        })
        return show
      },
      selectedMemoryLabels: function () {
        let list = []
        this.windowData.memoryLabels.forEach((it) => {
          if (it.selected) list.push(it)
        })
        return list
      },
      isAllDiskDevicessSelected: function () {
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

</style>
