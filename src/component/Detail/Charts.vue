<template>
   <div>
     <div class="metric-chart"></div>
     <Loading v-show="!isLoad" :color="'#00c1de'"></Loading>
   </div>
</template>

<script>
  import Loading from "../Loading";
  import echarts from 'src/utils/echarts/echarts'
  import _ from 'lodash'

    export default {
      name: "Charts",
      props: ['param'],
      components: {Loading},
      data () {
        let self = this
        let colorList = [{
          line: '#0088EF',
          start: 'rgba(0,145,255,0.10)',
          end: 'rgba(0,145,255,0.00)'
        }, {
          line: '#16BBBF',
          start: 'rgba(22, 187, 191,0.10)',
          end: 'rgba(22, 187, 191,1)'
        }, {
          line: '#F657E0',
          start: 'rgba(246, 87, 224,0.10)',
          end: 'rgba(246, 87, 224,0.00)'
        }, {
          line: '#F2AE1B',
          start: 'rgba(242, 174, 27,0.10)',
          end: 'rgba(242, 174, 27,0.00)'
        }, {
          line: '#A0BF16',
          start: 'rgba(160, 191, 22,0.10)',
          end: 'rgba(160, 191, 22,0.00)'
        }, {
          line: '#6951FF',
          start: 'rgba(105, 81, 255,0.10)',
          end: 'rgba(105, 81, 255,0.00)'
        }, {
          line: '#65CAFF',
          start: 'rgba(101, 202, 255,0.10)',
          end: 'rgba(101, 202, 255,0.00)'
        }, {
          line: '#BDA2FF',
          start: 'rgba(189, 162, 255,0.10)',
          end: 'rgba(189, 162, 255,0.00)'
        }, {
          line: '#175BB4',
          start: 'rgba(23, 91, 180,0.10)',
          end: 'rgba(23, 91, 180,0.00)'
        }]
        return {
          formataFuc: null,
          isLoad: false,
          title: '',
          isDouble: false,
          currentValue: '',
          colorList,
          data: {
            dataList: [{
              values: []
            }],
            name: ''
          },
          option: {
            tooltip: {
              trigger: 'axis',
              confine: true,
              formatter: function (params, ticket) {
                let date = new Date(self.data[0].values[params[0].dataIndex][0])
                let num = Math.ceil(params.length / 6)
                let str = `<div style="min-width: ${160 * num}px">`
                // str += '<div style="font-family: MicrosoftYaHei-Bold; font-size: 14px; color: #1A2736; width: 100%; text-align: center;">' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + params[0].name + '</div><div style="display: flex; width: 100%;">'
                let hour = date.getHours() + ''
                if (hour.length === 1) hour = `0${hour}`
                let minute = date.getMinutes() + ''
                if (minute.length === 1) minute = `0${minute}`
                str += '<div style="font-family: MicrosoftYaHei-Bold; font-size: 14px; color: #1A2736; width: 100%; text-align: center;">' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + hour + ':' + minute + '</div><div style="width: 100%;">'
                for (let i = 0; i < num; i++) {
                  str += `<div style="margin-left: 10px;position: relative;">`
                  params.forEach((item, index) => {
                    if (index < (i + 1) * 6 && index >= i * 6) {
                      let seriesName = item.seriesName
                      let data = self.formataFuc ? self.formataFuc(item.data) : item.data
                      str += `<div style="margin-top: 10px;width: 100%;"><span style='background-color: ${item.color}; display: inline-block; width: 6px; height: 6px;margin-right: 3%;vertical-align: middle'></span><span style="margin-right: 90px; color: #5E6978;display: inline-block;">${seriesName}</span><span style="color: #1A2736; position: absolute; right: 10px;">${data}</span><br/></div>`
                    }
                  })
                  str += '</div>'
                }
                str += '</div></div>'
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
              containLabel: false,
              top: 10,
              bottom: 80,
              left: 100,
              right: 50
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
                interval: document.body.clientWidth <= 1280 ? 7 : 6,
                align: 'center',
                margin: 20,
                fontSize: 14
              },
              splitLine: {
                show: false
              }
              // splitNumber: 5
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
        getColor(index){
          return getColors(index)
        },
        init (data) {
          let self = this;
          if (data === 'nodata') {
            self.isLoad = true
            return
          }
          if (data && data.length > 0 && !this.isAllUndefiend(data)) {
            self.isLoad = true
            self.data = data
            //给图标y轴赋值
            let yAxisList = data.map(item => {
              if (_.has(item, 'formataFuc')) self.formataFuc = item.formataFuc//y轴图例格式化
              if (_.has(item, 'yAxis')) return item.yAxis.max//y轴最大值
            })
            let max = _.max(yAxisList)
            self.drawLineChart(self.chart, self.data, self.option, {min: 0, max: max}, self.formataFuc)
          } else {
            if(self.chart)
              self.chart.clear()
          }
        },
        isAllUndefiend: function (dataList) {
          if (dataList.length <= 0) return false
          return dataList.every((item) => _.isUndefined(item))
        },
        //x轴显示时间格式大于一个月：月-天， 小于一个月： 时：分
        getTimeLine: function (dataList) {
          let length = dataList[0].values.length
          let showday = dataList[0].values[length - 1][0] - dataList[0].values[0][0] > 60 * 60 * 24 * 1000 * 2
          let timeLine
          if (dataList.length > 0) {
            for (let i = 0; i < dataList.length; i++) {
              if (!_.isUndefined(dataList[i])) {
                timeLine = dataList[i].values.map(item => {
                  if (showday) {
                    let d = new Date(item[0])
                    let month = d.getMonth() + 1 + ''
                    if (month.length === 1) month = `0${month}`
                    let day = d.getDate() + ''
                    if (day.length === 1) day = `0${day}`
                    return `${month}-${day}`
                  } else {
                    let d = new Date(item[0])
                    let hour = d.getHours() + ''
                    if (hour.length === 1) hour = `0${hour}`
                    let minute = d.getMinutes() + ''
                    if (minute.length === 1) minute = `0${minute}`
                    return `${hour}:${minute}`
                  }
                })
                break
              }
            }
          }
          return timeLine
        },
        //画图方式
        drawLineChart: function (chart, dataList, option, yAxis, formatter) {
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
            if (!_.isUndefined(it)) {
              let newLine = _.cloneDeep(seriesLineBase)
              let index = it.index
              newLine.data = it.values.map(item => item[1])
              newLine.name = it.id
              newLine.lineStyle.normal.color = this.colorList[index % this.colorList.length].line
              newLine.areaStyle.normal.color.colorStops.push({
                offset: 0, color: this.colorList[index % this.colorList.length].start
              }, {
                offset: 1, color: this.colorList[index % this.colorList.length].end
              })
              newLine.itemStyle = {
                normal: {
                  color: this.colorList[index % this.colorList.length].line
                }
              }
              series.push(newLine)
            }
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
        resizeCharts: function () {
          if (this.chart) this.chart.resize()
          if (document.body.clientWidth < 1280) {
            this.option.xAxis.axisLabel.interval = 7
            this.init(this.param.data)
          } else if (document.body.clientWidth > 1280 && this.option.xAxis.axisLabel.interval === 7) {
            this.option.xAxis.axisLabel.interval = 6
            this.init(this.param.data)
          }
        },
      },
      watch: {
        'param.data':{
          handler: function (newValue, oldValue){
            let self = this
            if (_.isEqual(newValue, oldValue)) return;
            self.init(newValue)
          },
          'deep': true
        }
      },
      created: function () {
        window.addEventListener('resize', this.resizeCharts)
      },
      destroyed: function () {
        window.removeEventListener('resize', this.resizeCharts)
      },
      mounted: function () {
        let self = this;
        this.chart = echarts.init(this.$el.querySelector('.metric-chart'));
        this.init(this.param.data)
      }
    }
</script>

<style scoped>
  .metric-chart{
    height: 300px;
  }
</style>
