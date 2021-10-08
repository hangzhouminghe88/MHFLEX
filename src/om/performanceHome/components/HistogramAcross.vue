<template>
  <div style="height: 100px; position: relative;">
    <div class="metric-chart"></div>
    <transition name="fade">
      <div class="tooltip" :style="{top: top + 'px', left: left + 'px'}" v-show="showTooltip">
        <p class="tooltip-text" v-for="item in nameValue">{{item}}</p>
      </div>
    </transition>
    <!-- <loding v-show="!isLoad" style="position: relative; top: -140px;"></loding> -->
  </div>
</template>

<script>
  import _ from 'lodash'
  import echarts from 'src/utils/echarts/echarts'
  import Methods from '../Methods'
  import Root from 'src/windows/Root'

  export default {
    name: 'HistogramAcross',
    props: ['param'],
    mixins: [Methods, Root],
    components: {},
    created: function () {
      // this.init(this.param.data)
      window.addEventListener('resize', this.resizeCharts)
    },
    destroyed: function () {
      window.removeEventListener('resize', this.resizeCharts)
    },
    mounted: function () {
      let self = this
      this.chart = echarts.init(this.$el.querySelector('.metric-chart'))
      this.chart.on('mouseover', (params) => {
        if (params.componentType === 'yAxis') {
          let str = []
          if (self.nicNameMap) {
            let index = params.value
            try {
              str.push(`${self.$t('common.nicName')}: ${self.nicNameMap[index].nicName}`)
              let uuid = self.nicNameMap[index].uuid
              let name = self.name
              if (name === 'vm') name = self.dbData[name][uuid].resourceType === 'VirtualRouterVmVO' ? 'vrouter' : 'vm'
              str.push(`${self.$t(`performance.${name}`)}: ${self.dbData[self.name][uuid].name}`)
            } catch (e) {
              str[0] = ''
              self.showTooltip = false
              return
            }
          } else str.push(params.value)
          self.nameValue = str
          self.top = parseInt(params.event.offsetY) + 5
          self.left = parseInt(params.event.offsetX) + 5
          self.showTooltip = true
        }
      })
      this.chart.on('mouseout', (params) => {
        if (params.componentType === 'yAxis') {
          self.showTooltip = false
        }
      })
      this.init(this.param.data)
    },
    data() {
      let self = this
      return {
        nameValue: [],
        left: 0,
        top: 0,
        showTooltip: false,
        isLoad: false,
        title: '',
        isDouble: false,
        index: 0,
        currentValue: '',
        name: null,
        labelOption: {
          show: true,
          position: 'right',
          color: '#1A2736',
          distance: 10
        },
        itemStyle: {},
        colorList: ['#5BB8FF', '#ACCBFF'],
        data: {
          dataList: [{
            values: []
          }],
          name: ''
        },
        option: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
              shadowStyle: {
                color: 'rgba(203,237,255, 0.3)'
              }
            },
            position: function (pt, params, dom, rect, size) {
              let left = pt[0] + 10
              let top = pt[1] + 10
              if (dom.clientHeight + pt[1] + 60 > size.viewSize[1]) top = pt[1] - dom.clientHeight - 10
              if (dom.clientWidth + pt[0] + 60 > size.viewSize[0]) left = pt[0] - dom.clientWidth - 10
              if (dom.clientWidth - pt[0] > 60) left = pt[0] + 10
              return [left, top]
            },
            formatter: function (params, ticket) {
              if (!params[0].axisValue) return null
              let str
              if (self.nicNameMap) {
                let index = params[0].dataIndex
                try {
                  str = `${self.$t('common.nicName')}: ${self.nicNameMap[index].nicName}<br/>`
                  let uuid = self.nicNameMap[index].uuid
                  let name = self.name
                  if (name === 'vm') name = self.dbData[name][uuid].resourceType === 'VirtualRouterVmVO' ? 'vrouter' : 'vm'
                  str += `${self.$t(`performance.${name}`)}: ${self.dbData[self.name][uuid].name}`
                } catch (e) {
                  return null
                }
              } else str = params[0].axisValue + '<br/>'
              params.forEach((item) => {
                let seriesName = self.$t(`performance.${item.seriesName}`)
                let data = self.fuc ? self.fuc(item.data.value) : item.data.value
                str += `<div style="margin-top: 10px;"><span style='background-color: ${item.color}; display: inline-block; width: 6px; height: 6px; border-radius: 3px;margin-right: 2%;'></span><span style="color: #5E6978;display: inline-block;">${seriesName}:</span><span style="#1A2736"> ${data}</span><br style="clear: both;"/></div>`
              })
              return str
            },
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: '#EEF3F7',
            borderWidth: 1,
            extraCssText: 'z-index: 100;box-shadow: 0 2px 4px 0 rgba(217,225,233,0.40);border-radius: 2px;padding: 10px;',
            textStyle: {
              color: '#5E6978',
              fontFamily: 'PingFangSC-Regula',
              fontSize: '12'
            }
          },
          grid: {
            containLabel: false,
            top: 10,
            bottom: 0,
            left: 100,
            right: 95
          },
          yAxis: {
            type: 'category',
            inverse: true,
            axisTick: {show: false},
            triggerEvent: true,
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: '#EEF3F7'
              }
            },
            axisPointer: {
              show: true,
              type: 'shadow',
              triggerTooltip: true,
              shadowStyle: {
                color: 'rgba(203,237,255, 0.3)'
              }
            },
            axisLabel: {
              formatter: function (value) {
                let str = ''
                if (!self.nicNameMap) {
                  try {
                    str = self.dbData[self.name][value].name
                    return `{a|${self.resizeValue(str)}}`
                  } catch (e) {
                    return '{a| }\n{a| }'
                  }
                } else {
                  try {
                    str = self.dbData[self.name][self.nicNameMap[value].uuid].name
                    str = self.resizeValue(str)
                    let nicName = self.resizeValue(self.nicNameMap[value].nicName, 10)
                    return `{a|${nicName}}\n{b|${str}}`
                  } catch (e) {
                    return '{a| }\n{a| }'
                  }
                }
              },
              show: true,
              color: '#5E6978',
              fontSize: 12,
              margin: 9,
              align: 'right',
              rich: {
                a: {
                  color: '#5E6978',
                  fontSize: 14,
                  margin: 9,
                  align: 'right',
                  lineHeight: 20
                },
                b: {
                  color: '#97A4B6',
                  fontSize: 12,
                  margin: 9,
                  align: 'right',
                  lineHeight: 20
                }
              }
            },
            data: []
          },
          xAxis: {
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
            }
          },
          series: []
        },
        defaultLineSeries: {
          name: '',
          type: 'bar',
          barGap: 1,
          barWidth: 10,
          barMinHeight: 30,
          label: {
            show: false,
            position: 'right',
            color: '#1A2736',
            distance: 10
          },
          itemStyle: {
            color: '#EEF3F7'
          },
          data: [0]
        }
      }
    },
    methods: {
      init(data) {
        let yAxis = {min: 0, max: 4}
        if (_.has(data, 'dataList') && data.dataList.length > 0) {
          this.isLoad = true
          this.data = data.dataList
          this.name = data.name
          this.metricNameList = data.metricNameList
          this.index = data.index
          this.fuc = data.fuc
          this.getMap(this.data)
          let valuesList = data.dataList.map((item) => item.value).concat(data.dataList.map((item) => item.valueA))
          let maxValue = _.max(valuesList)
          if (maxValue > 4) yAxis = {min: 0, max: this.getMAxValue(maxValue)}
          this.drawLineChart(this.chart, this.data, this.option, this.name, yAxis, this.fuc)
        }
      },
      getMap: function (dataList) {
        if (_.has(dataList[0], 'nicName')) {
          let obj = []
          dataList.forEach((item) => {
            if (item.uuid !== '') obj.push({uuid: item.uuid, nicName: item.nicName})
          })
          this.nicNameMap = obj
        }
      },
      drawLineChart: function (chart, dataList, option, name, yAxis, formatter) {
        let self = this
        let series = []
        let seriesLineBase = {
          name: '',
          type: 'bar',
          barGap: 1,
          barWidth: 10,
          barMinHeight: 4,
          label: self.labelOption,
          itemStyle: self.itemStyle
        }
        let nameList = dataList.map((item, index) => self.nicNameMap ? index : item.uuid)
        if (formatter) seriesLineBase.label.formatter = (value) => formatter(value.data.value)
        let newLine = _.cloneDeep(seriesLineBase)
        newLine.data = dataList.map(item => {
          return {
            value: item.value,
            itemStyle: {
              color: item.value === 0 ? '#EEF3F7' : self.colorList[self.index]
            }
          }
        })
        newLine.name = self.metricNameList[self.index]

        let newLineA = _.cloneDeep(seriesLineBase)
        // newLineA.data = dataList.map(item => item.valueA)
        newLineA.data = dataList.map(item => {
          return {
            value: item.valueA,
            itemStyle: {
              color: item.valueA === 0 ? '#EEF3F7' : self.colorList[self.colorList.length - self.index - 1]
            }
          }
        })
        // newLineA.itemStyle.color = self.colorList[self.colorList.length - self.index - 1]
        newLineA.name = self.metricNameList[self.colorList.length - self.index - 1]
        if (self.index === 0) series = [newLine, newLineA]
        else series = [newLineA, newLine]
        if (chart) {
          let _option = _.cloneDeep(option)
          if (yAxis) {
            _option.xAxis.min = yAxis.min
            _option.xAxis.max = yAxis.max
            _option.xAxis.interval = yAxis.max / 4
          }
          _option.yAxis.data = nameList
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
      }
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue.dataList, oldValue.dataList)) return
        if (!_.isEqual(newValue.index, oldValue.index)) this.chart.clear()
        this.init(newValue)
      }
    }
  }
</script>

<style scoped>
  .body-title {
    margin-bottom: 30px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    color: #5E6978;
  }

  .line-chart-header {
    width: calc(100% - 30px);
    padding: 26px 0 0;
    margin-bottom: 10px;
    top: -4px;
    position: relative;
  }

  .line-chart-header .title {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #5E6978;
    letter-spacing: 0;
    margin-top: 10px;
  }

  .line-chart-header .current-value {
    font-family: PingFangSC-Regular;
    font-size: 26px;
    color: #007FDF;
    letter-spacing: 0;
  }

  .metric-chart {
    height: 280px;
    width: 100%;
    /*  left: -2px;
      margin-left: 30px;*/
  }

  .tooltip {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.98);
    border: 1px solid #EEF3F7;
    z-index: 100;
    box-shadow: 0 2px 4px 0 rgba(217, 225, 233, 0.40);
    border-radius: 2px;
    padding: 10px;
    color: #5E6978;
    font-family: PingFangSC-Regula;
    font-size: 12px;
    transition: left 0.2s;
    transition: top 0.2s;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
