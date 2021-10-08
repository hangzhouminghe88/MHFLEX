<template>
  <div class="container">
    <div class="chart">
     <detail-monitor :param="{isAllLabelsSelected: isAllCpuLabelsSelected,
     labels: cpuLabels, clickItemId: clickCpuId,
     timeIntervalList: timeIntervalList,
     changeInterval: changeInterval,
     title:$t('common.' + cpuTimeIntervalList[windowData.cpuIntervalIndex].name),
     name: `${$t('zwatchAlarm.CPU')}(%):`,
     data: windowData.cpuData,
     type:'cpu',
     hasValue:  hasData}"></detail-monitor>
    </div>
    <div class="chart">
      <detail-monitor :param="{isAllLabelsSelected: isAllMemoryLabelsSelected,
     labels: memoryLabels,
     clickItemId: clickMemoryLabel,
     timeIntervalList: timeIntervalList,
     changeInterval: changeInterval,
     title:$t('common.' + memoryTimeIntervalList[windowData.memoryIntervalIndex].name),
     name: `${$t('common.memory')}${$t('common.colon')}`,
     data: windowData.memoryData,
     type: 'memory',
     hasValue:  hasData}"></detail-monitor>
    </div>
    <div class="chart">
      <detail-monitor :param="{isAllLabelsSelected: isAllDiskDevicesSelected,
     labels: windowData.diskDevices,
     clickItemId: clickDiskDevice,
     timeIntervalList: timeIntervalList,
     changeInterval: changeInterval,
     diskDirectionList: diskDirectionList,
     changeDiskDirectionIndex: changeDiskDirectionIndex,
     diskUsageTypeList: diskUsageTypeList,
     changeDiskUsageTypeIndex: changeDiskUsageTypeIndex,
     diskUsageTypeTitle: diskUsageTypeList[windowData.diskUsageTypeIndex].name,
     diskDirectionTitle: diskDirectionList[windowData.diskDirectionIndex].name,
     title: $t('common.' + diskTimeIntervalList[windowData.diskIntervalIndex].name),
     name: `${$t('common.disk')}${$t('common.colon')}`,
     data: windowData.diskData,
     type: 'disk',
     hasValue: hasData()}"/>
    </div>
    <div class="chart">
      <detail-monitor :param="{
       isAllLabelsSelected: isAllNetworkDevicesSelected,
       labels: windowData.networkDevices,
       clickItemId:clickNetworkDevice,
       timeIntervalList: timeIntervalList,
       changeInterval: changeInterval,
       networkDirectionList: networkDirectionList,
       networkDirectioTitle:  networkDirectionList[windowData.networkDirectionIndex].name,
       title: $t('common.' + networkTimeIntervalList[windowData.networkIntervalIndex].name),
       name: `${$t('zwatchAlarm.Network')}${$t('common.colon')}`,
       type: 'network',
       changeNetworkDirectionIndex: changeNetworkDirectionIndex,
       changeNetworkUsageTypeIndex: changeNetworkUsageTypeIndex,
       networkUsageTypeTitle: networkUsageTypeList[windowData.networkUsageTypeIndex].name,
       networkUsageTypeList: networkUsageTypeList,
       hasValue:hasData,
       data: windowData.networkData,
      }"></detail-monitor>
    </div>
    <div class="chart"></div>
  </div>
</template>

