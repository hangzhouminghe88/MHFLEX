<template>
 <div class="overview-container">
   <div class="overview-content">
     <div class="overview-header">
       {{ getBannerText() }}
     </div>
     <div class="overview-left">
       <div class="overview-left-container">
         <span class="icon-top-left"></span>
         <span class="icon-top-right"></span>
         <span class="icon-bottom-left"></span>
         <span class="icon-bottom-right"></span>
         <bar-ratio  :param="{
           title: 'overview.vmCpuLoad',
           type: 'cpu',
           dataList: vmCPUDataList,
           isConnected: isConnected.vmCpu
         }"></bar-ratio>
         <bar-ratio  :param="{
           title: 'overview.vmMemoryLoad',
           type: 'memory',
           dataList: vmMemoryDataList,
           isConnected: isConnected.vmMemory
         }"></bar-ratio>
         <bar-ratio  :param="{
           title: 'overview.hostCpuLoad',
           type: 'cpu',
           dataList: hostCPUDataList,
           isConnected: isConnected.hostCPU
         }"></bar-ratio>
         <bar-ratio  :param="{
           title: 'overview.hostMemoryLoad',
           type: 'memory',
           dataList: hostMemoryDataList,
           isConnected: isConnected.hostMemory
         }"></bar-ratio>
       </div>
     </div>
     <div class="overview-right">
       <div class="overview-right-top">
         <div class="overview-right-top-left">
           <span class="icon-top-left"></span>
           <span class="icon-top-right"></span>
           <span class="icon-bottom-left"></span>
           <span class="icon-bottom-right"></span>
           <div class="center-left">
             <line-chart :param="{
             title:'overview.cpuAllUsed',
             dataList: [cpuChartDataList],
             legend: false,
             isNoData: !isConnected.drawMetric,
             formatter: percentFormatter,
             valueRange: { min: 0, max: 100 }
           }"></line-chart>
             <line-chart :param="{
             title:'overview.diskAllOps',
             dataList: [diskReadChartDataList, diskWriteChartDataList],
             legend: true,
             isNoData: !isConnected.drawMetric,
             legendTitle: ['overview.diskReadOps', 'overview.diskWriteOps'],
             formatter: numberFormatter,
             valueRange: diskValueRange
           }"></line-chart>
           </div>
           <div class="center-right">
             <line-chart :param="{
             title:'overview.memoryUsedBytes',
             dataList: [memoryChartDataList],
             legend: false,
             isNoData: !isConnected.drawMetric,
             formatter: percentFormatter,
             valueRange: { min: 0, max: 100 }
           }"></line-chart>
             <line-chart :param="{
             title:'overview.cpuAllUsed',
             dataList: [networkRxChartDataList, networkTxChartDataList],
             legend: true,
             isNoData: !isConnected.drawMetric,
             legendTitle: ['overview.networkInBytes', 'overview.networkOutBytes'],
             formatter: numberFormatter,
             valueRange: networkValueRange
           }"></line-chart>
           </div>
         </div>
         <div class="overview-right-top-right">
           <div class="right-top">
             <zone-select-list :data="{
              getCurrZone,
              setCurrZone,
              getDropdownStatus,
              setDropdownStatus,
              setHypervisorType,
              getHypervisorType,
              getHypervisorTypeDropdownStatus,
              setHypervisorTypeDropdownStatus
            }" />
           </div>
           <div class="right-bottom">
             <span class="icon-top-left"></span>
             <span class="icon-top-right"></span>
             <span class="icon-bottom-left"></span>
             <span class="icon-bottom-right"></span>
             <div class="ratio-title">
               {{$t("overview.usage")}}
             </div>
             <div class="ratio-content">
               <pie-ratio :param="{
                 pieMetricData:{
                  name: 'CPU',
                  dataList: cpuCapacityRatio
               }}"></pie-ratio>
               <pie-ratio :param="{
                pieMetricData: {
                   name: $t('common.memory'),
                   dataList: memoryCapacityRatio
                }
               }"></pie-ratio>
               <pie-ratio :param="{
                pieMetricData: {
                   name: $t('common.primaryStorage'),
                   dataList: psCapacityRatio
                }
               }"></pie-ratio>
               <pie-ratio :param="{
                pieMetricData: {
                   name: $t('common.backupStorage'),
                   dataList: bsCapacityRatio,
                }
               }"></pie-ratio>
               <pie-ratio :param="{
                pieMetricData: {
                   name: $t('common.privateNetworkIP'),
                   dataList: privateIpCapacityRatio,
                   type: 'privateIpVersion',
                   changeIPVersion: changeIPVersion
                }
               }"></pie-ratio>
               <pie-ratio :param="{
                pieMetricData: {
                   name: $t('common.publicNetworkIP'),
                   dataList: publicIpCapacityRatio,
                   type: 'publicIpVersion',
                   changeIPVersion: changeIPVersion
                }
               }"></pie-ratio>
             </div>
           </div>
         </div>
       </div>
       <div class="overview-right-bottom">
         <div class="pie-chart-header">
           <span class="overview-icon" ></span>
           <span class="overview-title">{{$t("overview.resourceOverview")}}</span>
           <span class="header-line"></span>
           <span class="header-single-shot"></span>
         </div>
         <div class="pie-chart-container">
           <pie-chart
             :param="{
             overview: vmOverview,
             type: 'vm',
             title: 'common.vm'
           }"
           ></pie-chart>
           <pie-chart
             :param="{
             overview: hostOverview,
              title: 'common.host'
           }"
           ></pie-chart>
           <pie-chart
             :param="{
             overview: imageOverview,
              title: 'common.image'
           }"
           ></pie-chart>
           <pie-chart v-if="hypervisorType ===  'KVM'"
             :param="{
             overview: clusterOverview,
              title: 'common.cluster'
           }"
           ></pie-chart>
         </div>
       </div>
     </div>
   </div>
 </div>
