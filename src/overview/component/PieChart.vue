<template>
  <div class="right-bottom-item">
    <div class="pie-chart-content"></div>
    <div class="right-bottom-item-right">
      <div class="right-bottom-item-name-container">
        <div class="right-bottom-item-name">
          {{$t(`${param.title}`)}}
        </div>
      </div>
        <div class="right-bottom-item-right" v-if="param.type==='vm'">
          <div class="right-bottom-item-row">
            <div class="right-bottom-item-legend">
              <div class="right-bottom-item-legend-all"></div>
            </div>
            <div class="right-bottom-item-content-container">
              <div class="right-bottom-item-content">
                {{$t("overview.total")}}:
                <span>{{ overview.total }}</span>
              </div>
            </div>
          </div>
          <div class="right-bottom-item-row">
            <div class="right-bottom-item-legend">
              <div class="right-bottom-item-legend-r0"></div>
            </div>
            <div class="right-bottom-item-content-container">
              <div class="right-bottom-item-content">
                {{$t("overview.running")}}:
                <span>{{ overview.running }}</span>
              </div>
            </div>
          </div>
          <div class="right-bottom-item-row">
            <div class="right-bottom-item-legend">
              <div class="right-bottom-item-legend-r1"></div>
            </div>
            <div class="right-bottom-item-content-container">
              <div class="right-bottom-item-content">
                {{$t("overview.stopped")}}:
                <span>{{ overview.stopped }}</span>
              </div>
            </div>
          </div>
          <div class="right-bottom-item-row">
            <div class="right-bottom-item-legend">
              <div class="right-bottom-item-legend-r2"></div>
            </div>
            <div class="right-bottom-item-content-container">
              <div class="right-bottom-item-content">
                {{$t("overview.other")}}:
                <span>{{ overview.other }}</span>
              </div>
            </div>
          </div>
      </div>
      <div v-else class="right-bottom-item-right">
        <div class="right-bottom-item-row">
          <div class="right-bottom-item-legend">
            <div class="right-bottom-item-legend-all"></div>
          </div>
          <div class="right-bottom-item-content-container">
            <div class="right-bottom-item-content">
              {{$t("overview.total")}}:
              <span>{{ overview.total }}</span>
            </div>
          </div>
        </div>
        <div class="right-bottom-item-row">
          <div class="right-bottom-item-legend">
            <div class="right-bottom-item-legend-r0"></div>
          </div>
          <div class="right-bottom-item-content-container">
            <div class="right-bottom-item-content">
              {{$t("overview.enabled")}}:
              <span>{{ overview.enabled }}</span>
            </div>
          </div>
        </div>
        <div class="right-bottom-item-row">
          <div class="right-bottom-item-legend">
            <div class="right-bottom-item-legend-r1"></div>
          </div>
          <div class="right-bottom-item-content-container">
            <div class="right-bottom-item-content">
              {{$t("overview.disabled")}}:
              <span>{{ overview.disabled }}</span>
            </div>
          </div>
        </div>
        <div class="right-bottom-item-row">
          <div class="right-bottom-item-legend">
            <div class="right-bottom-item-legend-r2"></div>
          </div>
          <div class="right-bottom-item-content-container">
            <div class="right-bottom-item-content">
              {{$t("overview.other")}}:
              <span>{{ overview.other }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import echarts from 'src/utils/echarts/echarts'
  import _ from 'lodash'

  export default {
    name: "PieChart",
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
        emptyOption: {
          series: [
            {
              type: 'pie',
              color: ['#013EA3'],
              radius: ['25%', '100%'],
              center: ['50%', '50%'],
              data: [{value: 360}],
              roseType: 'radius',
              hoverAnimation: false,
              labelLine: {
                show: false
              }
            },
            {
              type: 'pie',
              color: ['#0098FF'],
              radius: ['12%', '17%'],
              center: ['50%', '50%'],
              data: [{value: 360}],
              roseType: 'radius',
              hoverAnimation: false,
              labelLine: {
                show: false
              }
            }
          ]
        },
        pieOption: {
          series: [
            {
              type: 'pie',
              color: ['#2CDAFF', '#2D7DE2', '#F3A800'],
              radius: ['25%', '90%'],
              center: ['50%', '50%'],
              roseType: 'radius',
              stillShowZeroSum: true,
              hoverAnimation: false,
              emphasis: {
                label: {
                  show: false
                }
              },
              label: {
                normal: {
                  show: false
                },
                emphasis: {
                  show: false
                }
              },
              lableLine: {
                normal: {
                  show: false
                },
                emphasis: {
                  show: false
                }
              },
              data: []
            },
            {
              type: 'pie',
              color: ['#0098FF'],
              radius: ['12%', '17%'],
              center: ['50%', '50%'],
              data: [{value: 360}],
              roseType: 'radius',
              hoverAnimation: false,
              labelLine: {
                show: false
              }
            },
            {
              type: 'pie',
              color: ['#0098FF'],
              radius: ['99%', '100%'],
              center: ['50%', '50%'],
              data: [{value: 360}],
              roseType: 'radius',
              hoverAnimation: false,
              labelLine: {
                show: false
              }
            }
          ]
        },
        chart: null,
        overview: {},
      }
    },
    mounted(){
      let self = this;
      self.overview = self.param.overview;
      self.chart = echarts.init(self.$el.querySelector('.pie-chart-content'));
      self.drawPieChart(self.chart, self.param.overview);
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
      drawPieChart(chart, overview) {
        let option, self = this;
        if(self.param.type && self.param.type === 'vm'){
          if (overview.total === 0) {
            option = _.cloneDeep(this.emptyOption)
          } else {
            option = _.cloneDeep(this.pieOption)
            option.series[0].name = '云主机'
            option.series[0].data = [{
              name: '开机',
              value: overview.running
            }, {
              name: '关机',
              value: overview.stopped
            }, {
              name: '其它',
              value: overview.other
            }]
          }
        }else{
          if(overview.total === 0) {
            option = _.cloneDeep(this.emptyOption)
          } else {
            option = _.cloneDeep(this.pieOption)
            option.series[0].name = '物理机'
            option.series[0].data = [{
              name: '启用',
              value: overview.enabled
            }, {
              name: '停用',
              value: overview.disabled
            }, {
              name: '其它',
              value: overview.other
            }]
          }
        }
        chart.setOption(option, true)
      },
    },
    watch: {
      param(newVal, oldVal){
        let self = this;
        self.overview = newVal.overview;
        self.drawPieChart(self.chart, self.overview);
      }
    }
  }
