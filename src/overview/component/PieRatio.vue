<template>
  <div class="metric-container">
    <div class="metric-main"></div>
    <ul v-if="chartData.type && ['publicIpVersion', 'privateIpVersion'].includes(chartData.type)" @click="toggleIpSelect" class="ip-container">
      <li>{{ipVersion}}</li>
      <i class="arrow-down"></i>
      <li class="ip-select" :class="{'show': showIpSelect}">
        <span class="select-item" @click="changeIpType('IPv4', $event)">IPv4</span>
        <span class="select-item"  @click="changeIpType('IPv6', $event)">IPv6</span>
      </li>
    </ul>
  </div>
</template>

<script>
  import echarts from 'src/utils/echarts/echarts'
  import _ from 'lodash'

  export default {
    name: "PieRatio",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        showIpSelect: false,
        ipVersion: 'IPv4',
        capacityOption: {
          title: {
            x: '48%',
            y: '40%',
            textAlign: 'center',
            textStyle: {
              fontWeight: 'lighter',
              fontSize: 28,
              lienHeight: 48,
              verticalAlign: 'top',
              rich: {
                a: {
                  fontSize: 28,
                  verticalAlign: 'bottom'
                },
                b: {
                  fontSize: 14,
                  verticalAlign: 'bottom',
                  height: 18
                }
              }
            },
            subtextStyle: {
              fontWeight: 'lighter',
              fontSize: 16,
              color: '#fff',
              lienHeight: 46,
              verticalAlign: 'bottom',
              rich: {
                a: {
                  fontSize: localStorage.getItem('language') === 'en' ? 14 : 16,
                  width: 50
                }
              }
            }
          },
          series: [{
            name: ' ',
            type: 'pie',
            radius: ['90%', '100%'],
            startAngle: 220,
            color: [new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#00a2ff'
            }, {
              offset: 1,
              color: '#70ffac'
            }]), 'transparent'],
            hoverAnimation: false,
            legendHoverLink: false,
            itemStyle: {
              normal: {
                borderColor: 'transparent',
                borderWidth: '20'
              },
              emphasis: {
                borderColor: 'transparent',
                borderWidth: '20'
              }
            },
            z: 10,
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [{
              value: 260
            }, {
              value: 100
            }]
          }, {
            name: '',
            type: 'pie',
            radius: ['90%', '100%'],
            startAngle: 220,
            // color: ['#013EA3', 'transparent'],
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [{
              value: 260,
              itemStyle: {
                normal: {
                  color: '#eef3f7',
                  borderColor: 'transparent',
                  borderWidth: '2'
                },
                emphasis: {
                  color: '#ffffff',
                  borderColor: 'transparent',
                  borderWidth: '2'
                }
              }
            }, {
              value: 100,
              itemStyle: {
                normal: {
                  color: 'transparent',
                  borderColor: 'transparent',
                  borderWidth: '2'
                },
                emphasis: {
                  color: 'transparent',
                  borderColor: 'transparent',
                  borderWidth: '2'
                }
              }
            }]
          }]
        },
        capacityColorRed: {
          number: '#FF4646',
          circle: [new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#FF4646'
          }, {
            offset: 1,
            color: '#DF1919'
          }]),
            'transparent'
          ]
        },
        capacityColorYellow: {
          number: '#FFD824',
          circle: [new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#FFD824'
          }, {
            offset: 1,
            color: '#FF8C05'
          }]),
            'transparent'
          ]
        },
        capacityColorBlue: {
          number: '#2CDAFF',
          circle: [new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#00D2FF'
          }, {
            offset: 1,
            color: '#007AFF'
          }]),
            'transparent'
          ]
        },
        chart: null,
        chartData: null
      }
    },
    created(){
      let self = this;
      self.chartData = self.param.pieMetricData;
    },
    mounted(){
      let self = this;
      self.chart = echarts.init(self.$el.querySelector('.metric-main'));
      self.drawCapacityChart(self.chart,  self.chartData.name,  self.chartData.dataList);
      window.addEventListener('click', self.onWindowClick, true);
      window.addEventListener('resize', self.resizeChart, true)
    },
    destroyed(){
      let self = this;
      window.removeEventListener('click', self.onWindowClick, true);
      window.removeEventListener('resize', self.resizeChart, true)
    },
    methods: {
      resizeChart(){
        let self = this;
        self.chart.resize();
      },
      onWindowClick(){
        let self = this;
        self.showIpSelect = false;
      },
      drawCapacityChart: function (chart, name, value) {
        let colorConfig = this.capacityColorBlue
        if (value >= 60 && value < 80) colorConfig = this.capacityColorYellow
        if (value >= 80) colorConfig = this.capacityColorRed
        let option = _.cloneDeep(this.capacityOption)
        option.series[0].color = colorConfig.circle
        let value_ = value > 100 ? 260 : 260 * value / 100
        if (value - Math.floor(value) === 0) option.title.text = `{a|${value}}{b|.00%}`
        else {
          value = value.toFixed(2)
          let text = (value - Math.floor(value))
          text = (text.toFixed(2) + '').split('.')[1]
          option.title.text = `{a|${Math.floor(value)}}{b|.${text}%}`
        }
        option.title.textStyle.color = colorConfig.number
        option.title.subtext = `{a|${name}}`
        option.series[0].data[0].value = value_
        option.series[0].data[1].value = 360 - value_
        chart.setOption(option, true)
      },
      toggleIpSelect(){
        let self = this;
        self.showIpSelect = !self.showIpList;
      },
      changeIpType(ipVersion,$event){
        let self = this;
        self.ipVersion = ipVersion
        self.param.pieMetricData.changeIPVersion(ipVersion, self.chartData.type, $event);
        self.showIpSelect = false;
      }
    },
    watch: {
      param(newVal, oldVal){
        let self = this;
        if(_.isEqual(newVal, oldVal)) return;
        self.chartData = newVal.pieMetricData;
        self.drawCapacityChart(self.chart,  self.chartData.name,  self.chartData.dataList);
      }
    }
  }
</script>

<style scoped>
  .metric-main{
    height: 155px;
    width: 100%
  }
  .metric-container{
    width: 49%;
    display: inline-block;
  }

  .ip-select{
    display: none;
    position: absolute;
  }

  .show{
    display: inline-block;
    width: 100%;
    left: 0px;
    position: absolute;
    margin-left: -2px;
    background: #0d1984;
    padding-top: 5px;
    padding-bottom: 5px;
    border: 1px solid #0059d8;
    /* opacity: 1; */
    z-index: 9999;
    box-shadow: inset 0 0 19px 0 #0058c5;
  }

  .ip-container{
    display: inline-block;
    text-align: center;
    position: relative;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
    top: -20px;;
    cursor: pointer;
    font-size: 12px;
    color: #409EFF;
  }

  .select-item{
    display: inline-block;
    left: 0px;
    padding: 10px 0px;
    width: 100%;
  }
  i.arrow-down {
    background-image: url(~assets/overview_arrow_down.svg);
    height: 12px;
    width: 16px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    vertical-align: middle;
    right: 10%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
</style>
