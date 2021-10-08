<template>
  <div style="width: 100%">
    <div class="chart-header">
      <el-row>
        <span class="chart-name">{{param && param.name}}</span>
        <span class="zs-normal-select">
            <drop-down class="detail-dropdown">
              <span slot="title">
                <span class="text">{{param.title}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content">
                  <a v-for="it in param.timeIntervalList"
                     :class="{'paddingtop': it.index == 0, 'paddingbottom': it.index == param.timeIntervalList.length - 1 }"
                     @click="param.changeInterval(param.type, it.index)">{{ $t("common." + it.name) }}</a>
                </div>
              </span>
            </drop-down>
            <drop-down class="detail-dropdown" v-if="param && param.diskDirectionList">
               <span slot="title">
                 <span class="text">{{ param.diskDirectionTitle }}</span>
               </span>
               <span slot="content">
                  <div class="dropdown-content">
                    <a v-for="(it, index) in param.diskDirectionList" :class="{'paddingtop': index == 0, 'paddingbottom': index == param.diskDirectionList.length - 1 }" @click="param && param.changeDiskDirectionIndex(index)">{{param.titleI18n ? i18n(it.name) : it.name}}</a>
                  </div>
               </span>
            </drop-down>
          <drop-down class="detail-dropdown" v-if="param && param.cpuUsageTypeList">
               <span slot="title">
                 <span class="text">{{ param.cpuUsageTypeTitle }}</span>
               </span>
               <span slot="content">
                  <div class="dropdown-content">
                    <a v-for="(it, index) in param.cpuUsageTypeList" :class="{'paddingtop': index == 0, 'paddingbottom': index == param.cpuUsageTypeList.length - 1 }" @click="param && param.changeCpuUsageTypeIndex(index)">{{param.titleI18n ? i18n(it.name) : it.name}}</a>
                  </div>
               </span>
            </drop-down>
           <drop-down class="detail-dropdown" v-if="param && param.diskUsageTypeList">
              <span slot="title">
                <span class="text">{{ param.diskUsageTypeTitle }}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content">
                  <a v-for="(it, index) in param.diskUsageTypeList" :class="{'paddingtop': index == 0, 'paddingbottom': index == param.diskUsageTypeList.length - 1 }" @click="param && param.changeDiskUsageTypeIndex(index)">{{param.titleI18n ? i18n(it.name) : it.name}}</a>
                </div>
              </span>
            </drop-down>
            <drop-down class="detail-dropdown" v-if="param && param.networkDirectionList">
               <span slot="title">
                  <span class="text">{{param && param.networkDirectioTitle}}</span>
               </span>
               <span slot="content">
                  <div class="dropdown-content">
                    <a v-for="(it, index) in param.networkDirectionList" :class="{'paddingtop': index == 0, 'paddingbottom': index == param.networkDirectionList.length - 1 }" @click="param && param.changeNetworkDirectionIndex(index)">{{param.titleI18n ? i18n(it.name) : it.name}}</a>
                  </div>
               </span>
            </drop-down>
            <drop-down class="detail-dropdown" v-if="param && param.networkUsageTypeList">
               <span slot="title">
                 <span class="text">{{ param && param.networkUsageTypeTitle }}</span>
               </span>
               <span slot="content">
                 <div class="dropdown-content">
                    <a v-for="(it, index) in param.networkUsageTypeList" :class="{'paddingtop': index == 0, 'paddingbottom': index == param.networkUsageTypeList.length - 1 }" @click="param && param.changeNetworkUsageTypeIndex(index)">{{param.titleI18n ? i18n(it.name) : it.name}}</a>
                 </div>
               </span>
             </drop-down>
          </span>
        <span class="chart-label-list-dropdown" v-if="showLabels && param.labels && param.labels.length > 5">
              <drop-down class="detail-dropdown">
              <span slot="title">
                <span class="text">{{ `${$t('common.all')}(${param.labels.length})` }}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content">
                  <span class="item" :class="{'active': param.isAllLabelsSelected}"
                        @click="param && param.clickItemId($event, 'all')">
                    <span>
                      <span class="dot" :style="{ 'background-color': 'transparent' }"></span>
                      <span class="title">{{$t('common.all')}}</span>
                    </span>
                  </span>
                  <span class="item" :class="{'active': it.selected}" v-for="(it, index) in param.labels"
                        @click="param && param.clickItemId($event, it.name)">
                    <span>
                      <span class="dot" :style="{ 'background-color': getColor(index)}"></span>
                      <span class="title">{{ it.name }}</span>
                    </span>
                  </span>
                </div>
              </span>
            </drop-down>
          </span>
        <span class="chart-label-list" v-else-if="showLabels && param.labels && param.labels.length <=5">
            <span class="item" :class="{'active': param.isAllLabelsSelected}" @click="param.clickItemId($event, 'all')">
              <span class="title">{{$t('common.all')}}</span>
            </span>
            <span class="item" :class="{'active': it.selected}" v-for="(it, index) in param.labels"
                  @click="param && param.clickItemId($event, it.name)">
              <span>
                <span class="dot" :style="{ 'background-color': getColor(index) }"/>
                <span class="title">{{ it.name }}</span>
              </span>
            </span>
          </span>
      </el-row>
    </div>
    <div class="chart-body" v-if="showChart" style="position: relative; width: 100%;">
      <metric-charts :param="{data: param.data}"></metric-charts>
    </div>
    <div  v-if="!showChart" class="no-data">
      <img src="~assets/nodata@2x.png" class="nodata-performance" style="width: 222px; height: 123px;" />
      <p class="nodata-text">{{$t("common.noData")}}</p>
    </div>
  </div>
</template>

<script>
  import MetricCharts from 'src/component/Detail/Charts';
  import {getColors} from "../../utils/chart";

  export default {
    name: "Monitor",
    components: {
      'metric-charts': MetricCharts
    },
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    computed: {
      showLabels(){
        let self = this;
        if(self.param.showLabels) return self.param.showLabels()
        return true;
      },
      showChart(){
        let self = this;
        return self.param ? self.param.hasValue : false;
      }
    },
    methods: {
      i18n(name){
        let self = this;
        return self.$t(`${self.param.resource}.${name}`)
      },
      getColor(index){
        return getColors(index)
      },
    }
  }
</script>

<style scoped>
  .chart-no-text{
    height: 300px;
    text-align: center;
  }
 .no-data{
   width: 222px;
   margin: 0 auto;
   position: relative;
 }
 .nodata-text{
   width: 100%;
   text-align: center;
   padding-top: 10px;
 }
</style>