</script>

<style scoped>
   .pie-chart-content{
     height: 280px;
   }
  .right-bottom-item{
    flex: 1;
    display: flex;
  }
  .pie-chart-content{
    flex: 1;
  }
  .right-bottom-item-right{
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    float: right;
    flex: 2;
    height: 280px;
    padding: 12px 0 60px 5%;
  }

   .right-bottom-item-name-container {
     position: relative;
     color: #2CDAFF;
     font-size: 20px;
     height: 25%;
     font-family: 'PingFangSC-Regular'
   }

   .right-bottom-item-name {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     font-size: 20px;
   }

   .right-bottom-item-row {
     display: flex;
     flex: 1;
   }

   .right-bottom-item-legend {
     position: relative;
     width: 30px;
   }

   .right-bottom-item-legend-all {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     width: 20px;
     height: 8px;
     border: 2px solid #0096FB;
   }

   .right-bottom-item-legend-r0 {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     width: 20px;
     height: 8px;
     background-color: #2CDAFF;
   }

   .right-bottom-item-legend-r1 {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     width: 20px;
     height: 8px;
     background-color: #2D7DE2;
   }

   .right-bottom-item-legend-r2 {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     width: 20px;
     height: 8px;
     background-color: #F3A800;
   }

   .right-bottom-item-content-container {
     flex: 1;
     position: relative;
   }

   .right-bottom-item-content {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     width: 100%;
     color: #97BEFF;
     font-size: 16px;
   }

   .right-bottom-item-content span {
     color: #fff;
     margin-left: 10px;
   }

   .right-center-right-header {
     position: relative;
     top: -15px;
     left: 20px;
     color: #2CDAFF;
   }
  .right-bottom-item-row{
    padding: 10px 0px;
  }
</style>