</template>

<script>
  import BarRatio from "./component/BarRatio";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import ZoneSelectList from "./component/ZoneSelect";
  import PieRatio from "./component/PieRatio";
  import { parseSize } from 'src/utils/utils'
  import LineChart from "./component/LineChart";
  import PieChart from "./component/PieChart";
  import _ from 'lodash'

  export default {
    name: "OverviewPage",
    components: {PieChart, LineChart, PieRatio, ZoneSelectList, BarRatio},
    mixins: [WindowBase],
    data () {
      return {
        // intervalHandle: null,
        publicIpVersion: 'IPv4',//共有网络IP版本
        privateIpVersion: 'IPv4',//私有网络IP版本
        publicNetworkDropdownStatus: false,//是否展示network下拉框
        privateNetworkDropdownStatus: false,//是否展示network下拉框
        scale: 1.0,//放大倍数
        showMoreDropdown: false,
        isEnglish: false,
        vmCPUDataList: [],
        vmMemoryDataList: [],
        hostCPUDataList: [],
        hostMemoryDataList: [],
        clusterList: [],
        backupStorageList: [],
        selectedZone: '',
        vmOverview: {
          total: 0,
          running: 0,
          stopped: 0,
          other: 0
        },
        hostOverview: {
          total: 0,
          enabled: 0,
          disabled: 0,
          other: 0
        },
        imageOverview: {
          total: 0,
          enabled: 0,
          disabled: 0,
          other: 0
        },
        clusterOverview: {
          total: 0,
          enabled: 0,
          disabled: 0,
          other: 0
        },
        showMoreHypervisorTypeDropdown: false,
        cpuCapacityRatio: '',
        memoryCapacityRatio: '',
        psCapacityRatio: '',
        bsCapacityRatio: '',
        privateIpCapacityRatio: '',
        publicIpCapacityRatio: '',
        hypervisorType: 'KVM',
        cpuChartDataList: { values: [] },
        memoryChartDataList: { values: [] },
        diskReadChartDataList: { values: [] },
        diskWriteChartDataList: { values: [] },
        networkRxChartDataList: { values: [] },
        networkTxChartDataList: { values: [] },
        cpuChart: null,
        memoryChart: null,
        diskChart: null,
        networkChart: null,
        vmPieChart: null,
        hostPieChart: null,
        imagePieChart: null,
        clusterPieChart: null,
        cpuCapacityChart: null,
        memoryCapacityChart: null,
        psCapacityChart: null,
        bsCapacityChart: null,
        privateIpCapacityChart: null,
        publicIpCapacityChart: null,
        ratioX: document.body.clientWidth / 1920,
        ratioY: document.body.clientHeight / 1080,
        timer: false,
        reservedMemory: 1073741824,
        hostCount: 0,
        isConnected: {
          vmCpu: true,
          vmMemory: true,
          hostCPU: true,
          hostMemory: true,
          drawMetric: true
        },
        networkValueRange:{},
        diskValueRange: {},
        timerInterval: null
      }
    },
    mounted(){
      let self = this;
      //初始化画布位置
      let ratio = Math.min(self.ratioX, self.ratioY)
      document.getElementsByClassName('overview-content')[0].setAttribute('style', `transform:scale(${ratio}, ${ratio});transform-origin: left top 0px; left: ${(document.body.clientWidth - (1920 * ratio)) / 2}px`);
      window.addEventListener('resize', self.resizeCharts);
      this.query();
      self.timerInterval = setInterval((() => {
        self.query()
      }), 10000)
    },
    methods: {
      //改变Ip版本触发的回调
      changeIPVersion (ipVersion, networkType, $event) {
        if (this[networkType] === ipVersion) return
        this[networkType] = ipVersion
        this.query()
        $event.stopPropagation()
      },
      //大屏监控标题
      getBannerText () {
        let value = ''
        try {
          value = this.dbData.productInfo.overviewText
        } catch (e) {
        }
        return value
      },
      //设置当前可用区
      setCurrZone (uuid) {
        this.selectedZone = uuid
      },
      //设置当前物理机类型
      setHypervisorType (hypervisorType) {
        this.hypervisorType = hypervisorType
        this.query()
      },
      //设置ip版本下拉框是否展示
      setDropdownStatusContainer () {
        this.setDropdownStatus()
        this.setHypervisorTypeDropdownStatus()
        if (this.publicNetworkDropdownStatus) this.publicNetworkDropdownStatus = false
        if (this.privateNetworkDropdownStatus) this.privateNetworkDropdownStatus = false
        return this.setDropdownStatus()
      },
      //获得当前区域
      getCurrZone () {
        return this.selectedZone
      },
      //获得当前物理机版本
      getHypervisorType () {
        return this.hypervisorType
      },
      //是否展示network下拉框
      setDropdownStatus (status) {
        if (arguments.length > 0) {
          this.showMoreDropdown = status
          if (this.publicNetworkDropdownStatus) this.publicNetworkDropdownStatus = false
          if (this.privateNetworkDropdownStatus) this.privateNetworkDropdownStatus = false
          return
        }
        if (this.showMoreDropdown) this.showMoreDropdown = false
      },
      //设置时候展示物理机类型
      setHypervisorTypeDropdownStatus (status) {
        if (arguments.length > 0) {
          this.showMoreHypervisorTypeDropdown = status
          if (this.publicNetworkDropdownStatus) this.publicNetworkDropdownStatus = false
          if (this.privateNetworkDropdownStatus) this.privateNetworkDropdownStatus = false
          return
        }
        if (this.showMoreHypervisorTypeDropdown) this.showMoreHypervisorTypeDropdown = false
      },
      //或得物理机下拉框是否展示
      getHypervisorTypeDropdownStatus () {
        return this.showMoreHypervisorTypeDropdown
      },
      getDropdownStatus () {
        return this.showMoreDropdown
      },
      //监听resize事件
      resizeCharts(){
        this.ratioX = document.body.clientWidth / 1920
        this.ratioY = document.body.clientHeight / 1080
        let ratio = Math.min(this.ratioX, this.ratioY)
        document.getElementsByClassName('overview-content')[0].setAttribute('style', `transform:scale(${ratio}, ${ratio});transform-origin: left top 0px; left: ${(document.body.clientWidth - (1920 * ratio)) / 2}px`)
      },
      //查询数据
      query: async function () {
        //获得产品信息
        this.getProductInfo()
        //获得左侧top5数据
        this.queryPerformance()
        //或得资源数据
        this.queryResouceOverview()
        //查询中间折线图数据
        this.queryMetircData()
          .then(() => {
            this.isConnected.drawMetric = true
            this.cpuChartDataList.index = 0
            this.cpuChartDataList.color = {
              line: '#0098FF',
              start: 'rgba(0, 152, 256, 0.8)',
              end: 'rgba(0, 152, 256, 0)'
            }
            this.memoryChartDataList.index = 0
            this.memoryChartDataList.color = {
              line: '#0098FF',
              start: 'rgba(0, 152, 256, 0.8)',
              end: 'rgba(0, 152, 256, 0)'
            }
            this.diskReadChartDataList.index = 0
            this.diskWriteChartDataList.index = 1
            this.diskReadChartDataList.color = {
              line: '#0098FF',
              start: 'rgba(0, 152, 256, 0.8)',
              end: 'rgba(0, 152, 256, 0)'
            }
            this.diskWriteChartDataList.color = {
              line: '#00FFBB',
              start: 'rgba(0, 256, 187, 0.8)',
              end: 'rgba(0, 256, 187, 0)'
            }
            let maxDiskValue = _.max(this.diskReadChartDataList.values.concat(this.diskWriteChartDataList.values).map(it => Math.ceil(it.value)))
            if (maxDiskValue <= 4) this.diskValueRange = { min: 0, max: 4 }
            else this.diskValueRange = { min: 0, max: maxDiskValue * 1.1 }
            this.networkRxChartDataList.index = 0
            this.networkTxChartDataList.index = 1
            this.networkRxChartDataList.color = {
              line: '#0098FF',
              start: 'rgba(0, 152, 256, 0.8)',
              end: 'rgba(0, 152, 256, 0)'
            }
            this.networkTxChartDataList.color = {
              line: '#00FFBB',
              start: 'rgba(0, 256, 187, 0.8)',
              end: 'rgba(0, 256, 187, 0)'
            }
            let maxNetworkValue = _.max(this.networkRxChartDataList.values.concat(this.networkTxChartDataList.values).map(it => Math.ceil(it.value)))
            if (maxNetworkValue <= 4) this.networkValueRange = { min: 0, max: 4 }
            else this.networkValueRange = { min: 0, max: maxNetworkValue * 1.1 }
          }, () => {
            this.isConnected.drawMetric = false
          })
        //查询柱状图数据
        this.queryCapacity()
          .then((resp) => {
            this.cpuCapacityRatio = resp.cpuCapacityRatio;
            this.memoryCapacityRatio = resp.memoryCapacityRatio;
            this.psCapacityRatio =  resp.psCapacityRatio;
            this.bsCapacityRatio = resp.bsCapacityRatio;
            this.privateIpCapacityRatio = resp.privateIpCapacityRatio;
            this.publicIpCapacityRatio = resp.publicIpCapacityRatio;
          })
      },

      queryPerformance: function () {
        let self = this
        let vmConditions = this.selectedZone ? `zoneUuid='${this.selectedZone}' and state='Running' and type='UserVm' and hypervisorType='${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}'` : `state='Running' and type='UserVm' and hypervisorType='${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}'`
        this.queryVmCpu(vmConditions)
          .then(dataList => {
            if (!this.isConnected.vmCpu) this.isConnected.vmCpu = true
            self.vmCPUDataList = _.orderBy(dataList, ['cpuData'], ['desc'])
            self.vmCPUDataList = self.vmCPUDataList.splice(0, 5)
            if (this.vmCPUDataList.length < 5) {
              let length = this.vmCPUDataList.length
              for (let i = 0; i < 5 - length; i++) {
                this.vmCPUDataList.push({ empty: true, cpuData: 0 })
              }
            }
          }, (e) => {
            this.isConnected.vmCpu = false
          })
        this.queryVmMemory(vmConditions)
          .then(dataList => {
            if (!this.isConnected.vmMemory) this.isConnected.vmMemory = true
            this.vmMemoryDataList = _.orderBy(dataList, ['memoryData'], ['desc'])
            this.vmMemoryDataList = this.vmMemoryDataList.splice(0, 5)
            if (this.vmMemoryDataList.length < 5) {
              let length = this.vmMemoryDataList.length
              for (let i = 0; i < 5 - length; i++) {
                this.vmMemoryDataList.push({ empty: true, memoryData: 0 })
              }
            }
          }, () => {
            this.isConnected.vmMemory = false
          })

        let hostConditions = this.selectedZone ? `zoneUuid='${this.selectedZone}' and status='Connected' and hypervisorType='${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}'` : `status='Connected' and hypervisorType='${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}'`

        this.queryHostCpu(hostConditions)
          .then(dataList => {
            if (!this.isConnected.hostCPU) this.isConnected.hostCPU = true
            this.hostCPUDataList = _.orderBy(dataList, ['cpuData'], ['desc'])
            this.hostCPUDataList = this.hostCPUDataList.splice(0, 5)
            if (this.hostCPUDataList.length < 5) {
              let length = this.hostCPUDataList.length
              for (let i = 0; i < 5 - length; i++) {
                this.hostCPUDataList.push({ empty: true, cpuData: 0 })
              }
            }
          }, () => {
            this.isConnected.hostCPU = false
          })
        this.queryHostMemory(hostConditions)
          .then(dataList => {
            if (!this.isConnected.hostMemory) this.isConnected.hostMemory = true
            self.hostMemoryDataList = _.orderBy(dataList, ['memoryData'], ['desc'])
            self.hostMemoryDataList = this.hostMemoryDataList.splice(0, 5)
            if (self.hostMemoryDataList.length < 5) {
              let length = self.hostMemoryDataList.length
              for (let i = 0; i < 5 - length; i++) {
                this.hostMemoryDataList.push({ empty: true, memoryData: 0 })
              }
            }
          }, () => {
            this.isConnected.hostMemory = false
          })
      },
      //查询左侧数据
      queryCapacity: function () {
        let value = {
          cpuCapacityRatio: 0,
          memoryCapacityRatio: 0,
          psCapacityRatio: 0,
          bsCapacityRatio: 0,
          publicIpCapacityRatio: 0,
          privateIpCapacityRatio: 0
        }, self = this;
        let tasks = []
        // let overProvisioning = 1
        let p = rpc.query('global-configurations', {
          q: 'name=reservedMemory'
        })
          .then((resp) => {
            if (resp.inventories.length < 1) return new Promise((resolve, reject) => { resolve() }).catch((error) => {
              throw new Error(error);
            });
            self.reservedMemory = parseSize(resp.inventories[0].value)
            return new Promise((resolve, reject) => { resolve() }).catch((error) => {
              throw new Error(error);
            });
          })
        tasks.push(p)
        let hostConditions = ['state=Enabled', 'status=Connected', `hypervisorType=${self.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}`]
        if (self.selectedZone) {
          hostConditions.push(`zoneUuid=${self.selectedZone}`)
        } else {
          _.remove(hostConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('hosts', {
          q: hostConditions,
          count: true
        })
          .then((resp) => {
            if (resp.total) self.hostCount = resp.total
            return new Promise((resolve, reject) => { resolve() }).catch((error) => {
              throw new Error(error);
            });
          })
        tasks.push(p)
        let clusterConditions = [`hypervisorType=${self.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}`]
        if (self.selectedZone) {
          clusterConditions.push(`zoneUuid=${self.selectedZone}`)
        } else {
          _.remove(clusterConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('clusters', {
          q: clusterConditions,
          fields: 'uuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              self.clusterList = resp.inventories.map((item) => item.uuid)
            } else {
              self.clusterList = []
            }
            return new Promise((resolve, reject) => { resolve() }).catch((error) => {
              throw new Error(error);
            });
          })
        tasks.push(p)
        let backupStorageConditions = [`${self.hypervisorType === 'KVM' ? 'type!=VCenter' : 'type=VCenter'}`, '__systemTag__!?=remote,onlybackup,aliyun,remotebackup']
        if (self.selectedZone) {
          backupStorageConditions.push(`zone.uuid=${self.selectedZone}`)
        } else {
          _.remove(backupStorageConditions, item => _.includes(item, 'zone.uuid'))
        }
        p = rpc.query('backup-storage', {
          q: backupStorageConditions,
          fields: 'uuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              self.backupStorageList = resp.inventories.map((item) => item.uuid)
            } else {
              self.backupStorageList = []
            }
            return new Promise((resolve, reject) => { resolve() }).catch((error) => {
              throw new Error(error);
            });
          })
        tasks.push(p)

        return Promise.all(tasks)
          .then(() => {
            tasks = []
            if (self.clusterList.length > 0) {
              p = rpc.query('hosts/capacities/cpu-memory', { clusterUuids: self.clusterList })
                .then(resp => {
                  if (resp.totalCpu === 0) {
                    value.cpuCapacityRatio = 0
                  } else {
                    value.cpuCapacityRatio = 100 - resp.availableCpu / resp.totalCpu * 100
                  }
                  if (resp.totalMemory === 0) {
                    value.memoryCapacityRatio = 0
                  } else {
                    value.memoryCapacityRatio = (resp.totalMemory - resp.availableMemory) / (resp.totalMemory) * 100
                  }
                  return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                    throw new Error(error);
                  });
                })
              tasks.push(p)

              p = rpc.query('primary-storage/capacities', { clusterUuids: self.clusterList })
                .then(resp => {
                  if (resp.totalCapacity === 0) {
                    value.psCapacityRatio = 0
                  } else {
                    value.psCapacityRatio = 100 - resp.availableCapacity / resp.totalCapacity * 100
                  }
                  return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                    throw new Error(error);
                  });
                })
              tasks.push(p)
            } else {
              value.cpuCapacityRatio = 0
              value.memoryCapacityRatio = 0
              value.psCapacityRatio = 0
              tasks.push(Promise.resolve()).catch((error) => {
                throw new Error(error);
              });
            }
            if (self.backupStorageList.length > 0) {
              p = rpc.query('backup-storage/capacities', { backupStorageUuids: self.backupStorageList })
                .then(resp => {
                  if (resp.totalCapacity === 0) {
                    value.bsCapacityRatio = 0
                  } else {
                    value.bsCapacityRatio = 100 - resp.availableCapacity / resp.totalCapacity * 100
                  }
                  return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                    throw new Error(error);
                  });
                })
              tasks.push(p)
            } else {
              value.bsCapacityRatio = 0
            }
            let puclicL3NetworkConditions = ['category=Public', `l2Network.cluster.hypervisorType=${self.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}`]
            if (this.publicIpVersion === 'IPv4') puclicL3NetworkConditions.push('ipVersion=4')
            else if (self.publicIpVersion === 'IPv6') puclicL3NetworkConditions.push('ipVersion=6')
            if (this.selectedZone) {
              puclicL3NetworkConditions.push(`zone.uuid=${self.selectedZone}`)
            } else {
              _.remove(puclicL3NetworkConditions, item => _.includes(item, 'zone.uuid'))
            }
            p = rpc.query('l3-networks', {
              q: puclicL3NetworkConditions,
              fields: 'uuid'
            }).then(resp => {
              if (resp.inventories.length <= 0) {
                value.publicIpCapacityRatio = 0
                return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                  throw new Error(error);
                });
              }
              let uuidList = resp.inventories.map(it => it.uuid)
              return rpc.query('ip-capacity', { l3NetworkUuids: uuidList })
                .then(resp => {
                  if (resp.totalCapacity === 0) {
                    value.publicIpCapacityRatio = 0
                  } else {
                    value.publicIpCapacityRatio = resp.usedIpAddressNumber / resp.totalCapacity * 100
                  }
                  return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                    throw new Error(error);
                  });
                })
            })
            tasks.push(p)
            let privateL3NetworkConditions = ['category=Private', 'type!=L3VpcNetwork', `l2Network.cluster.hypervisorType=${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}`]
            if (self.privateIpVersion === 'IPv4') privateL3NetworkConditions.push('ipVersion=4')
            else if (self.privateIpVersion === 'IPv6') privateL3NetworkConditions.push('ipVersion=6')
            if (this.selectedZone) {
              privateL3NetworkConditions.push(`zone.uuid=${this.selectedZone}`)
            } else {
              _.remove(privateL3NetworkConditions, item => _.includes(item, 'zone.uuid'))
            }
            p = rpc.query('l3-networks', {
              q: privateL3NetworkConditions,
              fields: 'uuid'
            }).then(resp => {
              if (resp.inventories.length <= 0) {
                value.privateIpCapacityRatio = 0.0
                return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                  throw new Error(error);
                });
              }
              let uuidList = resp.inventories.map(it => it.uuid)
              return rpc.query('ip-capacity', { l3NetworkUuids: uuidList })
                .then(resp => {
                  if (resp.totalCapacity === 0) {
                    value.privateIpCapacityRatio = 0
                  } else {
                    value.privateIpCapacityRatio = resp.usedIpAddressNumber / resp.totalCapacity * 100
                  }
                  return new Promise((resolve, reject) => { resolve() }).catch((error) => {
                    throw new Error(error);
                  });
                })
            })
            tasks.push(p)
            return Promise.all(tasks)
              .then(() => {
                return new Promise((resolve, reject) => { resolve(value) }).catch((error) => {
                  throw new Error(error);
                });
              }, (e) => {
                return new Promise((resolve, reject) => { resolve(value) }).catch((error) => {
                  throw new Error(error);
                });
              })
          }, () => {
            return new Promise((resolve, reject) => { resolve(value) }).catch((error) => {
              throw new Error(error);
            });
          }).catch((error) => {
            throw new Error(error);
          });
      },
      //初始化作图数据
      queryMetircData: function () {
        this.cpuChartDataList.values = []
        this.memoryChartDataList.values = []
        this.diskReadChartDataList.values = []
        this.diskWriteChartDataList.values = []
        this.networkRxChartDataList.values = []
        this.networkTxChartDataList.values = []
        // this.currTime = Math.round(new Date().getTime() / 1000)
        let zwatchScript = this.hypervisorType === 'KVM' ? `
        zwatch{resultName='cpuAllUsed',metricName='CPUAllUsedUtilization',offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='memoryUsedBytes',metricName='MemoryUsedInPercent',offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='networkAllOutBytes',metricName='NetworkAllOutBytes',offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='networkAllInBytes',metricName='NetworkAllInBytes',offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='diskAllWriteOps',metricName='DiskAllWriteBytes',offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='diskAllReadOps',metricName='DiskAllReadBytes',offsetAheadOfCurrentTime=310,period=10}` : `
        zwatch{resultName='cpuAllUsed',metricName='HostCPUUsage',namespace='ZStack/VCenter', offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='memoryUsedBytes',metricName='HostMemoryUsage',namespace='ZStack/VCenter', offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='networkAllOutBytes',metricName='HostNetworkTransmitted',namespace='ZStack/VCenter', offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='networkAllInBytes',metricName='HostNetworkReceived',namespace='ZStack/VCenter', offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='diskAllWriteOps',metricName='HostDiskWrite',namespace='ZStack/VCenter', offsetAheadOfCurrentTime=310,period=10},
        zwatch{resultName='diskAllReadOps',metricName='HostDiskRead',namespace='ZStack/VCenter', offsetAheadOfCurrentTime=310,period=10}`
        let conditions = this.selectedZone ? `hypervisorType='${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}' and zoneUuid='${this.selectedZone}'` : `hypervisorType='${this.hypervisorType === 'KVM' ? 'KVM' : 'ESX'}'`
        let zqlScript = `query host.uuid where ${conditions} return with (${zwatchScript})`
        let self = this
        let tasks = []
        let p = rpc.query('zql', {
          zql: encodeURIComponent(zqlScript)
        }).then(resp => {
          self.cpuChartDataList = self.initMetricData([resp.results[0].returnWith.cpuAllUsed], 'cpuAllUsed')
          self.memoryChartDataList = self.initMetricData([resp.results[0].returnWith.memoryUsedBytes], 'memoryUsedBytes')
          self.diskWriteChartDataList = self.initMetricData([resp.results[0].returnWith.diskAllWriteOps], 'diskAllOps')
          self.diskReadChartDataList = self.initMetricData([resp.results[0].returnWith.diskAllReadOps], 'diskAllOps')
          self.networkRxChartDataList = self.initMetricData([resp.results[0].returnWith.networkAllInBytes], 'networkAllBytes')
          self.networkTxChartDataList = self.initMetricData([resp.results[0].returnWith.networkAllOutBytes], 'networkAllBytes')
        })
        tasks.push(p)
        return Promise.all(tasks).catch((error) => {
          throw new Error(error);
        });
      },
      //初始化作图数据
      initMetricData: function (dataList, title) {
        let value = []
        dataList.forEach((item, index) => {
          let values = []
          if (item.length === 0) {
            let currTime = (Date.now() + window.___currServerTimeMillionDvalue) / 1000
            for (let i = 30; i >= 0; i--) {
              let dummyValue = {
                time: currTime - 10 * i,
                value: 0
              }
              values.push(dummyValue)
            }
          } else {
            let data = _.groupBy(item, 'time')
            for (let key in data) {
              let _value
              if (title === 'networkAllBytes' || title === 'diskAllOps') _value = _.sumBy(data[key], function (o) { return o.value })
              else _value = _.sumBy(data[key], function (o) { return o.value }) / data[key].length
              values.push({
                time: key,
                value: _value
              })
            }
            if (values.length < 31) {
              let dataList = []
              let length = values.length
              let minTime = parseInt(values[0].time)
              for (let i = 1; i <= 31 - length; i++) {
                dataList.push({
                  time: minTime - (31 - length - i) * 10,
                  value: 0
                })
              }
              values = dataList.concat(values)
            }
          }
          value = values
        })
        return {values: value}
      },
      //查询右侧最下方饼图数据
      queryResouceOverview: function () {
        let tasks = []
        let totalVmConditions = ['type=UserVm', 'hypervisorType=KVM', 'state!=Destroyed']
        if (this.selectedZone) {
          totalVmConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(totalVmConditions, item => _.includes(item, 'zoneUuid'))
        }
        let p = rpc.query('vm-instances', {
          q: totalVmConditions,
          count: true
        })
          .then(resp => {
            this.vmOverview.total = resp.total
          })
        let runningVmConditions = ['type=UserVm', 'hypervisorType=KVM', 'state=Running']
        if (this.selectedZone) {
          runningVmConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(runningVmConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('vm-instances', {
          q: runningVmConditions,
          count: true
        })
          .then(resp => {
            this.vmOverview.running = resp.total
          })
        tasks.push(p)
        let stoppedVmConditions = ['type=UserVm', 'hypervisorType=KVM', 'state=Stopped']
        if (this.selectedZone) {
          stoppedVmConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(stoppedVmConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('vm-instances', {
          q: stoppedVmConditions,
          count: true
        })
          .then(resp => {
            this.vmOverview.stopped = resp.total
          })
        tasks.push(p)
        let otherVmConditions = ['state!=Running', 'state!=Stopped', 'state!=Destroyed', 'type=UserVm', 'hypervisorType=KVM']
        if (this.selectedZone) {
          otherVmConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(otherVmConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('vm-instances', {
          q: otherVmConditions,
          count: true
        })
          .then(resp => {
            this.vmOverview.other = resp.total
          })
        tasks.push(p)
        let totalHostConditions = ['hypervisorType=KVM']
        if (this.selectedZone) {
          totalHostConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(totalHostConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('hosts', {
          q: totalHostConditions,
          count: true
        })
          .then(resp => {
            this.hostOverview.total = resp.total
          })
        tasks.push(p)
        let enabledHostConditions = ['hypervisorType=KVM', 'state=Enabled']
        if (this.selectedZone) {
          enabledHostConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(enabledHostConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('hosts', {
          q: enabledHostConditions,
          count: true
        })
          .then(resp => {
            this.hostOverview.enabled = resp.total
          })
        tasks.push(p)
        let disabledHostConditions = ['hypervisorType=KVM', 'state=Disabled']
        if (this.selectedZone) {
          disabledHostConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(disabledHostConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('hosts', {
          q: disabledHostConditions,
          count: true
        })
          .then(resp => {
            this.hostOverview.disabled = resp.total
          })
        tasks.push(p)
        let otherHostConditions = ['state!=Enabled', 'state!=Disabled', 'hypervisorType=KVM']
        if (this.selectedZone) {
          otherHostConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(otherHostConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('hosts', {
          q: otherHostConditions,
          count: true
        })
          .then(resp => {
            this.hostOverview.other = resp.total
          })
        tasks.push(p)
        let totalImageConditions = ['type=zstack', 'system=false', 'backupStorage.__systemTag__!=remote']
        if (this.selectedZone) {
          totalImageConditions.push(`backupStorage.zone.uuid=${this.selectedZone}`)
        } else {
          _.remove(totalImageConditions, item => _.includes(item, 'backupStorage.zone.uuid'))
        }
        p = rpc.query('images', {
          q: totalImageConditions,
          count: true
        })
          .then(resp => {
            this.imageOverview.total = resp.total
          })
        tasks.push(p)
        let enabledImageConditions = ['type=zstack', 'system=false', 'backupStorage.__systemTag__!=remote', 'state=Enabled']
        if (this.selectedZone) {
          enabledImageConditions.push(`backupStorage.zone.uuid=${this.selectedZone}`)
        } else {
          _.remove(enabledImageConditions, item => _.includes(item, 'backupStorage.zone.uuid'))
        }
        p = rpc.query('images', {
          q: enabledImageConditions,
          count: true
        })
          .then(resp => {
            this.imageOverview.enabled = resp.total
          })
        tasks.push(p)
        let disabledImageConditions = ['type=zstack', 'system=false', 'backupStorage.__systemTag__!=remote', 'state=Disabled']
        if (this.selectedZone) {
          disabledImageConditions.push(`backupStorage.zone.uuid=${this.selectedZone}`)
        } else {
          _.remove(disabledImageConditions, item => _.includes(item, 'backupStorage.zone.uuid'))
        }
        p = rpc.query('images', {
          q: disabledImageConditions,
          count: true
        })
          .then(resp => {
            this.imageOverview.disabled = resp.total
          })
        tasks.push(p)
        let otherImageConditions = ['type=zstack', 'system=false', 'backupStorage.__systemTag__!=remote', 'state!=Enabled', 'state!=Disabled']
        if (this.selectedZone) {
          otherImageConditions.push(`backupStorage.zone.uuid=${this.selectedZone}`)
        } else {
          _.remove(otherImageConditions, item => _.includes(item, 'backupStorage.zone.uuid'))
        }
        p = rpc.query('images', {
          q: otherImageConditions,
          count: true
        })
          .then(resp => {
            this.imageOverview.other = resp.total
          })
        tasks.push(p)
        let totalClusterConditions = ['hypervisorType=kvm']
        if (this.selectedZone) {
          totalClusterConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(totalClusterConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('clusters', {
          q: totalClusterConditions,
          count: true
        }).then(resp => {
          this.clusterOverview.total = resp.total
        })
        tasks.push(p)
        let enabledClusterConditions = ['hypervisorType=kvm', 'state=Enabled']
        if (this.selectedZone) {
          enabledClusterConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(enabledClusterConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('clusters', {
          q: enabledClusterConditions,
          count: true
        })
          .then(resp => {
            this.clusterOverview.enabled = resp.total
          })
        tasks.push(p)
        let disabledClusterConditions = ['hypervisorType=kvm', 'state=Disabled']
        if (this.selectedZone) {
          disabledClusterConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(disabledClusterConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('clusters', {
          q: disabledClusterConditions,
          count: true
        })
          .then(resp => {
            this.clusterOverview.disabled = resp.total
          })
        tasks.push(p)
        let otherClusterConditions = ['hypervisorType=kvm', 'state!=Enabled', 'state!=Disabled']
        if (this.selectedZone) {
          otherClusterConditions.push(`zoneUuid=${this.selectedZone}`)
        } else {
          _.remove(otherClusterConditions, item => _.includes(item, 'zoneUuid'))
        }
        p = rpc.query('clusters', {
          q: otherClusterConditions,
          count: true
        })
          .then(resp => {
            this.clusterOverview.other = resp.total
          })
        tasks.push(p)

        return Promise.all(tasks).catch((error) => {
          throw new Error(error);
        });
      },
      queryVmCpu: function (conditions) {
        let zwatchScript = this.hypervisorType === 'KVM' ? `zwatch{resultName='CPUAllUsedUtilization',offsetAheadOfCurrentTime=1,metricName='CPUUsedUtilization',functions='average(groupBy="VMUuid")', functions='top(num=5)'}` : `zwatch{resultName='CPUAllUsedUtilization', namespace='ZStack/VCenter',offsetAheadOfCurrentTime=1,metricName='VmCPUUsage',functions='average(groupBy="VMUuid")', functions='top(num=5)'}`
        let script = `query vminstance.uuid,name,cpuNum where ${conditions} return with (${zwatchScript})`
        return rpc.query('zql', {
          zql: encodeURIComponent(script)
        }).then((resp) => {
          let inventories = resp.results[0].inventories
          if (!this.isConnected.vmCpu) this.isConnected.vmCpu = true
          let dataList = []
          if (resp.results[0].returnWith.CPUAllUsedUtilization) {
            resp.results[0].returnWith.CPUAllUsedUtilization.forEach((item) => {
              let uuid = item.labels.VMUuid
              let index = _.findIndex(inventories, (o) => o.uuid === uuid)
              let obj = {
                name: inventories[index].name,
                uuid: uuid
              }
              obj.cpuData = Math.round(item.value)
              if (obj.cpuData > 100) obj.cpuData = 100
              dataList.push(obj)
            })
          }
          return new Promise((resolve, reject) => { resolve(dataList) }).catch((error) => {
            throw new Error(error);
          });
        })
      },
      queryVmMemory: function (conditions) {
        let zwatchScript = this.hypervisorType === 'KVM' ? `zwatch{resultName='MemoryUsedInPercent',offsetAheadOfCurrentTime=1,metricName='MemoryUsedInPercent',functions='average(groupBy="VMUuid")', functions='top(num=5)'}` : `zwatch{resultName='MemoryUsedInPercent', namespace='ZStack/VCenter',offsetAheadOfCurrentTime=1,metricName='VmMemoryUsage',functions='average(groupBy="VMUuid")', functions='top(num=5)'}`
        let script = `query vminstance.uuid,name,cpuNum where ${conditions} return with (${zwatchScript})`
        return rpc.query('zql', {
          zql: encodeURIComponent(script)
        }).then((resp) => {
          if (!this.isConnected.vmMemory) this.isConnected.vmMemory = true
          let inventories = resp.results[0].inventories
          let dataList = []
          if (resp.results[0].returnWith.MemoryUsedInPercent) {
            resp.results[0].returnWith.MemoryUsedInPercent.forEach((item) => {
              let uuid = item.labels.VMUuid
              let index = _.findIndex(inventories, (o) => o.uuid === uuid)
              let obj = {
                name: inventories[index].name,
                uuid: uuid
              }
              obj.memoryData = Math.round(item.value)
              if (obj.memoryData > 100) obj.memoryData = 100
              dataList.push(obj)
            })
          }
          return new Promise((resolve, reject) => { resolve(dataList) }).catch((error) => {
            throw new Error(error);
          });
        })
      },
      queryHostCpu: function (conditions) {
        let zwatchScript = this.hypervisorType === 'KVM' ? `zwatch{resultName='CPUAllUsedUtilization',offsetAheadOfCurrentTime=1,metricName='CPUUsedUtilization',functions='average(groupBy="HostUuid")', functions='top(num=5)'}` : `zwatch{resultName='CPUAllUsedUtilization', namespace='ZStack/VCenter',offsetAheadOfCurrentTime=1,metricName='HostCPUUsage',functions='average(groupBy="HostUuid")', functions='top(num=5)'}`
        let script = `query host.uuid,name where ${conditions} return with (${zwatchScript})`
        return rpc.query('zql', {
          zql: encodeURIComponent(script)
        }).then((resp) => {
          let inventories = resp.results[0].inventories
          if (!this.isConnected.hostCPU) this.isConnected.hostCPU = true
          let dataList = []
          if (resp.results[0].returnWith.CPUAllUsedUtilization) {
            resp.results[0].returnWith.CPUAllUsedUtilization.forEach((item) => {
              let uuid = item.labels.HostUuid
              let index = _.findIndex(inventories, (o) => o.uuid === uuid)
              let obj = {
                name: inventories[index].name,
                uuid: uuid
              }
              obj.cpuData = Math.round(item.value)
              if (obj.cpuData > 100) obj.cpuData = 100
              dataList.push(obj)
            })
          }
          return new Promise((resolve, reject) => { resolve(dataList) }).catch((error) => {
            throw new Error(error);
          });
        })
      },
      queryHostMemory: function (conditions) {
        let zwatchScript = this.hypervisorType === 'KVM' ? `zwatch{resultName='MemoryUsedInPercent',offsetAheadOfCurrentTime=1,metricName='MemoryUsedInPercent',functions='average(groupBy="HostUuid")', functions='top(num=5)'}` : `zwatch{resultName='MemoryUsedInPercent', namespace='ZStack/VCenter',offsetAheadOfCurrentTime=1,metricName='HostMemoryUsage',functions='average(groupBy="HostUuid")', functions='top(num=5)'}`
        let script = `query host.uuid,name where ${conditions} return with (${zwatchScript})`
        return rpc.query('zql', {
          zql: encodeURIComponent(script)
        }).then((resp) => {
          let inventories = resp.results[0].inventories
          if (!this.isConnected.hostMemory) this.isConnected.hostMemory = true
          let dataList = []
          if (resp.results[0].returnWith.MemoryUsedInPercent) {
            resp.results[0].returnWith.MemoryUsedInPercent.forEach((item) => {
              let uuid = item.labels.HostUuid
              let index = _.findIndex(inventories, (o) => o.uuid === uuid)
              let obj = {
                name: inventories[index].name,
                uuid: uuid
              }
              obj.memoryData = Math.round(item.value)
              if (obj.memoryData > 100) obj.memoryData = 100
              dataList.push(obj)
            })
          }
          return new Promise((resolve, reject) => { resolve(dataList) }).catch((error) => {
            throw new Error(error);
          });
        })
      },
      bytesToSize: function (bytes, unit, width) {
        if (typeof bytes !== 'number' || isNaN(bytes)) bytes = 0
        if (bytes < 0) bytes = 0
        if (typeof width === 'undefined') width = 2
        if (typeof unit === 'undefined') unit = 'B'
        var num = Math.pow(10, width)
        var sizes = ['K', 'M', 'G', 'T', 'P']
        if (unit) {
          sizes.unshift('')
        } else {
          sizes.unshift('Byte')
        }
        if (bytes === 0) return '0 ' + sizes[0] + unit
        var i = Math.floor(Math.log(bytes) / Math.log(1024))
        if (sizes[i] === 'B') num = 1
        if (i >= 5) i = 5
        let ret = /^(([1-9][0-9]*)|(([0]\.\d{1,1}|[1-9][0-9]*\.\d{1,1})))$/
        if (!ret.test((bytes / Math.pow(1024, i) * num) / num)) {
          let value = ((bytes / Math.pow(1024, i) * num) / num).toFixed(1)
          if (value - Math.floor(value) === 0) value = Math.floor(value)
          return value + ' ' + sizes[i] + unit
        } else return Math.round(bytes / Math.pow(1024, i) * num) / num + ' ' + sizes[i] + unit
      },
      percentFormatter: function (value) {
        return value + '%'
      },
      numberFormatter: function (value) {
        if (value < 1.0) value = 0
        return this.bytesToSize(value, '', 0)
      },
    },
    destroyed(){
      let self = this;
      if(self.timerInterval){
        clearInterval(self.timerInterval);
        self.timerInterval = null;
      }
    },
    created(){
      window.addEventListener('click', this.setDropdownStatusContainer)
      rpc.put('management-nodes/actions', {
        'getCurrentTime': {}
      })
        .then((resp) => {
          window.___currServerTimeMillionDvalue = resp.currentTime.MillionSeconds - Date.now()
        })

      if (localStorage.getItem('language') === 'en') this.isEnglish = true
      let self = this
      this.getName = self.$t
      rpc.query('licenses')
        .then((licenseResp) => {
          this.updateDbObject({
            name: 'common',
            data: {
              license: licenseResp.inventory
            }
          })
            .then(() => {
              return rpc.query('meta-data/opensource')
            })
            .then((opensourceResp) => {
              if (opensourceResp.opensource || licenseResp.inventory.licenseType === 'Community') {
                this.$router.push('/main/home')
              }
            })
        })
    },
    watch: {
      selectedZone (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.query()
        }
      },
      ratioX: function (val) {
        if (!this.timer) {
          this.ratioX = val
          this.timer = true
          let self = this
          setTimeout(function () {
            self.resizeCharts()
            self.timer = false
          })
        }
      },
      ratioY: function (val) {
        if (!this.timer) {
          this.ratioY = val
          this.timer = true
          let self = this
          setTimeout(function () {
            self.resizeCharts()
            self.timer = false
          })
        }
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../style/overview.less";
</style>
