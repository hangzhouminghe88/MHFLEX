<template>
   <div class="line-container">
     <div class="line-content">
       <div class="line-header">
         <div class="line-title">{{$t(param.title)}}</div>
         <div class="line-legend" v-if="param.legend && param.legend">
           <span class="small-square-blue"></span>
           <div class="line-legend-text">{{$t(param.legendTitle[0])}}</div>
           <div class="small-square-green"></div>
           <div class="line-legend-text">{{$t(param.legendTitle[1])}}</div>
         </div>
       </div>
       <div class="metric-content" v-show="!param.isNoData"></div>
       <div class="nodate-center" v-show="param.isNoData">
         <div class="nodeta-text">
           <img src="~assets/nodate.svg">
           <p>
             {{ $t("overview.noData") }}
           </p>
           </img>
         </div>
       </div>
     </div>
   </div>
</template>

<script>
  import echarts from 'src/utils/echarts/echarts'
  import _ from 'lodash'

  export default {
    name: "LineChart",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        option: {
          grid: {
            containLabel: true,
            top: 10,
            bottom: 0,
            left: 0,
            right: 0
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            nameLocation: 'start',
            data: [],
            axisLine: {
              lineStyle: {
                color: '#fff'
              },
              interval: 6
            },
            axisLabel: {
              show: true,
              color: '#fff',
              interval: 6
            },
            splitNumber: 5
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              color: '#fff'
            },
            splitLine: {
              lineStyle: {
                color: '#eef3f7',
                type: 'solid',
                opacity: 1.0
              }
            },
            splitNumber: 5,
            scale: true
          },
          series: []
        },
        chart: null
      }
    },
    mounted(){
      let self = this;
      self.chart = echarts.init(self.$el.querySelector('.metric-content'));
      self.drawLineChart(self.chart, self.param.dataList, self.option, self.param.formatter, self.param.valueRange);
      window.addEventListener('resize', self.resizeChart, true)
    },
    destroyed(){
      let self = this;
      window.removeEventListener('resize', self.resizeChart, true)
    },
    methods: {
      resizeChart(){
        let self = this;
        self.chart.resize();
      },
      drawLineChart: function (chart, dataList, option, formatter, yAxis) {
        let timeLine = dataList[0].values.map(item => {
          let d = new Date(item.time * 1000)
          let hour = d.getHours() + ''
          if (hour.length === 1) hour = `0${hour}`
          let minute = d.getMinutes() + ''
          if (minute.length === 1) minute = `0${minute}`
          return `${hour}:${minute}`
        })
        let series = []
        let seriesLineBase = {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          showSymbol: false,
          data: series[0],
          lineStyle: {
            normal: {
              width: 1,
              color: '#0088EF'
            }
          },
          areaStyle: {
            normal: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [],
                globalCoord: false // 缺省为 false
              }
            }
          }
        }
        dataList.forEach(it => {
          if(!it.color) return;
          let newLine = _.cloneDeep(seriesLineBase)
          newLine.data = it.values.map(item => item.value)
          newLine.name = it.id
          newLine.lineStyle.normal.color = it.color.line
          newLine.areaStyle.normal.color.colorStops.push({
            offset: 0, color: it.color.start
          }, {
            offset: 1, color: it.color.end
          })
          newLine.itemStyle = {
            normal: {
              color: it.color.line
            }
          }
          series.push(newLine)
        })
        if (chart) {
          let _option = _.cloneDeep(option)
          if (yAxis) {
            _option.yAxis.min = yAxis.min
            _option.yAxis.max = yAxis.max
            _option.yAxis.interval = yAxis.max / 4
          }
          _option.yAxis.axisLabel.formatter = formatter
          _option.xAxis.data = timeLine
          _option.series = series
          chart.setOption(_option, true)
        }
      },
    },
    watch: {
      'param.dataList': function(newVal, oldVal){
        let self = this;
        self.drawLineChart(self.chart, newVal, self.option, self.param.formatter,self.param.valueRange)
      }
    }
  }
</script>

<style scoped>
  .line-container{
    width: 100%;
    height: 240px;
  }
  .line-content{
    padding:0 25px 30px 50px;
  }
  .metric-content{
    height: 180px;
  }
  .line-title{
    height: 60px;
    line-height: 60px;
    color: #409EFF;
    font-size: 16px;
    display: inline-block;
    flex: 1;
  }
  .line-header{
    margin-top: 20px;
    display: flex;
  }
  .small-square-blue{
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #2d7de2;
    margin-right: 10px;
  }
  .small-square-green{
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #0fe;
    margin: 0 10px 0 20px;
  }
  .line-legend-text{
    display: inline-block;
  }
  .line-legend{
    display: inline-block;
    flex: 1;
    height: 60px;
    line-height: 60px;
    text-align: right;
  }
  .nodeta-text {
    width: 60px;
    height: 50px;
    position: relative;
    top: 50%;
    left: 50%;
    margin-left: -30px;
    margin-top: -25px;
    text-align: center;
  }

  .nodeta-text img {
    width: 44px;
    height: 34px;
  }

  .nodeta-text p {
    font-size: 14px;
    color: #316DE4;
    position: relative;
    margin-top: 10px;
  }

  .nodate-center {
    height: 180px;
    width: 100%;
    text-align: center;
  }
</style>
