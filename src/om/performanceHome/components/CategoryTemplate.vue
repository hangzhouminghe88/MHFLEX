<template>
  <div>
    <div class="metric-header">
      <div class="current-value">{{ fuc ? fuc(currentValue) : currentValue }}</div>
      <div class="metric-title">{{name}}</div>
    </div>
    <div class="metric-body"></div>
  </div>
</template>

<script>
  import echarts from 'src/utils/echarts/echarts'
  import Utils from 'src/utils/utils';
  import { dateFormat } from 'src/utils/filter';
  export default {
    name: "CategoryTemplate",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    mounted(){
      let self = this;
      self.chart = echarts.init(self.$el.querySelector('.metric-body'));
      this.init(this.param.data)
    },
    created: function () {
      window.addEventListener('resize', this.resizeCharts)
    },
    destroyed: function () {
      window.removeEventListener('resize', this.resizeCharts)
    },
    data(){
      let self = this;
      return {
        isLoad: false,
        fuc: null,
        title: '',
        isDouble: false,
        currentValue: '',
        name: null,
        data: {
          dataList: [{
            values: [],
            color: {
              line: '#0098FF',
              start: 'rgba(0, 152, 256, 0.8)',
              end: 'rgba(0, 152, 256, 0)'
            }
          }],
          name: ''
        },
        option: {
          tooltip: {
            trigger: 'axis',
            confine: true,
            position: function (pt, params, dom, rect, size) {
              let left = pt[0] + 10
              let top = pt[1] + 10
              if (dom.clientHeight + pt[1] + 60 > size.viewSize[1]) top = pt[1] - dom.clientHeight - 10
              if (dom.clientWidth + pt[0] + 60 > size.viewSize[0]) left = pt[0] - dom.clientWidth - 10
              if (dom.clientWidth - pt[0] > 60) left = pt[0] + 10
              return [left, top]
            },
            formatter: function (params, ticket) {
              let date = new Date();
              let time = params[0].name.split(' ')[0] + '(' + params[0].name.split(' ')[1] + ')';
                let str = `<div style="padding: 0px 20px 0px 0px;">${time}<br/>`
              params.forEach((item) => {
                let seriesName = self.param.data.title
                let data = _.has(self.data, 'fuc') ? self.data.fuc(item.data) : item.data.toFixed(2);
                str += `<div style="margin-top: 10px"><span style='background-color: ${item.color}; display: inline-block; width: 6px; height: 6px; border-radius: 3px;margin-right: 10px;'></span><span style="margin-right: 10%; color: #5E6978">${seriesName}</span><span style="color:#1A2736; margin-left:0px;">${data}</span><br/></div></div>`
              })
              return str
            },
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: '#EEF3F7',
            borderWidth: 1,
            extraCssText: 'box-shadow: 0 2px 4px 0 rgba(217,225,233,0.40);border-radius: 2px;padding: 10px;',
            textStyle: {
              color: '#5E6978',
              fontFamily: 'PingFangSC-Regula',
              fontSize: '12'
            }
          },
          grid: {
            containLabel: true,
            top: 10,
            bottom: 0,
            left: 0,
            right: 0
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            splitNumber: 5,
            scale: true
          },
          series: []
        }
      }
    },
    methods: {
      init (data) {
        if (_.has(data, 'dataList')) {
          this.fuc = data.fuc
          this.isLoad = true
          this.data = data.dataList
          this.uuid = this.data.uuid
          // this.getResourceName('name', this.data.uuid, this)
          this.name = data.name
          this.currentValue = this.data.averageValue
          let maxValue = _.max(data.dataList.valueList.map((item) => item.value))
          let yAxis = { min: 0, max: 100 }
          if (maxValue > 100) yAxis.max = this.getMAxValue(maxValue)
          this.drawLineChart(this.chart, this.data.valueList, this.option, this.data.fuc, yAxis, this.data.name)
        }
      },
      drawLineChart: function (chart, dataList, option, formatter, yAxis, name) {
        if (!yAxis) yAxis = { min: 0, max: 100 }
        let timeLine = dataList.map(item => {
          let d = new Date(item.time * 1000)
          let hour = d.getHours() + ''
          if (hour.length === 1) hour = `0${hour}`
          let minute = d.getMinutes() + ''
          if (minute.length === 1) minute = `0${minute}`
          return dateFormat(d, 'yyyy-MM-dd hh:mm');
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
              width: 2,
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
        let newLine = _.cloneDeep(seriesLineBase)
        newLine.data = dataList.map(item => item.value)
        newLine.lineStyle.normal.color = '#0098FF'
        newLine.areaStyle.normal.color.colorStops.push({
          offset: 0, color: 'rgba(0, 152, 256, 0.4)'
        }, {
          offset: 1, color: 'rgba(0, 152, 256, 0)'
        })
        newLine.itemStyle = {
          normal: {
            color: '#0098FF'
          }
        }
        series.push(newLine)

        // let averageLineBase = {
        //   type: 'line',
        //   smooth: true,
        //   symbol: 'circle',
        //   showSymbol: false,
        //   data: series[0],
        //   lineStyle: {
        //     normal: {
        //       width: 1,
        //       color: '#5BB8FF'
        //     }
        //   }
        // }
        // let newAverageLine = _.cloneDeep(averageLineBase)
        // newAverageLine.data = dataList.map(item => this.currentValue)
        // series.push(newAverageLine)

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
      resizeCharts: function () {
        if (this.chart) this.chart.resize()
        if (document.body.clientWidth < 1280) {
          this.option.xAxis.axisLabel.interval = 7
          this.init()
        } else if (document.body.clientWidth > 1280 && this.option.xAxis.axisLabel.interval === 7) {
          this.option.xAxis.axisLabel.interval = 6
          this.init()
        }
      },
      percentFormatter: function (value) {
        if (_.isNumber(value)) return value.toFixed(2) + '%'
        else return value
      },
      ...Utils
    },
    watch: {
      'param.data': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.init(newVal);
        }
      }
    }
  }
</script>

<style scoped>
  .current-value{
    font-size: 26px;
    color: #409EFF;
  }
  .metric-header{
    width: calc(100% - 30px);
    padding: 26px 0 0;
    margin-bottom: 10px;
    top: -4px;
    position: relative;
  }
  .metric-body{
    height: 80px;
  }
</style>
