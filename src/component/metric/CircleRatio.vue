<template>
  <div class="cicle-content">
    <div class="title">{{ data.title ? $t(`home.${data.title}`) : '' }}</div>
    <div class="data-body">
      <div class="body-left">
        <div class="circle-chart"></div>
      </div>
      <div class="body-right" :class="{'isTwoColume': data.isTwoColume, 'is-not-Load': !isLoad}">
        <div class="item-top">
          <div class="item-left"></div>
          <div class="item-center">{{ $t("home.virtual") }}</div>
          <div class="item-right">{{ $t("home.physics") }}</div>
        </div>
        <div class="item">
          <div class="item-left">{{ $t("home.used") }}</div>
          <div class="item-center">{{ data.availableCapacity }}</div>
        </div>
         <div class="item" v-show="data.isOverProvision">
          <div class="item-left">{{ `实际${$t("home.total")}` }}</div>
          <div class="item-center">{{ data.totalPhysicalCapacity}}</div>
        </div>
        <div class="item" v-show="data.isOverProvision">
          <div class="item-left">{{ `超分${$t("home.total")}` }}</div>
          <div class="item-center">{{ data.totalCapacity }}</div>
        </div>
         <div class="item" v-show="!data.isOverProvision">
          <div class="item-left">{{ $t("home.total")}}</div>
          <div class="item-center">{{ data.totalCapacity }}</div>
        </div>
      </div>
    </div>
    <loding v-show="!isLoad" :color="'#00c1de'"></loding>
  </div>
</template>

<script>
import echarts from 'src/utils/echarts/echarts'
import _ from "lodash";
import Loading from "src/component/Loading";

export default {
  name: "CircleRatio",
  props: ["param"],
  components: {
    loding: Loading
  },
  created: function() {
    window.addEventListener("resize", this.resizeCharts);
  },
  destroyed: function() {
    window.removeEventListener("resize", this.resizeCharts);
  },
  data() {
    return {
      isLoad: false,
      capacityOption: {
        title: {
          x: "48%",
          y: "35s%",
          textAlign: "center",
          textStyle: {
            fontWeight: "normal",
            rich: {
              a: {
                fontSize: 26,
                verticalAlign: "bottom"
              },
              b: {
                fontSize: 14,
                verticalAlign: "bottom",
                height: 18
              }
            }
          }
        },
        series: [
          {
            name: " ",
            type: "pie",
            radius: ["89%", "95%"],
            startAngle: 270,
            color: [
              new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#EEF3F7"
                },
                {
                  offset: 1,
                  color: "#EEF3F7"
                }
              ]),
              "transparent"
            ],
            hoverAnimation: false,
            legendHoverLink: false,
            cursor: "default",
            itemStyle: {
              normal: {
                borderColor: "transparent",
                borderWidth: "20"
              },
              emphasis: {
                borderColor: "transparent",
                borderWidth: "20"
              }
            },
            z: 10,
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              {
                value: 0
              },
              {
                value: 360
              }
            ]
          },
          {
            name: "",
            type: "pie",
            radius: ["92%", "94%"],
            startAngle: 270,
            color: "#EEF3F7",
            hoverAnimation: false,
            legendHoverLink: false,
            cursor: "default",
            itemStyle: {
              normal: {
                borderColor: "#EEF3F7",
                borderWidth: "3"
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              {
                value: 360
              }
            ]
          }
        ]
      },
      capacityColorRed: {
        number: "#E8474F",
        circle: [
          new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#FF5F67"
            },
            {
              offset: 1,
              color: "#E8474F"
            }
          ]),
          "transparent"
        ]
      },
      capacityColorYellow: {
        number: "#FFB412",
        circle: [
          new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#FFCB0C"
            },
            {
              offset: 1,
              color: "#FFB412"
            }
          ]),
          "transparent"
        ]
      },
      capacityColorBlue: {
        number: "#007FDF",
        circle: [
          new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#1AA6FF"
            },
            {
              offset: 1,
              color: "#007FDF"
            }
          ]),
          "transparent"
        ]
      },
      data: {}
    };
  },
  mounted: function() {
    this.init(this.param.data);
  },
  methods: {
    init: function(data) {
      if (_.has(data, "title")) this.data.title = data.title;
      if (_.has(data, "ratio")) {
        this.data = data;
        this.isLoad = true;
        this.capacityChart = echarts.init(
          this.$el.querySelector(".circle-chart")
        );
        this.drawCapacityChart(
          this.capacityChart,
          "",
          this.data.ratio.toFixed(1)
        );
      }
    },
    resizeCharts: function() {
      if (this.capacityChart) {
        this.capacityChart.resize();
        this.drawCapacityChart(
          this.capacityChart,
          "",
          this.data.ratio.toFixed(1)
        );
      }
    },
    drawCapacityChart: function(chart, name, value) {
      let colorConfig = this.capacityColorBlue;
      if (isNaN(value)) value = 0;
      if (value >= 60 && value < 80) colorConfig = this.capacityColorYellow;
      if (value >= 80) colorConfig = this.capacityColorRed;
      let option = _.cloneDeep(this.capacityOption);
      option.series[0].color = colorConfig.circle;
      let value_ = value > 100 ? 360 : (360 * value) / 100;
      // option.title.text = value + '%'
      // console.log(`*****${(value - Math.floor(value)).toFixed(1)}`)
      option.title.text =
        value === parseInt(value)
          ? `{a|${value}}{b|.0%}`
          : `{a|${parseInt(value)}}{b|.${(value - Math.floor(value)).toFixed(
              1
            ) * 10}%}`;
      option.title.textStyle.color = colorConfig.number;
      option.title.subtext = name;
      option.series[0].data[0].value = value_;
      option.series[0].data[1].value = 360 - value_;
      chart.setOption(option, true);
    }
  },
  watch: {
    "param.data": function(newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return;
      this.init(newValue);
      this.$forceUpdate();
    }
  }
};
</script>

