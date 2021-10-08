<script>
  import _ from 'lodash'
  import WindowBase from 'src/windows/Window'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  import {getColors, formatPercentage} from 'src/utils/chart.js'
  import DetailMonitor from 'src/component/Detail/Monitor';
  import {config} from './detailConfig.js';

  export default {
    name: 'vCenterMonitorService',
    mixins: [WindowBase],
    props: ['param'],
    components: {
      'detail-monitor': DetailMonitor
    },
    data: function () {
      let timeIntervalList = config.timeIntervalList
      return {
        queryLabelsInterval: null,
        cpuQueryInterval: null,
        memoryQueryInterval: null,
        diskQueryInterval: null,
        networkQueryInterval: null,
        virtualDiskQueryInterval: null,
        showMoreDropdownHaLevel: false,
        showCpuIntervalDropdown: false,
        showCpuUsageTypeDropdown: false,
        showCpuDropdown: false,
        showVirtualDiskDropdown: false,
        showDiskDropdown: false,
        showMemoryDropdown: false,
        showMemoryUsageTypeDropdown: false,
        showNetworkUsageDropdown: false,
        showMemoryIntervalDropdown: false,
        showVirtualDiskIntervalDropdown: false,
        showVirtualDiskUsageTypeDropdown: false,
        showDiskIntervalDropdown: false,
        showDiskUsageTypeDropdown: false,
        showNetworkIntervalDropdown: false,
        showNetworkUsageTypeDropdown: false,
        cpuTimeIntervalList: _.cloneDeep(timeIntervalList),
        memoryTimeIntervalList: _.cloneDeep(timeIntervalList),
        virtualDiskTimeIntervalList: _.cloneDeep(timeIntervalList),
        diskTimeIntervalList: _.cloneDeep(timeIntervalList),
        networkTimeIntervalList: _.cloneDeep(timeIntervalList),
        timeIntervalList: timeIntervalList,
        cpuLabels: {
          usage: 'VmCPUUsage',
          usageMhz: 'VmCPUUsageMHZ'
        },
        memoryLabels: {
          granted: 'VmMemoryGranted',
          active: 'VmMemoryActive',
          vmMemCtl: 'VmMemoryVmMemCtl',
          consumed: 'VmMemoryConsumed'
        },
        diskLabels: {
          usage: 'VmDiskUsage',
          read: 'VmDiskRead',
          write: 'VmDiskWrite',
          maxTotalLatency: 'VmDiskMaxTotalLatency'
        },
        virtualDiskLabels: {
          totalReadLatency: 'VmVirtualDiskTotalReadLatency',
          totalWriteLatency: 'VmVirtualDiskTotalWriteLatency'
        },
        networkLabels: {
          usage: 'VmNetworkUsage',
          received: 'VmNetworkReceived',
          transmitted: 'VmNetworkTransmitted'
        },
        diskUsageTypeList: [
          {
            name: 'usage',
            selected: false
          },
          {
            name: 'read',
            selected: false
          },
          {
            name: 'write',
            selected: false
          },
          {
            name: 'maxTotalLatency',
            selected: false
          }
        ],
        virtualDiskUsageTypeList: [
          {
            name: 'totalWriteLatency',
            selected: false
          },
          {
            name: 'totalReadLatency',
            selected: false
          }
        ],
        networkUsageTypeList: [
          {
            name: 'usage',
            selected: false
          },
          {
            name: 'received',
            selected: false
          },
          {
            name: 'transmitted',
            selected: false
          }
        ],
        cpuUsageTypeList: [
          {
            name: 'usage',
            selected: false
          },
          {
            name: 'usageMhz',
            selected: false
          }
        ],
        memoryUsageTypeList: [
          {
            name: 'granted',
            selected: false
          },
          {
            name: 'active',
            selected: false
          },
          {
            name: 'vmMemCtl',
            selected: false
          },
          {
            name: 'consumed',
            selected: false
          }
        ],
        sourceMap: {
          cpu: {
            queryInterval: 'cpuQueryInterval',
            queryFuc: 'queryCpuData',
            timeIntervalList: 'cpuTimeIntervalList',
            intervalIndex: 'cpuIntervalIndex',
            endTime: parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
          },
          memory: {
            queryInterval: 'memoryQueryInterval',
            queryFuc: 'queryMemoryData',
            timeIntervalList: 'memoryTimeIntervalList',
            intervalIndex: 'memoryIntervalIndex',
            endTime: parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
          },
          network: {
            queryInterval: 'networkQueryInterval',
            queryFuc: 'queryNetworkData',
            timeIntervalList: 'networkTimeIntervalList',
            intervalIndex: 'networkIntervalIndex',
            endTime: parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
          },
          virtualDisk: {
            queryInterval: 'virtualDiskQueryInterval',
            queryFuc: 'queryVirtualDiskData',
            timeIntervalList: 'virtualDiskTimeIntervalList',
            intervalIndex: 'virtualDiskIntervalIndex',
            endTime: parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
          },
          disk: {
            queryInterval: 'diskQueryInterval',
            queryFuc: 'queryDiskData',
            timeIntervalList: 'diskTimeIntervalList',
            intervalIndex: 'diskIntervalIndex',
            endTime: parseInt((Date.now() + window.___currServerTimeMillionDvalue) / 1000)
          }
        }
      }
    },
    created: function () {
      this.scrollContainerSelector = '.container'
      this.scrollElementSelector = '.body'
      this.updateWindow({
        dialogList: [],
        cpuDevices: [],
        virtualDiskDevices: [],
        diskDevices: [],
        networkDevices: [],
        cpuData: [],
        memoryData: [],
        virtualDiskData: [],
        diskData: [],
        networkData: [],
        cpuIntervalIndex: 0,
        cpuUsageTypeIndex: 0,
        memoryIntervalIndex: 0,
        memoryUsageTypeIndex: 0,
        diskIntervalIndex: 0,
        diskUsageTypeIndex: 0,
        virtualDiskIntervalIndex: 0,
        virtualDiskUsageTypeIndex: 0,
        networkIntervalIndex: 0,
        networkUsageTypeIndex: 0
      }).then(() => {
        this.$nextTick(() => this.query())
        let targetMap = ['cpu', 'memory', 'disk', 'virtualDisk', 'network']
        targetMap.forEach(item => this.initQueryInterval(item))
        this.queryLabelsInterval = setInterval(this.queryLabels, 20000)
      })
      if (this.param) this.updateWindow({dataUuid: this.param})
      window.addEventListener('click', this.onWindowClick)
    },
    destroyed: function () {
      clearInterval(this.cpuQueryInterval)
      clearInterval(this.memoryQueryInterval)
      clearInterval(this.diskQueryInterval)
      clearInterval(this.networkQueryInterval)
      clearInterval(this.virtualDiskQueryInterval)
      clearInterval(this.queryLabelsInterval)
    },
    methods: {
      initQueryInterval (type) {
        let item = this.sourceMap[type]
        let _step = this[item.timeIntervalList][this.windowData[item.intervalIndex]].step
        let intervalFuc = () => {
          this.initEndTime(type)
          this[item.queryFuc]()
        }
        if (_.isNull(this[item.queryInterval])) {
          this[item.queryInterval] = setInterval(intervalFuc, (_step < 9 ? 9 : _step) * 1000)
        } else {
          clearInterval(this[item.queryInterval])
          this[item.queryInterval] = setInterval(intervalFuc, (_step < 9 ? 9 : _step) * 1000)
        }
      },
      initEndTime (type) {
        let item = this.sourceMap[type]
        let _step = this[item.timeIntervalList][this.windowData[item.intervalIndex]].step
        this.sourceMap[type].endTime += (_step < 9 ? 9 : _step)
      },
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
        this.queryVirtualDiskData()
        this.queryNetworkData()
      },
      queryLabels: function () {
        const self = this
        let tasks = []
        let p = null
        if (self.windowData.cpuDevices.length === 0) {
          p = rpc.query('zwatch/metrics/label-values', {
            namespace: 'ZStack/VCenter',
            metricName: 'VmCPUUsageMHZ',
            labelNames: ['CPUNum', 'VMUuid'],
            filterLabels: `VMUuid=${self.windowData.dataUuid}`
          })
            .then((resp) => {
              let cpuList = ['']
              let cpuLabels = []
              cpuLabels.push({ name: 'None', selected: true })
              resp.labels.forEach(function (it, index) {
                if (!cpuList.find(x => x === it.CPUNum) && it.VMUuid === self.windowData.dataUuid && it.CPUNum) {
                  cpuList.push(it.CPUNum)
                  cpuLabels.push({ name: it.CPUNum, selected: true })
                }
              })
              this.updateWindow({
                cpuDevices: cpuLabels
              })
            })
          tasks.push(p)
        }

        if (self.windowData.virtualDiskDevices.length === 0) {
          p = rpc.query('zwatch/metrics/label-values', {
            namespace: 'ZStack/VCenter',
            metricName: 'VmVirtualDiskTotalReadLatency',
            labelNames: ['DiskDeviceLetter', 'VMUuid'],
            filterLabels: `VMUuid=${self.windowData.dataUuid}`
          })
            .then((resp) => {
              let virtualDiskList = []
              let virtualDiskLabels = []
              resp.labels.forEach(function (it, index) {
                if (!virtualDiskList.find(x => x === it.DiskDeviceLetter) && it.VMUuid === self.windowData.dataUuid && it.DiskDeviceLetter) {
                  virtualDiskList.push(it.DiskDeviceLetter)
                  virtualDiskLabels.push({ name: it.DiskDeviceLetter, selected: true })
                }
              })
              this.updateWindow({
                virtualDiskDevices: virtualDiskLabels
              })
            })
          tasks.push(p)
        }

        if (self.windowData.diskDevices.length === 0) {
          p = rpc.query('zwatch/metrics/label-values', {
            namespace: 'ZStack/VCenter',
            metricName: 'VmDiskWrite',
            labelNames: ['DiskDeviceLetter', 'VMUuid'],
            filterLabels: `VMUuid=${self.windowData.dataUuid}`
          })
            .then((resp) => {
              let diskList = []
              let diskLabels = []
              diskLabels.push({ name: 'None', selected: true })
              resp.labels.forEach(function (it, index) {
                if (!diskList.find(x => x === it.DiskDeviceLetter) && it.VMUuid === self.windowData.dataUuid && it.DiskDeviceLetter) {
                  diskList.push(it.DiskDeviceLetter)
                  diskLabels.push({ name: it.DiskDeviceLetter, selected: true })
                }
              })
              this.updateWindow({
                diskDevices: diskLabels
              })
            })
          tasks.push(p)
        }

        if (self.windowData.networkDevices.length === 0) {
          p = rpc.query('zwatch/metrics/label-values', {
            namespace: 'ZStack/VCenter',
            metricName: 'VmNetworkUsage',
            labelNames: ['NetworkDeviceLetter', 'VMUuid'],
            filterLabels: `VMUuid=${self.windowData.dataUuid}`
          })
            .then((resp) => {
              let networkDevicesList = []
              let networkDevicesLabels = []
              resp.labels.forEach(function (it, index) {
                if (!networkDevicesList.find(x => x === it.NetworkDeviceLetter) && it.VMUuid === self.windowData.dataUuid && it.NetworkDeviceLetter) {
                  networkDevicesList.push(it.NetworkDeviceLetter)
                  networkDevicesLabels.push({ name: it.NetworkDeviceLetter, selected: true })
                }
              })
              this.updateWindow({
                networkDevices: networkDevicesLabels
              })
            })
          tasks.push(p)
        }
        return Promise.all(tasks)
      },
      queryCpuData: function () {
        let self = this
        let tasks = []
        let cpuData = []
        let timeIndex = self.windowData.cpuIntervalIndex
        let metricName = self.cpuLabels[self.cpuUsageTypeList[self.windowData.cpuUsageTypeIndex].name]
        let selectedCpuDevices = _.cloneDeep(this.selectedCpuDevices)
        if (metricName === 'VmCPUUsage') selectedCpuDevices.length = 1
        for (let i = 0; i < selectedCpuDevices.length; i++) {
          (function (it, i) {
            let moreLabels = metricName === 'VmCPUUsageMHZ' ? `, "CPUNum=${it.name}"` : ''
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VCenter", "metricName": "${metricName}", "period": ${self.cpuTimeIntervalList[timeIndex].step}, "startTime": ${self.sourceMap.cpu.endTime - self.cpuTimeIntervalList[timeIndex].value}, "endTime": ${self.sourceMap.cpu.endTime}, "labels": ["VMUuid= ${self.windowData.dataUuid}"${moreLabels}]}')
            put("metricData", tmp)`
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                // if (values.length === 0) return
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  if (metricName === 'VmCPUUsage' && it.value > 100) it.value = 100
                  _value[index] = [it.time, it.value]
                  return parseInt(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                let formataFuc = self.cpuUsageTypeList[self.windowData.cpuUsageTypeIndex].name === 'usage' ? formatPercentage : (it) => { return parseInt(it) + ' MHz' }
                let yAxis = self.cpuUsageTypeList[self.windowData.cpuUsageTypeIndex].name === 'usage' ? {min: 0, max: maxValue > 5 ? (maxValue * 1.1 > 100 ? 100 : maxValue * 1.1) : 5} : {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5}
                cpuData[i] = {
                  id: it.name === 'None' ? self.dbData.vm[self.param].name : it.name,
                  index: self.windowData.cpuDevices.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis,
                  formataFuc
                }
              })
            tasks.push(p)
          })(selectedCpuDevices[i], i)
        }
        if (tasks.length > 0) {
          return Promise.all(tasks).then(() => {
            self.updateWindow({ cpuData })
          })
        } else self.updateWindow({cpuData: []})
      },
      queryMemoryData: function () {
        let tasks = []
        let self = this
        let timeIndex = self.windowData.memoryIntervalIndex
        let memoryData = []
        let metricName = self.memoryLabels[self.memoryUsageTypeList[self.windowData.memoryUsageTypeIndex].name]
        let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VCenter", "metricName": "${metricName}", "period": ${self.memoryTimeIntervalList[timeIndex].step}, "startTime": ${self.sourceMap.memory.endTime - self.memoryTimeIntervalList[timeIndex].value}, "endTime": ${self.sourceMap.memory.endTime}, "labels": ["VMUuid= ${self.windowData.dataUuid}"]}')
        put("metricData", tmp)`
        let p = rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        })
          .then((resp) => {
            let values = resp.result.metricData.result.data
            let _value = []
            let maxValue = _.max(values.map((it, index) => {
              _value[index] = [it.time, it.value]
              return parseInt(it.value)
            }))
            _value = self.initMetricData(timeIndex, _value)
            _value.forEach((item) => {
              item[0] *= 1000
            })
            memoryData[0] = {
              id: self.dbData.vm[self.param].name,
              index: 0,
              values: _value,
              yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
              formataFuc: (it) => { return self.bytesToSizeInMonitor(it * 1024, '', 0) }
            }
          })
        tasks.push(p)
        if (tasks.length > 0) {
          return Promise.all(tasks).then(() => {
            self.updateWindow({ memoryData })
          })
        } else this.updateWindow({memoryData: []})
      },
      queryVirtualDiskData: function () {
        let tasks = []
        let self = this
        let virtualDiskData = []
        let timeIndex = self.windowData.virtualDiskIntervalIndex
        let metricName = self.virtualDiskLabels[self.virtualDiskUsageTypeList[self.windowData.virtualDiskUsageTypeIndex].name]
        for (let i = 0; i < this.selectedVirtualDiskDevices.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VCenter", "metricName": "${metricName}", "period": ${self.virtualDiskTimeIntervalList[timeIndex].step}, "startTime": ${self.sourceMap.virtualDisk.endTime - self.virtualDiskTimeIntervalList[timeIndex].value}, "endTime": ${self.sourceMap.virtualDisk.endTime}, "labels": ["VMUuid= ${self.windowData.dataUuid}", "DiskDeviceLetter=${it.name}"]}')
              put("metricData", tmp)
              `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return parseInt(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                virtualDiskData[i] = {
                  id: it.name,
                  index: self.windowData.virtualDiskDevices.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: (it) => { return self.bytesToSizeInMonitor(it, 'ms', 0) }
                }
                return new Promise((resolve, reject) => { resolve() })
              })
            tasks.push(p)
          })(this.selectedVirtualDiskDevices[i], i)
        }
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ virtualDiskData }))
        else this.updateWindow({virtualDiskData: []})
      },
      queryDiskData: function () {
        let tasks = []
        let self = this
        let diskData = []
        let timeIndex = self.windowData.diskIntervalIndex
        let metricName = self.diskLabels[self.diskUsageTypeList[self.windowData.diskUsageTypeIndex].name]
        let selectedDiskDevices = _.cloneDeep(this.selectedDiskDevices)
        if (metricName === 'VmDiskUsage' || metricName === 'VmDiskMaxTotalLatency') selectedDiskDevices.length = 1
        for (let i = 0; i < selectedDiskDevices.length; i++) {
          (function (it, i) {
            let moreLabels = metricName === 'VmDiskRead' || metricName === 'VmDiskWrite' ? `, "DiskDeviceLetter=${it.name}"` : ''
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VCenter", "metricName": "${metricName}", "period": ${self.diskTimeIntervalList[timeIndex].step}, "startTime": ${self.sourceMap.disk.endTime - self.diskTimeIntervalList[timeIndex].value}, "endTime": ${self.sourceMap.disk.endTime}, "labels": ["VMUuid= ${self.windowData.dataUuid}"${moreLabels}]}')
              put("metricData", tmp)
              `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return parseInt(it.value)
                }))
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                let formataFuc = metricName === 'VmDiskMaxTotalLatency' ? (it) => { return self.bytesToSizeInMonitor(it, 'ms', 0) } : (it) => { return self.bytesToSizeInMonitor(it * 1024, 'Bps', 0) }
                diskData[i] = {
                  id: it.name === 'None' ? self.dbData.vm[self.param].name : it.name,
                  index: self.windowData.diskDevices.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc
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
        let metricName = self.networkLabels[self.networkUsageTypeList[self.windowData.networkUsageTypeIndex].name]
        for (let i = 0; i < this.selectedNetworkDevices.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VCenter", "metricName": "${metricName}", "period": ${self.networkTimeIntervalList[timeIndex].step}, "startTime": ${self.sourceMap.network.endTime - self.networkTimeIntervalList[timeIndex].value}, "endTime": ${self.sourceMap.network.endTime}, "labels": ["VMUuid= ${self.windowData.dataUuid}", "NetworkDeviceLetter=${it.name}"]}')
              put("metricData", tmp)
              `
            let p = rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            })
              .then((resp) => {
                let values = resp.result.metricData.result.data
                let _value = []
                let maxValue = _.max(values.map((it, index) => {
                  _value[index] = [it.time, it.value]
                  return parseInt(it.value)
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
                  formataFuc: (it) => { return self.bytesToSizeInMonitor(it * 1024, 'Bps', 0) }
                }
                return new Promise((resolve, reject) => { resolve() })
              })
            tasks.push(p)
          })(this.selectedNetworkDevices[i], i)
        }
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ networkData }))
        else this.updateWindow({networkData: []})
      },
      changeInterval: function (type, index) {
        let obj = {}
        obj[`${type}IntervalIndex`] = index
        this.updateWindow(obj)
          .then(() => {
            this[`query${type.charAt(0).toUpperCase() + type.slice(1)}Data`]()
            this.initQueryInterval(type)
          })
      },
      changeVirtualDiskUsageTypeIndex: function (index) {
        this.updateWindow({
          virtualDiskUsageTypeIndex: index
        }).then(() => {
          this.queryVirtualDiskData()
        })
      },
      changeDiskUsageTypeIndex: function (index) {
        this.updateWindow({
          diskUsageTypeIndex: index
        }).then(() => {
          this.queryDiskData()
        })
      },
      changeNetworkUsageTypeIndex: function (index) {
        this.updateWindow({
          networkUsageTypeIndex: index
        }).then(() => {
          this.queryNetworkData()
        })
      },
      changeCpuUsageTypeIndex: function (index) {
        this.updateWindow({
          cpuUsageTypeIndex: index
        }).then(() => {
          this.queryCpuData()
        })
      },
      changeMemoryUsageTypeIndex: function (index) {
        this.updateWindow({
          memoryUsageTypeIndex: index
        }).then(() => {
          this.queryMemoryData()
        })
      },
      clickCpuDevice: function ($event, label) {
        let labels = {}
        if (label === 'all') {
          let showAll = this.isAllCpuDevicesSelected
          labels = this.windowData.cpuDevices.map((it) => {
            it = _.cloneDeep(it)
            it.selected = !showAll
            return it
          })
        } else {
          labels = this.windowData.cpuDevices.map((it) => {
            it = _.cloneDeep(it)
            if (label === it.name) it.selected = !it.selected
            return it
          })
          $event.stopPropagation()
        }
        this.updateWindow({
          cpuDevices: labels
        }).then(() => this.queryCpuData())
      },
      clickVirtualDiskDevice: function ($event, label) {
        let labels = {}
        if (label === 'all') {
          let showAll = this.isAllVirtualDiskDevicesSelected
          labels = this.windowData.virtualDiskDevices.map((it) => {
            it = _.cloneDeep(it)
            it.selected = !showAll
            return it
          })
        } else {
          labels = this.windowData.virtualDiskDevices.map((it) => {
            it = _.cloneDeep(it)
            if (label === it.name) it.selected = !it.selected
            return it
          })
          $event.stopPropagation()
        }
        this.updateWindow({
          virtualDiskDevices: labels
        }).then(() => this.queryVirtualDiskData())
      },
      clickDiskDevice: function ($event, label) {
        let labels = {}
        if (label === 'all') {
          let showAll = this.isAllDiskDevicesSelected
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
          $event.stopPropagation()
        }
        this.updateWindow({
          diskDevices: labels
        }).then(() => this.queryDiskData())
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
      toggleDropdown: function ($event, dropdownName) {
        let obj = {}
        obj[dropdownName] = !this.windowData[dropdownName]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        let list = [
          'showCpuIntervalDropdown',
          'showMemoryIntervalDropdown',
          'showVirtualDiskIntervalDropdown',
          'showVirtualDiskUsageTypeDropdown',
          'showDiskIntervalDropdown',
          'showDiskUsageTypeDropdown',
          'showNetworkIntervalDropdown',
          'showNetworkUsageTypeDropdown',
          'showCpuDropdown',
          'showVirtualDiskDropdown',
          'showDiskDropdown',
          'showMemoryDropdown',
          'showNetworkUsageDropdown'
        ]
        let obj = {}
        list.forEach((it) => {
          if (this.windowData[it]) obj[it] = false
        })
        this.updateWindow(obj)
      },
      ...{
        getColors
      },
      initMetricData(index, value) {
        var step = this.timeIntervalList[index].step;
        var length = 100;
        var valueLenth = value.length;
        if (valueLenth >= length) return value;
        var currentTime = (Date.now() + window.___currServerTimeMillionDvalue) / 1000;
        if (valueLenth === 0) {
          var valueList = [];
          for (var i = 0; i < length; i++) {
            valueList.unshift([currentTime - i * step, 0]);
          }
          return valueList;
        }
        var startTime = valueLenth > 0 ? value[0][0] : currentTime;
        var endTime = valueLenth > 0 ? value[valueLenth - 1][0] : currentTime;
        var _value = [];
        if (currentTime - endTime > step + 10) {
          for (var _i = 1; _i <= Math.round((parseInt(currentTime) - parseInt(endTime)) / step); _i++) {
            value.push([parseInt(endTime) + _i * step, 0]);
          }
        }
        valueLenth = value.length;
        for (var _i2 = 0; _i2 < valueLenth; _i2++) {
          _value.push(value[_i2]);
          if (_i2 + 1 < value.length && value[_i2 + 1][0] - value[_i2][0] > step) {
            var num = Math.round((value[_i2 + 1][0] - value[_i2][0]) / step);
            for (var n = 1; n < num; n++) {
              _value.push([parseInt(value[_i2][0]) + step * n, 0]);
            }
          }
        }
        var _length = _value.length;
        for (var _i3 = 1; _i3 <= length - _length; _i3++) {
          _value.unshift([startTime - _i3 * step, 0]);
        }
        return _value;
      },
      getLabelValue: function getLabelValue(oldValue, newValue) {
        return newValue.map(function (item) {
          var index = _lodash2.default.findIndex(oldValue, function (it) {
            return it.name === item.name;
          });
          if (index >= 0) item.selected = oldValue[index].selected;
          return item;
        });
      },
      ...Utils
    },
    computed: {
      itemData: function () {
        return this.dbData.vm[this.windowData.dataUuid]
      },
      isAllCpuDevicesSelected: function () {
        let show = true
        this.windowData.cpuDevices.forEach((it) => {
          if (!it.selected) show = false
        })
        return show
      },
      selectedCpuDevices: function () {
        let list = []
        this.windowData.cpuDevices.forEach((it) => {
          if (it.selected) list.push(it)
        })
        return list
      },
      isAllVirtualDiskDevicesSelected: function () {
        let show = true
        this.windowData.virtualDiskDevices.forEach((it) => {
          if (!it.selected) show = false
        })
        return show
      },
      selectedVirtualDiskDevices: function () {
        let list = []
        this.windowData.virtualDiskDevices.forEach((it) => {
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
        if (this.param) {
          this.updateWindow({dataUuid: this.param}).then(() => this.query())
        }
      }
    }
  }
</script>

