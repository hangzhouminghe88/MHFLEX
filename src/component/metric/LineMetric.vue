<template>
  <div class="line-container">
    <div class="line-chart-header" :style="{'margin-left': title === 'cpuAllUsed' ? '30px' : '50px', 'width': title === 'cpuAllUsed' ? 'calc(100% - 30px)' : 'calc(100% - 50px)'}">
      <div class="title">{{ title ? $t(`home.${title}`) : '' }}</div>
      <div class="current-value" v-if="!isDouble">{{ currentValue }}</div>
      <div class="double-value" v-else>
        <div v-for="item in currentValue" class="item">
          <div class="value">{{ item.value + '/S' }}</div>
          <div class="description">
            <span class="line" :style="{'background': item.color}"></span>
            <span class="text">{{ $t(`home.${item.text}`) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="metric-chart" :style="{'margin-left': title === 'cpuAllUsed' ? '30px' : '50px', 'width': title === 'cpuAllUsed' ? 'calc(100% - 30px)' : 'calc(100% - 50px)'}"></div>
    <loding v-show="!isLoad" :color="'#00c1de'"></loding>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Loading from 'src/component/Loading'
  import echarts from 'src/utils/echarts/echarts'
  import { formatDatetime } from 'src/utils/utils';

  export default {
    name: 'BarRatioList',
    props: ['param'],
    components: {
      'loding': Loading
    },
    created: function () {
      // this.init(this.param.data)
      window.addEventListener('resize', this.resizeCharts)
    },
    destroyed: function () {
      window.removeEventListener('resize', this.resizeCharts)
    },
    mounted: function () {
      this.chart = echarts.init(this.$el.querySelector('.metric-chart'))
      this.init(this.param.data)
    },
    data () {
      let self = this
      return {
        isLoad: false,
        title: '',
        isDouble: false,
        currentValue: '',
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
            formatter: function (params, ticket) {
              let date = self.data && self.data.dataList[0] && new Date(self.data.dataList[0].values[params[0].dataIndex].time * 1000)
              let str =   formatDatetime(date).split(' ')[0] + '(' + params[0].name + ')' + '<br/>'
              params.forEach((item) => {
                let seriesName = self.$t(`home.${item.seriesName}`)
                let data = _.has(self.data, 'fuc') ? self.data.fuc(item.data) : item.data
                str += `<div style="margin-top: 10px"><span style='background-color: ${item.color.colorStops[1].color}; display: inline-block; width: 6px; height: 6px; border-radius: 3px;margin-right: 2%;'></span><span style="margin-right: 20%; color: #5E6978">${seriesName}</span><span style="#1A2736; padding:0px 20px 0px 0px;">${data}</span><br/></div>`
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
            bottom: 30,
            left: 0,
            right: 19,
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            nameLocation: 'end',
            data: [],
            axisLine: {
              show: false,
              onZero: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              color: '#97A4B6',
            },
            splitLine: {
              show: false
            },
            //splitNumber: 5
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              color: '#97A4B6'
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#369'
              }
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
        if (_.has(data, 'title')) {
          this.title = data.title
          if (this.title === 'cpuAllUsed') this.option.grid.right = 8
        }
        if (_.has(data, 'dataList')) {
          this.isLoad = true
          this.data = data
          this.title = data.title
          if (data.dataList.length > 1) {
            this.isDouble = true
            let currentValue1 = _.last(this.data.dataList[0].values).value
            currentValue1 = _.has(this.data, 'fuc') ? this.data.fuc(currentValue1) : currentValue1
            let currentValue2 = _.last(this.data.dataList[1].values).value
            currentValue2 = _.has(this.data, 'fuc') ? this.data.fuc(currentValue2) : currentValue2
            this.currentValue = [{
              value: currentValue1,
              color: '#007FDF',
              text: data.dataList[0].id
            }, {
              value: currentValue2,
              color: '#52C4FF',
              text: data.dataList[1].id
            }]
          } else {
            let currentValue = _.last(this.data.dataList[0].values).value
            this.currentValue = _.has(this.data, 'fuc') ? this.data.fuc(currentValue) : currentValue
          }
        }
        this.drawLineChart(this.chart, this.data.dataList, this.option, this.data.fuc, this.data.yAxis, this.data.name)
      },
      drawLineChart: function (chart, dataList, option, formatter, yAxis, name) {
        if (!yAxis) yAxis = { min: 0, max: 100 }
        let timeLine = this.getTimeLine(dataList)
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
        dataList.forEach(it => {
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
      //格式化x轴
      getTimeLine: function (dataList) {
        if(!dataList[0]) return;
        let showday = false;
        showday = dataList[0].values[1] && dataList[0].values[0] ? dataList[0].values[1].time - dataList[0].values[0].time > 60 * 60 * 24 : false;
        let timeLine
        if (dataList.length > 0) {
            if (!_.isUndefined(dataList[0])) {
              timeLine = dataList[0].values.map(item => {
                if (showday) {
                  let d = new Date(item.time * 1000)
                  let month = d.getMonth() + 1 + ''
                  if (month.length === 1) month = `0${month}`
                  let day = d.getDate() + ''
                  if (day.length === 1) day = `0${day}`
                  return `${month}-${day}`
                } else {
                  let d = new Date(item.time * 1000)
                  let hour = d.getHours() + ''
                  if (hour.length === 1) hour = `0${hour}`
                  let minute = d.getMinutes() + ''
                  if (minute.length === 1) minute = `0${minute}`
                  return `${hour}:${minute}`
                }
              })
          }
        }
        return timeLine
      },
      resizeCharts: function () {
        if (this.chart) this.chart.resize()
        if (document.body.clientWidth < 1280) {
          this.option.xAxis.axisLabel.interval = 7
          this.init()
        } else if (document.body.clientWidth > 1280 && this.option.xAxis.axisLabel.interval === 7) {
          this.option.xAxis.axisLabel.interval = 3
          this.init()
        }
      },
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.init(newValue)
      }
    }
  }
</script>

<style scoped>
  .flex-div {
    display: flex;
  }

  .flex-div .body-title {
    flex: 1 1 auto;
    width: 0;
  }

  .flex-div .list-body {
    flex: 3 3 auto;
    width: 0;
  }

  .body-title {
    margin-bottom: 30px;
    font-size: 20px;
    font-family: PingFangSC-Regular;
    color: #1A2736;
  }

  .ratio-content {
    width: 100%;
    padding: 26px 30px;
  }

  .ratio-content .title {
    font-family: PingFangSC-Regular;
    font-size: 20px;
    color: #1A2736;
    letter-spacing: 0;
  }

  .list-body .title {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #5E6978;
    letter-spacing: 0;
    display: inline-block;
  }

  .list-body .ratio {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #1A2736;
    letter-spacing: 0;
    position: absolute;
    right: 0;
  }

  .list-body .total {
    width: 100%;
    height: 6px;
    background: #EEF3F7;
    border-radius: 100px;
    margin: 10px 0 10px;
  }

  .list-body .total .enable {
    background-image: linear-gradient(90deg, #1AA6FF 0%, #007FDF 100%);
    border-radius: 100px;
    height: 6px;
  }

  .list-body .spliter {
    border-top: 2px dashed #EEF3F7;
    width: 100%;
    display: inline-block;
    position: absolute;
    height: 0;
    top: 9px;
  }

  .bashed-div {
    position: relative;
    overflow: hidden;
    margin: 18px 0;
  }

  .bashed-div .title {
    padding-right: 20px;
    background: #ffffff;
  }

  .bashed-div .ratio {
    padding-left: 20px;
    background: #ffffff;
  }

  .flex-div .list-body {
    flex: 3 3 auto;
    width: 0;
  }

  .list-body .list-body-left {
    flex: 1;
    padding-right: 5%;
  }

  .list-body .list-body-right {
    flex: 1;
    padding-left: 5%;
  }

  .line-chart-header {
    width: calc(100% - 30px);
    padding: 26px 0 0;
    margin-bottom: 10px;
    top: -4px;
    position: relative;
    margin-left: 30px;
  }

  .line-chart-header .title {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #1A2736;
    letter-spacing: 0;
  }

  .line-chart-header .current-value {
    font-family: PingFangSC-Regular;
    font-size: 32px;
    color: #1A2736;
    letter-spacing: 0;
    height: 60px;
    padding-top: 5px;
  }

  .metric-chart {
    height: 160px;
    left: -2px;
    margin-left: 30px;
  }

  .double-value {
    height: 60px;
    display: flex;
    padding-top: 4px;
  }

  .double-value .item {
    flex: 1;
    padding-top: 5px;
  }

  .double-value .value {
    font-family: PingFangSC-Regular;
    font-size: 20px;
    color: #1A2736;
    letter-spacing: 0;
  }

  .double-value .line {
    width: 10px;
    height: 10px;
    display: inline-block;
    margin-right: 10px;
    position: relative;
    top: -2px;
    margin-left: 5px;
  }

  .double-value .text {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #5E6978;
    letter-spacing: 0;
  }

  .line-container{
    position: relative;
    height: 100%;
  }
</style>