<script>
  import rpc from 'src/utils/rpc';
  import {formatPercentage } from 'src/utils/chart.js'
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import DetailMonitor from 'src/component/Detail/Monitor';
  export default {
    name: "VmMonitor",
    mixins: [WindowBase],
    props: {
      param: {
        type: String,
        default: ''
      }
    },
    components: {
      'detail-monitor': DetailMonitor
    },
    computed:{
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
    data() {
      //可选时间
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
        currQueryInterval: null,//当前定时查询Id
        queryCpuDataTimerId: null,//Cpu数据定时查询
        cpuTimeIntervalList: _.cloneDeep(timeIntervalList),
        memoryTimeIntervalList: _.cloneDeep(timeIntervalList),
        diskTimeIntervalList: _.cloneDeep(timeIntervalList),
        networkTimeIntervalList: _.cloneDeep(timeIntervalList),
        timeIntervalList: timeIntervalList,//时间选项
        cpuLabels: [],//cpu的指标
        nodataForDisk: false,//有没有磁盘数据
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
        ],//内存默认指标
        diskDirectionList: [
          {
            name: 'read',
            selected: false
          },
          {
            name: 'write',
            selected: false
          }
        ],//磁盘默认指标
        diskUsageTypeList: [
          {
            name: 'disk_octets',
            selected: false
          },
          {
            name: 'disk_ops',
            selected: false
          }
        ],//磁盘使用类型指标
        networkDirectionList: [
          {
            name: 'rx',
            selected: false
          },
          {
            name: 'tx',
            selected: false
          }
        ],//网络进出方向
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
    created(){
      //查询指标数据
      this.updateWindow({
        dialogList: [],
        diskDevices: [],
        networkDevices: [],
        cpuData: [],
        memoryData: [],
        diskData: [],
        networkData: [],
        cpuIntervalIndex: 0,
        memoryIntervalIndex: 0,
        diskIntervalIndex: 0,
        diskDirectionIndex: 0,
        diskUsageTypeIndex: 0,
        networkIntervalIndex: 0,
        networkDirectionIndex: 0,
        networkUsageTypeIndex: 0,
      }).then(() => {
        this.$nextTick(() => this.query())
        if (_.isNull(this.currQueryInterval)) {
          this.currQueryInterval = setInterval(this.queryData, 20000)//定时查询，每隔20秒查询一次
        }
        this.queryCpuDataTimerId = setInterval(() => {
        }, 2000)
      })
      if (this.param) this.updateWindow({dataUuid: this.param})
    },
    methods: {
      ...Utils,
      //查询指标数据以及指标类型
      getColor(index){
        return getColors(index);
      },
      query: function () {
        this.queryLabels()
          .then(() => {
            this.queryData()
          })
      },
      //判断是否有数据画图,当状态不是stopped的时候才有数据画图
      hasData(){
        let self = this;
        if(self.dbData.vm[self.windowData.dataUuid]){
          return self.dbData.vm[self.windowData.dataUuid].state !== 'Stopped'
        }
        return false;
      },
      //指标类型
      queryLabels () {
        this.cpuLabels = []
        this.cpuLabels.push({
          name: 'total',
          selected: true
        })
        for (let i = 0; i < this.dbData.vm[this.windowData.dataUuid].cpuNum; i++) {
          this.cpuLabels.push({
            name: i + '',
            selected: false
          })
        }
        let tasks = []
        let p = null
        p = rpc.query('zwatch/metrics/label-values', {
          namespace: 'ZStack/VM',
          metricName: 'DiskWriteOps',
          labelNames: 'DiskDeviceLetter',
          filterLabels: `VMUuid=${this.windowData.dataUuid}`
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

        p = rpc.query(`vm-instances/nics`, {
          q: `vmInstanceUuid=${this.itemData.uuid}`
        })
          .then((resp) => {
            let networkDevicesList = []
            let networkDevicesLabels = []
            resp.inventories.forEach((it, index) => {
              if (!networkDevicesList.find(x => x === it.internalName)) {
                networkDevicesList.push(it.internalName)
                networkDevicesLabels.push({ name: it.internalName, selected: index === 0 })
              }
            })
            let networkDevices = networkDevicesLabels
            this.updateWindow({
              networkDevices
            })
          })
        tasks.push(p)
        return Promise.all(tasks)
      },
      //指标数据查询
      queryData () {
        this.queryCpuData()//cpu数据
        this.queryMemoryData()//内存数据
        this.queryDiskData()//磁盘数据
        this.queryNetworkData()//网络数据
      },
      queryCpuData() {
        let self = this
        let tasks = []
        let cpuData = []
        let timeIndex = self.windowData.cpuIntervalIndex
        let hasTotal = false
        let cpuSelectList = []
        this.selectedCpuLabels.forEach((it) => {
          if (it.name !== 'total') cpuSelectList.push(it.name)
          else hasTotal = true
        })
        for (let i = 0; i < cpuSelectList.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "CPUUsedUtilization", "period": ${self.cpuTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.cpuTimeIntervalList[timeIndex].value}, "labels": ["VMUuid= ${self.windowData.dataUuid}", "CPUNum=${it}"]}')
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
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                let labelIndex = hasTotal ? i + 1 : i
                cpuData[labelIndex] = {
                  id: it,
                  index: self.cpuLabels.findIndex((_it) => { return _it.name === it }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: formatPercentage
                }
                // }
              })
            tasks.push(p)
          })(cpuSelectList[i], i)
        }
        if (hasTotal) {
          let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "CPUAllUsedUtilization", "period": ${self.cpuTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.cpuTimeIntervalList[timeIndex].value}, "labels": ["VMUuid= ${self.windowData.dataUuid}"]}')
          put("metricData", tmp)`
          let p = rpc.query('batch-queries', {
            script: encodeURIComponent(script)
          })
            .then((resp) => {
              let values = resp.result.metricData.result.data
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
              // }
            })
          tasks.push(p)
        }
        if (tasks.length > 0) {
          return Promise.all(tasks).then(() => {
            self.updateWindow({ cpuData })
          })
        } else this.updateWindow({cpuData: []})
      },
      queryMemoryData: function () {
        let tasks = []
        let self = this
        let timeIndex = self.windowData.memoryIntervalIndex
        let memoryData = []
        for (let i = 0; i < this.selectedMemoryLabels.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "${it.metricName}", "period": ${self.memoryTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.memoryTimeIntervalList[timeIndex].value}, "labels": ["VMUuid= ${self.windowData.dataUuid}"]}')
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
                _value = self.initMetricData(timeIndex, _value)
                _value.forEach((item) => {
                  item[0] *= 1000
                })
                memoryData[i] = {
                  id: it.name,
                  index: self.memoryLabels.findIndex((_it) => { return _it.name === it.name }),
                  values: _value,
                  yAxis: {min: 0, max: maxValue > 5 ? maxValue * 1.1 : 5},
                  formataFuc: (it) => { return self.bytesToSizeInMonitor(it, '', 0) }
                }
                return new Promise((resolve, reject) => { resolve() })
                // }
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
      queryDiskData: function () {
        let tasks = []
        let self = this
        let diskData = []
        let timeIndex = self.windowData.diskIntervalIndex
        let metricName = self.diskLabels[self.diskDirectionList[self.windowData.diskDirectionIndex].name][self.diskUsageTypeList[self.windowData.diskUsageTypeIndex].name]
        for (let i = 0; i < this.selectedDiskDevices.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "${metricName}", "period": ${self.diskTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.diskTimeIntervalList[timeIndex].value}, "labels": ["VMUuid= ${self.windowData.dataUuid}", "DiskDeviceLetter=${it.name}"]}')
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
                // }
              })
            tasks.push(p)
          })(this.selectedDiskDevices[i], i)
        }
        if (tasks.length > 0) {
          this.nodataForDisk = false
          return Promise.all(tasks).then(() => self.updateWindow({ diskData }))
        } else {
          this.nodataForDisk = true
          this.updateWindow({diskData: []})
        }
      },
      queryNetworkData: function () {
        let tasks = []
        let self = this
        let networkData = []
        let timeIndex = self.windowData.networkIntervalIndex
        let metricName = self.networkLables[self.networkDirectionList[self.windowData.networkDirectionIndex].name][self.networkUsageTypeList[self.windowData.networkUsageTypeIndex].name]
        for (let i = 0; i < this.selectedNetworkDevices.length; i++) {
          (function (it, i) {
            let script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "ZStack/VM", "metricName": "${metricName}", "period": ${self.networkTimeIntervalList[timeIndex].step}, "offsetAheadOfCurrentTime": ${self.networkTimeIntervalList[timeIndex].value}, "labels": ["VMUuid= ${self.windowData.dataUuid}", "NetworkDeviceLetter=${it.name}"]}')
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
                // }
              })
            tasks.push(p)
          })(this.selectedNetworkDevices[i], i)
        }
        if (tasks.length > 0) return Promise.all(tasks).then(() => self.updateWindow({ networkData }))
        else this.updateWindow({networkData: []})
      },
      initMetricData: function (index, value) {
        // if (value.length > 0) value = value[0].values
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
        if (id === 'all') {
          let showAll = this.isAllCpuLabelsSelected
          this.cpuLabels = this.cpuLabels.map((it) => {
            it.selected = !showAll
            return it
          })
        } else {
          this.cpuLabels = this.cpuLabels.map((it) => {
            if (id === it.name) it.selected = !it.selected
            return it
          })
        }
        this.queryCpuData()
        $event.stopPropagation()
      },
      clickMemoryLabel: function ($event, label) {
        if (label === 'all') {
          let showAll = this.isAllMemoryLabelsSelected
          this.memoryLabels = this.memoryLabels.map((it) => {
            it.selected = !showAll
            return it
          })
        } else {
          this.memoryLabels = this.memoryLabels.map((it) => {
            if (label === it.name) it.selected = !it.selected
            return it
          })
        }
        $event.stopPropagation()
        this.queryMemoryData()
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
      //点击网卡labels选项时触发并开始重新组合数据画图
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
    }
  }
</script>

<style scoped>

</style>
