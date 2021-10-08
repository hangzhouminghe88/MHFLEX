<template>
  <div class="cicle-content">
    <div class="title">
      {{ data.title ? $t(`home.${data.title}`) : '' }}
      <div class="select-item" v-show="param.data.length === 2">
        <el-tabs @tab-click="changeItem" v-model="index">
          <el-tab-pane
            v-permission="getPermission(param.data[0])"
            name="0"
            :label="param.data[0] ? param.data[0].indexName : ''"
          ></el-tab-pane>
          <el-tab-pane
            v-permission="getPermission(param.data[1])"
            name="1"
            :label=" param.data[1] ? param.data[1].indexName : ''"
          ></el-tab-pane>
        </el-tabs>
        <!--<span :class="{'current-item': index === 0}" v-permission="getPermission(param.data[0])" @click="changeItem(0)">{{ param.data[0] ? param.data[0].indexName : ''}}</span>-->
        <!--<span :class="{'current-item': index === 1}" v-permission="getPermission(param.data[1])" @click="changeItem(1)">{{ param.data[1] ? param.data[1].indexName : ''}}</span>-->
      </div>
    </div>
    <div class="data-body">
      <div class="body-left">
        <div class="circle-chart"></div>
      </div>
      <div class="body-right" :class="{'isTwoColume': data.isTwoColume, 'is-not-Load': !isLoad}">
        <div class="item-middle item">
          <div class="item-left">{{ $t("home.used") }}</div>
          <div class="item-center">{{ data.availableCapacity }}</div>
          <div class="item-right">{{ data.availablePhysicalCapacity }}</div>
        </div>
        <div class="item">
          <div class="item-left">{{ $t("home.total") }}</div>
          <div class="item-center">{{ data.totalCapacity }}</div>
          <div class="item-right">{{ data.totalPhysicalCapacity }}</div>
        </div>
      </div>
    </div>
    <loding v-show="!isLoad" :color="'#00c1de'"></loding>
  </div>
</template>

<script>
import echarts from 'src/utils/echarts/echarts'
import _ from "lodash";
import Loding from "src/component/Loading";
import Root from "src/windows/Root";

export default {
  name: "CircleRatio",
  mixins: [Root],
  props: ["param"],
  components: {
    loding: Loding
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
      index: "0",
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
            radius: ["87%", "95%"],
            startAngle: 270,
            // color: [new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            //   offset: 0,
            //   color: '#EEF3F7'
            // }, {
            //   offset: 1,
            //   color: '#EEF3F7'
            // }]), 'transparent'],
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
            radius: ["88%", "94%"],
            startAngle: 270,
            // color: ['#EEF3F7', '#EEF3F7'],
            hoverAnimation: false,
            legendHoverLink: false,
            cursor: "default",
            itemStyle: {
              normal: {
                color: "#EEF3F7",
                borderColor: "transparent",
                borderWidth: "2"
              },
              emphasis: {
                color: "#EEF3F7",
                borderColor: "transparent",
                borderWidth: "2"
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
    changeItem(e) {
      this.initData(e.index);
    },
    initData(num) {
      this.data = this.param.data[num];
      this.capacityChart = echarts.init(
        this.$el.querySelector(".circle-chart")
      );
      this.drawCapacityChart(
        this.capacityChart,
        "",
        this.data.ratio.toFixed(1)
      );
    },
    init: function(data) {
      data = data[this.index];
      if (_.has(data, "title")) this.data.title = data.title;
      if (_.has(data, "ratio")) {
        this.initData(this.index);
        this.isLoad = true;
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
    getPermission: function(data) {
      if (_.get(data, ["permission"])) return data.permission;
    },
    drawCapacityChart: function(chart, name, value) {
      let colorConfig = this.capacityColorBlue;
      if (isNaN(value)) value = 0;
      if (value >= 60 && value < 80) colorConfig = this.capacityColorYellow;
      if (value >= 80) colorConfig = this.capacityColorRed;
      if (value < 0) colorConfig = this.capacityColorRed;
      let option = _.cloneDeep(this.capacityOption);
      option.series[0].color = colorConfig.circle;
      let value_ = value > 100 || value < 0 ? 360 : (360 * value) / 100;
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
  transition: all 1s;
  position: relative;
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
  padding-right: 26px;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 26px;
}

.cicle-content .data-body {
  width: 100%;
  display: flex;
  height: 100%;
}

.cicle-content .data-body .body-left {
  flex: 3 1 auto;
  width: 0;
  margin-right: 10%;
}

.cicle-content .data-body .body-right {
  flex: 4 1 auto;
  width: 0;
  padding-top: 14px;
}

.cicle-content .data-body .item-left {
  flex: 1 1 auto;
  width: 0;
  text-align: left;
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
  font-size: 14px;
  color: #5e6978;
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
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #5e6978;
  letter-spacing: 0;
  line-height: 20px;
}

.cicle-content .isTwoColume .item-left {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #5e6978;
  letter-spacing: 0;
  line-height: 20px;
}

.cicle-content .item .item-center,
.cicle-content .item .item-right {
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #5e6978;
  letter-spacing: 0;
  line-height: 20px;
  text-align: right;
}

.cicle-content .isTwoColume .item .item-center,
.cicle-content .isTwoColume .item .item-right {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #1a2736;
  letter-spacing: 0;
  line-height: 20px;
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
  padding-top: 20px;
  padding-right: 26px;
}

.cicle-content .body-right.is-not-Load div {
  display: none;
}

.isTwoColume .item-middle {
  border-bottom: 1px solid #eef3f7;
  padding-bottom: 10px;
}

.select-item {
  display: flex;
  float: right;
  height: 30px;
  border-radius: 2px;
}

.title .select-item span {
  flex: 1;
  text-align: center;
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #5e6978;
  letter-spacing: 0;
  line-height: 30px;
  cursor: pointer;
  padding: 0 7px;
}

.title .select-item span.current-item {
  color: #007fdf;
  background: #d2eeff;
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
