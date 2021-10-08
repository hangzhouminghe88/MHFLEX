<template>
  <div class="histogram-container">
    <div class="title">
      <div class="title-left">{{data.metricList ? $t(`performance.title.${data.metricList[0].name}`) : ''}}<div class="header-icon"></div></div>
      <div class="title-right"  v-if="!param.data.single">
        <div class="select-item" :class="{'current-item': index === 0}" @click="changeItem(0)">{{ data.metricList ? $t(`performance.select.${data.metricList[0].name}`) : ''}}</div>
        <div class="select-item" :class="{'current-item': index === 1}" @click="changeItem(1)">{{ data.metricList ? $t(`performance.select.${data.metricList[1].name}`) : ''}}</div>
      </div>
    </div>
    <div class="description" :style="{'marginBottom': data.direction === 'vertical' ? '50px' : '0px'}" v-if="!param.data.single">
      <div class="description-item">
        <div class="description-line" :style="{background: colorList[0]}"></div>
        <div class="description-text">{{ data.metricList ? $t(`performance.item.${data.metricList[0].name}`) : ''}}</div>
      </div>
      <div class="description-item">
        <div class="description-line" :style="{background: colorList[1]}"></div>
        <div class="description-text">{{ data.metricList ? $t(`performance.item.${data.metricList[1].name}`) : ''}}</div>
      </div>
    </div>
    <div v-show="isLoad">
      <div class="chart-body" v-if="dataList.length > 0">
        <histogram-vertical class="histogram-vertical" v-if="data.direction === 'vertical'"
         :param="{
         data: {
          dataList: initData(dataList[index]),
          name: data.resourceName ? data.resourceName : '',
          index: index,
          fuc: data.fuc,
          metricNameList: param.data.single ? (data.metricList ? [data.metricList[0].name] : []): (data.metricList ? [data.metricList[0].name, data.metricList[1].name] : [])
         }
       }"></histogram-vertical>
        <histogram-across class="histogram-across " v-if="data.direction === 'across'"
        :param="{
        data: {
          dataList: initData(dataList[index]),
          name: data.resourceName ? data.resourceName : '',
          index: index,
          fuc: data.fuc,
          metricNameList: param.data.single ? (data.metricList ? [data.metricList[0].name] : []): (data.metricList ? [data.metricList[0].name, data.metricList[1].name] : [])
         }
        }"></histogram-across>
      </div>
      <div v-else class="no-data">
        <img src="~assets/nodata@2x.png" class="nodata-performance" style="width: 222px; height: 123px;" />
        <p class="nodata-text">{{$t("common.noData")}}</p>
      </div>
    </div>
    <div v-if="!isLoad"></div>
    <loading v-if="!isLoad" :color="'#00c1de'"></loading>
  </div>
</template>

<script>
  import HistogramVertical from "./HistogramVertical";
  import HistogramAcross from "./HistogramAcross";
  import Loading from "../../../component/Loading";
  export default {
    name: "Histogram",
    components: {Loading, HistogramAcross, HistogramVertical},
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
        index: 0,
        colorList: ['#5BB8FF', '#ACCBFF'],
        data: {},
        dataList: [],
        isLoad: false
      }
    },
    created(){
      let self = this;
      if(self.param.data){
        self.data = self.param.data;
        self.init()
      }
      self.init()
    },
    methods: {
      init () {
        let self = this;
        let data = self.data;
        self.dataList = data.metircData && data.metircData.dataList
        self.isLoad = data.metircData && data.metircData.isLoad
      },
      changeItem (num) {
        if (this.index === num) return
        else this.index = num
      },
      initData (dataList) {
        if (!dataList) return []
        let valueList = []
        dataList.forEach((item) => {
          if (!item.isnull) valueList.push(item)
          else valueList.push({uuid: '', value: '', valueA: ''})
        })
        return valueList
      }
    },
    watch:{
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
    .title{
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .title-left{
        font-size: 20px;
      }
      .title-right{
        display: flex;
        border: 1px solid #39f;
        border-radius: 2px;
        cursor: pointer;
        .select-item{
          border-radius: 2px;
          display: inline-block;
          text-align: center;
          font-size: 12px;
          padding: 5px 10px;
          width: 50%;
          transition: cubic-bezier(0.5, 0.3, 0.3, 0.5) .5s, all ease-out 0.5s;
          &:hover{
            color:#fff;
            background: #39f;
            transition: cubic-bezier(0.5, 0.5, 1, 0.5) .5s, all ease-in 0.5s;
            opacity: 0.8;
            box-shadow: 0px 3px 4px #39f;
          }
        }
        .current-item{
          color:#fff;
          background: #39f;
          transition: cubic-bezier(0.5, 0.3, 0.3, 0.5) .5s, all ease-in 0.5s;
        }
      }
    }
    .description{
      margin: 20px 0 50px;
      font-family: PingFangSC-Regular;
      font-size: 12px;
      color: #5e6978;
      letter-spacing: 0;
      display: -ms-flexbox;
      display: flex;
      width: 30%;
      .description-item{
        flex: 1;
        .description-line{
          width: 20px;
          height: 5px;
          border-radius: 1px;
          display: inline-block;
          margin-right: 10px;
        }
        .description-text{
          font-size: 12px;
          display: inline-block;
        }
      }
    }
    .chart-body{
      width: 100%;
      display: flex;
      position: relative;
      .histogram-vertical{
        height: 200px;
        position: relative;
        width: 100%;
      }
      .histogram-across{
        width: 100%;
        position: relative;
      }
    }
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
