<template>
  <div class="histogram-container">
    <div class="title">
      <div class="title-left">{{data.metricList ? $t(`performance.title.${data.metricList[0].name}`) : ''}}
        <div class="header-icon"></div>
      </div>
    </div>
    <div v-show="isLoad">
      <div class="chart-body" v-if="dataList.length > 0">
        <histogram-single-vertical class="histogram-vertical" v-if="data.direction === 'vertical'"
                                   :param="{data: {
          dataList: initData(dataList[index]),
          name: data.resourceName ? data.resourceName : '',
          index: index,
          fuc: data.fuc,
          metricNameList: data.metricList ? [data.metricList[0].name] : []
        }}"></histogram-single-vertical>
        <histogram-single-across class="histogram-across " v-if="data.direction === 'across'"
                                 :param="{data: {
          dataList: initData(dataList[index]),
          name: data.resourceName ? data.resourceName : '',
          index: index,
          fuc: data.fuc,
          metricNameList: data.metricList ? [data.metricList[0].name] : []
        }}"></histogram-single-across>
      </div>
      <div v-else class="no-data">
        <img src="~assets/nodata@2x.png" class="nodata-performance" style="width: 222px; height: 123px;"/>
        <p class="nodata-text">{{$t("common.noData")}}</p>
      </div>
    </div>
    <div v-if="!isLoad"></div>
    <loading v-if="!isLoad" :color="'#00c1de'"></loading>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Root from 'src/windows/Root'
  import HistogramSingleVertical from "./HistogramSingleVertical";
  import HistogramSingleAcross from "./HistogramSingleAcross";
  import Loading from "../../../component/Loading";

  export default {
    name: "HistogramSingle",
    mixins: [Root],
    components: {Loading, HistogramSingleAcross, HistogramSingleVertical},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    destroyed: function () {
      window.removeEventListener('resize', this.resizeCharts)
    },
    data() {
      return {
        index: 0,
        colorList: ['#5BB8FF', '#ACCBFF'],
        data: {},
        dataList: [],
        isLoad: false
      }
    },
    created() {
      let self = this;
      if (self.param.data) {
        self.data = self.param.data;
        self.init()
      }
      self.init()
    },
    methods: {
      init() {
        let self = this;
        let data = self.data;
        self.dataList = data.metircData && data.metircData.dataList
        self.isLoad = data.metircData && data.metircData.isLoad
      },
      changeItem(num) {
        if (this.index === num) return
        else this.index = num
      },
      initData(dataList) {
        if (!dataList) return []
        let valueList = []
        dataList.forEach((item) => {
          if (!item.isnull) valueList.push(item)
          else valueList.push({uuid: '', value: '', valueA: ''})
        })
        return valueList
      }
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        let self = this;
        if (_.isEqual(newValue.metircData, oldValue.metircData)) return
        self.data = this.param.data
        self.init()
        self.$forceUpdate()
      },
    }
  }
</script>

<style scoped lang="less">
  .histogram-container {
    background: #fff;
    padding: 30px 26px;
    flex: 3px;
    position: relative;

    .title {
      display: flex;
      justify-content: space-between;

      .title-left {
        flex: 10;
        font-size: 20px;
      }

      .title-right {
        display: flex;
        border: 1px solid #39f;
        border-radius: 2px;
        cursor: pointer;

        .select-item {
          border-radius: 2px;
          display: inline-block;
          text-align: center;
          font-size: 12px;
          padding: 5px 10px;
          width: 50%;

          &:hover {
            color: #fff;
            background: #39f;
          }
        }

        .current-item {
          color: #fff;
          background: #39f;
        }
      }
    }

    .description {
      margin: 20px 0 50px;
      font-family: PingFangSC-Regular;
      font-size: 12px;
      color: #5e6978;
      letter-spacing: 0;
      display: -ms-flexbox;
      display: flex;
      width: 30%;

      .description-item {
        flex: 1;

        .description-line {
          width: 20px;
          height: 5px;
          border-radius: 1px;
          display: inline-block;
          margin-right: 10px;
        }

        .description-text {
          font-size: 12px;
          display: inline-block;
        }
      }
    }

    .chart-body {
      width: 100%;
      display: flex;

      .histogram-vertical {
        height: 200px;
        position: relative;
        width: 100%;
      }

      .histogram-across {
        width: 100%;
        position: relative;
      }
    }
  }

  .header-icon {
    display: inline-block;
    width: 40px;
    height: 15px;
    margin-left: 5px;
    background-image: url('~assets/top5-performence.svg');
    background-repeat: no-repeat;
    background-size: 100%;
  }
  .no-data{
    width: 222px;
    margin: 0 auto;
    position: relative;
  }
  .nodata-text{
    width: 100%;
    text-align: center;
    padding-top: 10px;
  }
</style>
