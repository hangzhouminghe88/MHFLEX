<template>
  <div class="container">
    <div class="chart">
      <detail-monitor
        :param="{
        name: $t('zwatchAlarm.CPU') + $t('common.colon'),
        title: $t('common.' + cpuTimeIntervalList[windowData.cpuIntervalIndex].name),
        timeIntervalList: cpuTimeIntervalList,
        changeInterval: changeInterval,
        type: 'cpu',
        cpuUsageTypeTitle:$t('vCenterVmMonitor.' + cpuUsageTypeList[windowData.cpuUsageTypeIndex].name),
        cpuUsageTypeList: cpuUsageTypeList,
        changeCpuUsageTypeIndex: changeCpuUsageTypeIndex,
        resource: 'vCenterVmMonitor',
        titleI18n: true,
        labels: windowData.cpuDevices,
        clickItemId:clickCpuDevice,
        showLabels: () => { return cpuUsageTypeList[windowData.cpuUsageTypeIndex].name === 'usageMhz'},
        data: windowData.cpuData,
        hasValue:  dbData.vm[windowData.dataUuid].state !== 'Stopped' && windowData.cpuData.length > 0,
        isAllLabelsSelected: isAllCpuDevicesSelected
      }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
        name: $t('common.memory') + $t('common.colon'),
        title: $t('common.' + memoryTimeIntervalList[windowData.memoryIntervalIndex].name),
        timeIntervalList: memoryTimeIntervalList,
        changeInterval: changeInterval,
        type: 'memory',
        cpuUsageTypeTitle:$t('vCenterVmMonitor.' + memoryUsageTypeList[windowData.memoryUsageTypeIndex].name),
        cpuUsageTypeList: memoryUsageTypeList,
        resource: 'vCenterVmMonitor',
        titleI18n: true,
        changeCpuUsageTypeIndex: changeMemoryUsageTypeIndex,
        hasValue: dbData.vm[windowData.dataUuid].state !== 'Stopped' && windowData.memoryData.length > 0,
        data: windowData.memoryData,
      }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
        name: $t('common.disk') + $t('common.colon'),
        title: $t('common.' + diskTimeIntervalList[windowData.diskIntervalIndex].name),
        timeIntervalList: diskTimeIntervalList,
         changeInterval: changeInterval,
        type: 'disk',
        cpuUsageTypeTitle:$t('vCenterVmMonitor.' + diskUsageTypeList[windowData.diskUsageTypeIndex].name),
        cpuUsageTypeList: diskUsageTypeList,
        resource: 'vCenterVmMonitor',
        titleI18n: true,
        changeCpuUsageTypeIndex: changeDiskUsageTypeIndex,
        hasValue:dbData.vm[windowData.dataUuid].state !== 'Stopped' && windowData.diskData.length > 0,
        data: windowData.diskData,
        labels: windowData.diskDevices,
        showLabels: () => {return diskUsageTypeList[windowData.diskUsageTypeIndex].name === 'read' || diskUsageTypeList[windowData.diskUsageTypeIndex].name === 'write'},
        clickItemId: clickDiskDevice,
        isAllLabelsSelected: isAllDiskDevicesSelected
      }"
      />
    </div>
    <div class="chart">
      <detail-monitor
                      :param="{
        name: $t('common.virtualDisk') + $t('common.colon'),
        title: $t('common.' + virtualDiskTimeIntervalList[windowData.virtualDiskIntervalIndex].name),
        timeIntervalList: virtualDiskTimeIntervalList,
         changeInterval: changeInterval,
        type: 'virtualDisk',
        cpuUsageTypeTitle:$t('vCenterVmMonitor.' + virtualDiskUsageTypeList[windowData.virtualDiskUsageTypeIndex].name),
        cpuUsageTypeList: virtualDiskUsageTypeList,
        resource: 'vCenterVmMonitor',
        titleI18n: true,
        changeCpuUsageTypeIndex: changeVirtualDiskUsageTypeIndex,
        hasValue: dbData.vm[windowData.dataUuid].state !== 'Stopped' && windowData.virtualDiskData.length > 0,
        data: windowData.virtualDiskData,
        labels: windowData.virtualDiskDevices,
        clickItemId: clickVirtualDiskDevice,
        isAllLabelsSelected: isAllVirtualDiskDevicesSelected
      }"
      />
    </div>
    <div class="chart">
      <detail-monitor
        :param="{
        name: $t('zwatchAlarm.Network') + $t('common.colon'),
        title: $t('common.' + networkTimeIntervalList[windowData.networkIntervalIndex].name),
        timeIntervalList: networkTimeIntervalList,
        type: 'network',
        changeInterval: changeInterval,
        cpuUsageTypeTitle:$t('vCenterVmMonitor.' + networkUsageTypeList[windowData.networkUsageTypeIndex].name),
        cpuUsageTypeList: networkUsageTypeList,
        resource: 'vCenterVmMonitor',
        titleI18n: true,
        changeCpuUsageTypeIndex: changeNetworkUsageTypeIndex,
        hasValue: dbData.vm[windowData.dataUuid].state !== 'Stopped' && windowData.networkData.length > 0,
        data: windowData.networkData,
        labels: windowData.networkDevices,
        clickItemId: clickNetworkDevice,
        isAllLabelsSelected: isAllNetworkDevicesSelected
      }"
      />
    </div>
  </div>
</template>

<script>
  import vCenterMonitor from './vCenterMonitorService';
  export  default  vCenterMonitor;
</script>

<style scoped>
 .chart{
   width: 100%;
 }
</style>
