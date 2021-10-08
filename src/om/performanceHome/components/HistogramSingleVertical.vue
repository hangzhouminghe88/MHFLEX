<template>
  <div>
    <div class="metric-body"></div>
    <div class="tool-tips"></div>
  </div>
</template>

<script>
  import echarts from 'src/utils/echarts/echarts'
  import Methods from '../Methods';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "HistogramSingleVertical",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    mounted() {
      let self = this;
      self.chart = echarts.init(self.$el.querySelector('.metric-body'));
      self.chart.on('mouseover', (params) => {
        if (params.componentType === 'xAxis') {
          let str = []
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
          self.nameValue = str
          self.nameValue = [params.value]
          self.top = parseInt(params.event.offsetY) + 10
          self.left = parseInt(params.event.offsetX) + 5
          self.showTooltip = true
        }
      })
      self.chart.on('mouseout', (params) => {
        if (params.componentType === 'xAxis') {
          self.showTooltip = false
        }
      })
      self.init(self.param.data)
    },
    data(){
      let self = this;
      return {
        labelOption: {
          color: '#5E6978'
        },
        colorList: ['#5BB8FF', '#ACCBFF'],
        option: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
              shadowStyle: {
                color: 'rgba(203,237,255, 0.3)'
              }
            },
            formatter: function (params, ticket) {
              if (!params[0].axisValue) return null
              let str = params[0].axisValue + '<br/>'
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
            left: 10,
            right: 0
          },
          xAxis: {
            type: 'category',
            triggerEvent: true,
            axisTick: {show: false},
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              color: '#5E6978',
              fontSize: 14,
              formatter: function (value) {
                value = self.resizeValue(value)
                return `{a|${value}}`
              },
              rich: {
                a: {
                  color: '#5E6978',
                  fontSize: 14,
                  margin: 15
                }
              }
            },
            data: []
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              color: '#97A4B6',
              fontSize: 14,
              margin: 30
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#EEF3F7',
                type: 'dotted'
              }
            }
          },
          series: []
        }
      }
    },
    methods: {
      ...{
        getMAxValue: Methods.methods.getMAxValue,
      },
      init (data) {
        let yAxis = {min: 0, max: 4}
        if (_.has(data, 'dataList') && data.dataList.length > 0) {
          this.isLoad = true
          this.data = data.dataList
          this.name = data.name
          this.metricNameList = data.metricNameList
          this.index = data.index
          this.fuc = data.fuc
          let valuesList = data.dataList.map((item) => item.value).concat(data.dataList.map((item) => item.valueA))
          let maxValue = _.max(valuesList)
          if (maxValue > 4) yAxis = { min: 0, max: this.getMAxValue(maxValue) }
          this.drawLineChart(this.chart, this.data, this.option, this.name, yAxis, this.fuc)
        }
      },
      drawLineChart(chart, dataList, option, name, yAxis, formatter){
        let self = this;
        let series = [];
        let seriesLineBase = {
          name: '',
          type: 'bar',
          barGap: 2,
          label:  this.labelOption,
          barWidth: 10,
        }
        if(formatter) seriesLineBase.label.formatter = (value) => {
          formatter(value.data.value);
        }
        let nameList = dataList.map(item => {
          let value  = '';
          try {
            value = self.dbData[name][item.uuid].name;
          }catch (e) {
            value = '';
          }
          return value;
        })
        let newLine = _.cloneDeep(seriesLineBase);
        newLine.data = dataList.map(item => {
          return {
            value: item.value,
            itemStyle: {
              color: item.value === 0 ? '#EEF3F7' : self.colorList[self.index]
            }
          }
        })
        newLine.name = this.metricNameList[this.index]

        let newLineA = _.cloneDeep(seriesLineBase)
        newLineA.data = dataList.map(item => {
          return {
            value: item.valueA,
            itemStyle: {
              color: item.valueA === 0 ? '#EEF3F7' : self.colorList[self.colorList.length - self.index - 1]
            }
          }
        })
        newLineA.name = this.metricNameList[this.colorList.length - this.index - 1]
        if (this.index === 0) series = [newLine, newLineA]
        else series = [newLineA, newLine];
        if (chart) {
          let _option = _.cloneDeep(option)
          if (yAxis) {
            _option.yAxis.min = yAxis.min
            _option.yAxis.max = yAxis.max
            _option.yAxis.interval = yAxis.max / 4
          }
          if (formatter) _option.yAxis.axisLabel.formatter = formatter
          _option.xAxis.data = nameList
          _option.series = series
          chart.setOption(_option, true)
        }
      },
      resizeValue: function (value) {
        let str = value.toString()
        let length = 12
        if (document.body.clientWidth < 1820) length = 10
        if (document.body.clientWidth < 1460) length = 8
        if (document.body.clientWidth < 1290) length = 6
        if (document.body.clientWidth < 1200) length = 4
        let _str = str.replace(/[\u0391-\uFFE5]/g, 'aa')
        let _length = str === _str ? str.length : _str.length
        if (!length) length = 12
        if (_length > length) {
          if (str === _str) str = str.slice(0, length - 2)
          else {
            str = str.slice(0, length - 2)
            _str = str.replace(/[\u0391-\uFFE5]/g, 'aa')
            while (_str.length > length) {
              str = str.slice(0, str.length - 1)
              _str = str.replace(/[\u0391-\uFFE5]/g, 'aa')
            }
          }
          return str + '...'
        } else return str
      }
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        let self = this;
        if (_.isEqual(newValue.dataList, oldValue.dataList)) return
        if (!_.isEqual(newValue.index, oldValue.index)) self.chart.clear()
        self.init(newValue)
      }
    }
  }
</script>

<style scoped>
  .metric-body{
    width: 100%;
    height: 100%;
  }
</style>
