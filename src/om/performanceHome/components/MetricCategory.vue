<template>
  <div class="category">
    <div class="title">{{data.metricList ? $t(`performance.title.${data.metricList[0].name}`) : ''}}
      <div class="header-icon"></div>
    </div>
    <div v-show="isLoad">
      <div v-if="dataList.length > 0" class="flex-body">
        <div v-for=" (item, index) in dataList" class="flex-item" :style="{'margin-left': index === 0 ? 0 : '30px'}">
          <div v-if="item.isnull"></div>
          <category-template v-else :param="{data: {dataList: item, fuc: formatter, name: getResourceNames(data.resourceName, item.uuid), title: $t(`performance.title.${data.metricList[0].name}`)}}"/>
        </div>
      </div>
      <div v-else class="no-data">
        <img src="~assets/nodata@2x.png" class="nodata-performance" style="width: 222px; height: 123px;"/>
        <p class="nodata-text">{{$t("common.noData")}}</p>
      </div>
    </div>
    <loading v-show="!isLoad" :color="'#00c1de'"></loading>
  </div>
</template>

<script>
  import CategoryTemplate from "./CategoryTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils'
  import Methods from '../Methods';
  import Loading from "../../../component/Loading";
  export default {
    name: "MetricCategory",
    mixins: [WindowBase, Methods],
    components: {Loading, CategoryTemplate},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      },
    },
    created: function () {
      if (this.param.data) {
        this.data = this.param.data
        this.unit = this.data.metricList[0].unit
        this.formatter = this.formateValue(this.unit)
        this.init()
      }
      this.init()
      // if (_.isNull(this.queryInterval)) {
      //   this.queryInterval = setInterval(this.init, consts.refreshInterval)
      // }
    },
    destroyed: function () {
      // clearInterval(this.queryInterval)
    },
    data () {
      return {
        time: 300,
        dataList: [],
        isLoad: false,
        queryInterval: null,
        formatter: null,
        data:{}
      }
    },
    methods: {
      ...Utils,
      init () {
        let data = this.data
        this.dataList = data.metircData.dataList
        this.isLoad = data.metircData.isLoad
      }
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue.metircData, oldValue.metircData)) return
        this.data = this.param.data
        this.init()
        this.$forceUpdate()
      },
      'param.data.time.value': function (newValue, oldValue) {
        // if (_.isEqual(newValue, oldValue)) return
        // this.data = this.param.data
        // this.init()
        // this.$forceUpdate()
      }
    }
  }
</script>

<style scoped lang="less">
  .header-icon {
    display: inline-block;
    width: 40px;
    height: 15px;
    margin-left: 5px;
    background-image: url('~assets/top5-performence.svg');
    background-repeat: no-repeat;
    background-size: 100%;
  }

  .title {
    font-size: 20px;
    padding-top: 20px;
  }
  .flex-body{
    width: 100%;
    display: flex;
    .flex-item{
      flex: 1;
      width: 100%;
    }
  }
  .category{
    width: 100%;
    padding: 0 30px;
    height: 100%;
    position: relative;
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
