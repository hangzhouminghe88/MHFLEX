<template>
  <div class="line-container">
    <div class="line-header">
      <div class="title"> {{ data.metricList ? $t(`performance.title.${data.metricList[0].name}`) : '' }}</div>
      <div class="header-icon"></div>
    </div>
    <div class="line-body">
      <div v-if="isLoad">
        <div class="list-body" v-if="dataList.length > 0">
          <div v-for="(item, index) in dataList[0]">
            <div class="list-body-content" :style="_styles">
              <div class="title">{{ item.isnull ? '' : getResourceNames(data.resourceName, item.uuid) }}</div>
              <div class="ratio-line">
                <div class="total">
                  <div class="enabled progress-image" :style="getEnabledStyle(item, index)"></div>
                </div>
                <div class="value-text">{{percentFormatter(item.value)}}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          <img src="~assets/nodata@2x.png" class="nodata-performance" style="width: 222px; height: 123px;"/>
          <p class="nodata-text">{{$t("common.noData")}}</p>
        </div>
      </div>
      <loading v-if="!isLoad" :color="'#00c1de'"></loading>
    </div>
  </div>
</template>

<script>
  import Methods from '../Methods';
  import WindowBase from 'src/windows/Window';
  import Loading from "../../../component/Loading";

  export default {
    name: "LineList",
    components: {Loading},
    props: ['param'],
    mixins: [Methods, WindowBase],
    data() {
      return {
        dataList: [],
        isLoad: false
      }
    },
    created() {
      if (this.param.data) {
        this.data = this.param.data
        this.opposite = this.param.data.opposite
        this.init()
      }
      this.init()
    },
    methods: {
      _styles(item, index) {
        return {
          'padding-top': index > 0 ? (item.isnull ? '30px' : '5px') : '30px',
          'position': 'relative',
          'padding-bottom': '10px'
        }
      },
      init() {
        let self = this;
        let data = self.data
        this.dataList = data.metircData.dataList
        this.isLoad = data.metircData.isLoad
      },
      getColors(value) {
        let self = this;
        if (this.opposite) return self.getColorOpposite(value)
        else return self.getColor(value)
      },
      percentFormatter(value) {
        if (_.isNumber(value)) return value.toFixed(2) + '%'
        else return value
      },
      getEnabledStyle(item, index) {
        return {
          'width': item.isnull ? '0%' : item.value + '%',
          'background-color': this.getColors(item.value),
          'transition': 'width .6s ease',
        }
      },
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue.metircData, oldValue.metircData)) return
        this.data = this.param.data
        this.init()
        this.$forceUpdate()
      },
    }
  }
</script>

<style scoped lang="less">
  .line-container {
    background: #fff;
    padding: 30px 25px;
    flex: 2px;
    margin-right: 20px;
    position: relative;
  }

  .list-body-content {
    position: relative;
    padding-bottom: 10px;
  }

  .ratio-line {
    width: 100%;
    display: flex;

    .total {
      width: 100%;
      height: 6px;
      background: #eef3f7;
      border-radius: 100px;
      margin: 10px 0 0;
      overflow: hidden;
      font-size: 0;
      -ms-flex: 9;
      flex: 9;

      .enabled {
        border-radius: 100px;
        transition: width .5s ease-in .1s;
        height: 100%;
      }

      .progress-image{
        background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
        -webkit-background-size: 40px 40px;
        background-size: 40px 40px;
        animation: reverse progress-bar-stripes 0.40s linear infinite, animate-positive 2s;
      }
    }

    .value-text {
      flex: 1;
      text-align: right;
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #1a2736;
      letter-spacing: 0;
      line-height: 20px;
    }
  }
  .title{
    display: inline-block;
    font-size: 20px;
  }

  .header-icon{
    display: inline-block;
    width: 40px;
    height: 15px;
    margin-left: 5px;
    background-image: url('~assets/top5-performence.svg');
    background-repeat: no-repeat;
    background-size: 100%;
  }
  @-webkit-keyframes animate-positive{
    0% { width: 0; }
  }
  @keyframes animate-positive{
    0% { width: 0; }
  }
  @keyframes progress-bar-stripes{
    from{background-position:40px 0}
    to{background-position:0 0}
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