<style scoped lang="less">
.cicle-content {
  width: 100%;
  height: 100%;
  position: relative;
  transition: all 1s;
  &:hover {
    box-shadow: 0px 3px 4px #ccc;
  }
}

.cicle-content:hover {
  box-shadow: 1px 1px 1px #dae0e6, -1px -1px 1px #dae0e6;
}

.cicle-content .title {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #1a2736;
  letter-spacing: 0;
  padding: 20px 26px;
}

.cicle-content .data-body {
  width: 100%;
  display: flex;
  height: 100%;
}

.cicle-content .data-body .body-left {
  flex: 4 1 auto;
  width: 0;
}

.cicle-content .data-body .body-right {
  flex: 4 1 auto;
  width: 0;
  padding-top: 14px;
  padding: 0px 26px;
}

.cicle-content .data-body .item-left {
  flex: 1 1 auto;
  width: 0;
}

.cicle-content .data-body .item-center {
  flex: 2 1 auto;
  width: 0;
}

.cicle-content .data-body .item-right {
  flex: 2 1 auto;
  width: 0;
}

.cicle-content .data-body .item-top {
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #97a4b6;
  letter-spacing: 0;
  display: flex;
  text-align: right;
  border-bottom: 1px solid #eef3f7;
  line-height: 28px;
}

.cicle-content .data-body .item {
  width: 100%;
  display: flex;
  margin-top: 10px;
}

.cicle-content .data-body .item .item-left {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #5e6978;
  letter-spacing: 0;
  line-height: 20px;
}

.cicle-content .data-body .item .item-center,
.cicle-content .data-body .item .item-right {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #1a2736;
  letter-spacing: 0;
  text-align: right;
}

.circle-chart {
  width: 100%;
  height: calc(100% - 96px);
  padding: 0 10px 0 20px;
}

.isTwoColume .item-right {
  display: none;
}

.cicle-content .body-right.isTwoColume .item-top {
  display: none;
}

.cicle-content .body-right.isTwoColume {
  padding-top: 42px;
  padding-right: 20px;
}

.cicle-content .body-right.is-not-Load div {
  display: none;
}

@media (max-width: 1680px) {
  .cicle-content .data-body .item .item-center,
  .cicle-content .data-body .item .item-right,
  .cicle-content .data-body .item .item-left {
    font-size: 12px;
  }

  .cicle-content {
    padding-right: 10px;
  }

  .cicle-content .title {
    font-size: 16px;
  }
}
</style>

